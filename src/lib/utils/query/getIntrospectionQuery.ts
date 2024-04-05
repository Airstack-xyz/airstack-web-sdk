import { IntrospectionSchema, IntrospectionType } from "graphql";
import { AIRSTACK_ENDPOINT } from "../../constants";
import { introspectionQuery } from "../../constants/introspectionQuery";
import { config } from "../../config";

const mismatchedQueryMap = {
  socialfollowingsinput: "socialfollowinginput",
  socialfollowersinput: "socialfollowerinput",
  farcastercastsinput: "farcastercastinput",
} as const;

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

  inProgressRequest = fetch(AIRSTACK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.authKey,
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

      // fix for known query-name to schema-input-name mismatch
      for (const expectedQueryInputName in mismatchedQueryMap) {
        const actualQueryInputNameInResponse =
          mismatchedQueryMap[
            expectedQueryInputName as keyof typeof mismatchedQueryMap
          ];
        const value =
          schemaMap[expectedQueryInputName] ||
          schemaMap[actualQueryInputNameInResponse];
        if (value) {
          schemaMap[expectedQueryInputName] = value;
        }
      }
      cache.schema = schemaMap;
      return schemaMap;
    });

  return inProgressRequest;
}
