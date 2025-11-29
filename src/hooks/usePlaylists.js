import { useState, useEffect } from 'react';
import { loadLibrary, saveLibrary } from '../utils/storage';
import { generateId } from '../utils/formatters';

/**
 * Custom hook for managing playlists
 */
export default function usePlaylists() {
	const [playlists, setPlaylists] = useState([]);
	const [selectedPlaylistId, setSelectedPlaylistId] = useState('all');

	// Load playlists from storage on mount
	useEffect(() => {
		const { playlists: savedPlaylists } = loadLibrary();
		setPlaylists(savedPlaylists);
	}, []);

	const createPlaylist = (name) => {
		if (!name || !name.trim()) return null;
		const id = generateId('pl-');
		const newPlaylist = { id, name: name.trim(), trackIds: [] };
		setPlaylists((prev) => [...prev, newPlaylist]);
		return id;
	};

	const deletePlaylist = (playlistId) => {
		setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
		if (selectedPlaylistId === playlistId) {
			setSelectedPlaylistId('all');
		}
	};

	const renamePlaylist = (playlistId, newName) => {
		if (!newName || !newName.trim()) return;
		setPlaylists((prev) =>
			prev.map((p) => (p.id === playlistId ? { ...p, name: newName.trim() } : p))
		);
	};

	const addTrackToPlaylist = (trackId, playlistId) => {
		setPlaylists((prev) =>
			prev.map((pl) => {
				if (pl.id === playlistId && !pl.trackIds.includes(trackId)) {
					return { ...pl, trackIds: [...pl.trackIds, trackId] };
				}
				return pl;
			})
		);
	};

	const removeTrackFromPlaylist = (trackId, playlistId) => {
		setPlaylists((prev) =>
			prev.map((pl) => {
				if (pl.id === playlistId) {
					return { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) };
				}
				return pl;
			})
		);
	};

	const selectPlaylist = (playlistId) => {
		setSelectedPlaylistId(playlistId);
	};

	const getPlaylist = (playlistId) => {
		return playlists.find((p) => p.id === playlistId);
	};

	return {
		playlists,
		selectedPlaylistId,
		selectPlaylist,
		createPlaylist,
		deletePlaylist,
		renamePlaylist,
		addToPlaylist: addTrackToPlaylist,
		removeFromPlaylist: removeTrackFromPlaylist,
		getPlaylist
	};
}
