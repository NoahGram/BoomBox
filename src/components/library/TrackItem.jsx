import React from 'react';

/**
 * Individual track item component
 */
export default function TrackItem({
	track,
	index,
	isPlaying,
	isInPlaylist,
	showPlaylistDropdown,
	playlists,
	onPlay,
	onAddToPlaylist,
	onRemoveFromPlaylist,
	onDelete
}) {
	return (
		<div
			className={`group grid grid-cols-[48px_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-white/5 ${isPlaying ? 'bg-white/10 shadow-lg shadow-primary/5 border border-primary/20' : 'border border-transparent'
				}`}
			onDoubleClick={onPlay}
		>
			{/* Track Number / Playing Indicator */}
			<div className="text-center">
				{isPlaying ? (
					<div className="flex gap-0.5 justify-center items-center">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="w-1 bg-primary rounded-full animate-pulse"
								style={{
									height: `${12 + Math.random() * 8}px`,
									animationDelay: `${i * 0.15}s`
								}}
							/>
						))}
					</div>
				) : (
					<span className="text-white/40 text-sm font-medium group-hover:text-white transition-colors">
						{index + 1}
					</span>
				)}
			</div>

			{/* Track Info */}
			<div className="flex items-center gap-4 min-w-0">
				<div className={`w-12 h-12 rounded-xl flex-shrink-0 grid place-items-center text-xl shadow-inner ${isPlaying
						? 'bg-gradient-to-br from-primary to-secondary text-white'
						: 'bg-dark-800 text-white/40 group-hover:text-white group-hover:bg-dark-700 transition-colors'
					}`}>
					🎵
				</div>
				<div className="min-w-0">
					<div className={`font-bold truncate text-base ${isPlaying ? 'text-primary' : 'text-white/90 group-hover:text-white'}`}>
						{track.title}
					</div>
					<div className="text-xs text-white/40 font-medium group-hover:text-white/60">Local File</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
				{showPlaylistDropdown ? (
					<div className="relative group/playlist">
						<button
							className="bg-white/5 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
							title="Add to playlist"
						>
							+ Playlist
						</button>
						{playlists.length > 0 && (
							<div className="absolute right-0 top-full pt-1 z-10">
								<div className="glass-strong rounded-xl shadow-2xl py-2 min-w-[180px] opacity-0 invisible group-hover/playlist:opacity-100 group-hover/playlist:visible transition-all border border-white/10">
									{playlists.map((pl) => (
										<button
											key={pl.id}
											className="w-full text-left px-4 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-between font-medium"
											onClick={(e) => {
												e.stopPropagation();
												onAddToPlaylist(track.id, pl.id);
											}}
										>
											<span className="truncate">{pl.name}</span>
											<span className="text-white/40 ml-2">({pl.trackIds.length})</span>
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				) : (
					<>
						{isInPlaylist ? (
							<button
								className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
								onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(track.id); }}
								title="Remove from this playlist"
							>
								Remove
							</button>
						) : (
							<button
								className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
								onClick={(e) => { e.stopPropagation(); onAddToPlaylist(track.id); }}
								title="Add to this playlist"
							>
								+ Add
							</button>
						)}
					</>
				)}
				<button
					className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 p-1.5 rounded-lg transition-all hover:scale-110"
					onClick={(e) => { e.stopPropagation(); onDelete(track.id); }}
					title="Delete from library"
				>
					🗑️
				</button>
			</div>
		</div>
	);
}
