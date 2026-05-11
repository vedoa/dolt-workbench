import { DataSource, EntityManager } from "typeorm";
import { buildCallProcedure } from "./buildCallProcedure";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildCallProcedure", () => {
  it("emits CALL for mysql", () => {
    const out = buildCallProcedure(mysqlEm, "DOLT_RESET", [
      "--hard",
      "abc123",
    ]);
    expect(out.sql).toBe("CALL DOLT_RESET('--hard', 'abc123')");
    expect(out.displaySql).toBe(out.sql);
    expect(out.params).toEqual([]);
  });

  it("emits SELECT for postgres", () => {
    const out = buildCallProcedure(pgEm, "DOLT_REVERT", ["abc123"]);
    expect(out.sql).toBe("SELECT DOLT_REVERT('abc123')");
  });

  it("emits no args", () => {
    const out = buildCallProcedure(mysqlEm, "DOLT_COMMIT", []);
    expect(out.sql).toBe("CALL DOLT_COMMIT()");
  });

  it("escapes single quotes in args by doubling", () => {
    const out = buildCallProcedure(mysqlEm, "DOLT_TAG", [
      "v1",
      "release 'final'",
    ]);
    expect(out.sql).toBe("CALL DOLT_TAG('v1', 'release ''final''')");
  });
});
