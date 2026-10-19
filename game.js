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
      if (this.particles.length > 20) return;
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          type: 'dust',
          x: x - 14 + Math.random() * 6,
          y: y + 8 + Math.random() * 6,
          vx: -25 - Math.random() * 25,
          vy: -8 + Math.random() * 16,
          radius: 2.5 + Math.random() * 2.5,
          alpha: 0.5,
          life: 0.28
        });
      }

      if (Math.random() < 0.45) {
        this.particles.push({
          type: 'feather',
          x: x - 18,
          y: y + 4,
          vx: -30 - Math.random() * 20,
          vy: 10 + Math.random() * 18,
          rot: Math.random() * Math.PI,
          rotSpeed: 2.5 + Math.random() * 3,
          w: 6.5,
          h: 3.5,
          alpha: 0.75,
          life: 0.6
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
      this.gravity = 920;         // Lină, plăcută și predictibilă
      this.jumpVelocity = -320;   // Salt precis, fluid și confortabil
      this.diveVelocity = 480;
      this.rotation = 0;
      this.targetRotation = 0;
      this.radius = 21;           // Rază grafică
      this.hitboxRadius = 14;     // Hitbox corect, precis și iertător

      this.scaleX = 1.0;
      this.scaleY = 1.0;

      this.flightTime = 0;
      this.wingAngle = 0;
    }

    flap() {
      this.vy = this.jumpVelocity;
      // Răspuns instantaneu la atingere: capul se orientează fluid în sus
      this.rotation = -0.34;
      this.targetRotation = -0.34;
      // Animație organică squash & stretch fără deformarea logo-ului MESO
      this.scaleX = 0.95;
      this.scaleY = 1.07;
    }

    quickDive() {
      this.vy = this.diveVelocity;
      this.targetRotation = 0.85;
      this.scaleX = 1.07;
      this.scaleY = 0.93;
    }

    reset() {
      this.x = 100;
      this.y = 280;
      this.vy = 0;
      this.rotation = 0;
      this.targetRotation = 0;
      this.scaleX = 1.0;
      this.scaleY = 1.0;
      this.wingAngle = 0;
    }

    update(dt) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      this.flightTime += dt;

      // Orientare aerodinamică continuă și ultra-fluidă
      if (this.vy < 0) {
        this.targetRotation = -0.34;
        this.rotation += (this.targetRotation - this.rotation) * Math.min(1, dt * 14);
      } else {
        // În faza de coborâre, înclinare lină înainte
        const fallFactor = Math.min(1.0, Math.max(0, this.vy - 40) / 400);
        this.targetRotation = -0.15 + fallFactor * 1.30;
        this.rotation += (this.targetRotation - this.rotation) * Math.min(1, dt * 9.5);
      }

      // Revenire elastică, organică a proporțiilor
      this.scaleX += (1.0 - this.scaleX) * Math.min(1, dt * 12);
      this.scaleY += (1.0 - this.scaleY) * Math.min(1, dt * 12);
    }

    render(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // 1. Umbră dinamică discretă proiectată pe șosea când pasărea e aproape de sol
      if (this.y > GROUND_Y - 140) {
        const distToGround = GROUND_Y - this.y;
        const shadowAlpha = Math.max(0, (1 - distToGround / 140) * 0.24);
        const shadowScale = Math.max(0.45, 1.0 - (distToGround / 140) * 0.45);
        ctx.save();
        ctx.translate(0, distToGround + 4);
        ctx.scale(shadowScale, shadowScale * 0.28);
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Rotație și scalare animate
      ctx.rotate(this.rotation);
      ctx.scale(this.scaleX, this.scaleY);

      if (this.image && this.image.complete && this.image.naturalWidth > 0) {
        const w = 54;
        const h = 50;

        // Umbră fină ambientală pentru claritate și profunzime premium
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.drawImage(this.image, -w / 2, -h / 2, w, h);
        ctx.restore();

      } else {
        // Fallback vectorial de înaltă rezoluție
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
      this.collarW = 76;   // Overhangs 5px on each side
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

      // 1. Shaft (Clean Vertical Cylinder with 3D Specular Highlight)
      this.draw3DCylinder(ctx, x, 0, this.width, shaftH);

      // 2. 3D Overhang Cast Shadow above collar onto shaft
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
      ctx.fillRect(x, collarY - 6, this.width, 6);

      // 3. Collar Lip (Rounded 3D Head at opening)
      const cx = x - (this.collarW - this.width) / 2;
      this.draw3DCollar(ctx, cx, collarY, this.collarW, this.collarH, true);

      // 4. 3D Hollow Opening Rim at bottom of top pipe
      ctx.fillStyle = '#0a1e0b';
      ctx.beginPath();
      ctx.ellipse(x + this.width / 2, bottomY, this.collarW / 2 - 4, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#061307';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.restore();
    }

    drawBottomPipe(ctx, x, topY) {
      const totalH = GROUND_Y - topY;
      if (totalH <= 4) return;
      ctx.save();

      const collarY = topY;
      const shaftY = topY + this.collarH;
      const shaftH = Math.max(0, GROUND_Y - shaftY);

      // 1. Shaft (Clean Vertical Cylinder)
      this.draw3DCylinder(ctx, x, shaftY, this.width, shaftH);

      // 2. 3D Overhang Cast Shadow from collar onto shaft below
      ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
      ctx.fillRect(x, shaftY, this.width, 8);

      // 3. Collar Lip (Rounded 3D Head at top of pipe)
      const cx = x - (this.collarW - this.width) / 2;
      this.draw3DCollar(ctx, cx, collarY, this.collarW, this.collarH, false);

      // 4. 3D Hollow Opening Rim at top of bottom pipe
      ctx.fillStyle = '#0a1e0b';
      ctx.beginPath();
      ctx.ellipse(x + this.width / 2, topY, this.collarW / 2 - 4, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#061307';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.restore();
    }

    draw3DCylinder(ctx, x, y, w, h) {
      if (h <= 0) return;
      ctx.save();
      ctx.translate(x, y);

      // Classic Flappy Base Green
      ctx.fillStyle = '#48b824';
      ctx.fillRect(0, 0, w, h);

      // 3D Left specular highlight streak
      ctx.fillStyle = '#8eee38';
      ctx.fillRect(4, 0, 14, h);

      // Specular bright center beam
      ctx.fillStyle = '#bdf768';
      ctx.fillRect(8, 0, 5, h);

      // 3D Right cylinder curvature shadow
      ctx.fillStyle = '#267014';
      ctx.fillRect(w - 20, 0, 20, h);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.fillRect(w - 9, 0, 9, h);

      // Clean arcade outer border
      ctx.strokeStyle = '#11350a';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(0, 0, w, h);

      ctx.restore();
    }

    draw3DCollar(ctx, x, y, w, h, isTopPipe = false) {
      ctx.save();
      ctx.translate(x, y);

      const rad = 6.5;
      const radii = isTopPipe ? [3, 3, rad, rad] : [rad, rad, 3, 3];

      // Collar Base Green
      ctx.fillStyle = '#56c22c';
      drawRoundRect(ctx, 0, 0, w, h, radii);
      ctx.fill();

      // 3D Lighting clipped to rounded collar
      ctx.save();
      drawRoundRect(ctx, 0, 0, w, h, radii);
      ctx.clip();

      // 3D Left specular highlight streak
      ctx.fillStyle = '#9cf554';
      ctx.fillRect(5, 0, 16, h);
      ctx.fillStyle = '#c8ff8e';
      ctx.fillRect(9, 0, 6, h);

      // 3D Right shadow
      ctx.fillStyle = '#267014';
      ctx.fillRect(w - 22, 0, 22, h);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(w - 10, 0, 10, h);

      // Top bevel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(0, 0, w, 2.5);

      // Bottom bevel shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, h - 3, w, 3);

      ctx.restore(); // restore clip

      // Clean arcade outer border
      ctx.strokeStyle = '#11350a';
      ctx.lineWidth = 2.5;
      drawRoundRect(ctx, 0, 0, w, h, radii);
      ctx.stroke();

      ctx.restore();
    }

    checkCollision(bird) {
      const topBottom = this.gapY - this.gapSize / 2;
      const bottomTop = this.gapY + this.gapSize / 2;
      const r = bird.hitboxRadius || 14;

      // Margine de toleranță corectă pentru buza tubului (collar overhang)
      const left = this.x - 5;
      const right = this.x + this.width + 5;

      if (bird.x + r > left + 2.5 && bird.x - r < right - 2.5) {
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
      this.width = 184;
      this.height = 50;
      this.y = GROUND_Y - 58; // Exactly above the curb as drawn by user
    }

    update(dt, speed) {
      this.x -= speed * dt;
    }

    render(ctx) {
      ctx.save();

      // 1. Double Galvanized Steel Support Posts anchored into the road curb
      const postW = 5;
      const post1X = this.x + 24;
      const post2X = this.x + this.width - 24;
      const postTop = this.y + 16;
      const postBottom = GROUND_Y + 12;

      [post1X, post2X].forEach(px => {
        // Cast shadow behind post
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.fillRect(px + 2, postTop, postW + 1, postBottom - postTop);

        // Metallic galvanized steel post
        const postGrad = ctx.createLinearGradient(px, 0, px + postW, 0);
        postGrad.addColorStop(0, '#94a3b8');
        postGrad.addColorStop(0.35, '#f8fafc');
        postGrad.addColorStop(1, '#475569');
        ctx.fillStyle = postGrad;
        ctx.fillRect(px, postTop, postW, postBottom - postTop);

        // Mounting clamp bolts on post
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 1, this.y + 18, postW + 2, 3);
        ctx.fillRect(px - 1, this.y + 36, postW + 2, 3);

        // Base flange anchored into the road curb
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px - 3, GROUND_Y - 1, postW + 6, 3);
      });

      // 2. 3D Cast Shadow from signboard onto road & curb
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      drawRoundRect(ctx, this.x + 4, this.y + 5, this.width, this.height, 8);
      ctx.fill();

      // 3. Road Signboard Body (European Highway Town Entrance Placard)
      const plateGrad = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
      plateGrad.addColorStop(0, '#15572e');
      plateGrad.addColorStop(0.5, '#0e3d20');
      plateGrad.addColorStop(1, '#082914');
      ctx.fillStyle = plateGrad;
      drawRoundRect(ctx, this.x, this.y, this.width, this.height, 8);
      ctx.fill();

      // Reflective Highway Gold Border
      ctx.strokeStyle = '#ffd60a';
      ctx.lineWidth = 2.5;
      drawRoundRect(ctx, this.x, this.y, this.width, this.height, 8);
      ctx.stroke();

      // Inner Reflective White Pin-stripe
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.0;
      drawRoundRect(ctx, this.x + 3.5, this.y + 3.5, this.width - 7, this.height - 7, 5.5);
      ctx.stroke();

      // 4. Header: "📍 BINE AȚI VENIT • #... MESO"
      ctx.fillStyle = '#ffc300';
      ctx.font = 'bold 8.5px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`📍 BINE AȚI VENIT • #${this.locIdx + 1} MESO`, this.x + this.width / 2, this.y + 15);

      // 5. Restaurant Location Name ("scrie pe placuta locatia")
      ctx.fillStyle = '#ffffff';
      let fontSize = 12.5;
      ctx.font = `bold ${fontSize}px "Lilita One", "Titan One", "Outfit", sans-serif`;
      const maxW = this.width - 18;
      let text = this.displayName;
      while (fontSize > 8.5 && ctx.measureText(text).width > maxW) {
        fontSize -= 0.5;
        ctx.font = `bold ${fontSize}px "Lilita One", "Titan One", "Outfit", sans-serif`;
      }
      ctx.fillText(text, this.x + this.width / 2, this.y + 34);

      // 6. Corner Reflective Rivets
      [
        [this.x + 6, this.y + 6],
        [this.x + this.width - 6, this.y + 6],
        [this.x + 6, this.y + this.height - 6],
        [this.x + this.width - 6, this.y + this.height - 6]
      ].forEach(([rx, ry]) => {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(rx, ry, 1.4, 0, Math.PI * 2);
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
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', 0, 0);
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
      this.groundOffset = 0;
      this.lightsWave = 0;
      this.sunRotation = 0;

      // Time of Day: 0.0 = Day (Zi), 0.33 = Sunset (Apus), 0.65 = Festive Night (Noapte), 0.88 = Dawn (Răsărit)
      this.timeOfDay = 0.0;

      // Caching offscreen pentru performanță extremă (zero lag, 120 FPS constant)
      this.farWrap = 520;
      this.nearWrap = 560;
      this.lastSkylineUpdate = -999;
      this.initSkylineCanvases();

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

    initSkylineCanvases() {
      this.farCanvas = document.createElement('canvas');
      this.farCanvas.width = this.farWrap;
      this.farCanvas.height = GROUND_Y;
      this.farCtx = this.farCanvas.getContext('2d');

      this.nearCanvas = document.createElement('canvas');
      this.nearCanvas.width = this.nearWrap;
      this.nearCanvas.height = GROUND_Y;
      this.nearCtx = this.nearCanvas.getContext('2d');
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

      // 3D Parallax Skyline Speeds: Far (0.08x) and Near (0.22x)
      this.farSkylineX -= speed * 0.08 * dt;
      if (this.farSkylineX < -this.farWrap) this.farSkylineX += this.farWrap;

      this.nearSkylineX -= speed * 0.22 * dt;
      if (this.nearSkylineX < -this.nearWrap) this.nearSkylineX += this.nearWrap;

      // "drumul de jos in miscare" - Road offset scrolling at 100% true flight speed!
      this.groundOffset = (this.groundOffset + speed * dt) % 64;
      this.lightsWave += dt * 2.2;

      // Reconstrucție inteligentă a cache-ului de skyline doar când lumina zilei se schimbă
      if (Math.abs(this.timeOfDay - this.lastSkylineUpdate) > 0.012) {
        this.buildSkylineCaches(this.getCycleState());
      }

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
        buildingColor: lerpArr(kf1.buildingColor, kf2.buildingColor, localT)
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

    buildSkylineCaches(state) {
      if (!this.farCtx || !this.nearCtx) return;
      this.lastSkylineUpdate = this.timeOfDay;

      const baseR = (Array.isArray(state.buildingColor) ? state.buildingColor[0] : 82) || 82;
      const baseG = (Array.isArray(state.buildingColor) ? state.buildingColor[1] : 98) || 98;
      const baseB = (Array.isArray(state.buildingColor) ? state.buildingColor[2] : 122) || 122;

      const isNight = state.windowGlowAlpha > 0.42;
      const isSunset = state.lightsGlowAlpha > 0.25;

      const trimColor = `rgba(255, 255, 255, ${0.22 + state.lightsGlowAlpha * 0.35})`;
      const goldTrim = `rgba(255, 214, 10, ${0.48 + state.lightsGlowAlpha * 0.52})`;

      const makeBuildingGrad = (targetCtx, y, topR, topG, topB, botR, botG, botB) => {
        const grad = targetCtx.createLinearGradient(0, y, 0, GROUND_Y);
        grad.addColorStop(0, `rgb(${Math.round(topR)}, ${Math.round(topG)}, ${Math.round(topB)})`);
        grad.addColorStop(1, `rgb(${Math.round(botR)}, ${Math.round(botG)}, ${Math.round(botB)})`);
        return grad;
      };

      // ==========================================
      // 1. FAR SKYLINE OFFSCREEN CACHE (Width: 520, Height: GROUND_Y)
      // Clădiri moderne, curate, arhitecturale - FĂRĂ ANTENE, FĂRĂ STÂLPI
      // ==========================================
      const fctx = this.farCtx;
      fctx.clearRect(0, 0, this.farWrap, GROUND_Y);

      const farAlpha = 0.58 + state.windowGlowAlpha * 0.22;
      const farR = Math.min(255, Math.round(baseR * 0.72 + 38));
      const farG = Math.min(255, Math.round(baseG * 0.72 + 45));
      const farB = Math.min(255, Math.round(baseB * 0.72 + 62));
      const farColor = `rgba(${farR}, ${farG}, ${farB}, ${farAlpha})`;
      const farDarkColor = `rgba(${Math.round(farR * 0.82)}, ${Math.round(farG * 0.82)}, ${Math.round(farB * 0.85)}, ${farAlpha})`;

      fctx.fillStyle = farColor;

      // Far 1: Turn modern cu terasă retrasă (x: 10, w: 46, y: 310)
      fctx.fillRect(10, 310, 46, GROUND_Y - 310);
      fctx.fillStyle = farDarkColor;
      fctx.fillRect(18, 290, 30, 20); // Etaj tehnic retras minimalist
      fctx.fillStyle = farColor;

      // Far 2: Zgârie-nori în trepte elegante (x: 68, w: 52, y: 285)
      fctx.fillRect(68, 335, 52, GROUND_Y - 335);
      fctx.fillRect(76, 310, 36, 25);
      fctx.fillRect(84, 285, 20, 25); // Coroană geometrică curată (fără ac/antenă)

      // Far 3: Clădire cu acoperiș oblic din sticlă (x: 132, w: 56, y: 295)
      fctx.beginPath();
      fctx.moveTo(132, GROUND_Y);
      fctx.lineTo(132, 330);
      fctx.lineTo(188, 295);
      fctx.lineTo(188, GROUND_Y);
      fctx.closePath();
      fctx.fill();

      // Far 4: Bloc modern înalt (x: 202, w: 66, y: 312)
      fctx.fillRect(202, 320, 66, GROUND_Y - 320);
      fctx.fillStyle = farDarkColor;
      fctx.fillRect(218, 306, 34, 14); // Pavilion terasă plat
      fctx.fillStyle = farColor;

      // Far 5: Obelisc contemporan din sticlă (x: 282, w: 52, y: 280)
      fctx.fillRect(282, 315, 52, GROUND_Y - 315);
      fctx.beginPath();
      fctx.moveTo(282, 315);
      fctx.lineTo(308, 280);
      fctx.lineTo(334, 315);
      fctx.closePath();
      fctx.fill();

      // Far 6: Turnuri gemene metropolitane cu pod panoramic (x: 348, w: 72, y: 310)
      fctx.fillRect(348, 325, 28, GROUND_Y - 325);
      fctx.fillRect(384, 310, 30, GROUND_Y - 310);
      fctx.fillStyle = isNight ? 'rgba(255, 240, 138, 0.55)' : farDarkColor;
      fctx.fillRect(374, 335, 12, 16); // Skybridge
      fctx.fillStyle = farColor;

      // Far 7: Sediul corporativ cu terasă verde (x: 432, w: 76, y: 330)
      fctx.fillRect(432, 335, 76, GROUND_Y - 335);
      fctx.fillStyle = farDarkColor;
      fctx.fillRect(448, 322, 44, 13);
      fctx.fillStyle = farColor;

      // Ferestre de fundal (micro-luminițe discrete)
      if (state.windowGlowAlpha > 0.18) {
        fctx.fillStyle = isNight ? 'rgba(254, 240, 138, 0.48)' : 'rgba(186, 230, 253, 0.35)';
        const farWins = [
          [20, 325], [26, 345], [32, 365], [38, 385],
          [78, 345], [86, 355], [92, 375], [100, 395],
          [144, 335], [154, 355], [166, 375], [176, 395],
          [212, 332], [226, 346], [242, 360], [254, 376],
          [294, 330], [306, 350], [318, 370],
          [356, 345], [362, 368], [392, 330], [398, 352],
          [446, 350], [462, 368], [478, 385], [492, 365]
        ];
        farWins.forEach(([wx, wy]) => {
          fctx.fillRect(wx, wy, 2.5, 3.5);
        });
      }

      // ==========================================
      // 2. NEAR SKYLINE OFFSCREEN CACHE (Width: 560, Height: GROUND_Y)
      // Clădiri 3D masive, fațade din sticlă, terase elegante - FĂRĂ ANTENE!
      // ==========================================
      const nctx = this.nearCtx;
      nctx.clearRect(0, 0, this.nearWrap, GROUND_Y);

      // -------------------------------------------------------------
      // TOWER 1: Corporate Glass Apex (x: 12, w: 72, y: 310, depth: 16)
      // Coroană modernă oblică din sticlă + Sky-Lounge (Fără antenă)
      // -------------------------------------------------------------
      const t1X = 12, t1Y = 310, t1W = 72, t1D = 16, t1Slope = 14;
      const t1Grad = makeBuildingGrad(nctx, t1Y, baseR + 8, baseG + 14, baseB + 28, baseR * 0.65, baseG * 0.65, baseB * 0.72);
      const t1DGrad = makeBuildingGrad(nctx, t1Y - t1Slope, baseR * 0.55, baseG * 0.58, baseB * 0.68, baseR * 0.35, baseG * 0.35, baseB * 0.42);

      // Fațadă principală cu unghi arhitectural
      nctx.fillStyle = t1Grad;
      nctx.beginPath();
      nctx.moveTo(t1X, GROUND_Y);
      nctx.lineTo(t1X, t1Y + t1Slope);
      nctx.lineTo(t1X + t1W, t1Y);
      nctx.lineTo(t1X + t1W, GROUND_Y);
      nctx.closePath();
      nctx.fill();

      // Fațetă 3D laterală
      nctx.fillStyle = t1DGrad;
      nctx.beginPath();
      nctx.moveTo(t1X + t1W, t1Y);
      nctx.lineTo(t1X + t1W + t1D, t1Y - 7);
      nctx.lineTo(t1X + t1W + t1D, GROUND_Y);
      nctx.lineTo(t1X + t1W, GROUND_Y);
      nctx.closePath();
      nctx.fill();

      // Linie de contur elegantă din sticlă
      nctx.strokeStyle = trimColor;
      nctx.lineWidth = 2.4;
      nctx.beginPath();
      nctx.moveTo(t1X, t1Y + t1Slope);
      nctx.lineTo(t1X + t1W, t1Y);
      nctx.stroke();

      // Penthouse Sky-Lounge pe acoperiș
      nctx.fillStyle = isNight ? 'rgba(147, 197, 253, 0.45)' : 'rgba(255, 255, 255, 0.35)';
      nctx.fillRect(t1X + 16, t1Y + 3, t1W - 24, 10);
      nctx.fillStyle = trimColor;
      nctx.fillRect(t1X + 16, t1Y + 3, t1W - 24, 1.8);

      // Ferestre
      this.renderBuildingWindows(nctx, t1X + 8, t1Y + 22, t1W - 16, GROUND_Y - t1Y - 32, 2, 7, state, 1);

      // -------------------------------------------------------------
      // TOWER 2: Art-Deco Stepped Skyscraper (x: 104, w: 86, depth: 16)
      // 3 Trepte Maiestuoase + Cornișe Aurii + Vârf Arhitectural Deco (Fără ac)
      // -------------------------------------------------------------
      const t2X = 104, t2D = 16;
      const t2Grad = makeBuildingGrad(nctx, 250, baseR + 14, baseG + 10, baseB + 18, baseR * 0.6, baseG * 0.58, baseB * 0.65);
      const t2DGrad = makeBuildingGrad(nctx, 245, baseR * 0.5, baseG * 0.45, baseB * 0.55, baseR * 0.3, baseG * 0.28, baseB * 0.35);

      // Nivel 1 (Baza)
      nctx.fillStyle = t2Grad;
      nctx.fillRect(t2X, 350, 86, GROUND_Y - 350 + 5);
      nctx.fillStyle = t2DGrad;
      nctx.beginPath();
      nctx.moveTo(t2X + 86, 350);
      nctx.lineTo(t2X + 86 + t2D, 343);
      nctx.lineTo(t2X + 86 + t2D, GROUND_Y);
      nctx.lineTo(t2X + 86, GROUND_Y);
      nctx.closePath();
      nctx.fill();
      nctx.fillStyle = goldTrim;
      nctx.fillRect(t2X, 350, 86, 3);

      // Nivel 2 (Mijloc)
      nctx.fillStyle = t2Grad;
      nctx.fillRect(t2X + 13, 295, 60, 55);
      nctx.fillStyle = t2DGrad;
      nctx.beginPath();
      nctx.moveTo(t2X + 73, 295);
      nctx.lineTo(t2X + 73 + 12, 289);
      nctx.lineTo(t2X + 73 + 12, 350);
      nctx.lineTo(t2X + 73, 350);
      nctx.closePath();
      nctx.fill();
      nctx.fillStyle = goldTrim;
      nctx.fillRect(t2X + 13, 295, 60, 3);

      // Nivel 3 (Vârf geometric Art-Deco)
      nctx.fillStyle = t2Grad;
      nctx.fillRect(t2X + 25, 250, 36, 45);
      nctx.fillStyle = t2DGrad;
      nctx.beginPath();
      nctx.moveTo(t2X + 61, 250);
      nctx.lineTo(t2X + 61 + 9, 245);
      nctx.lineTo(t2X + 61 + 9, 295);
      nctx.lineTo(t2X + 61, 295);
      nctx.closePath();
      nctx.fill();
      nctx.fillStyle = goldTrim;
      nctx.fillRect(t2X + 25, 250, 36, 3.5);

      // Coroană decorativă aurie Art-Deco (înlocuiește vechiul ac/antenă)
      nctx.fillStyle = goldTrim;
      nctx.fillRect(t2X + 29, 242, 28, 8);
      nctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      nctx.fillRect(t2X + 31, 242, 24, 2);
      for (let f = 0; f < 4; f++) {
        nctx.fillStyle = '#ffc300';
        nctx.fillRect(t2X + 33 + f * 6, 244, 2.5, 6);
      }

      // Ferestre
      this.renderBuildingWindows(nctx, t2X + 8, 360, 70, GROUND_Y - 370, 3, 6, state, 2);
      this.renderBuildingWindows(nctx, t2X + 20, 305, 46, 40, 2, 2, state, 7);

      // -------------------------------------------------------------
      // TOWER 3: High-Tech Glass Tower & Sky-Terrace (x: 208, w: 68, y: 335)
      // -------------------------------------------------------------
      const t3X = 208, t3Y = 335, t3W = 68, t3D = 14;
      const t3Grad = makeBuildingGrad(nctx, t3Y, baseR + 2, baseG + 8, baseB + 20, baseR * 0.6, baseG * 0.62, baseB * 0.7);
      const t3DGrad = makeBuildingGrad(nctx, t3Y, baseR * 0.48, baseG * 0.52, baseB * 0.6, baseR * 0.32, baseG * 0.34, baseB * 0.4);

      nctx.fillStyle = t3Grad;
      nctx.fillRect(t3X, t3Y, t3W, GROUND_Y - t3Y + 5);
      nctx.fillStyle = t3DGrad;
      nctx.beginPath();
      nctx.moveTo(t3X + t3W, t3Y);
      nctx.lineTo(t3X + t3W + t3D, t3Y - 6);
      nctx.lineTo(t3X + t3W + t3D, GROUND_Y);
      nctx.lineTo(t3X + t3W, GROUND_Y);
      nctx.closePath();
      nctx.fill();
      nctx.fillStyle = trimColor;
      nctx.fillRect(t3X, t3Y, t3W, 3);

      // Terasă modernă panoramică și spațiu tehnic elegant pe acoperiș
      nctx.fillStyle = isNight ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.4)';
      nctx.fillRect(t3X + 12, t3Y - 14, t3W - 24, 14);
      nctx.fillStyle = trimColor;
      nctx.fillRect(t3X + 12, t3Y - 14, t3W - 24, 2);
      nctx.fillStyle = '#334155';
      nctx.fillRect(t3X + 18, t3Y - 10, 14, 10);

      this.renderBuildingWindows(nctx, t3X + 8, t3Y + 12, t3W - 16, GROUND_Y - t3Y - 20, 2, 6, state, 3);

      // -------------------------------------------------------------
      // TOWER 4: Grand Meso 16 Ani Celebration Plaza Tower (x: 294, w: 88, y: 280)
      // Pavilion de sărbătoare iluminat cu sigla MESO 16 (FĂRĂ ANTENE!)
      // -------------------------------------------------------------
      const t4X = 294, t4Y = 280, t4W = 88, t4D = 16;
      const t4Grad = makeBuildingGrad(nctx, t4Y, baseR + 10, baseG + 22, baseB + 16, baseR * 0.58, baseG * 0.65, baseB * 0.62);
      const t4DGrad = makeBuildingGrad(nctx, t4Y, baseR * 0.45, baseG * 0.55, baseB * 0.52, baseR * 0.3, baseG * 0.38, baseB * 0.35);

      nctx.fillStyle = t4Grad;
      nctx.fillRect(t4X, t4Y, t4W, GROUND_Y - t4Y + 5);
      nctx.fillStyle = t4DGrad;
      nctx.beginPath();
      nctx.moveTo(t4X + t4W, t4Y);
      nctx.lineTo(t4X + t4W + t4D, t4Y - 8);
      nctx.lineTo(t4X + t4W + t4D, GROUND_Y);
      nctx.lineTo(t4X + t4W, GROUND_Y);
      nctx.closePath();
      nctx.fill();

      // Cornișă dublă aurie
      nctx.fillStyle = goldTrim;
      nctx.fillRect(t4X, t4Y, t4W, 4);
      nctx.fillStyle = trimColor;
      nctx.fillRect(t4X + 4, t4Y - 4, t4W - 8, 4);

      // Pavilion aniversar iluminat "MESO 16"
      const crownAlpha = 0.65 + state.lightsGlowAlpha * 0.35;
      nctx.fillStyle = `rgba(255, 195, 0, ${crownAlpha})`;
      nctx.fillRect(t4X + t4W / 2 - 24, t4Y - 16, 48, 12);
      nctx.fillStyle = '#ffffff';
      nctx.font = 'bold 8.5px "Outfit", sans-serif';
      nctx.textAlign = 'center';
      nctx.fillText('MESO 16', t4X + t4W / 2, t4Y - 7);
      nctx.strokeStyle = '#ffe066';
      nctx.lineWidth = 1.4;
      nctx.strokeRect(t4X + t4W / 2 - 24, t4Y - 16, 48, 12);

      this.renderBuildingWindows(nctx, t4X + 8, t4Y + 14, t4W - 16, GROUND_Y - t4Y - 22, 3, 8, state, 4);

      // -------------------------------------------------------------
      // TOWER 5: Metro High-Rise cu Balcoane (x: 402, w: 66, y: 335)
      // -------------------------------------------------------------
      const t5X = 402, t5Y = 335, t5W = 66, t5D = 14;
      const t5Grad = makeBuildingGrad(nctx, t5Y, baseR + 6, baseG + 8, baseB + 14, baseR * 0.62, baseG * 0.62, baseB * 0.68);
      const t5DGrad = makeBuildingGrad(nctx, t5Y, baseR * 0.5, baseG * 0.5, baseB * 0.55, baseR * 0.32, baseG * 0.32, baseB * 0.38);

      nctx.fillStyle = t5Grad;
      nctx.fillRect(t5X, t5Y, t5W, GROUND_Y - t5Y + 5);
      nctx.fillStyle = t5DGrad;
      nctx.beginPath();
      nctx.moveTo(t5X + t5W, t5Y);
      nctx.lineTo(t5X + t5W + t5D, t5Y - 6);
      nctx.lineTo(t5X + t5W + t5D, GROUND_Y);
      nctx.lineTo(t5X + t5W, GROUND_Y);
      nctx.closePath();
      nctx.fill();
      nctx.fillStyle = trimColor;
      nctx.fillRect(t5X, t5Y, t5W, 3);

      // Penthouse cu terasă retrasă
      nctx.fillStyle = t5Grad;
      nctx.fillRect(t5X + 14, t5Y - 14, 38, 14);
      nctx.fillStyle = trimColor;
      nctx.fillRect(t5X + 14, t5Y - 14, 38, 2);

      this.renderBuildingWindows(nctx, t5X + 8, t5Y + 12, t5W - 16, GROUND_Y - t5Y - 18, 2, 6, state, 5);

      // -------------------------------------------------------------
      // TOWER 6: Monolit contemporan unghiular (x: 484, w: 64, y: 320)
      // -------------------------------------------------------------
      const t6X = 484, t6Y = 320, t6W = 64, t6D = 12;
      const t6Grad = makeBuildingGrad(nctx, t6Y, baseR + 10, baseG + 16, baseB + 30, baseR * 0.65, baseG * 0.68, baseB * 0.75);
      const t6DGrad = makeBuildingGrad(nctx, t6Y, baseR * 0.52, baseG * 0.55, baseB * 0.62, baseR * 0.34, baseG * 0.36, baseB * 0.42);

      nctx.fillStyle = t6Grad;
      nctx.fillRect(t6X, t6Y, t6W, GROUND_Y - t6Y + 5);
      nctx.fillStyle = t6DGrad;
      nctx.beginPath();
      nctx.moveTo(t6X + t6W, t6Y);
      nctx.lineTo(t6X + t6W + t6D, t6Y - 7);
      nctx.lineTo(t6X + t6W + t6D, GROUND_Y);
      nctx.lineTo(t6X + t6W, GROUND_Y);
      nctx.closePath();
      nctx.fill();
      nctx.fillStyle = trimColor;
      nctx.fillRect(t6X, t6Y, t6W, 3);

      // Coroană beveled modernă (fără antenă)
      nctx.fillStyle = t6Grad;
      nctx.fillRect(t6X + 12, t6Y - 12, t6W - 24, 12);
      nctx.fillStyle = trimColor;
      nctx.fillRect(t6X + 12, t6Y - 12, t6W - 24, 2);

      this.renderBuildingWindows(nctx, t6X + 8, t6Y + 12, t6W - 16, GROUND_Y - t6Y - 20, 2, 7, state, 6);
    }

    render3DSkyline(ctx, state) {
      if (!this.farCanvas || !this.nearCanvas) return;

      // LAYER 1: FAR DISTANT MEGACITY SKYLINE (Parallax 0.08x)
      const fWrap = this.farWrap;
      let fx = ((this.farSkylineX % fWrap) + fWrap) % fWrap;
      for (let x = fx - fWrap; x < V_WIDTH + fWrap; x += fWrap) {
        ctx.drawImage(this.farCanvas, x, 0);
      }

      // LAYER 2: NEAR ARCHITECTURAL 3D CITY TOWERS (Parallax 0.22x)
      const nWrap = this.nearWrap;
      let nx = ((this.nearSkylineX % nWrap) + nWrap) % nWrap;
      for (let x = nx - nWrap; x < V_WIDTH + nWrap; x += nWrap) {
        ctx.drawImage(this.nearCanvas, x, 0);
      }
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

      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
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
        if (e.repeat) return; // Previne salturile repetitive necontrolate la ținerea apăsată a tastei
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

    // "sa fie din 5 in 5"
    triggerLocationUnlock(score) {
      const locIdx = Math.floor(score / 5);
      this.triggerLocationUnlockByIndex(locIdx);
    }

    // "dar sa nu fie exact pe mijlocuil tevi"
    // Calculeaza coordonata X astfel incat pancarda sa fie mereu in spatiul liber dintre tuburi, NICIODATA sub o teava!
    spawnRoadSign(locIdx) {
      const signW = 184;
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
        localStorage.setItem('meso_last_score', this.score.toString());
        localStorage.setItem('meso_last_doners', this.donerCount.toString());
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

        // Moarte la sol precisă, sincronizată cu atingerea bordurii
        if (this.bird.y + this.bird.hitboxRadius >= GROUND_Y - 4) {
          this.gameOver();
          return;
        }

        // Tavan elastic: nu oprește brusc pasărea ci amortizează lin
        if (this.bird.y - this.bird.radius <= 0) {
          this.bird.y = this.bird.radius;
          this.bird.vy = Math.max(0, this.bird.vy * 0.1);
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

            // "sa fie din 5 in 5"
            // "dar sa nu fie exact pe mijlocuil tevi" -> spawnRoadSign o plaseaza mereu la jumatatea distantei dintre tuburi!
            if (this.score > 0 && this.score % 5 === 0) {
              const locIdx = Math.floor(this.score / 5);
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
        // Pasărea plutește relaxat și fluid pe ecranul principal
        this.bird.x = 200;
        this.bird.y = 250 + Math.sin(now * 0.0035) * 9;
        this.bird.rotation = Math.sin(now * 0.0035) * 0.08;
        this.bird.scaleX = 1.0;
        this.bird.scaleY = 1.0;

        // Începe pe timp de zi senină
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
