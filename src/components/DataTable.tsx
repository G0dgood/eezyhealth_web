"use client";

import { TableColumn } from "@/types";
import Pagination from "./Pagination";

interface DataTableProps<T = unknown> {
  columns: TableColumn<T>[];
  data?: T[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  itemLabel?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}

export default function DataTable<T = unknown>({
  columns,
  data,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 10,
  itemLabel = "items",
  onPageChange,
  onPageSizeChange,
  onPrevious,
  onNext,
  className = "",
}: DataTableProps<T>) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-lg  ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
            {data?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-[var(--muted)] transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap  text-[10px]  md:text-[12px] text-[var(--foreground)]">
                    {(() => {
                      const cell = (row as Record<string, unknown>)[column.key];
                      const display =
                        typeof cell === "number" ? cell : String(cell);
                      return column.render
                        ? column.render(display, row)
                        : display;
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        {(totalCount > 0 || totalPages > 1) && (
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount || totalPages * pageSize}
            pageSize={pageSize}
            onPageChange={onPageChange || ((page) => {
              if (page > currentPage && onNext) onNext();
              if (page < currentPage && onPrevious) onPrevious();
            })}
            onPageSizeChange={onPageSizeChange}
            itemLabel={itemLabel}
            className="mt-4"
          />
        )}
      </div>

    </div>
  );
}
