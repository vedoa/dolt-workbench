import { EntityManager } from "typeorm";

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

export function formatValueLiteral(
  value: string,
  type: string | undefined,
): string {
  if (isNumericType(type)) return value;
  return escapeStringLiteral(value);
}

const PLACEHOLDER_PATTERN = /\$\d+|\?/g;

export function interpolateForDisplay(
  sql: string,
  params: unknown[],
  types: Array<{ type?: string }>,
): string {
  let i = 0;
  return sql.replace(PLACEHOLDER_PATTERN, () => {
    const value = String(params[i]);
    const type = types[i]?.type;
    i += 1;
    return formatValueLiteral(value, type);
  });
}

const SCHEMA_DIALECTS = new Set(["postgres"]);

export function supportsSchemas(em: EntityManager): boolean {
  return SCHEMA_DIALECTS.has(em.connection.options.type);
}
