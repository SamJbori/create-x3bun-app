import type { DBCollections, DBCollectionsTypes } from "@x3bun/validators/db";
import type { MongoClient, ObjectId } from "mongodb";
import { DBCollectionStore } from "@x3bun/validators/db";

export const dbCollection = <T extends DBCollections>(
  dbClient: MongoClient,
  collection: T,
) => {
  /**
   * Based on the collection, direct the collection to use the correct db
   */
  const db = dbClient.db(DBCollectionStore[collection]);

  return db.collection<Omit<DBCollectionsTypes[T], "id">>(collection);
};

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
