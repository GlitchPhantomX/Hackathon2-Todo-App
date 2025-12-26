// Notification Sound Service with volume control and enable/disable
class NotificationSoundService {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private enabled: boolean = true;
    private volume: number = 0.5;
  
    constructor() {
      if (typeof window !== 'undefined') {
        this.loadSounds();
        this.loadPreferences();
      }
    }
  
    private loadSounds() {
      const soundFiles = {
        taskCreated: '/171670__leszek_szary__success-2.wav',
        taskCompleted: '/171671__leszek_szary__success-1.wav',
        taskUpdated: '/171670__leszek_szary__success-2.wav',
        taskDeleted: '/171672__leszek_szary__failure-2.wav',
        overdue: '/171673__leszek_szary__failure-1.wav',
        dueToday: '/171670__leszek_szary__success-2.wav',
        reminder: '/171670__leszek_szary__success-2.wav',
      };
  
      Object.entries(soundFiles).forEach(([key, path]) => {
        try {
          const audio = new Audio(path);
          audio.volume = this.volume;
          audio.preload = 'auto';
          this.sounds.set(key, audio);
        } catch (error) {
          console.warn(`Failed to load sound: ${key}`, error);
        }
      });
    }
  
    private loadPreferences() {
      try {
        const savedEnabled = localStorage.getItem('notificationSoundEnabled');
        const savedVolume = localStorage.getItem('notificationSoundVolume');
        
        if (savedEnabled !== null) {
          this.enabled = savedEnabled === 'true';
        }
        if (savedVolume !== null) {
          this.volume = parseFloat(savedVolume);
          this.updateAllVolumes();
        }
      } catch (error) {
        console.warn('Failed to load sound preferences:', error);
      }
    }
  
    private savePreferences() {
      try {
        localStorage.setItem('notificationSoundEnabled', String(this.enabled));
        localStorage.setItem('notificationSoundVolume', String(this.volume));
      } catch (error) {
        console.warn('Failed to save sound preferences:', error);
      }
    }
  
    private updateAllVolumes() {
      this.sounds.forEach(sound => {
        sound.volume = this.volume;
      });
    }
  
    play(type: string) {
      if (!this.enabled) {
        console.log('🔇 Notification sounds disabled');
        return;
      }
  
      const sound = this.sounds.get(type);
      if (sound) {
        try {
          // Reset to start and play
          sound.currentTime = 0;
          sound.play().catch(error => {
            console.warn('Failed to play notification sound:', error);
          });
          console.log('🔊 Playing sound:', type);
        } catch (error) {
          console.warn('Error playing sound:', error);
        }
      } else {
        console.warn('Sound not found:', type);
      }
    }
  
    setEnabled(enabled: boolean) {
      this.enabled = enabled;
      this.savePreferences();
      console.log('🔊 Notification sounds:', enabled ? 'enabled' : 'disabled');
    }
  
    isEnabled(): boolean {
      return this.enabled;
    }
  
    setVolume(volume: number) {
      // Volume should be between 0 and 1
      this.volume = Math.max(0, Math.min(1, volume));
      this.updateAllVolumes();
      this.savePreferences();
      console.log('🔊 Volume set to:', Math.round(this.volume * 100) + '%');
    }
  
    getVolume(): number {
      return this.volume;
    }
  
    // Test sound
    test(type: string = 'taskCreated') {
      this.play(type);
    }
  }
  
  export const notificationSoundService = new NotificationSoundService();