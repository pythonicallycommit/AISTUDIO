import React from 'react';
import { CameraView, PlayerState } from '../types/game';
import { Heart, ShieldAlert, Zap, Volume2, VolumeX, Eye, Pause, Sword } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HUDProps {
  playerState: PlayerState;
  cameraView: CameraView;
  omarDistance: number;
  omarIsHunting: boolean;
  notification: string | null;
  onToggleCamera: () => void;
  onTogglePause: () => void;
  onVirtualKey: (key: string, pressed: boolean) => void;
  onAttack: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerState,
  cameraView,
  omarDistance,
  omarIsHunting,
  notification,
  onToggleCamera,
  onTogglePause,
  onVirtualKey,
  onAttack,
}) => {
  const [muted, setMuted] = React.useState(soundManager.getMuted());
  const [showTouchControls, setShowTouchControls] = React.useState(false);

  // Auto detect touch devices
  React.useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setShowTouchControls(true);
    }
  }, []);

  const handleToggleMute = () => {
    const isNowMuted = soundManager.toggleMute();
    setMuted(isNowMuted);
  };

  // Hearts array
  const hearts = Array.from({ length: playerState.maxHearts }, (_, i) => i < playerState.hearts);

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-20">
      {/* Top Bar: Stats & Controls */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Hearts & Vitals */}
        <div className="flex flex-col gap-2">
          {/* Hearts Display */}
          <div className="flex items-center gap-1.5 bg-black/75 border border-red-900/60 px-3.5 py-2 rounded-xl shadow-lg shadow-red-950/40">
            {hearts.map((filled, idx) => (
              <Heart
                key={idx}
                className={`w-6 h-6 transition-all duration-300 ${
                  filled
                    ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : 'text-zinc-700 fill-zinc-900/40'
                }`}
              />
            ))}
            {playerState.hasGoldenHeart && (
              <div className="flex items-center gap-1 pl-1 border-l border-amber-500/40 ml-1">
                <Heart className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                <span className="text-[10px] font-bold text-amber-300 tracking-wider">SHIELD</span>
              </div>
            )}
            <div className="ml-2 pl-2 border-l border-zinc-700/60 text-xs font-mono text-zinc-400">
              FALLS: <span className="text-red-400 font-bold">{playerState.fallsInCurrentLevel}/3</span>
            </div>
          </div>

          {/* Sprint Stamina Bar */}
          <div className="bg-black/75 border border-zinc-800 px-3 py-1.5 rounded-lg w-52">
            <div className="flex justify-between items-center text-[10px] font-mono font-semibold tracking-wider text-zinc-400 mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> SPRINT [SHIFT]
              </span>
              <span className={playerState.sprintStamina < 20 ? 'text-red-400' : 'text-amber-400'}>
                {Math.round(playerState.sprintStamina)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  playerState.sprintStamina < 20 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${playerState.sprintStamina}%` }}
              />
            </div>
          </div>

          {/* Flawless Bonus Indicator */}
          {!playerState.hasMadeMistakeInLevel && (
            <div className="bg-emerald-950/70 border border-emerald-600/50 px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              FLAWLESS: +10 BONUS ACTIVE
            </div>
          )}
        </div>

        {/* Center: Omar Threat Radar & Boss Bar & Notification */}
        <div className="flex flex-col items-center max-w-md pointer-events-none">
          {/* Omar Threat Banner / Stun Status */}
          {playerState.omarStunTime > 0 ? (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400 bg-amber-950/95 text-amber-200 shadow-lg shadow-amber-900/60">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="text-xs font-mono font-bold tracking-wider">
                OMAR STUNNED! ({playerState.omarStunTime.toFixed(1)}s)
              </span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 shadow-lg ${
                omarIsHunting
                  ? 'bg-red-950/95 border-red-500 text-red-200 shadow-red-900/60'
                  : omarDistance < 25
                  ? 'bg-amber-950/85 border-amber-600/70 text-amber-200'
                  : 'bg-zinc-950/85 border-zinc-800 text-zinc-400'
              }`}
            >
              <ShieldAlert
                className={`w-4 h-4 ${
                  omarIsHunting
                    ? 'text-red-400'
                    : omarDistance < 25
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }`}
              />
              <span className="text-xs font-mono font-bold tracking-wider">
                {omarIsHunting ? 'ALERT: OMAR IS HUNTING YOU!' : `OMAR PROXIMITY: ${Math.round(omarDistance)}m`}
              </span>
            </div>
          )}

          {/* Boss Omar Health Bar (Level 8 / Score 500) */}
          {playerState.bossHealth !== null && (
            <div className="mt-2 w-72 bg-black/90 border border-red-600 rounded-xl p-2.5 shadow-2xl flex flex-col gap-1.5 pointer-events-none">
              <div className="flex justify-between items-center text-[11px] font-mono font-bold text-red-300">
                <span className="flex items-center gap-1">
                  <Sword className="w-3.5 h-3.5 text-amber-400" /> TITAN OMAR BOSS
                </span>
                <span className="text-amber-300">{playerState.bossHealth} / 500 HP</span>
              </div>
              <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-red-900">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, (playerState.bossHealth / 500) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Toast Notification Banner */}
          {notification && (
            <div className="mt-2 px-4 py-2 bg-black/95 border border-amber-500 text-amber-300 font-mono text-xs md:text-sm font-semibold rounded-lg shadow-xl shadow-black tracking-wide text-center">
              {notification}
            </div>
          )}
        </div>

        {/* Right: Score, Level & Utility Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* Score & Level Display */}
          <div className="bg-black/75 border border-zinc-800 px-4 py-2 rounded-xl shadow-lg flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Level</div>
              <div className="text-lg font-black text-amber-400 font-mono leading-none">{playerState.level}</div>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Score</div>
              <div className="text-lg font-black text-white font-mono leading-none">{playerState.score}</div>
            </div>
            {playerState.money > 0 && (
              <>
                <div className="h-6 w-px bg-zinc-800" />
                <div className="text-right">
                  <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Gold</div>
                  <div className="text-lg font-black text-amber-300 font-mono leading-none">+{playerState.money}</div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Quick Attack Button */}
            <button
              onClick={onAttack}
              className="bg-red-950/90 hover:bg-red-900 border border-red-600 text-red-200 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
              title="Slash Weapon [Click / F]"
            >
              <Sword className="w-3.5 h-3.5 text-amber-400" />
              <span>ATTACK [F]</span>
            </button>

            <button
              onClick={onToggleCamera}
              className="bg-black/75 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              title="Toggle View [Z]"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{cameraView === 'first' ? '1ST PERSON' : '3RD PERSON'} [Z]</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="bg-black/75 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 p-2 rounded-lg transition-colors cursor-pointer shadow-md"
              title={muted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onTogglePause}
              className="bg-black/75 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 p-2 rounded-lg transition-colors cursor-pointer shadow-md"
              title="Pause [P]"
            >
              <Pause className="w-4 h-4 text-zinc-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Aim Reticle (Center dot with subtle brackets for aiming strikes, no full lines) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
        <div className="absolute w-5 h-5 rounded-full border border-amber-500/20" />
      </div>

      {/* Bottom Center: Quick Controls Reference Dock */}
      <div className="self-center bg-black/75 border border-zinc-800 px-4 py-1.5 rounded-full text-[11px] font-mono text-zinc-400 flex items-center gap-3.5 shadow-xl">
        <span><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">WASD</kbd> Move</span>
        <span><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">SPACE</kbd> Jump</span>
        <span><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">SHIFT</kbd> Sprint</span>
        <span className="text-amber-300 font-semibold"><kbd className="bg-red-950 border border-red-800 px-1.5 py-0.5 rounded text-amber-300">CLICK / F</kbd> Attack</span>
        <span><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">Z</kbd> View</span>
        <span><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200">P</kbd> Pause</span>
        <button
          onClick={() => setShowTouchControls(!showTouchControls)}
          className="pointer-events-auto text-[10px] text-amber-400 underline ml-1 cursor-pointer"
        >
          {showTouchControls ? 'Hide Touch Pad' : 'Show Touch Pad'}
        </button>
      </div>

      {/* Optional Virtual Touch Controls for Mobile/Touch users */}
      {showTouchControls && (
        <div className="pointer-events-auto flex justify-between items-end w-full px-4 pb-2">
          {/* D-Pad */}
          <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
            <div />
            <button
              onMouseDown={() => onVirtualKey('KeyW', true)}
              onMouseUp={() => onVirtualKey('KeyW', false)}
              onTouchStart={() => onVirtualKey('KeyW', true)}
              onTouchEnd={() => onVirtualKey('KeyW', false)}
              className="bg-zinc-900/90 border border-zinc-700 active:bg-zinc-700 text-white rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              W
            </button>
            <div />
            <button
              onMouseDown={() => onVirtualKey('KeyA', true)}
              onMouseUp={() => onVirtualKey('KeyA', false)}
              onTouchStart={() => onVirtualKey('KeyA', true)}
              onTouchEnd={() => onVirtualKey('KeyA', false)}
              className="bg-zinc-900/90 border border-zinc-700 active:bg-zinc-700 text-white rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              A
            </button>
            <button
              onMouseDown={() => onVirtualKey('KeyS', true)}
              onMouseUp={() => onVirtualKey('KeyS', false)}
              onTouchStart={() => onVirtualKey('KeyS', true)}
              onTouchEnd={() => onVirtualKey('KeyS', false)}
              className="bg-zinc-900/90 border border-zinc-700 active:bg-zinc-700 text-white rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              S
            </button>
            <button
              onMouseDown={() => onVirtualKey('KeyD', true)}
              onMouseUp={() => onVirtualKey('KeyD', false)}
              onTouchStart={() => onVirtualKey('KeyD', true)}
              onTouchEnd={() => onVirtualKey('KeyD', false)}
              className="bg-zinc-900/90 border border-zinc-700 active:bg-zinc-700 text-white rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              D
            </button>
          </div>

          {/* Action Buttons: Attack, Sprint, Jump */}
          <div className="flex gap-2.5 items-center">
            <button
              onClick={onAttack}
              onMouseDown={onAttack}
              onTouchStart={onAttack}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-amber-600 border border-amber-400 text-white font-mono font-bold text-xs flex flex-col items-center justify-center shadow-lg active:scale-95 cursor-pointer"
            >
              <Sword className="w-5 h-5 text-amber-200" />
              <span>ATTACK</span>
            </button>
            <button
              onMouseDown={() => onVirtualKey('ShiftLeft', true)}
              onMouseUp={() => onVirtualKey('ShiftLeft', false)}
              onTouchStart={() => onVirtualKey('ShiftLeft', true)}
              onTouchEnd={() => onVirtualKey('ShiftLeft', false)}
              className="w-14 h-14 rounded-full bg-amber-950/80 border border-amber-600 text-amber-300 font-mono font-bold text-[11px] flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
            >
              SPRINT
            </button>
            <button
              onMouseDown={() => onVirtualKey('Space', true)}
              onMouseUp={() => onVirtualKey('Space', false)}
              onTouchStart={() => onVirtualKey('Space', true)}
              onTouchEnd={() => onVirtualKey('Space', false)}
              className="w-16 h-16 rounded-full bg-red-950/80 border border-red-600 text-red-200 font-mono font-bold text-sm flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
            >
              JUMP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
