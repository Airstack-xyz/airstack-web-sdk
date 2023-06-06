import {
  ListValueNode,
  ObjectFieldNode,
  ObjectValueNode,
  StringValueNode,
} from "graphql";
import { Argument } from "./types";
import { QueryContext } from "../../types";

export function getArgumentsFromInput(
  inputs: readonly ObjectFieldNode[],
  ctx: QueryContext,
  _key = ""
) {
  let data: Argument[] = [];
  inputs.forEach((input) => {
    let key = _key;
    if (input.kind === "ObjectField" && input.value.kind === "ObjectValue") {
      const _data = getArgumentsFromInput(
        (input.value as ObjectValueNode).fields,
        ctx,
        (key += input.name.value + "/")
      );
      data = [...data, ..._data];
    } else {
      key += input.name.value;
      const name = input.name.value;
      let uniqueName = input.name.value;
      if (ctx.variableNamesMap[name]) {
        uniqueName = `${name}${ctx.variableNamesMap[name]}`;
        ctx.variableNamesMap[name]++;
      } else {
        ctx.variableNamesMap[name] = 1;
      }
      data.push({
        path: key.split("/"),
        name,
        uniqueName,
        valueKind: input.value?.kind,
        // eslint-disable-next-line
        // @ts-ignore
        assignedVariable: input.value?.name?.value,
        defaultValue:
          (input.value as StringValueNode).value ||
          ((input.value as ListValueNode).values as unknown[]),
        ref: input,
      });
    }
  });
  return data;
}

export function createArgumentValue(value: unknown) {
  return {
    kind: "Variable",
    name: {
      kind: "Name",
      value,
    },
  };
}
