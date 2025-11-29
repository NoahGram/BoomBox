/**
 * Create blob URL from File or ArrayBuffer
 */
export async function createAudioBlobUrl(track) {
	if (!track) return null;
	
	try {
		let blob;
		
		if (track.file) {
			// File object from input
			blob = track.file;
		} else if (track.path && window.boombox?.readAudio) {
			// File path - read via IPC
			const buf = await window.boombox.readAudio(track.path);
			const bytes = new Uint8Array(buf);
			
			// Detect MIME type from extension
			const ext = track.path.split('.').pop()?.toLowerCase();
			const mimeTypes = {
				mp3: 'audio/mpeg',
				wav: 'audio/wav',
				ogg: 'audio/ogg',
				m4a: 'audio/mp4',
				flac: 'audio/flac',
			};
			const mimeType = mimeTypes[ext] || 'audio/mpeg';
			blob = new Blob([bytes], { type: mimeType });
		} else {
			return null;
		}
		
		return URL.createObjectURL(blob);
	} catch (error) {
		console.error('Failed to create blob URL:', error);
		throw error;
	}
}

/**
 * Revoke blob URL to free memory
 */
export function revokeBlobUrl(url) {
	try {
		if (url) URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Failed to revoke blob URL:', error);
	}
}

/**
 * Get supported audio file extensions
 */
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];

/**
 * Check if file is supported audio format
 */
export function isSupportedAudioFile(filename) {
	const ext = filename.split('.').pop()?.toLowerCase();
	return SUPPORTED_AUDIO_FORMATS.includes(ext);
}
