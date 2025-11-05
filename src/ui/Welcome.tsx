/**
 * Écran d'accueil - Saisie du pseudo utilisateur
 */

import React, { useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, getUserProfile } from '../utils/storage';
import './Welcome.css';

interface WelcomeProps {
  onStart: (username: string) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const [username, setUsername] = useState('');
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const current = getCurrentUser();
    if (current) {
      setSavedUsername(current);
      setUsername(current);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = username.trim();

    if (!trimmed) {
      setError('Veuillez entrer un pseudo');
      return;
    }

    if (trimmed.length < 2) {
      setError('Le pseudo doit contenir au moins 2 caractères');
      return;
    }

    if (trimmed.length > 20) {
      setError('Le pseudo ne peut pas dépasser 20 caractères');
      return;
    }

    // Sauvegarder et démarrer
    setCurrentUser(trimmed);
    getUserProfile(trimmed); // Créer le profil si nécessaire
    onStart(trimmed);
  };

  const handleContinue = () => {
    if (savedUsername) {
      onStart(savedUsername);
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-container scale-in">
        <div className="welcome-header">
          <div className="logo-circle">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="30" cy="30" r="25" fill="#6366f1" opacity="0.2" />
              <circle cx="30" cy="30" r="18" fill="#6366f1" opacity="0.4" />
              <circle cx="30" cy="30" r="10" fill="#6366f1" />
              <circle cx="20" cy="20" r="3" fill="#ef4444" />
              <circle cx="40" cy="25" r="3" fill="#ef4444" />
              <circle cx="25" cy="40" r="3" fill="#10b981" />
            </svg>
          </div>
          <h1>Paintball Puzzle</h1>
          <p className="subtitle">Jeu de réflexion - Mémoire L3</p>
        </div>

        <div className="welcome-content">
          {savedUsername && (
            <div className="saved-profile">
              <p>Bon retour, <strong>{savedUsername}</strong> !</p>
              <button
                className="btn-primary btn-large"
                onClick={handleContinue}
              >
                Continuer
              </button>
              <div className="divider">
                <span>ou</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="username-form">
            <div className="form-group">
              <label htmlFor="username">
                {savedUsername ? 'Nouveau joueur' : 'Entrez votre pseudo'}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Pseudo (2-20 caractères)"
                autoFocus={!savedUsername}
                maxLength={20}
              />
              {error && <p className="error-message">{error}</p>}
            </div>

            <button type="submit" className="btn-primary btn-large">
              Commencer
            </button>
          </form>
        </div>

        <div className="welcome-footer">
          <p className="game-description">
            Placez des disques pour couvrir tous les points <span className="red-dot">●</span> rouges
            sans toucher les points <span className="green-dot">●</span> verts
          </p>
        </div>
      </div>
    </div>
  );
};
