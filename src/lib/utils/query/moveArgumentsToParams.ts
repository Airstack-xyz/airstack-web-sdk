import { DocumentNode, OperationDefinitionNode } from "graphql";
import { createArgumentValue } from "./arguments";
import { createVariable } from "./createVariable";
import { Argument } from "./types";

export function moveArgumentsToParams(
  query: DocumentNode,
  args: Argument[]
): DocumentNode {
  const definitions = query.definitions[0] as OperationDefinitionNode;
  // add new variable definitions
  args.forEach((input) => {
    if (input.type) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      definitions.variableDefinitions.push(createVariable(input));
    }
  });

  // add new arguments to input
  args.forEach((input) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    input.ref.value = createArgumentValue(input.uniqueName || input.name);
  });
  return query;
}
