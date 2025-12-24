import confetti from 'canvas-confetti';

export type ConfettiType = 'celebration' | 'achievement' | 'fireworks' | 'stars' | 'emoji';

interface ConfettiOptions {
  type?: ConfettiType;
  duration?: number;
  particleCount?: number;
}

const celebrationConfetti = (options: ConfettiOptions = {}) => {
  const { duration = 3000, particleCount = 100 } = options;
  const end = Date.now() + duration;

  const colors = ['#a855f7', '#ec4899', '#06b6d4', '#22c55e', '#f59e0b'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

const achievementConfetti = (options: ConfettiOptions = {}) => {
  const { particleCount = 100 } = options;
  const colors = ['#a855f7', '#ec4899', '#fbbf24'];

  confetti({
    particleCount,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });
};

const fireworksConfetti = (options: ConfettiOptions = {}) => {
  const { duration = 5000 } = options;
  const end = Date.now() + duration;
  const colors = ['#a855f7', '#ec4899', '#06b6d4', '#22c55e'];

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.9 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

const starsConfetti = (options: ConfettiOptions = {}) => {
  const { particleCount = 50 } = options;
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#ffd700', '#ffec8b', '#fff8dc'],
  };

  confetti({
    ...defaults,
    particleCount: particleCount / 2,
    scalar: 1.2,
    shapes: ['star'],
  });

  confetti({
    ...defaults,
    particleCount: particleCount / 2,
    scalar: 0.75,
    shapes: ['circle'],
  });
};

const emojiConfetti = (options: ConfettiOptions = {}) => {
  const { particleCount = 30 } = options;
  
  const emojis = ['🎉', '🎊', '⭐', '🏆', '✨'];
  
  emojis.forEach((emoji, i) => {
    setTimeout(() => {
      const scalar = 2;
      const shape = confetti.shapeFromText({ text: emoji, scalar });

      confetti({
        shapes: [shape],
        scalar,
        particleCount: particleCount / emojis.length,
        spread: 100,
        origin: { y: 0.6 },
        gravity: 1.2,
      });
    }, i * 150);
  });
};

export const triggerConfetti = (options: ConfettiOptions = {}) => {
  const { type = 'celebration' } = options;

  switch (type) {
    case 'celebration':
      celebrationConfetti(options);
      break;
    case 'achievement':
      achievementConfetti(options);
      break;
    case 'fireworks':
      fireworksConfetti(options);
      break;
    case 'stars':
      starsConfetti(options);
      break;
    case 'emoji':
      emojiConfetti(options);
      break;
    default:
      celebrationConfetti(options);
  }
};

// Hook for easy use in components
export const useConfetti = () => {
  return {
    celebrate: (options?: ConfettiOptions) => triggerConfetti({ ...options, type: 'celebration' }),
    achievement: (options?: ConfettiOptions) => triggerConfetti({ ...options, type: 'achievement' }),
    fireworks: (options?: ConfettiOptions) => triggerConfetti({ ...options, type: 'fireworks' }),
    stars: (options?: ConfettiOptions) => triggerConfetti({ ...options, type: 'stars' }),
    emoji: (options?: ConfettiOptions) => triggerConfetti({ ...options, type: 'emoji' }),
  };
};

export default useConfetti;
