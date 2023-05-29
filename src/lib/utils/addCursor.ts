import { parse } from "graphql";
import { getAllArguments } from "./query";
import { getIntrospectionQuery } from "./query/getIntrospectionQuery";
import { moveArgumentsToParams } from "./query/moveArgumentsToParams";

export async function addCursor(query: string) {
  try {
    const introspectionQuery = await getIntrospectionQuery();
    const queryDocument = parse(query);
    const { args, inputFields } = getAllArguments(
      introspectionQuery,
      queryDocument
    );
    const hasCursor = args.find((arg) => arg.name === "cursor");

    if (!hasCursor) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      inputFields.push({
        kind: "ObjectField",
        name: {
          kind: "Name",
          value: "cursor",
        },
        value: {
          kind: "NullValue",
        },
      });
      const { args: argsWithCursor } = getAllArguments(
        introspectionQuery,
        queryDocument
      );
      const cursor = argsWithCursor.find((arg) => arg.name === "cursor");
      if (!cursor) {
        console.error(" unable to add cursor");
      }
      return cursor ? moveArgumentsToParams(queryDocument, [cursor]) : query;
    }
    return query;
  } catch (error) {
    console.error(error);
    return query;
  }
}
