/**
 * Meso. Game - De 16 Ani Am Crescut Împreună
 * Pure 2D High-Performance Video Game Engine
 * 
 * Updates:
 * - Eliminat butonul din colț (ecran curat și aerisit)
 * - Șosea statică jos (asfalt de oraș cu bordură din beton și marcaje rutiere statice)
 * - Dönerii sunt acum MONEDE MICI elegante cu Döner în relief
 * - Nu mai scrie "+1 döner" la colectare
 * - Dönerii NU mai apar la fiecare tub (apar ca recompensă plăcută la fiecare 2-3 lumânări)
 * - La scorul 16: apare mesaj superb "La mulți ani Meso.!" și JOCUL CONTINUĂ fără oprire!
 */

(function () {
  'use strict';

  const V_WIDTH = 400;
  const V_HEIGHT = 700;
  const GROUND_Y = 575;

  function drawRoundRect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
    }
  }

  // Lista completă cu restaurantele Mesopotamia (se deblochează din 7 în 7 puncte)
  const RESTAURANT_LOCATIONS = [
    "Mesopotamia Iulius Mall Suceava",
    "Mesopotamia Arena Mall Bacau",
    "Mesopotamia City Park Constanta",
    "Mesopotamia Palas Mall Iasi",
    "Mesopotamia Iulius Iasi Mall",
    "Mesopotamia Shopping City Galati",
    "Mesopotamia Craiova Electroputere Mall",
    "Mesopotamia Vulcan Value Centre",
    "Mesopotamia Targu Jiu",
    "Mesopotamia Mega Mall",
    "Mesopotamia Coresi Brasov",
    "Mesopotamia Ploiesti Shopping City",
    "Mesopotamia Supernova Lujerului",
    "Mesopotamia Craiova Electroputere Mall Pui",
    "Mesopotamia Lotus Mall Oradea",
    "Mesopotamia Timisoara Shopping City",
    "Mesopotamia Colentina București",
    "Mesopotamia Plaza",
    "Mesopotamia Prima Shop Oradea",
    "Mesopotamia Vitan",
    "Mesopotamia Ploiesti Stradal",
    "Mesopotamia Park Lake",
    "Mesopotamia Satu Mare",
    "Mesopotamia Auchan Drumul Taberelor",
    "Mesopotamia Cluj Centru",
    "Mesopotamia Sibiu Selimbar",
    "Mesopotamia Vivo Constanta",
    "Mesopotamia Braila",
    "Mesopotamia Buzau Shopping City",
    "Mesopotamia Promenada Mall Sibiu",
    "Mesopotamia Zalau Value Center",
    "Mesopotamia Radauti",
    "Mesopotamia Bacau Centru",
    "Mesopotamia Targu Mures",
    "Mesopotamia Dambovita Mall",
    "Mesopotamia Iulius Town Timisoara",
    "Mesopotamia Promenada Mall",
    "Mesopotamia Uvertura Mall",
    "Mesopotamia Sepsi Value Centre",
    "Mesopotamia Carrefour Brasov",
    "Mesopotamia Afi Cotroceni Parter",
    "Mesopotamia Afi Cotroceni Etaj",
    "Mesopotamia AFI Ploiesti",
    "Mesopotamia Roman Value Center",
    "Mesopotamia Arad Atrium",
    "Mesopotamia Cluj Vivo",
    "Mesopotamia Vivo Baia Mare",
    "Mesopotamia Barlad Value Center",
    "Mesopotamia Ploiesti Value Centre",
    "Mesopotamia Shopping City Piatra Neamt",
    "Mesopotamia Ramnicu Valcea",
    "Mesopotamia Deva",
    "Mesopotamia Colosseum Mall",
    "Mesopotamia Magnolia Center Oradea",
    "Mesopotamia Funshop Park",
    "Mesopotamia One Cotroceni",
    "Mesopotamia Piata Romana",
    "Mesopotamia Oradea Alecsandri",
    "Mesopotamia Pitesti Vivo",
    "Mesopotamia Baneasa",
    "Mesopotamia Bucur Obor",
    "Mesopotamia Afi Bucurestii Noi",
    "Mesopotamia Carrefour Militari",
    "Mesopotamia Alba Iulia Carolina Mall",
    "Mesopotamia Craiova Promenada",
    "Mesopotamia Afi Arad",
    "Mesopotamia Sun Plaza",
    "Mesopotamia Sinaia Plaza",
    "Mesopotamia Arges Mall Pitesti",
    "Mesopotamia Auchan Titan",
    "Mesopotamia DN 1 Value Center",
    "Mesopotamia Moldova Mall Iasi",
    "Mesopotamia Timisoara UBC",
    "Mesopotamia Pitesti Retail Park",
    "Mesopotamia Brasov AFI",
    "Mesopotamia Suceava Areni",
    "Mesopotamia Auchan Militari",
    "Mesopotamia Cluj-Napoca Iulius Mall",
    "Mesopotamia Pipera Bucuresti",
    "Mesopotamia MPARK Titan București",
    "Mesopotamia MPARK MIHAI BRAVU București",
    "Mesopotamia Sibiu Prima Shopping Center",
    "Mesopotamia Tom Constanta",
    "Mesopotamia Bran",
    "Mesopotamia Urbano Cluj",
    "Mesopotamia Dumbravita Timisoara",
    "Mesopotamia Orhidea Bucuresti",
    "Mesopotamia Bragadiru",
    "Meso Cafe Coresi Brasov",
    "Mesopotamia Sigma Cluj",
    "Mesopotamia Voluntari",
    "Mesopotamia Braila Plaza",
    "Mesopotamia Timisoara Centru",
    "Ungaria - WestEnd",
    "Ungaria - Etele"
  ];

  // ==========================================
  // 1. SOUND & MUSIC SYSTEM (Web Audio API)
  // ==========================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      let isMuted = false;
      try {
        isMuted = typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('meso_muted') === 'true';
      } catch (e) {}
      this.muted = isMuted;
      this.musicPlaying = false;
      this.nextNoteTime = 0;
      this.currentStep = 0;
      this.tempo = 136;

      // Celebratory arcade melody
      this.melody = [
        523.25, 0, 523.25, 587.33, 0, 659.25, 783.99, 0,
        659.25, 0, 587.33, 523.25, 0, 659.25, 783.99, 880.00,
        1046.5, 0, 880.00, 783.99, 0, 659.25, 587.33, 0,
        523.25, 659.25, 783.99, 1046.5, 0, 783.99, 880.00, 1046.5
      ];
      this.bass = [
        261.63, 261.63, 196.00, 196.00, 220.00, 220.00, 174.61, 174.61,
        261.63, 261.63, 196.00, 196.00, 220.00, 220.00, 174.61, 196.00
      ];

      this.initOnGesture = this.initOnGesture.bind(this);
      window.addEventListener('click', this.initOnGesture, { once: true });
      window.addEventListener('keydown', this.initOnGesture, { once: true });
      window.addEventListener('touchstart', this.initOnGesture, { once: true, passive: true });
      window.addEventListener('pointerdown', this.initOnGesture, { once: true });
    }

    initOnGesture() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.muted && !this.musicPlaying) {
        this.startMusic();
      }
    }

    startMusic() {
      if (!this.ctx || this.muted) return;
      this.musicPlaying = true;
      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this.scheduleMusic();
    }

    scheduleMusic() {
      if (!this.musicPlaying || this.muted || !this.ctx) return;
      const secondsPerStep = (60 / this.tempo) / 4;

      while (this.nextNoteTime < this.ctx.currentTime + 0.25) {
        const mNote = this.melody[this.currentStep % this.melody.length];
        if (mNote > 0) {
          this.playSynthNote(mNote, this.nextNoteTime, secondsPerStep * 0.85, 'triangle', 0.045);
        }

        const bassIdx = Math.floor(this.currentStep / 2) % this.bass.length;
        const bNote = this.bass[bassIdx];
        if (this.currentStep % 2 === 0 && bNote > 0) {
          this.playSynthNote(bNote, this.nextNoteTime, secondsPerStep * 1.5, 'sine', 0.065);
        }

        this.nextNoteTime += secondsPerStep;
        this.currentStep++;
      }

      requestAnimationFrame(this.scheduleMusic.bind(this));
    }

    playSynthNote(freq, time, duration, type = 'square', volume = 0.05) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
      } catch (e) {}
    }

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('meso_muted', this.muted);
      if (this.muted) {
        this.musicPlaying = false;
      } else {
        this.startMusic();
      }
      return this.muted;
    }

    playFlap() {
      if (this.muted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(470, t);
        osc.frequency.exponentialRampToValueAtTime(170, t + 0.12);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
      } catch (e) {}
    }

    playScoreDing() {
      if (this.muted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, t);
        osc.frequency.setValueAtTime(1318.51, t + 0.05);

        gain.gain.setValueAtTime(0.26, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      } catch (e) {}
    }

    playDonerCollect() {
      if (this.muted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        [587.33, 880.00, 1174.66, 1760.00].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.035);

          gain.gain.setValueAtTime(0.25, t + idx * 0.035);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.035 + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + idx * 0.035);
          osc.stop(t + idx * 0.035 + 0.25);
        });
      } catch (e) {}
    }

    playQuickDive() {
      if (this.muted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.18);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      } catch (e) {}
    }

    playHit() {
      if (this.muted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);

        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      } catch (e) {}
    }

    playLocationFanfare() {
      if (this.muted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          this.playSynthNote(freq, t + idx * 0.08, 0.22, 'triangle', 0.07);
        });
      } catch (e) {}
    }
  }

  // ==========================================
  // 2. VIDEO GAME PARTICLE ENGINE
  // ==========================================
  class ParticleManager {
    constructor() {
      this.particles = [];
      this.shockwaves = [];
    }

    spawnFlapEffects(x, y) {
      if (this.particles.length > 22) return;
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          type: 'dust',
          x: x - 12 + Math.random() * 8,
          y: y + 10 + Math.random() * 6,
          vx: -20 - Math.random() * 30,
          vy: -10 + Math.random() * 20,
          radius: 3.5 + Math.random() * 3.5,
          alpha: 0.6,
          life: 0.35
        });
      }

      if (Math.random() < 0.5) {
        this.particles.push({
          type: 'feather',
          x: x - 16,
          y: y + 6,
          vx: -35 - Math.random() * 20,
          vy: 15 + Math.random() * 20,
          rot: Math.random() * Math.PI,
          rotSpeed: 3 + Math.random() * 4,
          w: 8,
          h: 4,
          alpha: 0.85,
          life: 0.75
        });
      }
    }

    spawnDonerCollectBurst(x, y) {
      this.shockwaves.push({
        x: x,
        y: y,
        radius: 4,
        maxRadius: 34,
        alpha: 1.0,
        color: '#ffd60a'
      });

      const starColors = ['#ffd60a', '#ffc300', '#ff9e00', '#ffffff', '#e02b20'];
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.3;
        const spd = 60 + Math.random() * 80;
        this.particles.push({
          type: 'star',
          x: x,
          y: y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 15,
          radius: 3 + Math.random() * 2,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: 5 + Math.random() * 8,
          color: starColors[i % starColors.length],
          alpha: 1.0,
          life: 0.5
        });
      }

      if (this.particles.length > 24) {
        this.particles.splice(0, this.particles.length - 24);
      }
    }

    update(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

        if (p.type === 'dust') {
          p.radius += dt * 10;
          p.alpha -= dt * 1.8;
        } else if (p.type === 'feather') {
          p.vy += 30 * dt;
          p.rot += p.rotSpeed * dt;
          p.alpha -= dt * 1.1;
        } else if (p.type === 'star') {
          p.vy += 120 * dt;
          p.rot += p.rotSpeed * dt;
          p.alpha -= dt * 1.8;
        }

        if (p.life <= 0 || p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += dt * 90;
        sw.alpha -= dt * 2.5;
        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          this.shockwaves.splice(i, 1);
        }
      }
    }

    render(ctx) {
      ctx.save();

      this.shockwaves.forEach(sw => {
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      this.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.type === 'dust') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'feather') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'star') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
        }

        ctx.restore();
      });

      ctx.restore();
    }
  }

  // ==========================================
  // 3. ANIMATED MESO MASCOT
  // ==========================================
  class Bird2D {
    constructor(image) {
      this.image = image;
      this.x = 200;
      this.y = 250;
      this.vy = 0;
      this.gravity = 910;
      this.jumpVelocity = -325;
      this.diveVelocity = 480;
      this.rotation = 0;
      this.targetRotation = 0;
      this.radius = 21;
      this.hitboxRadius = 13.5;

      this.scaleX = 1.0;
      this.scaleY = 1.0;

      this.wingAngle = 0;
      this.wingSpeed = 10;
      this.flapImpulse = 0;
      this.flightTime = 0;

      this.blinkTimer = 0;
      this.isBlinking = false;
    }

    flap() {
      this.vy = this.jumpVelocity;
      this.scaleX = 0.88;
      this.scaleY = 1.18;
      this.flapImpulse = 24;
    }

    quickDive() {
      this.vy = this.diveVelocity;
      this.scaleX = 1.18;
      this.scaleY = 0.86;
      this.targetRotation = 0.85;
    }

    reset() {
      this.x = 100;
      this.y = 280;
      this.vy = 0;
      this.rotation = 0;
      this.targetRotation = 0;
      this.scaleX = 1.0;
      this.scaleY = 1.0;
      this.flapImpulse = 0;
      this.flightTime = 0;
    }

    update(dt) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      this.flightTime += dt;

      // Smooth, natural aerodynamic rotation
      if (this.vy < -60) {
        this.targetRotation = -0.32;
      } else if (this.vy < 80) {
        this.targetRotation = -0.05;
      } else {
        this.targetRotation = Math.min(0.75, (this.vy / 480) * 0.85);
      }
      this.rotation += (this.targetRotation - this.rotation) * Math.min(1, dt * 10);

      // Spring recovery from flap squash-and-stretch
      this.scaleX += (1.0 - this.scaleX) * Math.min(1, dt * 9);
      this.scaleY += (1.0 - this.scaleY) * Math.min(1, dt * 9);

      this.flapImpulse = Math.max(0, this.flapImpulse - dt * 38);
      const totalWingSpeed = this.wingSpeed + this.flapImpulse;
      this.wingAngle = Math.sin(this.flightTime * totalWingSpeed) * 0.45;

      this.blinkTimer += dt;
      if (this.blinkTimer > 3.6) {
        this.isBlinking = true;
        if (this.blinkTimer > 3.75) {
          this.isBlinking = false;
          this.blinkTimer = 0;
        }
      }
    }

    render(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Speed Swoosh Wind Trails behind bird
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.lineCap = 'round';

      const wave = Math.sin(this.flightTime * 16);

      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-32 - wave * 2, -8 + wave * 1.5);
      ctx.lineTo(-15, -8);
      ctx.stroke();

      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(-40 + wave * 3, 0);
      ctx.lineTo(-18, 0);
      ctx.stroke();

      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-30 - wave * 2, 8 - wave * 1.5);
      ctx.lineTo(-14, 8);
      ctx.stroke();
      ctx.restore();

      ctx.rotate(this.rotation);
      ctx.scale(this.scaleX, this.scaleY);

      if (this.image && this.image.complete && this.image.naturalWidth > 0) {
        const w = 54;
        const h = 50;

        // Subtle soft shadow underneath
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.beginPath();
        ctx.ellipse(0, 18, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // High-res Meso mascot (clean, no artificial brown overlay!)
        ctx.drawImage(this.image, -w / 2, -h / 2, w, h);

        if (this.isBlinking) {
          ctx.save();
          ctx.strokeStyle = '#1b120c';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(8, -5, 4, 0.2, Math.PI - 0.2);
          ctx.stroke();
          ctx.restore();
        }

      } else {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1b263b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1b263b';
        ctx.beginPath();
        ctx.arc(8, -4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fb8500';
        ctx.beginPath();
        ctx.moveTo(14, -2);
        ctx.lineTo(24, 1);
        ctx.lineTo(14, 6);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==========================================
  // ==========================================
  // 4. CLASSIC CLEAN 3D FLAPPY PIPES
  // (Tuburi curate, clasice, elegante cu efect 3D cilindric)
  // ==========================================
  class Pipe2D {
    constructor(x, gapY, gapSize = 188) {
      this.x = x;
      this.gapY = gapY;
      this.gapSize = gapSize;
      this.width = 66;
      this.collarW = 78;   // Overhangs 6px on each side
      this.collarH = 26;   // Classic Flappy pipe collar lip height
      this.cleared = false;
    }

    update(dt, speed) {
      this.x -= speed * dt;
    }

    render(ctx) {
      const topPipeBottom = this.gapY - this.gapSize / 2;
      const bottomPipeTop = this.gapY + this.gapSize / 2;

      this.drawTopPipe(ctx, this.x, topPipeBottom);
      this.drawBottomPipe(ctx, this.x, bottomPipeTop);
    }

    drawTopPipe(ctx, x, bottomY) {
      if (bottomY <= 4) return;
      ctx.save();

      const shaftH = Math.max(0, bottomY - this.collarH);
      const collarY = shaftH;

      // 1. Shaft (Ultra-smooth 3D Cylinder with rich Meso emerald gradient)
      this.draw3DCylinder(ctx, x, 0, this.width, shaftH);

      // 2. Collar Lip (Flanged 3D Head at opening - clean, without ugly black cavity)
      const cx = x - (this.collarW - this.width) / 2;
      this.draw3DCollar(ctx, cx, collarY, this.collarW, this.collarH, true);

      ctx.restore();
    }

    drawBottomPipe(ctx, x, topY) {
      const totalH = GROUND_Y - topY;
      if (totalH <= 4) return;
      ctx.save();

      const collarY = topY;
      const shaftY = topY + this.collarH;
      const shaftH = Math.max(0, GROUND_Y - shaftY);

      // 1. Shaft (Ultra-smooth 3D Cylinder)
      this.draw3DCylinder(ctx, x, shaftY, this.width, shaftH);

      // 2. Collar Lip (Flanged 3D Head at opening - clean, without ugly black cavity)
      const cx = x - (this.collarW - this.width) / 2;
      this.draw3DCollar(ctx, cx, collarY, this.collarW, this.collarH, false);

      ctx.restore();
    }

    draw3DCylinder(ctx, x, y, w, h) {
      if (h <= 0) return;
      ctx.save();
      ctx.translate(x, y);

      // Rich 3D Volumetric Meso Emerald Gradient (Single fast GPU draw call!)
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0.0, '#155d27');  // Left ambient curvature
      grad.addColorStop(0.12, '#22c55e'); // Curvature illumination
      grad.addColorStop(0.24, '#4ade80'); // Specular highlight streak
      grad.addColorStop(0.36, '#86efac'); // Intense glossy glint
      grad.addColorStop(0.48, '#22c55e'); // Body emerald tone
      grad.addColorStop(0.78, '#16a34a'); // Diffuse shading
      grad.addColorStop(0.92, '#15803d'); // Right curvature shadow
      grad.addColorStop(1.0, '#0d401a');  // Deep ambient edge
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle Vertical Segment Seams (Architectural arcade modular pipe joints)
      if (h > 90) {
        for (let sy = 75; sy < h - 20; sy += 75) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.fillRect(0, sy, w, 2.5);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(0, sy + 2.5, w, 1);
        }
      }

      // Clean arcade dark outline
      ctx.strokeStyle = '#0a2e12';
      ctx.lineWidth = 2.4;
      ctx.strokeRect(0, 0, w, h);

      ctx.restore();
    }

    draw3DCollar(ctx, x, y, w, h, isTopPipe = false) {
      ctx.save();
      ctx.translate(x, y);

      const rad = 7.5;
      const radii = isTopPipe ? [3, 3, rad, rad] : [rad, rad, 3, 3];

      // Drop shadow from collar overhang onto shaft
      if (isTopPipe) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(5, -6, w - 10, 6);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(5, h, w - 10, 8);
      }

      // Rich 3D Volumetric Collar Gradient (Matches cylinder with extra brilliance)
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0.0, '#166534');
      grad.addColorStop(0.12, '#22c55e');
      grad.addColorStop(0.22, '#4ade80');
      grad.addColorStop(0.34, '#bbf7d0'); // High-gloss specular highlight
      grad.addColorStop(0.46, '#22c55e');
      grad.addColorStop(0.78, '#15803d');
      grad.addColorStop(0.92, '#166534');
      grad.addColorStop(1.0, '#0a2e12');

      ctx.fillStyle = grad;
      drawRoundRect(ctx, 0, 0, w, h, radii);
      ctx.fill();

      // Golden Anniversary Trim Rim on Collar Lip ("Meso 16" luxury detail!)
      const goldY = isTopPipe ? 3 : h - 6;
      ctx.fillStyle = '#ffd60a';
      ctx.fillRect(3, goldY, w - 6, 2.5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(8, goldY, 20, 1.2);

      // Outer Beveled Highlight on mouth edge
      const edgeY = isTopPipe ? h - 2 : 1;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillRect(2, edgeY, w - 4, 1.5);

      // Clean arcade dark outline
      ctx.strokeStyle = '#0a2e12';
      ctx.lineWidth = 2.4;
      drawRoundRect(ctx, 0, 0, w, h, radii);
      ctx.stroke();

      ctx.restore();
    }

    checkCollision(bird) {
      const topBottom = this.gapY - this.gapSize / 2;
      const bottomTop = this.gapY + this.gapSize / 2;
      const r = bird.hitboxRadius || 13.5;

      if (bird.x + r > this.x - 4 && bird.x - r < this.x + this.width + 4) {
        if (bird.y - r < topBottom || bird.y + r > bottomTop) {
          return true;
        }
      }
      return false;
    }
  }

  // Alias for backward compatibility
  const Candle2D = Pipe2D;

  // ==========================================
  // 5. TOWN ENTRANCE ROAD SIGN ("Pancardă intrare în localitate")
  // ("iar locatia vreau sa fie pe drum o parcada cum ai intra in locatitate si scrie pe placuta locatia")
  // ==========================================
  class TownRoadSign2D {
    constructor(x, locIdx) {
      this.x = x;
      this.locIdx = locIdx;
      this.locName = RESTAURANT_LOCATIONS[locIdx % RESTAURANT_LOCATIONS.length] || "Mesopotamia";
      this.displayName = this.locName.replace(/^Mesopotamia\s*/i, '').trim();
      this.width = 216;
      this.height = 72;
      this.y = GROUND_Y - 98; // Taller posts, elevated grand highway sign
      const len = this.displayName.length;
      this.fontSize = len > 24 ? 12 : (len > 18 ? 13.5 : 15.5);
    }

    update(dt, speed) {
      this.x -= speed * dt;
    }

    render(ctx) {
      ctx.save();

      const postW = 7;
      const post1X = this.x + 28;
      const post2X = this.x + this.width - 28 - postW;
      const postTop = this.y + 24;
      const postBottom = GROUND_Y + 12;

      // 1. Double Steel Heavy-Duty Structural Columns
      [post1X, post2X].forEach(px => {
        // Deep shadow behind column
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(px + 3, postTop, postW + 1, postBottom - postTop);

        // Metallic Column with 3D bevel gradient
        const postGrad = ctx.createLinearGradient(px, 0, px + postW, 0);
        postGrad.addColorStop(0, '#64748b');
        postGrad.addColorStop(0.3, '#f1f5f9');
        postGrad.addColorStop(0.7, '#94a3b8');
        postGrad.addColorStop(1, '#334155');
        ctx.fillStyle = postGrad;
        ctx.fillRect(px, postTop, postW, postBottom - postTop);

        // Heavy-duty mounting clamp brackets
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 2, this.y + 28, postW + 4, 4);
        ctx.fillRect(px - 2, this.y + 54, postW + 4, 4);
        ctx.fillStyle = '#ffd60a';
        ctx.fillRect(px, this.y + 29, 2, 2);
        ctx.fillRect(px, this.y + 55, 2, 2);

        // Base structural anchoring flange on road curb
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px - 4, GROUND_Y - 2, postW + 8, 4);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(px - 2, GROUND_Y - 3, 2, 2);
        ctx.fillRect(px + postW, GROUND_Y - 3, 2, 2);
      });

      // Horizontal cross-strut truss between posts
      const strutY = this.y + this.height + 10;
      if (strutY < GROUND_Y - 4) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(post1X + postW, strutY, post2X - (post1X + postW), 3);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(post1X + postW, strutY, post2X - (post1X + postW), 1);
      }

      // 2. 3D Cast Shadow from signboard onto road & background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
      drawRoundRect(ctx, this.x + 5, this.y + 6, this.width, this.height, 10);
      ctx.fill();

      // 3. Overhead Gooseneck Solar Lamps (2 modern LED highway floodlights)
      const lamp1X = this.x + 52;
      const lamp2X = this.x + this.width - 52;
      [lamp1X, lamp2X].forEach(lx => {
        // Gooseneck arch
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lx, this.y + 4);
        ctx.quadraticCurveTo(lx, this.y - 14, lx + 6, this.y - 12);
        ctx.stroke();

        // Lamp fixture housing
        ctx.fillStyle = '#ffd60a';
        drawRoundRect(ctx, lx + 2, this.y - 15, 12, 5, 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(lx + 4, this.y - 11, 8, 1.5);

        // Soft spotlight illumination cone cast on the sign
        const spotGrad = ctx.createRadialGradient(lx + 8, this.y - 10, 2, lx + 8, this.y + 20, 38);
        spotGrad.addColorStop(0, 'rgba(255, 240, 160, 0.35)');
        spotGrad.addColorStop(0.5, 'rgba(255, 220, 100, 0.12)');
        spotGrad.addColorStop(1, 'rgba(255, 220, 100, 0)');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.moveTo(lx + 4, this.y - 10);
        ctx.lineTo(lx - 22, this.y + 45);
        ctx.lineTo(lx + 38, this.y + 45);
        ctx.closePath();
        ctx.fill();
      });

      // 4. Signboard Plate Body (High-Gloss European Highway Placard)
      const plateGrad = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
      plateGrad.addColorStop(0, '#1c6d3b');
      plateGrad.addColorStop(0.3, '#14562d');
      plateGrad.addColorStop(0.7, '#0d3d1f');
      plateGrad.addColorStop(1, '#062010');
      ctx.fillStyle = plateGrad;
      drawRoundRect(ctx, this.x, this.y, this.width, this.height, 10);
      ctx.fill();

      // Specular Glass Reflection Sheen across top half
      const sheenGrad = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + 36);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      sheenGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sheenGrad;
      drawRoundRect(ctx, this.x + 2, this.y + 2, this.width - 4, 32, 8);
      ctx.fill();

      // Outer Heavy Gold Highway Border
      ctx.strokeStyle = '#ffd60a';
      ctx.lineWidth = 3.0;
      drawRoundRect(ctx, this.x, this.y, this.width, this.height, 10);
      ctx.stroke();

      // Inner High-Visibility Reflective White Pinstripe
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.2;
      drawRoundRect(ctx, this.x + 4.5, this.y + 4.5, this.width - 9, this.height - 9, 7);
      ctx.stroke();

      // 5. Header Pill Badge ("📍 BINE AȚI VENIT • #... MESO")
      const pillW = 168;
      const pillH = 16;
      const pillX = this.x + (this.width - pillW) / 2;
      const pillY = this.y + 8;
      ctx.fillStyle = 'rgba(5, 25, 12, 0.75)';
      drawRoundRect(ctx, pillX, pillY, pillW, pillH, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 214, 10, 0.7)';
      ctx.lineWidth = 1.0;
      drawRoundRect(ctx, pillX, pillY, pillW, pillH, 8);
      ctx.stroke();

      ctx.fillStyle = '#ffc300';
      ctx.font = '900 9px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`📍 BINE AȚI VENIT • #${this.locIdx + 1} MESO`, this.x + this.width / 2, pillY + 11.5);

      // 6. Main Restaurant / Mall Name (Embroidery 3D text with rich readability)
      const nameY = this.y + 43;
      // Drop Shadow for 3D depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.font = `900 ${this.fontSize}px "Lilita One", "Titan One", "Outfit", sans-serif`;
      ctx.fillText(this.displayName, this.x + this.width / 2, nameY + 2);

      // Crisp White Foreground
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.displayName, this.x + this.width / 2, nameY);

      // 7. Footer Tagline ("✨ DE 16 ANI • GUSTUL TĂU FAVORIT ✨")
      ctx.fillStyle = 'rgba(255, 214, 10, 0.4)';
      ctx.fillRect(this.x + 22, this.y + 53, this.width - 44, 1);

      ctx.fillStyle = '#ffd60a';
      ctx.font = '800 8px "Outfit", sans-serif';
      ctx.fillText('DE 16 ANI • GUSTUL TĂU FAVORIT', this.x + this.width / 2, this.y + 63);

      // 8. Corner Chrome Rivets
      [
        [this.x + 8, this.y + 8],
        [this.x + this.width - 8, this.y + 8],
        [this.x + 8, this.y + this.height - 8],
        [this.x + this.width - 8, this.y + this.height - 8]
      ].forEach(([rx, ry]) => {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(rx + 0.5, ry + 0.5, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(rx - 0.5, ry - 0.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  }

  // ==========================================
  // 5. SMALL DÖNER COIN COLLECTIBLE
  // ("doneri sa ii faci moende mici")
  // ==========================================
  class DonerCollectible2D {
    constructor(x, y, donerImage) {
      this.x = x;
      this.y = y;
      this.baseY = y;
      this.image = donerImage;
      this.radius = 14;
      this.collected = false;
      this.bobTimer = Math.random() * Math.PI * 2;
    }

    update(dt, speed) {
      this.x -= speed * dt;
      this.bobTimer += dt * 4.2;
      this.y = this.baseY + Math.sin(this.bobTimer) * 5;
    }

    render(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Warm Golden Ambient Aura (Direct fill, zero allocations)
      ctx.fillStyle = 'rgba(255, 195, 0, 0.28)';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Metallic Gold Rim
      ctx.fillStyle = '#ffc300';
      ctx.strokeStyle = '#2e1903';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner Coin Face
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius - 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Miniature crisp Döner inside coin
      if (this.image && this.image.complete && this.image.naturalWidth > 0) {
        const w = 19;
        const h = 15;
        ctx.drawImage(this.image, -w / 2, -h / 2, w, h);
      } else {
        ctx.fillStyle = '#6e3e08';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🥙', 0, 0);
      }

      // Micro star glint
      const sScale = Math.sin(this.bobTimer * 2.5);
      if (sScale > 0.6) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(8, -7, 1.8 * sScale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ==========================================
  // 6. ATMOSPHERIC DAY-NIGHT CYCLE & 100% STATIC ROAD
  // ("fa sa inceapa zi dupa se schimba si noapte", "sosea jos statica")
  // ==========================================
  function lerpVal(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpRGB(c1, c2, t) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgb(${r},${g},${b})`;
  }

  function lerpArr(c1, c2, t) {
    return [
      Math.round(c1[0] + (c2[0] - c1[0]) * t),
      Math.round(c1[1] + (c2[1] - c1[1]) * t),
      Math.round(c1[2] + (c2[2] - c1[2]) * t)
    ];
  }

  class Scenery2D {
    constructor() {
      // 3D Parallax Skyline Layers & Moving Road
      this.farSkylineX = 0;
      this.nearSkylineX = 0;
      this.beaconTimer = 0;
      this.groundOffset = 0;
      this.lightsWave = 0;
      this.sunRotation = 0;

      // Time of Day: 0.0 = Day (Zi), 0.33 = Sunset (Apus), 0.65 = Festive Night (Noapte), 0.88 = Dawn (Răsărit)
      this.timeOfDay = 0.0;

      // Daytime Drifting Fluffy Cumulus Clouds
      this.clouds = [
        { x: 30, y: 65, w: 90, h: 26, speed: 7 },
        { x: 175, y: 115, w: 125, h: 32, speed: 11 },
        { x: 330, y: 50, w: 80, h: 22, speed: 6 },
        { x: 440, y: 95, w: 105, h: 28, speed: 9 }
      ];

      // Twinkling Night Stars
      this.stars = [];
      for (let i = 0; i < 42; i++) {
        this.stars.push({
          x: Math.random() * V_WIDTH,
          y: 15 + Math.random() * 260,
          radius: 0.8 + Math.random() * 1.5,
          baseAlpha: 0.4 + Math.random() * 0.6,
          twinkleSpeed: 2 + Math.random() * 5,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }

      // Soft Floating Bokeh Orbs (for dusk / night atmosphere)
      this.bokehOrbs = [];
      for (let i = 0; i < 14; i++) {
        this.bokehOrbs.push({
          x: Math.random() * V_WIDTH,
          y: 40 + Math.random() * 450,
          radius: 8 + Math.random() * 18,
          speed: 6 + Math.random() * 12,
          alpha: 0.12 + Math.random() * 0.22,
          pulse: Math.random() * Math.PI * 2
        });
      }

      // 3D Festive Confetti
      this.confetti = [];
      const colors = ['#ffd60a', '#ffc300', '#e02b20', '#1a3d24', '#ffffff', '#e69500'];
      for (let i = 0; i < 28; i++) {
        this.confetti.push({
          x: Math.random() * V_WIDTH,
          y: Math.random() * V_HEIGHT,
          vx: -12 + Math.random() * 24,
          vy: 32 + Math.random() * 40,
          w: 6 + Math.random() * 6,
          h: 4 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: 2 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      // Pre-render static base assets for 60 FPS mobile performance
      this.initGroundCanvas();
      this.initBulbGlowCanvas();
    }

    initGroundCanvas() {
      this.groundCanvas = document.createElement('canvas');
      this.groundCanvas.width = V_WIDTH;
      this.groundCanvas.height = V_HEIGHT - GROUND_Y;
      const gctx = this.groundCanvas.getContext('2d');

      const curbH = 14;
      const curbGrad = gctx.createLinearGradient(0, 0, 0, curbH);
      curbGrad.addColorStop(0, '#7b8391');
      curbGrad.addColorStop(0.4, '#646b77');
      curbGrad.addColorStop(1.0, '#4a505b');
      gctx.fillStyle = curbGrad;
      gctx.fillRect(0, 0, V_WIDTH, curbH);

      gctx.fillStyle = '#a1a8b5';
      gctx.fillRect(0, 0, V_WIDTH, 2);

      gctx.fillStyle = '#32373f';
      gctx.fillRect(0, curbH - 1.5, V_WIDTH, 1.5);

      const roadY = curbH;
      const roadH = this.groundCanvas.height - roadY;
      const roadGrad = gctx.createLinearGradient(0, roadY, 0, this.groundCanvas.height);
      roadGrad.addColorStop(0, '#2e333d');
      roadGrad.addColorStop(0.5, '#252931');
      roadGrad.addColorStop(1.0, '#1c1f26');
      gctx.fillStyle = roadGrad;
      gctx.fillRect(0, roadY, V_WIDTH, roadH);

      gctx.fillStyle = '#f1f5f9';
      gctx.fillRect(0, roadY + 4, V_WIDTH, 2.5);

      gctx.fillStyle = '#cbd5e1';
      gctx.fillRect(0, roadY + 88, V_WIDTH, 2);
    }

    initBulbGlowCanvas() {
      this.bulbGlowCanvas = document.createElement('canvas');
      this.bulbGlowCanvas.width = 36;
      this.bulbGlowCanvas.height = 36;
      const bctx = this.bulbGlowCanvas.getContext('2d');
      const grad = bctx.createRadialGradient(18, 18, 1, 18, 18, 18);
      grad.addColorStop(0, 'rgba(255, 224, 102, 0.75)');
      grad.addColorStop(0.5, 'rgba(255, 170, 0, 0.25)');
      grad.addColorStop(1, 'rgba(255, 170, 0, 0)');
      bctx.fillStyle = grad;
      bctx.beginPath();
      bctx.arc(18, 18, 18, 0, Math.PI * 2);
      bctx.fill();
    }

    update(dt, speed, targetCycle = 0.0) {
      // Smoothly blend timeOfDay toward targetCycle with shortest angle interpolation
      let diff = (targetCycle - this.timeOfDay + 1.5) % 1.0 - 0.5;
      this.timeOfDay = (this.timeOfDay + diff * Math.min(1, dt * 1.6) + 1.0) % 1.0;

      this.sunRotation += dt * 0.35;

      // 3D Parallax Skyline Speeds: Far (0.07x) and Near (0.20x)
      // Exact synchronization with wrap widths (far: 500, near: 580) eliminates all visual lag & pops!
      this.farSkylineX -= speed * 0.07 * dt;
      if (this.farSkylineX <= -500) this.farSkylineX += 500;

      this.nearSkylineX -= speed * 0.20 * dt;
      if (this.nearSkylineX <= -580) this.nearSkylineX += 580;

      // "drumul de jos in miscare" - Road offset scrolling at 100% true flight speed!
      this.groundOffset = (this.groundOffset + speed * dt) % 64;
      this.beaconTimer += dt;

      this.lightsWave += dt * 2.2;

      // Clouds Drifting
      this.clouds.forEach(c => {
        c.x -= (c.speed + speed * 0.06) * dt;
        if (c.x < -140) {
          c.x = V_WIDTH + 50 + Math.random() * 40;
          c.y = 45 + Math.random() * 85;
        }
      });

      // Stars Twinkling
      this.stars.forEach(s => {
        s.twinklePhase += dt * s.twinkleSpeed;
      });

      // Bokeh Orbs
      this.bokehOrbs.forEach(b => {
        b.x -= b.speed * dt;
        b.pulse += dt * 2.5;
        if (b.x < -40) {
          b.x = V_WIDTH + 40;
          b.y = 40 + Math.random() * 450;
        }
      });

      // Confetti
      this.confetti.forEach(c => {
        c.x += (c.vx - speed * 0.15) * dt;
        c.y += c.vy * dt;
        c.rot += c.rotSpeed * dt;

        if (c.y > V_HEIGHT + 10) {
          c.y = -10;
          c.x = Math.random() * V_WIDTH;
        }
        if (c.x < -20) c.x = V_WIDTH + 10;
      });
    }

    getCycleState() {
      const t = this.timeOfDay;

      // 4 Keyframes for Sky Color & Atmosphere:
      // 0.00 - 0.28: DAY (Senin, cer azur strălucitor)
      // 0.28 - 0.48: SUNSET (Apus auriu-roz, soarele apune)
      // 0.48 - 0.80: NIGHT (Noapte înstelată, lună celestă strălucitoare)
      // 0.80 - 1.00: DAWN (Răsărit pastelat, soarele revine)

      const KF_DAY = {
        skyTop: [28, 142, 244],
        skyMid: [136, 216, 255],
        skyBottom: [255, 244, 192],
        cloudsAlpha: 0.95,
        lightsGlowAlpha: 0.08,
        windowGlowAlpha: 0.15,
        buildingColor: [62, 75, 96]
      };

      const KF_SUNSET = {
        skyTop: [58, 20, 112],
        skyMid: [222, 48, 124],
        skyBottom: [255, 148, 46],
        cloudsAlpha: 0.55,
        lightsGlowAlpha: 0.65,
        windowGlowAlpha: 0.72,
        buildingColor: [44, 32, 58]
      };

      const KF_NIGHT = {
        skyTop: [6, 9, 24],
        skyMid: [15, 23, 52],
        skyBottom: [46, 20, 80],
        cloudsAlpha: 0.18,
        lightsGlowAlpha: 1.0,
        windowGlowAlpha: 1.0,
        buildingColor: [18, 20, 32]
      };

      const KF_DAWN = {
        skyTop: [26, 36, 68],
        skyMid: [118, 132, 240],
        skyBottom: [255, 218, 138],
        cloudsAlpha: 0.68,
        lightsGlowAlpha: 0.32,
        windowGlowAlpha: 0.32,
        buildingColor: [46, 54, 74]
      };

      let kf1, kf2, localT;
      if (t < 0.28) {
        kf1 = KF_DAY;
        kf2 = KF_DAY;
        localT = 0;
      } else if (t < 0.48) {
        kf1 = KF_DAY;
        kf2 = KF_SUNSET;
        localT = (t - 0.28) / (0.48 - 0.28);
      } else if (t < 0.80) {
        kf1 = KF_SUNSET;
        kf2 = KF_NIGHT;
        localT = (t - 0.48) / (0.80 - 0.48);
      } else {
        kf1 = KF_DAWN;
        kf2 = KF_DAY;
        localT = (t - 0.80) / (1.0 - 0.80);
      }

      // "cand se face noapte sa dispara soarele si sa fie luna pe cer"
      // STRICT HANDOVER: Soarele și Luna nu apar NICIODATĂ simultan pe cer!
      let sunAlpha = 0;
      let sunY = 600;
      let moonAlpha = 0;
      let moonY = 600;
      let starsAlpha = 0;

      if (t < 0.28) {
        // Pure Day: Sun high, Moon completely gone
        sunAlpha = 1.0;
        sunY = 92;
        moonAlpha = 0.0;
        starsAlpha = 0.0;
      } else if (t < 0.48) {
        // Sunset: Sun sinks smoothly behind city skyline and fades out to 0
        const p = (t - 0.28) / (0.48 - 0.28);
        sunAlpha = Math.max(0, 1.0 - p * 1.0);
        sunY = 92 + p * 380; // Sinks from 92 to 472 (behind skyline)
        moonAlpha = 0.0;    // NO moon yet until sun is completely gone!
        starsAlpha = p * 0.3;
      } else if (t < 0.78) {
        // Night: Sun is 100% GONE. Moon rises high in the sky and shines bright!
        sunAlpha = 0.0;
        sunY = 600;
        const p = (t - 0.48) / (0.78 - 0.48);
        // Moon rises quickly in first 20% of night and stays bright
        moonAlpha = Math.min(1.0, p * 4.0);
        moonY = 82;
        starsAlpha = 1.0;
      } else {
        // Dawn: Moon fades out and sinks, then Sun emerges fresh from horizon
        const p = (t - 0.78) / (1.0 - 0.78);
        if (p < 0.45) {
          // Moon setting and fading out
          moonAlpha = Math.max(0, 1.0 - p * 2.2);
          moonY = 82 + p * 160;
          sunAlpha = 0.0;
          starsAlpha = Math.max(0, 1.0 - p * 2.0);
        } else {
          // Sun rising from horizon into day
          moonAlpha = 0.0;
          starsAlpha = 0.0;
          const sp = (p - 0.45) / 0.55;
          sunAlpha = Math.min(1.0, sp * 1.2);
          sunY = 380 - sp * 288; // Rises from 380 to 92
        }
      }

      return {
        skyTop: lerpRGB(kf1.skyTop, kf2.skyTop, localT),
        skyMid: lerpRGB(kf1.skyMid, kf2.skyMid, localT),
        skyBottom: lerpRGB(kf1.skyBottom, kf2.skyBottom, localT),
        sunAlpha,
        sunY,
        moonAlpha,
        moonY,
        starsAlpha,
        cloudsAlpha: lerpVal(kf1.cloudsAlpha, kf2.cloudsAlpha, localT),
        lightsGlowAlpha: lerpVal(kf1.lightsGlowAlpha, kf2.lightsGlowAlpha, localT),
        windowGlowAlpha: lerpVal(kf1.windowGlowAlpha, kf2.windowGlowAlpha, localT),
        buildingColor: lerpArr(kf1.buildingColor, kf2.buildingColor, localT)
      };
    }

    render(ctx) {
      const state = this.getCycleState();
      const isSunset = state.lightsGlowAlpha > 0.25;
      const isNight = state.windowGlowAlpha > 0.40;

      // 1. Dynamic Smooth Sky Gradient (Day -> Sunset -> Night -> Dawn)
      // Stretches seamlessly all the way to GROUND_Y (575px), eliminating the white background band!
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, state.skyTop);
      skyGrad.addColorStop(0.55, state.skyMid);
      skyGrad.addColorStop(1.0, state.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, V_WIDTH, GROUND_Y + 12);

      // 2. Daytime Radiant Sun ("cerul mai frumos soarele si luna")
      if (state.sunAlpha > 0.01) {
        const sx = 295;
        const sy = state.sunY;
        ctx.save();
        ctx.globalAlpha = state.sunAlpha;

        // Volumetric Sunbeams / Soft God-Rays across the upper sky
        if (state.sunAlpha > 0.25) {
          ctx.save();
          ctx.globalAlpha = state.sunAlpha * 0.14;
          const beamGrad = ctx.createLinearGradient(sx, sy, sx - 220, sy + 320);
          beamGrad.addColorStop(0, 'rgba(255, 248, 200, 0.75)');
          beamGrad.addColorStop(0.5, 'rgba(255, 230, 150, 0.25)');
          beamGrad.addColorStop(1, 'rgba(255, 230, 150, 0)');
          ctx.fillStyle = beamGrad;

          [
            [-0.32, 0.16, 380],
            [-0.62, 0.20, 430],
            [-0.92, 0.18, 360]
          ].forEach(([angle, width, length]) => {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(angle - width) * length, sy + Math.sin(angle - width) * length);
            ctx.lineTo(sx + Math.cos(angle + width) * length, sy + Math.sin(angle + width) * length);
            ctx.closePath();
            ctx.fill();
          });
          ctx.restore();
        }

        // A. Huge Warm Atmospheric Bloom
        const bloom = ctx.createRadialGradient(sx, sy, 6, sx, sy, 96);
        bloom.addColorStop(0, 'rgba(255, 252, 210, 0.90)');
        bloom.addColorStop(0.25, 'rgba(255, 218, 70, 0.42)');
        bloom.addColorStop(0.65, 'rgba(255, 180, 20, 0.14)');
        bloom.addColorStop(1, 'rgba(255, 170, 0, 0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(sx, sy, 96, 0, Math.PI * 2);
        ctx.fill();

        // B. Secondary Solar Halo Ring
        ctx.strokeStyle = 'rgba(255, 238, 140, 0.32)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(sx, sy, 35, 0, Math.PI * 2);
        ctx.stroke();

        // C. 12 Diamond Tapered Sunburst Rays (Alternating long & medium 3D rays)
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.sunRotation);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const isLong = i % 2 === 0;
          const rayLen = isLong ? 45 : 33;
          const rayW = isLong ? 5.8 : 4.0;
          const innerR = 21;

          ctx.save();
          ctx.rotate(a);
          const rayGrad = ctx.createLinearGradient(innerR, 0, rayLen, 0);
          rayGrad.addColorStop(0, isLong ? 'rgba(255, 245, 150, 0.88)' : 'rgba(255, 220, 70, 0.75)');
          rayGrad.addColorStop(0.6, isLong ? 'rgba(255, 205, 40, 0.45)' : 'rgba(255, 185, 20, 0.35)');
          rayGrad.addColorStop(1, 'rgba(255, 180, 20, 0)');
          ctx.fillStyle = rayGrad;

          ctx.beginPath();
          ctx.moveTo(innerR, 0);
          ctx.lineTo(innerR + (rayLen - innerR) * 0.45, -rayW / 2);
          ctx.lineTo(rayLen, 0);
          ctx.lineTo(innerR + (rayLen - innerR) * 0.45, rayW / 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // D. Brilliant Glowing Sun Core (Multi-stop radiant incandescent disc)
        const sunDisc = ctx.createRadialGradient(sx - 4, sy - 4, 2, sx, sy, 22);
        sunDisc.addColorStop(0, '#ffffff');
        sunDisc.addColorStop(0.35, '#fff7a2');
        sunDisc.addColorStop(0.72, '#ffc720');
        sunDisc.addColorStop(1.0, '#ff9100');
        ctx.fillStyle = sunDisc;
        ctx.beginPath();
        ctx.arc(sx, sy, 22, 0, Math.PI * 2);
        ctx.fill();

        // Delicate Golden Inner Corona Rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(sx, sy, 21.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // 3. Twinkling Night Stars & Diamond Sparkles
      if (state.starsAlpha > 0.02) {
        ctx.save();
        this.stars.forEach((s, idx) => {
          const a = state.starsAlpha * (s.baseAlpha + Math.sin(s.twinklePhase) * 0.4);
          if (a <= 0.01) return;

          // Prominent stars get 4-point diamond cross glints
          if (idx % 6 === 0) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.75})`;
            ctx.lineWidth = 1.0;
            const glint = s.radius * 3.6;
            ctx.beginPath();
            ctx.moveTo(s.x - glint, s.y); ctx.lineTo(s.x + glint, s.y);
            ctx.moveTo(s.x, s.y - glint); ctx.lineTo(s.x, s.y + glint);
            ctx.stroke();

            ctx.fillStyle = idx % 12 === 0 ? `rgba(254, 240, 138, ${a})` : `rgba(255, 255, 255, ${a})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius * 1.3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = idx % 5 === 0 ? `rgba(254, 240, 138, ${a})` : `rgba(255, 255, 255, ${a})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.restore();
      }

      // 4. Night Luminous Celestial Moon ("cerul mai frumos soarele si luna")
      if (state.moonAlpha > 0.01) {
        const mx = 85;
        const my = state.moonY;
        ctx.save();
        ctx.globalAlpha = state.moonAlpha;

        // A. Ethereal Moonlight Halo (Soft cyan-silver to warm starlight gold)
        const mHalo = ctx.createRadialGradient(mx, my, 8, mx, my, 70);
        mHalo.addColorStop(0, 'rgba(224, 242, 254, 0.58)');
        mHalo.addColorStop(0.35, 'rgba(254, 240, 138, 0.22)');
        mHalo.addColorStop(0.7, 'rgba(186, 230, 253, 0.08)');
        mHalo.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = mHalo;
        ctx.beginPath();
        ctx.arc(mx, my, 70, 0, Math.PI * 2);
        ctx.fill();

        // B. Secondary Starburst Glint around Moon
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(mx - 34, my); ctx.lineTo(mx + 34, my);
        ctx.moveTo(mx, my - 34); ctx.lineTo(mx, my + 34);
        ctx.stroke();

        // C. 3D Spherical Moon Body
        const moonGrad = ctx.createRadialGradient(mx - 6, my - 6, 3, mx, my, 21);
        moonGrad.addColorStop(0, '#ffffff');
        moonGrad.addColorStop(0.45, '#fffce8');
        moonGrad.addColorStop(0.85, '#fef08a');
        moonGrad.addColorStop(1.0, '#e2e8f0');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 20, 0, Math.PI * 2);
        ctx.fill();

        // D. Stylized Lunar Maria (Soft organic dark contours on the lunar surface)
        ctx.fillStyle = 'rgba(148, 163, 184, 0.30)';
        ctx.beginPath();
        ctx.ellipse(mx - 5, my - 3, 6, 9, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(mx + 6, my - 6, 5, 4.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(mx + 5, my + 6, 7, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // E. Detailed Craters with 3D Light & Shadow
        const craters = [
          { x: mx - 4, y: my + 5, r: 3.8 },
          { x: mx + 6, y: my - 3, r: 2.8 },
          { x: mx + 3, y: my + 8, r: 2.2 },
          { x: mx - 8, y: my - 7, r: 2.0 },
          { x: mx + 9, y: my + 3, r: 1.8 }
        ];

        craters.forEach(cr => {
          // Crater shadowed floor
          ctx.fillStyle = 'rgba(100, 116, 139, 0.42)';
          ctx.beginPath();
          ctx.arc(cr.x, cr.y, cr.r, 0, Math.PI * 2);
          ctx.fill();

          // Crater illuminated crescent rim (facing top-left sunward)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(cr.x - 0.4, cr.y - 0.4, cr.r, 0.7 * Math.PI, 1.8 * Math.PI);
          ctx.stroke();
        });

        // F. Brilliant Outer Crescent Rim Specular
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(mx, my, 19.5, 0.85 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();

        ctx.restore();
      }

      // 5. Drifting Fluffy Cumulus Clouds (Multi-puff with soft ambient depth)
      if (state.cloudsAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = state.cloudsAlpha;
        this.clouds.forEach(c => {
          ctx.save();
          ctx.translate(c.x, c.y);

          // Soft ambient cloud base
          ctx.fillStyle = isSunset ? 'rgba(255, 215, 200, 0.45)' : 'rgba(210, 230, 250, 0.40)';
          ctx.beginPath();
          drawRoundRect(ctx, 4, 4, c.w - 8, c.h * 0.7, c.h * 0.35);
          ctx.fill();

          // Cloud puffs (pure white with subtle warmth)
          ctx.fillStyle = isSunset ? 'rgba(255, 240, 225, 0.95)' : 'rgba(255, 255, 255, 0.96)';
          ctx.beginPath();
          drawRoundRect(ctx, 0, 0, c.w, c.h * 0.7, c.h * 0.35);
          ctx.arc(c.w * 0.32, -c.h * 0.15, c.h * 0.52, 0, Math.PI * 2);
          ctx.arc(c.w * 0.58, -c.h * 0.35, c.h * 0.68, 0, Math.PI * 2);
          ctx.arc(c.w * 0.78, -c.h * 0.12, c.h * 0.48, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
        ctx.restore();
      }

      // 6. 3D Multi-Layer Architectural Parallax Skyline ("cladirile din spate mult mai frumoase tot fect de 3 d")
      this.render3DSkyline(ctx, state);

      // 7. Ambient Bokeh Orbs (More visible as twilight approaches)
      this.bokehOrbs.forEach(b => {
        ctx.save();
        const pulseAlpha = b.alpha * (0.8 + Math.sin(b.pulse) * 0.2) * (0.3 + state.lightsGlowAlpha * 0.7);
        ctx.fillStyle = `rgba(255, 214, 10, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 8. Festoon Lights & Edison Bulbs (Filament subtle in daylight, brilliant glow at night!)
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + state.lightsGlowAlpha * 0.35})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-10, 45);
      ctx.quadraticCurveTo(200, 95 + Math.sin(this.lightsWave) * 3, 410, 50);
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const bx = 25 + i * 48;
        const by = 48 + Math.sin((i / 7) * Math.PI) * 25 + Math.sin(this.lightsWave + i) * 1.5;

        if (state.lightsGlowAlpha > 0.1 && this.bulbGlowCanvas) {
          ctx.save();
          ctx.globalAlpha = state.lightsGlowAlpha;
          ctx.drawImage(this.bulbGlowCanvas, bx - 18, by + 4 - 18);
          ctx.restore();
        }

        ctx.fillStyle = state.lightsGlowAlpha > 0.4 ? '#ffea75' : '#fed7aa';
        ctx.beginPath();
        ctx.arc(bx, by + 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 9. 3D Tumbling Golden Confetti
      this.confetti.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        const scaleX = Math.cos(c.rot * 1.5);
        ctx.scale(scaleX, 1);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      });
    }

    renderGround(ctx) {
      // 1. Base Asphalt Surface, Curb & Solid Edge Lines
      if (this.groundCanvas) {
        ctx.drawImage(this.groundCanvas, 0, GROUND_Y);
      }

      // 2. "sa fie si drumul de jos in miscare"
      // Moving yellow dashed centerline scrolling at real flight speed!
      const curbH = 14;
      const roadY = GROUND_Y + curbH;
      const dashY = roadY + 45;
      const dashW = 34;
      const dashH = 5;
      const dashCycle = 64;

      ctx.fillStyle = '#ffd60a';
      const startX = -this.groundOffset - dashCycle;
      for (let x = startX; x < V_WIDTH + dashCycle; x += dashCycle) {
        if (x + dashW < 0 || x > V_WIDTH) continue;
        drawRoundRect(ctx, x, dashY, dashW, dashH, 2.5);
        ctx.fill();
      }

      // 3. Moving Concrete Curb Expansion Joints
      for (let x = -this.groundOffset - 32; x < V_WIDTH + 32; x += 32) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.fillRect(x, GROUND_Y, 2, curbH);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(x + 2, GROUND_Y, 1, curbH);
      }
    }

    render3DSkyline(ctx, state) {
      const baseR = (Array.isArray(state.buildingColor) ? state.buildingColor[0] : 82) || 82;
      const baseG = (Array.isArray(state.buildingColor) ? state.buildingColor[1] : 98) || 98;
      const baseB = (Array.isArray(state.buildingColor) ? state.buildingColor[2] : 122) || 122;

      const isNight = state.windowGlowAlpha > 0.42;
      const isSunset = state.lightsGlowAlpha > 0.25;

      // Helper to create vertical building gradient
      const makeBuildingGrad = (y, topR, topG, topB, botR, botG, botB) => {
        const grad = ctx.createLinearGradient(0, y, 0, GROUND_Y);
        grad.addColorStop(0, `rgb(${Math.round(topR)}, ${Math.round(topG)}, ${Math.round(topB)})`);
        grad.addColorStop(1, `rgb(${Math.round(botR)}, ${Math.round(botG)}, ${Math.round(botB)})`);
        return grad;
      };

      // ==========================================
      // LAYER 1: FAR DISTANT MEGACITY SKYLINE (Parallax 0.07x)
      // Clean Architectural Silhouettes (FARA ANTENE)
      // ==========================================
      const farWrap = 500;
      ctx.save();
      ctx.translate(this.farSkylineX, 0);

      const farAlpha = 0.58 + state.windowGlowAlpha * 0.22;
      const farR = Math.min(255, Math.round(baseR * 0.72 + 38));
      const farG = Math.min(255, Math.round(baseG * 0.72 + 45));
      const farB = Math.min(255, Math.round(baseB * 0.72 + 62));
      const farColor = `rgba(${farR}, ${farG}, ${farB}, ${farAlpha})`;
      const farDarkColor = `rgba(${Math.round(farR * 0.8)}, ${Math.round(farG * 0.8)}, ${Math.round(farB * 0.8)}, ${farAlpha})`;

      for (let offset = -farWrap; offset <= V_WIDTH + farWrap; offset += farWrap) {
        ctx.save();
        ctx.translate(offset, 0);

        // Far 1: Modern Stepped Apex Tower (Clean, no antenna)
        ctx.fillStyle = farColor;
        ctx.fillRect(15, 305, 36, GROUND_Y - 305 + 5);
        ctx.fillRect(23, 275, 20, 30);
        ctx.fillRect(29, 255, 8, 20);

        // Far 2: Stepped Art Deco High-Rise (Clean, no antenna)
        ctx.fillRect(66, 335, 48, GROUND_Y - 335 + 5);
        ctx.fillRect(75, 312, 30, 23);
        ctx.fillRect(83, 290, 14, 22);

        // Far 3: Sloped Crown Skyscraper
        ctx.beginPath();
        ctx.moveTo(130, GROUND_Y);
        ctx.lineTo(130, 330);
        ctx.lineTo(178, 298);
        ctx.lineTo(178, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Far 4: High-Rise Block with Penthouse Terrace (Clean, no antenna)
        ctx.fillRect(198, 320, 64, GROUND_Y - 320 + 5);
        ctx.fillRect(216, 305, 28, 15);

        // Far 5: Modern Glass Obelisk (Triangular Peak, no beacon)
        ctx.fillRect(284, 315, 46, GROUND_Y - 315 + 5);
        ctx.beginPath();
        ctx.moveTo(284, 315);
        ctx.lineTo(307, 280);
        ctx.lineTo(330, 315);
        ctx.closePath();
        ctx.fill();

        // Far 6: Metropolitan Twin Tower with Skybridge (Clean, no antenna)
        ctx.fillRect(352, 330, 26, GROUND_Y - 330 + 5);
        ctx.fillRect(384, 318, 28, GROUND_Y - 318 + 5);
        ctx.fillRect(378, 345, 6, 20); // Skybridge

        // Far 7: Distant Wide High-Rise Block
        ctx.fillRect(430, 340, 52, GROUND_Y - 340 + 5);
        ctx.fillRect(444, 326, 24, 14);

        // Distant Micro-Windows (Glittering pinpoints of city lights)
        if (state.windowGlowAlpha > 0.2) {
          ctx.fillStyle = isNight ? 'rgba(254, 240, 138, 0.45)' : 'rgba(186, 230, 253, 0.35)';
          const farWins = [
            [22, 325], [28, 345], [32, 365], [78, 345], [86, 355], [92, 375],
            [142, 335], [152, 355], [162, 375], [210, 335], [225, 348], [240, 360],
            [295, 335], [305, 355], [360, 350], [392, 338], [445, 360], [460, 375]
          ];
          farWins.forEach(([wx, wy]) => {
            ctx.fillRect(wx, wy, 2.5, 3.5);
          });
        }

        ctx.restore();
      }
      ctx.restore();

      // ==========================================
      // LAYER 2: NEAR ARCHITECTURAL 3D CITY TOWERS (Parallax 0.20x)
      // Cladiri Impecabile, FARA ANTENE, 3D Facets & Seamless Wrapping (580px)
      // ==========================================
      const nearWrap = 580;
      ctx.save();
      ctx.translate(this.nearSkylineX, 0);

      const trimColor = `rgba(255, 255, 255, ${0.25 + state.lightsGlowAlpha * 0.40})`;
      const goldTrim = `rgba(255, 214, 10, ${0.55 + state.lightsGlowAlpha * 0.45})`;

      for (let offset = -nearWrap; offset <= V_WIDTH + nearWrap; offset += nearWrap) {
        ctx.save();
        ctx.translate(offset, 0);

        // -------------------------------------------------------------
        // TOWER 1: Corporate Glass Apex (x: 12, w: 72, y: 310, depth: 16)
        // Sleek Angled Glass Crown + LED Cornice (FARA ANTENE)
        // -------------------------------------------------------------
        const t1X = 12, t1Y = 310, t1W = 72, t1D = 16, t1Slope = 14;
        const t1Grad = makeBuildingGrad(t1Y, baseR + 8, baseG + 14, baseB + 28, baseR * 0.65, baseG * 0.65, baseB * 0.72);
        const t1DGrad = makeBuildingGrad(t1Y - t1Slope, baseR * 0.55, baseG * 0.58, baseB * 0.68, baseR * 0.35, baseG * 0.35, baseB * 0.42);

        // Facade with angled crown
        ctx.fillStyle = t1Grad;
        ctx.beginPath();
        ctx.moveTo(t1X, GROUND_Y);
        ctx.lineTo(t1X, t1Y + t1Slope);
        ctx.lineTo(t1X + t1W, t1Y);
        ctx.lineTo(t1X + t1W, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // 3D Side depth facet
        ctx.fillStyle = t1DGrad;
        ctx.beginPath();
        ctx.moveTo(t1X + t1W, t1Y);
        ctx.lineTo(t1X + t1W + t1D, t1Y - 7);
        ctx.lineTo(t1X + t1W + t1D, GROUND_Y);
        ctx.lineTo(t1X + t1W, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Angled glass crown highlight
        ctx.strokeStyle = trimColor;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(t1X, t1Y + t1Slope);
        ctx.lineTo(t1X + t1W, t1Y);
        ctx.stroke();

        // Clean rooftop architectural border (NO ANTENNA!)
        ctx.fillStyle = goldTrim;
        ctx.fillRect(t1X + t1W - 16, t1Y - 3, 16, 3);

        // Windows
        this.renderBuildingWindows(ctx, t1X + 8, t1Y + 22, t1W - 16, GROUND_Y - t1Y - 32, 2, 7, state, 1);

        // -------------------------------------------------------------
        // TOWER 2: Art-Deco Stepped Skyscraper (x: 102, w: 86, depth: 16)
        // 3 Majestic Setback Tiers + Golden Parapets (FARA ANTENE)
        // -------------------------------------------------------------
        const t2X = 102, t2D = 16;
        const t2Grad = makeBuildingGrad(250, baseR + 14, baseG + 10, baseB + 18, baseR * 0.6, baseG * 0.58, baseB * 0.65);
        const t2DGrad = makeBuildingGrad(245, baseR * 0.5, baseG * 0.45, baseB * 0.55, baseR * 0.3, baseG * 0.28, baseB * 0.35);

        // Tier 1 (Base): y: 350 to GROUND_Y
        ctx.fillStyle = t2Grad;
        ctx.fillRect(t2X, 350, 86, GROUND_Y - 350 + 5);
        ctx.fillStyle = t2DGrad;
        ctx.beginPath();
        ctx.moveTo(t2X + 86, 350);
        ctx.lineTo(t2X + 86 + t2D, 343);
        ctx.lineTo(t2X + 86 + t2D, GROUND_Y);
        ctx.lineTo(t2X + 86, GROUND_Y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = goldTrim;
        ctx.fillRect(t2X, 350, 86, 3);

        // Tier 2 (Mid): y: 295 to 350
        ctx.fillStyle = t2Grad;
        ctx.fillRect(t2X + 13, 295, 60, 55);
        ctx.fillStyle = t2DGrad;
        ctx.beginPath();
        ctx.moveTo(t2X + 73, 295);
        ctx.lineTo(t2X + 73 + 12, 289);
        ctx.lineTo(t2X + 73 + 12, 350);
        ctx.lineTo(t2X + 73, 350);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = goldTrim;
        ctx.fillRect(t2X + 13, 295, 60, 3);

        // Tier 3 (Pinnacle): y: 250 to 295
        ctx.fillStyle = t2Grad;
        ctx.fillRect(t2X + 25, 250, 36, 45);
        ctx.fillStyle = t2DGrad;
        ctx.beginPath();
        ctx.moveTo(t2X + 61, 250);
        ctx.lineTo(t2X + 61 + 9, 245);
        ctx.lineTo(t2X + 61 + 9, 295);
        ctx.lineTo(t2X + 61, 295);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = goldTrim;
        ctx.fillRect(t2X + 25, 250, 36, 3.5);

        // Art-Deco Pyramid Cap on Pinnacle (Clean geometric crown, NO ANTENNA SPIRE!)
        ctx.fillStyle = t2Grad;
        ctx.beginPath();
        ctx.moveTo(t2X + 28, 250);
        ctx.lineTo(t2X + 43, 228);
        ctx.lineTo(t2X + 58, 250);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = goldTrim;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Windows for Tier 1 and Tier 2
        this.renderBuildingWindows(ctx, t2X + 8, 360, 70, GROUND_Y - 370, 3, 6, state, 2);
        this.renderBuildingWindows(ctx, t2X + 20, 305, 46, 40, 2, 2, state, 7);

        // -------------------------------------------------------------
        // TOWER 3: High-Tech Glass Tower with Penthouse Terrace (x: 206, w: 68, y: 340)
        // Clean Luxury Terrace Architecture (FARA BAZIN/STRUTS!)
        // -------------------------------------------------------------
        const t3X = 206, t3Y = 340, t3W = 68, t3D = 14;
        const t3Grad = makeBuildingGrad(t3Y, baseR + 2, baseG + 8, baseB + 20, baseR * 0.6, baseG * 0.62, baseB * 0.7);
        const t3DGrad = makeBuildingGrad(t3Y, baseR * 0.48, baseG * 0.52, baseB * 0.6, baseR * 0.32, baseG * 0.34, baseB * 0.4);

        // Facade & Depth
        ctx.fillStyle = t3Grad;
        ctx.fillRect(t3X, t3Y, t3W, GROUND_Y - t3Y + 5);
        ctx.fillStyle = t3DGrad;
        ctx.beginPath();
        ctx.moveTo(t3X + t3W, t3Y);
        ctx.lineTo(t3X + t3W + t3D, t3Y - 6);
        ctx.lineTo(t3X + t3W + t3D, GROUND_Y);
        ctx.lineTo(t3X + t3W, GROUND_Y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = trimColor;
        ctx.fillRect(t3X, t3Y, t3W, 3);

        // Penthouse luxury pavilion with panoramic glass (Clean, architectural)
        ctx.fillStyle = t3Grad;
        ctx.fillRect(t3X + 12, t3Y - 14, 44, 14);
        ctx.fillStyle = goldTrim;
        ctx.fillRect(t3X + 10, t3Y - 14, 48, 2.5);
        ctx.fillStyle = isNight ? 'rgba(254, 240, 138, 0.75)' : 'rgba(186, 230, 253, 0.45)';
        ctx.fillRect(t3X + 16, t3Y - 11, 36, 8);

        // Windows
        this.renderBuildingWindows(ctx, t3X + 8, t3Y + 12, t3W - 16, GROUND_Y - t3Y - 20, 2, 6, state, 3);

        // -------------------------------------------------------------
        // TOWER 4: Grand Meso 16 Ani Celebration Plaza Tower (x: 292, w: 88, y: 285)
        // Grand Facade + Illuminated Meso Golden Sign (FARA ANTENE)
        // -------------------------------------------------------------
        const t4X = 292, t4Y = 285, t4W = 88, t4D = 16;
        const t4Grad = makeBuildingGrad(t4Y, baseR + 10, baseG + 22, baseB + 16, baseR * 0.58, baseG * 0.65, baseB * 0.62);
        const t4DGrad = makeBuildingGrad(t4Y, baseR * 0.45, baseG * 0.55, baseB * 0.52, baseR * 0.3, baseG * 0.38, baseB * 0.35);

        // Facade & Depth
        ctx.fillStyle = t4Grad;
        ctx.fillRect(t4X, t4Y, t4W, GROUND_Y - t4Y + 5);
        ctx.fillStyle = t4DGrad;
        ctx.beginPath();
        ctx.moveTo(t4X + t4W, t4Y);
        ctx.lineTo(t4X + t4W + t4D, t4Y - 8);
        ctx.lineTo(t4X + t4W + t4D, GROUND_Y);
        ctx.lineTo(t4X + t4W, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Elegant Double Cornice
        ctx.fillStyle = goldTrim;
        ctx.fillRect(t4X, t4Y, t4W, 4);
        ctx.fillStyle = trimColor;
        ctx.fillRect(t4X + 4, t4Y - 4, t4W - 8, 4);

        // Illuminated Meso Crown Crest on Rooftop Plinth (Clean, NO CORNER ANTENNAS!)
        const crownAlpha = 0.65 + state.lightsGlowAlpha * 0.35;
        ctx.fillStyle = `rgba(255, 195, 0, ${crownAlpha})`;
        drawRoundRect(ctx, t4X + t4W / 2 - 22, t4Y - 16, 44, 12, 3);
        ctx.fill();
        ctx.strokeStyle = '#ffd60a';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#1e293b';
        ctx.font = '900 8px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MESO 16', t4X + t4W / 2, t4Y - 7);

        // Windows
        this.renderBuildingWindows(ctx, t4X + 8, t4Y + 14, t4W - 16, GROUND_Y - t4Y - 22, 3, 8, state, 4);

        // -------------------------------------------------------------
        // TOWER 5: Metro High-Rise with Balconies (x: 400, w: 66, y: 340)
        // -------------------------------------------------------------
        const t5X = 400, t5Y = 340, t5W = 66, t5D = 14;
        const t5Grad = makeBuildingGrad(t5Y, baseR + 6, baseG + 8, baseB + 14, baseR * 0.62, baseG * 0.62, baseB * 0.68);
        const t5DGrad = makeBuildingGrad(t5Y, baseR * 0.5, baseG * 0.5, baseB * 0.55, baseR * 0.32, baseG * 0.32, baseB * 0.38);

        ctx.fillStyle = t5Grad;
        ctx.fillRect(t5X, t5Y, t5W, GROUND_Y - t5Y + 5);
        ctx.fillStyle = t5DGrad;
        ctx.beginPath();
        ctx.moveTo(t5X + t5W, t5Y);
        ctx.lineTo(t5X + t5W + t5D, t5Y - 6);
        ctx.lineTo(t5X + t5W + t5D, GROUND_Y);
        ctx.lineTo(t5X + t5W, GROUND_Y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = trimColor;
        ctx.fillRect(t5X, t5Y, t5W, 3);

        // Rooftop Penthouse Terrace (Clean parapet)
        ctx.fillStyle = t5Grad;
        ctx.fillRect(t5X + 14, t5Y - 14, 38, 14);
        ctx.fillStyle = goldTrim;
        ctx.fillRect(t5X + 14, t5Y - 14, 38, 2.5);

        this.renderBuildingWindows(ctx, t5X + 8, t5Y + 12, t5W - 16, GROUND_Y - t5Y - 18, 2, 6, state, 5);

        // -------------------------------------------------------------
        // TOWER 6: Contemporary Angular Monolith (x: 484, w: 70, y: 320)
        // Sleek Flat Architectural Cornice (FARA ANTENE)
        // -------------------------------------------------------------
        const t6X = 484, t6Y = 320, t6W = 70, t6D = 15;
        const t6Grad = makeBuildingGrad(t6Y, baseR + 10, baseG + 16, baseB + 30, baseR * 0.65, baseG * 0.68, baseB * 0.75);
        const t6DGrad = makeBuildingGrad(t6Y, baseR * 0.52, baseG * 0.55, baseB * 0.62, baseR * 0.34, baseG * 0.36, baseB * 0.42);

        ctx.fillStyle = t6Grad;
        ctx.fillRect(t6X, t6Y, t6W, GROUND_Y - t6Y + 5);
        ctx.fillStyle = t6DGrad;
        ctx.beginPath();
        ctx.moveTo(t6X + t6W, t6Y);
        ctx.lineTo(t6X + t6W + t6D, t6Y - 7);
        ctx.lineTo(t6X + t6W + t6D, GROUND_Y);
        ctx.lineTo(t6X + t6W, GROUND_Y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = trimColor;
        ctx.fillRect(t6X, t6Y, t6W, 3);

        // Setback Cornice (NO ANTENNA!)
        ctx.fillStyle = t6Grad;
        ctx.fillRect(t6X + 16, t6Y - 12, 38, 12);
        ctx.fillStyle = goldTrim;
        ctx.fillRect(t6X + 14, t6Y - 12, 42, 2.5);

        this.renderBuildingWindows(ctx, t6X + 8, t6Y + 12, t6W - 16, GROUND_Y - t6Y - 20, 2, 7, state, 6);

        ctx.restore();
      }
      ctx.restore();
    }

    renderBuildingWindows(ctx, startX, startY, totalW, totalH, cols, rows, state, seed = 1) {
      const colStep = totalW / cols;
      const rowStep = Math.min(24, totalH / rows);
      const winW = Math.max(6.5, colStep - 6.5);
      const winH = Math.max(8.5, rowStep - 6.5);
      const isNight = state.windowGlowAlpha > 0.40;
      const isSunset = state.lightsGlowAlpha > 0.25;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = startX + c * colStep + (colStep - winW) / 2;
          const wy = startY + r * rowStep;
          if (wy + winH > GROUND_Y - 4) continue;

          // Deterministic light pattern per window
          const pseudoVal = Math.sin(r * 13.7 + c * 19.3 + seed * 37.1);
          const isLit = pseudoVal > -0.22;

          // 1. Dark architectural window frame
          ctx.fillStyle = 'rgba(8, 12, 22, 0.65)';
          ctx.fillRect(wx - 0.8, wy - 0.8, winW + 1.6, winH + 1.6);

          if (isLit) {
            if (isNight || isSunset) {
              // Rich variety of nocturnal office lighting:
              if (pseudoVal > 0.65) {
                // Golden luxury suite
                ctx.fillStyle = '#fffbeb';
              } else if (pseudoVal > 0.2) {
                // Warm amber commercial office
                ctx.fillStyle = '#fde047';
              } else if (pseudoVal > -0.05) {
                // Deep warm glow
                ctx.fillStyle = '#f59e0b';
              } else {
                // Modern IT cool cyan suite
                ctx.fillStyle = '#93c5fd';
              }

              ctx.fillRect(wx, wy, winW, winH);

              // Soft top-highlight in window pane
              ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.fillRect(wx, wy, winW, 2);
            } else {
              // Daytime modern glass reflection
              ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
              ctx.fillRect(wx, wy, winW, winH);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.fillRect(wx, wy, winW, 2);
            }
          } else {
            // Unlit dark reflective twilight glass
            ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
            ctx.fillRect(wx, wy, winW, winH);
          }

          // Subtle horizontal window pane divider (blinds / mullion)
          if (winH > 10) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(wx, wy + winH * 0.5, winW, 1);
          }
        }
      }
    }
  }

  // ==========================================
  // 7. MAIN MESO VIDEO GAME CONTROLLER
  // ==========================================
  class MesoGame2D {
    constructor() {
      this.state = 'START';
      this.sound = new SoundManager();

      this.score = 0;
      this.donerCount = 0;
      this.waveCount = 0;
      this.celebrationShown = false;
      this.lastUnlockedLocation = null;
      this.locToastTimeout = null;
      this.highScore = this.loadCleanRecord();

      // Relaxed & Easy Starting Pace:
      this.baseSpeed = 138;
      this.scrollSpeed = 138;
      this.spawnTimer = 0;
      this.spawnInterval = 3.33; // 460px runway / 138 speed

      // Dynamic Camera Screen Shake
      this.screenShake = 0;

      this.candles = [];
      this.doners = [];
      this.roadSigns = [];

      this.particles = new ParticleManager();
      this.scenery = new Scenery2D();

      this.initCanvas();
      this.loadAssets();
      this.bird = new Bird2D(this.mascotImage);

      this.bindEvents();
      this.updateHUD();

      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    initCanvas() {
      this.frame = document.getElementById('game-frame');
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d', { alpha: false }) || this.canvas.getContext('2d');

      this.resize = this.resize.bind(this);
      window.addEventListener('resize', this.resize);
      this.resize();
    }

    resize() {
      const rect = this.frame.getBoundingClientRect();
      // Cap DPR to 1.75 for maximum sharpness with 60 FPS mobile performance
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);

      this.scaleX = this.canvas.width / V_WIDTH;
      this.scaleY = this.canvas.height / V_HEIGHT;
    }

    loadAssets() {
      this.mascotImage = new Image();
      this.donerImage = new Image();

      if (typeof GAME_ASSETS !== 'undefined') {
        if (GAME_ASSETS.bird) this.mascotImage.src = GAME_ASSETS.bird;
        if (GAME_ASSETS.doner) this.donerImage.src = GAME_ASSETS.doner;
      } else {
        this.mascotImage.src = 'bird_clean.png';
        this.donerImage.src = 'doner_clean.png';
      }
    }

    bindEvents() {
      const handleAction = (e) => {
        if (e.target && e.target.closest && e.target.closest('#hud, .tap-to-fly-btn, .btn-game-primary, .circle-btn, #side-controls-panel, .screen-modal a, button')) {
          return;
        }
        if (e.cancelable) e.preventDefault();
        this.triggerFlap();
      };

      // Pointer event on frame for instant 0ms touch response
      this.frame.addEventListener('pointerdown', handleAction, { passive: false });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          this.triggerFlap();
        } else if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          this.triggerQuickDive();
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          this.togglePause();
        } else if (e.code === 'KeyM') {
          this.toggleMute();
        }
      });

      // Swipe-down gesture detection on mobile
      let touchStartY = 0;
      this.frame.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      this.frame.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          if (deltaY > 50) {
            this.triggerQuickDive();
          }
        }
      }, { passive: true });

      // Instant button triggers (pointerdown ensures 0ms response on mobile)
      const btnStart = document.getElementById('btn-start');
      if (btnStart) {
        btnStart.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.startGame();
        });
        btnStart.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.state === 'START') this.startGame();
        });
      }

      const btnRestart = document.getElementById('btn-restart');
      if (btnRestart) {
        btnRestart.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.restartGame();
        });
        btnRestart.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.state === 'GAMEOVER') this.restartGame();
        });
      }

      const btnHome = document.getElementById('btn-home');
      if (btnHome) {
        btnHome.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.goToStartScreen();
        });
        btnHome.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goToStartScreen();
        });
      }

      const btnResume = document.getElementById('btn-resume');
      if (btnResume) {
        btnResume.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.togglePause();
        });
        btnResume.addEventListener('click', (e) => {
          e.stopPropagation();
          this.togglePause();
        });
      }

      const btnMute = document.getElementById('btn-mute');
      if (btnMute) {
        btnMute.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.toggleMute();
        });
        btnMute.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }

      const btnPause = document.getElementById('btn-pause');
      if (btnPause) {
        btnPause.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.togglePause();
        });
        btnPause.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    }

    goToStartScreen() {
      this.state = 'START';
      this.candles = [];
      this.doners = [];
      this.roadSigns = [];
      document.getElementById('screen-gameover').classList.add('hidden');
      document.getElementById('screen-pause').classList.add('hidden');
      document.getElementById('screen-start').classList.remove('hidden');
      this.bird.reset();
      this.bird.x = 200;
      this.bird.y = 250;
      this.updateHUD();
    }

    toggleMute() {
      const isMuted = this.sound.toggleMute();
      const svg = document.getElementById('svg-sound');
      if (isMuted) {
        svg.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      } else {
        svg.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      }
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        document.getElementById('screen-pause').classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        document.getElementById('screen-pause').classList.add('hidden');
        this.lastTime = performance.now();
      }
    }

    triggerFlap() {
      if (this.state === 'START') {
        this.startGame();
      } else if (this.state === 'PLAYING') {
        this.bird.flap();
        this.sound.playFlap();
        this.particles.spawnFlapEffects(this.bird.x, this.bird.y);
        if (navigator.vibrate) navigator.vibrate(12);
      } else if (this.state === 'GAMEOVER') {
        this.restartGame();
      }
    }

    triggerQuickDive() {
      if (this.state === 'PLAYING') {
        this.bird.quickDive();
        this.sound.playQuickDive();
        if (navigator.vibrate) navigator.vibrate(18);
      }
    }

    startGame() {
      this.state = 'PLAYING';
      document.getElementById('screen-start').classList.add('hidden');
      document.getElementById('screen-gameover').classList.add('hidden');
      document.getElementById('screen-pause').classList.add('hidden');
      this.bird.x = 100;
      this.bird.y = 280;
      this.bird.flap();
      this.sound.playFlap();
      this.particles.spawnFlapEffects(this.bird.x, this.bird.y);
      this.sound.startMusic();

      // "cand icepi sa apara deja primul oras"
      this.triggerLocationUnlockByIndex(0);
      this.roadSigns = [new TownRoadSign2D(280, 0)];
    }

    restartGame() {
      this.candles = [];
      this.doners = [];
      this.roadSigns = [];
      this.score = 0;
      this.donerCount = 0;
      this.waveCount = 0;
      this.celebrationShown = false;
      this.lastUnlockedLocation = null;
      this.scrollSpeed = this.baseSpeed;
      this.spawnTimer = 0;
      this.screenShake = 0;

      const celeb = document.getElementById('meso-16-celebration');
      if (celeb) celeb.classList.add('hidden');

      const locToast = document.getElementById('meso-location-toast');
      if (locToast) locToast.classList.add('hidden');
      if (this.locToastTimeout) clearTimeout(this.locToastTimeout);

      const recAlert = document.getElementById('new-record-alert');
      if (recAlert) recAlert.classList.add('hidden');

      this.bird.reset();
      this.bird.x = 100;
      this.bird.y = 280;
      this.updateHUD();

      this.state = 'PLAYING';
      document.getElementById('screen-gameover').classList.add('hidden');

      this.bird.flap();
      this.sound.playFlap();
      this.particles.spawnFlapEffects(this.bird.x, this.bird.y);

      // "cand icepi sa apara deja primul oras"
      this.triggerLocationUnlockByIndex(0);
      this.roadSigns = [new TownRoadSign2D(280, 0)];
    }

    spawnObstacleWave() {
      const x = V_WIDTH + 30;

      // "sa fie usor jocul pana la 20 dupa mai rapid si mai greu"
      // Gap size between classic 3D urban pipes:
      // Score 0 - 10: 195px (huge, generous gap - super easy)
      // Score 10 - 20: 188px (comfortable, easy)
      // Score 20+: 188 -> 148px (intense arcade challenge)
      let gapSize = 195;
      if (this.score <= 10) {
        gapSize = 195;
      } else if (this.score <= 20) {
        gapSize = 188;
      } else {
        gapSize = Math.max(148, 188 - (this.score - 20) * 1.8);
      }

      // Smooth vertical height positioning
      let minGapY = 220;
      let maxGapY = 345;
      if (this.score > 20) {
        minGapY = Math.max(160, 220 - (this.score - 20) * 2.8);
        maxGapY = Math.min(400, 345 + (this.score - 20) * 2.5);
      }
      const gapY = minGapY + Math.random() * (maxGapY - minGapY);

      const pipe = new Pipe2D(x, gapY, gapSize);
      this.candles.push(pipe);

      // Collectible döner coin:
      // Spawns small Döner coin roughly every 2-3 gates, not at every single pipe!
      this.waveCount++;
      if (this.waveCount % 2 === 1 && Math.random() < 0.75) {
        const doner = new DonerCollectible2D(x + pipe.width / 2, gapY, this.donerImage);
        this.doners.push(doner);
      }
    }

    collectDoner(doner) {
      doner.collected = true;
      this.donerCount++;

      this.sound.playDonerCollect();
      this.particles.spawnDonerCollectBurst(doner.x, doner.y);

      if (navigator.vibrate) navigator.vibrate([18, 22]);

      // "si sa nu scrie +1 doner" - text popup removed!

      const pill = document.getElementById('doner-pill');
      if (pill) {
        pill.classList.remove('bump');
        void pill.offsetWidth;
        pill.classList.add('bump');
      }

      this.updateHUD();
    }

    triggerCelebration16() {
      const banner = document.getElementById('meso-16-celebration');
      if (banner) {
        banner.classList.remove('hidden');
        setTimeout(() => {
          banner.classList.add('hidden');
        }, 4800);
      }
      this.sound.playDonerCollect();
      if (navigator.vibrate) navigator.vibrate([40, 40, 80]);

      // Festive celebratory golden bursts
      for (let i = 0; i < 18; i++) {
        setTimeout(() => {
          this.particles.spawnDonerCollectBurst(
            40 + Math.random() * (V_WIDTH - 80),
            120 + Math.random() * 260
          );
        }, i * 75);
      }
    }

    // "vreau de sus sa apara locatia sa apara doar jos pe tabla"
    triggerLocationUnlockByIndex(locIdx) {
      if (locIdx < 0 || !RESTAURANT_LOCATIONS.length) return;
      const locName = RESTAURANT_LOCATIONS[locIdx % RESTAURANT_LOCATIONS.length];
      this.lastUnlockedLocation = locName;

      // Popup-ul de sus (#meso-location-toast) este complet eliminat conform cerintei!
      // Locatia apare exclusiv jos pe pancarda de pe marginea drumului.
      const toast = document.getElementById('meso-location-toast');
      if (toast) toast.classList.add('hidden');

      this.sound.playLocationFanfare();
      if (navigator.vibrate) navigator.vibrate([28, 38, 28]);

      // Festive subtle golden particles
      for (let i = 0; i < 5; i++) {
        this.particles.spawnDonerCollectBurst(
          50 + Math.random() * (V_WIDTH - 100),
          120 + Math.random() * 200
        );
      }
    }

    // "placutele de la oras sa para din 2 in 2 puncte"
    triggerLocationUnlock(score) {
      const locIdx = Math.floor(score / 2);
      this.triggerLocationUnlockByIndex(locIdx);
    }

    // "dar sa nu fie exact pe mijlocuil tevi"
    // Calculeaza coordonata X astfel incat pancarda sa fie mereu in spatiul liber dintre tuburi, NICIODATA sub o teava!
    spawnRoadSign(locIdx) {
      const signW = 216;
      const pipeDistance = this.scrollSpeed * this.spawnInterval;
      let targetX = V_WIDTH + 80;

      if (this.candles.length > 0) {
        let maxPipeX = -Infinity;
        for (let i = 0; i < this.candles.length; i++) {
          if (this.candles[i].x > maxPipeX) {
            maxPipeX = this.candles[i].x;
          }
        }

        // Pozitioneaza pancarda exact la jumatatea distantei dintre tubul din dreapta si urmatorul tub:
        let candidateX = maxPipeX + pipeDistance * 0.5 - signW / 2;

        while (candidateX < V_WIDTH + 60) {
          candidateX += pipeDistance;
        }
        targetX = candidateX;
      } else {
        targetX = V_WIDTH + 140;
      }

      // Verificare stricta de distanta: centrul pancardei trebuie sa fie la minim 145px distanta de centrul oricarui tub!
      for (let i = 0; i < this.candles.length; i++) {
        const c = this.candles[i];
        const pipeCenter = c.x + c.width / 2;
        const signCenter = targetX + signW / 2;
        const diff = Math.abs(pipeCenter - signCenter);
        if (diff < 145) {
          targetX += (145 - diff) + 70;
        }
      }

      this.roadSigns.push(new TownRoadSign2D(targetX, locIdx));
    }

    gameOver() {
      this.state = 'GAMEOVER';
      this.sound.playHit();
      this.screenShake = 14.0;
      if (navigator.vibrate) navigator.vibrate(80);

      const isNewRecord = this.score > 0 && this.score >= this.highScore;
      if (this.score > this.highScore) {
        this.saveRecord(this.score);
      }

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('meso_last_score', this.score.toString());
          window.localStorage.setItem('meso_last_doners', this.donerCount.toString());
        }
      } catch (e) {}

      document.getElementById('final-score').innerText = this.score;
      document.getElementById('final-doners').innerText = this.donerCount;
      document.getElementById('best-score').innerText = this.highScore;

      // Afiseaza ultima locatie deblocata in Game Over
      const lastLocElem = document.getElementById('gameover-last-loc');
      if (lastLocElem) {
        lastLocElem.innerText = this.lastUnlockedLocation || 'Start Călătorie (Scor < 10)';
      }

      const recAlert = document.getElementById('new-record-alert');
      if (recAlert) {
        if (isNewRecord) {
          recAlert.classList.remove('hidden');
        } else {
          recAlert.classList.add('hidden');
        }
      }

      let rank = '🥉 DONER APPRENTICE';
      if (this.score >= 60) rank = '👑 MESO 16 ANI EMPEROR';
      else if (this.score >= 35) rank = '🥇 KEBAB MASTER';
      else if (this.score >= 16) rank = '🎂 MESO 16 ANI LEGEND';
      else if (this.score >= 8) rank = '🥈 ROLL CHAMPION';
      document.getElementById('gameover-rank').innerText = rank;

      this.updateHUD();
      document.getElementById('screen-gameover').classList.remove('hidden');
    }

    loadCleanRecord() {
      let val = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          val = window.localStorage.getItem('meso_best_record');
          if (val === null) {
            const oldVal = window.localStorage.getItem('meso_royal_record');
            if (oldVal && oldVal !== '775' && parseInt(oldVal, 10) < 500) {
              val = oldVal;
            } else {
              val = '0';
              window.localStorage.removeItem('meso_royal_record');
            }
          }
        }
      } catch (e) {
        val = '0';
      }

      let parsed = parseInt(val || '0', 10);
      if (isNaN(parsed) || parsed >= 500) {
        parsed = 0;
      }

      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('meso_best_record', parsed.toString());
          window.localStorage.setItem('meso_royal_record', parsed.toString());
        }
      } catch (e) {}

      return parsed;
    }

    saveRecord(score) {
      const validScore = Math.max(0, parseInt(score, 10) || 0);
      this.highScore = validScore;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('meso_best_record', validScore.toString());
          window.localStorage.setItem('meso_royal_record', validScore.toString());
        }
      } catch (e) {
        console.warn('Nu s-a putut salva recordul:', e);
      }
      this.updateHUD();
    }

    updateHUD() {
      document.getElementById('hud-doner-count').innerText = this.donerCount;
      document.getElementById('royal-record-val').innerText = this.highScore;
    }

    loop(now) {
      requestAnimationFrame(this.loop.bind(this));

      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      if (this.state === 'PLAYING') {
        // DIFFICULTY LOGIC:
        // Score 0 - 20: EASY & RELAXED ("sa fie usor jocul pana la 20")
        // - Steady comfortable speed (134 px/s)
        // - Large horizontal distance between pipes (460 px)
        // - Spacing in time = ~3.43 seconds between pipes
        // Score > 20: PROGRESSIVELY HARDER & FASTER ("dupa mai rapid si mai greu")
        // - Speed scales up rapidly (from 134 to 239 px/s)
        // - Obstacle distance tightens (from 460 down to 305px)
        let targetSpeed = 134;
        let targetDistance = 460;

        if (this.score > 20) {
          const extraScore = this.score - 20;
          targetSpeed = 134 + Math.min(105, extraScore * 4.2);
          targetDistance = Math.max(305, 460 - extraScore * 8.5);
        }

        this.scrollSpeed = targetSpeed;
        this.spawnInterval = targetDistance / this.scrollSpeed;

        this.bird.update(dt);

        // Ground death
        if (this.bird.y + this.bird.radius >= GROUND_Y) {
          this.gameOver();
          return;
        }

        // Soft ceiling: doesn't kill player if they brush sky top, caps gently
        if (this.bird.y - this.bird.radius <= 0) {
          this.bird.y = this.bird.radius;
          this.bird.vy = 0;
        }

        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
          this.spawnTimer = 0;
          this.spawnObstacleWave();
        }

        // Urban 3D Pipes Update
        for (let i = this.candles.length - 1; i >= 0; i--) {
          const c = this.candles[i];
          c.update(dt, this.scrollSpeed);

          // Passing a pipe awards point
          if (!c.cleared && c.x + c.width < this.bird.x) {
            c.cleared = true;
            this.score += 1;
            this.sound.playScoreDing();

            // Salveaza recordul in timp real dupa fiecare depasire cu succes
            if (this.score > this.highScore) {
              this.saveRecord(this.score);
            } else {
              this.updateHUD();
            }

            // "iar cand ajungi la 16 sa apara mesaj frumos La multi ani Meso.! dar jocul continua"
            if (this.score === 16 && !this.celebrationShown) {
              this.celebrationShown = true;
              this.triggerCelebration16();
            }

            // "placutele de la oras sa para din 2 in 2 puncte"
            // "dar sa nu fie exact pe mijlocuil tevi" -> spawnRoadSign o plaseaza mereu la jumatatea distantei dintre tuburi!
            if (this.score > 0 && this.score % 2 === 0) {
              const locIdx = Math.floor(this.score / 2);
              this.triggerLocationUnlockByIndex(locIdx);
              this.spawnRoadSign(locIdx);
            }
          }

          if (c.checkCollision(this.bird)) {
            this.gameOver();
            return;
          }

          if (c.x < -100) {
            this.candles.splice(i, 1);
          }
        }

        // Döner Collectibles Update
        for (let i = this.doners.length - 1; i >= 0; i--) {
          const doner = this.doners[i];
          doner.update(dt, this.scrollSpeed);

          const dist = Math.hypot(this.bird.x - doner.x, this.bird.y - doner.y);
          if (dist < this.bird.radius + doner.radius) {
            this.collectDoner(doner);
            this.doners.splice(i, 1);
            continue;
          }

          if (doner.x < -40) {
            this.doners.splice(i, 1);
          }
        }

        // Town Entrance Road Signs Update ("pancarda pe drum")
        for (let i = this.roadSigns.length - 1; i >= 0; i--) {
          const sign = this.roadSigns[i];
          sign.update(dt, this.scrollSpeed);
          if (sign.x < -sign.width - 60) {
            this.roadSigns.splice(i, 1);
          }
        }

        // "fa sa inceapa zi dupa se schimba si noapte"
        // Day -> Sunset -> Night (around score 14-22) -> Dawn -> Day
        const targetCycle = (this.score % 28) / 28;
        this.scenery.update(dt, this.scrollSpeed, targetCycle);
        this.particles.update(dt);

      } else if (this.state === 'START') {
        // "vreau sa se vada pasarea cum zoboara pe ecran principal"
        // Pasărea zboară liber pe ecranul principal în văzul jucătorului!
        this.bird.x = 200;
        this.bird.y = 250 + Math.sin(now * 0.0032) * 8.5;
        this.bird.rotation = Math.sin(now * 0.0028) * 0.05;
        this.bird.scaleX = 1.0 + Math.sin(now * 0.004) * 0.03;
        this.bird.scaleY = 1.0 - Math.sin(now * 0.004) * 0.03;
        this.bird.flightTime += dt;

        // "fa sa inceapa zi" -> Starts in pure daytime!
        this.scenery.update(dt, 20, 0.0);
        this.particles.update(dt);
      }

      // ==========================================
      // RENDER 2D SCENE
      // ==========================================
      // Reset transform and clear canvas completely every frame
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.save();
      try {
        // Dynamic Camera Screen Shake
        if (this.screenShake > 0) {
          const shakeX = (Math.random() - 0.5) * this.screenShake;
          const shakeY = (Math.random() - 0.5) * this.screenShake;
          this.ctx.translate(shakeX, shakeY);
          this.screenShake = Math.max(0, this.screenShake - dt * 25);
        }

        this.ctx.scale(this.scaleX, this.scaleY);

        // 1. Twilight Atmospheric Parallax Sky, Skyline & Lights
        this.scenery.render(this.ctx);

        // 2. 3D Urban Obstacle Cylinders (Never on start screen)
        if (this.state !== 'START') {
          this.candles.forEach(c => c.render(this.ctx));
        }

        // 3. Miniature Golden Döner Coins (Never on start screen)
        if (this.state !== 'START') {
          this.doners.forEach(d => d.render(this.ctx));
        }

        // 4. Meso Turkey Mascot
        this.bird.render(this.ctx);

        // 5. Video Game Particle Effects (Feathers, Dust, Shockwaves)
        this.particles.render(this.ctx);

        // 6. ASPHALT STREET ROAD ("drumul de jos in miscare")
        this.scenery.renderGround(this.ctx);

        // 7. Town Entrance Road Signs on Road Curb ("pancardă intrare localitate")
        this.roadSigns.forEach(s => s.render(this.ctx));

        // 8. Big Classic Score in Center Top During Flight
        if (this.state === 'PLAYING') {
          this.ctx.save();
          this.ctx.textAlign = 'center';
          this.ctx.font = '54px "Lilita One", "Titan One", cursive';
          this.ctx.strokeStyle = '#1d3d29';
          this.ctx.lineWidth = 6;
          this.ctx.strokeText(this.score, V_WIDTH / 2, 98);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillText(this.score, V_WIDTH / 2, 98);
          this.ctx.restore();
        }
      } catch (renderErr) {
        console.error("Render loop error:", renderErr);
      } finally {
        this.ctx.restore();
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    try {
      if (window.self !== window.top || window.location.search.includes('embed')) {
        document.body.classList.add('is-embedded');
      }
    } catch (e) {
      document.body.classList.add('is-embedded');
    }
    new MesoGame2D();
  });
})();
