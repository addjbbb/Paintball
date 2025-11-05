/**
 * Composant Canvas de jeu - Rendu et interactions
 * Gère le placement des disques, les animations, et le feedback visuel
 */

import React, { useRef, useEffect, useState } from 'react';
import { Level, Disc, Point } from '../types';
import { distance } from '../utils/geometry';
import {
  validateGameState,
  wouldDiscTouchGreen,
  countNewRedsCovered
} from '../core/gameValidator';
import './GameCanvas.css';

interface GameCanvasProps {
  level: Level;
  placedDiscs: Disc[];
  onDiscPlaced: (disc: Disc) => void;
  onUndo: () => void;
  remainingDiscs: number;
  gameStatus: 'playing' | 'won' | 'lost';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  placedDiscs,
  onDiscPlaced,
  onUndo,
  remainingDiscs,
  gameStatus
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverDisc, setHoverDisc] = useState<Disc | null>(null);
  const [animatingDisc, setAnimatingDisc] = useState<{
    disc: Disc;
    progress: number;
  } | null>(null);

  // Animation d'un disque placé
  useEffect(() => {
    if (animatingDisc && animatingDisc.progress < 1) {
      const timer = setTimeout(() => {
        setAnimatingDisc({
          ...animatingDisc,
          progress: Math.min(1, animatingDisc.progress + 0.1)
        });
      }, 16);
      return () => clearTimeout(timer);
    } else if (animatingDisc && animatingDisc.progress >= 1) {
      setAnimatingDisc(null);
    }
  }, [animatingDisc]);

  // Rendu du Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fond
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grille subtile (optionnel)
    drawGrid(ctx, canvas.width, canvas.height);

    // Dessiner les disques placés
    placedDiscs.forEach((disc, index) => {
      drawDisc(ctx, disc, 1, false);
    });

    // Dessiner le disque en animation
    if (animatingDisc) {
      const scale = easeOutElastic(animatingDisc.progress);
      drawDisc(ctx, animatingDisc.disc, scale, false);

      // Effet de ripple
      if (animatingDisc.progress < 0.5) {
        const rippleProgress = animatingDisc.progress * 2;
        drawRipple(ctx, animatingDisc.disc, rippleProgress);
      }
    }

    // Dessiner le disque en survol
    if (hoverDisc && gameStatus === 'playing' && remainingDiscs > 0) {
      const wouldTouchGreen = wouldDiscTouchGreen(
        hoverDisc,
        level.greenPoints
      );
      drawDisc(ctx, hoverDisc, 1, true, wouldTouchGreen);
    }

    // Dessiner les points rouges
    level.redPoints.forEach((point) => {
      const isCovered = placedDiscs.some(
        (disc) => distance(point, disc.center) <= disc.radius
      );
      drawPoint(ctx, point, '#ef4444', isCovered ? 0.3 : 1);
    });

    // Dessiner les points verts
    level.greenPoints.forEach((point) => {
      const isTouched = placedDiscs.some(
        (disc) => distance(point, disc.center) <= disc.radius
      );
      drawPoint(ctx, point, '#10b981', isTouched ? 1 : 0.8);

      // Halo rouge si touché
      if (isTouched) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  }, [level, placedDiscs, hoverDisc, animatingDisc, gameStatus, remainingDiscs]);

  // Gestion du survol
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing' || remainingDiscs <= 0) {
      setHoverDisc(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoverDisc({
      center: { x, y },
      radius: level.params.discRadius
    });
  };

  const handleMouseLeave = () => {
    setHoverDisc(null);
  };

  // Gestion du clic (placement de disque)
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStatus !== 'playing' || remainingDiscs <= 0 || !hoverDisc) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const disc: Disc = {
      center: { x, y },
      radius: level.params.discRadius
    };

    // Animation du disque
    setAnimatingDisc({ disc, progress: 0 });

    // Placer le disque
    onDiscPlaced(disc);
  };

  return (
    <div className="game-canvas-container">
      <canvas
        ref={canvasRef}
        width={level.boardWidth}
        height={level.boardHeight}
        className="game-canvas"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ cursor: gameStatus === 'playing' && remainingDiscs > 0 ? 'crosshair' : 'default' }}
      />
    </div>
  );
};

// ===== Fonctions de dessin =====

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;

  const gridSize = 50;

  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawDisc(
  ctx: CanvasRenderingContext2D,
  disc: Disc,
  scale: number,
  isPreview: boolean,
  wouldTouchGreen: boolean = false
) {
  const scaledRadius = disc.radius * scale;

  ctx.save();
  ctx.translate(disc.center.x, disc.center.y);

  if (isPreview) {
    // Disque en survol (preview)
    ctx.fillStyle = wouldTouchGreen
      ? 'rgba(239, 68, 68, 0.15)'
      : 'rgba(99, 102, 241, 0.15)';
    ctx.strokeStyle = wouldTouchGreen
      ? 'rgba(239, 68, 68, 0.6)'
      : 'rgba(99, 102, 241, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
  } else {
    // Disque placé
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, scaledRadius);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
  }

  ctx.beginPath();
  ctx.arc(0, 0, scaledRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawPoint(
  ctx: CanvasRenderingContext2D,
  point: Point,
  color: string,
  opacity: number
) {
  ctx.save();
  ctx.globalAlpha = opacity;

  // Point principal
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
  ctx.fill();

  // Bordure blanche
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawRipple(
  ctx: CanvasRenderingContext2D,
  disc: Disc,
  progress: number
) {
  ctx.save();

  const rippleRadius = disc.radius * (1 + progress * 2);
  const opacity = 1 - progress;

  ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.5})`;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(disc.center.x, disc.center.y, rippleRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ===== Fonctions d'easing =====

function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3;

  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
