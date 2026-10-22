import React from "react";
import { Loader2 } from "lucide-react";

export function Table({
  className = "",
  wrapperClassName = "",
  stickyHeader = false,
  loading = false,
  empty = false,
  emptyMessage = "No records found.",
  children,
  ...props
}) {
  return (
    <div className={`relative w-full overflow-auto rounded-lg border border-border bg-card shadow-sm ${wrapperClassName}`}>
      <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
        {children}
      </table>

      {loading && (
        <div className="flex items-center justify-center p-8 bg-card/60 backdrop-blur-xs">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-sm font-medium text-muted-foreground">Loading data...</span>
        </div>
      )}

      {!loading && empty && (
        <div className="flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export function TableHeader({ className = "", children, sticky = false, ...props }) {
  return (
    <thead
      className={`border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
        sticky ? "sticky top-0 z-10 backdrop-blur-sm" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }) {
  return (
    <tbody className={`divide-y divide-border/60 ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableFooter({ className = "", children, ...props }) {
  return (
    <tfoot className={`border-t border-border bg-muted/50 font-medium ${className}`} {...props}>
      {children}
    </tfoot>
  );
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr
      className={`transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th
      className={`h-10 px-4 text-left align-middle font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }) {
  return (
    <td
      className={`p-4 align-middle text-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableCaption({ className = "", children, ...props }) {
  return (
    <caption className={`mt-4 text-xs text-muted-foreground ${className}`} {...props}>
      {children}
    </caption>
  );
}

export default Table;
