export function createPginationFieldAlias(cursorName: string) {
  return `pageInfo_${cursorName}`;
}

export default function isAliasedPageInfo(key: string) {
  return key.startsWith("pageInfo_");
}

export function getCursorName(key: string) {
  return key.replace("pageInfo_", "");
}
