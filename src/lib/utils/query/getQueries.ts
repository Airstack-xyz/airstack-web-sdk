import { DocumentNode, FragmentDefinitionNode, FieldNode } from "graphql";

export function getQueries(query: DocumentNode): FieldNode[] {
  return (query.definitions[0] as FragmentDefinitionNode).selectionSet
    .selections as FieldNode[];
}
