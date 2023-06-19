import { FieldNode } from "graphql";
import { createPginationFieldAlias } from "./cursor";

function getPageInfo(cursorName: string) {
  return {
    kind: "Field",
    alias: {
      kind: "Name",
      value: createPginationFieldAlias(cursorName),
    },
    name: {
      kind: "Name",
      value: "pageInfo",
    },
    selectionSet: {
      kind: "SelectionSet",
      selections: [
        {
          kind: "Field",
          name: {
            kind: "Name",
            value: "prevCursor",
          },
        },
        {
          kind: "Field",
          name: {
            kind: "Name",
            value: "nextCursor",
          },
        },
      ],
    },
  };
}

export function addPageInfoFields(query: FieldNode, cursorName: string) {
  const fields = query?.selectionSet?.selections;
  if (fields) {
    // eslint-disable-next-line
    // @ts-ignore
    fields.push(getPageInfo(cursorName));
  }
}
