import { Kind } from "graphql";

export type Argument = {
  path: string[];
  name: string;
  uniqueName?: string;
  valueKind?: Kind;
  type?: string | null;
  ref?: unknown;
  isRequired?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue: string | any[];
};
