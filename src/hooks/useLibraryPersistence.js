import { useEffect } from 'react';
import { saveLibrary } from '../utils/storage';

/**
 * Custom hook to persist tracks and playlists to localStorage
 */
export default function useLibraryPersistence(tracks, playlists) {
	useEffect(() => {
		saveLibrary(tracks, playlists);
	}, [tracks, playlists]);
}
