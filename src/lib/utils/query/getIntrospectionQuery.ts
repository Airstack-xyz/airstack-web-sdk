import { IntrospectionSchema } from "graphql";
import { config } from "../../config";
import { API_ENDPOINT_DEV, API_ENDPOINT_PROD } from "../../constants";
import { introspectionQuery } from "../../constants/introspectionQuery";

const cache: {
  schema: IntrospectionSchema | null;
} = {
  schema: null,
};

let inProgressRequest: Promise<IntrospectionSchema> | null = null;

export async function getIntrospectionQuery(): Promise<IntrospectionSchema> {
  if (cache.schema) {
    return cache.schema;
  }

  if (inProgressRequest) {
    return inProgressRequest;
  }

  const api = config.env === "dev" ? API_ENDPOINT_DEV : API_ENDPOINT_PROD;

  inProgressRequest = fetch(api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: introspectionQuery,
      operationName: "IntrospectionQuery",
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      inProgressRequest = null;
      cache.schema = res.data.__schema;
      return res.data.__schema;
    });

  return inProgressRequest;
}
