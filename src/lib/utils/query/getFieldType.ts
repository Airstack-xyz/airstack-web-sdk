import {
  IntrospectionType,
  IntrospectionInputObjectType,
  IntrospectionNonNullTypeRef,
  IntrospectionNamedTypeRef,
} from "graphql";

export function getFieldType(
  schemaMap: Record<string, IntrospectionType>,
  fields: IntrospectionInputObjectType["inputFields"],
  path: string[],
  index = 0
): [string | null, boolean] {
  if (index === path.length) {
    // eslint-disable-next-line no-console
    console.error(" unable to find the type of ", path.join("/"));
    return [null, false];
  }
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (field.name === path[index]) {
      const ofType = (
        field.type as IntrospectionNonNullTypeRef<IntrospectionNamedTypeRef>
      ).ofType;

      if (field.type.kind === "SCALAR") {
        return [field.type.name, false];
      }

      if (ofType && (ofType.kind === "SCALAR" || ofType.kind === "ENUM")) {
        return [ofType.name, field.type.kind === "NON_NULL"];
      }

      let _ofType = ofType;

      while (_ofType) {
        if (
          // eslint-disable-next-line
          // @ts-ignore
          _ofType.ofType
        ) {
          if (
            // eslint-disable-next-line
            // @ts-ignore eslint-disable-next-line
            _ofType.ofType.kind !== "SCALAR" ||
            // eslint-disable-next-line
            // @ts-ignore eslint-disable-next-line
            _ofType.ofType.kind !== "ENUM"
          ) {
            break;
          }

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          _ofType = _ofType.ofType;
        } else {
          break;
        }
      }

      if (
        // eslint-disable-next-line
        // @ts-ignore eslint-disable-next-line
        _ofType?.ofType?.kind === "SCALAR" ||
        // eslint-disable-next-line
        // @ts-ignore eslint-disable-next-line
        _ofType?.ofType?.kind === "ENUM"
      ) {
        // eslint-disable-next-line
        // @ts-ignore eslint-disable-next-line
        return [_ofType.ofType.name, _ofType.kind === "NON_NULL"];
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-unsafe-optional-chaining
      const name = (_ofType?.name || field?.type?.name).toLowerCase();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const nestedFields = schemaMap[name].inputFields;

      return getFieldType(schemaMap, nestedFields, path, index + 1);
    }
  }
  return [null, false];
}
