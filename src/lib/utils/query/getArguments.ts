import {
  IntrospectionSchema,
  IntrospectionType,
  FieldNode,
  IntrospectionInputObjectType,
  ObjectValueNode,
} from "graphql";
import { getArgumentsFromInput } from "./arguments";
import { getFieldType } from "./getFieldType";
import { Argument } from "./types";
import { QueryContext } from "../../types";

export function getArguments(
  schemaMap: Record<string, IntrospectionType>,
  fieldNode: FieldNode,
  ctx: QueryContext
): { args: Argument[]; inputFields: ObjectValueNode["fields"] } {
  const queryName = fieldNode.name.value;

  const queryInputTypeName = queryName.toLowerCase() + "input";

  const queryInputType = schemaMap[
    queryInputTypeName
  ] as IntrospectionInputObjectType;

  const input = fieldNode.arguments?.find((a) => a.name.value === "input");

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

  const args = getArgumentsFromInput(inputFields, ctx);

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
