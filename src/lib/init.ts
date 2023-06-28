import { Config, config } from "./config";

export function init(key: string, _config?: Omit<Config, "authKey">) {
  config.authKey = key;
  config.env = _config?.env || "dev";
  config.cache = _config?.cache === false ? false : true;
}
