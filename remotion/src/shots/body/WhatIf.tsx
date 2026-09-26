import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Captions, EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import type { VoLine } from '../../lib/shorts';
import { EndCard } from './EndCard';

// "What if...?" Shorts for The Human Manual: a hypothetical told through what
// it does to a body. A small kit of scenes, chosen per line by the script:
//   hook  - the question, an emoji, the glass body
//   body  - the glass body with one organ glowing; hot / cold / danger tints
//   run   - a side-view runner: speed lines, blur, sonic boom, heat
//   space - stars, Earth (NASA Blue Marble), Moon, Sun, a beam of light
//   clock - your time against Earth's
//   fact  - one big number
//   cta   - the body and the Subscribe card
// Everything is drawn here in code.

const W = 1080;
const H = 1920;
const FPS = 30;
const INK = '#35607f';
const SKIN = '#e9f4fc';

export type Organ = 'brain' | 'lungs' | 'heart' | 'stomach' | 'kidneys' | 'blood' | 'skin' | 'whole';
export type Tint = 'hot' | 'cold' | 'danger' | 'calm';
export type Beat = {
  line: number;
  scene: 'hook' | 'body' | 'run' | 'space' | 'clock' | 'fact' | 'cta';
  organ?: Organ;
  tint?: Tint;
  counter?: string;
  label?: string;
  speed?: number;          // run: km/h, drives the motion
  boom?: boolean;          // run: vapour cone and Mach rings
  heat?: number;           // run: 0..1
  target?: 'light' | 'orbit' | 'moon' | 'sun' | 'flash';
  factor?: number;         // clock: how much faster Earth's clock runs
  fact?: { big: string; small: string };
};
export type WhatIfProps = {
  title: string;
  emoji: string;
  vo: VoLine[];
  beats: Beat[];
  cta?: { fromLine: number; text: string };
  durationInSeconds: number;
};

const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ------------------------------------------------------------------ the body (front)

const TORSO = `M488,462 L488,505 C430,515 330,530 292,570 C262,600 258,650 266,720 L286,930
  C292,1000 300,1060 306,1100 C296,1180 282,1250 280,1330 C278,1420 292,1480 300,1510 L780,1510
  C788,1480 802,1420 800,1330 C798,1250 784,1180 774,1100 C780,1060 788,1000 794,930 L814,720
  C822,650 818,600 788,570 C750,530 650,515 592,505 L592,462 Z`;
const ARM_L = 'M300,592 C255,642 238,762 236,882 C234,1002 238,1122 246,1232';
const ARM_R = 'M780,592 C825,642 842,762 844,882 C846,1002 842,1122 834,1232';
const LUNG_L = 'M478,560 C424,568 392,640 394,720 C396,772 432,792 476,782 C498,722 500,622 478,560 Z';
const LUNG_R = 'M602,560 C656,568 688,640 686,720 C684,772 648,792 604,782 C582,722 580,622 602,560 Z';
const HEART = 'M560,672 C548,646 508,648 510,684 C512,716 548,736 566,760 C586,736 622,716 622,684 C622,650 580,646 568,672 Z';
const STOMACH = 'M600,812 C616,792 662,792 700,818 C752,856 758,930 704,964 C660,992 606,968 592,946 C584,930 616,920 640,912 C668,902 672,874 648,848 C630,830 604,830 600,812 Z';
const LIVER = 'M318,806 C380,780 510,776 590,806 C580,862 526,896 462,922 C408,944 352,936 326,902 C304,872 304,832 318,806 Z';
const KIDNEY_L = 'M404,960 C380,962 368,990 372,1020 C376,1050 400,1066 420,1056 C412,1036 414,1002 428,984 C426,968 418,960 404,960 Z';
const KIDNEY_R = 'M676,960 C700,962 712,990 708,1020 C704,1050 680,1066 660,1056 C668,1036 666,1002 652,984 C654,968 662,960 676,960 Z';
const GUT = 'M430,1010 C470,990 610,990 650,1010 C690,1040 690,1180 650,1220 C610,1250 470,1250 430,1220 C390,1180 390,1040 430,1010 Z';
const GUT_COILS = 'M440,1060 Q540,1030 640,1060 M430,1110 Q540,1080 650,1110 M430,1160 Q540,1130 650,1160 M445,1205 Q540,1180 635,1205';
const BLOOD = 'M560,760 L560,1300 M560,1300 L470,1480 M560,1300 L650,1480 M560,560 L540,470 M540,600 L300,640 M580,600 L780,640 M300,640 L250,1100 M780,640 L830,1100';

const ORGAN_CAM: Record<Organ, [number, number, number]> = {
  brain: [540, 330, 2.2], lungs: [540, 690, 1.7], heart: [560, 705, 2.3], stomach: [650, 880, 2.1],
  kidneys: [540, 1010, 1.8], blood: [540, 880, 0.95], skin: [540, 860, 0.95], whole: [540, 880, 0.95],
};

const Brain: React.FC = () => (
  <g>
    <path d="M540,232 C600,228 640,262 640,302 C642,344 606,372 560,370 C548,382 530,382 518,370 C472,372 438,344 440,302 C440,262 480,228 540,232 Z"
      fill="#f3a6c0" stroke="#b25b7c" strokeWidth={5} />
    <path d="M540,236 L540,372 M470,280 Q500,300 480,330 M610,280 Q580,300 600,330 M500,250 Q520,270 505,290 M580,250 Q560,270 575,290"
      fill="none" stroke="#b25b7c" strokeWidth={4} strokeLinecap="round" />
  </g>
);

const BodyScene: React.FC<{ organ?: Organ; tint?: Tint; t: number; f: number }> = ({ organ, tint, t, f }) => {
  const pulse = 0.5 + 0.5 * Math.sin(f / 5);
  const on = (o: Organ) => (organ === o ? 1 : organ && organ !== 'whole' && organ !== 'skin' ? 0.28 : 0.6);
  const glow = (o: Organ) => (organ === o ? 'url(#glow)' : undefined);
  const beat = (o: Organ) => (organ === o ? 1 + 0.05 * pulse * t : 1);
  const at = (o: Organ, cx: number, cy: number) =>
    `translate(${cx},${cy}) scale(${beat(o)}) translate(${-cx},${-cy})`;
  const tintColor = { hot: '#ff6a2a', cold: '#5ccfff', danger: '#ff2e3b', calm: '#5fe39a' };
  return (
    <g>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx={540} cy={1530} rx={300} ry={36} fill="rgba(20,60,100,0.16)" />
      <g opacity={0.92}>
        {[ARM_L, ARM_R].map((a, i) => (
          <g key={i}>
            <path d={a} fill="none" stroke={INK} strokeWidth={80} strokeLinecap="round" />
            <path d={a} fill="none" stroke={SKIN} strokeWidth={70} strokeLinecap="round" />
          </g>
        ))}
        <path d={TORSO} fill={SKIN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={540} cy={330} rx={118} ry={132} fill={SKIN} stroke={INK} strokeWidth={5} />
      </g>
      {tint && (
        <g opacity={t * (tint === 'danger' ? 0.25 + 0.2 * pulse : 0.38)}>
          {[ARM_L, ARM_R].map((a, i) => (
            <path key={i} d={a} fill="none" stroke={tintColor[tint]} strokeWidth={70} strokeLinecap="round" />
          ))}
          <path d={TORSO} fill={tintColor[tint]} />
          <ellipse cx={540} cy={330} rx={118} ry={132} fill={tintColor[tint]} />
        </g>
      )}
      <g opacity={on('blood')} filter={glow('blood')}>
        <path d={BLOOD} fill="none" stroke="#d8394b" strokeWidth={organ === 'blood' ? 12 : 7} strokeLinecap="round" />
      </g>
      <g opacity={on('kidneys')} filter={glow('kidneys')} transform={at('kidneys', 540, 1010)}>
        <path d={KIDNEY_L} fill="#b5543f" stroke="#7a3222" strokeWidth={4} />
        <path d={KIDNEY_R} fill="#b5543f" stroke="#7a3222" strokeWidth={4} />
      </g>
      <g opacity={on('stomach') * 0.9}>
        <path d={GUT} fill="#f6b6bd" stroke="#b8566a" strokeWidth={5} />
        <path d={GUT_COILS} fill="none" stroke="#b8566a" strokeWidth={5} strokeLinecap="round" />
        <path d={LIVER} fill="#a4473e" opacity={0.7} stroke="#6f2c26" strokeWidth={4} />
      </g>
      <g opacity={on('stomach')} filter={glow('stomach')} transform={at('stomach', 650, 880)}>
        <path d={STOMACH} fill="#ee8599" stroke="#a8465a" strokeWidth={5} />
      </g>
      <g opacity={on('lungs')} filter={glow('lungs')} transform={at('lungs', 540, 680)}>
        <path d={LUNG_L} fill="#f19db0" stroke="#b25b7c" strokeWidth={5} />
        <path d={LUNG_R} fill="#f19db0" stroke="#b25b7c" strokeWidth={5} />
      </g>
      <g opacity={on('heart')} filter={glow('heart')} transform={at('heart', 565, 700)}>
        <path d={HEART} fill="#d8394b" stroke="#8e1f2c" strokeWidth={5} />
      </g>
      <g opacity={on('brain')} filter={glow('brain')} transform={at('brain', 540, 300)}>
        <Brain />
      </g>
      {/* face */}
      <path d="M512,410 Q540,424 568,410" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {tint === 'hot' && Array.from({ length: 8 }, (_, i) => {
        const life = ((f / FPS) * 0.8 + rnd(i, 3)) % 1;
        const x = 300 + rnd(i, 4) * 480;
        return <path key={i} d={`M${x},${1100 - life * 700} q14,-24 0,-48 q-14,-24 0,-48`} fill="none"
          stroke="#ff8a3d" strokeWidth={6} strokeLinecap="round" opacity={t * (1 - life) * 0.8} />;
      })}
      {tint === 'cold' && Array.from({ length: 14 }, (_, i) => (
        <text key={i} x={260 + rnd(i, 5) * 560} y={420 + rnd(i, 6) * 1000} fontSize={34 + rnd(i, 7) * 20}
          fill="#ffffff" opacity={t * 0.85}>{'❄'}</text>
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ the runner (side)

const limb = (x: number, y: number, a1: number, a2: number, l1: number, l2: number) => {
  const r1 = (a1 * Math.PI) / 180;
  const kx = x + Math.sin(r1) * l1;
  const ky = y + Math.cos(r1) * l1;
  const r2 = ((a1 + a2) * Math.PI) / 180;
  return { knee: [kx, ky], foot: [kx + Math.sin(r2) * l2, ky + Math.cos(r2) * l2] };
};

const Runner: React.FC<{ phase: number; lean: number; x: number; tint?: string; alpha?: number }> = ({
  phase, lean, x, tint, alpha = 1,
}) => {
  const hip: [number, number] = [x, 1000];
  const neck: [number, number] = [x + Math.sin((lean * Math.PI) / 180) * 280, 1000 - Math.cos((lean * Math.PI) / 180) * 280];
  const head: [number, number] = [neck[0] + 18 + lean * 0.8, neck[1] - 70];
  const legs = [0, Math.PI].map((o) => limb(hip[0], hip[1], 40 * Math.sin(phase + o) + lean * 0.3,
    -(22 + 58 * (1 + Math.cos(phase + o)) / 2), 175, 175));
  const arms = [Math.PI, 0].map((o) => limb(neck[0] - 4, neck[1] + 20, 42 * Math.sin(phase + o) + lean * 0.6,
    -(58 + 20 * Math.sin(phase + o)), 130, 120));
  const skin = tint || SKIN;
  const seg = (pts: number[][], w: number, far: boolean, key: string) => (
    <g key={key}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={INK}
        strokeWidth={w + 10} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={far ? '#c6dcee' : skin}
        strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  return (
    <g opacity={alpha}>
      {seg([neck, arms[1].knee, arms[1].foot], 44, true, 'a1')}
      {seg([hip, legs[1].knee, legs[1].foot], 56, true, 'l1')}
      {seg([hip, neck], 96, false, 't')}
      <circle cx={head[0]} cy={head[1]} r={66} fill={skin} stroke={INK} strokeWidth={6} />
      <circle cx={head[0] + 34} cy={head[1] - 8} r={8} fill={INK} />
      {seg([hip, legs[0].knee, legs[0].foot], 56, false, 'l0')}
      {seg([neck, arms[0].knee, arms[0].foot], 44, false, 'a0')}
    </g>
  );
};

const RunScene: React.FC<{ b: Beat; sec: number; t: number; f: number }> = ({ b, sec, t, f }) => {
  const speed = b.speed ?? 40;
  const fast = Math.min(1, Math.log10(Math.max(10, speed)) / 3.4);   // 44 km/h -> 0.48, 3,700 -> 1
  const phase = sec * (7 + 9 * fast);
  const lean = 8 + 16 * fast;
  const flow = (f * (6 + 70 * fast)) % 240;
  const heat = b.heat ?? 0;
  const hotSkin = heat > 0.05 ? `rgb(${233 + 22 * heat},${244 - 120 * heat},${252 - 200 * heat})` : undefined;
  return (
    <g>
      {/* ground and speed */}
      <rect x={0} y={1180} width={W} height={740} fill="#6fb4e3" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={i * 240 - flow} y={1236} width={120} height={14} rx={7} fill="rgba(255,255,255,0.7)" />
      ))}
      {Array.from({ length: Math.round(6 + 18 * fast) }, (_, i) => {
        const y = 420 + rnd(i, 1) * 760;
        const len = 120 + rnd(i, 2) * 380 * fast;
        const x = W - ((f * (30 + 120 * fast) + rnd(i, 3) * W * 2) % (W * 2));
        return <rect key={`s${i}`} x={x} y={y} width={len} height={6} rx={3} fill="rgba(255,255,255,0.75)" />;
      })}
      {fast > 0.8 && [3, 2, 1].map((k) => (
        <Runner key={k} phase={phase - k * 0.35} lean={lean} x={500 - k * 70} alpha={0.12 * (4 - k)} />
      ))}
      {heat > 0.05 && (
        <ellipse cx={690} cy={760} rx={160 * heat + 40} ry={360} fill="#ff7a2e" opacity={0.35 * heat * t} />
      )}
      <Runner phase={phase} lean={lean} x={500} tint={hotSkin} />
      {b.boom && (
        <g opacity={t}>
          <path d="M760,700 C520,560 260,560 -40,620 L-40,1060 C260,1120 520,1100 760,960 Z"
            fill="rgba(255,255,255,0.35)" />
          {Array.from({ length: 3 }, (_, i) => {
            const life = ((sec * 1.4) + i / 3) % 1;
            return <ellipse key={i} cx={640 - life * 300} cy={830} rx={60 + life * 520} ry={60 + life * 420}
              fill="none" stroke="#ffffff" strokeWidth={10 * (1 - life)} opacity={1 - life} />;
          })}
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ space

const Stars: React.FC<{ f: number; drift: number }> = ({ f, drift }) => (
  <g>{Array.from({ length: 140 }, (_, i) => {
    const x = (rnd(i, 1) * W - f * drift * (0.3 + rnd(i, 2))) % W;
    return <circle key={i} cx={x < 0 ? x + W : x} cy={rnd(i, 3) * H} r={1 + rnd(i, 4) * 3}
      fill="#fff" opacity={0.4 + rnd(i, 5) * 0.6} />;
  })}</g>
);

const Beam: React.FC<{ from: [number, number]; to: [number, number]; p: number }> = ({ from, to, p }) => {
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p;
  const tx = from[0] + (to[0] - from[0]) * Math.max(0, p - 0.25);
  const ty = from[1] + (to[1] - from[1]) * Math.max(0, p - 0.25);
  return (
    <g>
      <line x1={tx} y1={ty} x2={x} y2={y} stroke="#9fe7ff" strokeWidth={18} strokeLinecap="round" opacity={0.45} />
      <line x1={tx} y1={ty} x2={x} y2={y} stroke="#ffffff" strokeWidth={7} strokeLinecap="round" />
      <circle cx={x} cy={y} r={16} fill="#ffffff" />
      <circle cx={x} cy={y} r={34} fill="#9fe7ff" opacity={0.4} />
    </g>
  );
};

const SpaceScene: React.FC<{ b: Beat; sec: number; t0: number; f: number }> = ({ b, sec, t0, f }) => {
  const local = sec - t0;
  const target = b.target ?? 'light';
  if (target === 'orbit') {
    const a = local * Math.PI * 2 * 1.6;
    return (
      <g>
        <Stars f={f} drift={0} />
        <image href={staticFile('earth.png')} x={290} y={650} width={500} height={500} />
        <ellipse cx={540} cy={900} rx={330} ry={120} fill="none" stroke="rgba(159,231,255,0.35)" strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => {
          const aa = a - i * 0.12;
          return <circle key={i} cx={540 + Math.cos(aa) * 330} cy={900 + Math.sin(aa) * 120}
            r={16 - i} fill="#ffffff" opacity={(1 - i / 12) * (Math.sin(aa) > -0.2 || i > 0 ? 1 : 0.4)} />;
        })}
      </g>
    );
  }
  if (target === 'moon' || target === 'sun') {
    const sun = target === 'sun';
    const earth: [number, number] = sun ? [170, 1320] : [270, 1260];
    const to: [number, number] = sun ? [860, 520] : [820, 600];
    const p = (local % (sun ? 2.6 : 1.4)) / (sun ? 2.6 : 1.4);
    return (
      <g>
        <Stars f={f} drift={0} />
        {sun ? (
          <g>
            <circle cx={to[0]} cy={to[1]} r={330} fill="#ffb640" opacity={0.25} />
            <circle cx={to[0]} cy={to[1]} r={250} fill="#ffd34d" />
          </g>
        ) : (
          <g>
            <circle cx={to[0]} cy={to[1]} r={80} fill="#c9cdd3" stroke="#9aa0a8" strokeWidth={4} />
            <circle cx={to[0] - 20} cy={to[1] - 18} r={14} fill="#aeb3ba" />
            <circle cx={to[0] + 24} cy={to[1] + 20} r={10} fill="#aeb3ba" />
          </g>
        )}
        <image href={staticFile('earth.png')} x={earth[0] - (sun ? 70 : 160)} y={earth[1] - (sun ? 70 : 160)}
          width={sun ? 140 : 320} height={sun ? 140 : 320} />
        <Beam from={earth} to={to} p={p} />
      </g>
    );
  }
  if (target === 'flash') {
    const k = Math.min(1, local / 0.6);
    return (
      <g>
        <Stars f={f} drift={40} />
        <circle cx={540} cy={860} r={40 + 900 * k} fill="#ffffff" opacity={1 - k * 0.7} />
        <circle cx={540} cy={860} r={60 + 700 * k} fill="none" stroke="#ffd34d" strokeWidth={24} opacity={1 - k} />
      </g>
    );
  }
  return (
    <g>
      <Stars f={f} drift={60} />
      {Array.from({ length: 5 }, (_, i) => {
        const p = ((local * 1.8) + i / 5) % 1;
        return <Beam key={i} from={[-200, 500 + i * 180]} to={[W + 300, 380 + i * 180]} p={p} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ clock

const Dial: React.FC<{ cx: number; cy: number; turns: number; label: string; tint: string }> = ({ cx, cy, turns, label, tint }) => {
  const a = turns * Math.PI * 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={190} fill="#ffffff" stroke={INK} strokeWidth={12} />
      {Array.from({ length: 12 }, (_, i) => {
        const r = (i / 12) * Math.PI * 2;
        return <line key={i} x1={cx + Math.sin(r) * 150} y1={cy - Math.cos(r) * 150}
          x2={cx + Math.sin(r) * 172} y2={cy - Math.cos(r) * 172} stroke={INK} strokeWidth={8} />;
      })}
      <line x1={cx} y1={cy} x2={cx + Math.sin(a) * 140} y2={cy - Math.cos(a) * 140} stroke={tint} strokeWidth={12} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + Math.sin(a / 12) * 90} y2={cy - Math.cos(a / 12) * 90} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={16} fill={INK} />
      <text x={cx} y={cy + 270} textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight={700}
        fontSize={56} fill="#0f2d47">{label}</text>
    </g>
  );
};

// ------------------------------------------------------------------ overlays

const Counter: React.FC<{ text: string; t: number; dark?: boolean }> = ({ text, t, dark }) => (
  <div style={{
    position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 124, color: '#fff',
    textShadow: '0 8px 30px rgba(20,60,100,0.55)', letterSpacing: 2,
    WebkitTextStroke: dark ? undefined : '5px #0f2d47', paintOrder: 'stroke fill',
    opacity: t, transform: `scale(${0.8 + 0.2 * EASE_OUT(t)})`,
  }}>{text}</div>
);

const Tag: React.FC<{ text: string; t: number }> = ({ text, t }) => (
  <div style={{ position: 'absolute', top: 395, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: t }}>
    <div style={{
      background: 'rgba(12,32,52,0.88)', border: '3px solid #ffd34d', borderRadius: 16,
      padding: '10px 28px', color: '#fff', fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: 700, fontSize: 44, letterSpacing: 3,
    }}>{text}</div>
  </div>
);

const Fact: React.FC<{ big: string; small: string; t: number }> = ({ big, small, t }) => (
  <div style={{
    position: 'absolute', top: 560, left: 70, right: 70, textAlign: 'center', opacity: t,
    transform: `translateY(${(1 - EASE_OUT(t)) * 40}px) scale(${0.92 + 0.08 * EASE_OUT(t)})`,
    background: 'rgba(12,32,52,0.9)', borderRadius: 28, padding: '34px 24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
  }}>
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 128, color: '#ffd34d', lineHeight: 1 }}>{big}</div>
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 46, color: '#fff', marginTop: 14 }}>{small}</div>
  </div>
);

// ------------------------------------------------------------------ scenes

const Scene: React.FC<{ b: Beat; sec: number; t0: number; f: number; t: number; emoji: string; title: string }> = ({
  b, sec, t0, f, t, emoji, title,
}) => {
  const dark = b.scene === 'space';
  const bg = dark ? 'radial-gradient(circle at 50% 40%, #13244a 0%, #050814 70%)'
    : 'linear-gradient(180deg,#d7efff 0%,#9fd3f5 55%,#6fb4e3 100%)';
  let world: React.ReactNode = null;
  if (b.scene === 'run') {
    world = <RunScene b={b} sec={sec} t={t} f={f} />;
  } else if (b.scene === 'space') {
    world = <SpaceScene b={b} sec={sec} t0={t0} f={f} />;
  } else if (b.scene === 'clock') {
    const local = sec - t0;
    world = (
      <g>
        <Dial cx={290} cy={900} turns={local * 0.25} label="YOU" tint="#2f8fd8" />
        <Dial cx={790} cy={900} turns={local * 0.25 * Math.min(b.factor ?? 10, 24)} label="EARTH" tint="#e0463c" />
      </g>
    );
  } else {
    const organ = b.scene === 'body' ? b.organ : undefined;
    const [cx, cy, z] = b.scene === 'body' && b.organ ? ORGAN_CAM[b.organ]
      : b.scene === 'hook' || b.scene === 'cta' ? [540, 700, 0.85] : [540, 880, 0.9];
    const k = EASE_INOUT(prog(sec, t0, t0 + 0.8));
    const zoom = 0.95 + (z - 0.95) * k;
    const x = 540 + (cx - 540) * k;
    const y = 880 + (cy - 880) * k;
    const push = 1 + 0.03 * prog(sec, t0, t0 + 4);
    world = (
      <g transform={`translate(${W / 2 - x * zoom * push},${H / 2 - y * zoom * push}) scale(${zoom * push})`}>
        <BodyScene organ={organ} tint={b.scene === 'body' ? b.tint : undefined} t={t} f={f} />
      </g>
    );
  }
  return (
    <AbsoluteFill style={{ background: bg }}>
      {!dark && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 14 }, (_, i) => (
            <line key={`h${i}`} x1={0} x2={W} y1={1380 + i * i * 4.2} y2={1380 + i * i * 4.2}
              stroke="rgba(255,255,255,0.28)" strokeWidth={2} />
          ))}
          {Array.from({ length: 19 }, (_, i) => (
            <line key={`v${i}`} x1={540 + (i - 9) * 40} y1={1380} x2={540 + (i - 9) * 190} y2={H}
              stroke="rgba(255,255,255,0.28)" strokeWidth={2} />
          ))}
        </svg>
      )}
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>{world}</svg>
      {b.scene === 'hook' && (
        <>
          <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', fontSize: 170,
            transform: `translateY(${10 * Math.sin(sec * 3)}px)` }}>{emoji}</div>
          <div style={{
            position: 'absolute', top: 310, left: 50, right: 50, textAlign: 'center',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 76, lineHeight: 1.05,
            color: '#0f2d47', textShadow: '0 4px 18px rgba(255,255,255,0.8)',
          }}>{title}</div>
        </>
      )}
      {b.counter && <Counter text={b.counter} t={t} dark={dark} />}
      {b.label && <Tag text={b.label} t={t} />}
      {b.scene === 'fact' && b.fact && <Fact big={b.fact.big} small={b.fact.small} t={t} />}
    </AbsoluteFill>
  );
};

const WhatIf: React.FC<Partial<WhatIfProps>> = ({
  title = '', emoji = '❓', vo = [], beats = [], cta, durationInSeconds = 30,
}) => {
  const f = useCurrentFrame();
  const sec = f / FPS;
  const startOf = (line: number) => vo[line]?.start ?? durationInSeconds;
  const idx = Math.max(0, beats.findIndex((b, i) =>
    sec >= startOf(b.line) && (i === beats.length - 1 || sec < startOf(beats[i + 1].line))));
  const cur = beats[idx] || { line: 0, scene: 'hook' as const };
  const t0 = startOf(cur.line);
  const t = EASE_OUT(prog(sec, t0, t0 + 0.35));
  const prev = beats[idx - 1];
  const fade = prev ? prog(sec, t0, t0 + 0.25) : 1;
  const shake = cur.scene === 'run' && cur.boom ? Math.sin(f * 2.3) * 6 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050814', transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      {prev && fade < 1 && (
        <AbsoluteFill style={{ opacity: 1 - fade }}>
          <Scene b={prev} sec={sec} t0={startOf(prev.line)} f={f} t={1} emoji={emoji} title={title} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ opacity: fade }}>
        <Scene b={cur} sec={sec} t0={t0} f={f} t={t} emoji={emoji} title={title} />
      </AbsoluteFill>
      {cta && <EndCard from={Math.round(startOf(cta.fromLine) * FPS)} text={cta.text} />}
      <Captions lines={vo} y={1560} accent="#ffd34d" maxWords={3} size={58} plate />
    </AbsoluteFill>
  );
};

export default WhatIf;
