import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createAudioBlobUrl, revokeBlobUrl } from '../utils/audio';

/**
 * Custom hook for managing audio playback
 */
export default function useAudioManager(tracks, audioRef) {
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [srcMap, setSrcMap] = useState({});
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState(null);
	const shouldAutoPlayRef = useRef(false);
	const blobUrlsRef = useRef(new Set());

	const currentTrack = useMemo(() => tracks[currentIndex] || null, [tracks, currentIndex]);

	// Preload blob URL for a track
	const preloadTrackBlob = useCallback(async (track) => {
		if (!track) return null;
		
		// Check if already loaded
		const existingUrl = srcMap[track.id];
		if (existingUrl && blobUrlsRef.current.has(existingUrl)) {
			return existingUrl;
		}
		
		try {
			setIsLoading(true);
			setLoadError(null);
			
			const url = await createAudioBlobUrl(track);
			if (url) {
				blobUrlsRef.current.add(url);
				setSrcMap((m) => ({ ...m, [track.id]: url }));
			}
			
			setIsLoading(false);
			return url;
		} catch (error) {
			console.error('Failed to load audio:', error);
			setLoadError(`Failed to load: ${track.title}`);
			setIsLoading(false);
			return null;
		}
	}, [srcMap]);

	// Load current track
	useEffect(() => {
		if (!currentTrack) {
			const audio = audioRef.current;
			if (audio) {
				audio.pause();
				audio.src = '';
				setIsPlaying(false);
				setCurrentTime(0);
				setDuration(0);
			}
			return;
		}

		let cancelled = false;
		setIsLoading(true);
		setLoadError(null);

		preloadTrackBlob(currentTrack).then(async (url) => {
			if (cancelled || !url) return;
			
			const audio = audioRef.current;
			if (!audio) return;

			if (!audio.paused) audio.pause();
			audio.src = url;
			audio.load();

			setCurrentTime(0);
			setDuration(0);
			setIsPlaying(false);

			if (shouldAutoPlayRef.current) {
				shouldAutoPlayRef.current = false;
				await new Promise((resolve) => {
					const tryPlay = async () => {
						try {
							if (audio.readyState >= 2) {
								await audio.play();
								audio.removeEventListener('canplay', tryPlay);
								resolve();
							}
						} catch (err) {
							console.error('Auto-play failed:', err);
							audio.removeEventListener('canplay', tryPlay);
							resolve();
						}
					};
					audio.addEventListener('canplay', tryPlay);
					if (audio.readyState >= 2) tryPlay();
					setTimeout(resolve, 5000);
				});
			}
		});

		return () => { cancelled = true; };
	}, [currentTrack?.id, preloadTrackBlob]);

	// Set volume
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;
		}
	}, [volume]);

	// Cleanup blob URLs for removed tracks
	useEffect(() => {
		const trackIds = new Set(tracks.map(t => t.id));
		
		setSrcMap((m) => {
			const newMap = { ...m };
			let hasChanges = false;
			
			Object.entries(m).forEach(([trackId, url]) => {
				if (!trackIds.has(trackId)) {
					blobUrlsRef.current.delete(url);
					revokeBlobUrl(url);
					delete newMap[trackId];
					hasChanges = true;
				}
			});
			
			return hasChanges ? newMap : m;
		});
	}, [tracks.map(t => t.id).join(',')]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			blobUrlsRef.current.forEach((url) => revokeBlobUrl(url));
			blobUrlsRef.current.clear();
		};
	}, []);

	// Sync audio events
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);
		const handleEnded = () => {
			setIsPlaying(false);
			setCurrentTime(0);
			// Auto-play next track
			if (tracks.length > 0) {
				const nextIndex = (currentIndex + 1) % tracks.length;
				shouldAutoPlayRef.current = true;
				setCurrentIndex(nextIndex);
			}
		};
		const handleTimeUpdate = () => {
			setCurrentTime(audio.currentTime);
			setDuration(audio.duration || 0);
		};
		const handleLoadedMetadata = () => {
			setDuration(audio.duration || 0);
			setIsLoading(false);
		};
		const handleError = () => {
			setLoadError('Failed to play audio');
			setIsPlaying(false);
		};

		audio.addEventListener('play', handlePlay);
		audio.addEventListener('pause', handlePause);
		audio.addEventListener('ended', handleEnded);
		audio.addEventListener('timeupdate', handleTimeUpdate);
		audio.addEventListener('loadedmetadata', handleLoadedMetadata);
		audio.addEventListener('error', handleError);

		return () => {
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('timeupdate', handleTimeUpdate);
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
			audio.removeEventListener('error', handleError);
		};
	}, [tracks.length, currentIndex]);

	// Playback controls
	const play = useCallback((index) => {
		if (index >= 0 && index < tracks.length) {
			shouldAutoPlayRef.current = true;
			setCurrentIndex(index);
		}
	}, [tracks.length]);

	const pause = useCallback(() => {
		const audio = audioRef.current;
		if (audio && !audio.paused) {
			audio.pause();
		}
	}, []);

	const playPause = useCallback(async () => {
		const audio = audioRef.current;
		if (!audio || !currentTrack) return;

		try {
			if (audio.paused) {
				if (audio.readyState < 2) {
					setIsLoading(true);
					await new Promise((resolve) => {
						const checkReady = () => {
							if (audio.readyState >= 2) {
								audio.removeEventListener('canplay', checkReady);
								resolve();
							}
						};
						audio.addEventListener('canplay', checkReady);
						setTimeout(resolve, 5000);
					});
				}
				await audio.play();
			} else {
				audio.pause();
			}
		} catch (error) {
			console.error('Playback error:', error);
			setLoadError('Failed to play audio');
			setIsPlaying(false);
		}
	}, [currentTrack]);

	const next = useCallback(() => {
		if (tracks.length === 0) return;
		const nextIndex = (currentIndex + 1) % tracks.length;
		play(nextIndex);
	}, [tracks.length, currentIndex, play]);

	const prev = useCallback(() => {
		if (tracks.length === 0) return;
		const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
		play(prevIndex);
	}, [tracks.length, currentIndex, play]);

	const seek = useCallback((time) => {
		const audio = audioRef.current;
		if (audio) {
			audio.currentTime = time;
		}
	}, []);

	return {
		currentIndex,
		currentTrack,
		isPlaying,
		currentTime,
		duration,
		volume,
		isLoading,
		loadError,
		play,
		pause,
		playPause,
		next,
		prev,
		seek,
		setVolume
	};
}
