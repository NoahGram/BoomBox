const STORAGE_KEY = 'boombox:library';

/**
 * Load library data from localStorage
 */
export function loadLibrary() {
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
		return {
			tracks: Array.isArray(saved.tracks) ? saved.tracks : [],
			playlists: Array.isArray(saved.playlists) ? saved.playlists : []
		};
	} catch (error) {
		console.error('Failed to load library:', error);
		return { tracks: [], playlists: [] };
	}
}

/**
 * Save library data to localStorage
 * Only saves file-path tracks (not File objects)
 */
export function saveLibrary(tracks, playlists) {
	try {
		const serializableTracks = tracks
			.filter((t) => !!t.path)
			.map((t) => ({ id: t.id, path: t.path, title: t.title }));
		
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ tracks: serializableTracks, playlists })
		);
	} catch (error) {
		console.error('Failed to save library:', error);
	}
}

/**
 * Clear all library data
 */
export function clearLibrary() {
	localStorage.removeItem(STORAGE_KEY);
}
