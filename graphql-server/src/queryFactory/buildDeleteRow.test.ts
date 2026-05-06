import { DataSource, EntityManager } from "typeorm";
import { buildDeleteRow } from "./buildDeleteRow";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildDeleteRow", () => {
  describe("mysql", () => {
    it("emits a single-PK delete with ? placeholder and matching display SQL", () => {
      const out = buildDeleteRow(mysqlEm, {
        tableName: "users",
        where: [{ column: "id", value: "42" }],
      });
      expect(out.sql).toBe("DELETE FROM `users` WHERE `id` = ?");
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe("DELETE FROM `users` WHERE `id` = '42'");
    });

    it("emits a composite-PK delete with AND-joined predicates", () => {
      const out = buildDeleteRow(mysqlEm, {
        tableName: "assignments",
        where: [
          { column: "challenge_id", value: "1" },
          { column: "assignment", value: "x" },
        ],
      });
      expect(out.sql).toBe(
        "DELETE FROM `assignments` WHERE `challenge_id` = ? AND `assignment` = ?",
      );
      expect(out.params).toEqual(["1", "x"]);
      expect(out.displaySql).toBe(
        "DELETE FROM `assignments` WHERE `challenge_id` = '1' AND `assignment` = 'x'",
      );
    });

    it("escapes single quotes in the display SQL value", () => {
      const out = buildDeleteRow(mysqlEm, {
        tableName: "users",
        where: [{ column: "name", value: "O'Hara" }],
      });
      expect(out.params).toEqual(["O'Hara"]);
      expect(out.displaySql).toBe(
        "DELETE FROM `users` WHERE `name` = 'O''Hara'",
      );
    });

    it("ignores schemaName (mysql has no schema qualification)", () => {
      const out = buildDeleteRow(mysqlEm, {
        tableName: "users",
        schemaName: "ignored",
        where: [{ column: "id", value: "1" }],
      });
      expect(out.sql).toBe("DELETE FROM `users` WHERE `id` = ?");
    });

    it("emits unquoted numeric values when column type is numeric", () => {
      const out = buildDeleteRow(mysqlEm, {
        tableName: "users",
        where: [{ column: "id", value: "42", type: "int" }],
      });
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe("DELETE FROM `users` WHERE `id` = 42");
    });

    it("treats bigint, decimal, etc. as numeric", () => {
      const out = buildDeleteRow(mysqlEm, {
        tableName: "t",
        where: [
          { column: "a", value: "1", type: "bigint" },
          { column: "b", value: "2.5", type: "decimal(10,2)" },
        ],
      });
      expect(out.displaySql).toBe(
        "DELETE FROM `t` WHERE `a` = 1 AND `b` = 2.5",
      );
    });

    it("falls back to quoted string for non-numeric types and missing type", () => {
      const out = buildDeleteRow(mysqlEm, {
        tableName: "t",
        where: [
          { column: "a", value: "x", type: "varchar(255)" },
          { column: "b", value: "y" },
        ],
      });
      expect(out.displaySql).toBe(
        "DELETE FROM `t` WHERE `a` = 'x' AND `b` = 'y'",
      );
    });

    it("throws when no where clauses are provided", () => {
      expect(() =>
        buildDeleteRow(mysqlEm, { tableName: "users", where: [] }),
      ).toThrow(/at least one where clause/);
    });
  });

  describe("postgres", () => {
    it("emits a single-PK delete with $1 placeholder and qualified table", () => {
      const out = buildDeleteRow(pgEm, {
        tableName: "users",
        schemaName: "public",
        where: [{ column: "id", value: "42" }],
      });
      expect(out.sql).toBe('DELETE FROM "public"."users" WHERE "id" = $1');
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "id" = '42'`,
      );
    });

    it("emits a composite-PK delete with $1, $2, ... AND-joined", () => {
      const out = buildDeleteRow(pgEm, {
        tableName: "assignments",
        schemaName: "public",
        where: [
          { column: "challenge_id", value: "1" },
          { column: "assignment", value: "x" },
        ],
      });
      expect(out.sql).toBe(
        'DELETE FROM "public"."assignments" WHERE "challenge_id" = $1 AND "assignment" = $2',
      );
      expect(out.params).toEqual(["1", "x"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."assignments" WHERE "challenge_id" = '1' AND "assignment" = 'x'`,
      );
    });

    it("uses the supplied schemaName (non-public)", () => {
      const out = buildDeleteRow(pgEm, {
        tableName: "events",
        schemaName: "analytics",
        where: [{ column: "id", value: "1" }],
      });
      expect(out.sql).toBe('DELETE FROM "analytics"."events" WHERE "id" = $1');
    });

    it("emits an unqualified table when schemaName is omitted", () => {
      const out = buildDeleteRow(pgEm, {
        tableName: "users",
        where: [{ column: "id", value: "1" }],
      });
      expect(out.sql).toBe('DELETE FROM "users" WHERE "id" = $1');
    });

    it("escapes single quotes in the display SQL value", () => {
      const out = buildDeleteRow(pgEm, {
        tableName: "users",
        schemaName: "public",
        where: [{ column: "name", value: "O'Hara" }],
      });
      expect(out.params).toEqual(["O'Hara"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "name" = 'O''Hara'`,
      );
    });

    it("emits unquoted numeric values when column type is numeric", () => {
      const out = buildDeleteRow(pgEm, {
        tableName: "users",
        schemaName: "public",
        where: [{ column: "id", value: "42", type: "int" }],
      });
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "id" = 42`,
      );
    });

    it("throws when no where clauses are provided", () => {
      expect(() =>
        buildDeleteRow(pgEm, {
          tableName: "users",
          schemaName: "public",
          where: [],
        }),
      ).toThrow(/at least one where clause/);
    });
  });
});
