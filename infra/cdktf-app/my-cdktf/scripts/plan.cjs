// FILE: scripts/plan.cjs   (CommonJS script; works with your package.json)
// Purpose: Save a real Terraform plan file (plan.tfplan) after synth.
// Why:     `cdktf diff` previews changes but doesn’t save a plan for later review.

const { execSync } = require("node:child_process");
const fs = require("node:fs");

const env   = process.env.CTX_ENV ?? "dev";
const stack = `citytaster-${env}`;               // must match id in main.ts
const chdir = `cdktf.out/stacks/${stack}`;

function sh(cmd, options = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env, ...options });
}

sh(`npx cdktf synth --context env=${env}`);

if (!fs.existsSync(chdir)) throw new Error(`Missing ${chdir} — did synth succeed?`);

sh(`terraform -chdir="${chdir}" init -upgrade -input=false -no-color`);
sh(`terraform -chdir="${chdir}" validate -no-color`);
sh(`terraform -chdir="${chdir}" plan -input=false -out plan.tfplan -no-color`);

console.log(`\n✅ Plan saved: ${chdir}/plan.tfplan`);
console.log(`   Show later: terraform -chdir="${chdir}" show plan.tfplan`);

