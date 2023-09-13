import TimeAgoBase from "react-timeago";
import { ClientOnly } from "remix-utils";

export function TimeAgo({ date }: { date: string }) {
  return <ClientOnly>{() => <TimeAgoBase date={date} />}</ClientOnly>;
}
