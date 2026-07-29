/**
 * Sound Effects Utility (Web Audio API)
 * Ported from the Outcess CRM. Synthesizes short tones for notifications/toasts
 * so no audio asset files are required. Respects a simple global mute toggle
 * persisted in localStorage.
 */

export type SoundType =
  | "notification"
  | "success"
  | "error"
  | "warning"
  | "info";

const SOUND_PREF_KEY = "eezyhealth:notificationSoundEnabled";

/** Whether notification sounds are enabled (defaults to on). */
export const isSoundEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SOUND_PREF_KEY) !== "false";
  } catch {
    return true;
  }
};

/** Enable/disable notification sounds (persisted). */
export const setSoundEnabled = (enabled: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_PREF_KEY, enabled ? "true" : "false");
  } catch {
    /* ignore */
  }
};

interface SoundConfig {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  delay?: number;
}

/** Play a single tone via the Web Audio API. */
const playSound = (
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.3
): void => {
  if (typeof window === "undefined") return;
  if (!isSoundEnabled()) return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};

/** Play a timed sequence of tones. */
const playSoundSequence = (sounds: SoundConfig[]): void => {
  sounds.forEach((sound, index) => {
    const delay = sound.delay ?? index * 100;
    setTimeout(() => {
      playSound(
        sound.frequency,
        sound.duration,
        sound.type || "sine",
        sound.volume ?? 0.3
      );
    }, delay);
  });
};

/** Play a notification sound for the given type. */
export const playNotificationSound = (type: SoundType = "notification"): void => {
  switch (type) {
    case "success":
      playSoundSequence([
        { frequency: 523.25, duration: 0.1, type: "sine", volume: 0.25 }, // C5
        { frequency: 659.25, duration: 0.1, type: "sine", volume: 0.25, delay: 100 }, // E5
        { frequency: 783.99, duration: 0.2, type: "sine", volume: 0.25, delay: 200 }, // G5
      ]);
      break;
    case "error":
      playSoundSequence([
        { frequency: 440, duration: 0.15, type: "square", volume: 0.3 }, // A4
        { frequency: 392, duration: 0.15, type: "square", volume: 0.3, delay: 150 }, // G4
      ]);
      break;
    case "warning":
      playSoundSequence([
        { frequency: 440, duration: 0.15, type: "triangle", volume: 0.3 }, // A4
        { frequency: 440, duration: 0.15, type: "triangle", volume: 0.3, delay: 200 }, // A4
      ]);
      break;
    case "info":
      playSound(493.88, 0.15, "sine", 0.2); // B4
      break;
    case "notification":
    default:
      // Pleasant two-note notification chime
      playSoundSequence([
        { frequency: 523.25, duration: 0.12, type: "sine", volume: 0.25 }, // C5
        { frequency: 659.25, duration: 0.15, type: "sine", volume: 0.25, delay: 120 }, // E5
      ]);
  }
};
