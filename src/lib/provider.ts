import { useEffect } from "react";
import { Config } from "./config";
import { init } from "./init";

type ProviderProps = {
    apiKey: string;
    children: JSX.Element;
} & Omit<Config, "authKey">;

export function AirstackProvider({ children, apiKey, ...config }: ProviderProps) {

    useEffect(() => {
        init(apiKey, config)
    }, [apiKey, config])

    return children
}