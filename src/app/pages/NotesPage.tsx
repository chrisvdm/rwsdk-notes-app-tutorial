import { get } from "http";
import { postNotes, allNotes } from "../notes/actions"; // import the action
import Counter from "@/app/components/Counter";
import { getAllUsers } from "../users/actions";

export async function NotesPage({user}: {user:any}) {
  // Server component: fetch your data here (e.g., D1 query)
  //const notes = allNotes;
    const notes = await allNotes(user.id)
    console.log(notes)
  return (
    <>
      <h1>Notes</h1>
      <Counter />
      <form action={postNotes}>
        <input name="title" required placeholder="Title..." /> <br/>
        <textarea name="content" required placeholder="Write a note..." /> <br/>
        <button type="submit">Add</button>
      </form>
      <ul>
        {notes.map((n) => <li key={n.id}>{n.content}</li>)}
      </ul>
    </>
  );
}