"use client";

import React from "react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";

const DocumentTableSkeleton: React.FC = () => {
	return (
		<div>
			<Title title="Uploads" />

			{/* Search Skeleton */}
			<div className="mb-6">
				<div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
			</div>

			{/* Table Skeleton */}
			<div
				className="rounded-lg border overflow-hidden"
				style={{
					backgroundColor: "var(--card)",
					borderColor: "var(--border)",
				}}
			>
				<div className="overflow-x-auto">
					<table
						className="w-full"
						style={{
							color: "var(--card-foreground)",
						}}
					>
						<thead
							style={{
								backgroundColor: "var(--muted)",
								borderBottomColor: "var(--border)",
							}}
						>
							<tr>
								{["Doctor", "Specialty", "Upload Date", "Status", "Action"].map(
									(header) => (
										<th
											key={header}
											className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
											style={{
												color: "var(--muted-foreground)",
											}}
										>
											{header}
										</th>
									)
								)}
							</tr>
						</thead>

						<tbody className="divide-y divide-[var(--border)]">
							{[1, 2, 3, 4, 5, 6].map((index) => (
								<tr
									key={index}
									style={{ backgroundColor: "var(--card)" }}
									className="animate-pulse"
								>
									{/* Doctor Name Skeleton */}
									<td className="px-6 py-4">
										<div className="h-4 bg-gray-200 rounded w-32"></div>
									</td>

									{/* Specialty Skeleton */}
									<td className="px-6 py-4">
										<div className="h-4 bg-gray-200 rounded w-24"></div>
									</td>

									{/* Upload Date Skeleton */}
									<td className="px-6 py-4">
										<div className="h-4 bg-gray-200 rounded w-28"></div>
									</td>

									{/* Status Skeleton */}
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center space-x-2">
											<div className="w-4 h-4 bg-gray-200 rounded"></div>
											<div className="h-6 bg-gray-200 rounded-full w-20"></div>
										</div>
									</td>

									{/* Action Skeleton */}
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="h-4 bg-gray-200 rounded w-24"></div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination Skeleton */}
			<div className="mt-6 flex items-center justify-between">
				<div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
				<div className="flex space-x-2">
					<div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
					<div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
				</div>
			</div>
		</div>
	);
};

export default DocumentTableSkeleton;

