import React from 'react';

/**
 * Sidebar component with navigation and playlists
 */
export default function Sidebar({
	activeView,
	onViewChange,
	selectedPlaylistId,
	onPlaylistSelect,
	playlists,
	tracksCount,
	onCreatePlaylist,
	onRenamePlaylist,
	onDeletePlaylist
}) {
	return (
		<aside className="w-64 flex flex-col gap-4 shrink-0">
			{/* Navigation Card */}
			<div className="glass rounded-3xl p-4">
				<div className="text-xs uppercase tracking-wider text-white/40 font-bold px-4 mb-2">
					Menu
				</div>
				<div className="space-y-1">
					<button
						className={`w-full text-left px-4 py-3 rounded-2xl transition-all font-medium flex items-center gap-3 ${activeView === 'home'
								? 'bg-primary text-white shadow-lg shadow-primary/20'
								: 'text-white/60 hover:bg-white/5 hover:text-white'
							}`}
						onClick={() => onViewChange('home')}
					>
						<span className="text-xl">🏠</span>
						<span>Explore</span>
					</button>
					<button
						className={`w-full text-left px-4 py-3 rounded-2xl transition-all font-medium flex items-center gap-3 ${activeView === 'library'
								? 'bg-primary text-white shadow-lg shadow-primary/20'
								: 'text-white/60 hover:bg-white/5 hover:text-white'
							}`}
						onClick={() => onViewChange('library')}
					>
						<span className="text-xl">📚</span>
						<span>Library</span>
					</button>
				</div>
			</div>

			{/* Library Card */}
			<div className="glass rounded-3xl p-4 flex-1 flex flex-col overflow-hidden">
				<div className="text-xs uppercase tracking-wider text-white/40 font-bold px-4 mb-2">
					Your Library
				</div>
				<button
					className={`w-full text-left px-4 py-3 rounded-2xl transition-all font-medium mb-4 flex items-center justify-between group ${selectedPlaylistId === 'all'
							? 'bg-white/10 text-white'
							: 'text-white/60 hover:bg-white/5 hover:text-white'
						}`}
					onClick={() => {
						onPlaylistSelect('all');
						onViewChange('library');
					}}
				>
					<div className="flex items-center gap-3">
						<span className="text-xl">🎵</span>
						<span>All Tracks</span>
					</div>
				</button>

				<div className="flex items-center justify-between px-4 mb-2 mt-2">
					<div className="text-xs uppercase tracking-wider text-white/40 font-bold">
						Playlists
					</div>
					<button
						onClick={onCreatePlaylist}
						className="text-white/40 hover:text-white transition-colors"
						title="Create Playlist"
					>
						<span className="text-lg">➕</span>
					</button>
				</div>

				<div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
					{playlists.map((pl) => (
						<div key={pl.id} className="group relative">
							<button
								className={`w-full text-left px-4 py-2.5 rounded-xl transition-all font-medium flex items-center justify-between ${selectedPlaylistId === pl.id
										? 'bg-white/10 text-white'
										: 'text-white/60 hover:bg-white/5 hover:text-white'
									}`}
								onClick={() => {
									onPlaylistSelect(pl.id);
									onViewChange('library');
								}}
							>
								<div className="flex items-center gap-3 overflow-hidden">
									<span className="text-lg opacity-70">🎧</span>
									<span className="truncate">{pl.name}</span>
								</div>
							</button>
							<div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-dark-900/80 backdrop-blur rounded-lg p-1">
								<button
									onClick={(e) => { e.stopPropagation(); onRenamePlaylist(pl.id); }}
									className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-xs"
									title="Rename playlist"
								>
									✏️
								</button>
								<button
									onClick={(e) => { e.stopPropagation(); onDeletePlaylist(pl.id); }}
									className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors text-xs"
									title="Delete playlist"
								>
									🗑️
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</aside>
	);
}
