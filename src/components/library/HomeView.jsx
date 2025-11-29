import React from 'react';

/**
 * Home/Explore view component
 */
export default function HomeView({
	tracks,
	playlists,
	onPlaylistSelect,
	onTrackPlay
}) {
	const recentTracks = tracks.slice(-6);
	const recentPlaylists = playlists.slice(-4);

	return (
		<div className="space-y-8 pb-8">
			{/* Hero Banner */}
			<div className="relative overflow-hidden rounded-3xl p-8 glass-strong group">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-50 group-hover:opacity-70 transition-opacity" />
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-slow" />
				<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse-slow delay-1000" />

				<div className="relative z-10">
					<h1 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
						Welcome to BoomBox
					</h1>
					<p className="text-white/60 text-lg mb-8 font-medium">
						Your premium local music experience
					</p>
					<div className="flex gap-8">
						<div className="text-center">
							<div className="text-4xl font-black text-primary text-shadow">{tracks.length}</div>
							<div className="text-xs uppercase tracking-wider text-white/40 font-bold mt-1">Tracks</div>
						</div>
						<div className="w-px bg-white/10" />
						<div className="text-center">
							<div className="text-4xl font-black text-secondary text-shadow">{playlists.length}</div>
							<div className="text-xs uppercase tracking-wider text-white/40 font-bold mt-1">Playlists</div>
						</div>
					</div>
				</div>
			</div>

			{/* Recently Added Tracks */}
			{recentTracks.length > 0 && (
				<div>
					<h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
						<span className="text-primary">⚡</span> Recently Added
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
						{recentTracks.map((track, index) => (
							<button
								key={track.id}
								onClick={() => {
									const globalIndex = tracks.findIndex((t) => t.id === track.id);
									onTrackPlay(globalIndex);
								}}
								className="group text-left p-4 rounded-2xl glass hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
							>
								<div className="aspect-square rounded-xl bg-gradient-to-br from-dark-800 to-dark-900 mb-3 grid place-items-center text-4xl relative overflow-hidden shadow-inner">
									<div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-500" />
									<span className="group-hover:scale-110 transition-transform duration-300">🎵</span>
								</div>
								<div className="truncate font-bold text-sm text-white/90 group-hover:text-primary transition-colors">
									{track.title}
								</div>
								<div className="text-xs text-white/40 font-medium">Track</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Playlists */}
			{recentPlaylists.length > 0 && (
				<div>
					<h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
						<span className="text-secondary">🔥</span> Your Playlists
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{recentPlaylists.map((playlist) => {
							const playlistTracks = tracks.filter((t) => playlist.trackIds.includes(t.id));
							return (
								<button
									key={playlist.id}
									onClick={() => onPlaylistSelect(playlist.id)}
									className="group text-left p-5 rounded-2xl glass hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/10"
								>
									<div className="aspect-square rounded-xl bg-gradient-to-br from-dark-800 to-dark-900 mb-4 grid place-items-center text-5xl relative overflow-hidden shadow-inner">
										<div className="absolute inset-0 bg-gradient-to-br from-secondary/0 to-primary/0 group-hover:from-secondary/20 group-hover:to-primary/20 transition-all duration-500" />
										<span className="group-hover:scale-110 transition-transform duration-300">🎧</span>
									</div>
									<div className="font-bold text-lg mb-1 truncate text-white/90 group-hover:text-secondary transition-colors">
										{playlist.name}
									</div>
									<div className="text-sm text-white/40 font-medium">
										{playlistTracks.length} {playlistTracks.length === 1 ? 'track' : 'tracks'}
									</div>
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Empty State */}
			{tracks.length === 0 && (
				<div className="text-center p-12 glass rounded-3xl border-dashed border-2 border-white/10">
					<div className="text-7xl mb-6 opacity-20 animate-bounce-slow">🎵</div>
					<h3 className="text-3xl font-bold mb-3 text-white">No music yet</h3>
					<p className="text-white/40 mb-8 text-lg max-w-md mx-auto">
						Get started by adding some music files to your library. We support MP3, WAV, and more.
					</p>
					<div className="inline-flex gap-4">
						<button className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all hover:scale-105 shadow-lg shadow-primary/30">
							Add Files
						</button>
						<button className="px-8 py-4 rounded-xl glass hover:bg-white/10 text-white font-bold transition-all hover:scale-105">
							Import Folder
						</button>
					</div>
				</div>
			)}

			{/* Quick Actions */}
			{tracks.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<button
						onClick={() => onPlaylistSelect('all')}
						className="p-6 rounded-2xl glass hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-lg text-left group relative overflow-hidden"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">📚</div>
						<div className="font-bold text-lg mb-1 text-white group-hover:text-primary transition-colors">
							Browse Library
						</div>
						<div className="text-sm text-white/40 font-medium">View all {tracks.length} tracks</div>
					</button>
					<button className="p-6 rounded-2xl glass hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-lg text-left group relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">🎲</div>
						<div className="font-bold text-lg mb-1 text-white group-hover:text-secondary transition-colors">
							Shuffle All
						</div>
						<div className="text-sm text-white/40 font-medium">Play random tracks</div>
					</button>
					<button className="p-6 rounded-2xl glass hover:bg-white/10 transition-all hover:-translate-y-1 hover:shadow-lg text-left group relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
						<div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">⭐</div>
						<div className="font-bold text-lg mb-1 text-white group-hover:text-yellow-400 transition-colors">
							Most Played
						</div>
						<div className="text-sm text-white/40 font-medium">Your favorites</div>
					</button>
				</div>
			)}
		</div>
	);
}
