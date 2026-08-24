import * as React from "react";
import {
  TableWrap as UITableWrap,
  Table as UITable,
  THead,
  TH,
  TR,
  TD,
} from "@/components/ui/table";

/*
  Convenience wrappers so table-heavy screens can pass columns/rows as data.
  Thin adapters over the ui/table primitives — no new styling.
*/

export function TableWrap({ children }: { children: React.ReactNode }) {
  return <UITableWrap>{children}</UITableWrap>;
}

export function Table({
  head,
  children,
}: {
  head: React.ReactNode[];
  children: React.ReactNode;
}) {
  return (
    <UITable>
      <THead>
        <TR>
          {head.map((h, i) => (
            <TH key={i}>{h}</TH>
          ))}
        </TR>
      </THead>
      <tbody>{children}</tbody>
    </UITable>
  );
}

export interface RowData {
  key: string;
  cells: React.ReactNode[];
}

export function TBodyRows({ rows }: { rows: RowData[] }) {
  return (
    <>
      {rows.map((row) => (
        <TR key={row.key}>
          {row.cells.map((cell, i) => (
            <TD key={i}>{cell}</TD>
          ))}
        </TR>
      ))}
    </>
  );
}
