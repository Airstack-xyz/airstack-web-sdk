type Env = "dev" | "prod";
export type Config = {
  authKey: string;
  env?: Env;
  cache?: boolean;
};

export const config: Config = {
  authKey: "",
  env: "dev",
  cache: true,
};
