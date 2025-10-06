import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";
import { type migrations } from "@/db/migrations";

export type AppDatabase = Database<typeof migrations>;
export type User = AppDatabase["users"];
export type Post = AppDatabase["notes"];

export const db = createDb<AppDatabase>(
  env.APP_DURABLE_OBJECT as any,
  "main-database" // unique key for this database instance
);