// FILE: scripts/validate-dev.cjs
// Purpose: Validate <env>.json against live AWS before deploying.
// Usage:
//   node scripts/validate-dev.cjs
//   CTX_ENV=dev node scripts/validate-dev.cjs

const { readFileSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { execSync } = require("node:child_process");

const ENV = process.env.CTX_ENV || "dev";

// project root = one level up from /scripts
const ROOT = resolve(__dirname, "..");

// src/config/<env>.json (works no matter where you run the script from)
const CFG_PATH = join(ROOT, "src", "config", `${ENV}.json`);

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString();
  } catch (e) {
    const msg = e.stdout?.toString() || e.stderr?.toString() || e.message;
    throw new Error(msg);
  }
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function main() {
  // 1) Load config
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(CFG_PATH, "utf8"));
  } catch (e) {
    fail(`Cannot read config file at ${CFG_PATH}: ${e.message}`);
  }

  const {
    region,
    vpcId,
    publicSubnetIds = [],
    privateSubnetIds = [],
    sgDefaultId,
    sgEc2Id,
    sgVpcId,
  } = cfg;

  if (!region) fail("Missing 'region' in config.");
  if (!vpcId) fail("Missing 'vpcId' in config.");
  if (!Array.isArray(publicSubnetIds) || publicSubnetIds.length === 0)
    fail("Missing or empty 'publicSubnetIds' in config.");
  // Allow empty private list in default VPC; just ensure it's an array.
  if (!Array.isArray(privateSubnetIds))
    fail("'privateSubnetIds' must be an array (can be empty in default VPC).");
  if (!sgDefaultId || !sgEc2Id || !sgVpcId)
    fail("Missing one of 'sgDefaultId', 'sgEc2Id', or 'sgVpcId' in config.");

  console.log(`\n🔎 Validating ${ENV}.json against AWS region ${region} ...\n`);

  // 2) VPC exists
  const vpcRaw = sh(
    `aws ec2 describe-vpcs --vpc-ids ${vpcId} --region ${region} --no-cli-pager --output json`
  );
  const vpcs = JSON.parse(vpcRaw).Vpcs || [];
  if (!vpcs.length) fail(`VPC not found: ${vpcId}`);
  ok(`VPC exists: ${vpcId}`);

  // 3) Subnets exist (and belong to that VPC)
  const allSubnets = [...publicSubnetIds, ...privateSubnetIds];
  const snRaw = sh(
    `aws ec2 describe-subnets --subnet-ids ${allSubnets.join(
      " "
    )} --region ${region} --no-cli-pager --output json`
  );
  const subnets = JSON.parse(snRaw).Subnets || [];
  const byId = new Map(subnets.map((s) => [s.SubnetId, s]));

  const missingSn = allSubnets.filter((id) => !byId.has(id));
  if (missingSn.length) fail(`Missing Subnets: ${missingSn.join(", ")}`);

  const wrongVpc = allSubnets.filter((id) => byId.get(id)?.VpcId !== vpcId);
  if (wrongVpc.length)
    fail(
      `These subnets do not belong to VPC ${vpcId}: ${wrongVpc.join(", ")}`
    );

  ok(`All subnets exist and are in VPC ${vpcId} (${allSubnets.length})`);

  // 4) Security Groups exist
  const sgIds = [sgDefaultId, sgEc2Id, sgVpcId];
  const sgRaw = sh(
    `aws ec2 describe-security-groups --group-ids ${sgIds.join(
      " "
    )} --region ${region} --no-cli-pager --output json`
  );
  const gotSg = new Set(
    (JSON.parse(sgRaw).SecurityGroups || []).map((g) => g.GroupId)
  );
  const missingSg = sgIds.filter((id) => !gotSg.has(id));
  if (missingSg.length) fail(`Missing Security Groups: ${missingSg.join(", ")}`);
  ok(`All security groups exist (${sgIds.length})`);

  // 5) Friendly note about OIDC role secret (optional)
  console.log(
    "\nℹ️  Tip: If deploying from GitHub Actions, set repo secret DEPLOY_ROLE_ARN to your OIDC deploy role ARN."
  );

  console.log("\n🎉 Validation PASSED.\n");
}

try {
  main();
} catch (e) {
  fail(e.message || String(e));
}
