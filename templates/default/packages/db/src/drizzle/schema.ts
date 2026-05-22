import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const TicketsTable = pgTable("tickets", {
	id: uuid("id").primaryKey().defaultRandom(),
	line: varchar("line", { length: 12 }).notNull(),
	number: integer("number").notNull(),
});

export const LinesTable = pgTable("lines", {
	id: uuid("id").primaryKey().defaultRandom(),
	line: varchar("line", { length: 12 }).notNull(),
	tickets: integer("tickets").notNull(),
});
