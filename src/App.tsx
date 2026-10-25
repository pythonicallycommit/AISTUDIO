import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/gameEngine';
import { CameraView, GameScreen, PlayerState } from './types/game';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { PauseScreen } from './components/PauseScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { soundManager } from './utils/audio';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [screen, setScreen] = useState<GameScreen>('start');
  const [cameraView, setCameraView] = useState<CameraView>('first');
  const [omarDistance, setOmarDistance] = useState<number>(30);
  const [omarIsHunting, setOmarIsHunting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState>({
    hearts: 3,
    maxHearts: 3,
    hasGoldenHeart: false,
    score: 0,
    level: 1,
    fallsInCurrentLevel: 0,
    totalFalls: 0,
    hasMadeMistakeInLevel: false,
    sprintStamina: 100,
    isSprinting: false,
    money: 0,
    highScore: 0,
    omarStunTime: 0,
    bossHealth: null,
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize GameEngine
    const engine = new GameEngine(mountRef.current, {
      onPlayerStateChange: (state) => {
        setPlayerState({ ...state });
      },
      onScreenChange: (newScreen) => {
        setScreen(newScreen);
      },
      onNotification: (msg) => {
        showNotification(msg);
      },
      onOmarProximity: (distance, isHunting) => {
        setOmarDistance(distance);
        setOmarIsHunting(isHunting);
      },
    });

    engineRef.current = engine;

    // Read stored high score
    const savedHighScore = localStorage.getItem('escape_omar_highscore');
    if (savedHighScore) {
      const parsed = parseInt(savedHighScore, 10) || 0;
      setPlayerState((prev) => ({ ...prev, highScore: parsed }));
    }

    return () => {
      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
      }
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    setScreen('playing');
    soundManager.startAmbientHell();
    if (engineRef.current) {
      engineRef.current.isPaused = false;
      showNotification('ESCAPE OMAR: REACH THE PORTAL!');
    }
  };

  const handleToggleCamera = () => {
    if (engineRef.current) {
      engineRef.current.toggleCameraView();
      setCameraView(engineRef.current.cameraView);
    }
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.isPaused = false;
      setScreen('playing');
      soundManager.startAmbientHell();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  };

  const handleVictoryReward = (reward: 'money' | 'golden_heart') => {
    if (engineRef.current) {
      engineRef.current.applyVictoryReward(reward);
    }
  };

  const handleAttack = () => {
    if (engineRef.current) {
      engineRef.current.attack();
    }
  };

  const handleVirtualKey = (key: string, pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.setVirtualKey(key, pressed);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black font-sans select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-default" />

      {/* In-Game HUD overlay */}
      {screen === 'playing' && (
        <HUD
          playerState={playerState}
          cameraView={cameraView}
          omarDistance={omarDistance}
          omarIsHunting={omarIsHunting}
          notification={notification}
          onToggleCamera={handleToggleCamera}
          onTogglePause={handleTogglePause}
          onVirtualKey={handleVirtualKey}
          onAttack={handleAttack}
        />
      )}

      {/* Start Screen */}
      {screen === 'start' && (
        <StartScreen highScore={playerState.highScore} onStart={handleStartGame} />
      )}

      {/* Pause Screen */}
      {screen === 'paused' && (
        <PauseScreen
          score={playerState.score}
          level={playerState.level}
          onResume={handleResume}
          onRestart={handleRestart}
        />
      )}

      {/* Game Over Screen */}
      {screen === 'gameover' && (
        <GameOverScreen playerState={playerState} onRestart={handleRestart} />
      )}

      {/* Victory Choice Screen */}
      {screen === 'victory' && (
        <VictoryScreen
          playerState={playerState}
          onChooseReward={handleVictoryReward}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}
