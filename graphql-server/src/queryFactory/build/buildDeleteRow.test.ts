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
      const out = buildDeleteRow(mysqlEm, "users", [
        { column: "id", value: "42" },
      ]);
      expect(out.sql).toBe("DELETE FROM `users` WHERE `id` = ?");
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe("DELETE FROM `users` WHERE `id` = '42'");
    });

    it("emits a composite-PK delete with AND-joined predicates", () => {
      const out = buildDeleteRow(mysqlEm, "assignments", [
        { column: "challenge_id", value: "1" },
        { column: "assignment", value: "x" },
      ]);
      expect(out.sql).toBe(
        "DELETE FROM `assignments` WHERE `challenge_id` = ? AND `assignment` = ?",
      );
      expect(out.params).toEqual(["1", "x"]);
      expect(out.displaySql).toBe(
        "DELETE FROM `assignments` WHERE `challenge_id` = '1' AND `assignment` = 'x'",
      );
    });

    it("escapes single quotes in the display SQL value", () => {
      const out = buildDeleteRow(mysqlEm, "users", [
        { column: "name", value: "O'Hara" },
      ]);
      expect(out.params).toEqual(["O'Hara"]);
      expect(out.displaySql).toBe(
        "DELETE FROM `users` WHERE `name` = 'O''Hara'",
      );
    });

    it("emits unquoted numeric values when column type is numeric", () => {
      const out = buildDeleteRow(mysqlEm, "users", [
        { column: "id", value: "42", type: "int" },
      ]);
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe("DELETE FROM `users` WHERE `id` = 42");
    });

    it("treats bigint, decimal, etc. as numeric", () => {
      const out = buildDeleteRow(mysqlEm, "t", [
        { column: "a", value: "1", type: "bigint" },
        { column: "b", value: "2.5", type: "decimal(10,2)" },
      ]);
      expect(out.displaySql).toBe(
        "DELETE FROM `t` WHERE `a` = 1 AND `b` = 2.5",
      );
    });

    it("falls back to quoted string for non-numeric types and missing type", () => {
      const out = buildDeleteRow(mysqlEm, "t", [
        { column: "a", value: "x", type: "varchar(255)" },
        { column: "b", value: "y" },
      ]);
      expect(out.displaySql).toBe(
        "DELETE FROM `t` WHERE `a` = 'x' AND `b` = 'y'",
      );
    });

    it("emits IS NULL for null-valued where clauses (no placeholder)", () => {
      const out = buildDeleteRow(mysqlEm, "users", [
        { column: "id", value: "1", type: "int" },
        { column: "deleted_at", value: null, type: "datetime" },
      ]);
      expect(out.sql).toBe(
        "DELETE FROM `users` WHERE `id` = ? AND `deleted_at` IS NULL",
      );
      expect(out.params).toEqual(["1"]);
      expect(out.displaySql).toBe(
        "DELETE FROM `users` WHERE `id` = 1 AND `deleted_at` IS NULL",
      );
    });

    it("emits TRUE/FALSE (unquoted) for boolean column types", () => {
      const out = buildDeleteRow(mysqlEm, "users", [
        { column: "active", value: "true", type: "boolean" },
      ]);
      expect(out.params).toEqual(["true"]);
      expect(out.displaySql).toBe("DELETE FROM `users` WHERE `active` = TRUE");
    });

    it("treats '1' as TRUE and '0' as FALSE for boolean types", () => {
      const out = buildDeleteRow(mysqlEm, "t", [
        { column: "a", value: "1", type: "bool" },
        { column: "b", value: "0", type: "boolean" },
      ]);
      expect(out.displaySql).toBe(
        "DELETE FROM `t` WHERE `a` = TRUE AND `b` = FALSE",
      );
    });

    it("throws when no where clauses are provided", () => {
      expect(() => buildDeleteRow(mysqlEm, "users", [])).toThrow(
        /at least one where clause/,
      );
    });
  });

  describe("postgres", () => {
    it("emits a single-PK delete with $1 placeholder and qualified table", () => {
      const out = buildDeleteRow(pgEm, "public.users", [
        { column: "id", value: "42" },
      ]);
      expect(out.sql).toBe('DELETE FROM "public"."users" WHERE "id" = $1');
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "id" = '42'`,
      );
    });

    it("emits a composite-PK delete with $1, $2, ... AND-joined", () => {
      const out = buildDeleteRow(pgEm, "public.assignments", [
        { column: "challenge_id", value: "1" },
        { column: "assignment", value: "x" },
      ]);
      expect(out.sql).toBe(
        'DELETE FROM "public"."assignments" WHERE "challenge_id" = $1 AND "assignment" = $2',
      );
      expect(out.params).toEqual(["1", "x"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."assignments" WHERE "challenge_id" = '1' AND "assignment" = 'x'`,
      );
    });

    it("uses the supplied schema (non-public)", () => {
      const out = buildDeleteRow(pgEm, "analytics.events", [
        { column: "id", value: "1" },
      ]);
      expect(out.sql).toBe('DELETE FROM "analytics"."events" WHERE "id" = $1');
    });

    it("emits an unqualified table when no schema is in target", () => {
      const out = buildDeleteRow(pgEm, "users", [{ column: "id", value: "1" }]);
      expect(out.sql).toBe('DELETE FROM "users" WHERE "id" = $1');
    });

    it("escapes single quotes in the display SQL value", () => {
      const out = buildDeleteRow(pgEm, "public.users", [
        { column: "name", value: "O'Hara" },
      ]);
      expect(out.params).toEqual(["O'Hara"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "name" = 'O''Hara'`,
      );
    });

    it("emits unquoted numeric values when column type is numeric", () => {
      const out = buildDeleteRow(pgEm, "public.users", [
        { column: "id", value: "42", type: "int" },
      ]);
      expect(out.params).toEqual(["42"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "id" = 42`,
      );
    });

    it("emits IS NULL for null-valued where clauses (no placeholder)", () => {
      const out = buildDeleteRow(pgEm, "public.users", [
        { column: "id", value: "1", type: "int" },
        { column: "deleted_at", value: null, type: "timestamp" },
      ]);
      expect(out.sql).toBe(
        'DELETE FROM "public"."users" WHERE "id" = $1 AND "deleted_at" IS NULL',
      );
      expect(out.params).toEqual(["1"]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "id" = 1 AND "deleted_at" IS NULL`,
      );
    });

    it("emits TRUE/FALSE (unquoted) for boolean column types", () => {
      const out = buildDeleteRow(pgEm, "public.users", [
        { column: "active", value: "true", type: "boolean" },
      ]);
      expect(out.displaySql).toBe(
        `DELETE FROM "public"."users" WHERE "active" = TRUE`,
      );
    });

    it("throws when no where clauses are provided", () => {
      expect(() => buildDeleteRow(pgEm, "public.users", [])).toThrow(
        /at least one where clause/,
      );
    });
  });
});
