
# X3Bun Starter

<h1 align="center">
  create-x3bun-app
</h1>

An opinionated template for high performance apps, build to use **[Bun](https://bun.sh/)**

### **Runtime**

Due to its high performance and excellent developer experience, this stack is built **exclusively on [Bun](https://bun.sh/)**.  
All tooling, scripts, and runtime assumptions are designed to work with **Bun** and are not intended to be used with Node.js.

---

### **The 3 Xs**

- **[Expo](https://expo.dev/)**  
  A powerful **React Native framework** used to build high-quality, cross-platform **mobile applications** from a single codebase.

- **[Next.js](https://nextjs.org/)**  
  A modern **React framework** for building fast, scalable **web applications**, enhanced with **[Tailwind CSS](https://tailwindcss.com/)** for efficient and consistent UI development.

- **[Hono](https://hono.dev/)**  
  A lightweight, high-performance **backend framework** designed for speed and simplicity, providing a faster and more efficient alternative to **[Express.js](https://expressjs.com/)**, especially in edge and serverless environments.

---

### **Packages**

- **Authentication**  
  Implemented using **[Better Auth](https://better-auth.com/)** to provide secure and flexible authentication flows.

- **API**  
  Built with **[tRPC](https://trpc.io/)**, enabling a fully type-safe RPC-based API with end-to-end TypeScript inference.

- **State Management**  
  Powered by **[React Query](https://tanstack.com/query/latest)** for efficient server-state management, caching, and synchronization.

- **Database**  
  **NoSQL** has come a long way in terms of performance, and I use it almost exclusively in new projects—especially while the data shape is still evolving. Since everyone seems to be using **[Prisma](https://www.prisma.io/)** or **[Drizzle](https://orm.drizzle.team/)** with/or **[PostgreSQL](https://www.postgresql.org/)** these days, I decided to go with **[MongoDB](https://www.mongodb.com/)** instead just to show some diversity and show how I make **NoSQL** fun again. That said, you’re free to use **Prisma**, **Drizzle**, or **Bun’s native PostgreSQL driver** if that’s more your thing, finding resources on how to do that won't be hard.


- **Storage**  
  Uses **[S3-compatible storage](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)**, ensuring compatibility with a wide range of cloud and self-hosted storage providers.

- **TypeScript**  
  Because you should!

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

Inspired by `create-t3-app`, this is a CLI—but unlike it, it’s built by a *not-so-seasoned* dev (three-letter abbreviations are more than I deserve 😊).

While the **T3 Stack** is a great template that I’ve used frequently, I found it a bit too geared toward **Next.js** for my taste, and missing what I consider a core component: **mobile**.

I’m a firm believer that **PWAs** are the future of mobile development—once the iFamily catches up to the 21st century (they were busy adding a calculator app). Until then, we’re stuck maintaining a separate mobile codebase… or are we?

So here we are: another template, another CLI, another day.

First, Serverless computing and CPU Time billing encouraged me to evaluate and compare between the current runtimes available seeking performance and efficiency, finally after much consideration I decided to go with something Taylor Swift never had, **Bun**. Next I decided not to use **[Next](https://nextjs.org/) on the backend** and use **[Hono](https://hono.dev/)** instead. It’s lighter, simpler, and far less troublesome to run on **Cloudflare Workers** or any other cloud/enviornment.
For the web frontend, I kept **Next.js**, while keeping an eye on **TanStack Start**. **Tailwind CSS** was (arguably) a no-brainer for the web so it's baked-in from the start.

For mobile, I chose **[Expo](https://expo.dev/) ([React Native](https://reactnative.dev/))**. I’m not fully sold on using Tailwind outside the web so I didn't include it in my mobile codebase, but I *do* like using Expo as a glorified web browser—this is especially useful for **SSR/ISR** scenarios. Needless to say, **Expo** is far more capable,  so use it as you see fit.

Needless to say, **“opinionated”** feels like a fair characterization of this project.


### **Contributors**
<a href="https://github.com/SamJbori/create-x3bun-app/graphs/contributors" align="center">
	<p align="center">
		<img src="https://contrib.rocks/image?repo=SamJbori/create-x3bun-app" alt="A table of avatars from the project's contributors"/>
	</p>
</a>

<p align="center">
  Made with <a rel="noopener noreferrer" target="_blank" href="https://contrib.rocks">contrib.rocks</a>
</p>