/**
 * Sélecteur de niveaux avec trajectoire serpentine et système de cadenas
 */

import React, { useState, useEffect } from 'react';
import {
  getUnlockedLevels,
  isLevelCompleted,
  getLevelStats
} from '../utils/storage';
import {
  TOTAL_LEVELS,
  getLevelDifficulty,
  filterLevelsByDifficulty
} from '../levels/config';
import { Difficulty } from '../types';
import './LevelSelector.css';

interface LevelSelectorProps {
  username: string;
  onSelectLevel: (levelNumber: number) => void;
  onLogout: () => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  username,
  onSelectLevel,
  onLogout
}) => {
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | null>(
    null
  );

  useEffect(() => {
    const unlocked = getUnlockedLevels(username);
    setUnlockedLevels(unlocked);

    const completed: number[] = [];
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      if (isLevelCompleted(username, i)) {
        completed.push(i);
      }
    }
    setCompletedLevels(completed);
  }, [username]);

  const handleLevelClick = (levelNumber: number) => {
    if (unlockedLevels.includes(levelNumber)) {
      onSelectLevel(levelNumber);
    }
  };

  const handleContinue = () => {
    // Trouver le premier niveau non complété
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      if (!completedLevels.includes(i) && unlockedLevels.includes(i)) {
        onSelectLevel(i);
        return;
      }
    }
    // Si tous complétés, aller au dernier
    onSelectLevel(TOTAL_LEVELS);
  };

  const getDifficultyIcon = (difficulty: Difficulty): string => {
    const icons: Record<Difficulty, string> = {
      facile: '★',
      debutant: '★★',
      intermediaire: '★★★',
      difficile: '★★★★'
    };
    return icons[difficulty];
  };

  const getDifficultyColor = (difficulty: Difficulty): string => {
    const colors: Record<Difficulty, string> = {
      facile: '#10b981',
      debutant: '#3b82f6',
      intermediaire: '#f59e0b',
      difficile: '#ef4444'
    };
    return colors[difficulty];
  };

  // Filtrer les niveaux si un filtre est actif
  const visibleLevels = difficultyFilter
    ? filterLevelsByDifficulty(difficultyFilter)
    : Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);

  // Calculer la position serpentine
  const getSnakePosition = (levelNumber: number) => {
    const levelsPerRow = 10;
    const row = Math.floor((levelNumber - 1) / levelsPerRow);
    const col = (levelNumber - 1) % levelsPerRow;

    // Alterner la direction de chaque ligne
    const x = row % 2 === 0 ? col : levelsPerRow - 1 - col;
    const y = row;

    return { x, y };
  };

  return (
    <div className="level-selector-screen fade-in">
      <div className="level-selector-header">
        <div className="header-left">
          <h2>Sélection de niveau</h2>
          <p className="username-display">
            Joueur: <strong>{username}</strong>
          </p>
        </div>
        <div className="header-right">
          <button className="btn-primary" onClick={handleContinue}>
            Continuer
          </button>
          <button className="btn-secondary" onClick={onLogout}>
            Changer de joueur
          </button>
        </div>
      </div>

      <div className="difficulty-filters">
        <button
          className={`filter-btn ${!difficultyFilter ? 'active' : ''}`}
          onClick={() => setDifficultyFilter(null)}
        >
          Tous
        </button>
        <button
          className={`filter-btn ${
            difficultyFilter === 'facile' ? 'active' : ''
          }`}
          onClick={() => setDifficultyFilter('facile')}
          style={{ borderColor: getDifficultyColor('facile') }}
        >
          Facile
        </button>
        <button
          className={`filter-btn ${
            difficultyFilter === 'debutant' ? 'active' : ''
          }`}
          onClick={() => setDifficultyFilter('debutant')}
          style={{ borderColor: getDifficultyColor('debutant') }}
        >
          Débutant
        </button>
        <button
          className={`filter-btn ${
            difficultyFilter === 'intermediaire' ? 'active' : ''
          }`}
          onClick={() => setDifficultyFilter('intermediaire')}
          style={{ borderColor: getDifficultyColor('intermediaire') }}
        >
          Intermédiaire
        </button>
        <button
          className={`filter-btn ${
            difficultyFilter === 'difficile' ? 'active' : ''
          }`}
          onClick={() => setDifficultyFilter('difficile')}
          style={{ borderColor: getDifficultyColor('difficile') }}
        >
          Difficile
        </button>
      </div>

      <div className="levels-grid-container">
        <div className="levels-grid">
          {visibleLevels.map((levelNumber) => {
            const isUnlocked = unlockedLevels.includes(levelNumber);
            const isCompleted = completedLevels.includes(levelNumber);
            const difficulty = getLevelDifficulty(levelNumber);
            const stats = getLevelStats(username, levelNumber);
            const pos = getSnakePosition(levelNumber);

            return (
              <div
                key={levelNumber}
                className="level-cell"
                style={{
                  gridColumn: pos.x + 1,
                  gridRow: pos.y + 1
                }}
              >
                <button
                  className={`level-button ${
                    isUnlocked ? 'unlocked' : 'locked'
                  } ${isCompleted ? 'completed' : ''}`}
                  onClick={() => handleLevelClick(levelNumber)}
                  disabled={!isUnlocked}
                  style={{
                    borderColor: isUnlocked
                      ? getDifficultyColor(difficulty)
                      : undefined
                  }}
                >
                  {isUnlocked ? (
                    <>
                      <div className="level-number">{levelNumber}</div>
                      <div
                        className="level-difficulty"
                        style={{ color: getDifficultyColor(difficulty) }}
                      >
                        {getDifficultyIcon(difficulty)}
                      </div>
                      {isCompleted && (
                        <div className="level-completed-icon">✓</div>
                      )}
                      {stats && stats.bestTime && (
                        <div className="level-time">
                          {Math.round(stats.bestTime)}s
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="level-locked-icon">🔒</div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="level-selector-footer">
        <div className="progress-info">
          <p>
            Progression: <strong>{completedLevels.length}</strong> /{' '}
            {TOTAL_LEVELS} niveaux complétés
          </p>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${(completedLevels.length / TOTAL_LEVELS) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
