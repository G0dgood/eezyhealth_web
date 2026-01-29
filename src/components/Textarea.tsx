import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	variant?: 'default' | 'success' | 'error' | 'warning' | 'disabled';
	helperText?: string;
	fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
	label,
	variant = 'default',
	helperText,
	fullWidth = true,
	className = '',
	disabled,
	required,
	...props
}, ref) => {
	const isDisabled = disabled || variant === 'disabled';
	const hasError = variant === 'error';

	const baseClasses = 'input';
	const effectiveVariant = hasError ? 'error' : variant;
	const variantClass = `input-${effectiveVariant}`;
	const widthClasses = fullWidth ? 'w-full' : '';

	const allClasses = [
		baseClasses,
		variantClass,
		widthClasses,
		className
	].filter(Boolean).join(' ');

	const getHelperTextClass = () => {
		if (hasError) return 'input-helper-error';
		if (variant === 'success') return 'input-helper-success';
		if (variant === 'warning') return 'input-helper-warning';
		return 'input-helper-default';
	};

	return (
		<div className={allClasses}>
			{label && (
				<label className="input-label">
					{label}
					{required && <span className="text-[var(--destructive)] ml-1">*</span>}
				</label>
			)}

			<textarea
				ref={ref}
				className="input-field min-h-[100px] py-3 px-4 resize-y h-auto"
				disabled={isDisabled}
				required={required}
				aria-invalid={hasError}
				{...props}
			/>

			{helperText && (
				<div className={`input-helper ${getHelperTextClass()}`}>
					{helperText}
				</div>
			)}
		</div>
	);
});

Textarea.displayName = 'Textarea';

export default Textarea;
