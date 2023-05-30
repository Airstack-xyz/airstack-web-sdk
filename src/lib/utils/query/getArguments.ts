import {
  IntrospectionSchema,
  DocumentNode,
  IntrospectionType,
  FragmentDefinitionNode,
  FieldNode,
  IntrospectionInputObjectType,
  ObjectValueNode,
} from "graphql";
import { getArgumentsFromInput } from "./arguments";
import { getFieldType } from "./getFieldType";
import { Argument } from "./types";

export function getArguments(
  schema: IntrospectionSchema,
  query: DocumentNode
): { args: Argument[]; inputFields: ObjectValueNode["fields"] } {
  const schemaMap: Record<string, IntrospectionType> = {};
  schema.types.forEach((type) => {
    schemaMap[type.name.toLowerCase()] = type;
  });

  const selection = (query.definitions[0] as FragmentDefinitionNode)
    .selectionSet.selections[0] as FieldNode;

  const queryName = selection.name.value;

  const queryInputTypeName = queryName.toLowerCase() + "input";

  const queryInputType = schemaMap[
    queryInputTypeName
  ] as IntrospectionInputObjectType;

  const input = selection.arguments?.find((a) => a.name.value === "input");

  const inputFields = (input?.value as ObjectValueNode).fields;

  const userInputsArgs = [];
  // get type of arguments from queryInputType and store in argumetentType
  (queryInputType as IntrospectionInputObjectType)?.inputFields.forEach(
    (inputField) => {
      const inputName = inputField.name;
      const argument = inputFields.find(
        (arg) => arg.value.kind !== "Variable" && arg.name.value === inputName
      );
      if (argument) {
        userInputsArgs.push(inputField);
      }
    }
  );

  const args = getArgumentsFromInput(inputFields);

  args.forEach((input) => {
    const [type, isRequied] = getFieldType(
      schemaMap,
      queryInputType.inputFields,
      input.path
    );
    input.type = type;
    input.isRequired = isRequied;
  });
  return {
    args,
    inputFields,
  };
}
