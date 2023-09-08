import type { SerializeFrom, V2_MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import TimeAgo from "react-timeago";
import { ClientOnly } from "remix-utils";

import { listDocuments } from "~/models/documents.server";

export async function loader() {
  const documents = await listDocuments();
  return { documents };
}

type Document = SerializeFrom<
  Awaited<ReturnType<typeof loader>>["documents"][0]
>;

export const meta: V2_MetaFunction = () => {
  return [{ title: "Document processing with Remix" }];
};

export default function Index() {
  const { documents } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>List of documents</h1>
      <p>
        <Link className="button" to="/upload">
          Upload a document
        </Link>
      </p>
      {documents.length ? (
        <DocumentsTable documents={documents} />
      ) : (
        <p>No documents found.</p>
      )}
    </div>
  );
}

function DocumentsTable({ documents }: { documents: Document[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Filename</th>
          <th>Created at</th>
          <th>Processed at</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>
              <Link to={`/documents/${document.id}`}>{document.id}</Link>
            </td>
            <td>{document.filename}</td>
            <td>
              <ClientOnly>
                {() => <TimeAgo date={document.createdAt} />}
              </ClientOnly>
            </td>
            <td>
              <ClientOnly>
                {() =>
                  document.processedAt ? (
                    <TimeAgo date={document.processedAt} />
                  ) : null
                }
              </ClientOnly>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
