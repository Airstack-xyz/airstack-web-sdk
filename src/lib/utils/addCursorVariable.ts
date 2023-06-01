import {
  IntrospectionInputObjectType,
  IntrospectionType,
  print,
  parse,
} from "graphql";
import { getArguments } from "./query";
import { getIntrospectionQuery } from "./query/getIntrospectionQuery";
import { moveArgumentsToParams } from "./query/moveArgumentsToParams";
import { getQueries } from "./query/getQueries";
import { QueryContext } from "../types";
import { addPageInfoFields } from "./addPageInfoFields";

const cursorField = {
  kind: "ObjectField",
  name: {
    kind: "Name",
    value: "cursor",
  },
  value: {
    kind: "StringValue",
  },
};
async function addVariable(
  queryString: string,
  callback: (value: string) => void
) {
  try {
    const introspectionQuery = await getIntrospectionQuery();
    const queryDocument = parse(queryString);
    const queries = getQueries(queryDocument);
    const schemaMap: Record<string, IntrospectionType> = {};

    const globalCtx: QueryContext = {
      variableNamesMap: {},
    };

    introspectionQuery.types.forEach((type) => {
      schemaMap[type.name.toLowerCase()] = type;
    });

    queries.forEach((query) => {
      let ctx = { variableNamesMap: { ...globalCtx.variableNamesMap } };
      const { args, inputFields } = getArguments(schemaMap, query, ctx);
      const hasCursor = args.find((arg) => arg.name === "cursor");

      if (!hasCursor) {
        const queryName = query.name.value;
        const queryInputTypeName = queryName.toLowerCase() + "input";

        const queryInputType = schemaMap[
          queryInputTypeName
        ] as IntrospectionInputObjectType;

        const supportsCursor = queryInputType.inputFields.find(
          (field) => field.name === "cursor"
        );
        if (!supportsCursor) return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        inputFields.push(cursorField);
        ctx = { variableNamesMap: { ...globalCtx.variableNamesMap } };

        const { args: argsWithCursor } = getArguments(schemaMap, query, ctx);
        const cursor = argsWithCursor.find((arg) => arg.name === "cursor");

        if (!cursor) {
          return;
        }

        if (cursor) {
          moveArgumentsToParams(queryDocument, [cursor]);
          addPageInfoFields(query);
        }
        globalCtx.variableNamesMap = {
          ...globalCtx.variableNamesMap,
          ...ctx.variableNamesMap,
        };
      }
    });
    const updatedQueryString = print(queryDocument);
    callback(updatedQueryString);
  } catch (error) {
    console.error(error);
    callback(queryString);
  }
}

const promiseCache: Record<string, Promise<string>> = {};

export async function addCursorVariable(queryString: string) {
  const cachedPromise = promiseCache[queryString];
  if (cachedPromise) return cachedPromise;

  promiseCache[queryString] = new Promise<string>((resolve) =>
    addVariable(queryString, resolve)
  );

  return promiseCache[queryString];
}
