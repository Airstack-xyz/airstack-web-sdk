import {
  FieldNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  parse,
  print,
} from 'graphql';
import { QueryContext, ResponseType } from '../types';
import { getQueriesWithLastPage } from './findQueriesWithLastPage';
import { getQueries } from './query/getQueries';
import {
  SchemaMap,
  getIntrospectionQueryMap,
} from './query/getIntrospectionQuery';
import { getArguments } from './query';

function getVariables(
  query: FieldNode,
  schemaMap: SchemaMap,
  ctx: QueryContext
) {
  const { args } = getArguments(schemaMap, query, ctx);
  const variables: string[] = [];
  args.forEach((arg) => {
    if (arg.valueKind === 'Variable') {
      variables.push(arg.assignedVariable || arg.uniqueName || arg.name);
    }
    if (arg.valueKind === 'ListValue' && Array.isArray(arg.defaultValue)) {
      arg.defaultValue.forEach((value) => {
        if (value.kind === 'Variable') {
          variables.push(value.name.value);
        }
      })
    }
  });
  return variables;
}

export async function removeQueriesIfNoNextPage(
  query: string,
  data: ResponseType
) {
  const queriesWithLastPage = getQueriesWithLastPage(data);
  if (Object.keys(queriesWithLastPage).length === 0) return null;

  const queryDocument = parse(query);
  const queries = getQueries(queryDocument);
  let variablesForRemainingQueryies: string[] = [];
  let variablesToDelete: string[] = [];
  const ctx = {
    variableNamesMap: {},
  };

  const schemaMap = await getIntrospectionQueryMap();

  (
    queryDocument.definitions[0] as FragmentDefinitionNode
  ).selectionSet.selections = queries.filter((query) => {
    const queryName = query.name.value;
    const aliasedQueryName = query?.alias?.value || '';
    const queryVariables = getVariables(query, schemaMap, ctx);

    if (
      queriesWithLastPage[queryName] ||
      queriesWithLastPage[aliasedQueryName]
    ) {
      variablesToDelete = [...variablesToDelete, ...queryVariables];
      return false;
    }
    variablesForRemainingQueryies = [...variablesForRemainingQueryies, ...queryVariables];
    return true;
  });

  // no query was deleted so return null
  if (variablesToDelete.length === 0) return null;

  // remove unsed variables
  variablesToDelete = variablesToDelete.filter((deletedVariable) => {
    return !variablesForRemainingQueryies.find((remainingVariable) => {
      return remainingVariable === deletedVariable;
    });
  });

  const defination = queryDocument.definitions[0] as OperationDefinitionNode;
  // eslint-disable-next-line
  // @ts-ignore
  defination.variableDefinitions = defination.variableDefinitions?.filter(
    (variable) => {
      return !variablesToDelete.find((deletedVariable) => {
        return (
          deletedVariable === variable.variable.name.value
        );
      });
    }
  );
  return print(queryDocument);
}
