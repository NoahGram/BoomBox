import { useState, useEffect, useMemo } from 'react';
import { loadLibrary, saveLibrary } from '../utils/storage';
import { generateId } from '../utils/formatters';

/**
 * Custom hook for managing music library (tracks)
 */
export default function useMusicLibrary() {
	const [tracks, setTracks] = useState([]);

	// Load tracks from storage on mount
	useEffect(() => {
		const { tracks: savedTracks } = loadLibrary();
		setTracks(savedTracks);
	}, []);

	const addTracks = (files) => {
		const newTracks = files.map((f) => ({
			id: generateId(),
			file: f instanceof File ? f : undefined,
			path: typeof f === 'string' ? f : undefined,
			title: f instanceof File ? f.name : f.split(/\\|\//).pop()
		}));
		setTracks((prev) => [...prev, ...newTracks]);
		return newTracks;
	};

	const deleteTrack = (trackId) => {
		setTracks((prev) => prev.filter((t) => t.id !== trackId));
	};

	const getTrack = (trackId) => {
		return tracks.find((t) => t.id === trackId);
	};

	return {
		tracks,
		setTracks,
		addTracks,
		deleteTrack,
		getTrack
	};
}

/**
 * Custom hook for filtering tracks
 */
export function useTrackFilter(tracks, playlists, selectedPlaylistId, searchQuery) {
	return useMemo(() => {
		let filtered = tracks;
		
		// Filter by playlist
		if (selectedPlaylistId !== 'all') {
			const playlist = playlists.find((p) => p.id === selectedPlaylistId);
			if (playlist) {
				const idSet = new Set(playlist.trackIds);
				filtered = filtered.filter((t) => idSet.has(t.id));
			}
		}
		
		// Filter by search
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((t) =>
				t.title.toLowerCase().includes(query)
			);
		}
		
		return filtered;
	}, [tracks, playlists, selectedPlaylistId, searchQuery]);
}
