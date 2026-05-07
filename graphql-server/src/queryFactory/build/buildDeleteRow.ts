import { DeleteResult, EntityManager } from "typeorm";
import { WhereClause } from "../types";
import { interpolateForDisplay } from "./buildUtils";

export type BuiltDelete = {
  sql: string;
  params: unknown[];
  displaySql: string;
  execute: () => Promise<DeleteResult>;
};

// `target` is the unquoted (optionally schema.table) form. TypeORM splits on
// `.` and applies the driver's identifier escape per part.
export function buildDeleteRow(
  em: EntityManager,
  target: string,
  where: WhereClause[],
): BuiltDelete {
  if (where.length === 0) {
    throw new Error("deleteRow requires at least one where clause");
  }

  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const namedParams: Record<string, string> = {};
  const paramTypes: WhereClause[] = [];
  let paramIdx = 0;
  const conditions = where
    .map(w => {
      if (w.value === null || w.value === undefined) {
        return `${escape(w.column)} IS NULL`;
      }
      const key = `p${paramIdx}`;
      paramIdx += 1;
      namedParams[key] = w.value;
      paramTypes.push(w);
      return `${escape(w.column)} = :${key}`;
    })
    .join(" AND ");

  const qb = em
    .createQueryBuilder()
    .delete()
    .from(target)
    .where(conditions, namedParams);

  const [sql, params] = qb.getQueryAndParameters();
  const displaySql = interpolateForDisplay(sql, params, paramTypes);

  return { sql, params, displaySql, execute: async () => qb.execute() };
}
