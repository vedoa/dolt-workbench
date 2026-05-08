import { EntityManager } from "typeorm";
import { Built, ddlBuilt, escapeQualifiedIdentifier } from "./buildUtils";

export function buildDropTable(
  em: EntityManager,
  target: string,
): Built<unknown> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  return ddlBuilt(
    em,
    `DROP TABLE ${escapeQualifiedIdentifier(escape, target)}`,
  );
}
