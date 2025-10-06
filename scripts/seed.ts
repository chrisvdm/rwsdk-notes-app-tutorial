
import { defineScript } from "rwsdk/worker";
import { db } from "@/db/db";

export default defineScript(async () => {
  // clean out the database
  await db.deleteFrom("users").execute();

  // set the initial sources
  // create some users
  await db
    .insertInto("users")
    .values([
      { id: "u_123", username: "John", createdAt: new Date().toISOString() },
      { id: "u_456", username: "Sue", createdAt: new Date().toISOString() },
      { id: "u_789", username: "Thandi", createdAt: new Date().toISOString() },
    ])
    .execute();

  console.log("🌱 Finished seeding");
});