import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Single Sakura Blossom Flower:
 * 5 radial petals around a central pistil, rendered in high-contrast cherry blossom pinks
 * (sakura rose, blush petal, tender pink, and pale sakura bloom) popping over the deep teal base.
 */
function Blossom({
  cx = 0,
  cy = 0,
  size = 14,
  rotate = 0,
  tone = '#FBCFE8',
  centerTone = '#BE185D',
  innerDot = '#FFF1F2',
}) {
  const petalR = size * 0.44;
  const offset = size * 0.32;

  const secondaryColor =
    tone === '#FBCFE8'
      ? '#FDF2F8'
      : tone === '#FDA4AF'
      ? '#FFE4E6'
      : tone === '#F472B6'
      ? '#FCE7F3'
      : tone === '#FCE7F3'
      ? '#FFF5F8'
      : '#FFF0F5';

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotate})`}>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-offset}
          rx={petalR * 0.7}
          ry={petalR}
          transform={`rotate(${angle})`}
          fill={i % 2 === 0 ? tone : secondaryColor}
          opacity="0.95"
        />
      ))}
      <circle cx={0} cy={0} r={size * 0.19} fill={centerTone} />
      <circle cx={0} cy={0} r={size * 0.09} fill={innerDot} />
    </g>
  );
}

/**
 * Blossom Cluster Variants:
 * Multi-flower clusters with distinct geometry, counts (2-5), and harmonious cherry blossom pinks.
 */
const BLOSSOM_CLUSTERS = [
  // Variant 0: 4 flowers + bud
  {
    flowers: [
      { dx: -10, dy: -6, size: 15, rot: 15, tone: '#FBCFE8' },
      { dx: 0, dy: 0, size: 16.5, rot: 45, tone: '#FDA4AF' },
      { dx: 11, dy: -4, size: 14, rot: 90, tone: '#FCE7F3' },
      { dx: 18, dy: 6, size: 12.5, rot: 150, tone: '#F472B6' },
    ],
    bud: { dx: -18, dy: -10, size: 7, rot: 25, tone: '#FB7185' },
  },
  // Variant 1: 2 flowers duo
  {
    flowers: [
      { dx: -4, dy: -2, size: 17, rot: 20, tone: '#FDA4AF' },
      { dx: 9, dy: 8, size: 13, rot: 115, tone: '#FBCFE8' },
    ],
    bud: null,
  },
  // Variant 2: 5 flowers rounded spray
  {
    flowers: [
      { dx: -2, dy: -4, size: 16, rot: 0, tone: '#FBCFE8' },
      { dx: -11, dy: 5, size: 13.5, rot: 60, tone: '#FFF1F2' },
      { dx: 10, dy: 2, size: 15, rot: 130, tone: '#F472B6' },
      { dx: 3, dy: 11, size: 12.5, rot: 195, tone: '#FDA4AF' },
      { dx: -8, dy: -10, size: 11.5, rot: 250, tone: '#FCE7F3' },
    ],
    bud: { dx: 16, dy: -10, size: 6.5, rot: 40, tone: '#FB7185' },
  },
  // Variant 3: 3 flowers drift
  {
    flowers: [
      { dx: -9, dy: 8, size: 15.5, rot: 35, tone: '#FFF0F5' },
      { dx: 2, dy: 0, size: 13.5, rot: 80, tone: '#FBCFE8' },
      { dx: 12, dy: -8, size: 15, rot: 140, tone: '#FDA4AF' },
    ],
    bud: null,
  },
];

function BlossomClusterGroup({ x, y, variant = 0, scale = 1, rotation = 0 }) {
  const config = BLOSSOM_CLUSTERS[variant % BLOSSOM_CLUSTERS.length];
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {config.flowers.map((f, i) => (
        <Blossom
          key={i}
          cx={f.dx * scale}
          cy={f.dy * scale}
          size={f.size * scale}
          rotate={f.rot}
          tone={f.tone}
        />
      ))}
      {config.bud && (
        <g transform={`translate(${config.bud.dx * scale}, ${config.bud.dy * scale}) rotate(${config.bud.rot})`}>
          <ellipse cx={0} cy={0} rx={config.bud.size * 0.45 * scale} ry={config.bud.size * 0.8 * scale} fill={config.bud.tone} opacity="0.95" />
          <path
            d={`M ${-config.bud.size * 0.25 * scale} ${config.bud.size * 0.5 * scale} Q 0 ${config.bud.size * 0.8 * scale} ${config.bud.size * 0.25 * scale} ${config.bud.size * 0.5 * scale}`}
            stroke="#9F1239"
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      )}
    </g>
  );
}

/**
 * LoginBlossomScene
 * Full-bleed atmospheric hero illustration using the exact 9-step teal scale
 * with organic cherry blossom branches extending across the canvas.
 */
export default function LoginBlossomScene({ className = '' }) {
  const shouldReduceMotion = useReducedMotion();

  // 8 sparse continuous falling petals drifting across the full width
  const fallingPetals = useMemo(
    () => [
      { id: 1, startX: 160, driftX: 60, startY: -40, duration: 8.5, delay: 0, size: 3.4, rot: 45, fill: '#FBCFE8' },
      { id: 2, startX: 380, driftX: -70, startY: -60, duration: 9.2, delay: 2.1, size: 2.9, rot: -30, fill: '#FDA4AF' },
      { id: 3, startX: 620, driftX: 55, startY: -50, duration: 7.8, delay: 4.3, size: 3.5, rot: 80, fill: '#FCE7F3' },
      { id: 4, startX: 840, driftX: -80, startY: -40, duration: 8.9, delay: 1.2, size: 3.1, rot: -60, fill: '#F472B6' },
      { id: 5, startX: 1060, driftX: 65, startY: -70, duration: 9.6, delay: 3.4, size: 3.6, rot: 110, fill: '#FBCFE8' },
      { id: 6, startX: 1240, driftX: -50, startY: -50, duration: 8.2, delay: 0.7, size: 3.0, rot: -15, fill: '#FDA4AF' },
      { id: 7, startX: 1390, driftX: 45, startY: -60, duration: 9.0, delay: 2.9, size: 3.2, rot: 75, fill: '#FCE7F3' },
    ],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: 'easeOut' }}
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
      >
        <defs>
          {/* Depth of field blur for background branch layer */}
          <filter id="dof-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>

          {/* Soft blur for ambient lamp/portal glow */}
          <filter id="portal-glow-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="40" />
          </filter>

          {/* Full-bleed 9-step Teal Scale Gradient: Smooth light-to-dark progression */}
          <linearGradient id="teal-scale-sky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A2D8E8" />    {/* teal-50 */}
            <stop offset="12.5%" stopColor="#7DC3D2" /> {/* teal-100 */}
            <stop offset="25%" stopColor="#57A7B5" />   {/* teal-200 */}
            <stop offset="37.5%" stopColor="#3F8D99" /> {/* teal-300 */}
            <stop offset="50%" stopColor="#2E757F" />   {/* teal-400 */}
            <stop offset="62.5%" stopColor="#1D5B66" /> {/* teal-500 */}
            <stop offset="75%" stopColor="#0E434D" />   {/* teal-600 */}
            <stop offset="87.5%" stopColor="#092D33" /> {/* teal-700 */}
            <stop offset="100%" stopColor="#011B22" />  {/* teal-800 */}
          </linearGradient>

          {/* Warm white / pale gold lamp-light anchor glow behind the form card */}
          <radialGradient id="warm-lamp-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.14" />
            <stop offset="70%" stopColor="#A2D8E8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#011B22" stopOpacity="0" />
          </radialGradient>

          {/* Botanical branch wood tone grounded in deep teal timber */}
          <linearGradient id="blossom-branch-wood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#092D33" />
            <stop offset="45%" stopColor="#1C2E2C" />
            <stop offset="100%" stopColor="#2E2325" />
          </linearGradient>

          {/* Subtle teal atmospheric nebula cloud */}
          <radialGradient id="nebula-soft" cx="30%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2E757F" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#1D5B66" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#011B22" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Sky Background */}
        <g id="sky">
          <rect width="1440" height="900" fill="url(#teal-scale-sky)" />
          <ellipse cx="440" cy="380" rx="720" ry="460" fill="url(#nebula-soft)" />
          {/* Distant soft celestial specks */}
          {[
            { cx: 120, cy: 90, r: 1.2, op: 0.6 },
            { cx: 280, cy: 160, r: 0.8, op: 0.4 },
            { cx: 520, cy: 80, r: 1.4, op: 0.7 },
            { cx: 760, cy: 140, r: 1.0, op: 0.5 },
            { cx: 980, cy: 70, r: 1.5, op: 0.75 },
            { cx: 1180, cy: 130, r: 0.9, op: 0.45 },
            { cx: 1360, cy: 95, r: 1.3, op: 0.65 },
            { cx: 890, cy: 260, r: 1.1, op: 0.5 },
            { cx: 680, cy: 420, r: 0.8, op: 0.35 },
            { cx: 340, cy: 680, r: 1.2, op: 0.55 },
          ].map((s, idx) => (
            <circle key={idx} cx={s.cx} cy={s.cy} r={s.r} fill="#E0F2FE" opacity={s.op} />
          ))}
        </g>

        {/* 2. Warm Lamp/Portal Anchor Glow (Positioned behind login card at ~72% X, 50% Y) */}
        <g id="glow">
          <ellipse
            cx="1000"
            cy="450"
            rx="380"
            ry="360"
            fill="url(#warm-lamp-glow)"
            filter="url(#portal-glow-blur)"
          />
        </g>

        {/* 3. Background Branches (Soft depth-of-field layer) */}
        <g id="branches-back" filter="url(#dof-blur)" opacity="0.45">
          {/* Top-left background branch */}
          <path
            d="M -30 -30 Q 180 60 360 160 Q 460 220 540 250"
            stroke="#092D33"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 220 90 Q 320 110 420 80"
            stroke="#092D33"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <BlossomClusterGroup x={380} y={150} variant={2} scale={1.2} rotation={-15} />
          <BlossomClusterGroup x={520} y={240} variant={0} scale={1.1} rotation={20} />
          <BlossomClusterGroup x={420} y={80} variant={3} scale={1.0} rotation={-25} />

          {/* Bottom-right background branch */}
          <path
            d="M 1480 930 Q 1280 820 1100 720 Q 980 650 880 620"
            stroke="#092D33"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 1180 770 Q 1060 810 940 840"
            stroke="#092D33"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <BlossomClusterGroup x={900} y={630} variant={0} scale={1.2} rotation={30} />
          <BlossomClusterGroup x={1120} y={710} variant={2} scale={1.1} rotation={-10} />
          <BlossomClusterGroup x={960} y={830} variant={1} scale={1.0} rotation={45} />
        </g>

        {/* 4. Foreground Branches (Crisp cherry blossom canopy extending from corners) */}
        <g id="branches-front">
          {/* Top-Left Major Blossom Branch Assembly with slow, gentle idle sway */}
          <motion.g
            id="top-left-branch"
            animate={shouldReduceMotion ? {} : { rotate: [-0.4, 0.4, -0.4] }}
            transition={{
              duration: 6.2,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            style={{ transformOrigin: '0px 0px' }}
          >
            {/* Main sweeping trunk/bough */}
            <path
              d="M -40 -20 Q 140 80 290 190 Q 380 260 480 300"
              stroke="url(#blossom-branch-wood)"
              strokeWidth="15"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sub-fork 1: Reaching toward center-top */}
            <path
              d="M 170 100 Q 280 90 410 120 Q 480 140 540 130"
              stroke="url(#blossom-branch-wood)"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sub-fork 2: Reaching downward */}
            <path
              d="M 270 175 Q 290 280 260 370 Q 240 430 200 480"
              stroke="url(#blossom-branch-wood)"
              strokeWidth="7.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sub-fork 3: Mid-reach spur */}
            <path
              d="M 370 250 Q 460 270 520 340"
              stroke="url(#blossom-branch-wood)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Clusters along top-left branch */}
            <BlossomClusterGroup x={240} y={150} variant={0} scale={1.3} rotation={12} />
            <BlossomClusterGroup x={350} y={230} variant={2} scale={1.4} rotation={-8} />
            <BlossomClusterGroup x={470} y={290} variant={1} scale={1.25} rotation={35} />
            <BlossomClusterGroup x={410} y={120} variant={3} scale={1.2} rotation={-20} />
            <BlossomClusterGroup x={530} y={130} variant={2} scale={1.35} rotation={10} />
            <BlossomClusterGroup x={280} y={320} variant={0} scale={1.15} rotation={-45} />
            <BlossomClusterGroup x={210} y={460} variant={1} scale={1.1} rotation={25} />
            <BlossomClusterGroup x={510} y={335} variant={3} scale={1.2} rotation={-15} />
            <BlossomClusterGroup x={120} y={65} variant={2} scale={1.1} rotation={40} />
          </motion.g>

          {/* Bottom-Right Major Blossom Branch Assembly with slow, gentle idle counter-sway */}
          <motion.g
            id="bottom-right-branch"
            animate={shouldReduceMotion ? {} : { rotate: [0.35, -0.35, 0.35] }}
            transition={{
              duration: 5.8,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: 0.5,
            }}
            style={{ transformOrigin: '1440px 900px' }}
          >
            {/* Main sweeping trunk/bough coming from bottom-right corner */}
            <path
              d="M 1490 920 Q 1320 800 1160 700 Q 1040 620 920 580"
              stroke="url(#blossom-branch-wood)"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sub-fork 1: Upward reach behind the card edge */}
            <path
              d="M 1240 750 Q 1220 620 1200 520 Q 1180 440 1140 380"
              stroke="url(#blossom-branch-wood)"
              strokeWidth="8.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sub-fork 2: Lower sweeping spur */}
            <path
              d="M 1140 685 Q 1020 720 910 780 Q 840 820 780 840"
              stroke="url(#blossom-branch-wood)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sub-fork 3: Delicate mid-spur spilling behind/around card edge */}
            <path
              d="M 1020 610 Q 940 540 860 520"
              stroke="url(#blossom-branch-wood)"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Clusters along bottom-right branch */}
            <BlossomClusterGroup x={1260} y={760} variant={2} scale={1.4} rotation={-15} />
            <BlossomClusterGroup x={1120} y={670} variant={0} scale={1.35} rotation={22} />
            <BlossomClusterGroup x={930} y={575} variant={2} scale={1.45} rotation={-25} />
            <BlossomClusterGroup x={860} y={520} variant={1} scale={1.15} rotation={40} />
            <BlossomClusterGroup x={1200} y={540} variant={3} scale={1.25} rotation={-30} />
            <BlossomClusterGroup x={1145} y={395} variant={0} scale={1.2} rotation={15} />
            <BlossomClusterGroup x={920} y={770} variant={2} scale={1.25} rotation={-10} />
            <BlossomClusterGroup x={795} y={830} variant={1} scale={1.1} rotation={35} />
            <BlossomClusterGroup x={1380} y={850} variant={3} scale={1.3} rotation={-5} />
          </motion.g>
        </g>

        {/* 5. Continuous Sparse Falling Petals (Slow ambient drift across the entire viewport) */}
        {!shouldReduceMotion && (
          <g id="petals-falling">
            {fallingPetals.map((p) => (
              <motion.ellipse
                key={p.id}
                cx={0}
                cy={0}
                rx={p.size}
                ry={p.size * 0.6}
                fill={p.fill}
                initial={{
                  x: p.startX,
                  y: p.startY,
                  opacity: 0,
                  rotate: p.rot,
                }}
                animate={{
                  x: [p.startX, p.startX + p.driftX * 0.4, p.startX + p.driftX * 0.8, p.startX + p.driftX],
                  y: [p.startY, p.startY + 300, p.startY + 600, 940],
                  rotate: [p.rot, p.rot + 50, p.rot + 110, p.rot + 190],
                  opacity: [0, 0.85, 0.75, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </g>
        )}
      </svg>
    </motion.div>
  );
}
