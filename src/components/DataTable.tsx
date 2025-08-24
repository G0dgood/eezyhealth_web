"use client";

import { TableColumn } from "@/types";

interface DataTableProps<T = unknown> {
  columns: TableColumn<T>[];
  data?: T[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}

export default function DataTable<T = unknown>({
  columns,
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onPrevious,
  onNext,
  className = "",
}: DataTableProps<T>) {
  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm ${className}`}>
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
                    className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                    {column.render
                      ? column.render(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (row as Record<string, any>)[column.key],
                          row
                        )
                      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (row as Record<string, any>)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-[var(--card)] px-6 py-3 border-t border-[var(--border)] flex items-center justify-between">
          <div className="text-sm text-[var(--muted-foreground)]">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onPrevious}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent)] transition-colors cursor-pointer">
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-colors cursor-pointer">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
