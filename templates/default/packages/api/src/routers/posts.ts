import type { TRPCProcedures } from "../libs/trpc";

export const postRouter = (p: TRPCProcedures) => ({
  getPost: p.publicProcedure.query(() => ({
    id: "1",
    title: "Greatness",
    body: "With Bun + NextJS + Hono + tRPC, comes great responsibility",
    likes: 999,
  })),
});
