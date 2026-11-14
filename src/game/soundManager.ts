import { GameWorldLocation } from './types';

export type FootstepSurface = 'grass' | 'stone' | 'sand' | 'wood' | 'water' | 'tile';

interface SpatialEmitter {
  x: number;
  z: number;
  maxDist: number;
  baseGain: number;
}

// Procedural 3D spatial soundscape + interactive SFX engine via Web Audio API (zero external files)
class GameSound {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private ambientTimer: number | null = null;
  private sparkleTimer: number | null = null;
  private activeWorld: GameWorldLocation | null = null;
  private ambientMasterGain: GainNode | null = null;
  private spatialGain: GainNode | null = null;
  private spatialPanner: StereoPannerNode | null = null;
  private activeSpatialType: GameWorldLocation | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private getAmbientMaster(): GainNode | null {
    if (!this.ctx) return null;
    if (!this.ambientMasterGain) {
      this.ambientMasterGain = this.ctx.createGain();
      this.ambientMasterGain.gain.value = 0.001;
      this.ambientMasterGain.connect(this.ctx.destination);
    }
    return this.ambientMasterGain;
  }

  private ensureSpatialBus(): { gain: GainNode; panner: StereoPannerNode } | null {
    if (!this.ctx) return null;
    const master = this.getAmbientMaster();
    if (!master) return null;
    if (!this.spatialGain || !this.spatialPanner) {
      this.spatialGain = this.ctx.createGain();
      this.spatialGain.gain.value = 0.25;
      this.spatialPanner = this.ctx.createStereoPanner();
      this.spatialPanner.pan.value = 0;
      this.spatialGain.connect(this.spatialPanner);
      this.spatialPanner.connect(master);
    }
    return { gain: this.spatialGain, panner: this.spatialPanner };
  }

  setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopAmbience();
    } else if (this.activeWorld) {
      const w = this.activeWorld;
      this.activeWorld = null;
      this.startAmbience(w);
    }
  }

  /**
   * 3D distance-attenuated spatial audio update called smoothly from the animation loop
   */
  updateSpatialListener(playerX: number, playerZ: number, camYaw: number, world: GameWorldLocation) {
    if (!this.enabled || !this.ctx || !this.ambientMasterGain) return;
    const bus = this.ensureSpatialBus();
    if (!bus) return;

    const emittersByWorld: Record<GameWorldLocation, SpatialEmitter[]> = {
      taman: [
        { x: 0, z: 0, maxDist: 16, baseGain: 0.45 }, // Fountain splash
        { x: 11.5, z: -11.5, maxDist: 12, baseGain: 0.3 }, // Koi bridge water
      ],
      pantai: [
        { x: playerX, z: -12, maxDist: 24, baseGain: 0.55 }, // Ocean shoreline waves
        { x: 10.5, z: 8.5, maxDist: 10, baseGain: 0.25 }, // Warung chatter
      ],
      cafe: [
        { x: -10, z: -11, maxDist: 14, baseGain: 0.42 }, // Espresso bar
        { x: 2, z: 1, maxDist: 16, baseGain: 0.28 }, // Center cafe jazz/fan
      ],
      aquarium: [
        { x: 0, z: 0, maxDist: 20, baseGain: 0.4 }, // Deep underwater tunnel resonance
        { x: -14, z: -10, maxDist: 12, baseGain: 0.35 }, // Shark tank hum
      ],
      pasar_malam: [
        { x: 16, z: -2, maxDist: 20, baseGain: 0.65 }, // Live stage dangdut loudspeakers
        { x: -7, z: 12, maxDist: 11, baseGain: 0.38 }, // Sate grill sizzle
        { x: -15, z: -2, maxDist: 14, baseGain: 0.45 }, // Carousel calliope
      ],
    };

    const emitters = emittersByWorld[world] || [];
    let bestGain = 0.2;
    let panAccum = 0;

    emitters.forEach((em) => {
      const dx = em.x - playerX;
      const dz = em.z - playerZ;
      const dist = Math.hypot(dx, dz);
      const atten = Math.max(0, 1 - dist / em.maxDist);
      const contrib = atten * atten * em.baseGain;
      if (contrib > bestGain) bestGain = contrib;
      // Rotate world delta into camera right axis for stereo panning
      const rightX = Math.cos(camYaw);
      const rightZ = -Math.sin(camYaw);
      const pan = Math.max(-1, Math.min(1, (dx * rightX + dz * rightZ) / Math.max(4, dist + 2)));
      panAccum += pan * atten;
    });

    const targetGain = Math.min(0.85, Math.max(0.14, bestGain));
    const now = this.ctx.currentTime;
    bus.gain.gain.setTargetAtTime(targetGain, now, 0.12);
    bus.panner.pan.setTargetAtTime(Math.max(-0.85, Math.min(0.85, panAccum)), now, 0.12);
  }

  startAmbience(world: GameWorldLocation) {
    if (this.activeWorld === world && this.ambientTimer !== null) return;
    this.stopAmbience();
    this.activeWorld = world;
    this.activeSpatialType = world;
    if (!this.enabled) return;

    try {
      this.init();
      const ctx = this.ctx;
      const master = this.getAmbientMaster();
      if (!ctx || !master) return;
      const spatial = this.ensureSpatialBus();
      const destNode = spatial ? spatial.gain : master;

      // Smooth fade-in per location (Pasar Malam livelier / louder!)
      const targetLevel = world === 'pasar_malam' ? 0.56 : world === 'pantai' ? 0.44 : 0.38;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(targetLevel, ctx.currentTime + 0.55);

      if (world === 'taman') {
        // Bird chirps + fountain water shimmer
        const triggerPark = () => {
          if (!this.enabled || this.activeWorld !== 'taman' || !this.ctx) return;
          const now = this.ctx.currentTime;
          const chirps = 2 + Math.floor(Math.random() * 2);
          for (let i = 0; i < chirps; i++) {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            const t = now + i * 0.14;
            const base = 1850 + Math.random() * 900;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(base, t);
            osc.frequency.exponentialRampToValueAtTime(base * 1.35, t + 0.05);
            osc.frequency.exponentialRampToValueAtTime(base * 0.92, t + 0.1);
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.055, t + 0.03);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
            osc.connect(g);
            g.connect(master);
            osc.start(t);
            osc.stop(t + 0.12);
          }
        };
        const triggerFountainWater = () => {
          if (!this.enabled || this.activeWorld !== 'taman' || !this.ctx) return;
          const now = this.ctx.currentTime;
          const dur = 1.6;
          const bufSize = Math.floor(this.ctx.sampleRate * dur);
          const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          const bp = this.ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 1100;
          bp.Q.value = 0.7;
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.002, now);
          g.gain.linearRampToValueAtTime(0.045, now + 0.4);
          g.gain.exponentialRampToValueAtTime(0.002, now + dur);
          src.connect(bp);
          bp.connect(g);
          g.connect(destNode);
          src.start(now);
          src.stop(now + dur);
        };
        triggerPark();
        triggerFountainWater();
        this.ambientTimer = window.setInterval(triggerPark, 2300);
        this.sparkleTimer = window.setInterval(triggerFountainWater, 1500);
      } else if (world === 'pantai') {
        // Rolling ocean waves surf + distant seagull cries
        const triggerWave = () => {
          if (!this.enabled || this.activeWorld !== 'pantai' || !this.ctx) return;
          const now = this.ctx.currentTime;
          const dur = 3.2;
          const bufSize = Math.floor(this.ctx.sampleRate * dur);
          const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < bufSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(220, now);
          filter.frequency.linearRampToValueAtTime(760, now + 1.3);
          filter.frequency.linearRampToValueAtTime(190, now + dur);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.002, now);
          g.gain.linearRampToValueAtTime(0.18, now + 1.3);
          g.gain.exponentialRampToValueAtTime(0.002, now + dur);
          src.connect(filter);
          filter.connect(g);
          g.connect(destNode);
          src.start(now);
          src.stop(now + dur);
        };
        const triggerGull = () => {
          if (!this.enabled || this.activeWorld !== 'pantai' || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1180, now);
          osc.frequency.exponentialRampToValueAtTime(840, now + 0.35);
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.028, now + 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 0.38);
        };
        triggerWave();
        this.ambientTimer = window.setInterval(triggerWave, 3300);
        this.sparkleTimer = window.setInterval(triggerGull, 4600);
      } else if (world === 'cafe') {
        // Cozy warm jazz Rhodes chords + espresso steam + soft cafe murmur
        const chords = [
          [261.63, 329.63, 392.0, 493.88],
          [220.0, 261.63, 329.63, 392.0],
          [174.61, 220.0, 261.63, 329.63],
          [196.0, 246.94, 293.66, 349.23],
        ];
        let step = 0;
        const triggerJazz = () => {
          if (!this.enabled || this.activeWorld !== 'cafe' || !this.ctx) return;
          const now = this.ctx.currentTime;
          const chord = chords[step % chords.length];
          step++;
          chord.forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            g.gain.setValueAtTime(0.001, now + idx * 0.04);
            g.gain.linearRampToValueAtTime(0.036, now + idx * 0.04 + 0.12);
            g.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
            osc.connect(g);
            g.connect(master);
            osc.start(now + idx * 0.04);
            osc.stop(now + 1.95);
          });

          if (step % 2 === 0) {
            const bufLen = Math.floor(this.ctx.sampleRate * 0.55);
            const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buf;
            const hp = this.ctx.createBiquadFilter();
            hp.type = 'bandpass';
            hp.frequency.value = 3200;
            const ng = this.ctx.createGain();
            ng.gain.setValueAtTime(0.001, now + 0.4);
            ng.gain.linearRampToValueAtTime(0.04, now + 0.55);
            ng.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
            noise.connect(hp);
            hp.connect(ng);
            ng.connect(destNode);
            noise.start(now + 0.4);
            noise.stop(now + 0.96);
          }
        };
        triggerJazz();
        this.ambientTimer = window.setInterval(triggerJazz, 2100);
      } else if (world === 'aquarium') {
        // Deep underwater harmonic shimmer + rising bubbles
        const triggerBubble = () => {
          if (!this.enabled || this.activeWorld !== 'aquarium' || !this.ctx) return;
          const now = this.ctx.currentTime;
          const count = 2 + Math.floor(Math.random() * 3);
          for (let i = 0; i < count; i++) {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            const t = now + i * 0.22;
            const f0 = 320 + Math.random() * 260;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f0, t);
            osc.frequency.exponentialRampToValueAtTime(f0 * 1.9, t + 0.14);
            g.gain.setValueAtTime(0.001, t);
            g.gain.linearRampToValueAtTime(0.055, t + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(g);
            g.connect(destNode);
            osc.start(t);
            osc.stop(t + 0.16);
          }
        };
        const triggerUnderwaterHum = () => {
          if (!this.enabled || this.activeWorld !== 'aquarium' || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.linearRampToValueAtTime(138, now + 1.5);
          osc.frequency.linearRampToValueAtTime(105, now + 3.0);
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.032, now + 1.0);
          g.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + 3.1);
        };
        triggerBubble();
        triggerUnderwaterHum();
        this.ambientTimer = window.setInterval(triggerBubble, 1700);
        this.sparkleTimer = window.setInterval(triggerUnderwaterHum, 3200);
      } else if (world === 'pasar_malam') {
        // Liveliest Pasar Malam: upbeat dangdut ketipung + suling + grill sizzle
        let beat = 0;
        const dangdutNotes = [293.66, 329.63, 349.23, 392.0, 440.0, 392.0, 349.23, 329.63];
        const triggerDangdut = () => {
          if (!this.enabled || this.activeWorld !== 'pasar_malam' || !this.ctx) return;
          const now = this.ctx.currentTime;
          const drum = this.ctx.createOscillator();
          const dg = this.ctx.createGain();
          drum.type = 'sine';
          const isDut = beat % 2 === 0;
          drum.frequency.setValueAtTime(isDut ? 145 : 260, now);
          drum.frequency.exponentialRampToValueAtTime(isDut ? 62 : 160, now + 0.14);
          dg.gain.setValueAtTime(0.11, now);
          dg.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          drum.connect(dg);
          dg.connect(destNode);
          drum.start(now);
          drum.stop(now + 0.17);

          const mel = this.ctx.createOscillator();
          const mg = this.ctx.createGain();
          mel.type = 'triangle';
          mel.frequency.setValueAtTime(dangdutNotes[beat % dangdutNotes.length], now);
          mg.gain.setValueAtTime(0.035, now);
          mg.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          mel.connect(mg);
          mg.connect(destNode);
          mel.start(now);
          mel.stop(now + 0.26);

          beat++;
        };
        triggerDangdut();
        this.ambientTimer = window.setInterval(triggerDangdut, 300);
      }
    } catch {
      // safe fallback
    }
  }

  stopAmbience() {
    if (this.ambientTimer !== null) {
      window.clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.sparkleTimer !== null) {
      window.clearInterval(this.sparkleTimer);
      this.sparkleTimer = null;
    }
    if (this.ctx && this.ambientMasterGain) {
      try {
        this.ambientMasterGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.08);
      } catch {
        // ignored
      }
    }
    this.activeWorld = null;
    this.activeSpatialType = null;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.045);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // ignored
    }
  }

  playDoor() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [880, 1174.66].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        g.gain.setValueAtTime(0.11, now + idx * 0.09);
        g.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.09 + 0.25);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.26);
      });
    } catch {
      // ignored
    }
  }

  playPhoto() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufSize = Math.floor(this.ctx.sampleRate * 0.08);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / 600);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1800;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.24, now);
      g.gain.exponentialRampToValueAtTime(0.005, now + 0.075);
      src.connect(hp);
      hp.connect(g);
      g.connect(this.ctx.destination);
      src.start(now);
    } catch {
      // ignored
    }
  }

  playBump() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(175, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.14);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // ignored
    }
  }

  playPop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // safe fallback
    }
  }

  playStep(surface: FootstepSurface = 'stone') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freqMap: Record<FootstepSurface, number> = {
        grass: 105,
        sand: 88,
        wood: 155,
        tile: 210,
        stone: 140,
        water: 280,
      };
      osc.type = surface === 'water' ? 'sine' : 'triangle';
      const base = freqMap[surface] + Math.random() * 25;
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 0.45, now + 0.055);
      gain.gain.setValueAtTime(surface === 'sand' ? 0.025 : 0.042, now);
      gain.gain.exponentialRampToValueAtTime(0.004, now + 0.055);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // safe fallback
    }
  }

  playJump() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // safe fallback
    }
  }

  playSit() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // safe fallback
    }
  }

  playCoin() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // safe fallback
    }
  }

  playEat() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.09].forEach((offset) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600 + Math.random() * 200, now + offset);
        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.06);
      });
    } catch {
      // safe fallback
    }
  }

  playFanfare() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      });
    } catch {
      // safe fallback
    }
  }
}

export const sound = new GameSound();
