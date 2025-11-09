import React, { useEffect, useMemo, useRef, useState } from 'react';

function formatTime(seconds) {
	if (!Number.isFinite(seconds)) return '0:00';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60).toString().padStart(2, '0');
	return `${m}:${s}`;
}

export default function App() {
	const audioRef = useRef(null);
	const [tracks, setTracks] = useState([]);
	const [playlists, setPlaylists] = useState([]);
	const [selectedPlaylistId, setSelectedPlaylistId] = useState('all');
	const [srcMap, setSrcMap] = useState({});
	const [activeView, setActiveView] = useState('home'); // 'home' | 'library'
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [showPrompt, setShowPrompt] = useState(false);
	const [promptConfig, setPromptConfig] = useState({ title: '', defaultValue: '', onConfirm: null });
	const [toast, setToast] = useState(null);
	const shouldAutoPlayRef = useRef(false);
	const blobUrlsRef = useRef(new Set());

	const currentTrack = useMemo(() => tracks[currentIndex] || null, [tracks, currentIndex]);

	// Load persisted library (file-path-based tracks and playlists)
	useEffect(() => {
		try {
			const saved = JSON.parse(localStorage.getItem('boombox:library') || '{}');
			if (Array.isArray(saved.tracks)) setTracks(saved.tracks);
			if (Array.isArray(saved.playlists)) setPlaylists(saved.playlists);
		} catch {}
	}, []);

	// Persist only file-path tracks (not blob File objects)
	useEffect(() => {
		const serializableTracks = tracks.filter((t) => !!t.path).map((t) => ({ id: t.id, path: t.path, title: t.title }));
		localStorage.setItem('boombox:library', JSON.stringify({ tracks: serializableTracks, playlists }));
	}, [tracks, playlists]);

	// Switch to library view when user starts searching
	useEffect(() => {
		if (searchQuery.trim() && activeView !== 'library') {
			setActiveView('library');
			setSelectedPlaylistId('all'); // Show all tracks when searching
		}
	}, [searchQuery, activeView]);

	function handleAddFiles() {
		if (!window.boombox?.openFiles) return;
		window.boombox.openFiles().then((filePaths) => {
			if (!filePaths.length) return;
			const newItems = filePaths.map((p) => ({ id: `${p}-${Date.now()}`, path: p, title: p.split(/\\|\//).pop() }));
			setTracks((prev) => [...prev, ...newItems]);
			if (currentIndex === -1 && newItems.length) setCurrentIndex(0);
		});
	}

	function onFileInput(e) {
		const files = Array.from(e.target.files || []);
		if (!files.length) return;
		const newItems = files.map((f) => ({ id: `${f.name}-${crypto.randomUUID()}`, file: f, title: f.name }));
		setTracks((prev) => [...prev, ...newItems]);
		if (currentIndex === -1 && newItems.length) setCurrentIndex(0);
	}

	function createPlaylist() {
		setPromptConfig({
			title: 'Create New Playlist',
			defaultValue: '',
			onConfirm: (name) => {
				if (!name || !name.trim()) return;
				const id = `pl-${Date.now()}`;
				setPlaylists((p) => [...p, { id, name: name.trim(), trackIds: [] }]);
				setSelectedPlaylistId(id);
			}
		});
		setShowPrompt(true);
	}

	function deletePlaylist(playlistId) {
		const playlist = playlists.find((p) => p.id === playlistId);
		if (!playlist) return;
		
		if (!confirm(`Delete playlist "${playlist.name}"? Tracks will remain in your library.`)) return;
		
		setPlaylists((pls) => pls.filter((p) => p.id !== playlistId));
		
		// Switch to "All Tracks" if the deleted playlist was selected
		if (selectedPlaylistId === playlistId) {
			setSelectedPlaylistId('all');
		}
	}

	function renamePlaylist(playlistId) {
		const playlist = playlists.find((p) => p.id === playlistId);
		if (!playlist) return;
		
		setPromptConfig({
			title: 'Rename Playlist',
			defaultValue: playlist.name,
			onConfirm: (newName) => {
				if (!newName || !newName.trim() || newName === playlist.name) return;
				setPlaylists((pls) => pls.map((p) => 
					p.id === playlistId ? { ...p, name: newName.trim() } : p
				));
			}
		});
		setShowPrompt(true);
	}

	function addToSelectedPlaylist(trackId, targetPlaylistId = null) {
		const playlistId = targetPlaylistId || selectedPlaylistId;
		if (playlistId === 'all') return;
		
		console.log('Adding track to playlist:', { trackId, playlistId, currentPlaylists: playlists });
		
		const track = tracks.find(t => t.id === trackId);
		const playlist = playlists.find(p => p.id === playlistId);
		
		if (!track || !playlist) {
			setToast({ message: '❌ Error: Track or playlist not found', type: 'error' });
			setTimeout(() => setToast(null), 3000);
			return;
		}
		
		if (playlist.trackIds.includes(trackId)) {
			setToast({ message: `"${track.title}" is already in "${playlist.name}"`, type: 'info' });
			setTimeout(() => setToast(null), 3000);
			return;
		}
		
		setPlaylists((pls) => {
			const updated = pls.map((pl) => {
				if (pl.id === playlistId && !pl.trackIds.includes(trackId)) {
					console.log('Adding track to playlist:', pl.name);
					return { ...pl, trackIds: [...pl.trackIds, trackId] };
				}
				return pl;
			});
			console.log('Updated playlists:', updated);
			return updated;
		});
		
		setToast({ message: `✓ Added "${track.title}" to "${playlist.name}"`, type: 'success' });
		setTimeout(() => setToast(null), 3000);
	}

	function deleteTrack(trackId) {
		const track = tracks.find(t => t.id === trackId);
		if (!track) return;
		
		if (!confirm(`Delete "${track.title}" from your library? This will remove it from all playlists.`)) return;
		
		// Remove from tracks
		setTracks((prev) => prev.filter((t) => t.id !== trackId));
		
		// Remove from all playlists
		setPlaylists((pls) => pls.map((pl) => ({
			...pl,
			trackIds: pl.trackIds.filter((id) => id !== trackId)
		})));
		
		// If this was the current track, stop playback
		if (currentIndex >= 0 && tracks[currentIndex]?.id === trackId) {
			const audio = audioRef.current;
			if (audio) {
				audio.pause();
				audio.src = '';
			}
			setCurrentIndex(-1);
			setIsPlaying(false);
		}
	}

	function removeFromPlaylist(trackId) {
		if (selectedPlaylistId === 'all') return;
		
		const playlist = playlists.find((p) => p.id === selectedPlaylistId);
		if (!playlist) return;
		
		setPlaylists((pls) => pls.map((pl) => 
			pl.id === selectedPlaylistId
				? { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) }
				: pl
		));
	}

	const visibleTracks = useMemo(() => {
		let filtered = tracks;
		
		// Filter by playlist if one is selected
		if (selectedPlaylistId !== 'all') {
			const pl = playlists.find((p) => p.id === selectedPlaylistId);
			if (pl) {
				const idSet = new Set(pl.trackIds);
				filtered = filtered.filter((t) => idSet.has(t.id));
			}
		}
		
		// Filter by search query if provided
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter((t) => 
				t.title.toLowerCase().includes(query)
			);
		}
		
		return filtered;
	}, [tracks, playlists, selectedPlaylistId, searchQuery]);

	// Preload blob URL for a track
	async function preloadTrackBlob(track) {
		if (!track) return null;
		
		// Check if already loaded and URL is still valid
		const existingUrl = srcMap[track.id];
		if (existingUrl) {
			// Verify URL is still valid by checking if it's in our ref
			if (blobUrlsRef.current.has(existingUrl)) {
				return existingUrl;
			}
			// URL was revoked, remove from map and recreate
			setSrcMap((m) => {
				const newMap = { ...m };
				delete newMap[track.id];
				return newMap;
			});
		}
		
		try {
			let blob;
			if (track.file) {
				// File object from input
				blob = track.file;
			} else if (track.path && window.boombox?.readAudio) {
				// File path - read via IPC
				setIsLoading(true);
				setLoadError(null);
				const buf = await window.boombox.readAudio(track.path);
				const bytes = new Uint8Array(buf);
				// Detect MIME type from extension
				const ext = track.path.split('.').pop()?.toLowerCase();
				const mimeTypes = {
					mp3: 'audio/mpeg',
					wav: 'audio/wav',
					ogg: 'audio/ogg',
					m4a: 'audio/mp4',
					flac: 'audio/flac',
				};
				const mimeType = mimeTypes[ext] || 'audio/mpeg';
				blob = new Blob([bytes], { type: mimeType });
			} else {
				return null;
			}
			
			const url = URL.createObjectURL(blob);
			blobUrlsRef.current.add(url);
			setSrcMap((m) => ({ ...m, [track.id]: url }));
			setIsLoading(false);
			return url;
		} catch (error) {
			console.error('Failed to load audio:', error);
			setLoadError(`Failed to load: ${track.title}`);
			setIsLoading(false);
			return null;
		}
	}

	// Preload blob URL when track changes
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

			// Pause current playback if any
			if (!audio.paused) {
				audio.pause();
			}

			// Set new source (don't revoke old URL - keep it cached for replay)
			audio.src = url;
			audio.load(); // Force reload

			// Reset state
			setCurrentTime(0);
			setDuration(0);
			setIsPlaying(false);

			// Auto-play if requested
			if (shouldAutoPlayRef.current) {
				shouldAutoPlayRef.current = false;
				// Wait for audio to be ready
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
					// Try immediately if already ready
					if (audio.readyState >= 2) {
						tryPlay();
					}
					// Fallback timeout
					setTimeout(resolve, 5000);
				});
			}
		});

		return () => {
			cancelled = true;
		};
	}, [currentTrack?.id]);

	// Set volume on audio element
	useEffect(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.volume = volume;
		}
	}, [volume]);

	// Sync audio state with element events
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
		const handleError = (e) => {
			console.error('Audio error:', e);
			setLoadError('Failed to play audio');
			setIsPlaying(false);
		};
		const handleLoadedMetadata = () => {
			setDuration(audio.duration || 0);
			setIsLoading(false);
		};
		const handleCanPlay = () => {
			setIsLoading(false);
		};
		const handleWaiting = () => setIsLoading(true);
		const handleCanPlayThrough = () => setIsLoading(false);

		audio.addEventListener('play', handlePlay);
		audio.addEventListener('pause', handlePause);
		audio.addEventListener('ended', handleEnded);
		audio.addEventListener('error', handleError);
		audio.addEventListener('loadedmetadata', handleLoadedMetadata);
		audio.addEventListener('canplay', handleCanPlay);
		audio.addEventListener('waiting', handleWaiting);
		audio.addEventListener('canplaythrough', handleCanPlayThrough);

		return () => {
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('error', handleError);
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
			audio.removeEventListener('canplay', handleCanPlay);
			audio.removeEventListener('waiting', handleWaiting);
			audio.removeEventListener('canplaythrough', handleCanPlayThrough);
		};
	}, [tracks.length, currentIndex]);

	// Cleanup blob URLs for tracks that have been removed from library
	useEffect(() => {
		const trackIds = new Set(tracks.map(t => t.id));
		
		// Clean up blob URLs for tracks that no longer exist
		setSrcMap((m) => {
			const newMap = { ...m };
			let hasChanges = false;
			
			Object.entries(m).forEach(([trackId, url]) => {
				if (!trackIds.has(trackId)) {
					// Track was removed, clean up its blob URL
					blobUrlsRef.current.delete(url);
					try {
						URL.revokeObjectURL(url);
					} catch (e) {
						// Ignore errors during cleanup
					}
					delete newMap[trackId];
					hasChanges = true;
				}
			});
			
			return hasChanges ? newMap : m;
		});
	}, [tracks.map(t => t.id).join(',')]); // Only depend on track IDs, not full objects

	// Cleanup blob URLs on unmount
	useEffect(() => {
		return () => {
			// Cleanup all blob URLs on unmount
			blobUrlsRef.current.forEach((url) => {
				try {
					URL.revokeObjectURL(url);
				} catch (e) {
					// Ignore errors during cleanup
				}
			});
			blobUrlsRef.current.clear();
		};
	}, []); // Only run cleanup on unmount

	async function playPause() {
		const audio = audioRef.current;
		if (!audio || !currentTrack) return;

		try {
			if (audio.paused) {
				// Wait for audio to be ready
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
						// Fallback timeout
						setTimeout(resolve, 5000);
					});
				}

				await audio.play();
				// State will be updated by event listener
			} else {
				audio.pause();
				// State will be updated by event listener
			}
		} catch (error) {
			console.error('Playback error:', error);
			setLoadError('Failed to play audio. Try clicking play again.');
			setIsPlaying(false);
		}
	}

	function playIndex(index) {
		if (index < 0 || index >= tracks.length) return;
		// Stop current playback
		const audio = audioRef.current;
		if (audio && !audio.paused) {
			audio.pause();
		}
		shouldAutoPlayRef.current = true;
		setCurrentIndex(index);
		// Audio will auto-play when loaded via useEffect
	}

	const next = React.useCallback(() => {
		if (!tracks.length) return;
		const nextIndex = (currentIndex + 1) % tracks.length;
		playIndex(nextIndex);
	}, [tracks.length, currentIndex]);

	const prev = React.useCallback(() => {
		if (!tracks.length) return;
		const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
		playIndex(prevIndex);
	}, [tracks.length, currentIndex]);

	function onTimeUpdate() {
		const a = audioRef.current;
		if (!a) return;
		setCurrentTime(a.currentTime);
		setDuration(a.duration || 0);
	}

	function onSeek(e) {
		const a = audioRef.current;
		if (!a) return;
		a.currentTime = Number(e.target.value);
	}

	function onVolume(e) {
		const v = Number(e.target.value);
		setVolume(v);
		if (audioRef.current) audioRef.current.volume = v;
	}

	return (
		<div className="h-screen grid grid-rows-[64px_1fr_112px] bg-neutral-950 text-neutral-100">
			{/* Top Bar */}
			<header className="flex items-center justify-between px-5 bg-neutral-900/70 backdrop-blur border-b border-neutral-800">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded bg-emerald-500 grid place-items-center font-black text-neutral-900">B</div>
					<div className="font-semibold tracking-wide">BoomBox</div>
				</div>
				<div className="flex-1 max-w-xl mx-6">
					<div className="flex items-center gap-2 bg-neutral-800/80 border border-neutral-700 rounded-lg px-3 py-2">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-neutral-400"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/></svg>
						<input 
							type="text"
							placeholder="Type here to search" 
							className="bg-transparent outline-none text-sm w-full placeholder:text-neutral-400" 
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<button 
								onClick={() => setSearchQuery('')}
								className="text-neutral-400 hover:text-neutral-200"
								title="Clear search"
							>
								✕
							</button>
						)}
					</div>
				</div>
				<div className="flex gap-2">
					<button className="bg-emerald-500 text-black px-3 py-2 rounded-md font-semibold" onClick={handleAddFiles}>Add Files</button>
					<label className="bg-neutral-700 text-white px-3 py-2 rounded-md cursor-pointer">
						<input type="file" accept="audio/*" multiple onChange={onFileInput} className="hidden" />
						Import
					</label>
				</div>
			</header>

			{/* Body */}
			<main className="grid grid-cols-[260px_1fr_360px] min-h-0">
				{/* Sidebar */}
				<aside className="bg-neutral-950 border-r border-neutral-900 p-4 space-y-6">
					<nav className="space-y-1">
						<div className="text-xs uppercase text-neutral-500 px-2">Menu</div>
						<button className={`w-full text-left px-3 py-2 rounded-md ${activeView==='home'?'bg-neutral-800 text-white':'text-neutral-300 hover:bg-neutral-900'}`} onClick={() => setActiveView('home')}>Explore</button>
						<button className={`w-full text-left px-3 py-2 rounded-md ${activeView==='library'?'bg-neutral-800 text-white':'text-neutral-300 hover:bg-neutral-900'}`} onClick={() => setActiveView('library')}>Library</button>
					</nav>
					<div>
						<div className="text-xs uppercase text-neutral-500 px-2 mb-2">Library</div>
						<button 
							className={`w-full text-left px-3 py-2 rounded-md mb-2 ${selectedPlaylistId==='all'?'bg-neutral-800 text-white':'text-neutral-300 hover:bg-neutral-900'}`} 
							onClick={() => { 
								setSelectedPlaylistId('all'); 
								setActiveView('library');
								if (searchQuery.trim()) {
									// Keep search active when viewing all tracks
								}
							}}
						>
							All Tracks
						</button>
						<div className="text-xs uppercase text-neutral-500 px-2 mb-2 mt-4">Playlists</div>
						<button className="w-full bg-emerald-600/20 text-emerald-300 border border-emerald-800 px-3 py-2 rounded-md" onClick={createPlaylist}>Create New</button>
						<ul className="mt-2 space-y-1">
							{playlists.map((pl) => (
								<li key={pl.id} className="group relative">
									<button 
										className={`w-full text-left px-3 py-2 rounded-md ${selectedPlaylistId===pl.id?'bg-neutral-800 text-white':'text-neutral-300 hover:bg-neutral-900'}`} 
										onClick={() => { setSelectedPlaylistId(pl.id); setActiveView('library'); }}
									>
										{pl.name}
										<span className="text-xs text-neutral-500 ml-2">({pl.trackIds.length})</span>
									</button>
									<div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
										<button
											onClick={(e) => { e.stopPropagation(); renamePlaylist(pl.id); }}
											className="text-xs bg-neutral-700 hover:bg-neutral-600 px-2 py-1 rounded"
											title="Rename playlist"
										>
											✏️
										</button>
										<button
											onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
											className="text-xs bg-red-900/50 hover:bg-red-900 px-2 py-1 rounded"
											title="Delete playlist"
										>
											🗑️
										</button>
									</div>
								</li>
							))}
						</ul>
					</div>
				</aside>

				{/* Main content */}
				<section className="overflow-auto">
					{activeView === 'home' ? (
						<div className="space-y-6 p-6">
							{/* Hero Banner */}
							<div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 p-6 border border-neutral-800">
								<div className="max-w-lg">
									<div className="text-4xl font-extrabold leading-tight">Trending New Hits</div>
									<p className="text-neutral-400 mt-2">Discover what’s hot across your library.</p>
									<div className="mt-4 flex gap-3">
										<button className="bg-emerald-500 text-black px-4 py-2 rounded-md font-semibold">Listen Now</button>
										<button className="bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-md">Add to Queue</button>
									</div>
								</div>
								<div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
							</div>

							{/* Cards row: Top Artists (placeholder avatars) */}
							<div>
								<div className="flex items-center justify-between mb-3">
									<h3 className="text-lg font-semibold">Top Artists</h3>
									<button className="text-xs text-neutral-400 hover:text-neutral-200">See all</button>
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
									{['Labrinth','Billie Eilish','The Weeknd','Sia','Kid Cudi'].map((name, idx) => (
										<div key={name} className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 hover:bg-neutral-900 transition">
											<div className="h-28 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-900 mb-3 grid place-items-center text-3xl">
												<span>{name.split(' ').map(s=>s[0]).slice(0,2).join('')}</span>
											</div>
											<div className="font-medium truncate">{name}</div>
											<div className="text-xs text-neutral-400">{50-idx}M Plays</div>
										</div>
									))}
								</div>
							</div>

							{/* Genres */}
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
								{['Dance','Electro Pop','Indie','Hip Hop','Classical','Rap'].map((g, i) => (
									<div key={g} className={`rounded-xl p-4 text-sm font-semibold border border-neutral-800 ${i%2? 'bg-neutral-900/70':'bg-neutral-900/40'} hover:bg-neutral-900 transition`}>{g}</div>
								))}
							</div>
						</div>
					) : (
						<div className="p-6">
							{/* Search header */}
							{searchQuery.trim() && (
								<div className="mb-4">
									<h2 className="text-lg font-semibold mb-1">
										Search results for "{searchQuery}"
										{selectedPlaylistId !== 'all' && (
											<span className="text-sm font-normal text-neutral-400 ml-2">
												in {playlists.find(p => p.id === selectedPlaylistId)?.name || 'playlist'}
											</span>
										)}
									</h2>
									<p className="text-sm text-neutral-400">
										{visibleTracks.length === 0 
											? 'No tracks found' 
											: `${visibleTracks.length} ${visibleTracks.length === 1 ? 'track' : 'tracks'} found`
										}
									</p>
								</div>
							)}
							
							{tracks.length === 0 ? (
								<div className="text-neutral-400">Add some MP3s to start listening.</div>
							) : visibleTracks.length === 0 && searchQuery.trim() ? (
								<div className="text-neutral-400 text-center py-8">
									<p>No tracks found matching "{searchQuery}"</p>
									<button 
										onClick={() => setSearchQuery('')}
										className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm"
									>
										Clear search
									</button>
								</div>
							) : (
								<ul className="divide-y divide-neutral-900">
									{visibleTracks.map((t, i) => {
										const globalIndex = tracks.findIndex((x) => x.id === t.id);
										const isInCurrentPlaylist = selectedPlaylistId !== 'all' && 
											playlists.find((p) => p.id === selectedPlaylistId)?.trackIds.includes(t.id);
										
										return (
											<li key={t.id} className={`grid grid-cols-[48px_1fr_auto] items-center gap-3 px-2 py-3 hover:bg-neutral-900/50 ${globalIndex===currentIndex?'bg-neutral-900':''}`} onDoubleClick={() => playIndex(globalIndex)}>
												<span className="text-neutral-500 text-sm text-right">{i + 1}</span>
												<span className="truncate">{t.title}</span>
												<div className="flex gap-2">
													{selectedPlaylistId === 'all' ? (
														<>
															{/* Add to Playlist Dropdown */}
															<div className="relative group/playlist">
																<button 
																	className="text-xs bg-emerald-800/50 border border-emerald-700 px-2 py-1 rounded hover:bg-emerald-800" 
																	title="Add to playlist"
																>
																	+ Playlist
																</button>
																{playlists.length > 0 && (
																	<div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 min-w-[150px] opacity-0 invisible group-hover/playlist:opacity-100 group-hover/playlist:visible transition-all duration-150 z-10">
																		{playlists.map((pl) => (
																			<button
																				key={pl.id}
																				className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-700 whitespace-nowrap"
																				onClick={(e) => { 
																					e.stopPropagation(); 
																					addToSelectedPlaylist(t.id, pl.id);
																				}}
																			>
																				{pl.name} ({pl.trackIds.length})
																			</button>
																		))}
																	</div>
																)}
															</div>
															<button 
																className="text-xs bg-red-900/50 border border-red-800 px-2 py-1 rounded hover:bg-red-900" 
																onClick={(e) => { e.stopPropagation(); deleteTrack(t.id); }}
																title="Delete from library"
															>
																🗑️
															</button>
														</>
													) : (
														<>
															{isInCurrentPlaylist ? (
																<button 
																	className="text-xs bg-orange-900/50 border border-orange-800 px-2 py-1 rounded hover:bg-orange-900" 
																	onClick={(e) => { e.stopPropagation(); removeFromPlaylist(t.id); }}
																	title="Remove from this playlist"
																>
																	Remove
																</button>
															) : (
																<button 
																	className="text-xs bg-emerald-800/50 border border-emerald-700 px-2 py-1 rounded hover:bg-emerald-800" 
																	onClick={(e) => { e.stopPropagation(); addToSelectedPlaylist(t.id); }}
																	title="Add to this playlist"
																>
																	+ Add
																</button>
															)}
															<button 
																className="text-xs bg-red-900/50 border border-red-800 px-2 py-1 rounded hover:bg-red-900" 
																onClick={(e) => { e.stopPropagation(); deleteTrack(t.id); }}
																title="Delete from library"
															>
																🗑️
															</button>
														</>
													)}
												</div>
											</li>
										);
									})}
								</ul>
							)}
						</div>
					)}
				</section>

				{/* Now Playing panel */}
				<aside className="hidden md:block border-l border-neutral-900 bg-neutral-950 p-4">
					<div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4">
						<div className="h-40 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-900 mb-4 grid place-items-center">
							{isLoading ? (
								<span className="text-2xl animate-pulse">⏳</span>
							) : (
								<span className="text-3xl">🎵</span>
							)}
						</div>
						<div className="font-semibold text-lg truncate">{(tracks[currentIndex]?.title) || 'No track selected'}</div>
						<div className="text-xs text-neutral-400 mb-4">
							{isLoading ? 'Loading...' : loadError ? 'Error' : 'Local'}
						</div>
						{loadError && (
							<div className="text-xs text-red-400 mb-2">{loadError}</div>
						)}
						<div className="flex items-center gap-2">
							<span className="text-xs text-neutral-500">{formatTime(currentTime)}</span>
							<input className="w-full" type="range" min="0" max={duration || 0} step="0.1" value={currentTime} onChange={onSeek} disabled={isLoading} />
							<span className="text-xs text-neutral-500">{formatTime(duration)}</span>
						</div>
						<div className="flex items-center justify-center gap-3 mt-3">
							<button className="bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-full disabled:opacity-50" onClick={prev} disabled={!currentTrack || tracks.length === 0}>⏮</button>
							<button className="bg-emerald-500 text-black px-4 py-2 rounded-full text-base font-semibold disabled:opacity-50" onClick={playPause} disabled={!currentTrack || isLoading}>
								{isLoading ? '⏳' : (isPlaying ? 'Pause' : 'Play')}
							</button>
							<button className="bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-full disabled:opacity-50" onClick={next} disabled={!currentTrack || tracks.length === 0}>⏭</button>
						</div>
					</div>
				</aside>
			</main>

			{/* Footer Player (compact) */}
			<footer className="grid grid-cols-3 items-center gap-4 px-4 py-4 bg-neutral-900/80 backdrop-blur border-t border-neutral-800">
				<audio
					ref={audioRef}
					onTimeUpdate={onTimeUpdate}
					preload="auto"
				/>
				<div className="flex items-center justify-center gap-3">
					<button className="bg-neutral-700 text-white px-3 py-2 rounded-full disabled:opacity-50" onClick={prev} title="Previous" disabled={!currentTrack || tracks.length === 0}>⏮</button>
					<button className="bg-neutral-700 text-white px-4 py-2 rounded-full text-lg disabled:opacity-50" onClick={playPause} title="Play/Pause" disabled={!currentTrack || isLoading}>
						{isLoading ? '⏳' : (isPlaying ? '⏸' : '▶️')}
					</button>
					<button className="bg-neutral-700 text-white px-3 py-2 rounded-full disabled:opacity-50" onClick={next} title="Next" disabled={!currentTrack || tracks.length === 0}>⏭</button>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-xs text-neutral-400">{formatTime(currentTime)}</span>
					<input className="w-full" type="range" min="0" max={duration || 0} step="0.1" value={currentTime} onChange={onSeek} disabled={!currentTrack || isLoading} />
					<span className="text-xs text-neutral-400">{formatTime(duration)}</span>
				</div>
				<div className="flex items-center gap-2 justify-end">
					<span>🔊</span>
					<input type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolume} />
				</div>
				{loadError && (
					<div className="col-span-3 text-xs text-red-400 text-center">{loadError}</div>
				)}
			</footer>

			{/* Custom Prompt Modal */}
			{showPrompt && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-50" onClick={() => setShowPrompt(false)}>
					<div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
						<h3 className="text-lg font-semibold mb-4">{promptConfig.title}</h3>
						<input
							type="text"
							defaultValue={promptConfig.defaultValue}
							placeholder="Enter name..."
							className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 mb-4 outline-none focus:border-emerald-500 transition"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									promptConfig.onConfirm(e.target.value);
									setShowPrompt(false);
								} else if (e.key === 'Escape') {
									setShowPrompt(false);
								}
							}}
						/>
						<div className="flex gap-2 justify-end">
							<button
								className="bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-md hover:bg-neutral-700 transition"
								onClick={() => setShowPrompt(false)}
							>
								Cancel
							</button>
							<button
								className="bg-emerald-500 text-black px-4 py-2 rounded-md font-semibold hover:bg-emerald-600 transition"
								onClick={(e) => {
									const input = e.target.parentElement.previousElementSibling;
									promptConfig.onConfirm(input.value);
									setShowPrompt(false);
								}}
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Toast Notification */}
			{toast && (
				<div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
					<div className={`px-6 py-3 rounded-lg shadow-2xl border ${
						toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100' :
						toast.type === 'error' ? 'bg-red-900/90 border-red-700 text-red-100' :
						'bg-neutral-800/90 border-neutral-700 text-neutral-100'
					} backdrop-blur-sm`}>
						{toast.message}
					</div>
				</div>
			)}
		</div>
	);
}


