import { Kind } from "graphql";
import { Argument } from "./types";

function getType(kind: Kind, value: string, required = false) {
  let type: any = {
    kind: "NamedType",
    name: {
      kind: "Name",
      value,
    },
  };
  if (required) {
    type = {
      kind: "NonNullType",
      type: {
        ...type,
      },
    };
  }

  if (kind === Kind.LIST) {
    type = {
      kind: "ListType",
      type: {
        ...type,
      },
    };
  }

  return type;
}

export function createVariable({
  type,
  isRequired,
  name,
  uniqueName,
  valueKind,
}: Argument) {
  return {
    kind: "VariableDefinition",
    variable: {
      kind: "Variable",
      name: {
        kind: "Name",
        value: uniqueName || name,
      },
    },
    type: getType(valueKind as Kind, type as string, isRequired),
    directives: [],
  };
}
