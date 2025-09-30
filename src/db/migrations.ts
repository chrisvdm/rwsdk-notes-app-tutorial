import { type Migrations } from "rwsdk/db";

export const migrations = {
  "001_initial_schema": {
    async up(db) {
      return [

        await db.schema
          .createTable("users")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("username", "text", (col) => col.notNull().unique())
          .addColumn("createdAt", "text", (col) => col.notNull())
          .execute(),

        await db.schema
          .createTable("notes")
          .addColumn("id", "text", (col) => col.primaryKey())
          .addColumn("userId", "text", (col) =>
            col.notNull().references("users.id").onDelete("cascade")
          )
          .addColumn("title", "text", (col) => col.notNull())
          .addColumn("content", "text")
          .execute(),
      ];
    },

    async down(db) {
      await db.schema.dropTable("notes").execute();
    },
  },
} satisfies Migrations;