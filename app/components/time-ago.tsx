import TimeAgoBase from "react-timeago";

import { ClientOnly } from "./client-only";

export function TimeAgo({ date }: { date: string }) {
  return <ClientOnly>{() => <TimeAgoBase date={date} />}</ClientOnly>;
}
