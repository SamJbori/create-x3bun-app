import type { TRPCProcedures } from "../_index";

let id = 1;
export const postRouter = (p: TRPCProcedures) => ({
	getPost: p.publicProcedure.query(() => ({
		id: id++,
		title: "Greatness",
		body: "With Bun + React + Hono + tRPC, comes great responsibility",
		likes: 999,
	})),
});
