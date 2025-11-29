import React, { useRef, useState } from 'react';
import useAudioManager from './hooks/useAudioManager';
import usePlaylists from './hooks/usePlaylists';
import useMusicLibrary, { useTrackFilter } from './hooks/useMusicLibrary';
import useLibraryPersistence from './hooks/useLibraryPersistence';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import HomeView from './components/library/HomeView';
import TrackList from './components/library/TrackList';
import NowPlaying from './components/player/NowPlaying';
import Footer from './components/player/Footer';
import Modal, { InputModal } from './components/common/Modal';
import Toast from './components/common/Toast';

export default function App() {
    const audioRef = useRef(null);
    const [activeView, setActiveView] = useState('home');
    const [toast, setToast] = useState(null);
    const [inputModal, setInputModal] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { tracks, addTracks, deleteTrack } = useMusicLibrary();
    const {
        playlists,
        selectedPlaylistId,
        selectPlaylist,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addToPlaylist,
        removeFromPlaylist
    } = usePlaylists();

    const {
        currentIndex,
        isPlaying,
        isLoading,
        loadError,
        currentTime,
        duration,
        volume,
        currentTrack,
        play,
        playPause,
        next,
        prev,
        seek,
        setVolume: updateVolume
    } = useAudioManager(tracks, audioRef);

    const filteredTracks = useTrackFilter(tracks, playlists, selectedPlaylistId, searchQuery);
    useLibraryPersistence(tracks, playlists);

    React.useEffect(() => {
        if (searchQuery.trim() && activeView !== 'library') {
            setActiveView('library');
        }
    }, [searchQuery, activeView]);

    const handleAddFilesElectron = async () => {
        try {
            if (!window.boombox?.openFiles) {
                showToast('error', 'Native file picker not available');
                return;
            }
            const paths = await window.boombox.openFiles();
            if (paths && paths.length > 0) {
                addTracks(paths);
                showToast('success', 'Added ' + paths.length + ' track(s)');
            }
        } catch (err) {
            console.error('Error adding files:', err);
            showToast('error', 'Failed to add files');
        }
    };

    const handleImportFiles = (e) => {
        try {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                addTracks(files);
                showToast('success', 'Added ' + files.length + ' track(s)');
            }
        } catch (err) {
            console.error('Error importing files:', err);
            showToast('error', 'Failed to import files');
        }
    };

    const handleCreatePlaylist = () => {
        setInputModal({
            title: 'Create Playlist',
            placeholder: 'Playlist name',
            defaultValue: '',
            onConfirm: (name) => {
                if (name.trim()) {
                    createPlaylist(name.trim());
                    showToast('success', 'Created playlist "' + name.trim() + '"');
                }
                setInputModal(null);
            },
            onCancel: () => setInputModal(null)
        });
    };

    const handleRenamePlaylist = (playlistId) => {
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return;
        setInputModal({
            title: 'Rename Playlist',
            placeholder: 'New name',
            defaultValue: playlist.name,
            onConfirm: (newName) => {
                if (newName.trim()) {
                    renamePlaylist(playlistId, newName.trim());
                    showToast('success', 'Renamed to "' + newName.trim() + '"');
                }
                setInputModal(null);
            },
            onCancel: () => setInputModal(null)
        });
    };

    const handleDeletePlaylist = (playlistId) => {
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return;
        setConfirmModal({
            title: 'Delete Playlist',
            message: 'Are you sure you want to delete "' + playlist.name + '"? This will not delete the tracks.',
            onConfirm: () => {
                deletePlaylist(playlistId);
                showToast('success', 'Playlist deleted');
                setConfirmModal(null);
            },
            onCancel: () => setConfirmModal(null)
        });
    };

    const handleDeleteTrack = (trackId) => {
        const track = tracks.find((t) => t.id === trackId);
        if (!track) return;
        setConfirmModal({
            title: 'Delete Track',
            message: 'Are you sure you want to delete "' + track.title + '" from your library?',
            onConfirm: () => {
                deleteTrack(trackId);
                showToast('success', 'Track deleted');
                setConfirmModal(null);
            },
            onCancel: () => setConfirmModal(null)
        });
    };

    const handleAddToPlaylist = (trackId, playlistId) => {
        if (!playlistId) return;
        addToPlaylist(trackId, playlistId);
        const playlist = playlists.find((p) => p.id === playlistId);
        showToast('success', 'Added to "' + (playlist?.name || 'playlist') + '"');
    };

    const handleRemoveFromPlaylist = (trackId) => {
        if (selectedPlaylistId === 'all') return;
        removeFromPlaylist(trackId, selectedPlaylistId);
        showToast('success', 'Removed from playlist');
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handlePlaylistSelect = (playlistId) => {
        selectPlaylist(playlistId);
        setActiveView('library');
    };

    const handleTrackPlay = (index) => {
        if (index >= 0 && index < tracks.length) {
            if (currentIndex === index) {
                playPause();
            } else {
                play(index);
            }
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-dark-950 text-white font-sans">
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddFiles={handleAddFilesElectron}
                onImportFiles={handleImportFiles}
            />
            <div className="flex-1 flex overflow-hidden p-4 gap-4">
                <Sidebar
                    activeView={activeView}
                    onViewChange={setActiveView}
                    selectedPlaylistId={selectedPlaylistId}
                    playlists={playlists}
                    tracks={tracks}
                    onPlaylistSelect={handlePlaylistSelect}
                    onCreatePlaylist={handleCreatePlaylist}
                    onRenamePlaylist={handleRenamePlaylist}
                    onDeletePlaylist={handleDeletePlaylist}
                />
                <main className="flex-1 glass rounded-3xl overflow-hidden flex flex-col relative">
                    <div className="absolute inset-0 overflow-y-auto p-6 scroll-smooth">
                        {activeView === 'home' ? (
                            <HomeView
                                tracks={tracks}
                                playlists={playlists}
                                onPlaylistSelect={handlePlaylistSelect}
                                onTrackPlay={handleTrackPlay}
                            />
                        ) : (
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold mb-2">
                                        {selectedPlaylistId === 'all'
                                            ? 'All Tracks'
                                            : playlists.find((p) => p.id === selectedPlaylistId)?.name || 'Playlist'}
                                    </h2>
                                    <div className="text-neutral-400 text-sm">
                                        {filteredTracks.length} {filteredTracks.length === 1 ? 'track' : 'tracks'}
                                        {searchQuery && ` matching "${searchQuery}"`}
                                    </div>
                                </div>
                                <TrackList
                                    tracks={filteredTracks}
                                    allTracks={tracks}
                                    currentTrackId={currentTrack?.id}
                                    selectedPlaylistId={selectedPlaylistId}
                                    playlists={playlists}
                                    searchQuery={searchQuery}
                                    onTrackPlay={handleTrackPlay}
                                    onAddToPlaylist={handleAddToPlaylist}
                                    onRemoveFromPlaylist={handleRemoveFromPlaylist}
                                    onDeleteTrack={handleDeleteTrack}
                                />
                            </div>
                        )}
                    </div>
                </main>
                {currentTrack && (
                    <aside className="w-80 border-l border-neutral-800/50 glass p-6 overflow-y-auto">
                        <NowPlaying
                            currentTrack={currentTrack}
                            isPlaying={isPlaying}
                            isLoading={isLoading}
                            loadError={loadError}
                            currentTime={currentTime}
                            duration={duration}
                            onSeek={seek}
                            onPlayPause={playPause}
                            onNext={next}
                            onPrev={prev}
                        />
                    </aside>
                )}
            </div>
            <Footer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={Math.round(volume * 100)}
                onPlayPause={playPause}
                onNext={next}
                onPrev={prev}
                onSeek={seek}
                onVolumeChange={(v) => updateVolume(v / 100)}
            />
            <audio ref={audioRef} />
            {inputModal && (
                <InputModal
                    title={inputModal.title}
                    placeholder={inputModal.placeholder}
                    defaultValue={inputModal.defaultValue}
                    onConfirm={inputModal.onConfirm}
                    onClose={inputModal.onCancel}
                />
            )}
            {confirmModal && (
                <Modal onClose={confirmModal.onCancel}>
                    <h3 className="text-xl font-semibold mb-3">{confirmModal.title}</h3>
                    <p className="text-neutral-400 mb-6">{confirmModal.message}</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={confirmModal.onCancel}
                            className="px-4 py-2 rounded-lg glass hover:glass-strong transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmModal.onConfirm}
                            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 transition-all"
                        >
                            Delete
                        </button>
                    </div>
                </Modal>
            )}
            {toast && <Toast type={toast.type} message={toast.message} />}
        </div>
    );
}
