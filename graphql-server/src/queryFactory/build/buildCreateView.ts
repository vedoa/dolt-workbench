import { EntityManager } from "typeorm";
import { Built, ddlBuilt, escapeQualifiedIdentifier } from "./buildUtils";

export function buildCreateView(
  em: EntityManager,
  target: string,
  queryString: string,
): Built<unknown> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  return ddlBuilt(
    em,
    `CREATE VIEW ${escapeQualifiedIdentifier(escape, target)} AS ${queryString}`,
  );
}
