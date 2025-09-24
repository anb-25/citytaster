// FILE: scripts/print-ec2.cjs
// Purpose: Print the dev EC2 public DNS/IP created by the Docker Compose stack.
// How it works: reads env (default "dev"), builds the Name tag "citytaster-<env>-app",
// calls AWS CLI (no extra deps) and prints instance details.
// Usage:
//   CTX_ENV=dev node scripts/print-ec2.cjs
//   # or simply: node scripts/print-ec2.cjs

const { execSync } = require("node:child_process");

const env = process.env.CTX_ENV || "dev";
const nameTag = `citytaster-${env}-app`;

function sh(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "inherit"] }).toString();
}

const jq =
  "'.Reservations[].Instances[] | {id: .InstanceId, dns: .PublicDnsName, ip: .PublicIpAddress, state: .State.Name}'";

try {
  // Filter by tag:Name = citytaster-<env>-app and running/pending states
  const raw = sh(
    `aws ec2 describe-instances ` +
      `--filters "Name=tag:Name,Values=${nameTag}" ` +
      `"Name=instance-state-name,Values=running,pending" ` +
      `--no-cli-pager --output json`
  );

  const data = JSON.parse(raw);
  const instances = (data.Reservations || [])
    .flatMap((r) => r.Instances || [])
    .map((i) => ({
      id: i.InstanceId,
      dns: i.PublicDnsName,
      ip: i.PublicIpAddress,
      state: i.State?.Name,
    }));

  if (!instances.length) {
    console.error(
      `No running/pending instances found with tag:Name=${nameTag}. ` +
        `Did you deploy dev? (cdktf deploy citytaster-${env})`
    );
    process.exit(1);
  }

  console.log(`\nInstances for tag:Name=${nameTag}`);
  instances.forEach((i) =>
    console.log(
      ` - ${i.id}  state=${i.state}  dns=${i.dns || "-"}  ip=${i.ip || "-"}`
    )
  );
  console.log(
    "\nOpen http://<dns> in your browser. (nginx reverse-proxy serves / and /api)"
  );
} catch (e) {
  console.error("\nFailed to query EC2. Ensure AWS CLI is configured.");
  process.exit(1);
}
