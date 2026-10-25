import React from 'react';
import { Flame, ShieldAlert, Award, Skull, Play, Eye } from 'lucide-react';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ highScore, onStart }) => {
  return (
    <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gradient-to-b from-zinc-900 to-black border border-red-900/80 rounded-2xl p-6 md:p-8 shadow-2xl shadow-red-950/50 flex flex-col items-center text-center">
        {/* Header Icon & Title */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
          Infernal 3D Prison Parkour
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-[0_2px_12px_rgba(255,50,0,0.6)]">
          Escape <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400">Omar</span>
        </h1>

        <p className="mt-2 text-zinc-300 text-sm md:text-base max-w-lg leading-relaxed">
          You are trapped in the volcanic dungeon of Agent Omar. Traverse treacherous obsidian platforms, leap over the sea of boiling lava, and evade Omar’s lethal hunt.
        </p>

        {/* High Score Badge */}
        {highScore > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-950/60 border border-amber-500/50 px-4 py-1.5 rounded-full text-amber-300 font-mono text-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>RECORD HIGH SCORE: <strong className="text-white">{highScore} PTS</strong></span>
          </div>
        )}

        {/* Core Rules & Controls Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full my-6 text-left">
          {/* Controls Box */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Controls
            </div>
            <ul className="space-y-1.5 text-xs font-mono text-zinc-300">
              <li><strong className="text-white">WASD / Arrows:</strong> Move runner</li>
              <li><strong className="text-white">SPACE:</strong> Jump across chasms</li>
              <li><strong className="text-white">SHIFT:</strong> Sprint with stamina</li>
              <li><strong className="text-amber-400">Click / F / E:</strong> Attack with Infernal Blade</li>
              <li><strong className="text-white">Z:</strong> Toggle 1st / 3rd Person View</li>
              <li><strong className="text-white">P:</strong> Pause breach</li>
              <li><strong className="text-white">Mouse:</strong> Look & aim strikes</li>
            </ul>
          </div>

          {/* Rules & Objectives */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Skull className="w-4 h-4" /> Prison Rules
            </div>
            <ul className="space-y-1.5 text-xs font-mono text-zinc-300">
              <li><strong className="text-emerald-400">+10 Score:</strong> Every level cleared</li>
              <li><strong className="text-emerald-400">+10 Bonus:</strong> Zero mistakes in level</li>
              <li><strong className="text-red-400">3 Hearts:</strong> Falling loses 1 heart</li>
              <li><strong className="text-red-400">3 Falls:</strong> Sent back to previous level</li>
              <li><strong className="text-orange-400">Every 100 Pts:</strong> Mobs spawn & grow stronger</li>
              <li><strong className="text-purple-400">Score 500:</strong> Giant Titan Omar Boss fight</li>
            </ul>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full md:w-auto px-10 py-3.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-mono font-bold text-base rounded-xl shadow-lg shadow-red-900/40 hover:shadow-red-700/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-white" />
          START ESCAPE
        </button>
      </div>
    </div>
  );
};
