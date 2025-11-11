// Create a beep sound using Web Audio API
export const playAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First beep
    const oscillator1 = audioContext.createOscillator();
    const gainNode1 = audioContext.createGain();
    
    oscillator1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);
    
    oscillator1.frequency.value = 800;
    oscillator1.type = "sine";
    
    gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator1.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.2);
    
    // Second beep
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    oscillator2.frequency.value = 800;
    oscillator2.type = "sine";
    
    gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.25);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);
    
    oscillator2.start(audioContext.currentTime + 0.25);
    oscillator2.stop(audioContext.currentTime + 0.45);
    
    console.log("[Alert Sound] Beep played");
  } catch (error) {
    console.error("[Alert Sound] Error playing sound:", error);
  }
};
