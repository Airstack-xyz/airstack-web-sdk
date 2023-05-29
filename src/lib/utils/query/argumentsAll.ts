import {
  ListValueNode,
  ObjectFieldNode,
  ObjectValueNode,
  StringValueNode,
} from "graphql";
import { Argument } from "./types";

export function getArguments(
  inputs: readonly ObjectFieldNode[],
  variableNamesMap: Record<string, number> = {},
  _key = ""
) {
  let data: Argument[] = [];
  inputs.forEach((input) => {
    let key = _key;
    if (input.kind === "ObjectField" && input.value.kind === "ObjectValue") {
      const _data = getArguments(
        (input.value as ObjectValueNode).fields,
        variableNamesMap,
        (key += input.name.value + "/")
      );
      data = [...data, ..._data];
    } else {
      console.log({ input });
      if (input.value.kind !== "Variable") {
        key += input.name.value;
        const name = input.name.value;
        let uniqueName = input.name.value;
        if (variableNamesMap[name]) {
          uniqueName = `${name}${variableNamesMap[name]}`;
          variableNamesMap[name]++;
        } else {
          variableNamesMap[name] = 1;
        }
        data.push({
          path: key.split("/"),
          name,
          uniqueName,
          valueKind: input.value.kind,
          defaultValue:
            (input.value as StringValueNode).value ||
            ((input.value as ListValueNode).values as any[]),
          ref: input,
        });
      }
    }
  });
  return data;
}

export function createArgumentValue(value) {
  return {
    kind: "Variable",
    name: {
      kind: "Name",
      value,
    },
  };
}
