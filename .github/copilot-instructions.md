# BoomBox - Personal Local Music Player

## Project Overview
BoomBox is a desktop music player built with React, Electron, Node.js, and Tailwind CSS. Users can host and play their own music files locally without relying on streaming services.

## Tech Stack
- **Frontend**: React 19.2.0 with hooks
- **Desktop**: Electron 39.1.0
- **Styling**: Tailwind CSS 3.4.14 with custom dark theme
- **Build Tool**: Vite 7.2.1
- **State Management**: React hooks (useState, useEffect, useRef, useMemo)
- **Storage**: localStorage for persistence

## Architecture

### File Structure
```
BoomBox/
├── electron/
│   ├── main.js       # Electron main process (IPC handlers, file system access)
│   └── preload.js    # Context bridge for secure IPC
├── src/
│   ├── App.jsx       # Main application component (all logic)
│   ├── main.jsx      # React entry point
│   └── index.css     # Global styles
└── [config files]    # Vite, Tailwind, PostCSS configs
```

### Key Features

#### ✅ Implemented Features
1. **Music Player**
   - Play/pause, previous/next track
   - Seek bar with time display
   - Volume control (0-100%)
   - Auto-play next track on completion
   - Support for MP3, WAV, OGG, M4A, FLAC

2. **File Management**
   - Upload via web file picker (File API)
   - Upload via Electron native dialog (IPC)
   - Automatic blob URL management and cleanup
   - LocalStorage persistence for file paths

3. **Library & Playlists**
   - View all tracks
   - Create custom playlists
   - Add tracks to playlists
   - Remove tracks from playlists
   - Delete tracks from library (with confirmation)
   - Delete playlists (with confirmation)
   - Rename playlists
   - Track count display per playlist

4. **Search**
   - Real-time search across all tracks
   - Search within specific playlists
   - Auto-switch to library view when searching

5. **UI/UX**
   - Dark theme with pink/emerald accents
   - Ambient gradients and blur effects
   - Two-panel layout: Explore (home) and Library
   - Responsive grid layouts
   - Hover interactions and visual feedback

#### 🚧 Current Limitations
- Only tested with MP3 files (other formats supported but not extensively tested)
- No drag-and-drop upload
- No album art display
- No metadata editing
- No shuffle/repeat modes
- No equalizer
- Search is title-only (no artist/album search)

## Code Patterns & Conventions

### State Management
```javascript
// Primary state in App.jsx
const [tracks, setTracks] = useState([])           // All music files
const [playlists, setPlaylists] = useState([])     // User-created playlists
const [currentIndex, setCurrentIndex] = useState(-1) // Currently playing track
const [srcMap, setSrcMap] = useState({})           // Blob URL cache
```

### Track Object Structure
```javascript
{
  id: string,           // Unique identifier
  path?: string,        // File system path (Electron)
  file?: File,          // File object (web upload)
  title: string         // Display name (filename)
}
```

### Playlist Object Structure
```javascript
{
  id: string,           // Unique identifier (pl-{timestamp})
  name: string,         // User-defined name
  trackIds: string[]    // Array of track IDs
}
```

### IPC Communication (Electron)
```javascript
// Exposed via preload.js bridge
window.boombox.openFiles()              // Open file dialog
window.boombox.readAudio(path)          // Read audio file as ArrayBuffer
```

### Blob URL Management
- Create blob URLs from File objects or ArrayBuffers
- Cache in `srcMap` state (trackId -> blob URL)
- Track active URLs in `blobUrlsRef` for cleanup
- Revoke URLs when tracks are deleted or on unmount

### LocalStorage Schema
```javascript
{
  tracks: [{ id, path, title }],  // Only file-path tracks (not File objects)
  playlists: [{ id, name, trackIds }]
}
```

## Design System

### Colors
- **Background**: `neutral-950` (nearly black)
- **Panels**: `neutral-900` with transparency
- **Borders**: `neutral-800`, `neutral-700`
- **Primary Actions**: `emerald-500`, `emerald-600`
- **Accents**: Pink gradients, emerald glows
- **Destructive**: Red tones (`red-900`, `red-800`)

### Typography
- **Font**: System default (no custom fonts)
- **Headers**: `text-lg` to `text-4xl`, `font-semibold` to `font-extrabold`
- **Body**: `text-sm`, `text-base`
- **Monospace**: Time displays

### Spacing
- Consistent use of Tailwind spacing scale
- `gap-2`, `gap-3`, `gap-4` for flex/grid
- `px-3 py-2` for buttons
- `p-4`, `p-6` for sections

## Development Commands
```bash
npm run dev    # Start Vite dev server + Electron
npm run build  # Build for production
npm start      # Run Electron only (production)
```

## Future Enhancement Ideas
- Drag-and-drop file upload
- Album art extraction and display
- ID3 tag editing
- Shuffle and repeat modes
- Queue management
- Keyboard shortcuts
- Import/export playlists
- Lyrics display
- Audio visualization
- Equalizer controls
- Theme customization
- Cross-fade between tracks
- Last.fm scrobbling

## Important Notes for AI Assistants
1. **All logic is in App.jsx** - This is a single-component app; refactoring into separate components could improve maintainability
2. **Blob URL lifecycle is critical** - Always clean up URLs to prevent memory leaks
3. **Search auto-switches to Library view** - This is intentional UX behavior
4. **Playlist buttons show context-aware actions**:
   - "All Tracks" view: Shows disabled "+ Playlist" button and delete
   - Playlist view: Shows "Add"/"Remove" based on membership + delete
5. **Confirmation dialogs** - Use native `confirm()` for destructive actions
6. **Audio element is in footer** - Single `<audio>` element shared across all tracks
7. **Electron IPC is minimal** - Only used for native file dialog and file reading

## Testing Checklist
When making changes, verify:
- [ ] Tracks persist after app restart
- [ ] Playlists persist after app restart
- [ ] Audio plays without errors
- [ ] Search works across all views
- [ ] Delete operations clean up properly
- [ ] No memory leaks from blob URLs
- [ ] UI remains responsive with many tracks
- [ ] Electron native dialog works (if applicable)
