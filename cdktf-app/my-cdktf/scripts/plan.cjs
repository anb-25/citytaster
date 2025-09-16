// FILE: scripts/plan.cjs   (CommonJS script; works with your package.json)
// Purpose: Save a real Terraform plan file (plan.tfplan) after synth.
// Why:     `cdktf diff` previews changes but doesn’t save a plan for later review.

const { execSync } = require("node:child_process");
const fs = require("node:fs");

const env = process.env.CTX_ENV || "dev";     // set CTX_ENV=dev|prod before running
const stack = `citytaster-${env}`;            // must match the id in main.ts
const chdir = `cdktf.out/stacks/${stack}`;    // synth output folder

function sh(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

// 1) synth to refresh Terraform JSON
sh(`npx cdktf synth --context env=${env}`);

// 2) terraform init/plan in the synthesized folder
if (!fs.existsSync(chdir)) throw new Error(`Missing ${chdir} — did synth succeed?`);

sh(`terraform -chdir=${chdir} init -upgrade`);
sh(`terraform -chdir=${chdir} validate`);
sh(`terraform -chdir=${chdir} plan -out plan.tfplan`);

console.log(`\n✅ Plan saved: ${chdir}/plan.tfplan`);
console.log(`   Show later: terraform -chdir=${chdir} show plan.tfplan`);

