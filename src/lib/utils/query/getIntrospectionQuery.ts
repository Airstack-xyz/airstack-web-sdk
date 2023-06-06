import { IntrospectionSchema, IntrospectionType } from "graphql";
import { config } from "../../config";
import { API_ENDPOINT_DEV, API_ENDPOINT_PROD } from "../../constants";
import { introspectionQuery } from "../../constants/introspectionQuery";

export type SchemaMap = Record<string, IntrospectionType>;
const cache: {
  schema: SchemaMap | null;
} = {
  schema: null,
};

let inProgressRequest: Promise<SchemaMap> | null = null;

export async function getIntrospectionQueryMap(): Promise<SchemaMap> {
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
      const schemaMap: Record<string, IntrospectionType> = {};
      (res.data.__schema as IntrospectionSchema).types.forEach((type) => {
        schemaMap[type.name.toLowerCase()] = type;
      });

      cache.schema = schemaMap;
      return schemaMap;
    });

  return inProgressRequest;
}
