"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownOption {
	value: string;
	label: string;
}

interface DropdownProps {
	value?: string | string[];
	onChange?: (value: any) => void;
	options: DropdownOption[];
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	triggerClassName?: string;
	menuClassName?: string;
	optionClassName?: string;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'default' | 'minimal';
	multiple?: boolean;
	icon?: LucideIcon;
}

const Dropdown: React.FC<DropdownProps> = ({
	value,
	onChange,
	options,
	placeholder = "",
	disabled = false,
	className = "",
	triggerClassName = "",
	menuClassName = "",
	optionClassName = "",
	size = 'md',
	variant = 'minimal',
	multiple = false,
	icon
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedLabel = useMemo(() => {
		if (multiple && Array.isArray(value)) {
			if (value.length === 0) return "";
			return options
				.filter(option => value.includes(option.value))
				.map(option => option.label)
				.join(', ');
		}
		const selectedOption = options.find(option => option.value === value);
		return selectedOption ? selectedOption.label : "";
	}, [value, options, multiple]);


	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleToggle = () => {
		if (!disabled) {
			setIsOpen(!isOpen);
		}
	};

	const handleOptionSelect = (optionValue: string) => {
		if (onChange) {
			if (multiple) {
				const currentValues = Array.isArray(value) ? value : [];
				const newValues = currentValues.includes(optionValue)
					? currentValues.filter(v => v !== optionValue)
					: [...currentValues, optionValue];
				onChange(newValues);
			} else {
				onChange(optionValue);
				setIsOpen(false);
			}
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return;

		switch (e.key) {
			case 'Enter':
			case ' ':
				e.preventDefault();
				setIsOpen(!isOpen);
				break;
			case 'Escape':
				setIsOpen(false);
				break;
			case 'ArrowDown':
				e.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
				}
				break;
		}
	};

	// Base styles for the dropdown trigger
	const getTriggerClasses = () => {
		const baseClasses = "flex items-center justify-between cursor-pointer transition-all duration-200 border rounded-[var(--input-border-radius)]";

		const sizeClassesObj = {
			sm: 'h-[var(--input-height-sm)] px-3 text-xs',
			md: 'h-[var(--input-height-md)] px-4 text-sm',
			lg: 'h-[var(--input-height-lg)] px-5 text-base'
		};
		const sizeClass = sizeClassesObj[size];

		const disabledClass = disabled
			? "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] opacity-[var(--input-disabled-opacity)] cursor-not-allowed"
			: "";

		// Mimic input:placeholder-shown logic
		// If has selection -> bg-[var(--background)]
		// If no selection (placeholder) -> bg-[var(--muted)]
		const hasSelection = !!selectedLabel;
		const bgClass = hasSelection ? "bg-[var(--background)]" : "bg-[var(--muted)]";

		const variantClasses = disabled ? "" : `
			${bgClass}
			border-[var(--border)]
			text-[var(--foreground)]
			hover:bg-[var(--muted)]
			focus:outline-none 
			focus:border-[var(--primary)] 
			focus:shadow-[0_0_0_var(--input-focus-ring-width)_rgba(34,197,94,0.2)]
		`;

		return cn(baseClasses, sizeClass, variantClasses, disabledClass, triggerClassName);
	};

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			<div
				className={getTriggerClasses()}
				onClick={handleToggle}
				onKeyDown={handleKeyDown}
				tabIndex={disabled ? -1 : 0}
				role="combobox"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-controls={`dropdown-${Math.random().toString(36).substr(2, 9)}`}
			>
				<span className={`flex-1 text-left truncate ${selectedLabel ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
					{selectedLabel || placeholder}
				</span>

				<div className={`!ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
					{icon ? React.createElement(icon, { size: 16, color: "var(--muted-foreground)" }) : (
						<ChevronDown size={16} color="var(--muted-foreground)" />
					)}
				</div>
			</div>

			{isOpen && (
				<div className={cn(
					"absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto",
					menuClassName
				)}>
					{options.map((option) => {
						const isSelected = multiple
							? Array.isArray(value) && value.includes(option.value)
							: value === option.value;

						return (
							<div
								key={option.value}
								className={cn(
									"px-4 py-3 hover:bg-[var(--muted)] cursor-pointer text-sm text-[var(--foreground)] transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between",
									isSelected && "bg-[var(--muted)]",
									optionClassName
								)}
								onClick={() => handleOptionSelect(option.value)}
								role="option"
								aria-selected={isSelected}
							>
								<span>{option.label}</span>
								{isSelected && (
									<span className="text-[var(--primary)] font-bold">✓</span>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Dropdown;