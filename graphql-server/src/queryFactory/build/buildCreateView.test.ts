import { DataSource, EntityManager } from "typeorm";
import { buildCreateView } from "./buildCreateView";

const mysqlEm = new EntityManager(
  new DataSource({ type: "mysql", host: "", database: "" }),
);
const pgEm = new EntityManager(
  new DataSource({ type: "postgres", host: "", database: "" }),
);

describe("buildCreateView", () => {
  describe("mysql", () => {
    it("emits CREATE VIEW with backtick name and queryString as-is", () => {
      const out = buildCreateView(mysqlEm, "active_users", "SELECT * FROM users WHERE active = TRUE");
      expect(out.sql).toBe(
        "CREATE VIEW `active_users` AS SELECT * FROM users WHERE active = TRUE",
      );
      expect(out.params).toEqual([]);
      expect(out.displaySql).toBe(out.sql);
    });
  });

  describe("postgres", () => {
    it("emits CREATE VIEW with double-quoted, schema-qualified name", () => {
      const out = buildCreateView(
        pgEm,
        "public.active_users",
        "SELECT * FROM users WHERE active = TRUE",
      );
      expect(out.sql).toBe(
        'CREATE VIEW "public"."active_users" AS SELECT * FROM users WHERE active = TRUE',
      );
      expect(out.displaySql).toBe(out.sql);
    });

    it("uses the supplied schema (non-public)", () => {
      const out = buildCreateView(
        pgEm,
        "analytics.daily_events",
        "SELECT date, count(*) FROM events GROUP BY date",
      );
      expect(out.sql).toBe(
        'CREATE VIEW "analytics"."daily_events" AS SELECT date, count(*) FROM events GROUP BY date',
      );
    });

    it("emits an unqualified name when no schema is in target", () => {
      const out = buildCreateView(pgEm, "active_users", "SELECT 1");
      expect(out.sql).toBe('CREATE VIEW "active_users" AS SELECT 1');
    });
  });
});
