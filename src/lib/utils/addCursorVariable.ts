import {
  IntrospectionInputObjectType,
  print,
  parse,
  ObjectFieldNode,
  FieldNode,
} from "graphql";
import { getArguments } from "./query";
import {
  SchemaMap,
  getIntrospectionQueryMap,
} from "./query/getIntrospectionQuery";
import { moveArgumentsToParams } from "./query/moveArgumentsToParams";
import { getQueries } from "./query/getQueries";
import { QueryContext } from "../types";
import { addPageInfoFields } from "./addPageInfoFields";
import { config } from "../config";

type InputFields = readonly ObjectFieldNode[];
type QueryWithoutCursor = {
  queryName: string;
  inputFields: InputFields;
  query: FieldNode;
};

function getQueriesWithoutCursorAndUpdateContext(
  queries: FieldNode[],
  schemaMap: SchemaMap,
  globalCtx: QueryContext
): QueryWithoutCursor[] {
  const queriesWithCursor: QueryWithoutCursor[] = [];

  queries.forEach((query) => {
    const { args, inputFields } = getArguments(schemaMap, query, {
      variableNamesMap: {},
    });
    const cursor = args.find((arg) => arg.name === "cursor");
    const queryName = query.name.value;

    if (!cursor) {
      queriesWithCursor.push({
        queryName,
        inputFields,
        query,
      });
      return;
    }

    // if cursor value is some fixed value given by user, then we don't need to add variable
    if (cursor.valueKind !== "Variable") return;

    const variableName =
      cursor.assignedVariable || cursor.uniqueName || cursor.name;

    addPageInfoFields(query, variableName);

    globalCtx.variableNamesMap[variableName] =
      (globalCtx.variableNamesMap[variableName] || 0) + 1;
  });
  return queriesWithCursor;
}

async function addVariable(
  queryString: string,
  callback: (value: string) => void
) {
  try {
    const schemaMap = await getIntrospectionQueryMap();
    const queryDocument = parse(queryString);
    const queries = getQueries(queryDocument);

    const globalCtx: QueryContext = {
      variableNamesMap: {},
    };

    const queriesWithoutCursor = getQueriesWithoutCursorAndUpdateContext(
      queries,
      schemaMap,
      globalCtx
    );

    queriesWithoutCursor.forEach(({ queryName, inputFields, query }) => {
      const queryInputTypeName = queryName.toLowerCase() + "input";

      const queryInputType = schemaMap[
        queryInputTypeName
      ] as IntrospectionInputObjectType;

      const querySupportsCursor = queryInputType.inputFields.find(
        (field) => field.name === "cursor"
      );

      if (!querySupportsCursor) {
        if (config.env === "dev") {
          console.error(`query "${queryName}" does not support pagination.`);
        }
        return;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      inputFields.push({
        kind: "ObjectField",
        name: {
          kind: "Name",
          value: "cursor",
        },
        value: {
          kind: "StringValue",
        },
      });

      // get arguments with cursor, so we can get the args with new args ref
      const { args: argsWithCursor } = getArguments(
        schemaMap,
        query,
        globalCtx
      );

      const cursor = argsWithCursor.find((arg) => arg.name === "cursor");

      // cursor should be there, but just in case
      if (!cursor) {
        return;
      }

      moveArgumentsToParams(queryDocument, [cursor]);
      addPageInfoFields(query, cursor.uniqueName || cursor.name);
    });

    const updatedQueryString = print(queryDocument);
    callback(updatedQueryString);
  } catch (error) {
    if (config.env === "dev") {
      console.error(
        "unable to add cursor to query, please make sure the query is valid"
      );
    }
    console.error(error);
    callback(queryString);
  }
}

const promiseCache: Record<string, Promise<string>> = {};

export async function addCursorVariable(queryString: string) {
  const cachedPromise = promiseCache[queryString];
  if (cachedPromise) return cachedPromise;

  promiseCache[queryString] = new Promise<string>((resolve) =>
    addVariable(queryString, (query: string) => {
      resolve(query);
      delete promiseCache[queryString];
    })
  );

  return promiseCache[queryString];
}
