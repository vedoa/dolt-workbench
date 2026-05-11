import { EntityManager } from "typeorm";
import { ColumnValue, OrderByClause, PkRow, RawRows } from "../types";
import {
  Built,
  buildWhereConditions,
  interpolateForDisplay,
  newParamAccumulator,
} from "./buildUtils";

export type SelectTableRowsBuildArgs = {
  orderBy?: OrderByClause[];
  where?: ColumnValue[];
  excludePks?: PkRow[];
  projection?: string[];
  offset?: number;
  limit: number;
};

export function buildSelectTableRows(
  em: EntityManager,
  target: string,
  args: SelectTableRowsBuildArgs,
): Built<RawRows> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const acc = newParamAccumulator();

  const selectClause =
    args.projection && args.projection.length > 0
      ? args.projection.map(c => escape(c)).join(", ")
      : "*";

  const alias = target.split(".").pop() ?? target;
  let qb = em.createQueryBuilder().select(selectClause).from(target, alias);

  const whereParts: string[] = [];
  if (args.where && args.where.length > 0) {
    whereParts.push(buildWhereConditions(args.where, escape, acc));
  }
  if (args.excludePks && args.excludePks.length > 0) {
    args.excludePks.forEach(pkRow => {
      whereParts.push(
        `NOT (${buildWhereConditions(pkRow.values, escape, acc)})`,
      );
    });
  }
  if (whereParts.length > 0) {
    qb = qb.where(whereParts.join(" AND "), acc.namedParams);
  }

  if (args.orderBy && args.orderBy.length > 0) {
    args.orderBy.forEach((o, i) => {
      const col = escape(o.column);
      if (i === 0) {
        qb = qb.orderBy(col, o.direction);
      } else {
        qb = qb.addOrderBy(col, o.direction);
      }
    });
  }

  const [preLimitSql, preLimitParams] = qb.getQueryAndParameters() as [
    string,
    string[],
  ];
  const displaySql = interpolateForDisplay(
    preLimitSql,
    preLimitParams,
    acc.paramTypes,
  );

  qb = qb.limit(args.limit);
  if (args.offset !== undefined && args.offset > 0) {
    qb = qb.offset(args.offset);
  }

  const [sql, params] = qb.getQueryAndParameters() as [string, string[]];

  return {
    sql,
    params,
    displaySql,
    execute: async () => qb.getRawMany(),
  };
}
