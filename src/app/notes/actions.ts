"use server";

import { NOTES } from "@/app/notes/store";

export const postNotes = (FormData: FormData) => {
    const form = FormData
    const text = String(form.get("text") || "").trim();
    if (text) {
        NOTES.push({ id: Date.now(), text });
    }
}