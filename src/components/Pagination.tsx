"use client";

import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import clsx from "clsx";

interface PaginationProps {
	currentPage: number;
	totalCount: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	className?: string;
	itemLabel?: string;
}

export default function Pagination({
	currentPage,
	totalCount,
	pageSize,
	onPageChange,
	className,
	itemLabel = "items",
}: PaginationProps) {
	const totalPages = Math.ceil(totalCount / pageSize);
	const startItem = (currentPage - 1) * pageSize + 1;

	if (totalCount === 0) return null;

	// Generate page numbers
	const getPageNumbers = () => {
		const pages = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			if (currentPage <= 4) {
				pages.push(1, 2, 3, 4, 5, "...", totalPages);
			} else if (currentPage >= totalPages - 3) {
				pages.push(
					1,
					"...",
					totalPages - 4,
					totalPages - 3,
					totalPages - 2,
					totalPages - 1,
					totalPages,
				);
			} else {
				pages.push(
					1,
					"...",
					currentPage - 1,
					currentPage,
					currentPage + 1,
					"...",
					totalPages,
				);
			}
		}
		return pages;
	};

	return (
		<div
			className={clsx(
				"flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 px-5 py-3",
				className,
			)}
		>
			<div className="text-xs font-medium text-gray-900">
				Showing {startItem} of {totalCount} {itemLabel}
			</div>
			<div className="flex items-center border border-gray-300 rounded-lg">
				<button
					className="flex items-center gap-1 px-2 py-2 rounded-l-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={currentPage === 1}
					onClick={() => onPageChange(currentPage - 1)}
				>
					<FiArrowLeft className="h-3 w-3" />
					Previous
				</button>

				<div className="flex items-center">
					{getPageNumbers().map((page, index) =>
						typeof page === "number" ? (
							<button
								key={index}
								onClick={() => onPageChange(page)}
								className={clsx(
									"h-8 w-7 text-xs font-medium transition-colors border-x border-gray-300",
									currentPage === page
										? "bg-gray-50 text-gray-900"
										: "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
								)}
							>
								{page}
							</button>
						) : (
							<span key={index} className="px-2 text-[10px] md:text-[12px] text-gray-500">
								...
							</span>
						),
					)}
				</div>

				<button
					className="flex items-center gap-1 px-2 py-2 rounded-r-lg text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={currentPage === totalPages}
					onClick={() => onPageChange(currentPage + 1)}
				>
					Next
					<FiArrowRight className="h-3 w-3" />
				</button>
			</div>
		</div>
	);
}