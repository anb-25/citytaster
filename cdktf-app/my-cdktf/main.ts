// FILE: main.ts  (project root)
// Purpose: CDKTF entrypoint.
// What:    Choose env (dev/prod), load JSON config, resolve the local Terraform module path,
//          inject the sensitive deploy key from ENV, create the stack, synthesize to Terraform JSON.
// Why:     Centralizes env selection + file I/O so your stack class can focus on wiring infra.

import { App } from "cdktf";
import { InfraStack } from "./src/stacks/infra";      // CommonJS TS -> no .js suffix
import type { EnvConfig } from "./src/stacks/types";  // compile-time shape only
import * as path from "node:path";
import * as fs from "node:fs";

function loadConfig(env: string): EnvConfig {
  // read config file for the environment (dev/prod)
  const file = path.resolve(`src/config/${env}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing config file: ${file}`);

  // parse JSON into our typed shape (interface gives editor help + compile checks)
  const cfg = JSON.parse(fs.readFileSync(file, "utf-8")) as EnvConfig & { __doc?: string };

  // resolve the module path to an absolute path (prevents cwd/CI issues)
  cfg.moduleSource = path.resolve(path.dirname(file), cfg.moduleSource);

  // pull secret deploy key from environment if present (keep secrets out of JSON/Git)
  const key = process.env.GITHUB_DEPLOY_KEY;
  if (key && cfg.variables.github_deploy_key == null) {
    cfg.variables.github_deploy_key = key;
  }
  return cfg;
}

const app = new App();
// env selection order: --context env=dev  >  DEPLOY_ENV  > default 'dev'
const env = (app.node.tryGetContext("env") as string) || process.env.DEPLOY_ENV || "dev";
const cfg = loadConfig(env);

// create a single root Terraform stack (has its own state)
new InfraStack(app, `citytaster-${cfg.env}`, cfg);

// synthesize to ./cdktf.out (terraform JSON consumed by plan/apply)
app.synth();
