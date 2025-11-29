import React, { useEffect } from 'react';

/**
 * Toast notification component
 */
export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
	useEffect(() => {
		if (duration && onClose) {
			const timer = setTimeout(onClose, duration);
			return () => clearTimeout(timer);
		}
	}, [duration, onClose]);

	if (!message) return null;

	const typeStyles = {
		success: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
		error: 'bg-red-900/90 border-red-700 text-red-100',
		info: 'bg-neutral-800/90 border-neutral-700 text-neutral-100'
	};

	return (
		<div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
			<div className={`px-6 py-3 rounded-xl shadow-2xl border ${typeStyles[type]} backdrop-blur-sm`}>
				{message}
			</div>
		</div>
	);
}
