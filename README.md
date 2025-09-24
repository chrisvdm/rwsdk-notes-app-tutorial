# rwsdk Tutorial - Ping Notes

Let's build a quick notes app to give you the lay of the land when working with rwsdk. 

Hopefully you will see rwsdk core beliefs in action:

	- **Server-first by default.** Routes can return a classic Response or JSX that renders on the server (RSC) and streams to the client—no special folders needed.  ￼
	- **Explicit routing in one place.** You define routes in src/worker.tsx with route(...)—no file-system magic. Patterns support static/param/wildcard.  ￼
	- **Middleware + Context you control.** Populate ctx up front (e.g., session, user, db), and every route/action sees it. You can also add Interrupters per-route (mini middleware chains) to short-circuit flow (e.g., auth).  ￼
	- **Custom HTML shell per route.** Use render(Document, [...routes]) to pick the HTML “document” per set of routes; you own <html>, scripts, hydration strategy.  ￼
	- **Cloudflare-native.** Ships as a Vite plugin targeting Workers; deploy with one command; D1/R2/Queues/DOs are first-class.  ￼

  **Prerequisites**

  You will need a few things before we get started: 

  - [Node.js v22](https://nodejs.org/en/download/) or later
  - [Cloudflare](https://www.cloudflare.com/en-gb/plans/) account
  - Basic web development knowledge

  ## 1. Create a new app
  ```terminal 
    npx create-rwsdk ping-notes
    cd ping-notes
    pnpm install
    pnpm dev
  ```
  Open http://localhost:5173 and you’ll see the starter. The entry is src/worker.tsx.

  ## 2. Your first two routes: Response vs JSX

  Open `src/worker.tsx` and add a classic text route and a JSX route side by side:
  
  ```js
  // src/worker.tsx
    import { defineApp } from "rwsdk/worker";
    import { route, render } from "rwsdk/router";
    import { Document } from "@/app/Document";

    export default defineApp([
      render(Document, [
        route("/", () => new Response("Hello, World!")),          // returns Response
        route("/ping", () => <h1>Pong!</h1>),                     // returns JSX (RSC)
      ]),
    ]);
  ```
  
  Now visit / and /ping. Notice how routes are just functions—no API/filesystem coupling.  ￼

  **Key difference vs Next.js/Remix:** You’re not learning a folder convention; you’re writing the router you mean. Returns can be Response or JSX in the same surface.

  ## 3. Add middleware and context (session → user)

  Let’s pretend we have a session middleware that populates ctx.session, then hydrate ctx.user for downstream routes. If unauthenticated, we’ll block with an Interrupter on a protected route.

  ```js
    // src/worker.tsx
    import { defineApp } from "rwsdk/worker";
    import { route, render } from "rwsdk/router";
    import { Document } from "@/app/Document";

    export { SessionDurableObject } from "@/session/durableObject"

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
        ctx.user = { id: ctx.session.userId, username: "chris" };
      }
    }

    // Per-route Interrupter
    function requireAuth({ ctx }: { ctx: any }) {
      if (!ctx.user) return new Response("Unauthorized", { status: 401 });
    }

    export default defineApp([
      // Global middleware running first before routing
      sessionMiddleware,
      getUserMiddleware,

      render(Document, [
        route("/", () => <p>Home (public)</p>),
        route("/ping", () => <p>Pong (public)</p>),

        // Protected route demonstrates Interrupter short-circuit 
        // You can pass the context to your response
        route("/me", [requireAuth, ({ ctx }: { ctx: any }) => <p>Hello {ctx.user.username} user page</p>]),
      ]),
    ]);
  ```

  Interrupters run before your handler for the **matched** route; returning a Response halts the chain. Middleware runs before routing and is where you shape ctx for the request.

  ## 4. Render through a custom Document (you own the HTML)

  Let's take a look at our Document file that renders your app HTML shell. We are going to change it so that it shows the right title and add a little navigation to make moving between pages easier. Later you can create your own navigation component.
  
  ```js
  // src/app/Document.tsx
  export const Document: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>rwsdk tutorial - Ping Notes</title>
      </head>
      <body>
        <header><a href="/">Home</a> · <a href="/ping">Ping</a> · <a href="/me">Me</a></header>
        <div id="root">{children}</div>
        <script>import("/src/client.tsx")</script>
      </body>
    </html>
  );

  ```

  ## 5. A tiny “Notes” page: RSC data + a form POST

  We’ll show a realistic, server-first flow: render notes and accept a form submission on the same route.

  > Use D1 if you like—the binding guide is in [Database(D1)](https://docs.rwsdk.com/core/database/)—but to keep the tutorial copy-pastable, we’ll use an in-memory array. Swap the reads/writes for your D1 calls later.

  Create a demo store for notes in-memory array:

  ```ts
    // src/app/notes/store.ts (temporary demo storage)
    export const NOTES: { id: number; text: string }[] = [{ id: 1, text: "First note" }];
  ```

  Create an action for processing form data:

  ```ts
  // src/app/actions.ts
  "use server";
  import { NOTES } from "@/app/notes/store";

  export const postNotes = (FormData: FormData) => {
      const form = FormData
      const text = String(form.get("text") || "").trim();
      if (text) {
          NOTES.push({ id: Date.now(), text });
      }
  }
  ```

  Create a Notes page for creating and rendering the notes from our store:

  ```ts
    // src/app/pages/NotesPage.tsx (server component)
    import { NOTES } from "../notes/store";
    import { postNotes } from "../notes/actions"; // import the action

    export async function NotesPage() {
      // Server component: fetch your data here (e.g., D1 query)
      const notes = NOTES;
      return (
        <>
          <h1>Notes</h1>
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
  ```

  Wire the route to render JSX:

  ```js
    // src/worker.tsx (add below your existing routes)
    import { NotesPage } from "@/app/pages/NotesPage";
    import { NOTES } from "@/app/notes/store";

    export default defineApp([
      sessionMiddleware,
      getUserMiddleware,

      render(Document, [
        // ...previous routes

        route("/notes", () => <NotesPage />),
      ]),
    ]);
  ```

  **Protecting page and/or action (optional):**
  - To **gate the page**, wrap with requireAuth Interrupter:
    ```ts
      route("/notes", [requireAuth, () => <NotesPage />]),
    ```
  - To **gate the action**, add a check inside postNotes (replace with your real logic):
    ```ts
      // src/app/actions.ts
      "use server";

      import { NOTES } from "@/app/notes/store";

      function assertAuthed() {
        // TODO: replace with your project’s ctx/auth wiring for actions
        const isAuthed = true;
        if (!isAuthed) throw new Error("Unauthorized");
      }

      export const postNotes = (formData: FormData) => {
        assertAuthed();
        const text = String(formData.get("text") || "").trim();
        if (text) NOTES.push({ id: Date.now(), text });
      };
    ```
## 6. Add a tiny client island

  If you need interactivity, mark a component with "use client", import it, and drop it into your server JSX.

  Create a "client-side" component:
  ```ts
    // src/app/components/Counter.tsx
    "use client";

    import { useState } from "react";
    export default function Counter() {
      const [n, setN] = useState(0);
      return <button onClick={() => setN(v => v + 1)}>Clicks: {n}</button>;
    }
  ```
  Import and use the new Counter component
  ```ts
  // src/app/pages/NotesPage.tsx (use it)
  import Counter from "@/app/components/Counter";
  // ...
  export async function NotesPage() {
    const notes = NOTES;
    return (
      <>
        <h1>Notes</h1>
        <Counter />
        <form action={postNotes}>
          <input name="text" placeholder="Write a note…" />
          <button type="submit">Add</button>
        </form>
        <ul>{notes.map((n) => <li key={n.id}>{n.text}</li>)}</ul>
      </>
    );
  }
```

  Keep most UI as **server components**; hydrate only the islands that need it.

  ## 7. Deploy when ready

  This will open up Cloudflare in your browser to log in and grant permissions. Go back to your terminal when that's done.

  ```
    pnpm run release
  ```

  ## 8. Mental model (cheat-sheet)

  - **One surface for pages & endpoints**: routes can return **JSX or Response** — mix as needed.
	- **Forms prefer Server Actions**: ergonomic server mutations without wiring explicit POST branches.
	- **Context you own**: ctx shaped in middleware; read in routes and actions.
	- **Documents**: define your HTML wrapper per route group with render(Document, [...]).
	- **Cloudflare-friendly**: deploys like a Worker; D1/DO integrate without ceremony.

## Next Steps

So now that you have the basics down you can try doing the following usng the [docs](https://docs.rwsdk.com/):

  - Replace the in-memory NOTES with D1 (bind DB in wrangler.jsonc, query in your server code).
	- Add realtime with Durable Objects + WebSockets so new notes broadcast instantly.
	- Split your app into multiple render(Document, [...]) clusters if you want different shells per section.

