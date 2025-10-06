"use server";

import { requestInfo } from "rwsdk/worker";
import { db } from "@/db/db";


const seedUsers = async () => {
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
}

const getAllUsers = () => {
  return db
    .selectFrom("users")
    .select([
      "users.id",
      "users.username",
      "users.createdAt"
    ])
    .execute(); // execute returns a promise no need for extra "awaits" or "asyncs"
}

const hasUsers = async () => {
    const users = await getAllUsers
    return users.length > 0
}

export { seedUsers, getAllUsers, hasUsers }