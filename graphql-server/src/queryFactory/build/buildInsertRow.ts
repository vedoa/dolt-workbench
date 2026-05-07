import { EntityManager, InsertResult } from "typeorm";
import { ColumnValue } from "../types";
import { interpolateForDisplay } from "./buildUtils";

export type BuiltInsert = {
  sql: string;
  params: string[];
  displaySql: string;
  execute: () => Promise<InsertResult>;
};

// `target` is the unquoted (optionally schema.table) form. TypeORM splits on
// `.` and applies the driver's identifier escape per part.
export function buildInsertRow(
  em: EntityManager,
  target: string,
  values: ColumnValue[],
): BuiltInsert {
  if (values.length === 0) {
    throw new Error("insertRow requires at least one column value");
  }

  const namedParams: Record<string, string> = {};
  const paramTypes: ColumnValue[] = [];
  const colValues: Record<string, () => string> = {};
  let paramIdx = 0;

  values.forEach(v => {
    if (v.value === null || v.value === undefined) {
      colValues[v.column] = () => "NULL";
      return;
    }
    const key = `p${paramIdx}`;
    paramIdx += 1;
    namedParams[key] = v.value;
    paramTypes.push(v);
    colValues[v.column] = () => `:${key}`;
  });

  const qb = em
    .createQueryBuilder()
    .insert()
    .into(target)
    .values(colValues)
    .setParameters(namedParams);

  const [sql, params] = qb.getQueryAndParameters() as [string, string[]];
  const displaySql = interpolateForDisplay(sql, params, paramTypes);

  return { sql, params, displaySql, execute: async () => qb.execute() };
}
