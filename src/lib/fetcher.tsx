import { config } from "./fetchQuery";

const api = "https://devapi.airstack.xyz/gql";

export const fetchGql = async (query, variables) => {
    const res = await fetch(api, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        'Authorization': config['auth-key'],
        },
        body: JSON.stringify({
        query,
        variables,
        }),
    });
    const json = await res.json();
    const data = json?.data;
    let error = null;
    if (json.errors) {
        error = json.errors;
    }
    return [data, error]

}