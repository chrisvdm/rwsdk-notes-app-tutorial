import { NOTES } from "../notes/store";
import { postNotes } from "../notes/actions"; // import the action
import Counter from "@/app/components/Counter";

export async function NotesPage() {
  // Server component: fetch your data here (e.g., D1 query)
  const notes = NOTES;
  return (
    <>
      <h1>Notes</h1>
      <Counter />
      <form action={postNotes}>
        <input name="text" placeholder="Write a note…" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {notes.map((n) => <li key={n.id}>{n.text}</li>)}
      </ul>
    </>
  );
}