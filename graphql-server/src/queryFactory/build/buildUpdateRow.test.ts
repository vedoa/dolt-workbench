import { DataSource, EntityManager } from "typeorm";
import { buildUpdateRow } from "./buildUpdateRow";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildUpdateRow", () => {
  describe("mysql", () => {
    it("emits a single-column update with SET and WHERE placeholders in order", () => {
      const out = buildUpdateRow(
        mysqlEm,
        "users",
        [{ column: "name", value: "alice" }],
        [{ column: "id", value: "1", type: "int" }],
      );
      expect(out.sql).toBe("UPDATE `users` SET `name` = ? WHERE `id` = ?");
      expect(out.params).toEqual(["alice", "1"]);
      expect(out.displaySql).toBe(
        "UPDATE `users` SET `name` = 'alice' WHERE `id` = 1",
      );
    });

    it("emits SET col = NULL inline (no placeholder)", () => {
      const out = buildUpdateRow(
        mysqlEm,
        "users",
        [{ column: "deleted_at", value: null, type: "datetime" }],
        [{ column: "id", value: "1", type: "int" }],
      );
      expect(out.sql).toBe(
        "UPDATE `users` SET `deleted_at` = NULL WHERE `id` = ?",
      );
      expect(out.params).toEqual(["1"]);
      expect(out.displaySql).toBe(
        "UPDATE `users` SET `deleted_at` = NULL WHERE `id` = 1",
      );
    });

    it("emits IS NULL in WHERE clauses for null match", () => {
      const out = buildUpdateRow(
        mysqlEm,
        "users",
        [{ column: "name", value: "alice" }],
        [{ column: "deleted_at", value: null, type: "datetime" }],
      );
      expect(out.sql).toBe(
        "UPDATE `users` SET `name` = ? WHERE `deleted_at` IS NULL",
      );
      expect(out.params).toEqual(["alice"]);
      expect(out.displaySql).toBe(
        "UPDATE `users` SET `name` = 'alice' WHERE `deleted_at` IS NULL",
      );
    });

    it("emits multi-column SET and composite WHERE", () => {
      const out = buildUpdateRow(
        mysqlEm,
        "users",
        [
          { column: "name", value: "alice", type: "varchar(255)" },
          { column: "age", value: "30", type: "int" },
        ],
        [
          { column: "tenant_id", value: "5", type: "int" },
          { column: "id", value: "1", type: "int" },
        ],
      );
      expect(out.sql).toBe(
        "UPDATE `users` SET `name` = ?, `age` = ? WHERE `tenant_id` = ? AND `id` = ?",
      );
      expect(out.params).toEqual(["alice", "30", "5", "1"]);
      expect(out.displaySql).toBe(
        "UPDATE `users` SET `name` = 'alice', `age` = 30 WHERE `tenant_id` = 5 AND `id` = 1",
      );
    });

    it("escapes single quotes in display SQL for SET and WHERE values", () => {
      const out = buildUpdateRow(
        mysqlEm,
        "users",
        [{ column: "name", value: "O'Hara" }],
        [{ column: "old_name", value: "O'Brien" }],
      );
      expect(out.displaySql).toBe(
        "UPDATE `users` SET `name` = 'O''Hara' WHERE `old_name` = 'O''Brien'",
      );
    });

    it("emits TRUE/FALSE for boolean column types in display SQL", () => {
      const out = buildUpdateRow(
        mysqlEm,
        "users",
        [{ column: "active", value: "true", type: "boolean" }],
        [{ column: "id", value: "1", type: "int" }],
      );
      expect(out.displaySql).toBe(
        "UPDATE `users` SET `active` = TRUE WHERE `id` = 1",
      );
    });

    it("throws when no set clauses are provided", () => {
      expect(() =>
        buildUpdateRow(mysqlEm, "users", [], [{ column: "id", value: "1" }]),
      ).toThrow(/at least one set clause/);
    });

    it("throws when no where clauses are provided", () => {
      expect(() =>
        buildUpdateRow(
          mysqlEm,
          "users",
          [{ column: "name", value: "alice" }],
          [],
        ),
      ).toThrow(/at least one where clause/);
    });
  });

  describe("postgres", () => {
    it("emits a single-column update with $1, $2 placeholders and qualified table", () => {
      const out = buildUpdateRow(
        pgEm,
        "public.users",
        [{ column: "name", value: "alice" }],
        [{ column: "id", value: "1", type: "int" }],
      );
      expect(out.sql).toBe(
        'UPDATE "public"."users" SET "name" = $1 WHERE "id" = $2',
      );
      expect(out.params).toEqual(["alice", "1"]);
      expect(out.displaySql).toBe(
        `UPDATE "public"."users" SET "name" = 'alice' WHERE "id" = 1`,
      );
    });

    it("emits SET col = NULL inline (no placeholder)", () => {
      const out = buildUpdateRow(
        pgEm,
        "public.users",
        [{ column: "deleted_at", value: null, type: "timestamp" }],
        [{ column: "id", value: "1", type: "int" }],
      );
      expect(out.sql).toBe(
        'UPDATE "public"."users" SET "deleted_at" = NULL WHERE "id" = $1',
      );
      expect(out.params).toEqual(["1"]);
      expect(out.displaySql).toBe(
        `UPDATE "public"."users" SET "deleted_at" = NULL WHERE "id" = 1`,
      );
    });

    it("emits IS NULL in WHERE clauses for null match", () => {
      const out = buildUpdateRow(
        pgEm,
        "public.users",
        [{ column: "name", value: "alice" }],
        [{ column: "deleted_at", value: null, type: "timestamp" }],
      );
      expect(out.sql).toBe(
        'UPDATE "public"."users" SET "name" = $1 WHERE "deleted_at" IS NULL',
      );
      expect(out.params).toEqual(["alice"]);
      expect(out.displaySql).toBe(
        `UPDATE "public"."users" SET "name" = 'alice' WHERE "deleted_at" IS NULL`,
      );
    });

    it("emits multi-column SET and composite WHERE", () => {
      const out = buildUpdateRow(
        pgEm,
        "public.users",
        [
          { column: "name", value: "alice", type: "text" },
          { column: "age", value: "30", type: "int" },
        ],
        [
          { column: "tenant_id", value: "5", type: "int" },
          { column: "id", value: "1", type: "int" },
        ],
      );
      expect(out.sql).toBe(
        'UPDATE "public"."users" SET "name" = $1, "age" = $2 WHERE "tenant_id" = $3 AND "id" = $4',
      );
      expect(out.params).toEqual(["alice", "30", "5", "1"]);
      expect(out.displaySql).toBe(
        `UPDATE "public"."users" SET "name" = 'alice', "age" = 30 WHERE "tenant_id" = 5 AND "id" = 1`,
      );
    });

    it("uses the supplied schema (non-public)", () => {
      const out = buildUpdateRow(
        pgEm,
        "analytics.events",
        [{ column: "name", value: "x" }],
        [{ column: "id", value: "1" }],
      );
      expect(out.sql).toBe(
        'UPDATE "analytics"."events" SET "name" = $1 WHERE "id" = $2',
      );
    });

    it("escapes single quotes in display SQL for SET and WHERE values", () => {
      const out = buildUpdateRow(
        pgEm,
        "public.users",
        [{ column: "name", value: "O'Hara" }],
        [{ column: "old_name", value: "O'Brien" }],
      );
      expect(out.displaySql).toBe(
        `UPDATE "public"."users" SET "name" = 'O''Hara' WHERE "old_name" = 'O''Brien'`,
      );
    });

    it("emits TRUE/FALSE for boolean column types in display SQL", () => {
      const out = buildUpdateRow(
        pgEm,
        "public.users",
        [{ column: "active", value: "true", type: "boolean" }],
        [{ column: "id", value: "1", type: "int" }],
      );
      expect(out.displaySql).toBe(
        `UPDATE "public"."users" SET "active" = TRUE WHERE "id" = 1`,
      );
    });

    it("throws when no set clauses are provided", () => {
      expect(() =>
        buildUpdateRow(
          pgEm,
          "public.users",
          [],
          [{ column: "id", value: "1" }],
        ),
      ).toThrow(/at least one set clause/);
    });

    it("throws when no where clauses are provided", () => {
      expect(() =>
        buildUpdateRow(
          pgEm,
          "public.users",
          [{ column: "name", value: "alice" }],
          [],
        ),
      ).toThrow(/at least one where clause/);
    });
  });
});
