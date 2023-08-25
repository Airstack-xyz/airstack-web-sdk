import { config } from "../config";
type Params = Parameters<typeof console.error>;

export function logError(...params: Params) {
  if (config?.env === "dev") {
    console.error(...params);
  }
}
