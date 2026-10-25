import React from 'react';
import { Skull, RotateCcw, Award } from 'lucide-react';
import { PlayerState } from '../types/game';

interface GameOverScreenProps {
  playerState: PlayerState;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  playerState,
  onRestart,
}) => {
  const isNewRecord = playerState.score >= playerState.highScore && playerState.score > 0;

  return (
    <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-b from-zinc-950 to-black border border-red-900/90 rounded-2xl p-6 md:p-8 shadow-2xl shadow-red-950/60 flex flex-col items-center text-center">
        {/* Skull Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-600/70 flex items-center justify-center mb-4 text-red-500 shadow-lg shadow-red-950">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-red-500 uppercase tracking-tight drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
          Escape Failed
        </h2>
        <p className="mt-1 text-zinc-400 text-sm">
          Agent Omar caught you in the infernal depths.
        </p>

        {isNewRecord && (
          <div className="mt-3 px-3.5 py-1 bg-amber-950/80 border border-amber-500/70 rounded-full text-amber-300 font-mono text-xs flex items-center gap-1.5 shadow-md">
            <Award className="w-3.5 h-3.5 text-amber-400" /> NEW RECORD HIGH SCORE!
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full my-6 font-mono text-left">
          <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Final Score</div>
            <div className="text-2xl font-bold text-white">{playerState.score}</div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Level Reached</div>
            <div className="text-2xl font-bold text-amber-400">{playerState.level}</div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Total Falls</div>
            <div className="text-2xl font-bold text-red-400">{playerState.totalFalls}</div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">High Score</div>
            <div className="text-2xl font-bold text-amber-300">{playerState.highScore}</div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-mono font-bold rounded-xl shadow-lg shadow-red-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <RotateCcw className="w-5 h-5" /> TRY ESCAPE AGAIN
        </button>
      </div>
    </div>
  );
};
