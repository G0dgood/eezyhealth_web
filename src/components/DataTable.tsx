"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T = unknown> {
  key: string;
  label: string;
  render?: (value: string | number, row: T) => React.ReactNode;
}

interface DataTableProps<T = unknown> {
  columns: Column<T>[];
  data: T[];
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
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onPrevious}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors cursor-pointer">
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors cursor-pointer">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
