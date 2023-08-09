import { jsonb, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename", { length: 255 }).notNull(),
  inputHash: varchar("input_hash", { length: 64 }).notNull(),
});

export const documentSources = pgTable("document_sources", {
  documentId: uuid("document_id")
    .primaryKey()
    .references(() => documents.id, {
      onDelete: "cascade",
      onUpdate: "restrict",
    }),
  content: text("content").notNull(),
});

export const documentResults = pgTable("document_results", {
  documentId: uuid("document_id")
    .primaryKey()
    .references(() => documents.id, {
      onDelete: "cascade",
      onUpdate: "restrict",
    }),
  result: jsonb("result").notNull(),
});
