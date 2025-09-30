import { postNotes, allNotes } from "../notes/actions"; // import the action
import Counter from "@/app/components/Counter";

export async function NotesPage({user}: {user:any}) {
  // Server component: fetch your data here (e.g., D1 query)
  //const notes = allNotes;
    const notes = await allNotes(user.id)
  return (
    <>
      <h1>Notes</h1>
      <Counter />
      <form action={postNotes}>
        <input name="title" placeholder="Title..." /> <br/>
        <textarea name="content" placeholder="Write a note..." /> <br/>
        <button type="submit">Add</button>
      </form>
      <ul>
        {notes.map((n) => <li key={n.id}>{n.content}</li>)}
      </ul>
    </>
  );
}