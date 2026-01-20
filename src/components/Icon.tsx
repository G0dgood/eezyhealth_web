"use client";

import React from 'react';
import Image from 'next/image';

interface IconProps {
	name: string;
	size?: number | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl';
	className?: string;
	alt?: string;
	color?: string;
}

const Icon: React.FC<IconProps> = ({
	name,
	size = 'md',
	className = '',
	alt,
	color
}) => {
	// Convert size names to pixel values
	const getSizeValue = (size: number | string): number => {
		if (typeof size === 'number') return size;

		const sizeMap = {
			xxs: 8,
			xs: 12,
			sm: 16,
			md: 20,
			lg: 24,
			xl: 32,
			'2xl': 40,
			'3xl': 48,
			'4xl': 56,
			'5xl': 64,
			'6xl': 72,
			'7xl': 80,
			'8xl': 88,
			'9xl': 96,
			'10xl': 104
		};

		return sizeMap[size as keyof typeof sizeMap] || 20;
	};

	const sizeValue = getSizeValue(size);

	// Build the icon path - check if it's a social icon
	const socialIcons = ['facebook', 'insta', 'x', 'in'];
	const directory = socialIcons.includes(name) ? 'socials' : 'icon';
	const iconPath = `/${directory}/${name}.svg`;

	// Generate alt text if not provided
	const altText = alt || `${name} icon`;

	// Apply color filter if specified
	const style = color ? {
		filter: `brightness(0) saturate(100%) ${getColorFilter(color)}`
	} : undefined;

	return (
		<Image
			src={iconPath}
			alt={altText}
			width={sizeValue}
			height={sizeValue}
			className={`inline-block ${className}`}
			style={style}
		/>
	);
};

// Helper function to convert colors to CSS filter values
const getColorFilter = (color: string): string => {
	// Common color filters (these are approximate CSS filter values)
	const colorFilters: Record<string, string> = {
		// Primary colors
		black: 'invert(0%)',
		white: 'invert(100%)',

		// Grays
		gray: 'invert(50%)',
		'gray-light': 'invert(70%)',
		'gray-dark': 'invert(30%)',

		// Brand colors (approximate filters for your CSS variables)
		green: 'invert(27%) sepia(52%) saturate(2878%) hue-rotate(100deg) brightness(97%) contrast(80%)',
		primary: 'invert(20%) sepia(11%) saturate(0%) hue-rotate(317deg) brightness(95%) contrast(92%)',

		// Status colors
		success: 'invert(64%) sepia(88%) saturate(1552%) hue-rotate(87deg) brightness(119%) contrast(119%)',
		warning: 'invert(77%) sepia(29%) saturate(1352%) hue-rotate(3deg) brightness(101%) contrast(103%)',
		error: 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
	};

	// If it's a predefined color, use the filter
	if (colorFilters[color]) {
		return colorFilters[color];
	}

	// If it's a CSS variable, return as-is (won't work with filter, but keeps flexibility)
	if (color.startsWith('var(') || color.startsWith('#') || color.startsWith('rgb')) {
		return '';
	}

	// Default to no filter
	return '';
};

export default Icon;