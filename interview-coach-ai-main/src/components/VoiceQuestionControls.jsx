import { Volume2, VolumeX, Radio } from 'lucide-react';

/**
 * Reusable VoiceQuestionControls Component
 * Controls AI Text-To-Speech question reading.
 */
export default function VoiceQuestionControls({
  isSpeaking,
  onReplay,
  onStop,
  disabled = false,
}) {
  return (
    <div className="flex items-center gap-3 my-3 flex-wrap">
      {isSpeaking ? (
        <button
          type="button"
          onClick={onStop}
          disabled={disabled}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/50 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition cursor-pointer animate-pulse"
        >
          <VolumeX className="w-4 h-4 text-purple-400" />
          <span>🔇 Stop Voice</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onReplay}
          disabled={disabled}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-purple-300 text-xs font-semibold hover:border-purple-500/50 hover:bg-purple-500/10 transition cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-purple-400" />
          <span>🔊 Replay Question</span>
        </button>
      )}

      {isSpeaking && (
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
          <Radio className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span>🔊 AI Interviewer is speaking...</span>
        </div>
      )}
    </div>
  );
}
