import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";

import { db } from "~/db/drizzle.server";
import { documents, documentSources } from "~/db/schema.server";

type CreateDocumentInput = {
  content: string;
  filename: string;
};

export async function listDocuments() {
  return await db.query.documents.findMany({
    columns: {
      id: true,
      filename: true,
      createdAt: true,
    },
  });
}

export async function getDocument(id: string) {
  return await db.query.documents.findFirst({
    where: eq(documents.id, id),
    columns: {
      id: true,
      filename: true,
      createdAt: true,
      inputHash: true,
    },
  });
}

export async function createAndProcessDocument(input: CreateDocumentInput) {
  return await db.transaction(async (tx) => {
    const document = (
      await tx
        .insert(documents)
        .values({
          filename: input.filename,
          inputHash: generateHash(input.content),
        })
        .returning()
    )[0];

    await tx
      .insert(documentSources)
      .values({
        content: input.content,
        documentId: document.id,
      })
      .returning();

    return document;
  });
}
function generateHash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
