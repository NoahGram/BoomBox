import React from 'react';
import TrackItem from './TrackItem';

/**
 * Track list component
 */
export default function TrackList({
	tracks,
	allTracks,
	currentTrackId,
	selectedPlaylistId,
	playlists,
	searchQuery,
	onTrackPlay,
	onAddToPlaylist,
	onRemoveFromPlaylist,
	onDeleteTrack
}) {
	if (tracks.length === 0 && !searchQuery) {
		return (
			<div className="flex-1 grid place-items-center text-center p-12 glass rounded-3xl border-dashed border-2 border-white/10 m-4">
				<div>
					<div className="text-7xl mb-6 opacity-20 animate-bounce-slow">🎵</div>
					<h3 className="text-2xl font-bold mb-2 text-white">No tracks yet</h3>
					<p className="text-white/40 text-lg">Add some music files to get started</p>
				</div>
			</div>
		);
	}

	if (tracks.length === 0 && searchQuery) {
		return (
			<div className="flex-1 grid place-items-center text-center p-12 glass rounded-3xl m-4">
				<div>
					<div className="text-7xl mb-6 opacity-20">🔍</div>
					<h3 className="text-2xl font-bold mb-2 text-white">No results found</h3>
					<p className="text-white/40 text-lg mb-6">
						No tracks matching "{searchQuery}"
					</p>
					<button
						onClick={() => { }}
						className="text-primary hover:text-primary-hover font-bold transition-colors"
					>
						Clear search
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{tracks.map((track, index) => {
				const globalIndex = allTracks.findIndex((t) => t.id === track.id);
				const isPlaying = track.id === currentTrackId;
				const isInPlaylist = selectedPlaylistId !== 'all' &&
					playlists.find((p) => p.id === selectedPlaylistId)?.trackIds.includes(track.id);

				return (
					<TrackItem
						key={track.id}
						track={track}
						index={index}
						isPlaying={isPlaying}
						isInPlaylist={isInPlaylist}
						showPlaylistDropdown={selectedPlaylistId === 'all'}
						playlists={playlists}
						onPlay={() => onTrackPlay(globalIndex)}
						onAddToPlaylist={(trackId, playlistId) => onAddToPlaylist(trackId, playlistId)}
						onRemoveFromPlaylist={() => onRemoveFromPlaylist(track.id)}
						onDelete={() => onDeleteTrack(track.id)}
					/>
				);
			})}
		</div>
	);
}
