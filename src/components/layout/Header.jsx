import React from 'react';

/**
 * Header component with search and action buttons
 */
export default function Header({ searchQuery, onSearchChange, onAddFiles, onImportFiles }) {
	return (
		<header className="flex items-center justify-between px-6 py-4">
			<div className="flex items-center gap-4 w-64">
				<div className="relative group cursor-pointer">
					<div className="absolute inset-0 bg-primary blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>

					<img src="/images/icons/Boombox_logo.png" alt="Logo" className="relative h-10 w-10 rounded-xl" />
					{/* <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary grid place-items-center font-black text-lg shadow-2xl text-white">
						B
					</div> */}
				</div>
				<div>
					<div className="font-bold text-xl tracking-tight text-white">BoomBox</div>
					<div className="text-xs text-white/40 font-medium">Premium Audio</div>
				</div>
			</div>

			<div className="flex-1 max-w-xl mx-8">
				<div className="relative group">
					<div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
					<div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 transition-all focus-within:bg-white/10 focus-within:border-primary/50">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/40">
							<path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
							<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
						</svg>
						<input
							type="text"
							placeholder="Search tracks, artists, albums..."
							className="bg-transparent outline-none text-sm w-full placeholder:text-white/30 text-white"
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
						{searchQuery && (
							<button
								onClick={() => onSearchChange('')}
								className="text-white/40 hover:text-white transition-colors"
								title="Clear search"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
									<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
								</svg>
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="flex gap-3">
				<button
					className="relative group bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2"
					onClick={onAddFiles}
				>
					<span className="text-lg">📂</span>
					<span>Add Files</span>
				</button>
				<label className="relative group bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition-all hover:scale-105 cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2">
					<input
						type="file"
						accept="audio/*"
						multiple
						onChange={onImportFiles}
						className="hidden"
					/>
					<span className="text-lg">⬇️</span>
					<span>Import</span>
				</label>
			</div>
		</header>
	);
}
