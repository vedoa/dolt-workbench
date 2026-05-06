import { DeleteResult, EntityManager } from "typeorm";
import { interpolateForDisplay, supportsSchemas } from "./buildUtils";

export type WhereClause = { column: string; value: string; type?: string };

export type DeleteRowArgs = {
  tableName: string;
  schemaName?: string;
  where: WhereClause[];
};

export type BuiltDelete = {
  sql: string;
  params: unknown[];
  displaySql: string;
  execute: () => Promise<DeleteResult>;
};

export function buildDeleteRow(
  em: EntityManager,
  args: DeleteRowArgs,
): BuiltDelete {
  if (args.where.length === 0) {
    throw new Error("deleteRow requires at least one where clause");
  }

  const target =
    supportsSchemas(em) && args.schemaName
      ? `${args.schemaName}.${args.tableName}`
      : args.tableName;

  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const namedParams: Record<string, string> = {};
  const conditions = args.where
    .map((w, i) => {
      const key = `p${i}`;
      namedParams[key] = w.value;
      return `${escape(w.column)} = :${key}`;
    })
    .join(" AND ");

  const qb = em
    .createQueryBuilder()
    .delete()
    .from(target)
    .where(conditions, namedParams);

  const [sql, params] = qb.getQueryAndParameters();
  const displaySql = interpolateForDisplay(sql, params, args.where);

  return { sql, params, displaySql, execute: async () => qb.execute() };
}
