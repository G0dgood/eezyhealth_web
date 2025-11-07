'use client';

import React from 'react';

interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	size?: 'sm' | 'md' | 'lg';
	color?: string;
	label?: string;
	className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
	checked,
	onChange,
	disabled = false,
	size = 'md',
	color = '#22c55e',
	label,
	className = '',
}) => {
	const handleClick = () => {
		if (!disabled) {
			onChange(!checked);
		}
	};

	const getSizeClasses = () => {
		switch (size) {
			case 'sm':
				return {
					track: 'h-4 w-7',
					thumb: 'h-3 w-3',
					translate: checked ? 'translate-x-3' : 'translate-x-0.5',
				};
			case 'md':
				return {
					track: 'h-6 w-11',
					thumb: 'h-4 w-4',
					translate: checked ? 'translate-x-6' : 'translate-x-1',
				};
			case 'lg':
				return {
					track: 'h-8 w-14',
					thumb: 'h-6 w-6',
					translate: checked ? 'translate-x-7' : 'translate-x-1',
				};
			default:
				return {
					track: 'h-6 w-11',
					thumb: 'h-4 w-4',
					translate: checked ? 'translate-x-6' : 'translate-x-1',
				};
		}
	};

	const sizeClasses = getSizeClasses();

	return (
		<div className={`flex items-center ${className}`}>
			<button
				type="button"
				onClick={handleClick}
				disabled={disabled}
				className={`relative inline-flex ${sizeClasses.track} items-center rounded-full transition-colors focus:outline-none ${checked
					? `bg-[${color}]`
					: 'bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
				style={checked ? { backgroundColor: color } : {}}
			>
				<span
					className={`inline-block ${sizeClasses.thumb} transform rounded-full bg-white transition-transform ${sizeClasses.translate}`}
				/>
			</button>
			{label && (
				<span className={`ml-3 text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
					{label}
				</span>
			)}
		</div>
	);
};

export default Toggle;
