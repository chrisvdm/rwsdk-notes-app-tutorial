"use server";

import { requestInfo } from "rwsdk/worker";
import { db } from "@/db/db";

// import { NOTES } from "@/app/notes/store";

export const postNotes = async (FormData: FormData) => {
    const form = FormData
    const {ctx} : { ctx: any } = requestInfo
    const userId = ctx.user.id

    // Get form data and sanitise
    const title = String(form.get("title") || "").trim();
    const content = String(form.get("content") || "").trim();

    // Validate
    if (title && content) {
        const note = {
            id: crypto.randomUUID(),
            userId: userId,
            title: String(form.get('title') || ""),
            content: String(form.get('content') || ""),
        };
        console.log(note)
        await db.insertInto("notes").values(note).execute();
    }
}

export const allNotes = (userId: string) => {
    return db
    .selectFrom("notes")
    .select([
        "notes.id",
        "notes.title",
        "notes.content"
    ])
    .where("notes.userId", "=", userId )
    .execute(); // execute returns a promise no need for extra "awaits" or "asyncs"
} 