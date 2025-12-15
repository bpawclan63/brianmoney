import confetti from 'canvas-confetti';
import { useCallback } from 'react';

export function useConfetti() {
  const fireConfetti = useCallback(() => {
    // Pink and purple themed confetti for feminine look
    const colors = ['#f472b6', '#c084fc', '#a78bfa', '#fb7185', '#f9a8d4', '#e879f9'];
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });
  }, []);

  const fireCelebration = useCallback(() => {
    const colors = ['#f472b6', '#c084fc', '#a78bfa', '#fb7185', '#f9a8d4', '#e879f9'];
    
    // First burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    
    // Second burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    // Center burst with hearts shape effect
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5, x: 0.5 },
        colors: colors,
        shapes: ['circle', 'square'],
        scalar: 1.2,
      });
    }, 200);
  }, []);

  const fireHearts = useCallback(() => {
    const colors = ['#f472b6', '#fb7185', '#f9a8d4', '#fda4af'];
    
    // Create a heart-like burst pattern
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 60,
          startVelocity: 30,
          origin: { x: 0.5, y: 0.5 },
          colors: colors,
          ticks: 200,
          gravity: 0.8,
          scalar: 1.5,
        });
      }, i * 150);
    }
  }, []);

  return { fireConfetti, fireCelebration, fireHearts };
}