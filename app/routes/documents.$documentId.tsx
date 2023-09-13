import type { LoaderArgs } from "@remix-run/node";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { z } from "zod";

import { TimeAgo } from "~/components/time-ago";
import { getDocument } from "~/models/documents.server";

const ParamsSchema = z.object({
  documentId: z.string().uuid(),
});

export async function loader({ params }: LoaderArgs) {
  const parsedParams = ParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    throw new Response("Incorrect document id", { status: 404 });
  }

  const document = await getDocument(parsedParams.data.documentId);
  if (!document) {
    throw new Response("No document found", { status: 404 });
  }

  return { document };
}

export default function Document() {
  const { document } = useLoaderData<typeof loader>();

  return (
    <>
      <header>
        <Link to="/">← Show all documents</Link>
      </header>
      <main>
        <h1>Document details</h1>

        <table>
          <tbody>
            <tr>
              <th>ID</th>
              <td>{document.id}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>
                <TimeAgo date={document.createdAt} />
              </td>
            </tr>
            <tr>
              <th>Filename</th>
              <td>{document.filename}</td>
            </tr>
            <tr>
              <th>Input file hash</th>
              <td>{document.inputHash}</td>
            </tr>
            {document.processedAt ? (
              <tr>
                <th>Processed at</th>
                <td>
                  <TimeAgo date={document.processedAt} />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        {document.processedAt ? (
          <a href={`/documents/${document.id}/result`}>Get result</a>
        ) : null}
      </main>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }

  throw error;
}
