/**
 * Format seconds to MM:SS time format
 */
export function formatTime(seconds) {
	if (!Number.isFinite(seconds)) return '0:00';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60).toString().padStart(2, '0');
	return `${m}:${s}`;
}

/**
 * Generate unique ID
 */
export function generateId(prefix = '') {
	return `${prefix}${Date.now()}-${crypto.randomUUID()}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 50) {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + '...';
}
