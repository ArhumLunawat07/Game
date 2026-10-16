/**
 * PROJECT: LAST SIGNAL - Data Log & Terminal Memo Reader
 */

import React from 'react';
import { Database, FileText, Check } from 'lucide-react';

interface LogModalProps {
  title: string;
  subtitle?: string;
  author?: string;
  timestamp?: string;
  content: string;
  isDataFragment?: boolean;
  onClose: () => void;
}

export const LogModal: React.FC<LogModalProps> = ({
  title,
  author,
  timestamp,
  content,
  isDataFragment = false,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded ${isDataFragment ? 'bg-sky-950/60 border border-sky-800/50 text-sky-400' : 'bg-slate-800 text-slate-300'}`}>
              {isDataFragment ? <Database className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                {isDataFragment ? 'RECOVERED DATA FRAGMENT' : 'STATION LOG ENTRY'}
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
          >
            DISMISS [ESC]
          </button>
        </div>

        {/* Metadata Strip */}
        {(author || timestamp) && (
          <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/40 flex items-center justify-between text-xs font-mono text-slate-400">
            {author && <span>ORIGIN: <strong className="text-slate-200">{author}</strong></span>}
            {timestamp && <span className="tabular-nums">{timestamp}</span>}
          </div>
        )}

        {/* Log Prose Content */}
        <div className="px-6 py-5 text-sm text-slate-200 leading-relaxed font-sans space-y-3 whitespace-pre-line max-h-72 overflow-y-auto">
          {content}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>TRANSMISSION BUFFER ARCHIVED</span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold font-mono text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>ACKNOWLEDGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
