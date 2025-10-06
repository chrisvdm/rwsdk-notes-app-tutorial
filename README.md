# rwsdk Tutorial - Ping Notes

This is a multi-part tutorial. The aim is to get familiar with the best parts of rwsdk so we can build something solid, fast. As this is being written theres no telling what this tutorial app will look like at the end of its journey. 

Hopefully we will see rwsdk core beliefs in action:

- **Server-first by default.** Routes can return a classic Response or JSX that renders on the server (RSC) and streams to the client—no special folders needed.  ￼
- **Explicit routing in one place.** We define routes in src/worker.tsx with route(...)—no file-system magic. Patterns support static/param/wildcard.  ￼
- **Middleware + Context you control.** Populate ctx up front (e.g., session, user, db), and every route/action sees it. We can also add Interrupters per-route (mini middleware chains) to short-circuit flow (e.g., auth).  ￼
- **Custom HTML shell per route.** Use render(Document, [...routes]) to pick the HTML “document” per set of routes; we own <html>, scripts, hydration strategy.  ￼
- **Cloudflare-native.** Ships as a Vite plugin targeting Workers; deploy with one command; D1/R2/Queues/DOs are first-class.  ￼

**Prerequisites**

We will need a few things before we get started: 

- [Node.js v22](https://nodejs.org/en/download/) or later
- [Cloudflare](https://www.cloudflare.com/en-gb/plans/) account
- Basic web development knowledge


## Index

- [**Part 1 – Ping Notes**](./PART1.md) Build a simple notes app to learn rwsdk fundamentals — routing, middleware, context, and server actions.
- [**Part 2 – Durable Objects**](./PART2.md) Add persistence with Cloudflare Durable Objects and Kysely, turning your notes into stored data.