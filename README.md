# X3Bun Starter

<h1 align="center">
  create-x3bun-app
</h1>

An opinionated **[Turbo](https://turborepo.com/)** high-performance build system
_(mono repo)_ template for high-performance apps, designed to use
**[Bun](https://bun.sh/)**

### **Runtime**

Due to its high performance and excellent developer experience, this stack is
built **exclusively on [Bun](https://bun.sh/)**.\
All tooling, scripts, and runtime assumptions are designed to work with
**[Bun](https://bun.sh/)** and are not intended to be used with
**[NodeJS](https://nodejs.org/)**.

---

### **Usage**

Create a new project using the interactive CLI:

```bash
# Create a new X3Bun app
bun create x3bun-app <ProjectName>

# Remember to populate `.env` properly, use `.env.example` as a reference
# Run VS Code into the project folder
code <ProjectName>

# or
cd <ProjectName>
cp .env.example .env
code .env # Edit
bun run dev
```
---

### **The 3 Xs**

- **Backednd** - **[Hono](https://hono.dev/)**\
  A lightweight, high-performance **backend framework** designed for speed and
  simplicity, providing a faster and more efficient alternative to
  **[Express.js](https://expressjs.com/)**, especially in edge and serverless
  environments.

- **FrontEnd** - **[VITE](https://vite.dev/)** and **[TanStack Start](https://tanstack.com/start/latest)**\
  A modern **[React](https://react.dev/)** framework for building fast, scalable
  web applications, enhanced with **[Tailwind CSS](https://tailwindcss.com/)**
  for efficient and consistent UI development.

- **Mobile** - **[Expo](https://expo.dev/)** (( **_In Progress_** ))\
  A powerful **[React Native framework](https://reactnative.dev/)** used to
  build high-quality, cross-platform **mobile applications** from a single
  codebase.

---

### **Packages**

- **Authentication**\
  Implemented using **[Better Auth](https://better-auth.com/)** to provide
  secure and flexible authentication flows.\
  In order to support certain cross-site cookies sharing SSL must be enabled in **[Hono](https://hono.dev/)**, phone number authentication is configured by default, password will log from console

  ```typescript
  # /packages/auth/src/auth.ts

  // Modify this function to integrate you SMS provider
  export const getAuthPromise = () =>
  initAuth({
    otpSend: async (data) => {
      // SMS sending logic
      console.log(data);
    },
    domain: env.DOMAIN_NAME,
  });
  ```
  Request originated from the `web` app will be sent to `/api/auth` which will be proxied/redirected to the backend, this will simplify cross site auth integration, if you are not planning on using redirects service like `Cloudflare`, uncomment this line

  ```typescript
  # /apps/web/src/lib/auth-client.ts

  export const authClient = createAuthClient({
    //   baseURL: "env.X3BUN_BE_URL", // Uncomment this for direct
    basePath: "/api/auth",
    plugins: [inferAdditionalFields<Auth>(), phoneNumberClient()],
    fetchOptions: {
      credentials: "include",
    },
  });
  ```

- **API**\
  Built with **[tRPC](https://trpc.io/)**, enabling a fully type-safe RPC-based
  API with end-to-end TypeScript inference.\
  just like `auth` requests are `proxied`, to undo this replace the url with `env.X3BUN_BE_URL`

  ```typescript
  # /apps/web/src/components/providers/root-provider.ts

  function getUrl() {
    const base = (() => {
      if (typeof window !== "undefined") return "";
      return `http://localhost:${3000}`; // replace with env.X3BUN_BE_URL for unproxied access
    })();
    return `${base}/api/v0.1`;
  }

  ```

- **State Management**\
  Powered by **[React Query](https://tanstack.com/query/latest)** for efficient
  server-state management, caching, and synchronization.

- **Database**\
  **NoSQL** has come a long way in terms of performance, and I use it almost
  exclusively in new projects—especially while the data shape is still evolving. I opted in with
  **[MongoDB](https://www.mongodb.com/)** where I created my own attempt to typesafe the collection operations.\
  The `database` package consumes the `validators` package exported `DBCollectionsType` interface and export 3 methods\
  1. `dbCollections(mongodbClient: MongoClient)`: returns an object containing all the collections with typesafty where you can do you `CRUD`, for example `db.Post.find({})`
  2. `fromDBToSingle(record: MongoDBRecord)`: serialize the `_id` to a `id: string` in a single record.
  3. `fromDBToMany(record: MongoDBRecord[])`: serialize the `_id` to a `id: string` in an array of records.

- **Storage**\
  Uses
  **[S3-compatible storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)**,
  ensuring compatibility with a wide range of cloud and self-hosted storage
  providers.\
  export a single `storage` object driven from the `Bun.S3`.

- **Validators**\
  Implemented using **[Zod](https://zod.dev/)**, `src` folder is structured to have `index.ts` file as the the database source of truth for all it's collections types, new collections types can be added to the `Collections` interface and consumed by other packages an applications.

- **[TypeScript](https://www.typescriptlang.org/)** Because you should!\
  **[Typescript 7](<>)** revolutionized the
  ecosystem by rewriting its compiler in Go, making builds and type-checking up
  to 10x faster. It preserves all semantic correctness while bringing massive
  performance and parallelization benefits, ending the historical trade-off
  between build speed and type safety.

---

### **Tooling**

- **[Biome](https://biomejs.dev/)**\
  Format, Lint, Fast, Powerful, and simple. But if you enjoy pain, just delete
  the one `biome.json` file and have fun.

---

### **So... what is ~~`create-t3-app`~~ `create-x3bun-app`? A template?**

Inspired by `create-t3-app`, this is a CLI—but unlike it, it’s built by a
_not-so-seasoned_ dev (three-letter abbreviations are more than I deserve 😊).

While the **[T3 Stack](https://create.t3.gg/)** is a great template that I’ve
used frequently, I found it a bit too geared toward
**[NextJS](https://nextjs.org/)** for my taste, and missing what I consider a
core component: **mobile**.

I’m a firm believer that **[PWA](https://web.dev/explore/progressive-web-apps)**
are the future of mobile development—once the iFamily catches up to the 21st
century (they were busy adding a calculator app). Until then, we’re stuck
maintaining a separate mobile codebase… or are we?

So here we are: another template, another CLI, another day.

### The process of selecting certain technologies

First, Serverless computing and CPU Time billing encouraged me to evaluate and
compare between the current runtimes available seeking performance, efficiency,
and my dev deep dark _freeloader_ desire not to upgrade from **free tier** as
long as possible, finally after much consideration I decided to go with
something Taylor Swift never had, **[Bun](https://bun.sh/)**. Next I decided not
to use **[Next](https://nextjs.org/)** ~~on the backend~~ at all and use
**[Hono](https://hono.dev/)** instead for the BackEnd. It’s lighter, simpler,
and far less troublesome to run on
**[Cloudflare Workers](https://workers.cloudflare.com/)** or any other
cloud/enviornment. For the web frontend, I ~~kept
**[NextJS](https://nextjs.org/)**~~ decided to go with
**[VITE](https://vite.dev/)** and
**[Tanstack Start](https://tanstack.com/start/latest)**, I don't like to
complain about things I can't do better, but again I lived in the US for a
while, so **[NextJS](https://nextjs.org/)** is a limiting problemetic solution
for me. I learned alot using it, but just like an exciting but a toxic
relationship, at some point we had to part away.
**[Tanstack Router](https://tanstack.com/router/latest)** solved many of my
eternal issues with **[NextJS](https://nextjs.org/)**, like headers control,
caching RSC, and strong dependancy on **[Vercel](https:///vercel.com)**.
**[Tailwind CSS](https://tailwindcss.com/)** was (arguably) a no-brainer for the
web so it's baked-in from the start.

For mobile, I chose **[Expo](https://expo.dev/)
([React Native](https://reactnative.dev/))**. I’m not fully sold on using
Tailwind outside the web so I didn't include it in my mobile codebase, but I
_do_ like using Expo as a glorified/customized web browser when possible—this is
especially useful for **SSR/ISR** scenarios. Needless to say,
**[Expo](https://expo.dev/)** is far more capable, so use it as you see fit.

**Mono Repo** was the only way to move forward with such project, and after
toying and trying other ways to mange the nightmare called _Mono Repo_ that
promised _Single Codebase_ but delivered so many package resolutions issues, I
gave up my dreams of finding a hidden gem and hailed with the crowds to
**[Turbo Repo](https://turborepo.dev/)**.

Needless to say, **“opinionated”** feels like a fair characterization of this
project.

### ** _Make No Mistake_ This is a Work In Progress... **

All development work is inherently a **Work in Progress**, this CLI and the
template are no exception, _contributions_ and _sponserships_ are **welcomed**
and **encouraged**, I personally plan to use this CLI for every Web and Mobile
project I work on and thus I am planning on **rigorously** maintaining it. Below
The States of the **3Xs**

- **Backend** - Minimal Update to the template codebase may be applied, package
  version updates will be applied as needed.
- **FrontEnd** - Minimal Update to the template codebase may be applied, package
  version updates will be applied as needed.
- **Mobile** - In Progress

**Packages** - Minimal Update to the template codebase may be applied, package
version updates will be applied as needed.

**Tooling** - Minimal Update to the template codebase may be applied, package
version updates will be applied as needed.

### **Contributors**

<a href="https://github.com/SamJbori/create-x3bun-app/graphs/contributors" align="center">
	<p align="center">
		<img src="https://contrib.rocks/image?repo=SamJbori/create-x3bun-app" alt="A table of avatars from the project's contributors" align="center"/>
	</p>
</a>

<p align="center">
  Made with <a rel="noopener noreferrer" target="_blank" href="https://contrib.rocks">contrib.rocks</a>
</p>
