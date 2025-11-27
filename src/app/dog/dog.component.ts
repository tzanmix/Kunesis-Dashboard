import { Component, OnInit, OnDestroy, signal, input, computed, effect, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces
interface LogEntry {
  id: number;
  time: string;
  type: 'alert' | 'info' | 'action';
  message: string;
}

interface DogStatus {
  heartRate: number;
  anxietyLevel: number; // 0-100
  decibels: number;
  battery: number;
  temperature: number;
  isBarking: boolean;
  isConnected: boolean;
}

@Component({
  selector: 'app-dog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dog.component.html',
  styles: [`
    :host { display: block; }
    
    /* Scrollbar */
    .scrollbar-thin::-webkit-scrollbar { width: 4px; }
    .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
    .dark .scrollbar-thumb-slate-700::-webkit-scrollbar-thumb { background-color: #334155; }
    
    /* Animations */
    @keyframes progress {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    .animate-progress {
      animation: progress 2s linear forwards;
    }
    
    @keyframes vibrate {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }
    .animate-vibrate {
      animation: vibrate 0.3s linear infinite;
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }

    @keyframes slide-up {
       from { opacity: 0; transform: translateY(20px); }
       to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
       animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class DogComponent implements OnInit, OnDestroy {
  // Input for Dark Mode (Controlled by Parent Layout)
  // isDarkMode = input<boolean>(false); 

  // Signals for state
  status = signal<DogStatus>({
    heartRate: 72,
    anxietyLevel: 15,
    decibels: 40,
    battery: 85,
    temperature: 38.5,
    isBarking: false,
    isConnected: true
  });

  controls = signal<{
    vibrationActive: boolean;
    ultrasonicActive: boolean;
    feedbackMessage: string | null;
  }>({
    vibrationActive: false,
    ultrasonicActive: false,
    feedbackMessage: null
  });

  // Location signal (x, y percentages)
  dogPosition = signal<{x: number, y: number}>({ x: 50, y: 50 });

  // History for charts
  heartRateHistory = signal<number[]>(new Array(40).fill(70));
  soundBars = signal<number[]>(new Array(32).fill(10));
  
  logs = signal<LogEntry[]>([
    { id: 1, time: '12:00:01', type: 'info', message: 'System initialized. Connection stable.' },
    { id: 2, time: '12:00:05', type: 'info', message: 'GPS signal acquired: 8 satellites.' },
  ]);

  // Intervals
  private dataInterval: any;
  private soundInterval: any;
  private moveInterval: any;

  ngOnInit() {
    this.startSimulation();
  }

  ngOnDestroy() {
    clearInterval(this.dataInterval);
    clearInterval(this.soundInterval);
    clearInterval(this.moveInterval);
  }

  startSimulation() {
    // Biometrics Loop (every 1s)
    this.dataInterval = setInterval(() => {
      this.updateBiometrics();
    }, 1000);

    // Sound Visualizer Loop (fast, 100ms)
    this.soundInterval = setInterval(() => {
      this.updateSound();
    }, 100);

    // Movement Loop (every 2s)
    this.moveInterval = setInterval(() => {
      this.updateLocation();
    }, 2000);
  }

  updateBiometrics() {
    this.status.update(s => {
      // Fluctuate heart rate based on anxiety
      const anxietyFactor = s.anxietyLevel > 50 ? 20 : 0;
      const targetHR = 70 + anxietyFactor + (Math.random() * 20 - 10);
      const newHR = Math.floor(s.heartRate + (targetHR - s.heartRate) * 0.2); // Smooth transition

      // Random anxiety fluctuation
      let newAnxiety = s.anxietyLevel + (Math.random() * 10 - 5);
      newAnxiety = Math.max(0, Math.min(100, newAnxiety));

      // Trigger high anxiety occasionally
      if (Math.random() > 0.95) newAnxiety += 15;

      return {
        ...s,
        heartRate: newHR,
        anxietyLevel: Math.floor(newAnxiety),
        temperature: 38.0 + (Math.random() * 1), // Dogs are usually 38-39C
        battery: Number((Math.max(0, s.battery - 0.01)).toFixed(2)) // Slow drain, rounded
      };
    });

    // Update history for ECG
    this.heartRateHistory.update(h => [...h.slice(1), this.status().heartRate]);

    // Check for alerts
    const s = this.status();
    if (s.anxietyLevel > 80 && Math.random() > 0.8) {
      this.addLog('alert', `High anxiety levels detected (${s.anxietyLevel}).`);
    }
  }

  updateSound() {
    // Generate random bars for visualizer
    const isBarking = this.status().isBarking;
    
    const newBars = Array.from({ length: 32 }, () => Math.random() * (isBarking ? 100 : 40));
    this.soundBars.set(newBars);

    // Occasional barking simulation
    if (Math.random() > 0.98 && !this.status().isBarking) {
      this.status.update(s => ({ ...s, isBarking: true, decibels: 95 }));
      this.addLog('alert', 'Loud barking detected.');
      setTimeout(() => this.status.update(s => ({ ...s, isBarking: false, decibels: 45 })), 2000);
    } else if (!this.status().isBarking) {
      this.status.update(s => ({ ...s, decibels: Math.floor(35 + Math.random() * 15) }));
    }
  }

  updateLocation() {
    this.dogPosition.update(pos => {
      // Random walk
      const dx = (Math.random() - 0.5) * 5;
      const dy = (Math.random() - 0.5) * 5;
      return {
        x: Math.max(10, Math.min(90, pos.x + dx)),
        y: Math.max(10, Math.min(90, pos.y + dy))
      };
    });
  }

  // --- Actions ---

  triggerDeterrent(type: 'vibration' | 'ultrasonic') {
    if (type === 'vibration') {
      this.controls.update(c => ({ ...c, vibrationActive: true, feedbackMessage: 'Sending Haptic Signal...' }));
      this.addLog('action', 'Manual Vibration Triggered');
      
      // Simulate duration
      setTimeout(() => {
        this.controls.update(c => ({ ...c, vibrationActive: false, feedbackMessage: null }));
        // Effect: Lowers anxiety slightly after correction
        this.status.update(s => ({ ...s, anxietyLevel: Math.max(0, s.anxietyLevel - 10) }));
      }, 2000);
    } 
    else {
      this.controls.update(c => ({ ...c, ultrasonicActive: true, feedbackMessage: 'Emitting Ultrasonic Pulse...' }));
      this.addLog('action', 'Ultrasonic Deterrent Triggered');

      setTimeout(() => {
        this.controls.update(c => ({ ...c, ultrasonicActive: false, feedbackMessage: null }));
        // Effect: Stops barking
        if (this.status().isBarking) {
           this.status.update(s => ({ ...s, isBarking: false }));
           this.addLog('info', 'Barking ceased after correction.');
        }
      }, 3000);
    }
  }

  addLog(type: 'alert' | 'info' | 'action', message: string) {
    const time = new Date().toLocaleTimeString('en-GB');
    this.logs.update(logs => [{ id: Date.now(), time, type, message }, ...logs].slice(0, 50));
  }

  // --- Helpers for View ---

  getAnxietyColor() {
    const val = this.status().anxietyLevel;
    if (val < 30) return '#10b981'; // Emerald
    if (val < 70) return '#d97706'; // Amber-600
    return '#e11d48'; // Rose-600
  }

  getAnxietyLabel() {
    const val = this.status().anxietyLevel;
    if (val < 30) return 'Relaxed';
    if (val < 70) return 'Anxious';
    return 'Stressed';
  }

  anxietyOffset() {
    // Circumference is approx 440 (2 * pi * 70)
    // 100 anxiety = 0 offset (full circle), 0 anxiety = 440 offset (empty)
    // We want a gauge, so maybe 0 to 75% of circle
    const maxOffset = 440; // Full circle length
    // Map 0-100 to offset
    const percentage = this.status().anxietyLevel / 100;
    // Invert because stroke-dashoffset hides from end
    return maxOffset - (percentage * maxOffset * 0.75); // Use 75% of circle max
  }

  heartPath() {
    // Generate SVG path from history
    const data = this.heartRateHistory();
    const width = 400; // approximate viewbox width
    const height = 100;
    const step = width / (data.length - 1);
    
    // Normalize data to fit height (60-140 bpm range roughly)
    const normalize = (val: number) => {
       const min = 40;
       const max = 160;
       return height - ((val - min) / (max - min) * height);
    };

    let path = `M 0 ${normalize(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      // Simple smoothing
      const x = i * step;
      const y = normalize(data[i]);
      path += ` L ${x} ${y}`;
    }
    return path;
  }
}