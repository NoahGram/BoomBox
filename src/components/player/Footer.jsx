import React from 'react';
import { formatTime } from '../../utils/formatters';

/**
 * Footer player component - compact always-visible controls
 */
export default function Footer({
	currentTrack,
	isPlaying,
	currentTime,
	duration,
	volume,
	onPlayPause,
	onNext,
	onPrev,
	onSeek,
	onVolumeChange
}) {
	if (!currentTrack) {
		return (
			<div className="glass-strong border-t border-white/5 p-4">
				<div className="text-center text-white/40 text-sm font-medium">
					No track selected
				</div>
			</div>
		);
	}

	return (
		<div className="glass-strong border-t border-white/5 p-4 relative z-50">
			<div className="max-w-screen-2xl mx-auto">
				{/* Progress Bar */}
				<div className="mb-3 group relative">
					<div className="absolute -inset-y-2 inset-x-0 cursor-pointer" />
					<input
						type="range"
						min={0}
						max={duration || 100}
						value={currentTime}
						onChange={(e) => onSeek(Number(e.target.value))}
						className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer 
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                            [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 
                            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:shadow-lg
                            [&::-webkit-slider-runnable-track]:rounded-full"
						style={{
							background: `linear-gradient(to right, #6366f1 0%, #ec4899 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 100%)`
						}}
					/>
				</div>

				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
					{/* Track Info */}
					<div className="flex items-center gap-4 min-w-0">
						<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex-shrink-0 grid place-items-center text-2xl shadow-lg shadow-primary/20 animate-pulse-slow">
							🎵
						</div>
						<div className="min-w-0">
							<div className="font-bold truncate text-white text-lg">{currentTrack.title}</div>
							<div className="text-xs text-white/40 font-medium flex items-center gap-2">
								<span className="tabular-nums">{formatTime(currentTime)}</span>
								<span className="w-1 h-1 rounded-full bg-white/20" />
								<span className="tabular-nums">{formatTime(duration)}</span>
							</div>
						</div>
					</div>

					{/* Playback Controls */}
					<div className="flex items-center gap-4">
						<button
							onClick={onPrev}
							className="p-2.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all hover:scale-110"
							title="Previous"
						>
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
							</svg>
						</button>
						<button
							onClick={onPlayPause}
							className="p-4 rounded-2xl bg-white text-black hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95"
							title={isPlaying ? 'Pause' : 'Play'}
						>
							{isPlaying ? (
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M6 4h4v16H6zm8 0h4v16h-4z" />
								</svg>
							) : (
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z" />
								</svg>
							)}
						</button>
						<button
							onClick={onNext}
							className="p-2.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all hover:scale-110"
							title="Next"
						>
							<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
								<path d="M16 18h2V6h-2zm-11-1l8.5-6L5 5z" />
							</svg>
						</button>
					</div>

					{/* Volume Control */}
					<div className="flex items-center gap-3 justify-end group">
						<button className="p-2 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
							</svg>
						</button>
						<div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
							<input
								type="range"
								min={0}
								max={100}
								value={volume}
								onChange={(e) => onVolumeChange(Number(e.target.value))}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
							/>
							<div
								className="h-full bg-white rounded-full transition-all"
								style={{ width: `${volume}%` }}
							/>
						</div>
						<span className="text-xs text-white/40 font-medium w-8 text-right tabular-nums group-hover:text-white transition-colors">{volume}%</span>
					</div>
				</div>
			</div>
		</div>
	);
}
