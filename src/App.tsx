/**
 * Composant App principal
 * Orchestre les différents écrans de l'application
 */

import React, { useState } from 'react';
import { Welcome } from './ui/Welcome';
import { LevelSelector } from './ui/LevelSelector';
import { GameScreen } from './ui/GameScreen';
import './App.css';

type Screen = 'welcome' | 'level-selector' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  const handleStartGame = (username: string) => {
    setCurrentUser(username);
    setCurrentScreen('level-selector');
  };

  const handleSelectLevel = (levelNumber: number) => {
    setSelectedLevel(levelNumber);
    setCurrentScreen('game');
  };

  const handleBackToLevels = () => {
    setCurrentScreen('level-selector');
  };

  const handleLogout = () => {
    setCurrentUser('');
    setCurrentScreen('welcome');
  };

  const handleNextLevel = () => {
    const nextLevel = selectedLevel + 1;
    if (nextLevel <= 50) {
      setSelectedLevel(nextLevel);
      // Rester sur l'écran de jeu, le useEffect va recharger
    } else {
      setCurrentScreen('level-selector');
    }
  };

  return (
    <div className="app">
      {currentScreen === 'welcome' && <Welcome onStart={handleStartGame} />}

      {currentScreen === 'level-selector' && (
        <LevelSelector
          username={currentUser}
          onSelectLevel={handleSelectLevel}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen
          levelNumber={selectedLevel}
          username={currentUser}
          onBackToLevels={handleBackToLevels}
          onNextLevel={handleNextLevel}
        />
      )}
    </div>
  );
}

export default App;
