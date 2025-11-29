import React from 'react';
import { formatTime } from '../../utils/formatters';

export default function NowPlaying({
	currentTrack,
	isPlaying,
	isLoading,
	loadError,
	currentTime,
	duration,
	onSeek,
	onPlayPause,
	onNext,
	onPrev
}) {
	return (
		<div className="flex flex-col h-full">
			{/* Album Art */}
			<div className="relative mb-8 group perspective-1000">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
				<div className={`relative aspect-square rounded-3xl overflow-hidden glass-strong shadow-2xl transition-transform duration-500 ${isPlaying ? 'scale-100' : 'scale-95 opacity-80'}`}>
					{isLoading ? (
						<div className="h-full grid place-items-center bg-dark-800">
							<div className="animate-pulse text-6xl">⏳</div>
						</div>
					) : currentTrack ? (
						<div className="h-full grid place-items-center bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
							<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
							<div className={`relative text-8xl transition-all duration-700 ${isPlaying ? 'scale-110 animate-pulse-slow' : 'scale-100'}`}>🎵</div>

							{/* Vinyl Effect */}
							<div className="absolute inset-0 rounded-full border-4 border-white/5 m-4 animate-spin-slow" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
						</div>
					) : (
						<div className="h-full grid place-items-center bg-dark-800">
							<div className="text-6xl opacity-20">🎧</div>
						</div>
					)}
				</div>
			</div>

			{/* Track Info */}
			<div className="mb-8 text-center">
				<div className="font-black text-2xl truncate mb-2 text-white tracking-tight">
					{currentTrack?.title || 'No track selected'}
				</div>
				<div className="text-base text-white/40 font-medium">
					{isLoading ? 'Loading...' : loadError ? 'Error loading track' : 'Local File'}
				</div>
				{loadError && (
					<div className="text-xs text-red-400 mt-2 bg-red-500/10 py-1 px-2 rounded-lg inline-block">{loadError}</div>
				)}
			</div>

			{/* Progress Bar */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-2">
					<span className="text-xs text-white/40 tabular-nums font-medium">{formatTime(currentTime)}</span>
					<div className="flex-1 relative group h-2">
						<input
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
							type="range"
							min="0"
							max={duration || 0}
							step="0.1"
							value={currentTime}
							onChange={(e) => onSeek(Number(e.target.value))}
							disabled={isLoading || !currentTrack}
						/>
						<div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-100"
								style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
							/>
						</div>
						<div
							className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
							style={{ left: `${(currentTime / (duration || 1)) * 100}%`, marginLeft: '-8px' }}
						/>
					</div>
					<span className="text-xs text-white/40 tabular-nums font-medium">{formatTime(duration)}</span>
				</div>
			</div>

			{/* Playback Controls */}
			<div className="flex items-center justify-center gap-6 mb-8">
				<button
					className="p-4 rounded-2xl hover:bg-white/5 text-white/60 hover:text-white transition-all hover:scale-110 disabled:opacity-30"
					onClick={onPrev}
					disabled={!currentTrack}
					title="Previous"
				>
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
						<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
					</svg>
				</button>
				<button
					className="relative p-6 rounded-[2rem] bg-white text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/20 group"
					onClick={onPlayPause}
					disabled={!currentTrack || isLoading}
					title={isPlaying ? 'Pause' : 'Play'}
				>
					{isLoading ? (
						<div className="text-xl animate-spin">⏳</div>
					) : isPlaying ? (
						<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
							<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
						</svg>
					) : (
						<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
							<path d="M8 5v14l11-7z" />
						</svg>
					)}
				</button>
				<button
					className="p-4 rounded-2xl hover:bg-white/5 text-white/60 hover:text-white transition-all hover:scale-110 disabled:opacity-30"
					onClick={onNext}
					disabled={!currentTrack}
					title="Next"
				>
					<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
						<path d="M16 18h2V6h-2zm-11-7l8.5-6v12z" />
					</svg>
				</button>
			</div>

			{/* Waveform Visualization */}
			<div className="glass rounded-2xl p-6 flex items-center justify-center gap-1.5 h-24 mt-auto">
				{[...Array(20)].map((_, i) => (
					<div
						key={i}
						className="w-1.5 bg-white/20 rounded-full transition-all"
						style={{
							height: isPlaying ? `${20 + Math.random() * 80}%` : '20%',
							backgroundColor: isPlaying ? (i % 2 === 0 ? '#6366f1' : '#ec4899') : undefined,
							opacity: isPlaying ? 1 : 0.2,
							animationName: isPlaying ? 'pulse' : 'none',
							animationDuration: `${0.4 + Math.random() * 0.4}s`,
							animationTimingFunction: 'ease-in-out',
							animationIterationCount: 'infinite',
							animationDelay: `${i * 0.05}s`
						}}
					/>
				))}
			</div>
		</div>
	);
}
