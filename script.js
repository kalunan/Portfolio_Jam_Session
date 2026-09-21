const trackNames = {
    'page-1': 'TRK 01 // ABOUT ME LOADED',
    'page-2': 'TRK 02 // PLAYER & VISUALIZER ACTIVE',
    'page-3': 'TRK 03 // 5-BAND EQUALIZER ONLINE',
    'page-4': 'TRK 04 // PROJECT DISCOGRAPHY LOADED',
    'page-5': 'TRK 05 // LANGUAGE SOUNDBOARD READY',
    'page-6': 'TRK 06 // CONTACT TRANSMITTER READY'
};

const trackLabels = {
    'page-1': 'TRK 01 // ABOUT ME',
    'page-2': 'TRK 02 // PLAYER',
    'page-3': 'TRK 03 // EQUALIZER',
    'page-4': 'TRK 04 // PROJECTS',
    'page-5': 'TRK 05 // LANGUAGES',
    'page-6': 'TRK 06 // CONTACT'
};

let activeTrack = 'page-1';
let audioCtx = null;
let isAudioPlaying = false;
let audioSourceNode = null;
let visMode = 'bars';
let analyser = null;

let introPlaying = false;
let introInterval = null;

function startIntroSequence() {
    initAudio();
    const leftSpool = document.getElementById('introSpoolLeft');
    const rightSpool = document.getElementById('introSpoolRight');
    const lcd = document.getElementById('introLcdText');
    const playBtn = document.getElementById('btnIntroPlay');

    if (introPlaying) return;
    introPlaying = true;
    playBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>BOOTING...</span>`;
    if (leftSpool) leftSpool.classList.add('playing');
    if (rightSpool) rightSpool.classList.add('playing');

    lcd.innerText = "INITIALIZING TAPE MOTOR...";

    let bootStep = 0;
    const bootNotes = [220, 277.18, 329.63, 440, 554.37, 659.25];
    introInterval = setInterval(() => {
        if (audioCtx && bootStep < bootNotes.length) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(bootNotes[bootStep], audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        }
        bootStep++;
        if (bootStep === 3) {
            lcd.innerText = "LOADING PORTFOLIO FREQUENCIES...";
        }
    }, 200);

    setTimeout(() => {
        clearInterval(introInterval);
        skipIntro();
    }, 1400);
}

function skipIntro() {
    clearInterval(introInterval);
    const overlay = document.getElementById('introOverlay');
    const appContainer = document.getElementById('appContainer');

    if (overlay) {
        overlay.classList.add('fade-out');
    }
    if (appContainer) {
        appContainer.classList.add('fade-in');
    }
    playClickSound();
}

function switchTrack(pageId) {
    if (activeTrack === pageId) return;

    initAudio();
    const overlay = document.getElementById('trackTransitionOverlay');
    const lcd = document.getElementById('transitionLcdText');
    const sideLabel = document.getElementById('transitionSideLabel');

    if (lcd) lcd.innerText = `LOADING ${trackLabels[pageId] || 'NEW TRACK'}...`;
    if (sideLabel) sideLabel.innerText = pageId.replace('page-', 'TRK ');
    if (overlay) overlay.classList.add('active');

    if (audioCtx) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }

    setTimeout(() => {
        document.querySelectorAll('.page-track').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        const navIndex = parseInt(pageId.replace('page-', '')) - 1;
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems[navIndex]) {
            navItems[navIndex].classList.add('active');
        }

        document.getElementById('lcdTrackText').innerText = trackNames[pageId] || 'SYSTEM ONLINE';
        activeTrack = pageId;

        if (overlay) overlay.classList.remove('active');
    }, 600);
}

function setTheme(themeName) {
    document.body.className = themeName;
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.btn-${themeName.replace('theme-', '')}`);
    if (activeBtn) activeBtn.classList.add('active');
    playClickSound();
}

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;

        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic && !audioSourceNode) {
            audioSourceNode = audioCtx.createMediaElementSource(bgMusic);
            audioSourceNode.connect(analyser);
            analyser.connect(audioCtx.destination);
        }
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playClickSound() {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {}
}

function toggleGlobalAudio() {
    initAudio();
    const btn = document.getElementById('btnAudioToggle');
    const spoolLeft = document.getElementById('spoolLeft');
    const spoolRight = document.getElementById('spoolRight');
    const bgMusic = document.getElementById('bgMusic');

    if (isAudioPlaying) {
        isAudioPlaying = false;
        bgMusic.pause();
        btn.innerHTML = `<i class="fa-solid fa-play"></i><span>PLAY SYNTH</span>`;
        if (spoolLeft) spoolLeft.classList.remove('playing');
        if (spoolRight) spoolRight.classList.remove('playing');
    } else {
        isAudioPlaying = true;
        bgMusic.play().catch(error => {
            console.log("Playback error or restriction:", error);
        });
        btn.innerHTML = `<i class="fa-solid fa-pause"></i><span>PAUSE SYNTH</span>`;
        if (spoolLeft) spoolLeft.classList.add('playing');
        if (spoolRight) spoolRight.classList.add('playing');
    }
}

function setVisMode(mode) {
    visMode = mode;
    document.querySelectorAll('.vis-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    playClickSound();
}

function updateEq(lang, val) {
    document.getElementById(`val-${lang}`).innerText = val + '%';
}

function resetEqToZero() {
    const langs = ['c', 'js', 'html', 'css', 'py'];
    langs.forEach(lang => {
        const slider = document.getElementById(`slide-${lang}`);
        const display = document.getElementById(`val-${lang}`);
        if (slider) slider.value = 0;
        if (display) display.innerText = '0%';
    });
    playClickSound();
}

function updateTrackOneInfo() {
    const cVal = document.getElementById('slide-c').value;
    const jsVal = document.getElementById('slide-js').value;
    const htmlVal = document.getElementById('slide-html').value;
    const cssVal = document.getElementById('slide-css').value;
    const pyVal = document.getElementById('slide-py').value;

    const highlightsContainer = document.getElementById('track1Highlights');
    if (highlightsContainer) {
        highlightsContainer.innerHTML = `
            <div class="highlight-item">
                <h4>Synchronized C Level</h4>
                <p>C Systems Core (${cVal}%)</p>
            </div>
            <div class="highlight-item">
                <h4>Synchronized Web Stack</h4>
                <p>JS/HTML/CSS (${jsVal}% / ${htmlVal}% / ${cssVal}%)</p>
            </div>
            <div class="highlight-item">
                <h4>Live EQ Sync</h4>
                <p>Python Matrix: ${pyVal}% (Synced)</p>
            </div>
        `;
    }

    playClickSound();
    alert('Track 01 profile info updated successfully from Equalizer values!');
}

function triggerSound(type) {
    initAudio();
    const padElement = event.currentTarget;
    padElement.classList.add('playing');
    setTimeout(() => padElement.classList.remove('playing'), 200);

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const frequencies = {
        'c': 110.00,    
        'js': 440.00,   
        'html': 523.25, 
        'css': 659.25,  
        'py': 880.00    
    };

    osc.type = type === 'c' ? 'triangle' : type === 'js' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(frequencies[type] || 300, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(analyser || audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

function handleContactSubmit(e) {
    e.preventDefault();
    playClickSound();
    alert('Transmission Received! Signal logged in portfolio console.');
    e.target.reset();
}

const canvas = document.getElementById('specCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function renderCanvas() {
    requestAnimationFrame(renderCanvas);

    for (let i = 1; i <= 8; i++) {
        const vu = document.getElementById(`vu${i}`);
        if (vu) {
            const h = isAudioPlaying ? Math.floor(Math.random() * 80) + 20 : 15;
            vu.style.height = h + '%';
            vu.style.opacity = isAudioPlaying ? '1' : '0.3';
        }
    }

    if (!canvas || !ctx) return;

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#00f0ff';

    if (visMode === 'bars') {
        const barCount = 24;
        const barWidth = (canvas.width / barCount) - 4;
        for (let i = 0; i < barCount; i++) {
            const barHeight = isAudioPlaying 
                ? Math.sin(Date.now() * 0.005 + i) * (canvas.height * 0.35) + (canvas.height * 0.45) 
                : 10;
            ctx.fillStyle = primaryColor;
            ctx.fillRect(i * (barWidth + 4) + 2, canvas.height - barHeight, barWidth, barHeight);
        }
    } else if (visMode === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = primaryColor;
        const points = 50;
        for (let i = 0; i <= points; i++) {
            const x = (canvas.width / points) * i;
            const y = isAudioPlaying
            ? (canvas.height / 2) + Math.sin(Date.now() * 0.008 + i * 0.3) * 45
            : canvas.height / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    } else if (visMode === 'radial') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = isAudioPlaying ? 50 + Math.sin(Date.now() * 0.01) * 15 : 45;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 4;
        ctx.stroke();
    }
}

renderCanvas();