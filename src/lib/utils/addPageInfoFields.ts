import { FieldNode } from "graphql";

const pageInfo = {
  kind: "Field",
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

export function addPageInfoFields(query: FieldNode) {
  const fields = query?.selectionSet?.selections;
  if (fields) {
    // check pageInfo already exists
    const pageInfoExists = fields.find(
      (field) => (field as FieldNode)?.name?.value === "pageInfo"
    );
    if (!pageInfoExists) {
      // eslint-disable-next-line
      // @ts-ignore
      fields.push(pageInfo);
    }
  }
}
