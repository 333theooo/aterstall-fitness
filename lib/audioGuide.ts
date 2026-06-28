export class AudioGuideManager {
  private utterance: SpeechSynthesisUtterance | null = null;

  startGuidance(script: string, volume: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    this.stopGuidance();
    this.utterance = new SpeechSynthesisUtterance(script);
    this.utterance.lang = "sv-SE";
    this.utterance.volume = volume;
    this.utterance.rate = 0.9;
    window.speechSynthesis.speak(this.utterance);
  }

  pauseGuidance() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  }

  stopGuidance() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
  }
}
