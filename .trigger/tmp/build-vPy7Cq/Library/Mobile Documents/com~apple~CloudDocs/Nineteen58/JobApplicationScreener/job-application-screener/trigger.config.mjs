import {
  defineConfig
} from "../../../../../../chunk-BQEHGKQG.mjs";
import "../../../../../../chunk-7D76SFG3.mjs";
import "../../../../../../chunk-H6HPB62A.mjs";
import {
  init_esm
} from "../../../../../../chunk-7VV2K5OU.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_toyespwcynigitffabsq",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2,
      randomize: true
    }
  },
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
