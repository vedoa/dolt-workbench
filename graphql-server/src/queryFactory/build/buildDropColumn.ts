import { EntityManager } from "typeorm";
import { Built, ddlBuilt, escapeQualifiedIdentifier } from "./buildUtils";

export function buildDropColumn(
  em: EntityManager,
  target: string,
  columnName: string,
): Built<unknown> {
  const escape = em.connection.driver.escape.bind(em.connection.driver);
  return ddlBuilt(
    em,
    `ALTER TABLE ${escapeQualifiedIdentifier(escape, target)} DROP COLUMN ${escape(columnName)}`,
  );
}
