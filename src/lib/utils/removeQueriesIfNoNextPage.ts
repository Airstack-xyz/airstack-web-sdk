import {
  FieldNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  parse,
  print,
} from "graphql";
import { QueryContext, ResponseType } from "../types";
import { getQueriesWithLastPage } from "./findQueriesWithLastPage";
import { getQueries } from "./query/getQueries";
import {
  SchemaMap,
  getIntrospectionQueryMap,
} from "./query/getIntrospectionQuery";
import { getArguments } from "./query";
import { Argument } from "./query/types";

function getVariables(
  query: FieldNode,
  schemaMap: SchemaMap,
  ctx: QueryContext
) {
  const { args } = getArguments(schemaMap, query, ctx);
  return args.filter((arg) => arg.valueKind === "Variable");
}

export async function removeQueriesIfNoNextPage(
  query: string,
  data: ResponseType
) {
  const queriesWithLastPage = getQueriesWithLastPage(data);
  if (Object.keys(queriesWithLastPage).length === 0) return null;

  const queryDocument = parse(query);
  const queries = getQueries(queryDocument);
  let remainingVariables: Argument[] = [];
  let variablesToDelete: Argument[] = [];
  const ctx = {
    variableNamesMap: {},
  };

  const schemaMap = await getIntrospectionQueryMap();

  (
    queryDocument.definitions[0] as FragmentDefinitionNode
  ).selectionSet.selections = queries.filter((query) => {
    const queryName = query.name.value;
    const aliasedQueryName = query?.alias?.value || "";
    const queryVariables = getVariables(query, schemaMap, ctx);

    if (
      queriesWithLastPage[queryName] ||
      queriesWithLastPage[aliasedQueryName]
    ) {
      variablesToDelete = [...variablesToDelete, ...queryVariables];
      return false;
    }
    remainingVariables = [...remainingVariables, ...queryVariables];
    return true;
  });

  // no query was deleted so return null
  if (variablesToDelete.length === 0) return null;

  // remove unsed variables
  variablesToDelete = variablesToDelete.filter((deletedVariable) => {
    const { assignedVariable } = deletedVariable;
    return !remainingVariables.find((remainingVariable) => {
      return remainingVariable.assignedVariable === assignedVariable;
    });
  });

  const defination = queryDocument.definitions[0] as OperationDefinitionNode;
  // eslint-disable-next-line
  // @ts-ignore
  defination.variableDefinitions = defination.variableDefinitions?.filter(
    (variable) => {
      return !variablesToDelete.find((deletedVariable) => {
        return (
          deletedVariable.assignedVariable === variable.variable.name.value
        );
      });
    }
  );
  return print(queryDocument);
}
