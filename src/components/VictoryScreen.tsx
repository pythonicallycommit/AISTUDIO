import React from 'react';
import { Trophy, Coins, Heart, CheckCircle2, RotateCcw } from 'lucide-react';
import { PlayerState, VictoryReward } from '../types/game';

interface VictoryScreenProps {
  playerState: PlayerState;
  onChooseReward: (reward: 'money' | 'golden_heart') => void;
  onRestart: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  playerState,
  onChooseReward,
  onRestart,
}) => {
  const [chosenReward, setChosenReward] = React.useState<VictoryReward>(null);

  const handleSelect = (choice: 'money' | 'golden_heart') => {
    setChosenReward(choice);
    onChooseReward(choice);
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-amber-500/80 rounded-2xl p-6 md:p-8 shadow-2xl shadow-amber-950/50 flex flex-col items-center text-center">
        {/* Trophy Header */}
        <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/80 flex items-center justify-center mb-3 text-amber-400 shadow-lg shadow-amber-950">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
          Infernal Gate Breached
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mt-1 drop-shadow-[0_2px_12px_rgba(251,191,36,0.5)]">
          You Escaped Omar!
        </h2>

        <p className="mt-2 text-zinc-300 text-sm max-w-md">
          You conquered the hellish parkour, outmaneuvered Agent Omar, and shattered the Titan’s arena! The ancient vault grants you a final legendary boon:
        </p>

        {/* The Choice: +500 Money OR Golden Heart */}
        {!chosenReward ? (
          <div className="w-full my-6">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
              SELECT YOUR ESCAPE BOON:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Choice 1: +500 Money */}
              <button
                onClick={() => handleSelect('money')}
                className="group p-5 rounded-xl bg-zinc-900/90 border-2 border-amber-600/70 hover:border-amber-400 hover:bg-amber-950/30 transition-all text-left flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-amber-900/40"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Coins className="w-6 h-6" />
                  </div>
                  <h3 className="font-mono font-bold text-lg text-white group-hover:text-amber-300">
                    +500 HELL GOLD
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Claim the underworld’s forbidden treasure hoard. Riches fit for an escape legend.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-xs font-mono text-amber-400 font-semibold flex items-center gap-1">
                  CLAIM WEALTH &rarr;
                </div>
              </button>

              {/* Choice 2: Golden Heart */}
              <button
                onClick={() => handleSelect('golden_heart')}
                className="group p-5 rounded-xl bg-zinc-900/90 border-2 border-yellow-500/70 hover:border-yellow-300 hover:bg-yellow-950/30 transition-all text-left flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-yellow-900/40"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 fill-yellow-400" />
                  </div>
                  <h3 className="font-mono font-bold text-lg text-white group-hover:text-yellow-300">
                    GOLDEN HEART
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    A divine celestial shield. Absorbs any fatal strike or lava burn, shielding your soul.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800 text-xs font-mono text-yellow-400 font-semibold flex items-center gap-1">
                  FORGE SHIELD &rarr;
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="my-6 p-4 rounded-xl bg-amber-950/50 border border-amber-500/60 flex items-center gap-3 w-full text-left">
            <CheckCircle2 className="w-7 h-7 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-mono text-amber-300 uppercase tracking-wider">Reward Claimed</div>
              <div className="font-bold text-white text-base">
                {chosenReward === 'money' ? '★ +500 HELL GOLD ADDED TO INVENTORY' : '★ DIVINE GOLDEN HEART SHIELD FORGED'}
              </div>
            </div>
          </div>
        )}

        {/* Score & Summary */}
        <div className="flex gap-4 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl w-full justify-around font-mono text-xs mb-6">
          <div>
            <span className="text-zinc-500">FINAL SCORE:</span>{' '}
            <strong className="text-white text-sm">{playerState.score} PTS</strong>
          </div>
          <div>
            <span className="text-zinc-500">LEVELS:</span>{' '}
            <strong className="text-amber-400 text-sm">{playerState.level} / 8</strong>
          </div>
          <div>
            <span className="text-zinc-500">TOTAL FALLS:</span>{' '}
            <strong className="text-zinc-300 text-sm">{playerState.totalFalls}</strong>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-mono font-bold rounded-xl shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
        >
          <RotateCcw className="w-5 h-5" /> ESCAPE AGAIN / NEW RUN
        </button>
      </div>
    </div>
  );
};
