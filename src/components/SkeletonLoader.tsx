"use client";

interface SkeletonProps {
	className?: string;
	children?: React.ReactNode;
}

// Base skeleton element
const Skeleton = ({ className = "", children }: SkeletonProps) => (
	<div className={`bg-gray-200 animate-pulse ${className}`}>
		{children}
	</div>
);

// Profile skeleton components
export const ProfilePictureSkeleton = () => (
	<div className="text-center">
		<Skeleton className="w-32 h-32 rounded-full mx-auto" />
		<Skeleton className="w-16 h-4 rounded mx-auto mt-2" />
	</div>
);

export const FormFieldSkeleton = ({ count = 8 }: { count?: number }) => (
	<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
		{Array.from({ length: count }).map((_, i) => (
			<div key={i}>
				<Skeleton className="w-20 h-4 rounded mb-2" />
				<Skeleton className="w-full h-10 rounded" />
			</div>
		))}
	</div>
);

export const BioSkeleton = () => (
	<div>
		<Skeleton className="w-16 h-4 rounded mb-2" />
		<Skeleton className="w-full h-24 rounded" />
	</div>
);

export const ActionButtonsSkeleton = () => (
	<div className="flex justify-end space-x-3">
		<Skeleton className="w-20 h-10 rounded" />
		<Skeleton className="w-16 h-10 rounded" />
	</div>
);

// Notification skeleton components
export const NotificationItemSkeleton = ({ count = 4 }: { count?: number }) => (
	<div className="space-y-4">
		{Array.from({ length: count }).map((_, i) => (
			<div
				key={i}
				className="flex items-center justify-between py-4 border-b border-gray-200">
				<div className="flex-1 pr-4">
					<Skeleton className="w-48 h-5 rounded mb-2" />
					<Skeleton className="w-64 h-4 rounded" />
				</div>
				<Skeleton className="w-12 h-6 rounded-full" />
			</div>
		))}
	</div>
);

export const NotificationSaveButtonSkeleton = () => (
	<div className="flex justify-end">
		<Skeleton className="w-32 h-10 rounded" />
	</div>
);

// Security skeleton components
export const SecuritySectionSkeleton = () => (
	<div className="space-y-6">
		<div>
			<Skeleton className="w-48 h-6 rounded mb-2" />
			<Skeleton className="w-80 h-4 rounded" />
		</div>

		{Array.from({ length: 2 }).map((_, i) => (
			<div
				key={i}
				className="flex items-center justify-between py-4 border-b border-gray-200">
				<div className="flex-1">
					<Skeleton className="w-32 h-5 rounded mb-2" />
					<Skeleton className="w-48 h-4 rounded" />
				</div>
				<Skeleton className="w-20 h-10 rounded" />
			</div>
		))}
	</div>
);

export const PasswordFormSkeleton = () => (
	<div className="space-y-6">
		<div>
			<Skeleton className="w-40 h-6 rounded mb-2" />
			<Skeleton className="w-72 h-4 rounded" />
		</div>

		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i}>
					<Skeleton className="w-32 h-4 rounded mb-2" />
					<Skeleton className="w-full h-10 rounded" />
				</div>
			))}
		</div>

		<div className="flex justify-end space-x-3">
			<Skeleton className="w-20 h-10 rounded" />
			<Skeleton className="w-32 h-10 rounded" />
		</div>
	</div>
);

export const SecuritySaveButtonSkeleton = () => (
	<div className="flex justify-end">
		<Skeleton className="w-28 h-10 rounded" />
	</div>
);

// Tab skeleton components
export const TabNavigationSkeleton = ({ tabCount = 3 }: { tabCount?: number }) => (
	<div className="border-b border-gray-200">
		<nav className="flex space-x-8 px-6">
			{Array.from({ length: tabCount }).map((_, i) => (
				<div key={i} className="py-4 px-1">
					<Skeleton className="w-32 h-5 rounded" />
				</div>
			))}
		</nav>
	</div>
);

export const TabContentSkeleton = ({ children }: { children: React.ReactNode }) => (
	<div className="p-6">
		{children}
	</div>
);

// Page-level skeleton components
export const BreadcrumbSkeleton = () => (
	<div className="mb-6">
		<div className="flex items-center space-x-2">
			<Skeleton className="h-4 w-16 rounded" />
			<Skeleton className="h-4 w-4 rounded" />
			<Skeleton className="h-4 w-20 rounded" />
		</div>
	</div>
);

export const PageHeaderSkeleton = () => (
	<div className="mb-8">
		<Skeleton className="h-8 w-32 rounded mb-2" />
		<Skeleton className="h-4 w-96 rounded" />
	</div>
);

// Complete skeleton layouts
export const ProfileSkeleton = () => (
	<div className="space-y-6">
		<ProfilePictureSkeleton />
		<FormFieldSkeleton />
		<BioSkeleton />
		<ActionButtonsSkeleton />
	</div>
);

export const NotificationSkeleton = () => (
	<div className="space-y-6">
		<NotificationItemSkeleton />
		<NotificationSaveButtonSkeleton />
	</div>
);

export const SecuritySkeleton = () => (
	<div className="space-y-8">
		<SecuritySectionSkeleton />
		<PasswordFormSkeleton />
		<SecuritySaveButtonSkeleton />
	</div>
);

export const TabSkeleton = ({
	activeTab,
	tabCount = 3
}: {
	activeTab: string;
	tabCount?: number;
}) => (
	<div className="bg-white border border-gray-200 rounded-lg shadow-sm">
		<TabNavigationSkeleton tabCount={tabCount} />
		<TabContentSkeleton>
			{activeTab === "profile" && <ProfileSkeleton />}
			{activeTab === "notifications" && <NotificationSkeleton />}
			{activeTab === "security" && <SecuritySkeleton />}
		</TabContentSkeleton>
	</div>
);

export const PageSkeleton = ({ activeTab }: { activeTab: string }) => (
	<div>
		<BreadcrumbSkeleton />
		<PageHeaderSkeleton />
		<TabSkeleton activeTab={activeTab} />
	</div>
);

// Generic skeleton components for reuse
export const CardSkeleton = ({ className = "" }: { className?: string }) => (
	<div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>
		<Skeleton className="w-48 h-6 rounded mb-4" />
		<div className="space-y-3">
			<Skeleton className="w-full h-4 rounded" />
			<Skeleton className="w-3/4 h-4 rounded" />
			<Skeleton className="w-1/2 h-4 rounded" />
		</div>
	</div>
);

export const ListSkeleton = ({
	itemCount = 5,
	className = ""
}: {
	itemCount?: number;
	className?: string;
}) => (
	<div className={`space-y-4 ${className}`}>
		{Array.from({ length: itemCount }).map((_, i) => (
			<div key={i} className="flex items-center space-x-4">
				<Skeleton className="w-10 h-10 rounded-full" />
				<div className="flex-1 space-y-2">
					<Skeleton className="w-1/4 h-4 rounded" />
					<Skeleton className="w-1/2 h-3 rounded" />
				</div>
				<Skeleton className="w-16 h-8 rounded" />
			</div>
		))}
	</div>
);

export const TableSkeleton = ({
	rows = 5,
	columns = 4
}: {
	rows?: number;
	columns?: number;
}) => (
	<div className="overflow-hidden">
		<div className="border-b border-gray-200">
			<div className="flex space-x-4 px-6 py-3">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton key={i} className="w-24 h-4 rounded" />
				))}
			</div>
		</div>
		<div className="divide-y divide-gray-200">
			{Array.from({ length: rows }).map((_, i) => (
				<div key={i} className="flex space-x-4 px-6 py-4">
					{Array.from({ length: columns }).map((_, j) => (
						<Skeleton key={j} className="w-20 h-4 rounded" />
					))}
				</div>
			))}
		</div>
	</div>
);

export default Skeleton;
