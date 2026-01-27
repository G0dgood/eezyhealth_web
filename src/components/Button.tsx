"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'soft-green' | 'danger' | 'neutral' | 'outline-primary' | 'outline-neutral' | 'outline-danger' | 'ghost' | 'ghost-primary' | 'ghost-neutral' | 'ghost-danger';
	size?: 'sm' | 'md' | 'lg';
	icon?: React.ReactNode;
	iconPosition?: 'left' | 'right';
	iconOnly?: boolean;
	fullWidth?: boolean;
	loading?: boolean;
	isLoading?: boolean;
	backgroundIcon?: React.ReactNode;
	backgroundIconClassName?: string;

	backgroundClassName?: string;
	backgroundColor?: string;
}

const Button: React.FC<ButtonProps> = ({
	children,
	variant = 'primary',
	size = 'md',
	icon,
	iconPosition = 'left',
	iconOnly = false,
	fullWidth = false,
	loading = false,
	isLoading = false,
	disabled,
	className = '',
	backgroundIcon,
	backgroundIconClassName = '',
	backgroundClassName = '',
	backgroundColor,
	...props
}) => {
	const isButtonLoading = loading || isLoading;

	const variants = {
		primary: "bg-primary text-white hover:bg-primary/90 shadow-sm cursor-pointer",
		"soft-green": "bg-primary/10 text-primary hover:bg-primary/20",
		danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm cursor-pointer",
		neutral: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm cursor-pointer",
		"outline-primary": "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
		"outline-neutral": "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
		"outline-danger": "border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground",
		ghost: "hover:bg-accent hover:text-accent-foreground",
		"ghost-primary": "text-primary hover:bg-primary/10",
		"ghost-neutral": "hover:bg-accent hover:text-accent-foreground",
		"ghost-danger": "text-destructive hover:bg-destructive/10"
	};

	const sizes = {
		sm: "h-8 px-3 text-xs",
		md: "h-10 px-4 py-2  !text-[10px]  !md:text-[12px]",
		lg: "h-12 px-8 text-base"
	};

	const iconSizes = {
		sm: "h-8 w-8",
		md: "h-10 w-10",
		lg: "h-12 w-12"
	};

	const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

	const variantClasses = variants[variant] || variants.primary;
	const sizeClasses = iconOnly ? iconSizes[size] : sizes[size];
	const widthClasses = fullWidth ? 'w-full' : '';
	const shapeClasses = iconOnly ? 'rounded-full p-0' : '';

	const allClasses = cn(
		baseClasses,
		variantClasses,
		sizeClasses,
		widthClasses,
		shapeClasses,
		className
	);

	const isDisabled = disabled || isButtonLoading;

	const renderIcon = () => {
		if (isButtonLoading) {
			return (
				<svg
					className="animate-spin h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			);
		}
		return icon;
	};

	const renderContent = () => {
		if (iconOnly) {
			return renderIcon();
		}

		const iconElement = renderIcon();

		if (!iconElement && !isButtonLoading) return children;

		if (iconPosition === 'right') {
			return (
				<>
					{children}
					{iconElement && <span className="ml-2">{iconElement}</span>}
				</>
			);
		}

		return (
			<>
				{iconElement && <span className="mr-2">{iconElement}</span>}
				{children}
			</>
		);
	};

	// If backgroundIcon is provided, wrap button with background
	if (backgroundIcon) {
		const bgStyle = backgroundColor ? { backgroundColor } : {};

		return (
			<div className={cn("relative", widthClasses)}>
				{/* Background layer */}
				<div
					className={cn("absolute inset-0 rounded-lg", backgroundClassName)}
					style={bgStyle}
				>
					{backgroundIcon && (
						<div className={backgroundIconClassName}>
							{backgroundIcon}
						</div>
					)}
				</div>

				{/* Button */}
				<button
					className={cn(allClasses, "relative z-10")}
					disabled={isDisabled}
					{...props}
				>
					{renderContent()}
				</button>
			</div>
		);
	}

	return (
		<button
			className={allClasses}
			disabled={isDisabled}
			{...props}
		>
			{renderContent()}
		</button>
	);
};

export default Button;
