import {
  ColumnValueInput,
  OrderByClause,
  PkRow,
  SortDirection,
} from "@gen/graphql-types";
import { NextRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";

export type StackingParams = {
  orderBy?: OrderByClause[];
  where?: ColumnValueInput[];
  excludePks?: PkRow[];
  projection?: string[];
};

const KEYS = {
  orderBy: "orderBy",
  where: "where",
  excludePks: "excludePks",
  projection: "projection",
} as const;

function parseJsonParam<T>(raw: string | string[] | undefined): T | undefined {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function parseStackingParams(query: ParsedUrlQuery): StackingParams {
  return {
    orderBy: parseJsonParam<OrderByClause[]>(query[KEYS.orderBy]),
    where: parseJsonParam<ColumnValueInput[]>(query[KEYS.where]),
    excludePks: parseJsonParam<PkRow[]>(query[KEYS.excludePks]),
    projection: parseJsonParam<string[]>(query[KEYS.projection]),
  };
}

export function stackingParamsToQuery(
  stack: StackingParams,
): Record<string, string | undefined> {
  return {
    [KEYS.orderBy]: stack.orderBy?.length
      ? JSON.stringify(stack.orderBy)
      : undefined,
    [KEYS.where]: stack.where?.length
      ? JSON.stringify(stack.where)
      : undefined,
    [KEYS.excludePks]: stack.excludePks?.length
      ? JSON.stringify(stack.excludePks)
      : undefined,
    [KEYS.projection]: stack.projection?.length
      ? JSON.stringify(stack.projection)
      : undefined,
  };
}

export function setColumnSort(
  current: OrderByClause[] | undefined,
  column: string,
  direction: SortDirection | undefined,
): OrderByClause[] {
  const list = current ?? [];
  if (direction === undefined) return list.filter(o => o.column !== column);
  const existing = list.findIndex(o => o.column === column);
  if (existing === -1) return [...list, { column, direction }];
  const updated = list.slice();
  updated[existing] = { column, direction };
  return updated;
}

export function getColumnSort(
  current: OrderByClause[] | undefined,
  column: string,
): SortDirection | undefined {
  return current?.find(o => o.column === column)?.direction;
}

export function appendWhere(
  current: ColumnValueInput[] | undefined,
  condition: ColumnValueInput,
): ColumnValueInput[] {
  return [...(current ?? []), condition];
}

export function appendExcludePk(
  current: PkRow[] | undefined,
  pkRow: PkRow,
): PkRow[] {
  return [...(current ?? []), pkRow];
}

export function removeFromProjection(
  current: string[] | undefined,
  column: string,
  allColumns: string[],
): string[] {
  // First hide materializes the implicit `*` projection into an explicit
  // list so subsequent hides have something to remove from.
  const base = current && current.length > 0 ? current : allColumns;
  return base.filter(c => c !== column);
}

export function pushStack(router: NextRouter, stack: StackingParams): void {
  router
    .push({
      pathname: router.pathname,
      query: {
        ...router.query,
        ...stackingParamsToQuery(stack),
      },
    })
    .catch(console.error);
}
