CREATE TABLE IF NOT EXISTS "document_results" (
	"document_id" uuid PRIMARY KEY NOT NULL,
	"result" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_sources" (
	"document_id" uuid PRIMARY KEY NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" varchar(255) NOT NULL,
	"input_hash" varchar(64) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_results" ADD CONSTRAINT "document_results_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_sources" ADD CONSTRAINT "document_sources_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
