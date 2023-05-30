type Env = "dev" | "prod";

export const config = {
  authKey: "",
  env: "dev",
};

export function init(key: string, env: Env = "dev") {
  config.authKey = key;
  config.env = env;
}
