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

### **The 3 Xs**

- **Backednd** - **[Hono](https://hono.dev/)**\
  A lightweight, high-performance **backend framework** designed for speed and
  simplicity, providing a faster and more efficient alternative to
  **[Express.js](https://expressjs.com/)**, especially in edge and serverless
  environments.

- **FrontEnd** - **[VITE](https://vite.dev/)**\
  A modern **[React](https://react.dev/)** framework for building fast, scalable
  web applications, enhanced with **[Tailwind CSS](https://tailwindcss.com/)**
  for efficient and consistent UI development.

- **Mobile** - **[Expo](https://expo.dev/)**\
  A powerful **[React Native framework](https://reactnative.dev/)** used to
  build high-quality, cross-platform **mobile applications** from a single
  codebase.

---

### **Packages**

- **Authentication**\
  Implemented using **[Better Auth](https://better-auth.com/)** to provide
  secure and flexible authentication flows.

- **API**\
  Built with **[tRPC](https://trpc.io/)**, enabling a fully type-safe RPC-based
  API with end-to-end TypeScript inference.

- **State Management**\
  Powered by **[React Query](https://tanstack.com/query/latest)** for efficient
  server-state management, caching, and synchronization.

- **Database**\
  **NoSQL** has come a long way in terms of performance, and I use it almost
  exclusively in new projects—especially while the data shape is still evolving.
  Since everyone seems to be using **[Prisma](https://www.prisma.io/)** or
  **[Drizzle](https://orm.drizzle.team/)** with/or
  **[PostgreSQL](https://www.postgresql.org/)** these days, I decided to go with
  **[MongoDB](https://www.mongodb.com/)** instead just to show some diversity
  and show how I make **NoSQL** fun again with my technique to typesafe my
  collections. That said, you’re free to use
  **[Prisma](https://www.prisma.io/)**,
  **[Drizzle](https://orm.drizzle.team/)**, or
  **[Bun’s native SQL driver](https://bun.com/docs/runtime/sql)** if that’s more
  your thing, I've already included **[Drizzle](https://orm.drizzle.team/)**
  with **[PostgreSQL](https://www.postgresql.org/)** package using
  **[Bun’s native SQL driver](https://bun.com/docs/runtime/sql)**.

- **Storage**\
  Uses
  **[S3-compatible storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)**,
  ensuring compatibility with a wide range of cloud and self-hosted storage
  providers.

- **[TypeScript](https://www.typescriptlang.org/)** Because you should!\
  I opted in for
  **[Typescript 6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)**
  in preperation to **[Typescript 7]()**, TypeScript 7 revolutionized the
  ecosystem by rewriting its compiler in Go, making builds and type-checking up
  to 10x faster. It preserves all semantic correctness while bringing massive
  performance and parallelization benefits, ending the historical trade-off
  between build speed and type safety, see this blog
  **[Progress on TypeScript 7](https://devblogs.microsoft.com/typescript/progress-on-typescript-7-december-2025/)**.

---

### **Tooling**

- **[Biome](https://biomejs.dev/)**\
  Format, Lint, Fast, Powerful, and simple. But if you enjoy pain, just delete
  the one `biome.json` file and have fun.

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
bun run dev
```

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
much as possible, finally after much consideration I decided to go with
something Taylor Swift never had, **[Bun](https://bun.sh/)**. Next I decided not
to use **[Next](https://nextjs.org/)** ~~on the backend~~ at all and use
**[Hono](https://hono.dev/)** instead for the BackEnd. It’s lighter, simpler,
and far less troublesome to run on
**[Cloudflare Workers](https://workers.cloudflare.com/)** or any other
cloud/enviornment. For the web frontend, I ~~kept
**[NextJS](https://nextjs.org/)**~~ decided to go with
**[VITE](https://vite.dev/)** and
**[Tanstack Router](https://tanstack.com/router/latest)**, I don't like to
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

### ** _Make No Mistake_ This is a Work In Progress...**

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
		<img src="https://contrib.rocks/image?repo=SamJbori/create-x3bun-app" alt="A table of avatars from the project's contributors"/>
	</p>
</a>

<p align="center">
  Made with <a rel="noopener noreferrer" target="_blank" href="https://contrib.rocks">contrib.rocks</a>
</p>
