"use client";

import { useState } from "react";

interface CustomToggleProps {
	id?: string;
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
}

export default function CustomToggle({
	checked,
	onChange, 
}: CustomToggleProps) {


	return (

		<div className="flex items-center justify-center w-full mb-12">
			<label htmlFor="toggleB" className="flex items-center cursor-pointer">
				<div className="relative">
					<input type="checkbox" 
					id="toggleB" 
						checked={checked}
	 				onChange={onChange}
					className="sr-only" />
					<div className="block back w-14 h-8 rounded-full"></div>
					<div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
				</div>
			</label>
		</div>
	)
}



{/* // <div className={`flex items-center justify-center w-full mb-12 ${className}`}>
	// 	<label  className="flex items-center cursor-pointer">
	// 	 
	// 		<div className="relative"> 
	// 			<input 
	// 				type="checkbox"
	// 				checked={checked}
	// 				onChange={onChange}
	// 				disabled={disabled}
	// 				className="sr-only"
	// 			/> 
	// 			<div className={`block back w-14 h-8 rounded-full ${disabled ? "opacity-50" : ""}`} /> 
	// 			<div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${disabled ? "opacity-50" : ""}`} />
	// 		</div>
	// 	</label>
	// </div>  */}