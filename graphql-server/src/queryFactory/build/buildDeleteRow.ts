import { DeleteResult, EntityManager } from "typeorm";
import { ColumnValue } from "../types";
import {
  buildWhereConditions,
  interpolateForDisplay,
  newParamAccumulator,
} from "./buildUtils";

export type BuiltDelete = {
  sql: string;
  params: string[];
  displaySql: string;
  execute: () => Promise<DeleteResult>;
};

export function buildDeleteRow(
  em: EntityManager,
  target: string,
  where: ColumnValue[],
): BuiltDelete {
  if (where.length === 0) {
    throw new Error("deleteRow requires at least one where clause");
  }

  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const acc = newParamAccumulator();
  const conditions = buildWhereConditions(where, escape, acc);

  const qb = em
    .createQueryBuilder()
    .delete()
    .from(target)
    .where(conditions, acc.namedParams);

  const [sql, params] = qb.getQueryAndParameters() as [string, string[]];
  const displaySql = interpolateForDisplay(sql, params, acc.paramTypes);

  return { sql, params, displaySql, execute: async () => qb.execute() };
}
