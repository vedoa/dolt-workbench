import { pluralize } from "@dolthub/web-utils";

// Mirrors the format used by classifyMysqlResult/classifyPgResult so typed
// mutations and the raw sqlSelect path produce the same execution-message
// string for the editor's success line.
export function mutationExecutionMessage(rowsAffected: number): string {
  return `Query OK, ${rowsAffected} ${pluralize(rowsAffected, "row")} affected.`;
}

export function escapeStringLiteral(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

const NUMERIC_TYPE_PREFIXES = [
  "int",
  "bigint",
  "smallint",
  "tinyint",
  "mediumint",
  "decimal",
  "numeric",
  "float",
  "double",
  "real",
];

export function isNumericType(type: string | undefined): boolean {
  if (!type) return false;
  const t = type.toLowerCase();
  return NUMERIC_TYPE_PREFIXES.some(p => t.startsWith(p));
}

const BOOLEAN_TYPE_PREFIXES = ["bool", "boolean"];

export function isBooleanType(type: string | undefined): boolean {
  if (!type) return false;
  const t = type.toLowerCase();
  return BOOLEAN_TYPE_PREFIXES.some(p => t.startsWith(p));
}

export function formatValueLiteral(
  value: string | null,
  type: string | undefined,
): string {
  if (value === null) return "NULL";
  if (isBooleanType(type)) {
    const lower = value.toLowerCase();
    if (lower === "true" || lower === "1") return "TRUE";
    if (lower === "false" || lower === "0") return "FALSE";
  }
  if (isNumericType(type)) return value;
  return escapeStringLiteral(value);
}

const PLACEHOLDER_PATTERN = /\$\d+|\?/g;

export function interpolateForDisplay(
  sql: string,
  params: string[],
  types: Array<{ type?: string }>,
): string {
  let i = 0;
  return sql.replace(PLACEHOLDER_PATTERN, () => {
    const value = params[i];
    const type = types[i]?.type;
    i += 1;
    return formatValueLiteral(value, type);
  });
}
