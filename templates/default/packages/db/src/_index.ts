import type { Collections, DBCollections } from "@x3bun/validators";
import { DBCollectionStore } from "@x3bun/validators";
import type { MongoClient, ObjectId } from "mongodb";

export type { Db, MongoClient } from "mongodb";
export { getDBClientPromise } from "./db";

const dbCollection = <T extends DBCollections>(
  dbClient: MongoClient,
  collection: T,
) => {
  /**
   * Based on the collection, direct the collection to use the correct db
   */
  const db = dbClient.db(DBCollectionStore[collection]);

  return db.collection<Omit<Collections[T], "id">>(collection);
};

export const dbCollections = (dbClient: MongoClient) => {
  return Object.fromEntries(
    (Object.keys(DBCollectionStore) as DBCollections[]).map((collection) => [
      collection,
      dbCollection(dbClient, collection),
    ]),
  ) as {
    [K in DBCollections]: ReturnType<typeof dbCollection<K>>;
  };
};

/**
 * Normolize the MongoDB object into a serializable object
 * @param doc
 * @returns
 */
export const fromDBToSingle = <T extends { _id: ObjectId }>(
  doc: T,
): Omit<T, "_id"> & { id: string } => {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
  };
};

export const fromDBToMany = <T extends { _id: ObjectId }>(
  docs: T[],
): (Omit<T, "_id"> & { id: string })[] => {
  return docs.map(fromDBToSingle);
};
