import type { IPost } from "./post";

/** Different Database Names used by different services */
export const dbNames = { main: "main", auth: "auth" };

/** Type the databases */
export interface Collections {
  Posts: IPost;
}

export type DBCollections = keyof Collections;

/** Map Collection to DB */
export const DBCollectionStore: Record<DBCollections, keyof typeof dbNames> = {
  Posts: "main",
};
