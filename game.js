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

  // ==========================================
  // 1. SOUND & MUSIC SYSTEM (Web Audio API)
  // ==========================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('meso_muted') === 'true';
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
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          type: 'dust',
          x: x - 12 + Math.random() * 8,
          y: y + 10 + Math.random() * 6,
          vx: -20 - Math.random() * 30,
          vy: -10 + Math.random() * 20,
          radius: 4 + Math.random() * 4,
          alpha: 0.6,
          life: 0.35
        });
      }

      if (Math.random() < 0.6) {
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
          life: 0.8
        });
      }
    }

    spawnDonerCollectBurst(x, y) {
      this.shockwaves.push({
        x: x,
        y: y,
        radius: 4,
        maxRadius: 36,
        alpha: 1.0,
        color: '#ffd60a'
      });

      const starColors = ['#ffd60a', '#ffc300', '#ff9e00', '#ffffff', '#e02b20'];
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
        const spd = 60 + Math.random() * 90;
        this.particles.push({
          type: 'star',
          x: x,
          y: y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 15,
          radius: 3 + Math.random() * 2.5,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: 5 + Math.random() * 8,
          color: starColors[i % starColors.length],
          alpha: 1.0,
          life: 0.55
        });
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
      this.gravity = 1050;
      this.jumpVelocity = -355;
      this.diveVelocity = 500;
      this.rotation = 0;
      this.targetRotation = 0;
      this.radius = 21;

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
      this.scaleX = 0.84;
      this.scaleY = 1.22;
      this.flapImpulse = 24;
    }

    quickDive() {
      this.vy = this.diveVelocity;
      this.scaleX = 1.25;
      this.scaleY = 0.85;
      this.targetRotation = 0.95;
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
    }

    update(dt) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      this.flightTime += dt;

      if (this.vy < 0) {
        this.targetRotation = -0.36;
      } else {
        this.targetRotation = Math.min(1.25, (this.vy / 480) * 0.95);
      }
      this.rotation += (this.targetRotation - this.rotation) * Math.min(1, dt * 11);

      this.scaleX += (1.0 - this.scaleX) * dt * 8.5;
      this.scaleY += (1.0 - this.scaleY) * dt * 8.5;

      this.flapImpulse = Math.max(0, this.flapImpulse - dt * 40);
      const totalWingSpeed = this.wingSpeed + this.flapImpulse;
      this.wingAngle = Math.sin(this.flightTime * totalWingSpeed) * 0.55;

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

      // Speed Swoosh Trails
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineCap = 'round';

      const wave = Math.sin(this.flightTime * 18);

      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-30 - wave * 2, -7 + wave * 1.5);
      ctx.lineTo(-14, -7);
      ctx.stroke();

      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(-38 + wave * 3, 0);
      ctx.lineTo(-17, 0);
      ctx.stroke();

      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-28 - wave * 2, 7 - wave * 1.5);
      ctx.lineTo(-13, 7);
      ctx.stroke();
      ctx.restore();

      ctx.rotate(this.rotation);
      ctx.scale(this.scaleX, this.scaleY);

      if (this.image && this.image.complete && this.image.naturalWidth > 0) {
        const w = 54;
        const h = 50;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.beginPath();
        ctx.ellipse(0, 18, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.drawImage(this.image, -w / 2, -h / 2, w, h);

        ctx.save();
        ctx.translate(-7, 2);
        ctx.rotate(this.wingAngle);
        ctx.fillStyle = '#b85814';
        ctx.strokeStyle = '#2b1404';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 7, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

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
  // 4. STYLIZED 3D BIRTHDAY CANDLES (Tuburile Lumânări)
  // ==========================================
  class Candle2D {
    constructor(x, gapY, gapSize = 155) {
      this.x = x;
      this.gapY = gapY;
      this.gapSize = gapSize;
      this.width = 66;
      this.cleared = false;
      this.flameTimer = Math.random() * Math.PI * 2;
      this.candleStyle = Math.random() > 0.5 ? 'meso-green' : 'festive-red';
    }

    update(dt, speed) {
      this.x -= speed * dt;
      this.flameTimer += dt * 8.5;
    }

    render(ctx) {
      const topCandleBottom = this.gapY - this.gapSize / 2;
      const bottomCandleTop = this.gapY + this.gapSize / 2;

      this.drawCandleStick(ctx, this.x, 0, this.width, topCandleBottom, true);
      this.drawCandleStick(ctx, this.x, bottomCandleTop, this.width, GROUND_Y - bottomCandleTop, false);
      this.drawFlame(ctx, this.x + this.width / 2, bottomCandleTop);
    }

    drawCandleStick(ctx, x, y, w, h, isTop) {
      ctx.save();

      const primaryColor = this.candleStyle === 'meso-green' ? '#164223' : '#d62828';
      const secondaryColor = '#fffbf0';
      const goldStripeColor = '#ffc300';

      const waxGrad = ctx.createLinearGradient(x, 0, x + w, 0);
      waxGrad.addColorStop(0, '#0c1a10');
      waxGrad.addColorStop(0.18, primaryColor);
      waxGrad.addColorStop(0.6, primaryColor);
      waxGrad.addColorStop(1, '#09120b');

      ctx.fillStyle = waxGrad;
      ctx.fillRect(x, y, w, h);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      const stripeH = 28;
      for (let sy = y - 60; sy < y + h + 60; sy += stripeH * 2) {
        ctx.fillStyle = goldStripeColor;
        ctx.beginPath();
        ctx.moveTo(x, sy);
        ctx.lineTo(x + w, sy - 22);
        ctx.lineTo(x + w, sy - 11);
        ctx.lineTo(x, sy + 11);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(x, sy + 15);
        ctx.lineTo(x + w, sy - 7);
        ctx.lineTo(x + w, sy + 4);
        ctx.lineTo(x, sy + 26);
        ctx.closePath();
        ctx.fill();
      }

      const sheenGrad = ctx.createLinearGradient(x + 5, 0, x + 16, 0);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(x + 5, y, 11, h);

      ctx.restore();

      ctx.strokeStyle = '#1b120c';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      const tipY = isTop ? y + h : y;
      ctx.fillStyle = secondaryColor;
      ctx.strokeStyle = '#1b120c';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.ellipse(x + w / 2, tipY, w / 2, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (isTop) {
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(x + 8, tipY);
        ctx.quadraticCurveTo(x + 12, tipY + 15, x + 16, tipY + 15);
        ctx.quadraticCurveTo(x + 20, tipY + 15, x + 24, tipY);

        ctx.moveTo(x + 38, tipY);
        ctx.quadraticCurveTo(x + 44, tipY + 20, x + 48, tipY + 20);
        ctx.quadraticCurveTo(x + 52, tipY + 20, x + 56, tipY);
        ctx.fill();
      } else {
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.moveTo(x + 10, tipY + 2);
        ctx.quadraticCurveTo(x + 14, tipY + 17, x + 18, tipY + 17);
        ctx.quadraticCurveTo(x + 22, tipY + 17, x + 26, tipY + 2);

        ctx.moveTo(x + 36, tipY + 2);
        ctx.quadraticCurveTo(x + 42, tipY + 24, x + 46, tipY + 24);
        ctx.quadraticCurveTo(x + 50, tipY + 24, x + 56, tipY + 2);
        ctx.fill();
      }

      ctx.restore();
    }

    drawFlame(ctx, cx, cy) {
      ctx.save();

      const sway = Math.sin(this.flameTimer) * 2.8 - 1.2;
      const flickerScale = 0.92 + Math.sin(this.flameTimer * 1.7) * 0.12;

      ctx.strokeStyle = '#211e1c';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx - 2, cy - 8, cx + sway * 0.4, cy - 14);
      ctx.stroke();

      const fx = cx + sway;
      const fy = cy - 14;

      const glowGrad = ctx.createRadialGradient(fx, fy - 16, 2, fx, fy - 16, 48);
      glowGrad.addColorStop(0, 'rgba(255, 183, 3, 0.48)');
      glowGrad.addColorStop(0.5, 'rgba(255, 110, 0, 0.18)');
      glowGrad.addColorStop(1, 'rgba(255, 200, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(fx, fy - 16, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(1, flickerScale);

      ctx.fillStyle = '#ff5400';
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      ctx.quadraticCurveTo(-14, -20, 0, -36);
      ctx.quadraticCurveTo(14, -20, 11, 0);
      ctx.quadraticCurveTo(0, 5, -11, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffd000';
      ctx.beginPath();
      ctx.moveTo(-7, -2);
      ctx.quadraticCurveTo(-9, -16, 0, -28);
      ctx.quadraticCurveTo(9, -16, 7, -2);
      ctx.quadraticCurveTo(0, 3, -7, -2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-4, -1);
      ctx.quadraticCurveTo(-5, -9, 0, -17);
      ctx.quadraticCurveTo(5, -9, 4, -1);
      ctx.quadraticCurveTo(0, 2, -4, -1);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      const emberY = fy - 36 - ((this.flameTimer * 12) % 25);
      const emberAlpha = Math.max(0, 1 - (fy - 36 - emberY) / 25);
      ctx.fillStyle = `rgba(255, 220, 100, ${emberAlpha})`;
      ctx.beginPath();
      ctx.arc(fx + Math.sin(emberY * 0.1) * 6, emberY, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    checkCollision(bird) {
      const topBottom = this.gapY - this.gapSize / 2;
      const bottomTop = this.gapY + this.gapSize / 2;

      if (bird.x + bird.radius > this.x + 3 && bird.x - bird.radius < this.x + this.width - 3) {
        if (bird.y - bird.radius < topBottom || bird.y + bird.radius > bottomTop) {
          return true;
        }
      }
      return false;
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

      // Compact warm golden aura
      const auraGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 19);
      auraGrad.addColorStop(0, 'rgba(255, 214, 10, 0.5)');
      auraGrad.addColorStop(0.7, 'rgba(255, 183, 3, 0.15)');
      auraGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 19, 0, Math.PI * 2);
      ctx.fill();

      // Small Metallic Gold Coin Rim
      ctx.fillStyle = '#ffc300';
      ctx.strokeStyle = '#2e1903';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner Coin Face
      const faceGrad = ctx.createLinearGradient(-10, -10, 10, 10);
      faceGrad.addColorStop(0, '#fff4a3');
      faceGrad.addColorStop(0.5, '#ffb703');
      faceGrad.addColorStop(1, '#d48b00');
      ctx.fillStyle = faceGrad;
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
        ctx.arc(9, -8, 1.8 * sScale, 0, Math.PI * 2);
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

  class Scenery2D {
    constructor() {
      this.skylineX = 0;
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
    }

    update(dt, speed, targetCycle = 0.0) {
      // Smoothly blend timeOfDay toward targetCycle with shortest angle interpolation
      let diff = (targetCycle - this.timeOfDay + 1.5) % 1.0 - 0.5;
      this.timeOfDay = (this.timeOfDay + diff * Math.min(1, dt * 1.6) + 1.0) % 1.0;

      this.sunRotation += dt * 0.35;
      this.skylineX -= speed * 0.12 * dt;
      if (this.skylineX < -400) this.skylineX += 400;

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
      // 4 Keyframes:
      // 0.00: Full DAY (Zi senin, soare, nori albi)
      // 0.33: SUNSET (Apus auriu-roz, soarele apune)
      // 0.65: FESTIVE NIGHT (Noapte înstelată, lună, lumini strălucitoare - Meso 16!)
      // 0.88: DAWN / SUNRISE (Răsărit pastelat, soarele răsare)
      const t = this.timeOfDay;

      const KF_DAY = {
        skyTop: [56, 189, 248],
        skyMid: [186, 230, 253],
        skyBottom: [254, 240, 138],
        sunAlpha: 1.0,
        sunY: 95,
        moonAlpha: 0.0,
        moonY: 220,
        starsAlpha: 0.0,
        cloudsAlpha: 0.95,
        lightsGlowAlpha: 0.08,
        windowGlowAlpha: 0.15,
        buildingColor: [62, 75, 96]
      };

      const KF_SUNSET = {
        skyTop: [76, 29, 149],
        skyMid: [217, 70, 239],
        skyBottom: [249, 115, 22],
        sunAlpha: 0.85,
        sunY: 240,
        moonAlpha: 0.35,
        moonY: 140,
        starsAlpha: 0.25,
        cloudsAlpha: 0.55,
        lightsGlowAlpha: 0.55,
        windowGlowAlpha: 0.70,
        buildingColor: [42, 33, 56]
      };

      const KF_NIGHT = {
        skyTop: [11, 16, 30],
        skyMid: [26, 31, 56],
        skyBottom: [88, 28, 135],
        sunAlpha: 0.0,
        sunY: 300,
        moonAlpha: 1.0,
        moonY: 90,
        starsAlpha: 1.0,
        cloudsAlpha: 0.15,
        lightsGlowAlpha: 1.0,
        windowGlowAlpha: 1.0,
        buildingColor: [20, 22, 36]
      };

      const KF_DAWN = {
        skyTop: [30, 41, 59],
        skyMid: [129, 140, 248],
        skyBottom: [253, 224, 71],
        sunAlpha: 0.5,
        sunY: 175,
        moonAlpha: 0.25,
        moonY: 160,
        starsAlpha: 0.15,
        cloudsAlpha: 0.65,
        lightsGlowAlpha: 0.35,
        windowGlowAlpha: 0.35,
        buildingColor: [46, 54, 72]
      };

      let kf1, kf2, localT;
      if (t < 0.33) {
        kf1 = KF_DAY;
        kf2 = KF_SUNSET;
        localT = t / 0.33;
      } else if (t < 0.65) {
        kf1 = KF_SUNSET;
        kf2 = KF_NIGHT;
        localT = (t - 0.33) / (0.65 - 0.33);
      } else if (t < 0.88) {
        kf1 = KF_NIGHT;
        kf2 = KF_DAWN;
        localT = (t - 0.65) / (0.88 - 0.65);
      } else {
        kf1 = KF_DAWN;
        kf2 = KF_DAY;
        localT = (t - 0.88) / (1.0 - 0.88);
      }

      return {
        skyTop: lerpRGB(kf1.skyTop, kf2.skyTop, localT),
        skyMid: lerpRGB(kf1.skyMid, kf2.skyMid, localT),
        skyBottom: lerpRGB(kf1.skyBottom, kf2.skyBottom, localT),
        sunAlpha: lerpVal(kf1.sunAlpha, kf2.sunAlpha, localT),
        sunY: lerpVal(kf1.sunY, kf2.sunY, localT),
        moonAlpha: lerpVal(kf1.moonAlpha, kf2.moonAlpha, localT),
        moonY: lerpVal(kf1.moonY, kf2.moonY, localT),
        starsAlpha: lerpVal(kf1.starsAlpha, kf2.starsAlpha, localT),
        cloudsAlpha: lerpVal(kf1.cloudsAlpha, kf2.cloudsAlpha, localT),
        lightsGlowAlpha: lerpVal(kf1.lightsGlowAlpha, kf2.lightsGlowAlpha, localT),
        windowGlowAlpha: lerpVal(kf1.windowGlowAlpha, kf2.windowGlowAlpha, localT),
        buildingColor: lerpRGB(kf1.buildingColor, kf2.buildingColor, localT)
      };
    }

    render(ctx) {
      const state = this.getCycleState();

      // 1. Dynamic Smooth Sky Gradient (Day -> Sunset -> Night -> Dawn)
      // Stretches seamlessly all the way to GROUND_Y (575px), eliminating the white background band!
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, state.skyTop);
      skyGrad.addColorStop(0.55, state.skyMid);
      skyGrad.addColorStop(1.0, state.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, V_WIDTH, GROUND_Y + 12);

      // 2. Daytime Radiant Sun
      if (state.sunAlpha > 0.01) {
        const sx = 295;
        const sy = state.sunY;
        ctx.save();
        ctx.globalAlpha = state.sunAlpha;

        // Outer Corona Flare
        const corona = ctx.createRadialGradient(sx, sy, 8, sx, sy, 72);
        corona.addColorStop(0, 'rgba(255, 245, 175, 0.65)');
        corona.addColorStop(0.4, 'rgba(255, 200, 30, 0.28)');
        corona.addColorStop(1, 'rgba(255, 180, 0, 0)');
        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(sx, sy, 72, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Sun Rays
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.sunRotation);
        ctx.strokeStyle = 'rgba(255, 230, 110, 0.38)';
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 22, Math.sin(a) * 22);
          ctx.lineTo(Math.cos(a) * 35, Math.sin(a) * 35);
          ctx.stroke();
        }
        ctx.restore();

        // Sun Disc
        const sunDisc = ctx.createRadialGradient(sx - 3, sy - 3, 2, sx, sy, 20);
        sunDisc.addColorStop(0, '#ffffff');
        sunDisc.addColorStop(0.5, '#fff07a');
        sunDisc.addColorStop(1, '#ffb703');
        ctx.fillStyle = sunDisc;
        ctx.beginPath();
        ctx.arc(sx, sy, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 3. Twinkling Night Stars
      if (state.starsAlpha > 0.02) {
        ctx.save();
        this.stars.forEach(s => {
          const a = state.starsAlpha * (s.baseAlpha + Math.sin(s.twinklePhase) * 0.35);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, a)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 4. Night Golden Moon
      if (state.moonAlpha > 0.01) {
        const mx = 85;
        const my = state.moonY;
        ctx.save();
        ctx.globalAlpha = state.moonAlpha;

        // Moon Glow
        const mHalo = ctx.createRadialGradient(mx, my, 8, mx, my, 52);
        mHalo.addColorStop(0, 'rgba(255, 245, 190, 0.45)');
        mHalo.addColorStop(0.5, 'rgba(255, 214, 10, 0.15)');
        mHalo.addColorStop(1, 'rgba(255, 214, 10, 0)');
        ctx.fillStyle = mHalo;
        ctx.beginPath();
        ctx.arc(mx, my, 52, 0, Math.PI * 2);
        ctx.fill();

        // Luminous Moon Body
        ctx.fillStyle = '#fffbe8';
        ctx.beginPath();
        ctx.arc(mx, my, 17, 0, Math.PI * 2);
        ctx.fill();

        // Soft Moon Craters
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(mx - 3, my + 3, 3.5, 0, Math.PI * 2);
        ctx.arc(mx + 4, my - 3, 2.5, 0, Math.PI * 2);
        ctx.arc(mx + 3, my + 5, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 5. Drifting Fluffy Clouds (Crisp white during day, tinted at sunset)
      if (state.cloudsAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = state.cloudsAlpha;
        this.clouds.forEach(c => {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(c.w * 0.3, 0, c.h * 0.55, 0, Math.PI * 2);
          ctx.arc(c.w * 0.55, -c.h * 0.28, c.h * 0.72, 0, Math.PI * 2);
          ctx.arc(c.w * 0.8, 0, c.h * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();
      }

      // 6. Parallax Skyline (Dynamic day/sunset/night building color & window glow)
      ctx.save();
      ctx.translate(this.skylineX, 0);
      for (let offset = 0; offset <= 400; offset += 400) {
        ctx.save();
        ctx.translate(offset, 0);

        ctx.fillStyle = state.buildingColor;
        ctx.fillRect(20, 360, 65, GROUND_Y - 360 + 5);
        ctx.fillRect(110, 320, 80, GROUND_Y - 320 + 5);
        ctx.fillRect(215, 380, 55, GROUND_Y - 380 + 5);
        ctx.fillRect(295, 340, 75, GROUND_Y - 340 + 5);

        // Windows: Soft reflection during day, glowing warm gold at night
        const wAlpha = 0.2 + state.windowGlowAlpha * 0.75;
        ctx.fillStyle = `rgba(255, 214, 10, ${wAlpha})`;
        [32, 54].forEach(wx => {
          [380, 420, 460].forEach(wy => ctx.fillRect(wx, wy, 8, 12));
        });
        [125, 150, 170].forEach(wx => {
          [340, 380, 420, 460].forEach(wy => ctx.fillRect(wx, wy, 8, 12));
        });
        [310, 340].forEach(wx => {
          [360, 400, 440].forEach(wy => ctx.fillRect(wx, wy, 8, 12));
        });

        ctx.restore();
      }
      ctx.restore();

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

        if (state.lightsGlowAlpha > 0.1) {
          const bulbGlow = ctx.createRadialGradient(bx, by + 4, 1, bx, by + 4, 18);
          bulbGlow.addColorStop(0, `rgba(255, 224, 102, ${0.75 * state.lightsGlowAlpha})`);
          bulbGlow.addColorStop(0.5, `rgba(255, 170, 0, ${0.25 * state.lightsGlowAlpha})`);
          bulbGlow.addColorStop(1, 'rgba(255, 170, 0, 0)');
          ctx.fillStyle = bulbGlow;
          ctx.beginPath();
          ctx.arc(bx, by + 4, 18, 0, Math.PI * 2);
          ctx.fill();
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
      // 100% STATIC ASPHALT STREET ROAD ("sosea jos statica")
      ctx.save();

      // 1. Concrete Sidewalk & Curb (Trotoar & Bordură)
      const curbH = 14;
      const curbGrad = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y + curbH);
      curbGrad.addColorStop(0, '#7b8391');
      curbGrad.addColorStop(0.4, '#646b77');
      curbGrad.addColorStop(1.0, '#4a505b');
      ctx.fillStyle = curbGrad;
      ctx.fillRect(0, GROUND_Y, V_WIDTH, curbH);

      // Curb stone top highlight
      ctx.fillStyle = '#a1a8b5';
      ctx.fillRect(0, GROUND_Y, V_WIDTH, 2);

      // Dark curb edge line
      ctx.fillStyle = '#32373f';
      ctx.fillRect(0, GROUND_Y + curbH - 1.5, V_WIDTH, 1.5);

      // 2. Solid Asphalt Road (Sosea Asfalt)
      const roadY = GROUND_Y + curbH;
      const roadH = V_HEIGHT - roadY;
      const roadGrad = ctx.createLinearGradient(0, roadY, 0, V_HEIGHT);
      roadGrad.addColorStop(0, '#2e333d');
      roadGrad.addColorStop(0.5, '#252931');
      roadGrad.addColorStop(1.0, '#1c1f26');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, roadY, V_WIDTH, roadH);

      // 3. Static Road Markings (Marcaje Rutiere 100% Statice)
      // Upper solid white line
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, roadY + 4, V_WIDTH, 2.5);

      // Center Static Yellow Dashed Lane Lines
      ctx.fillStyle = '#ffd60a';
      const dashW = 34;
      const dashH = 5;
      const dashY = roadY + 45;
      for (let x = 16; x < V_WIDTH + 40; x += 64) {
        ctx.beginPath();
        ctx.roundRect(x, dashY, dashW, dashH, 2);
        ctx.fill();
      }

      // Lower solid white shoulder line
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, roadY + 88, V_WIDTH, 2);

      ctx.restore();
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
      this.highScore = this.loadCleanRecord();

      this.baseSpeed = 160;
      this.scrollSpeed = 160;
      this.spawnTimer = 0;
      this.spawnInterval = 2.1;

      // Dynamic Camera Screen Shake
      this.screenShake = 0;

      this.candles = [];
      this.doners = [];

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
      this.ctx = this.canvas.getContext('2d');

      this.resize = this.resize.bind(this);
      window.addEventListener('resize', this.resize);
      this.resize();
    }

    resize() {
      const rect = this.frame.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
        if (e.target.closest && e.target.closest('#hud, .tap-to-fly-btn, .circle-btn, #side-controls-panel')) {
          return;
        }
        this.triggerFlap();
      };

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

      // Pointer Handlers (Immediate touch on screen)
      this.frame.addEventListener('pointerdown', handleAction);

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
          if (deltaY > 45) {
            this.triggerQuickDive();
          }
        }
      }, { passive: true });

      // Buttons
      document.getElementById('btn-start').addEventListener('click', (e) => {
        e.stopPropagation();
        this.startGame();
      });
      document.getElementById('btn-restart').addEventListener('click', (e) => {
        e.stopPropagation();
        this.restartGame();
      });
      const btnHome = document.getElementById('btn-home');
      if (btnHome) {
        btnHome.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goToStartScreen();
        });
      }
      document.getElementById('btn-resume').addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePause();
      });

      document.getElementById('btn-mute').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMute();
      });

      document.getElementById('btn-pause').addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePause();
      });
    }

    goToStartScreen() {
      this.state = 'START';
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
        this.screenShake = Math.max(this.screenShake, 1.2);
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
        this.screenShake = Math.max(this.screenShake, 2.0);
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
    }

    restartGame() {
      this.candles = [];
      this.doners = [];
      this.score = 0;
      this.donerCount = 0;
      this.waveCount = 0;
      this.celebrationShown = false;
      this.scrollSpeed = this.baseSpeed;
      this.spawnTimer = 0;
      this.screenShake = 0;

      const celeb = document.getElementById('meso-16-celebration');
      if (celeb) celeb.classList.add('hidden');

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
    }

    spawnObstacleWave() {
      const x = V_WIDTH + 30;
      const gapY = 175 + Math.random() * 200;
      const candle = new Candle2D(x, gapY, 155);
      this.candles.push(candle);

      // "si sa nu apara la fiecare tub":
      // Spawns small Döner coin roughly every 2-3 gates, not at every single pipe!
      this.waveCount++;
      if (this.waveCount % 2 === 1 && Math.random() < 0.72) {
        const doner = new DonerCollectible2D(x + candle.width / 2, gapY, this.donerImage);
        this.doners.push(doner);
      }
    }

    collectDoner(doner) {
      doner.collected = true;
      this.donerCount++;

      this.sound.playDonerCollect();
      this.screenShake = Math.max(this.screenShake, 2.0);
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
        localStorage.setItem('meso_last_score', this.score.toString());
        localStorage.setItem('meso_last_doners', this.donerCount.toString());
      } catch (e) {}

      document.getElementById('final-score').innerText = this.score;
      document.getElementById('final-doners').innerText = this.donerCount;
      document.getElementById('best-score').innerText = this.highScore;

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
        val = localStorage.getItem('meso_best_record');
        if (val === null) {
          const oldVal = localStorage.getItem('meso_royal_record');
          if (oldVal && oldVal !== '775' && parseInt(oldVal, 10) < 500) {
            val = oldVal;
          } else {
            val = '0';
            localStorage.removeItem('meso_royal_record');
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
        localStorage.setItem('meso_best_record', parsed.toString());
        localStorage.setItem('meso_royal_record', parsed.toString());
      } catch (e) {}

      return parsed;
    }

    saveRecord(score) {
      const validScore = Math.max(0, parseInt(score, 10) || 0);
      this.highScore = validScore;
      try {
        localStorage.setItem('meso_best_record', validScore.toString());
        localStorage.setItem('meso_royal_record', validScore.toString());
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
        // Progressive speed ramp-up
        let extraSpeed = 0;
        if (this.score >= 15) {
          extraSpeed = Math.min(105, (this.score - 15) * 2.4);
        }
        this.scrollSpeed = this.baseSpeed + extraSpeed;
        this.spawnInterval = 340 / this.scrollSpeed;

        this.bird.update(dt);

        if (this.bird.y + this.bird.radius >= GROUND_Y || this.bird.y - this.bird.radius <= 0) {
          this.gameOver();
          return;
        }

        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
          this.spawnTimer = 0;
          this.spawnObstacleWave();
        }

        // Candles Update
        for (let i = this.candles.length - 1; i >= 0; i--) {
          const c = this.candles[i];
          c.update(dt, this.scrollSpeed);

          // Passing a candle awards point
          if (!c.cleared && c.x + c.width < this.bird.x) {
            c.cleared = true;
            this.score += 1;
            this.sound.playScoreDing();

            // Salveaza recordul in timp real dupa fiecare lumanare depasita cu succes
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

        // "fa sa inceapa zi dupa se schimba si noapte"
        // Day -> Sunset -> Night (around score 14-22) -> Dawn -> Day
        const targetCycle = (this.score % 28) / 28;
        this.scenery.update(dt, this.scrollSpeed, targetCycle);
        this.particles.update(dt);

      } else if (this.state === 'START') {
        // "vreau sa se vada pasarea cum zoboara pe ecran principal"
        // Pasărea zboară liber pe ecranul principal în văzul jucătorului!
        this.bird.x = 200;
        this.bird.y = 250 + Math.sin(now * 0.0035) * 9;
        this.bird.rotation = Math.sin(now * 0.0035) * 0.08;
        this.bird.wingAngle = Math.sin(now * 0.009) * 0.45;

        // "fa sa inceapa zi" -> Starts in pure daytime!
        this.scenery.update(dt, 20, 0.0);
        this.particles.update(dt);
      }

      // ==========================================
      // RENDER 2D SCENE
      // ==========================================
      this.ctx.save();

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

      // 2. 3D Birthday Candles with Living Flame & Organic Wax Drips
      this.candles.forEach(c => c.render(this.ctx));

      // 3. Miniature Golden Döner Coins
      this.doners.forEach(d => d.render(this.ctx));

      // 4. Meso Turkey Mascot
      this.bird.render(this.ctx);

      // 5. Video Game Particle Effects (Feathers, Dust, Shockwaves)
      this.particles.render(this.ctx);

      // 6. 100% STATIC ASPHALT STREET ROAD ("sosea jos statica")
      this.scenery.renderGround(this.ctx);

      // 7. Big Classic Score in Center Top During Flight
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

      this.ctx.restore();
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
