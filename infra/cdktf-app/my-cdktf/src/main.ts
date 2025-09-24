// FILE: main.ts  (project root)
// Purpose: CDKTF entrypoint.
// What:    Choose env (dev/prod), load JSON config, resolve the local Terraform module path,
//          inject the sensitive deploy key from ENV, create the stack, synthesize to Terraform JSON.
// Why:     Centralizes env selection + file I/O so your stack class can focus on wiring infra.

/**
 * Purpose: Only create the stack for the requested env.
 * How it avoids running prod: we read `--context env=<env>` (from plan.cjs or CLI)
 * and instantiate *one* stack: citytaster-<env>. No stack => nothing to deploy/synth.
 *
 * Run dev only:
 *   npx cdktf synth --context env=dev
 *   npx cdktf deploy citytaster-dev
 *
 * (If you ever pass env=prod, only then the prod stack is created.)
 */
import { App } from "cdktf";
import { readFileSync } from "fs";
import { join } from "path";
import { DevStack } from "./stacks/infra"; // <- only import dev statically

type EnvName = "dev" | "prod";

function loadCfg(env: EnvName) {
  const file = join(__dirname, "config", `${env}.json`);
  return JSON.parse(readFileSync(file, "utf8"));
}

const app = new App();
const env = ((app.node.tryGetContext("env") as string) || "dev") as EnvName;
const cfg = loadCfg(env);

if (env === "dev") {
  new DevStack(app, `${cfg.project}-${cfg.env}`, cfg);
} else if (env === "prod") {
  // Lazy load so TS never looks at prod.ts in dev runs
  const { ProdStack } = require("./stacks/prod");
  new ProdStack(app, `${cfg.project}-${cfg.env}`, cfg);
}

app.synth();
