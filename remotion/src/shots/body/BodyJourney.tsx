import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Captions, EASE_INOUT, EASE_OUT, prog } from '../../lib/shorts';
import type { VoLine } from '../../lib/shorts';
import { EndCard } from './EndCard';

// "What happens inside your body when you eat X?" - a food's journey through a
// see-through body. Built like the map walks: a route (the digestive tract), a
// camera that follows the traveller, a big counter, a label per stop. Every
// organ is drawn here in code; nothing is traced from anyone's artwork.

const W = 1080;
const H = 1920;
const FPS = 30;

type Pt = [number, number];
export type StageKind = 'hook' | 'mouth' | 'esophagus' | 'stomach' | 'small' | 'large' | 'payoff' | 'cta';
export type Stage = {
  line: number;                 // vo line that starts this stage
  kind: StageKind;
  counter?: string;             // big number at the top, e.g. "7 SEC"
  label?: string;               // organ tag
  fact?: { big: string; small: string };
};
export type BodyProps = {
  food: { name: string; emoji: string; bolus: string };
  vo: VoLine[];
  stages: Stage[];
  title?: string;
  cta?: { fromLine: number; text: string };
  durationInSeconds: number;
};

// ------------------------------------------------------------------ geometry

const catmull = (pts: Pt[], n = 14): Pt[] => {
  const out: Pt[] = [];
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < p.length - 2; i++) {
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const f = (j: 0 | 1) => 0.5 * (2 * p[i][j] + (-p[i - 1][j] + p[i + 1][j]) * t
        + (2 * p[i - 1][j] - 5 * p[i][j] + 4 * p[i + 1][j] - p[i + 2][j]) * t * t
        + (-p[i - 1][j] + 3 * p[i][j] - 3 * p[i + 1][j] + p[i + 2][j]) * t * t * t);
      out.push([f(0), f(1)]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
const d = (pts: Pt[]) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');

const ESOPHAGUS: Pt[] = [[540, 395], [541, 470], [548, 580], [562, 670], [590, 728]];
const STOMACH_IN: Pt[] = [[590, 728], [640, 770], [658, 815], [630, 855], [578, 872]];
const SMALL: Pt[] = [[578, 872], [528, 905], [470, 955], [440, 990], [640, 990], [660, 1035],
  [440, 1040], [430, 1085], [660, 1090], [665, 1135], [440, 1140], [430, 1185], [600, 1195],
  [520, 1235], [410, 1240]];
const LARGE: Pt[] = [[410, 1240], [378, 1255], [372, 1100], [376, 940], [430, 918], [560, 925],
  [690, 915], [716, 950], [718, 1100], [712, 1250], [660, 1300], [590, 1330]];

const S_ESO = catmull(ESOPHAGUS, 10);
const S_STO = catmull(STOMACH_IN, 10);
const S_SMALL = catmull(SMALL, 12);
const S_LARGE = catmull(LARGE, 12);
const ROUTE: Pt[] = [...S_ESO, ...S_STO.slice(1), ...S_SMALL.slice(1), ...S_LARGE.slice(1)];
const CUM: number[] = ROUTE.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(p[0] - ROUTE[i - 1][0], p[1] - ROUTE[i - 1][1]));
  return acc;
}, []);
const TOTAL = CUM[CUM.length - 1];
const lenTo = (pts: Pt[][]) => pts.reduce((s, seg) => s + seg.slice(1).reduce(
  (a, p, i) => a + Math.hypot(p[0] - seg[i][0], p[1] - seg[i][1]), 0), 0) / TOTAL;
const P_STOMACH_IN = lenTo([S_ESO]);
const P_STOMACH_MID = lenTo([S_ESO, S_STO.slice(0, Math.round(S_STO.length * 0.55))]);
const P_SMALL_END = lenTo([S_ESO, S_STO, S_SMALL]);
const P_LARGE_MID = lenTo([S_ESO, S_STO, S_SMALL, S_LARGE.slice(0, Math.round(S_LARGE.length * 0.72))]);

const at = (p: number): Pt => {
  const target = Math.max(0, Math.min(1, p)) * TOTAL;
  let i = 1;
  while (i < CUM.length - 1 && CUM[i] < target) i++;
  const f = (target - CUM[i - 1]) / Math.max(1e-6, CUM[i] - CUM[i - 1]);
  return [ROUTE[i - 1][0] + (ROUTE[i][0] - ROUTE[i - 1][0]) * f,
    ROUTE[i - 1][1] + (ROUTE[i][1] - ROUTE[i - 1][1]) * f];
};

const STAGE: Record<StageKind, { cam: [number, number, number]; p: number }> = {
  hook: { cam: [540, 700, 0.85], p: 0 },
  mouth: { cam: [540, 370, 2.2], p: 0 },
  esophagus: { cam: [556, 580, 1.8], p: P_STOMACH_IN },
  stomach: { cam: [620, 800, 2.4], p: P_STOMACH_MID },
  small: { cam: [545, 1080, 1.85], p: P_SMALL_END },
  large: { cam: [545, 1090, 1.5], p: P_LARGE_MID },
  payoff: { cam: [540, 640, 0.8], p: P_LARGE_MID },
  cta: { cam: [540, 700, 0.85], p: P_LARGE_MID },
};

// ------------------------------------------------------------------ drawing

const INK = '#35607f';
const GLASS = 'rgba(240,248,255,0.55)';

const SKIN = '#e9f4fc';
const TORSO = `M488,462 L488,505 C430,515 330,530 292,570 C262,600 258,650 266,720 L286,930
  C292,1000 300,1060 306,1100 C296,1180 282,1250 280,1330 C278,1420 292,1480 300,1510 L780,1510
  C788,1480 802,1420 800,1330 C798,1250 784,1180 774,1100 C780,1060 788,1000 794,930 L814,720
  C822,650 818,600 788,570 C750,530 650,515 592,505 L592,462 Z`;
const ARM_L = 'M300,592 C255,642 238,762 236,882 C234,1002 238,1122 246,1232';
const ARM_R = 'M780,592 C825,642 842,762 844,882 C846,1002 842,1122 834,1232';

const Body: React.FC = () => (
  <g>
    <g opacity={0.9}>
      {[ARM_L, ARM_R].map((a, i) => (
        <g key={i}>
          <path d={a} fill="none" stroke={INK} strokeWidth={80} strokeLinecap="round" />
          <path d={a} fill="none" stroke={SKIN} strokeWidth={70} strokeLinecap="round" />
        </g>
      ))}
      <path d={TORSO} fill={SKIN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={540} cy={330} rx={118} ry={132} fill={SKIN} stroke={INK} strokeWidth={5} />
    </g>
    {/* face */}
    <circle cx={500} cy={318} r={10} fill={INK} />
    <circle cx={580} cy={318} r={10} fill={INK} />
    <path d="M508,382 Q540,400 572,382" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    {/* ribs, faint */}
    {[612, 658, 704].map((y, i) => (
      <path key={i} d={`M${318 - i * 4},${y} Q540,${y - 58} ${762 + i * 4},${y}`} fill="none"
        stroke="rgba(53,96,127,0.16)" strokeWidth={8} strokeLinecap="round" />
    ))}
  </g>
);

const Organs: React.FC<{ glow: StageKind }> = ({ glow }) => {
  const on = (k: StageKind) => (glow === k ? 1 : 0.62);
  return (
    <g>
      {/* liver (behind the stomach, the body's right side) */}
      <path d="M318,700 C380,672 520,668 612,700 C600,760 540,800 470,832 C410,858 350,850 322,812 C300,780 300,730 318,700 Z"
        fill="#a4473e" opacity={0.55} stroke="#6f2c26" strokeWidth={4} />
      {/* esophagus */}
      <path d={d(S_ESO)} fill="none" stroke="#b9566a" strokeWidth={30} strokeLinecap="round" opacity={on('esophagus')} />
      <path d={d(S_ESO)} fill="none" stroke="#f0a2b0" strokeWidth={20} strokeLinecap="round" opacity={on('esophagus')} />
      {/* large intestine */}
      <path d={d(S_LARGE)} fill="none" stroke="#9c5a3c" strokeWidth={54} strokeLinecap="round" strokeLinejoin="round" opacity={on('large')} />
      <path d={d(S_LARGE)} fill="none" stroke="#e59a72" strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" opacity={on('large')} />
      <path d={d(S_LARGE)} fill="none" stroke="rgba(156,90,60,0.55)" strokeWidth={42} strokeDasharray="4 26" opacity={on('large')} />
      {/* stomach */}
      <path d="M585,722 C600,700 650,700 690,730 C750,775 760,860 700,900 C650,932 590,905 575,880 C565,862 600,850 628,842 C660,832 668,800 640,770 C620,750 590,745 585,722 Z"
        fill="#ee8599" stroke="#a8465a" strokeWidth={6} opacity={on('stomach')} />
      {/* small intestine */}
      <path d={d(S_SMALL)} fill="none" stroke="#b8566a" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" opacity={on('small')} />
      <path d={d(S_SMALL)} fill="none" stroke="#f6b6bd" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" opacity={on('small')} />
    </g>
  );
};

// acid bubbles, nutrients, gut bacteria: small, seeded, and only in their stage
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Effects: React.FC<{ kind: StageKind; t: number; f: number; bolus: Pt }> = ({ kind, t, f, bolus }) => {
  if (kind === 'stomach') {
    return <g>{Array.from({ length: 14 }, (_, i) => {
      const life = ((f / FPS) * 0.9 + rnd(i, 1)) % 1;
      const x = 600 + rnd(i, 2) * 120;
      const y = 880 - life * 120;
      return <circle key={i} cx={x} cy={y} r={4 + rnd(i, 3) * 7} fill="#d7f266"
        opacity={t * 0.85 * (1 - life)} stroke="#8aa52a" strokeWidth={2} />;
    })}</g>;
  }
  if (kind === 'small') {
    return <g>{Array.from({ length: 18 }, (_, i) => {
      const life = ((f / FPS) * 0.7 + rnd(i, 4)) % 1;
      const ang = rnd(i, 5) * Math.PI * 2;
      const x = bolus[0] + Math.cos(ang) * life * 150;
      const y = bolus[1] + Math.sin(ang) * life * 110 - life * 40;
      return <circle key={i} cx={x} cy={y} r={6} fill="#ffd34d" stroke="#b8860b" strokeWidth={2}
        opacity={t * (1 - life)} />;
    })}</g>;
  }
  if (kind === 'large') {
    return <g>{Array.from({ length: 16 }, (_, i) => {
      const a = rnd(i, 6) * 1;
      const p = at(Math.max(0, P_LARGE_MID - 0.02 - a * 0.22));
      const wob = Math.sin(f / 6 + i) * 6;
      return <rect key={i} x={p[0] - 9 + wob} y={p[1] - 4 + rnd(i, 7) * 14 - 7} width={18} height={8}
        rx={4} fill="#8f6ad8" opacity={t * 0.9} transform={`rotate(${rnd(i, 8) * 180} ${p[0]} ${p[1]})`} />;
    })}</g>;
  }
  return null;
};

// ------------------------------------------------------------------ overlays

const Counter: React.FC<{ text: string; t: number }> = ({ text, t }) => (
  <div style={{
    position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 132, color: '#fff',
    textShadow: '0 8px 30px rgba(20,60,100,0.55)', letterSpacing: 2,
    WebkitTextStroke: '5px #0f2d47', paintOrder: 'stroke fill',
    opacity: t, transform: `scale(${0.8 + 0.2 * EASE_OUT(t)})`,
  }}>{text}</div>
);

const Tag: React.FC<{ text: string; t: number }> = ({ text, t }) => (
  <div style={{
    position: 'absolute', top: 420, left: 0, right: 0, display: 'flex', justifyContent: 'center',
    opacity: t,
  }}>
    <div style={{
      background: 'rgba(12,32,52,0.88)', border: '3px solid #ffd34d', borderRadius: 16,
      padding: '10px 28px', color: '#fff', fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: 700, fontSize: 44, letterSpacing: 3,
    }}>{text}</div>
  </div>
);

const Fact: React.FC<{ big: string; small: string; t: number }> = ({ big, small, t }) => (
  <div style={{
    position: 'absolute', top: 300, left: 70, right: 70, textAlign: 'center', opacity: t,
    transform: `translateY(${(1 - EASE_OUT(t)) * 40}px)`,
    background: 'rgba(12,32,52,0.86)', borderRadius: 28, padding: '28px 20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
  }}>
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 120, color: '#ffd34d', lineHeight: 1 }}>{big}</div>
    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 44, color: '#fff', marginTop: 12 }}>{small}</div>
  </div>
);

// ------------------------------------------------------------------ main

const BodyJourney: React.FC<Partial<BodyProps>> = ({
  food = { name: 'banana', emoji: '\u{1F34C}', bolus: '#f2cf5b' }, vo = [], stages = [],
  title = '', cta, durationInSeconds = 30,
}) => {
  const f = useCurrentFrame();
  const sec = f / FPS;
  const startOf = (line: number) => (vo[line]?.start ?? durationInSeconds);
  const idx = Math.max(0, stages.findIndex((s, i) =>
    sec >= startOf(s.line) && (i === stages.length - 1 || sec < startOf(stages[i + 1].line))));
  const cur = stages[idx] || { line: 0, kind: 'hook' as StageKind };
  const prev = stages[idx - 1] || cur;
  const t0 = startOf(cur.line);
  const t1 = idx + 1 < stages.length ? startOf(stages[idx + 1].line) : durationInSeconds;
  const k = EASE_INOUT(prog(sec, t0, t0 + 0.9));                    // camera move
  const [px, py, pz] = STAGE[prev.kind].cam;
  const [cx, cy, cz] = STAGE[cur.kind].cam;
  const camX = px + (cx - px) * k;
  const camY = py + (cy - py) * k;
  const camZ = pz + (cz - pz) * k;
  const drift = 1 + 0.04 * prog(sec, t0, t1);                       // slow push-in
  const move = EASE_INOUT(prog(sec, t0, t0 + Math.max(0.8, (t1 - t0) * 0.75)));
  const p = STAGE[prev.kind].p + (STAGE[cur.kind].p - STAGE[prev.kind].p) * move;
  const bolus = at(p);
  const inT = prog(sec, t0, t0 + 0.4);

  // the food: whole on the way in, mush after the stomach
  const chewed = cur.kind !== 'hook' && cur.kind !== 'mouth';
  const whole = !chewed;
  const chew = cur.kind === 'mouth' ? 1 + 0.12 * Math.sin(sec * 18) : 1;
  const size = cur.kind === 'hook' ? 150 : 96 * chew;
  const foodPos: Pt = cur.kind === 'hook' ? [540, 150 + 12 * Math.sin(sec * 3)] : bolus;
  const blobR = cur.kind === 'esophagus' ? 20 : cur.kind === 'stomach' ? 28 : cur.kind === 'small' ? 16 : 13;

  const zoom = camZ * drift;
  const tx = W / 2 - camX * zoom;
  const ty = H / 2 - camY * zoom;
  const fadeCard = (s: Stage | undefined) => (s ? EASE_OUT(inT) : 0);

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#d7efff 0%,#9fd3f5 55%,#6fb4e3 100%)' }}>
      {/* studio floor grid */}
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

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${tx},${ty}) scale(${zoom})`}>
          <ellipse cx={540} cy={1530} rx={300} ry={36} fill="rgba(20,60,100,0.16)" />
          <Body />
          <Organs glow={cur.kind} />
          <Effects kind={cur.kind} t={inT} f={f} bolus={bolus} />
          {chewed && (
            <g>
              <circle cx={bolus[0]} cy={bolus[1]} r={blobR + 6} fill={food.bolus} opacity={0.35} />
              <circle cx={bolus[0]} cy={bolus[1]} r={blobR} fill={food.bolus} stroke="#8a6d1a" strokeWidth={3} />
            </g>
          )}
          {whole && cur.kind === 'mouth' && (
            <text x={foodPos[0] + 4} y={foodPos[1] + 34} fontSize={size} textAnchor="middle">{food.emoji}</text>
          )}
          {cur.kind === 'mouth' && Array.from({ length: 6 }, (_, i) => (
            <circle key={i} cx={540 + (rnd(i, 9) - 0.5) * 90} cy={402 + rnd(i, 10) * 40}
              r={5} fill={food.bolus} opacity={0.8 * inT} />
          ))}
        </g>
      </svg>

      {/* hook: the food and the question, over the whole body */}
      {cur.kind === 'hook' && (
        <>
          <div style={{
            position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontSize: 190,
            transform: `translateY(${12 * Math.sin(sec * 3)}px)`,
          }}>{food.emoji}</div>
          {title && (
            <div style={{
              position: 'absolute', top: 330, left: 50, right: 50, textAlign: 'center',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 78, lineHeight: 1.05,
              color: '#0f2d47', textShadow: '0 4px 18px rgba(255,255,255,0.8)',
            }}>{title}</div>
          )}
        </>
      )}
      {cur.counter && cur.kind !== 'payoff' && <Counter text={cur.counter} t={fadeCard(cur)} />}
      {cur.label && <Tag text={cur.label} t={fadeCard(cur)} />}
      {cur.fact && cur.kind === 'payoff' && <Fact big={cur.fact.big} small={cur.fact.small} t={fadeCard(cur)} />}

      {cta && <EndCard from={Math.round(startOf(cta.fromLine) * FPS)} text={cta.text} />}
      <Captions lines={vo} y={1560} accent="#ffd34d" maxWords={3} size={58} plate />
    </AbsoluteFill>
  );
};

export default BodyJourney;
