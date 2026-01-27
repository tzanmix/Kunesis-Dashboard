import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxStompState } from '@stomp/rx-stomp';
import { RxStomp } from '@stomp/rx-stomp'; 
import { ToastrService } from 'ngx-toastr';
import { CollarService, CollarStatusDTO } from '../services/collar.service';
import { myRxStompConfig } from '../services/rx-stomp.config';

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
    @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
    .animate-progress { animation: progress 2s linear forwards; }
    
    @keyframes vibrate {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }
    .animate-vibrate { animation: vibrate 0.3s linear infinite; }

    @keyframes fade-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

    @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class DogComponent implements OnInit, OnDestroy {
  private rxStomp = new RxStomp(); 
  private toastr = inject(ToastrService);

  // Signals for state
  status = signal<DogStatus>({
    heartRate: 0,
    anxietyLevel: 0,
    decibels: 0,
    battery: 0,
    temperature: 0,
    isBarking: false,
    isConnected: false
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
  heartRateHistory = signal<number[]>(new Array(40).fill(0));
  soundBars = signal<number[]>(new Array(32).fill(5));

  logs = signal<LogEntry[]>([
    { id: 1, time: new Date().toLocaleTimeString('en-GB'), type: 'info', message: 'Dashboard initialized.' }
  ]);

  private animationInterval?: any;

  ngOnInit() {
    // 1. Setup RxStomp Connection Listeners
    this.rxStomp.connectionState$.subscribe((state: RxStompState) => {
        const statusMap = {
            [RxStompState.CONNECTING]: 'Connecting...',
            [RxStompState.OPEN]: 'CONNECTED',
            [RxStompState.CLOSING]: 'Closing',
            [RxStompState.CLOSED]: 'CLOSED',
        };
        console.log(`%c[WS STATE] ${statusMap[state]}`, 'color: orange; font-weight: bold');
        
        if (state === RxStompState.OPEN) {
            this.status.update(s => ({ ...s, isConnected: true }));
            this.addLog('info', 'Telemetry Stream Connected');
            this.toastr.success('Connected to Telemetry Stream');
        } else {
            // DISCONNECTED: Reset values to show "Dead" state
            this.status.update(s => ({ 
                ...s, 
                isConnected: false, 
                heartRate: 0, 
                decibels: 0,
                isBarking: false
            }));
            
            if (state === RxStompState.CLOSED) {
                this.addLog('alert', 'Telemetry Stream Disconnected');
            }
        }
    });

    // Monitor Errors
    this.rxStomp.stompErrors$.subscribe(err => {
        console.error('[WS ERROR]', err);
        this.addLog('alert', `Socket Error: ${err.headers['message']}`);
        this.toastr.error('WebSocket Error Occurred');
    });

    // Configure & Activate
    this.rxStomp.configure(myRxStompConfig);
    this.rxStomp.activate();

    // Subscribe
    const TOPIC = '/topic/collar/dog-001'; 
    console.log(`[WS] Subscribing to: ${TOPIC}`);
    
    this.rxStomp.watch(TOPIC).subscribe({
        next: (message) => {
            console.log('%c[WS DATA RECEIVED]', 'color: green', message.body);
            try {
                const data: CollarStatusDTO = JSON.parse(message.body);
                this.updateStateFromBackend(data);
                // this.addLog('info', `Data Rx: ${data.tsUnix}`); // Optional spammy log
            } catch (e) {
                console.error('[WS PARSE ERROR]', e);
                this.toastr.error('Failed to parse incoming telemetry data.');
            }
        },
        error: (err) => console.error('[WS SUB ERROR]', err)
    });

    // Start Visualizers (Charts)
    this.startVisualizers();
  }

  ngOnDestroy() {
    this.rxStomp.deactivate();
    clearInterval(this.animationInterval);
  }

  // TODO: figure state update logic/ data format etc
  updateStateFromBackend(data: CollarStatusDTO) {
    this.status.update(current => {
      // Map Battery
      const batteryPct = this.mapBattery(data.batteryMv);

      // Derive/Format Heart Rate
      // Simulation: using Respiration Rate * 3 as proxy for HR, defaulting to 70 if missing
      const rawHr = (data.respRateBpm || 23) * 3;
      
      return {
        ...current,
        isConnected: true,
        battery: batteryPct,
        // ROUNDING LOGIC APPLIED HERE
        temperature: this.roundToTwo(data.dogTempC),
        decibels: this.roundToTwo(data.lastLeqDb),
        heartRate: this.roundToTwo(rawHr), 
        
        isBarking: data.barkCount > 0,
        anxietyLevel: this.calculateAnxiety(data)
      };
    });

    // Update Map
    const cssPos = this.calculatePosition(data.lat, data.lon);
    this.dogPosition.set(cssPos);

    // Logs
    if (data.barkCount > 0) {
      this.addLog('alert', `Barking detected: ${data.barkCount} events`);
    }
  }

  
  startVisualizers() {
    this.animationInterval = setInterval(() => {
      const s = this.status();

      // IF DISCONNECTED: Flatline the visuals
      if (!s.isConnected) {
         // Push 0 to heart rate history
         this.heartRateHistory.update(h => [...h.slice(1), 0]);
         // Reset sound bars to low static
         this.soundBars.set(new Array(32).fill(2)); 
         return; 
      }

      // IF CONNECTED: Animate around the REAL values
      
      // Heart Rate: Add slight natural jitter around the real reported value
      // If backend says 72, we draw 71.5, 72.2, etc. to make it look "live"
      const jitter = (Math.random() * 2 - 1); 
      this.heartRateHistory.update(h => [...h.slice(1), s.heartRate + jitter]);

      // Sound Bars: Bounce randomly up to the current real dB level
      const baseLevel = s.decibels; 
      const newBars = Array.from({ length: 32 }, () => Math.random() * baseLevel);
      this.soundBars.set(newBars);

    }, 100);
  }

  // --- Helpers ---

  // Rounds to 2 decimal places
  private roundToTwo(num: number): number {
      if (num === undefined || num === null) return 0;
      return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  private mapBattery(mv: number): number {
    const min = 3600;
    const max = 4200;
    let pct = ((mv - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, Number(pct.toFixed(1))));
  }

  private calculatePosition(lat: number, lon: number) {
    const minLat = 38.2460, maxLat = 38.2470; 
    const minLon = 21.7340, maxLon = 21.7350;

    let y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    let x = ((lon - minLon) / (maxLon - minLon)) * 100;

    return { 
      x: Math.max(5, Math.min(95, x)), 
      y: Math.max(5, Math.min(95, y)) 
    };
  }

  private calculateAnxiety(data: CollarStatusDTO): number {
    let score = 10;
    if (data.lastLeqDb > 80) score += 40; 
    if (data.barkCount > 5) score += 30;  
    if (data.respRateBpm && data.respRateBpm > 50) score += 20; 
    return Math.min(100, score);
  }

  // --- Actions & View Helpers (Keep existing) ---
  // TODO: integrate with real backend actions (not yet implemented)
  triggerDeterrent(type: 'vibration' | 'ultrasonic') {
    if (type === 'vibration') {
      this.controls.update(c => ({ ...c, vibrationActive: true, feedbackMessage: 'Sending Haptic Signal...' }));
      this.addLog('action', 'Manual Vibration Triggered');
      setTimeout(() => {
        this.controls.update(c => ({ ...c, vibrationActive: false, feedbackMessage: null }));
      }, 2000);
    } else {
      this.controls.update(c => ({ ...c, ultrasonicActive: true, feedbackMessage: 'Emitting Ultrasonic Pulse...' }));
      this.addLog('action', 'Ultrasonic Deterrent Triggered');
      setTimeout(() => {
        this.controls.update(c => ({ ...c, ultrasonicActive: false, feedbackMessage: null }));
      }, 3000);
    }
  }

  addLog(type: 'alert' | 'info' | 'action', message: string) {
    const time = new Date().toLocaleTimeString('en-GB');
    this.logs.update(logs => [{ id: Date.now(), time, type, message }, ...logs].slice(0, 50));
  }

  getAnxietyColor() {
    const val = this.status().anxietyLevel;
    if (val < 30) return '#10b981'; 
    if (val < 70) return '#d97706'; 
    return '#e11d48'; 
  }

  getAnxietyLabel() {
    const val = this.status().anxietyLevel;
    if (val < 30) return 'Relaxed';
    if (val < 70) return 'Anxious';
    return 'Stressed';
  }

  anxietyOffset() {
    const maxOffset = 440;
    const percentage = this.status().anxietyLevel / 100;
    return maxOffset - (percentage * maxOffset * 0.75); 
  }

  heartPath() {
    const data = this.heartRateHistory();
    const width = 400; 
    const height = 100;
    const step = width / (data.length - 1);
    
    const normalize = (val: number) => {
       const min = 40;
       const max = 160;
       return height - ((val - min) / (max - min) * height);
    };

    let path = `M 0 ${normalize(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      const x = i * step;
      const y = normalize(data[i]);
      path += ` L ${x} ${y}`;
    }
    return path;
  }
}