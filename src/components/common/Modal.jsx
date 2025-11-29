import React from 'react';

/**
 * Reusable Modal component with glassmorphism
 */
export default function Modal({ onClose, children }) {
	return (
		<div 
			className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-50 animate-fade-in" 
			onClick={onClose}
		>
			<div 
				className="glass-strong rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" 
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
}

/**
 * Input Modal for text input
 */
export function InputModal({ title, defaultValue = '', placeholder = 'Enter text...', onConfirm, onClose }) {
	const [value, setValue] = React.useState(defaultValue);

	React.useEffect(() => {
		setValue(defaultValue);
	}, [defaultValue]);

	const handleConfirm = () => {
		onConfirm(value);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleConfirm();
		} else if (e.key === 'Escape') {
			onClose();
		}
	};

	return (
		<div 
			className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-50 animate-fade-in" 
			onClick={onClose}
		>
			<div 
				className="glass-strong rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" 
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="text-xl font-bold mb-4">{title}</h3>
				
				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl px-4 py-3 mb-6 outline-none focus:border-emerald-500 transition-colors"
					autoFocus
				/>
				
				<div className="flex gap-3 justify-end">
					<button
						className="glass hover:glass-strong px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black px-5 py-2.5 rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
						onClick={handleConfirm}
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
}
