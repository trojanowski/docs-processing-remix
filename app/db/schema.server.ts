import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename", { length: 255 }).notNull(),
  inputHash: varchar("input_hash", { length: 64 }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentSources = pgTable("document_sources", {
  documentId: uuid("document_id")
    .primaryKey()
    .references(() => documents.id, {
      onDelete: "cascade",
      onUpdate: "restrict",
    }),
  content: text("content").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentResults = pgTable("document_results", {
  documentId: uuid("document_id")
    .primaryKey()
    .references(() => documents.id, {
      onDelete: "cascade",
      onUpdate: "restrict",
    }),
  result: jsonb("result").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
