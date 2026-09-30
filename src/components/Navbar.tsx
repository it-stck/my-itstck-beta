import React from 'react';
import { UserProfile } from '../types';

export type AppView = 'landing' | 'explore' | 'editor' | 'profile' | 'dashboard';

interface NavbarProps {
  activeView: AppView;
  onNavigate: (view: AppView, username?: string) => void;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onOpenSsgModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  currentUser,
  onOpenAuthModal,
  onOpenSsgModal,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text element wordmark (Strict Top Bar Contract) */}
      <a
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('landing');
        }}
        className="font-display-syne text-lg font-bold tracking-tight text-slate-100 hover:text-white transition-colors whitespace-nowrap"
      >
        my.itstck.com
      </a>

      {/* Zone 2: 5 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('explore')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-slate-100 ${
            activeView === 'explore' ? 'text-slate-100 underline underline-offset-8 decoration-blue-500 decoration-2' : ''
          }`}
        >
          Explore Network
        </button>
        <button
          type="button"
          onClick={() => onNavigate('editor')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-slate-100 ${
            activeView === 'editor' ? 'text-slate-100 underline underline-offset-8 decoration-blue-500 decoration-2' : ''
          }`}
        >
          Studio Editor
        </button>
        <button
          type="button"
          onClick={() => onNavigate('profile', currentUser.username)}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-slate-100 font-mono text-xs ${
            activeView === 'profile' ? 'text-blue-400 underline underline-offset-8 decoration-blue-500 decoration-2' : ''
          }`}
        >
          /@{currentUser.username}
        </button>
        <button
          type="button"
          onClick={onOpenSsgModal}
          className="whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-slate-100"
        >
          HTML Compiler
        </button>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer hover:text-slate-100 ${
            activeView === 'dashboard' ? 'text-slate-100 underline underline-offset-8 decoration-blue-500 decoration-2' : ''
          }`}
        >
          Dashboard &amp; SSO
        </button>
      </nav>

      {/* Zone 3: 2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Session: @{currentUser.username}
        </button>
        <button
          type="button"
          onClick={() => onNavigate('editor')}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Edit My Page
        </button>
      </div>
    </header>
  );
};
