// pianoAudio.js — Advanced Physical Modeling Piano Synth
let _ctx;
const ctx = () => { if(!_ctx) _ctx = new (window.AudioContext||window.webkitAudioContext)(); return _ctx; };

export const FREQS = {
  C3:130.81,'C#3':138.59,D3:146.83,'D#3':155.56,E3:164.81,F3:174.61,'F#3':185,G3:196,'G#3':207.65,A3:220,'A#3':233.08,B3:246.94,
  C4:261.63,'C#4':277.18,D4:293.66,'D#4':311.13,E4:329.63,F4:349.23,'F#4':369.99,G4:392,'G#4':415.30,A4:440,'A#4':466.16,B4:493.88,
  C5:523.25,'C#5':554.37,D5:587.33,'D#5':622.25,E5:659.25,F5:698.46,'F#5':739.99,G5:783.99
};

export const LABELS = {
  C3:'DO₃',D3:'RE₃',E3:'MI₃',F3:'FA₃',G3:'SOL₃',A3:'LA₃',B3:'SI₃',
  C4:'DO','C#4':'DO#',D4:'RE','D#4':'RE#',E4:'MI',F4:'FA','F#4':'FA#',
  G4:'SOL','G#4':'SOL#',A4:'LA','A#4':'LA#',B4:'SI',
  C5:'DO₅','C#5':'DO#₅',D5:'RE₅','D#5':'RE#₅',E5:'MI₅',F5:'FA₅',G5:'SOL₅'
};

// Global Reverb Convolver setup
let reverbNode = null;
async function setupReverb(c) {
  if (reverbNode) return reverbNode;
  const length = c.sampleRate * 2.5; // 2.5 second tail
  const impulse = c.createBuffer(2, length, c.sampleRate);
  for (let i = 0; i < 2; i++) {
    const channel = impulse.getChannelData(i);
    for (let j = 0; j < length; j++) {
      channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 4); // exponential decay noise
    }
  }
  reverbNode = c.createConvolver();
  reverbNode.buffer = impulse;
  return reverbNode;
}

// Global Compressor setup
let globalComp = null;
let globalPreGain = null;
function getOutNode(c) {
  if (!globalComp) {
    globalComp = c.createDynamicsCompressor();
    globalComp.threshold.value = -6; // higher threshold, less pumping
    globalComp.knee.value = 15;
    globalComp.ratio.value = 4;
    globalComp.attack.value = 0.01;
    globalComp.release.value = 0.1;
    
    globalPreGain = c.createGain();
    globalPreGain.gain.value = 0.5; 
    
    globalPreGain.connect(globalComp);
    globalComp.connect(c.destination);
  }
  return globalPreGain;
}

export async function playPiano(noteId, duration = 2.5) {
  const freq = FREQS[noteId];
  if (!freq) return;
  const c = ctx();
  const now = c.currentTime;
  const outNode = getOutNode(c);

  // Master Envelope
  const master = c.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.35, now + 0.005);   // Lowered peak attack
  master.gain.setTargetAtTime(0.25, now + 0.005, 0.1);     // Initial decay
  master.gain.setTargetAtTime(0.001, now + duration * 0.7, duration * 0.4); // Long string release

  // Lowpass filter simulates hammer felt and string brightness loss
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 8, now); // Bright attack
  filter.frequency.exponentialRampToValueAtTime(freq * 2, now + 1.5); // Dull over time

  // Convolver Reverb for spatial depth
  const rev = await setupReverb(c);
  const wetGain = c.createGain(); wetGain.gain.value = 0.15;
  const dryGain = c.createGain(); dryGain.gain.value = 0.85;

  master.connect(filter);
  filter.connect(dryGain).connect(outNode);
  filter.connect(rev).connect(wetGain).connect(outNode);

  // Advanced Harmonics
  // Piano has inharmonicity: overtones are slightly sharper than perfect multiples
  const inharmonicity = 0.0002;
  
  const harmonics = [
    { n: 1, gain: 0.60, type: 'sine' },
    { n: 2, gain: 0.25, type: 'triangle' },
    { n: 3, gain: 0.12, type: 'sine' },
    { n: 4, gain: 0.06, type: 'triangle' },
    { n: 5, gain: 0.03, type: 'sine' },
    { n: 6, gain: 0.015, type: 'sine' }
  ];

  harmonics.forEach(h => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = h.type;
    // Inharmonic frequency calculation: fn = n * f1 * sqrt(1 + B * n^2)
    const shiftedFreq = h.n * freq * Math.sqrt(1 + inharmonicity * Math.pow(h.n, 2));
    osc.frequency.value = shiftedFreq;
    
    // Slight detune for "chorus" effect of 3 strings per note
    osc.detune.value = (Math.random() - 0.5) * 5;
    
    g.gain.value = h.gain;
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.5);
  });

  // Mechanical Hammer Strike Noise
  const noise = c.createOscillator();
  const noiseFilter = c.createBiquadFilter();
  const noiseGain = c.createGain();
  noise.type = 'square';
  noise.frequency.value = freq * 3;
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 2000;
  
  noiseGain.gain.setValueAtTime(0.015, now); // Drastically reduced from 0.04 to fix saturation
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  
  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start(now);
  noise.stop(now + 0.05);
}

export function playShort(noteId) {
  playPiano(noteId, 0.4);
}

export function playMetronomeClick(accent = false) {
  const c = ctx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(accent ? 1200 : 800, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
  
  g.gain.setValueAtTime(0.5, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  
  osc.connect(g).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}
