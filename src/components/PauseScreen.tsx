import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PauseScreenProps {
  score: number;
  level: number;
  onResume: () => void;
  onRestart: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({
  score,
  level,
  onResume,
  onRestart,
}) => {
  const [muted, setMuted] = React.useState(soundManager.getMuted());

  const handleToggleMute = () => {
    const isNowMuted = soundManager.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="text-xs font-mono font-bold tracking-widest text-amber-500 uppercase mb-2">
          System Paused [P]
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
          Prison Break Halted
        </h2>

        <div className="flex gap-6 my-6 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 w-full justify-around font-mono">
          <div>
            <div className="text-xs text-zinc-400">CURRENT LEVEL</div>
            <div className="text-xl font-bold text-amber-400">{level}</div>
          </div>
          <div className="w-px bg-zinc-800" />
          <div>
            <div className="text-xs text-zinc-400">SCORE</div>
            <div className="text-xl font-bold text-white">{score}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onResume}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-mono font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-900/40"
          >
            <Play className="w-4 h-4 fill-white" /> RESUME BREACH
          </button>

          <button
            onClick={handleToggleMute}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 font-mono font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            {muted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> RESTART GAME
          </button>
        </div>
      </div>
    </div>
  );
};
