type Env = "dev" | "prod";
type Config = {
  authKey: string;
  env?: Env;
  cache?: boolean;
};

export const config: Config = {
  authKey: "",
  env: "dev",
  cache: true,
};

export function init(key: string, _config?: Omit<Config, "authKey">) {
  config.authKey = key;
  config.env = _config?.env || "dev";
  config.cache = _config?.cache === false ? false : true;
}
