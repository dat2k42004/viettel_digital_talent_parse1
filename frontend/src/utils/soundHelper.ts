/**
 * Sound Helper sử dụng Web Audio API tích hợp sẵn trong trình duyệt.
 * Không phụ thuộc vào bất kỳ file âm thanh .mp3/.wav ngoài nào.
 */
export const playBeepSound = (frequency = 880, duration = 0.12, type: OscillatorType = 'sine') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Fade out smoothly to avoid audio clicks
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);

    oscillator.onended = () => {
      audioCtx.close();
    };
  } catch {
    // Trình duyệt có thể chặn autoplay nếu chưa có tương tác người dùng
  }
};

export const playSuccessBeep = () => {
  playBeepSound(1046.5, 0.15, 'sine'); // C6 note
};

export const playWarningBeep = () => {
  playBeepSound(440, 0.2, 'sawtooth'); // A4 note
};
