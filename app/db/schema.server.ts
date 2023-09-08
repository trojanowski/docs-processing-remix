import {
  customType,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// A workaround until https://github.com/drizzle-team/drizzle-orm/issues/724
// is fixed.
export const customJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: TData }>({
    dataType() {
      return "jsonb";
    },
    toDriver(val: TData): TData {
      return val;
    },
    fromDriver(value): TData {
      if (typeof value === "string") {
        try {
          return JSON.parse(value) as TData;
        } catch {}
      }
      return value as TData;
    },
  })(name);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: varchar("filename", { length: 255 }).notNull(),
  inputHash: varchar("input_hash", { length: 64 }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  processingError: text("processing_error"),
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
  result: customJsonb("result").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
