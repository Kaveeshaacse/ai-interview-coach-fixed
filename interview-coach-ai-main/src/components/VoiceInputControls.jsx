import { Mic, MicOff, Trash2, AlertTriangle, Radio } from 'lucide-react';
import Button from './Button';

/**
 * Reusable VoiceInputControls Component
 * Rendered near answer boxes in Technical & Mock Interview modules.
 */
export default function VoiceInputControls({
  isListening,
  isSupported,
  error,
  onStart,
  onStop,
  onClear,
  disabled = false,
}) {
  return (
    <div className="space-y-2 mt-3">
      {/* Action Buttons Row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isListening ? (
            <button
              type="button"
              onClick={onStop}
              disabled={disabled}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition cursor-pointer animate-pulse ring-2 ring-red-500/30"
            >
              <Radio className="w-4 h-4 text-red-400 animate-spin" />
              <span>🔴 Stop Speaking</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStart}
              disabled={disabled || !isSupported}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-4 h-4 text-purple-400" />
              <span>🎙 Start Speaking</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-slate-400 text-xs font-medium hover:text-white hover:border-slate-500 transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Real-time Status Badge */}
        {isListening && (
          <div className="flex items-center gap-2 text-xs text-red-400 font-semibold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>🔴 Listening... Speak your answer...</span>
          </div>
        )}
      </div>

      {/* Browser Support Warning */}
      {!isSupported && (
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.</span>
        </div>
      )}

      {/* Error Message Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
