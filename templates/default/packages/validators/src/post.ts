import z from "zod/v4";

export const ZPost = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  likes: z.number(),
});

export type IPost = z.infer<typeof ZPost>;
