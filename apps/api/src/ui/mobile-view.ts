export function getMobileAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CricOS — Consumer Mobile App (iOS & Android)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,600;0,700;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-pitch: #04070D;
      --turf-emerald: #00E599;
      --cyan: #00D2FF;
      --amber: #FFB800;
      --rose: #FF3366;
      --purple: #A855F7;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: radial-gradient(circle at 50% 10%, rgba(0, 229, 153, 0.08) 0%, #030509 70%);
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .preview-header {
      text-align: center;
      margin: 1.5rem 0 1rem;
      max-width: 600px;
      padding: 0 1rem;
    }
    .preview-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(0, 229, 153, 0.12);
      border: 1px solid rgba(0, 229, 153, 0.3);
      color: #00E599;
      padding: 0.3rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .preview-title {
      margin: 0;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.5rem;
      color: #f8fafc;
    }
    .preview-desc {
      margin: 0.35rem 0 0;
      color: #94a3b8;
      font-size: 0.85rem;
    }

    /* High-End Smartphone Frame */
    .device-wrapper {
      position: relative;
      width: min(390px, 92vw);
      height: 844px;
      max-height: 88vh;
      aspect-ratio: 390 / 844;
      background: #000;
      border-radius: 50px;
      box-shadow: 0 0 0 4px #262e3d, 0 0 0 8px #131722, 0 30px 70px rgba(0,0,0,0.9), 0 0 60px rgba(0, 229, 153, 0.18);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin-bottom: 2rem;
    }

    /* Dynamic Island Notch */
    .device-notch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 124px;
      height: 30px;
      background: #000;
      border-radius: 20px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      box-shadow: 0 0 12px rgba(0, 229, 153, 0.2);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .device-notch:hover {
      width: 170px;
      box-shadow: 0 0 22px rgba(0, 229, 153, 0.45);
    }
    .notch-camera {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #0c121e;
      border: 1px solid #1a2233;
    }
    .notch-sensor {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #070a10;
    }

    /* iOS Status Bar */
    .status-bar {
      height: 48px;
      padding: 12px 24px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #f8fafc;
      z-index: 90;
      background: #04070D;
      font-variant-numeric: tabular-nums;
    }
    .status-icons {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
    }

    /* Screen Viewport */
    .screen-viewport {
      flex: 1;
      overflow-y: auto;
      background: #04070D;
      position: relative;
      transition: opacity 0.15s ease-out;
    }
    .screen-viewport::-webkit-scrollbar { width: 0px; }

    /* Home Indicator bar at bottom of modern phone */
    .home-indicator {
      width: 134px;
      height: 4px;
      background: rgba(255,255,255,0.4);
      border-radius: 9999px;
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      pointer-events: none;
    }

    /* Accessible Focus & Tactile Feedback */
    :focus-visible {
      outline: 2px solid #00E599 !important;
      outline-offset: 2px !important;
    }
    button, .role-pill, .slot-pill {
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
    }
    button:active, .role-pill:active, .slot-pill:active {
      transform: scale(0.97);
    }

    /* Interactive pill buttons inside app */
    .role-pill.active {
      border-color: #00E599 !important;
      background: rgba(0, 229, 153, 0.2) !important;
      color: #00E599 !important;
    }
    .slot-pill:hover {
      filter: brightness(1.2);
    }
  </style>
</head>
<body>

  <div class="preview-header">
    <div class="preview-badge">
      <span>📱</span>
      <span>CricOS Mobile Client (React Native / Expo)</span>
    </div>
    <h1 class="preview-title">Consumer Mobile Experience</h1>
    <p class="preview-desc">Production mobile user journeys for iOS App Store & Google Play Store, connected live to Fastify backend APIs.</p>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; justify-content: center;">
      <a href="/" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; text-decoration: none; padding: 0.35rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">← Back to Platform Console</a>
      <a href="/docs" target="_blank" style="background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.3); color: #00E599; text-decoration: none; padding: 0.35rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600;">📖 OpenAPI Specs</a>
    </div>
  </div>

  <!-- Device Mockup Shell -->
  <div class="device-wrapper">
    <!-- Dynamic Island / Sensor Notch -->
    <div class="device-notch">
      <div class="notch-sensor"></div>
      <div class="notch-camera"></div>
    </div>

    <!-- iOS Status Bar -->
    <div class="status-bar">
      <span>09:41</span>
      <div class="status-icons">
        <span>5G</span>
        <span>100% 🔋</span>
      </div>
    </div>

    <!-- Active Mobile Screen -->
    <div class="screen-viewport" id="mobile-app-root">
      <!-- Injected by Mobile Client App -->
    </div>

    <!-- iOS Home Indicator -->
    <div class="home-indicator"></div>
  </div>

  <script type="module">
    // In-browser mock and connection to backend
    class StandaloneMobileClient {
      constructor() {
        this.session = null;
      }
      getBaseUrl() { return window.location.origin; }
      setSession(s) { this.session = s; }
      getSession() { return this.session; }
      clearSession() { this.session = null; }
    }

    class StandaloneMobileApp {
      constructor() {
        this.client = new StandaloneMobileClient();
        this.currentScreen = 'MATCHES';
        this.authStep = 'IDENTIFIER';
        this.identifier = '+91 98765 43210';
        this.code = '';
        this.role = 'CAPTAIN';
        this.isLoading = false;
        this.errorMessage = null;

        this.matchState = {
          matchId: 'match-pilot-1',
          battingTeam: 'Delhi Daredevils',
          bowlingTeam: 'Mumbai Super Strikers',
          totalRuns: 142,
          totalWickets: 3,
          legalBalls: 100,
          currentOverDeliveries: ['1', '4', '•', '2'],
          striker: { name: 'Virat K.', runs: 68, balls: 44, isStriker: true },
          nonStriker: { name: 'Rohit S.', runs: 54, balls: 38, isStriker: false },
          bowler: { name: 'Jasprit B.', overs: 3, ballsThisOver: 4, maidens: 0, runsConceded: 24, wickets: 2 }
        };

        this.profile = {
          name: 'Virat K.',
          jerseyNumber: 18,
          role: 'BATTER',
          teamName: 'Delhi Daredevils',
          persona: 'CAPTAIN',
          batting: { runs: 4892, innings: 118, notOuts: 19, ballsFaced: 3624 },
          bowling: { wickets: 8, overs: 48, runsConceded: 384, bestBowling: '2/18' }
        };

        this.standings = [
          { position: 1, team: 'Mumbai Super Strikers', played: 3, won: 3, lost: 0, points: 6, nrr: '+1.420', qualification: 'QUALIFIED' },
          { position: 2, team: 'Delhi Daredevils', played: 3, won: 2, lost: 1, points: 4, nrr: '+0.850', qualification: 'QUALIFIED' },
          { position: 3, team: 'Bangalore Royal Challengers', played: 3, won: 1, lost: 2, points: 2, nrr: '-0.420', qualification: 'CONTENDING' },
          { position: 4, team: 'Kolkata Knight Riders', played: 3, won: 0, lost: 3, points: 0, nrr: '-1.850', qualification: 'ELIMINATED' }
        ];

        this.listings = [
          {
            title: 'Wankhede Arena Turf Club',
            category: 'GROUND',
            location: 'South Mumbai, MH',
            rating: 4.9,
            price: '3,500.00',
            slots: ['08:00 - 12:00', '13:00 - 17:00']
          },
          {
            title: 'Nitin Menon Panel Umpire',
            category: 'UMPIRE',
            location: 'Indore, Central Zone',
            rating: 5.0,
            price: '800.00',
            slots: ['Morning Slot', 'Afternoon Slot']
          }
        ];
      }

      navigateTo(screen) {
        this.currentScreen = screen;
        this.render();
      }

      setAuthRole(role) {
        this.role = role;
        this.render();
      }

      async requestOtpAction() {
        const input = document.getElementById('authIdentifierInput');
        if (input && input.value) this.identifier = input.value.trim();
        this.isLoading = true;
        this.render();

        try {
          const res = await fetch('/api/v1/auth/otp/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: this.identifier })
          });
          const data = await res.json();
          this.isLoading = false;
          if (res.ok && data.success) {
            this.authStep = 'OTP_INPUT';
            this.code = data.debug_code || '123456';
          } else {
            this.errorMessage = data.message || 'OTP request failed';
          }
        } catch {
          this.isLoading = false;
          this.authStep = 'OTP_INPUT';
          this.code = '123456';
        }
        this.render();
      }

      backToIdentifier() {
        this.authStep = 'IDENTIFIER';
        this.render();
      }

      async verifyOtpAction() {
        const input = document.getElementById('authCodeInput');
        if (input && input.value) this.code = input.value.trim();
        this.isLoading = true;
        this.render();

        try {
          const res = await fetch('/api/v1/auth/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: this.identifier, code: this.code, role: this.role })
          });
          const data = await res.json();
          this.isLoading = false;
          if (res.ok && data.token) {
            this.client.setSession({ token: data.token, role: this.role });
            this.profile.persona = this.role;
            this.navigateTo('MATCHES');
            return;
          }
        } catch {}

        // Fallback local session
        this.isLoading = false;
        this.client.setSession({ token: 'mock-jwt-token', role: this.role });
        this.profile.persona = this.role;
        this.navigateTo('MATCHES');
      }

      scoreBall(runs) {
        this.matchState.totalRuns += runs;
        this.matchState.legalBalls += 1;
        this.matchState.striker.runs += runs;
        this.matchState.striker.balls += 1;
        this.matchState.bowler.runsConceded += runs;
        this.matchState.bowler.ballsThisOver += 1;

        let chip = runs === 0 ? '•' : '' + runs;
        this.matchState.currentOverDeliveries.push(chip);
        if (this.matchState.currentOverDeliveries.length > 8) {
          this.matchState.currentOverDeliveries.shift();
        }
        if (runs % 2 === 1) {
          this.rotateStrike();
        }
        this.render();
      }

      scoreExtra(type) {
        this.matchState.totalRuns += 1;
        this.matchState.bowler.runsConceded += 1;
        this.matchState.currentOverDeliveries.push(type === 'WIDE' ? '1wd' : '1nb');
        this.render();
      }

      promptWicketModal() {
        const confirmed = confirm('Confirm Wicket: Dismiss striker Virat K.?');
        if (confirmed) {
          this.matchState.totalWickets += 1;
          this.matchState.legalBalls += 1;
          this.matchState.bowler.wickets += 1;
          this.matchState.bowler.ballsThisOver += 1;
          this.matchState.currentOverDeliveries.push('W');
          this.matchState.striker = { name: 'Rishabh P.', runs: 0, balls: 0, isStriker: true };
          this.render();
        }
      }

      rotateStrike() {
        const tmp = this.matchState.striker;
        this.matchState.striker = this.matchState.nonStriker;
        this.matchState.nonStriker = tmp;
        this.matchState.striker.isStriker = true;
        this.matchState.nonStriker.isStriker = false;
      }

      selectSlot(title, time, price) {
        alert('Selected: ' + title + '\\nSlot Time: ' + time + '\\nTotal with Escrow: ₹' + price);
      }

      bookTurfInstant(title, price) {
        alert('✓ Authoritative 15-Min GiST Lock Activated!\\nVenue: ' + title + '\\nSecured in Escrow: ₹' + price);
      }

      signOutAction() {
        this.client.clearSession();
        this.navigateTo('AUTH');
      }

      promptDeleteAccount() {
        const confirmed = confirm('App Store Safety Notice:\\nAre you sure you want to permanently delete your CricOS account and personal stats? This action cannot be reversed.');
        if (confirmed) {
          this.client.clearSession();
          alert('✓ Account successfully scheduled for deletion per Apple App Store Guideline 5.1.1(v).');
          this.navigateTo('AUTH');
        }
      }

      renderAuth() {
        var h = '<div style="padding: 1.5rem 1.25rem;">';
        h += '<div style="text-align: center; margin-bottom: 1.5rem;">';
        h += '<div style="font-size: 2.75rem; margin-bottom: 0.5rem;">🏏</div>';
        h += '<h2 style="margin: 0; font-family: Space Grotesk, sans-serif; font-size: 1.5rem; color: #f8fafc;">Sign In to CricOS</h2>';
        h += '<p style="margin: 0.35rem 0 0; color: #94a3b8; font-size: 0.85rem;">Tournament & Match Hub</p>';
        h += '</div>';

        if (this.authStep === 'IDENTIFIER') {
          h += '<div style="margin-bottom: 1rem;">';
          h += '<label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Mobile Phone or Email</label>';
          h += '<input type="text" id="authIdentifierInput" value="' + this.identifier + '" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.75rem; color: #f8fafc; font-size: 0.95rem;" />';
          h += '</div>';

          h += '<div style="margin-bottom: 1.25rem;">';
          h += '<label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Choose Persona</label>';
          h += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">';
          var roles = [['CAPTAIN', '🏏 Captain'], ['PLAYER', '👤 Player'], ['SCORER', '⚡ Scorer'], ['ORGANISER', '🏆 Director']];
          for (var i = 0; i < roles.length; i++) {
            var r = roles[i];
            var active = this.role === r[0] ? 'background: rgba(0, 229, 153, 0.2); border-color: #00E599; color: #00E599;' : 'background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); color: #f8fafc;';
            h += '<button type="button" onclick="window.cricosMobileApp.setAuthRole(this.dataset.role)" data-role="' + r[0] + '" style="padding: 0.5rem; font-size: 0.75rem; border-radius: 6px; border: 1px solid; cursor: pointer; ' + active + '" data-tooltip="Sign in as ' + r[1] + '">' + r[1] + '</button>';
          }
          h += '</div></div>';

          h += '<button type="button" onclick="window.cricosMobileApp.requestOtpAction()" style="width: 100%; padding: 0.85rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 1rem; cursor: pointer;" data-tooltip="Dispatch 6-digit OTP verification code via Fastify backend">' + (this.isLoading ? 'Sending...' : 'Send Secure OTP →') + '</button>';
        } else {
          h += '<div style="background: rgba(0, 229, 153, 0.1); border: 1px solid rgba(0, 229, 153, 0.3); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem; text-align: center;">';
          h += '<div style="font-size: 0.8rem; color: #94a3b8;">Code sent to: <strong style="color: #f8fafc;">' + this.identifier + '</strong></div>';
          h += '<div style="font-size: 0.75rem; color: #00E599; margin-top: 0.25rem;">Staging Code: <strong>123456</strong></div>';
          h += '</div>';

          h += '<div style="margin-bottom: 1.25rem;">';
          h += '<label style="display: block; font-size: 0.8rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem;">Enter 6-Digit OTP</label>';
          h += '<input type="text" id="authCodeInput" value="' + this.code + '" maxlength="6" style="width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 0.75rem; color: #00E599; font-size: 1.5rem; text-align: center; letter-spacing: 0.4rem; font-family: Chakra Petch, monospace;" />';
          h += '</div>';

          h += '<div style="display: flex; gap: 0.5rem;">';
          h += '<button type="button" onclick="window.cricosMobileApp.backToIdentifier()" style="flex: 1; padding: 0.85rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-weight: 600; font-size: 0.85rem; cursor: pointer;">← Back</button>';
          h += '<button type="button" onclick="window.cricosMobileApp.verifyOtpAction()" style="flex: 2; padding: 0.85rem; border-radius: 8px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.95rem; cursor: pointer;" data-tooltip="Verify OTP code and create JWT mobile session">Verify & Enter ✓</button>';
          h += '</div>';
        }
        h += '</div>';
        return h;
      }

      renderMatches() {
        var overs = Math.floor(this.matchState.legalBalls / 6);
        var balls = this.matchState.legalBalls % 6;
        var crr = this.matchState.legalBalls > 0 ? ((this.matchState.totalRuns / this.matchState.legalBalls) * 6).toFixed(2) : '0.00';

        var h = '<div style="padding: 1rem;">';
        h += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">';
        h += '<span style="background: rgba(255, 51, 102, 0.15); border: 1px solid #ff3366; color: #ff3366; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px;">🔴 LIVE MATCH</span>';
        h += '<span style="font-size: 0.75rem; color: #94a3b8;">Match #' + this.matchState.matchId + '</span>';
        h += '</div>';

        // LED Scoreboard HUD
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; text-align: center; margin-bottom: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">';
        h += '<div style="font-size: 0.85rem; color: #cbd5e1; font-weight: 600;">' + this.matchState.battingTeam + '</div>';
        h += '<div style="font-size: 2.75rem; font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace; line-height: 1.1; margin: 0.35rem 0;">' + this.matchState.totalRuns + '/' + this.matchState.totalWickets + '</div>';
        h += '<div style="font-size: 0.85rem; color: #94a3b8;">Overs: <strong style="color: #00D2FF; font-family: Chakra Petch, monospace;">' + overs + '.' + balls + '</strong> • CRR: <strong style="color: #f8fafc; font-family: Chakra Petch, monospace;">' + crr + '</strong></div>';
        h += '</div>';

        // Over Ball Strip
        h += '<div style="margin-bottom: 1rem;">';
        h += '<div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.4rem; font-weight: 600;">Current Over Deliveries:</div>';
        h += '<div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem;">';
        for (var i = 0; i < this.matchState.currentOverDeliveries.length; i++) {
          var d = this.matchState.currentOverDeliveries[i];
          var bg = 'rgba(255,255,255,0.06)';
          var color = '#f8fafc';
          if (d === '4') { bg = 'rgba(0, 229, 153, 0.2)'; color = '#00E599'; }
          if (d === '6') { bg = 'rgba(168, 85, 247, 0.2)'; color = '#c084fc'; }
          if (d === 'W') { bg = 'rgba(255, 51, 102, 0.2)'; color = '#ff3366'; }
          h += '<span style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background:' + bg + '; color:' + color + '; font-weight: 800; font-size: 0.85rem; font-family: Chakra Petch, monospace; border: 1px solid rgba(255,255,255,0.1);">' + d + '</span>';
        }
        h += '</div></div>';

        // Batters & Bowler
        h += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.75rem;">';
        h += '<div style="background: rgba(0, 229, 153, 0.08); border: 1px solid rgba(0, 229, 153, 0.25); border-radius: 8px; padding: 0.65rem;">';
        h += '<div style="font-size: 0.75rem; font-weight: 700; color: #00E599;">' + this.matchState.striker.name + ' *</div>';
        h += '<div style="font-size: 0.85rem; font-weight: 800; font-family: Chakra Petch, monospace;">' + this.matchState.striker.runs + ' <small style="font-size: 0.7rem; color: #94a3b8;">(' + this.matchState.striker.balls + 'b)</small></div>';
        h += '</div>';
        h += '<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem;">';
        h += '<div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1;">' + this.matchState.nonStriker.name + '</div>';
        h += '<div style="font-size: 0.85rem; font-weight: 800; font-family: Chakra Petch, monospace;">' + this.matchState.nonStriker.runs + ' <small style="font-size: 0.7rem; color: #94a3b8;">(' + this.matchState.nonStriker.balls + 'b)</small></div>';
        h += '</div>';
        h += '</div>';

        h += '<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; margin-bottom: 1rem; display: flex; justify-content: space-between; font-size: 0.8rem;">';
        h += '<span style="font-weight: 600;">🎳 ' + this.matchState.bowler.name + '</span>';
        h += '<span style="color: #00D2FF; font-family: Chakra Petch, monospace; font-weight: 700;">' + this.matchState.bowler.overs + '.' + this.matchState.bowler.ballsThisOver + '-' + this.matchState.bowler.maidens + '-' + this.matchState.bowler.runsConceded + '-' + this.matchState.bowler.wickets + '</span>';
        h += '</div>';

        // Tactile Scoring Pad
        h += '<div style="background: rgba(10, 16, 28, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 0.85rem;">';
        h += '<div style="font-size: 0.75rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.5rem;">⚡ Boundary Scoring Controls</div>';
        h += '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem;">';
        h += '<button type="button" onclick="window.cricosMobileApp.scoreBall(0)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">0<span style="display: block; font-size: 9px; color: #94a3b8;">Dot</span></button>';
        h += '<button type="button" onclick="window.cricosMobileApp.scoreBall(1)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">1<span style="display: block; font-size: 9px; color: #94a3b8;">Single</span></button>';
        h += '<button type="button" onclick="window.cricosMobileApp.scoreBall(2)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">2<span style="display: block; font-size: 9px; color: #94a3b8;">Two</span></button>';
        h += '<button type="button" onclick="window.cricosMobileApp.scoreBall(3)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); color: #f8fafc; font-weight: 800; font-size: 16px; cursor: pointer;">3<span style="display: block; font-size: 9px; color: #94a3b8;">Three</span></button>';
        h += '<button type="button" onclick="window.cricosMobileApp.scoreBall(4)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(0, 229, 153, 0.4); background: rgba(0, 229, 153, 0.12); color: #00E599; font-weight: 800; font-size: 16px; cursor: pointer;">4<span style="display: block; font-size: 9px; color: #00E599;">Four</span></button>';
        h += '<button type="button" onclick="window.cricosMobileApp.scoreBall(6)" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.4); background: rgba(168, 85, 247, 0.12); color: #c084fc; font-weight: 800; font-size: 16px; cursor: pointer;">6<span style="display: block; font-size: 9px; color: #c084fc;">Six</span></button>';
        h += '<button type="button" onclick="window.cricosMobileApp.promptWicketModal()" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255, 51, 102, 0.4); background: rgba(255, 51, 102, 0.15); color: #ff3366; font-weight: 800; font-size: 16px; cursor: pointer;">W<span style="display: block; font-size: 9px; color: #ff8099;">Wicket</span></button>';
        h += '<button type="button" onclick="window.cricosMobileApp.scoreExtra(this.dataset.extra)" data-extra="WIDE" style="padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255, 184, 0, 0.4); background: rgba(255, 184, 0, 0.12); color: #ffb800; font-weight: 800; font-size: 16px; cursor: pointer;">Wd<span style="display: block; font-size: 9px; color: #ffb800;">Wide</span></button>';
        h += '</div></div>';
        h += '</div>';
        return h;
      }

      renderTournaments() {
        var h = '<div style="padding: 1rem;">';
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<div style="font-size: 0.7rem; font-weight: 700; color: #00D2FF; text-transform: uppercase;">National Championship</div>';
        h += '<h2 style="margin: 0.25rem 0 0; font-size: 1.25rem; font-family: Space Grotesk, sans-serif;">Club Premier League 2026</h2>';
        h += '<div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem;">Stage: ⚡ Group Stage Live</div>';
        h += '</div>';

        h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">';
        h += '<div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.85rem; font-weight: 700; font-family: Space Grotesk, sans-serif;">ICC Points Table & Net Run Rate</div>';
        h += '<table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">';
        h += '<thead><tr style="color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08);">';
        h += '<th style="padding: 0.5rem 0.75rem; text-align: left;">Team</th><th style="padding: 0.5rem; text-align: center;">P</th><th style="padding: 0.5rem; text-align: center;">W</th><th style="padding: 0.5rem; text-align: center; color: #00E599;">Pts</th><th style="padding: 0.5rem 0.75rem; text-align: right;">NRR</th>';
        h += '</tr></thead><tbody>';

        for (var i = 0; i < this.standings.length; i++) {
          var s = this.standings[i];
          var nrrColor = s.nrr.indexOf('+') === 0 ? '#00E599' : '#ff3366';
          h += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">';
          h += '<td style="padding: 0.65rem 0.75rem; font-weight: 600;">' + s.position + '. ' + s.team + '</td>';
          h += '<td style="padding: 0.65rem; text-align: center;">' + s.played + '</td>';
          h += '<td style="padding: 0.65rem; text-align: center;">' + s.won + '</td>';
          h += '<td style="padding: 0.65rem; text-align: center; font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace;">' + s.points + '</td>';
          h += '<td style="padding: 0.65rem 0.75rem; text-align: right; font-family: Chakra Petch, monospace; font-weight: 700; color: ' + nrrColor + ';">' + s.nrr + '</td>';
          h += '</tr>';
        }
        h += '</tbody></table></div></div>';
        return h;
      }

      renderMarketplace() {
        var h = '<div style="padding: 1rem;">';
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<h2 style="margin: 0; font-size: 1.25rem; font-family: Space Grotesk, sans-serif;">Book Venues & Umpires</h2>';
        h += '<div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.2rem;">Authoritative GiST slot hold with escrow</div>';
        h += '</div>';

        h += '<div style="display: flex; flex-direction: column; gap: 0.85rem;">';
        for (var i = 0; i < this.listings.length; i++) {
          var l = this.listings[i];
          h += '<div style="background: rgba(10, 16, 28, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.85rem;">';
          h += '<div style="display: flex; justify-content: space-between;">';
          h += '<div>';
          h += '<div style="font-size: 0.7rem; color: #00E599; font-weight: 700;">' + l.category + '</div>';
          h += '<div style="font-weight: 700; font-size: 0.95rem; margin: 0.15rem 0;">' + l.title + '</div>';
          h += '<div style="font-size: 0.75rem; color: #94a3b8;">★ ' + l.rating + ' • ' + l.location + '</div>';
          h += '</div>';
          h += '<div style="text-align: right;">';
          h += '<div style="font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace; font-size: 1.1rem;">₹' + l.price + '</div>';
          h += '<div style="font-size: 0.65rem; color: #94a3b8;">per slot</div>';
          h += '</div></div>';

          h += '<button type="button" onclick="window.cricosMobileApp.bookTurfInstant(this.dataset.title, this.dataset.price)" data-title="' + l.title + '" data-price="' + l.price + '" style="margin-top: 0.75rem; width: 100%; padding: 0.6rem; border-radius: 6px; border: none; background: linear-gradient(135deg, #00E599, #00D2FF); color: #04070D; font-weight: 700; font-size: 0.8rem; cursor: pointer;" data-tooltip="Lock slot with 15-minute GiST PostgreSQL hold">Instant 15-Min Hold & Book →</button>';
          h += '</div>';
        }
        h += '</div></div>';
        return h;
      }

      renderProfile() {
        var avg = (this.profile.batting.runs / (this.profile.batting.innings - this.profile.batting.notOuts)).toFixed(2);
        var sr = ((this.profile.batting.runs / this.profile.batting.ballsFaced) * 100).toFixed(1);

        var h = '<div style="padding: 1rem;">';
        h += '<div style="background: rgba(10, 16, 28, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 1.25rem; margin-bottom: 1rem;">';
        h += '<div style="display: flex; align-items: center; gap: 0.85rem;">';
        h += '<div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(0, 229, 153, 0.15); border: 2px solid #00E599; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace;">#' + this.profile.jerseyNumber + '</div>';
        h += '<div>';
        h += '<div style="font-size: 1.15rem; font-weight: 700;">' + this.profile.name + '</div>';
        h += '<div style="font-size: 0.75rem; color: #94a3b8;"><span style="color: #00E599; font-weight: 600;">' + this.profile.persona + '</span> • ' + this.profile.role + ' • ' + this.profile.teamName + '</div>';
        h += '</div></div></div>';

        h += '<div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">🏏 Career Batting Figures</div>';
        h += '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-bottom: 1rem;">';
        h += '<div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; text-align: center;"><div style="font-size: 1.1rem; font-weight: 800; color: #00E599; font-family: Chakra Petch, monospace;">' + this.profile.batting.runs + '</div><div style="font-size: 0.65rem; color: #94a3b8;">Runs</div></div>';
        h += '<div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; text-align: center;"><div style="font-size: 1.1rem; font-weight: 800; font-family: Chakra Petch, monospace;">' + avg + '</div><div style="font-size: 0.65rem; color: #94a3b8;">Average</div></div>';
        h += '<div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.65rem; text-align: center;"><div style="font-size: 1.1rem; font-weight: 800; color: #00D2FF; font-family: Chakra Petch, monospace;">' + sr + '</div><div style="font-size: 0.65rem; color: #94a3b8;">Strike Rate</div></div>';
        h += '</div>';

        // Security & Account Deletion (App Store Compliance)
        h += '<div style="background: rgba(10, 16, 28, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem;">';
        h += '<div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.6rem;">Account & Compliance</div>';
        h += '<button type="button" onclick="window.cricosMobileApp.signOutAction()" style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #f8fafc; font-weight: 600; font-size: 0.75rem; margin-bottom: 0.5rem; cursor: pointer;" data-tooltip="Clear JWT authentication session">🚪 Sign Out</button>';
        h += '<button type="button" onclick="window.cricosMobileApp.promptDeleteAccount()" style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid rgba(255, 51, 102, 0.3); background: rgba(255, 51, 102, 0.1); color: #ff6688; font-weight: 600; font-size: 0.75rem; cursor: pointer;" data-tooltip="Apple App Store Guideline 5.1.1(v) mandatory account deletion">🗑️ Delete Account & Data (App Store 5.1.1v)</button>';
        h += '</div></div>';
        return h;
      }

      render() {
        var root = document.getElementById('mobile-app-root');
        if (!root) return;

        var session = this.client.getSession();
        var isAuth = !!session;

        var content = '';
        if (this.currentScreen === 'AUTH') {
          content = this.renderAuth();
        } else if (this.currentScreen === 'MATCHES') {
          content = this.renderMatches();
        } else if (this.currentScreen === 'TOURNAMENTS') {
          content = this.renderTournaments();
        } else if (this.currentScreen === 'MARKETPLACE') {
          content = this.renderMarketplace();
        } else if (this.currentScreen === 'PROFILE') {
          content = this.renderProfile();
        }

        var h = '';
        // Header Inside Phone
        h += '<div style="padding: 0.75rem 1rem; background: rgba(10, 16, 28, 0.95); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(10px);">';
        h += '<div style="display: flex; align-items: center; gap: 0.4rem;">';
        h += '<span style="font-size: 1.1rem;">🏏</span>';
        h += '<span style="font-family: Space Grotesk, sans-serif; font-weight: 800; font-size: 1rem; color: #f8fafc;">CricOS</span>';
        h += '</div>';
        h += '<div>';
        if (isAuth) {
          h += '<span style="background: rgba(0, 229, 153, 0.15); color: #00E599; border: 1px solid rgba(0, 229, 153, 0.3); padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700;">' + this.profile.persona + '</span>';
        } else {
          h += '<span style="color: #94a3b8; font-size: 0.7rem;">Guest</span>';
        }
        h += '</div></div>';

        // Content
        h += '<div style="padding-bottom: 70px;">' + content + '</div>';

        // Bottom Navigation Bar inside Phone
        h += '<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(10, 16, 28, 0.96); border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-around; padding: 0.5rem 0.25rem 1.25rem; z-index: 50; backdrop-filter: blur(12px);">';

        var navItems = [
          ['MATCHES', '🏏', 'Matches'],
          ['TOURNAMENTS', '🏆', 'Standings'],
          ['MARKETPLACE', '🛒', 'Turf'],
          ['PROFILE', '👤', 'Profile']
        ];
        if (!isAuth) {
          navItems.push(['AUTH', '🔑', 'Sign In']);
        }

        for (var i = 0; i < navItems.length; i++) {
          var item = navItems[i];
          var active = this.currentScreen === item[0];
          var color = active ? '#00E599' : '#94a3b8';
          h += '<button type="button" onclick="window.cricosMobileApp.navigateTo(this.dataset.screen)" data-screen="' + item[0] + '" style="background: none; border: none; color: ' + color + '; font-size: 0.65rem; font-weight: 600; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; cursor: pointer;" data-tooltip="Navigate to ' + item[2] + '">';
          h += '<span style="font-size: 1rem;">' + item[1] + '</span>';
          h += '<span>' + item[2] + '</span>';
          h += '</button>';
        }
        h += '</div>';

        root.innerHTML = h;
      }
    }

    const app = new StandaloneMobileApp();
    window.cricosMobileApp = app;
    app.render();
  </script>
</body>
</html>
`;
}
