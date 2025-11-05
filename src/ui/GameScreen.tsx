/**
 * Écran de jeu principal
 * Contient le Canvas, le HUD, et les contrôles
 */

import React, { useState, useEffect } from 'react';
import { Level, Disc, GameState } from '../types';
import { generateLevel } from '../core/levelGenerator';
import { validateGameState } from '../core/gameValidator';
import {
  getLevelParams,
  getDefaultLevelSeed,
  getLevelDifficulty
} from '../levels/config';
import {
  markLevelCompleted,
  recordLevelAttempt,
  saveLevelSeed
} from '../utils/storage';
import { GameCanvas } from './GameCanvas';
import './GameScreen.css';

interface GameScreenProps {
  levelNumber: number;
  username: string;
  onBackToLevels: () => void;
  onNextLevel: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  levelNumber,
  username,
  onBackToLevels,
  onNextLevel
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Initialiser le niveau
  useEffect(() => {
    initializeLevel();
  }, [levelNumber]);

  // Timer
  useEffect(() => {
    if (gameState?.status === 'playing') {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState?.status, startTime]);

  const initializeLevel = (customSeed?: string) => {
    const params = getLevelParams(levelNumber);
    const seed = customSeed || getDefaultLevelSeed(levelNumber);

    const level = generateLevel(levelNumber, seed, params);

    // Sauvegarder la seed
    saveLevelSeed(username, levelNumber, seed);

    setGameState({
      level,
      placedDiscs: [],
      remainingDiscs: params.numDiscs,
      status: 'playing'
    });

    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleDiscPlaced = (disc: Disc) => {
    if (!gameState || gameState.status !== 'playing') return;

    const newPlacedDiscs = [...gameState.placedDiscs, disc];
    const newRemainingDiscs = gameState.remainingDiscs - 1;

    // Validation
    const validation = validateGameState(
      gameState.level.redPoints,
      gameState.level.greenPoints,
      newPlacedDiscs,
      gameState.level.boardWidth,
      gameState.level.boardHeight
    );

    let newStatus: 'playing' | 'won' | 'lost' = 'playing';
    let lossReason: string | undefined;

    // Vérifier victoire/défaite
    if (newRemainingDiscs === 0) {
      if (validation.isWon) {
        newStatus = 'won';
        // Enregistrer la victoire
        const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
        markLevelCompleted(username, levelNumber);
        recordLevelAttempt(username, levelNumber, true, timeSeconds);
      } else {
        newStatus = 'lost';
        lossReason = validation.message;
        recordLevelAttempt(username, levelNumber, false);
      }
    } else if (!validation.noGreensTouched) {
      // Défaite immédiate si un vert est touché
      newStatus = 'lost';
      lossReason = validation.message;
      recordLevelAttempt(username, levelNumber, false);
    }

    setGameState({
      ...gameState,
      placedDiscs: newPlacedDiscs,
      remainingDiscs: newRemainingDiscs,
      status: newStatus,
      lossReason
    });
  };

  const handleUndo = () => {
    if (!gameState || gameState.placedDiscs.length === 0) return;

    setGameState({
      ...gameState,
      placedDiscs: gameState.placedDiscs.slice(0, -1),
      remainingDiscs: gameState.remainingDiscs + 1,
      status: 'playing'
    });
  };

  const handleRestart = () => {
    if (gameState) {
      // Regénérer avec la même seed
      initializeLevel(gameState.level.seed);
    }
  };

  const handleNextLevel = () => {
    onNextLevel();
  };

  if (!gameState) {
    return (
      <div className="game-screen loading">
        <p>Chargement du niveau...</p>
      </div>
    );
  }

  const difficulty = getLevelDifficulty(levelNumber);
  const difficultyColors: Record<string, string> = {
    facile: '#10b981',
    debutant: '#3b82f6',
    intermediaire: '#f59e0b',
    difficile: '#ef4444'
  };

  return (
    <div className="game-screen fade-in">
      {/* Header avec HUD */}
      <div className="game-header">
        <div className="game-header-left">
          <button
            className="btn-icon btn-restart"
            onClick={handleRestart}
            title="Recommencer (même seed)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 4v6h6M20 20v-6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 10a8 8 0 0 1 13.65-5.657M20 14a8 8 0 0 1-13.65 5.657"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="game-info">
            <h2>
              Niveau {levelNumber}
              <span
                className="difficulty-badge"
                style={{ backgroundColor: difficultyColors[difficulty] }}
              >
                {difficulty}
              </span>
            </h2>
            <p className="seed-info">Seed: {gameState.level.seed.slice(0, 20)}...</p>
          </div>
        </div>

        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Disques restants</span>
            <span className="stat-value">{gameState.remainingDiscs}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Visites restantes</span>
            <span className="stat-value">{gameState.remainingDiscs}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Temps</span>
            <span className="stat-value">{elapsedTime}s</span>
          </div>
        </div>

        <button className="btn-secondary" onClick={onBackToLevels}>
          Retour
        </button>
      </div>

      {/* Canvas */}
      <div className="game-content">
        <GameCanvas
          level={gameState.level}
          placedDiscs={gameState.placedDiscs}
          onDiscPlaced={handleDiscPlaced}
          onUndo={handleUndo}
          remainingDiscs={gameState.remainingDiscs}
          gameStatus={gameState.status}
        />
      </div>

      {/* Contrôles */}
      <div className="game-controls">
        <button
          className="btn-secondary"
          onClick={handleUndo}
          disabled={gameState.placedDiscs.length === 0 || gameState.status !== 'playing'}
        >
          Annuler dernier disque
        </button>
      </div>

      {/* Modal de victoire */}
      {gameState.status === 'won' && (
        <div className="game-modal victory-modal scale-in">
          <div className="modal-content confetti-background">
            <h2 className="modal-title">🎉 Victoire !</h2>
            <p className="modal-message">
              Vous avez complété le niveau {levelNumber} en {elapsedTime} secondes !
            </p>
            <div className="modal-stats">
              <div className="modal-stat">
                <span className="modal-stat-label">Disques utilisés</span>
                <span className="modal-stat-value">
                  {gameState.placedDiscs.length}
                </span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-label">Temps</span>
                <span className="modal-stat-value">{elapsedTime}s</span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleRestart}>
                Recommencer
              </button>
              {levelNumber < 50 && (
                <button className="btn-success" onClick={handleNextLevel}>
                  Niveau suivant
                </button>
              )}
              <button className="btn-primary" onClick={onBackToLevels}>
                Sélection de niveaux
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de défaite */}
      {gameState.status === 'lost' && (
        <div className="game-modal defeat-modal scale-in">
          <div className="modal-content">
            <h2 className="modal-title">😕 Défaite</h2>
            <p className="modal-message">{gameState.lossReason}</p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleRestart}>
                Recommencer
              </button>
              <button className="btn-secondary" onClick={onBackToLevels}>
                Retour aux niveaux
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
