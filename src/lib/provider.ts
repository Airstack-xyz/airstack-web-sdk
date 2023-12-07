import { Config } from "./config";
import { init } from "./init";

type ProviderProps = {
  apiKey: string;
  children: JSX.Element;
} & Omit<Config, "authKey">;

export function AirstackProvider({
  children,
  apiKey,
  ...config
}: ProviderProps) {
  // don't call init inside an effect as the child components/hooks effects will get called before this one
  // and the child components/hooks will not have access to the apiKey
  init(apiKey, config);
  return children;
}
