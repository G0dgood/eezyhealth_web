"use client";

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'soft-green' | 'danger' | 'neutral' | 'outline-primary' | 'outline-neutral' | 'outline-danger' | 'ghost-primary' | 'ghost-neutral' | 'ghost-danger';
	size?: 'sm' | 'md' | 'lg';
	icon?: React.ReactNode;
	iconPosition?: 'left' | 'right';
	iconOnly?: boolean;
	fullWidth?: boolean;
	loading?: boolean;
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
	disabled,
	className = '',
	backgroundIcon,
	backgroundIconClassName = '',
	backgroundClassName = '',
	backgroundColor,
	...props
}) => {
	const baseClasses = 'btn';
	const variantClasses = `btn-${variant}`;
	const sizeClasses = `btn-${size}`;
	const iconClasses = iconOnly ? 'btn-icon' : '';
	const widthClasses = fullWidth ? 'w-full' : '';

	const allClasses = [
		baseClasses,
		variantClasses,
		sizeClasses,
		iconClasses,
		widthClasses,
		className
	].filter(Boolean).join(' ');

	const isDisabled = disabled || loading;

	const renderIcon = () => {
		if (!icon && !loading) return null;

		if (loading) {
			return (
				<svg
					className="animate-spin w-4 h-4"
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

		if (!iconElement) {
			return children;
		}

		if (iconPosition === 'right') {
			return (
				<>
					{children}
					{iconElement}
				</>
			);
		}

		return (
			<>
				{iconElement}
				{children}
			</>
		);
	};

	// If backgroundIcon is provided, wrap button with background
	if (backgroundIcon) {
		const bgStyle = backgroundColor ? { backgroundColor } : {};

		return (
			<div className={`relative ${widthClasses}`}>
				{/* Background layer */}
				<div
					className={`absolute inset-0 rounded-lg ${backgroundClassName}`}
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
					className={`${allClasses} relative z-10`}
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