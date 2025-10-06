// src/worker.tsx
import { defineApp } from "rwsdk/worker";
import { route, render } from "rwsdk/router";
import { Document } from "@/app/Document";

import { hasUsers, seedUsers } from "@/app/users/actions"

export { SessionDurableObject, AppDurableObject } from "@/db/durableObject"

import { NotesPage } from "@/app/pages/NotesPage";

let SEED_USERS = false;

// Example "session" middleware
async function sessionMiddleware({ ctx }: { ctx: any }) {
  // (In the standard starter, sessions are Durable-Object backed.)
  // For demo, fake a userId. Replace with your real session lookup.
  ctx.session = { userId: "u_123" };
}

// hydrate ctx.user from session
async function getUserMiddleware({ ctx }: { ctx: any }) {
  if (ctx.session?.userId) {
    // Replace with your DB call
    ctx.user = { id: ctx.session.userId, username: "john" };
  }
}

// Per-route Interrupter
function requireAuth({ ctx }: { ctx: any }) {
  if (!ctx.user) return new Response("Unauthorized", { status: 401 });
}


export default defineApp([
    // Global middleware run first
  sessionMiddleware,
  getUserMiddleware,
  async () => {
    if (!SEED_USERS) {
      const hasUsersResult = await hasUsers();
        if (!hasUsersResult) {
        seedUsers();
      } 
      SEED_USERS = true
    }
    return; // continue request
  },
  render(Document, [
    route("/", () => <p>Home (public)</p>),
    route("/ping", () => <p>Pong (public)</p>),

    // Protected route demonstrates Interrupter short-circuit
    // You can pass the context to your response
    route("/me", [requireAuth, ({ ctx }: { ctx: any }) => <p>Hello {ctx.user.username} user page</p>]),
    route("/notes", ({ ctx }: { ctx: any }) => <NotesPage user={ctx.user} />), 
  ]),
]);