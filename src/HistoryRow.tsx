import type {HistoryRecord} from "./history.ts";
import { useState} from "react";

function formatRecord(record: HistoryRecord): JSX.Element {
  return <div className="flex justify-between">
    <span>${record.from} ${record.amount}</span>
    <span>→</span>
    <span>${record.to} ${record.result} </span>
  </div>
}

function HistoryRow({ record, selected }: { record: HistoryRecord; selected: boolean }) {
  const [label] = useState(() => formatRecord(record))

  return (
    <li
      data-testid="history-item"
      aria-selected={selected}
      className={selected ? 'font-bold text-violet-600' : 'font-normal'}
    >
      {label}
    </li>
  )
}
export default HistoryRow;
