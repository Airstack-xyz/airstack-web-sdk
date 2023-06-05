type Env = "dev" | "prod";
type Config = {
  authKey: string;
  env: Env;
};

export const config: Config = {
  authKey: "",
  env: "dev",
};

export function init(key: string, env: Env = "dev") {
  config.authKey = key;
  config.env = env;
}
