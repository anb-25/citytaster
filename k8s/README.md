# CityTaster — Kubernetes Guide (Beginner‑Friendly)

This README explains **what each Kubernetes (K8s) component is**, **why it exists**, and **how we use it in this project**. If you’re new to K8s, read top to bottom once, then use it as a reference.

> We deploy with **Kustomize** using two environments: **dev** (local with kind) and **prod** (cluster). The shared bits live in `k8s/kustomize/base`, environment‑specific changes live in `k8s/kustomize/overlays/{dev,prod}`.

---

## TL;DR — What lives where

* **Backend API**: Flask app listening on **port 5000** (Deployment + Service).
* **Frontend**: Nginx serving static assets on **port 80** (Deployment + Service).
* **Config**: Plain env vars via **ConfigMap**.
* **(Optional)**: Ingress routes HTTP traffic from the outside to the **frontend**.
* **Prod‑only**: **HPA** (auto‑scale backend) and **PDB** (avoid all pods going down).

```
Client → (Ingress) → Service(frontend) → Pod(frontend)
                              ↳ Service(backend) → Pod(backend)
```

---

## Core Kubernetes Concepts (with CityTaster context)

### 1) Pod

**What:** Smallest deployable unit; wraps one or more containers running together.
**Why:** Containers in a pod share network & volumes.
**In this project:** Each **frontend** pod runs one Nginx container. Each **backend** pod runs one Flask container. K8s creates pods for us via Deployments.

### 2) Deployment

**What:** A controller that manages **ReplicaSets** and **Pods**. You declare the desired state (e.g., 2 replicas), K8s keeps it.
**Why:** Rolling updates, rollbacks, and ensuring the right number of pods.
**In this project:**

* `backend-deploy.yaml` runs the API on port **5000**.
* `frontend-deploy.yaml` runs Nginx on port **80**.
* **Probes** (liveness/readiness) help K8s know when a pod is healthy and ready.

### 3) ReplicaSet (behind the scenes)

**What:** Ensures a fixed number of pod replicas exist.
**Why:** If a pod dies, the ReplicaSet creates a new one.
**In this project:** You won’t edit ReplicaSets directly; Deployments own them.

### 4) Service

**What:** Stable virtual IP + DNS name for a set of pods (selected by labels).
**Why:** Pods get replaced; Services stay constant so clients can connect reliably.
**Types:**

* **ClusterIP** (default): internal‑only.
* **NodePort/LoadBalancer**: reachable from outside the cluster.
  **In this project:**
* `backend` Service (ClusterIP) exposes port **5000** inside the cluster.
* `frontend` Service (ClusterIP) exposes port **80** inside the cluster.
* Locally, we use `kubectl port-forward` to reach the frontend without Ingress.

### 5) Ingress (optional in dev, common in prod)

**What:** HTTP(S) routing layer that sends external traffic to Services by **host** or **path**.
**Why:** One entry point (e.g., `app.example.com`) for many Services.
**In this project:**

* Dev: `ingress.yaml` (host: `citytaster.local`) **if** you install an Ingress controller (e.g., `ingress-nginx`) in kind.
* Prod: `ingress.yaml` uses your real domain (TLS recommended with cert‑manager).

### 6) Namespace

**What:** A logical partition in the cluster.
**Why:** Organizes resources, avoids name collisions, scopes permissions.
**In this project:**

* **Dev**: `citytaster-dev`
* **Prod**: `citytaster`

### 7) ConfigMap (plain config)

**What:** Key/value configuration **without** secrets.
**Why:** Keep config outside images; change without rebuilding.
**In this project:** `citytaster-config` holds `LOG_LEVEL` and similar values, injected via `envFrom`.

### 8) Secret (sensitive config)

**What:** For tokens/passwords/keys.
**Why:** Keep credentials separate from code and images.
**In this project:** `secret-*.yaml` shows placeholders. In real prod, consider a secrets manager.

### 9) Probes (readiness & liveness)

**What:** Health checks K8s uses per pod.

* **Readiness**: start sending traffic only when the container is ready.
* **Liveness**: restart container if it becomes unhealthy.
  **In this project:**
* Backend: uses **TCP** probe on **5000** (works even without `/healthz`).
* Frontend: HTTP GET `/` on **80\`**.

### 10) Resource Requests & Limits

**What:** Minimum (requests) and maximum (limits) CPU/memory per container.
**Why:** Helps the scheduler place pods and prevents resource starvation.
**In this project:** Both frontend and backend define conservative requests/limits you can tune later using metrics.

### 11) Horizontal Pod Autoscaler (HPA) — prod only

**What:** Scales the number of pods based on metrics (e.g., CPU usage).
**Why:** Auto‑handle traffic spikes.
**In this project:** Prod overlay adds an HPA for the backend (min 3, max 6, target 70% CPU). Requires **metrics‑server**.

### 12) PodDisruptionBudget (PDB) — prod only

**What:** Limits **voluntary** disruptions (like node drains) so not all pods go down at once.
**Why:** Keeps some capacity online during maintenance.
**In this project:** Prod overlay ensures at least 1 backend pod remains available during voluntary disruptions.

### 13) Labels & Selectors

**What:** Arbitrary key/value tags on resources; selectors match labels.
**Why:** Glue for Services → Pods, HPAs → Deployments, etc.
**In this project:** We label pods with `app.kubernetes.io/component: backend|frontend` and Services select on the same.

### 14) Kustomize (base & overlays)

**What:** A config tool built into `kubectl` for environment‑aware YAML composition.
**Why:** Avoid copy‑pasting YAML across environments; use patches and image overrides instead.
**In this project:**

* `base/` contains shared Deployments, Services, ConfigMap.
* `overlays/dev` sets namespace, images (`:dev`), replicas, and an optional dev Ingress.
* `overlays/prod` sets namespace, registry images, higher replicas, HPA, PDB, and prod Ingress.

---

## Traffic Flow (How requests move)

**Dev (kind):**

1. You `kubectl port-forward svc/frontend 8080:80`.
2. Browser → `http://localhost:8080` → **frontend Service** → **frontend pods**.
3. Frontend calls the API via `http://backend:5000` inside the cluster.

**Prod:**

1. Internet → **Ingress** (`app.citytaster.example.com`).
2. Ingress routes to **frontend Service**.
3. Frontend talks to **backend Service** internally.
4. (Optional) You can split `/api` path at the Ingress level to hit the backend Service directly.

---

## Working With Environments

### Dev on kind

```bash
# Build images locally (example tags)
docker build -f Dockerfile.backend   -t citytaster-backend:dev .
docker build -f Dockerfile.frontend  -t citytaster-frontend:dev .

# Make images available to kind cluster
kind load docker-image citytaster-backend:dev --name citytaster
kind load docker-image citytaster-frontend:dev --name citytaster

# Apply dev overlay
kubectl apply -k k8s/kustomize/overlays/dev

# Access app without Ingress
kubectl -n citytaster-dev port-forward svc/frontend 8080:80
# → open http://localhost:8080
```

### Prod on a cluster

```bash
# Push images to your registry and set correct names/tags in overlays/prod
kubectl apply -k k8s/kustomize/overlays/prod
```

> In prod, consider enabling TLS via **cert‑manager** and the Metrics Server for the HPA.

---

## Common Commands (handy cheatsheet)

```bash
# List core resources (dev namespace)
kubectl -n citytaster-dev get deploy,rs,pods,svc,ingress

# Watch rollout status
kubectl -n citytaster-dev rollout status deploy/backend

# Inspect a pod (events are often at the bottom)
kubectl -n citytaster-dev describe pod <pod-name>

# Logs (add -f to follow)
kubectl -n citytaster-dev logs deploy/backend

# Port-forward if not using Ingress
kubectl -n citytaster-dev port-forward svc/frontend 8080:80
```

---

## Troubleshooting Tips

* **Image not found**: For dev with kind, you must `kind load docker-image ...` **and** set the same tag in `images:` in the dev overlay.
* **CrashLoopBackOff**: Check logs → container might fail at startup; also check liveness probe thresholds.
* **Readiness never true**: HTTP/TCP probe may be pointing to the wrong port/path; verify container actually listens there.
* **Ingress 404**: Ensure an Ingress **controller** is installed (e.g., `ingress-nginx`) and DNS/hosts entry points to it.
* **HPA not scaling**: Install **metrics‑server**; confirm the HPA is targeting the correct Deployment name.

---

## What to Customize Next

* **Ingress paths**: Add `/api` path to route directly to backend Service if you don’t want the frontend to proxy.
* **TLS**: Use **cert‑manager** for Let’s Encrypt certificates in prod.
* **Secrets**: Wire real secrets (DB URLs, API keys) and mount via `envFrom.secretRef`.
* **Resources**: Adjust requests/limits after observing runtime metrics.
* **Autoscaling**: Tune HPA thresholds based on load testing.

---

## Glossary (one‑liners)

* **Pod**: One or more containers running together.
* **Deployment**: Manages desired number of pods and updates.
* **Service**: Stable internal address for a group of pods.
* **Ingress**: HTTP(S) routing into the cluster.
* **Namespace**: Logical grouping of resources.
* **ConfigMap**: Non‑secret key/value config.
* **Secret**: Sensitive key/value config.
* **Probe**: Health checks (readiness/liveness) for containers.
* **HPA**: Auto‑scales pods based on metrics.
* **PDB**: Guarantees some pods stay up during maintenance.
* **Kustomize**: Composes YAML for different environments.

---

## File Map (quick reference)

* `k8s/kustomize/base/*.yaml` — shared Deployments, Services, ConfigMap.
* `k8s/kustomize/overlays/dev/*` — dev namespace, images (`:dev`), optional dev Ingress, small replicas.
* `k8s/kustomize/overlays/prod/*` — prod namespace, registry images, HPA, PDB, higher replicas, prod Ingress.

Happy shipping! 🚢

