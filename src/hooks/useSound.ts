'use client';

import { useCallback, useRef, useEffect } from 'react';

// Sound synthesis using Web Audio API
// Creates authentic Go stone sounds without external files

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Stone placement sound - wooden "clack"
  const playStoneSound = useCallback(() => {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;

      // Main click/clack sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;

      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);

      // Add a subtle "tap" high frequency
      const tap = ctx.createOscillator();
      const tapGain = ctx.createGain();

      tap.type = 'sine';
      tap.frequency.value = 2000;

      tapGain.gain.setValueAtTime(0.05, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      tap.connect(tapGain);
      tapGain.connect(ctx.destination);

      tap.start(now);
      tap.stop(now + 0.03);
    } catch (e) {
      // Audio not available
    }
  }, [getContext]);

  // Capture sound - multiple stones being removed
  const playCaptureSound = useCallback((count: number = 1) => {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;

      // Play multiple subtle clicks for captures
      for (let i = 0; i < Math.min(count, 5); i++) {
        const delay = i * 0.05;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + Math.random() * 200, now + delay);
        osc.frequency.exponentialRampToValueAtTime(100, now + delay + 0.1);

        gain.gain.setValueAtTime(0.1, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      }
    } catch (e) {
      // Audio not available
    }
  }, [getContext]);

  // Pass sound - soft tone
  const playPassSound = useCallback(() => {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = 440;

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      // Audio not available
    }
  }, [getContext]);

  // Game over sound - descending tone
  const playGameOverSound = useCallback(() => {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      // Audio not available
    }
  }, [getContext]);

  // Invalid move sound - error buzz
  const playInvalidSound = useCallback(() => {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = 100;

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Audio not available
    }
  }, [getContext]);

  return {
    playStoneSound,
    playCaptureSound,
    playPassSound,
    playGameOverSound,
    playInvalidSound,
  };
}
