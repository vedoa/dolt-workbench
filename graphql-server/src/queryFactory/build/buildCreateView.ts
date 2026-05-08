import { EntityManager } from "typeorm";
import { Built, escapeQualifiedIdentifier } from "./buildUtils";

export function buildCreateView(
  em: EntityManager,
  target: string,
  queryString: string,
): Built<unknown> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  const sql = `CREATE VIEW ${escapeQualifiedIdentifier(escape, target)} AS ${queryString}`;
  return {
    sql,
    params: [],
    displaySql: sql,
    execute: async () => em.query(sql),
  };
}
