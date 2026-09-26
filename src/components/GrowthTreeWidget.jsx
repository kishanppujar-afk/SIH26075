import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getStageInfo } from '../utils/growthStage';

// Session storage key to ensure initial grow-in plays once per browser session
const SESSION_KEY = 'skillstat_growth_tree_mounted';

/**
 * Shared SVG Defs (Gradients, Filters for Soft Ground Shadow & Bark Textures)
 */
function SvgDefs() {
  return (
    <defs>
      {/* Soft Gaussian blur for realistic ground shadow */}
      <filter id="soft-shadow-blur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.2" />
      </filter>

      {/* Radial gradient for gentle, non-harsh ground shadow */}
      <radialGradient id="ground-shadow-radial" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#475569" stopOpacity="0.28" />
        <stop offset="60%" stopColor="#64748B" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
      </radialGradient>

      {/* Trunk wood tone gradient */}
      <linearGradient id="trunk-wood-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4A3B32" />
        <stop offset="45%" stopColor="#5C4A3E" />
        <stop offset="100%" stopColor="#6E5A4D" />
      </linearGradient>

      {/* Sunlight highlight on upper canopy */}
      <linearGradient id="sun-highlight-grad" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#A7C9BD" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#7EA899" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#5B8C7B" stopOpacity="0.1" />
      </linearGradient>

      {/* Sunlight highlight on upper canopy for Peak Bloom (pale airy cherry blossom / white-blush) */}
      <linearGradient id="pink-sun-highlight-grad" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#FFF0F5" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#FDE4EC" stopOpacity="0.4" />
      </linearGradient>
    </defs>
  );
}

/**
 * Shared Ground Base with blurred shadow and subtle soil mound
 */
function GroundBase() {
  return (
    <g id="ground-base">
      {/* Soft blurred ambient shadow ellipse */}
      <ellipse
        cx="120"
        cy="212"
        rx="72"
        ry="8"
        fill="url(#ground-shadow-radial)"
        filter="url(#soft-shadow-blur)"
      />
      {/* Very soft organic ground line */}
      <path
        d="M 48 212 Q 120 207 192 212 Q 120 216 48 212 Z"
        fill="#E2E8F0"
        opacity="0.45"
      />
    </g>
  );
}

/**
 * Single Sakura Blossom Flower:
 * 5 radial petals around a central pistil dot.
 */
function SakuraBlossom({ cx = 0, cy = 0, size = 8, rotate = 0, tone = '#F4C2C2', isPeak = false }) {
  const petalR = size * 0.42;
  const offset = size * 0.32;

  // For 100% Peak Bloom: lighter, clear, bright cherry blossom fuchsia-light palette
  const peakMainTone =
    tone === '#F4C2C2'
      ? '#FF7597'
      : tone === '#FBCFE8'
      ? '#F472B6'
      : tone === '#FDA4AF'
      ? '#FB7185'
      : tone === '#F9D8D8'
      ? '#FF85A1'
      : '#FF6584';

  const peakLightTone = '#FFF0F5';
  const peakCenterTone = '#FF2E63';
  const peakInnerDot = '#FB7185';

  const mainColor = isPeak ? peakMainTone : tone;
  const secondaryColor = isPeak
    ? peakLightTone
    : tone === '#F4C2C2'
    ? '#F9D8D8'
    : tone === '#FBCFE8'
    ? '#FDF2F8'
    : tone === '#FDA4AF'
    ? '#FFE4E6'
    : '#FCE7F3';

  const centerTone = isPeak
    ? peakCenterTone
    : tone === '#FDA4AF'
    ? '#FB7185'
    : '#E8A0BF';

  const innerDot = isPeak ? peakInnerDot : '#BE185D';

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotate})`}>
      {/* 5 Petals */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={0}
          cy={-offset}
          rx={petalR * 0.72}
          ry={petalR}
          transform={`rotate(${angle})`}
          fill={i % 2 === 0 ? mainColor : secondaryColor}
          opacity="0.96"
        />
      ))}
      {/* Blossom center pistil */}
      <circle cx={0} cy={0} r={size * 0.18} fill={centerTone} />
      <circle cx={0} cy={0} r={size * 0.09} fill={innerDot} />
    </g>
  );
}

/**
 * Small Sakura Blossom Bud Primitive:
 * Adds natural botanical variation to clusters
 */
function SakuraBud({ cx = 0, cy = 0, size = 4.5, rotate = 0, tone = '#F472B6', isPeak = false }) {
  const budTone = isPeak ? '#FF6584' : tone;
  const stemTone = isPeak ? '#F4A9BC' : '#5B8C7B';
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${rotate})`}>
      <ellipse cx={0} cy={0} rx={size * 0.45} ry={size * 0.8} fill={budTone} opacity="0.95" />
      <path
        d={`M ${-size * 0.25} ${size * 0.5} Q 0 ${size * 0.8} ${size * 0.25} ${size * 0.5}`}
        stroke={stemTone}
        strokeWidth="1"
        fill="none"
      />
    </g>
  );
}

/**
 * 5 Distinct Hand-Crafted Blossom Cluster Variants:
 */
const CLUSTER_VARIANTS = [
  // Variant 0: "Cascade Arc" (4 flowers + tiny bud)
  {
    flowers: [
      { dx: -7, dy: -4, size: 8.5, rot: 12, tone: '#F4C2C2' },
      { dx: 0, dy: 0, size: 9.2, rot: 48, tone: '#F9D8D8' },
      { dx: 7, dy: -2, size: 7.8, rot: 95, tone: '#FBCFE8' },
      { dx: 13, dy: 4, size: 6.8, rot: 160, tone: '#FDA4AF' },
    ],
    bud: { dx: -12, dy: -7, size: 4.2, rot: 25, tone: '#F472B6' },
  },
  // Variant 1: "Tender Duo" (2 flowers)
  {
    flowers: [
      { dx: -2, dy: -1, size: 9.6, rot: 28, tone: '#FBCFE8' },
      { dx: 6, dy: 5, size: 7.2, rot: 110, tone: '#F4C2C2' },
    ],
    bud: null,
  },
  // Variant 2: "Full Rounded Spray" (5 flowers + bud)
  {
    flowers: [
      { dx: -1, dy: -2, size: 9.0, rot: 0, tone: '#F9D8D8' },
      { dx: -7, dy: 3, size: 7.6, rot: 65, tone: '#F4C2C2' },
      { dx: 6, dy: 1, size: 8.4, rot: 130, tone: '#FDA4AF' },
      { dx: 2, dy: 7, size: 7.0, rot: 195, tone: '#FBCFE8' },
      { dx: -5, dy: -6, size: 6.5, rot: 250, tone: '#F472B6' },
    ],
    bud: { dx: 10, dy: -6, size: 4.0, rot: 40, tone: '#FB7185' },
  },
  // Variant 3: "Diagonal Drift" (3 flowers)
  {
    flowers: [
      { dx: -6, dy: 6, size: 8.8, rot: 40, tone: '#F4C2C2' },
      { dx: 1, dy: 0, size: 7.5, rot: 85, tone: '#FBCFE8' },
      { dx: 8, dy: -5, size: 8.4, rot: 145, tone: '#F9D8D8' },
    ],
    bud: null,
  },
  // Variant 4: "Horizontal Trio" (3 flowers + delicate bud)
  {
    flowers: [
      { dx: -6, dy: 1, size: 8.0, rot: 15, tone: '#FDA4AF' },
      { dx: 2, dy: -3, size: 9.2, rot: 70, tone: '#F9D8D8' },
      { dx: 9, dy: 2, size: 7.4, rot: 125, tone: '#F4C2C2' },
    ],
    bud: { dx: 14, dy: 6, size: 4.0, rot: 180, tone: '#FB7185' },
  },
];

/**
 * Sakura Blossom Cluster:
 * Scales and fades into view if newly introduced; stays stable if already present.
 */
function BlossomCluster({
  x,
  y,
  variant = 0,
  scale = 1,
  rotation = 0,
  delay = 0,
  isPeak = false,
  shouldAnimate = true,
  shouldReduceMotion = false,
}) {
  const config = CLUSTER_VARIANTS[variant % CLUSTER_VARIANTS.length];

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <motion.g
        initial={shouldReduceMotion || !shouldAnimate ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : shouldAnimate
            ? { delay, duration: 0.35, ease: 'easeOut' }
            : { duration: 0 }
        }
      >
        {config.flowers.map((b, idx) => (
          <SakuraBlossom
            key={idx}
            cx={b.dx * scale}
            cy={b.dy * scale}
            size={b.size * scale}
            rotate={b.rot}
            tone={b.tone}
            isPeak={isPeak}
          />
        ))}
        {config.bud && (
          <SakuraBud
            cx={config.bud.dx * scale}
            cy={config.bud.dy * scale}
            size={config.bud.size * scale}
            rotate={config.bud.rot}
            tone={config.bud.tone}
            isPeak={isPeak}
          />
        )}
      </motion.g>
    </g>
  );
}

/**
 * Stage 1: Seed / Sprout (0–24%)
 * Staggered Sequence:
 * 1. Stem reveals from soil (Step 1 Trunk/Stem)
 * 2. Sprout leaves unfurl (Step 3 Leaves)
 * Followed by gentle natural breeze sway on leaves
 * Note: Preserved untouched as requested.
 */
function SproutStage({ isInitialMount, shouldReduceMotion }) {
  const shouldAnimate = !shouldReduceMotion && isInitialMount;

  return (
    <motion.g
      id="sprout-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      {/* Seed Pod nestled in soil */}
      <motion.g
        initial={shouldAnimate ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        style={{ transformOrigin: '120px 210px' }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
      >
        <path
          d="M 112 210 C 110 203 122 199 129 203 C 133 209 125 214 116 213 Z"
          fill="#5C4A3E"
        />
        <path
          d="M 115 208 C 117 204 124 204 126 207"
          stroke="#786659"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </motion.g>

      {/* Step 1: Main Curved Sprout Stem */}
      <motion.path
        d="M 120 206 C 117 175 127 145 120 115 C 118 104 122 96 126 92"
        stroke="#5B8C7B"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        initial={shouldAnimate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' }}
      />

      {/* Step 3: Sprout Leaves with gentle natural sway once appeared */}
      <motion.g
        animate={shouldReduceMotion ? {} : { rotate: [-1, 1, -1] }}
        transition={{
          duration: 4.8,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        style={{ transformOrigin: '120px 115px' }}
      >
        <motion.g
          initial={shouldAnimate ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          style={{ transformOrigin: '120px 115px' }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.32, duration: 0.38, ease: 'easeOut' }}
        >
          {/* Left primary curled leaf */}
          <path
            d="M 120 120 C 95 116 85 134 92 148 C 106 153 118 140 120 120 Z"
            fill="#5B8C7B"
          />
          {/* Leaf vein */}
          <path
            d="M 118 123 C 106 130 98 138 96 144"
            stroke="#7EA899"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right top curling leaf */}
          <path
            d="M 126 92 C 144 78 162 90 158 108 C 146 116 134 108 126 92 Z"
            fill="#7EA899"
          />
          {/* Vein */}
          <path
            d="M 128 95 C 138 98 148 104 152 106"
            stroke="#A7C9BD"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />

          {/* Top young bud highlight */}
          <path
            d="M 125 92 C 123 78 133 70 140 73 C 143 83 133 90 125 92 Z"
            fill="#A7C9BD"
          />

          {/* Dew drop */}
          <circle cx="152" cy="102" r="2.2" fill="#FFFFFF" opacity="0.85" />
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

/**
 * Stage 2: Young Sapling (Medium Plant, 25–49%)
 * Staggered Sequence:
 * 1. Trunk stem rises from soil (Step 1 Trunk)
 * 2. 3 Asymmetric branches grow outward from connection points (Step 2 Branches)
 * 3. 4 Leaf clusters scale & fade in at branch tips (Step 3 Leaves)
 * Upper structure gently breathes with slow, subtle light breeze sway
 * Note: Small -> Medium transition animation preserved as requested.
 */
function SaplingStage({ shouldReduceMotion }) {
  return (
    <motion.g
      id="sapling-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
    >
      {/* Step 1: Tapered Trunk Stem rising from soil mound */}
      <motion.path
        d="M 116 212 C 117 180 121 145 119 110 C 118 90 121 75 120 55 L 123 55 C 124 75 121 90 122 110 C 124 145 121 180 124 212 Z"
        fill="url(#trunk-wood-grad)"
        initial={shouldReduceMotion ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ transformOrigin: '120px 212px' }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' }}
      />

      {/* Upper branch & foliage assembly with subtle natural sway */}
      <motion.g
        id="sapling-canopy-group"
        animate={shouldReduceMotion ? {} : { rotate: [-0.6, 0.6, -0.6] }}
        transition={{
          duration: 5.2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        style={{ transformOrigin: '120px 145px' }}
      >
        {/* Step 2: Asymmetric Organic Branch Forks growing outward */}
        <g id="sapling-branches">
          {/* Lower left branch */}
          <motion.path
            d="M 119 145 C 108 136 94 132 78 130"
            stroke="#5C4A3E"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
            initial={shouldReduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.22, duration: 0.35, ease: 'easeOut' }}
          />
          {/* Upper right branch */}
          <motion.path
            d="M 121 112 C 132 102 146 96 164 92"
            stroke="#5C4A3E"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
            initial={shouldReduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.28, duration: 0.35, ease: 'easeOut' }}
          />
          {/* Mid left sub-fork */}
          <motion.path
            d="M 120 86 C 112 76 102 72 90 70"
            stroke="#5C4A3E"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            initial={shouldReduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.34, duration: 0.35, ease: 'easeOut' }}
          />
        </g>

        {/* Step 3: Organic Leaf Clusters unfolding at branch connection tips */}
        <g id="sapling-leaves">
          {/* Top crown leaf group */}
          <motion.g
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: '121px 55px' }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.46, duration: 0.35, ease: 'easeOut' }}
          >
            <path
              d="M 121 55 C 112 40 120 28 126 30 C 132 38 126 50 121 55 Z"
              fill="#7EA899"
            />
            <path
              d="M 121 55 C 132 45 142 50 140 60 C 134 65 125 60 121 55 Z"
              fill="#A7C9BD"
            />
            <path
              d="M 121 55 C 108 48 104 60 108 68 C 114 70 120 62 121 55 Z"
              fill="#5B8C7B"
            />
          </motion.g>

          {/* Left lower branch leaves */}
          <motion.g
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: '78px 130px' }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.52, duration: 0.35, ease: 'easeOut' }}
          >
            <path
              d="M 78 130 C 65 120 68 108 78 112 C 86 118 84 126 78 130 Z"
              fill="#5B8C7B"
            />
            <path
              d="M 78 130 C 68 135 70 148 82 144 C 88 138 84 132 78 130 Z"
              fill="#3B6E5B"
            />
          </motion.g>

          {/* Right branch leaves */}
          <motion.g
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: '164px 92px' }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.58, duration: 0.35, ease: 'easeOut' }}
          >
            <path
              d="M 164 92 C 178 80 188 88 184 98 C 176 104 168 98 164 92 Z"
              fill="#5B8C7B"
            />
            <path
              d="M 164 92 C 172 98 174 110 162 108 C 158 102 160 96 164 92 Z"
              fill="#7EA899"
            />
          </motion.g>

          {/* Mid left branch leaves */}
          <motion.g
            initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ transformOrigin: '90px 70px' }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.64, duration: 0.35, ease: 'easeOut' }}
          >
            <path
              d="M 90 70 C 80 58 88 48 96 52 C 102 60 96 68 90 70 Z"
              fill="#7EA899"
            />
          </motion.g>
        </g>
      </motion.g>
    </motion.g>
  );
}

/**
 * Unified Mature Tree Stage (Stage 2: Young Tree & Stage 3: Blossoming Tree)
 *
 * Continuous organic growth sequence:
 * When transitioning from Medium Plant (Sapling):
 * 1. The existing medium trunk smoothly extends upward & thickens into the mature trunk.
 * 2. New trunk/wood continues growing from the existing trunk rather than appearing separately.
 * 3. Main branches progressively grow outward from connection points on the extended trunk.
 * 4. Secondary branches grow after the main branches.
 * 5. Leaves gradually appear along the newly grown branches.
 * 6. Cherry blossom clusters appear LAST, gradually and organically.
 * 7. Very subtle breeze effect begins AFTER the tree has finished growing (~2.2s).
 */
function MatureTreeStage({
  isBlossomStage,
  subVariant,
  isInitialMount,
  isTransitionToMature,
  isGrowingFromSapling = false,
  prevClusterCount = 0,
  shouldReduceMotion = false,
}) {
  const isPeak = subVariant === 'bloom-peak';

  // Cluster definitions with variants & positions across canopy
  const clusterDefinitions = useMemo(
    () => [
      // Early bloom clusters (0-4)
      { x: 138, y: 36, variant: 2, scale: 1, rot: -8 },
      { x: 88, y: 56, variant: 0, scale: 0.95, rot: -20 },
      { x: 60, y: 108, variant: 1, scale: 0.9, rot: -35 },
      { x: 166, y: 78, variant: 3, scale: 0.95, rot: 25 },
      { x: 80, y: 96, variant: 4, scale: 0.88, rot: -10 },

      // Vibrant bloom clusters (5-7)
      { x: 172, y: 114, variant: 0, scale: 0.88, rot: 35 },
      { x: 112, y: 70, variant: 1, scale: 0.85, rot: 5 },
      { x: 146, y: 98, variant: 4, scale: 0.85, rot: -15 },

      // Peak bloom clusters (8-12)
      { x: 122, y: 48, variant: 2, scale: 1.05, rot: 10 },
      { x: 70, y: 80, variant: 3, scale: 0.88, rot: -25 },
      { x: 180, y: 96, variant: 1, scale: 0.85, rot: 30 },
      { x: 102, y: 90, variant: 0, scale: 0.95, rot: -12 },
      { x: 130, y: 82, variant: 2, scale: 0.95, rot: 18 },
    ],
    []
  );

  let activeClusters = [];
  if (isBlossomStage) {
    if (isPeak) {
      activeClusters = clusterDefinitions.slice(0, 13);
    } else if (subVariant === 'bloom-vibrant') {
      activeClusters = clusterDefinitions.slice(0, 8);
    } else {
      activeClusters = clusterDefinitions.slice(0, 5);
    }
  }

  // Animation flag conditions
  const shouldAnimateTrunk = !shouldReduceMotion && (isGrowingFromSapling || isTransitionToMature || isInitialMount);
  const shouldAnimateBranches = !shouldReduceMotion && (isGrowingFromSapling || isTransitionToMature || isInitialMount);
  const shouldAnimateCanopy = !shouldReduceMotion && (isGrowingFromSapling || isTransitionToMature || isInitialMount);

  // Staggered timing configurations for Medium -> Full Tree (1.5 - 2.2s total duration)
  const branchDelays = isGrowingFromSapling
    ? [0.35, 0.55, 0.65, 0.45] // B1, B2, B3, B4 outward progression
    : [0.22, 0.28, 0.34, 0.40];
  const branchDuration = isGrowingFromSapling ? 0.45 : 0.35;

  const twigDelays = isGrowingFromSapling
    ? [0.78, 0.98, 1.06, 0.88] // Secondary twigs after main branches
    : [0.25, 0.30, 0.35, 0.40];
  const twigDuration = isGrowingFromSapling ? 0.36 : 0.35;

  const canopyBaseDelay = isGrowingFromSapling ? 1.08 : 0.44;
  const canopyStagger = isGrowingFromSapling ? 0.05 : 0.04;
  const canopyDuration = isGrowingFromSapling ? 0.42 : 0.38;

  const blossomBaseDelay = isGrowingFromSapling ? 1.55 : 0.72;
  const blossomStagger = isGrowingFromSapling ? 0.05 : 0.05;

  // Breeze sway starts AFTER tree has finished growing
  const swayDelay = isGrowingFromSapling ? 2.2 : 0;
  const blossomSwayDelay = isGrowingFromSapling ? 2.4 : 0.3;

  return (
    <g id="mature-tree-stage">
      {/* Seamless Transition Foundation: When growing from medium plant (Sapling),
          render existing medium trunk & branches at t=0 so there is ZERO pop or disappear */}
      {isGrowingFromSapling && !shouldReduceMotion && (
        <motion.g
          id="sapling-transition-foundation"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.42, duration: 0.45, ease: 'easeInOut' }}
        >
          {/* Existing medium trunk stem */}
          <path
            d="M 116 212 C 117 180 121 145 119 110 C 118 90 121 75 120 55 L 123 55 C 124 75 121 90 122 110 C 124 145 121 180 124 212 Z"
            fill="url(#trunk-wood-grad)"
          />
          {/* Existing medium branches */}
          <path
            d="M 119 145 C 108 136 94 132 78 130"
            stroke="#5C4A3E"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 121 112 C 132 102 146 96 164 92"
            stroke="#5C4A3E"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 120 86 C 112 76 102 72 90 70"
            stroke="#5C4A3E"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Existing medium leaves */}
          <g id="sapling-foundation-leaves">
            {/* Top crown leaf group */}
            <path
              d="M 121 55 C 112 40 120 28 126 30 C 132 38 126 50 121 55 Z"
              fill="#7EA899"
            />
            <path
              d="M 121 55 C 132 45 142 50 140 60 C 134 65 125 60 121 55 Z"
              fill="#A7C9BD"
            />
            <path
              d="M 121 55 C 108 48 104 60 108 68 C 114 70 120 62 121 55 Z"
              fill="#5B8C7B"
            />
            {/* Left lower leaves */}
            <path
              d="M 78 130 C 65 120 68 108 78 112 C 86 118 84 126 78 130 Z"
              fill="#5B8C7B"
            />
            <path
              d="M 78 130 C 68 135 70 148 82 144 C 88 138 84 132 78 130 Z"
              fill="#3B6E5B"
            />
            {/* Right leaves */}
            <path
              d="M 164 92 C 178 80 188 88 184 98 C 176 104 168 98 164 92 Z"
              fill="#5B8C7B"
            />
            <path
              d="M 164 92 C 172 98 174 110 162 108 C 158 102 160 96 164 92 Z"
              fill="#7EA899"
            />
            {/* Mid left leaves */}
            <path
              d="M 90 70 C 80 58 88 48 96 52 C 102 60 96 68 90 70 Z"
              fill="#7EA899"
            />
          </g>
        </motion.g>
      )}

      {/* Step 1 & 2: Mature Trunk with Base Root Flare.
          Smoothly extends upward from ground base and merges with existing medium trunk */}
      <motion.path
        d="M 104 212 C 110 192 114 170 114 146 L 126 146 C 126 170 130 192 136 212 Z"
        fill="url(#trunk-wood-grad)"
        initial={
          shouldReduceMotion
            ? false
            : isGrowingFromSapling
            ? { scaleY: 0.82, opacity: 0.7 }
            : shouldAnimateTrunk
            ? { scaleY: 0 }
            : false
        }
        animate={{ scaleY: 1, opacity: 1 }}
        style={{ transformOrigin: '120px 212px' }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : isGrowingFromSapling
            ? { duration: 0.45, ease: 'easeOut' }
            : { duration: 0.48, ease: 'easeOut' }
        }
      />

      {/* Bark Texture Lines on trunk */}
      <motion.path
        d="M 118 206 C 119 185 119 165 120 148"
        stroke="#4A3B32"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
        initial={shouldReduceMotion ? false : isGrowingFromSapling || shouldAnimateTrunk ? { opacity: 0 } : false}
        animate={{ opacity: 0.6 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : isGrowingFromSapling
            ? { delay: 0.25, duration: 0.35 }
            : { delay: 0.2, duration: 0.35 }
        }
      />
      <motion.path
        d="M 123 204 C 124 182 124 165 123 148"
        stroke="#3E322A"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        initial={shouldReduceMotion ? false : isGrowingFromSapling || shouldAnimateTrunk ? { opacity: 0 } : false}
        animate={{ opacity: 0.5 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : isGrowingFromSapling
            ? { delay: 0.28, duration: 0.35 }
            : { delay: 0.24, duration: 0.35 }
        }
      />
      {isBlossomStage && (
        <motion.path
          d="M 112 208 C 114 196 116 185 116 174"
          stroke="#4A3B32"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          initial={shouldReduceMotion ? false : isGrowingFromSapling ? { opacity: 0 } : false}
          animate={{ opacity: 0.5 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : isGrowingFromSapling
              ? { delay: 0.32, duration: 0.35 }
              : { delay: 0.28, duration: 0.35 }
          }
        />
      )}

      {/* Upper Tree Structure (Branches + Canopy + Blossoms)
          Subtle breeze sway kicks in gently AFTER tree finishes growing */}
      <motion.g
        id="mature-canopy-branches"
        animate={shouldReduceMotion ? {} : { rotate: [-0.5, 0.5, -0.5] }}
        transition={{
          duration: 5.6,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: swayDelay,
        }}
        style={{ transformOrigin: '120px 146px' }}
      >
        {/* Step 3: 4 Main Branches Progressively Growing Outward from Trunk Connection Points */}
        <g id="mature-tree-branches">
          {/* Branch 1: Lower-left */}
          <motion.path
            d="M 114 152 C 102 144 88 136 68 126"
            stroke="url(#trunk-wood-grad)"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
            initial={shouldReduceMotion ? false : isGrowingFromSapling || shouldAnimateBranches ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: branchDelays[0], duration: branchDuration, ease: 'easeOut' }}
          />

          {/* Branch 2: Mid-left fork */}
          <motion.path
            d="M 116 146 C 110 130 102 115 94 100"
            stroke="url(#trunk-wood-grad)"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
            initial={shouldReduceMotion ? false : isGrowingFromSapling || shouldAnimateBranches ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: branchDelays[1], duration: branchDuration, ease: 'easeOut' }}
          />

          {/* Branch 3: Mid-right fork */}
          <motion.path
            d="M 124 146 C 132 130 142 114 152 98"
            stroke="url(#trunk-wood-grad)"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
            initial={shouldReduceMotion ? false : isGrowingFromSapling || shouldAnimateBranches ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: branchDelays[2], duration: branchDuration, ease: 'easeOut' }}
          />

          {/* Branch 4: Lower-right */}
          <motion.path
            d="M 126 152 C 138 144 154 136 172 128"
            stroke="url(#trunk-wood-grad)"
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
            initial={shouldReduceMotion ? false : isGrowingFromSapling || shouldAnimateBranches ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: branchDelays[3], duration: branchDuration, ease: 'easeOut' }}
          />

          {/* Step 4: Secondary Branches (Sub-twigs grow outward after main branches) */}
          {isBlossomStage && (
            <>
              <motion.path
                d="M 88 138 C 86 126 84 116 82 108"
                stroke="url(#trunk-wood-grad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: twigDelays[0], duration: twigDuration, ease: 'easeOut' }}
              />
              <motion.path
                d="M 104 120 C 108 108 112 96 114 86"
                stroke="url(#trunk-wood-grad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: twigDelays[1], duration: twigDuration, ease: 'easeOut' }}
              />
              <motion.path
                d="M 136 122 C 132 110 130 98 128 88"
                stroke="url(#trunk-wood-grad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: twigDelays[2], duration: twigDuration, ease: 'easeOut' }}
              />
              <motion.path
                d="M 152 138 C 158 126 162 116 166 108"
                stroke="url(#trunk-wood-grad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: twigDelays[3], duration: twigDuration, ease: 'easeOut' }}
              />
            </>
          )}
        </g>

        {/* Step 5: Leaves Gradually Appear along Newly Grown Branches (9 Layered Foliage Lobes) */}
        <g id="mature-canopy-blobs">
          {/* Shade 1: Shadow base lobes */}
          <motion.path
            d="M 58 130 C 44 108 52 78 78 70 C 94 48 134 46 156 62 C 178 54 196 76 188 104 C 198 124 182 144 156 142 C 138 148 102 150 86 142 C 68 145 52 138 58 130 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#F2A3B5' : '#264639',
            }}
            style={{ transformOrigin: '120px 105px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />
          <motion.path
            d="M 136 138 C 130 120 144 104 164 104 C 182 104 194 122 186 140 C 180 152 158 156 144 150 C 138 146 136 142 136 138 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#F4A9BC' : '#2E5344',
            }}
            style={{ transformOrigin: '160px 130px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay + canopyStagger, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay + canopyStagger, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />

          {/* Shade 2: Mid-tone lobes */}
          <motion.path
            d="M 54 120 C 44 100 56 82 76 80 C 90 80 100 92 98 110 C 96 126 80 136 66 134 C 58 132 52 126 54 120 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#F8BDCD' : '#3B6E5B',
            }}
            style={{ transformOrigin: '76px 110px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay + canopyStagger * 2, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay + canopyStagger * 2, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />
          <motion.path
            d="M 72 102 C 64 82 78 68 96 68 C 110 68 120 78 118 96 C 116 112 100 122 86 120 C 76 118 70 110 72 102 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#FBC7D4' : '#487A68',
            }}
            style={{ transformOrigin: '96px 95px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay + canopyStagger * 3, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay + canopyStagger * 3, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />
          <motion.path
            d="M 94 92 C 90 70 108 56 128 56 C 148 56 162 70 158 92 C 154 108 138 118 124 118 C 108 118 96 108 94 92 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#FAD2DC' : '#528473',
            }}
            style={{ transformOrigin: '128px 85px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay + canopyStagger * 4, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay + canopyStagger * 4, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />
          <motion.path
            d="M 130 100 C 124 82 138 68 156 68 C 174 68 186 84 180 104 C 176 118 162 126 148 124 C 136 122 130 112 130 100 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#FBC7D4' : '#487A68',
            }}
            style={{ transformOrigin: '156px 95px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay + canopyStagger * 5, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay + canopyStagger * 5, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />
          <motion.path
            d="M 152 118 C 146 102 158 88 174 88 C 190 88 198 102 194 118 C 190 130 178 138 166 136 C 158 134 152 128 152 118 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#F8BDCD' : '#3B6E5B',
            }}
            style={{ transformOrigin: '174px 115px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay + canopyStagger * 6, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay + canopyStagger * 6, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />

          {/* Shade 3: Crown highlight lobes */}
          <motion.path
            d="M 82 72 C 76 54 90 42 108 40 C 122 38 134 48 130 62 C 124 76 110 82 94 82 C 86 82 82 78 82 72 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#FDE4EC' : '#7EA899',
            }}
            style={{ transformOrigin: '108px 60px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay + canopyStagger * 7, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay + canopyStagger * 7, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />
          <motion.path
            d="M 112 56 C 108 38 124 28 140 28 C 156 28 168 40 162 58 C 158 72 144 78 130 78 C 118 78 112 70 112 56 Z"
            initial={shouldAnimateCanopy ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: 1,
              opacity: 1,
              fill: isPeak ? '#FFF0F3' : '#A2C9BA',
            }}
            style={{ transformOrigin: '140px 48px' }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    scale: { delay: canopyBaseDelay + canopyStagger * 8, duration: canopyDuration, ease: 'easeOut' },
                    opacity: { delay: canopyBaseDelay + canopyStagger * 8, duration: canopyDuration, ease: 'easeOut' },
                    fill: { duration: 0.75, ease: 'easeInOut' },
                  }
            }
          />
        </g>

        {/* Step 6: Cherry Blossom Clusters (Appears LAST on the canopy, staggered) */}
        {isBlossomStage && (
          <motion.g
            id="sakura-clusters"
            animate={shouldReduceMotion ? {} : { rotate: [0.35, -0.35, 0.35] }}
            transition={{
              duration: 5.0,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: blossomSwayDelay,
            }}
            style={{ transformOrigin: '120px 105px' }}
          >
            {activeClusters.map((c, idx) => {
              const isNewCluster = idx >= prevClusterCount;
              // Stagger blossom appearance: starts after foliage is established
              const clusterDelay = isGrowingFromSapling
                ? blossomBaseDelay + idx * blossomStagger
                : isTransitionToMature || isInitialMount
                ? 0.72 + idx * 0.05
                : 0.15 + (idx - prevClusterCount) * 0.07;

              return (
                <BlossomCluster
                  key={idx}
                  x={c.x}
                  y={c.y}
                  variant={c.variant}
                  scale={c.scale}
                  rotation={c.rot}
                  delay={clusterDelay}
                  isPeak={isPeak}
                  shouldAnimate={isGrowingFromSapling || isNewCluster || isTransitionToMature || isInitialMount}
                  shouldReduceMotion={shouldReduceMotion}
                />
              );
            })}
          </motion.g>
        )}
      </motion.g>

      {/* Fallen Petal Accents near base in Bloom stage */}
      {isBlossomStage && (
        <g id="fallen-petals">
          <motion.ellipse
            cx={96}
            cy={212}
            rx={3.2}
            ry={1.7}
            transform="rotate(-18 96 212)"
            fill="#F4C2C2"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { delay: isGrowingFromSapling ? 1.95 : 0.7, duration: 0.35 }
            }
          />
          <motion.ellipse
            cx={108}
            cy={214}
            rx={2.8}
            ry={1.5}
            transform="rotate(24 108 214)"
            fill="#F9D8D8"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { delay: isGrowingFromSapling ? 2.0 : 0.74, duration: 0.35 }
            }
          />
          <motion.ellipse
            cx={135}
            cy={213}
            rx={3.2}
            ry={1.6}
            transform="rotate(12 135 213)"
            fill="#F4C2C2"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { delay: isGrowingFromSapling ? 2.05 : 0.78, duration: 0.35 }
            }
          />
          <motion.ellipse
            cx={148}
            cy={211}
            rx={2.6}
            ry={1.4}
            transform="rotate(-28 148 211)"
            fill="#E8A0BF"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { delay: isGrowingFromSapling ? 2.1 : 0.82, duration: 0.35 }
            }
          />
          {isPeak && (
            <>
              <motion.ellipse
                cx={82}
                cy={213}
                rx={2.5}
                ry={1.3}
                transform="rotate(15 82 213)"
                fill="#F9D8D8"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
                animate={{ opacity: 0.85, scale: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { delay: isGrowingFromSapling ? 2.15 : 0.86, duration: 0.35 }
                }
              />
              <motion.ellipse
                cx={162}
                cy={213}
                rx={2.5}
                ry={1.3}
                transform="rotate(-15 162 213)"
                fill="#F4C2C2"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
                animate={{ opacity: 0.85, scale: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { delay: isGrowingFromSapling ? 2.2 : 0.9, duration: 0.35 }
                }
              />
            </>
          )}
        </g>
      )}

      {/* Ambient Falling Petals (Blossom Stage) or Single Falling Leaf (Young Tree Stage) */}
      {isBlossomStage ? (
        <g id="ambient-falling-petals">
          {/* Petal 1: Drifts from lower-left canopy */}
          <motion.ellipse
            cx={0}
            cy={0}
            rx={2.8}
            ry={1.6}
            fill="#F4C2C2"
            initial={{ x: 86, y: 132, opacity: 0, rotate: 0 }}
            animate={{
              x: [86, 94, 82, 90],
              y: [132, 156, 182, 210],
              rotate: [0, 40, 95, 160],
              opacity: [0, 0.9, 0.85, 0],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: 'easeIn',
              delay: isGrowingFromSapling ? 2.2 : 0,
            }}
          />

          {/* Petal 2: Drifts from lower-right canopy, staggered */}
          <motion.ellipse
            cx={0}
            cy={0}
            rx={2.6}
            ry={1.5}
            fill="#F9D8D8"
            initial={{ x: 154, y: 126, opacity: 0, rotate: -20 }}
            animate={{
              x: [154, 146, 158, 150],
              y: [126, 152, 180, 211],
              rotate: [-20, 25, -10, 55],
              opacity: [0, 0.9, 0.85, 0],
            }}
            transition={{
              duration: 4.2,
              delay: isGrowingFromSapling ? 3.5 : isPeak ? 1.8 : 3.2,
              repeat: Infinity,
              repeatDelay: 2.2,
              ease: 'easeIn',
            }}
          />

          {/* Petal 3 (Peak Bloom only): Drifts from mid canopy */}
          {isPeak && (
            <motion.ellipse
              cx={0}
              cy={0}
              rx={2.7}
              ry={1.5}
              fill="#FCE7F3"
              initial={{ x: 124, y: 104, opacity: 0, rotate: 10 }}
              animate={{
                x: [124, 116, 128, 122],
                y: [104, 138, 174, 212],
                rotate: [10, 50, -15, 70],
                opacity: [0, 0.9, 0.85, 0],
              }}
              transition={{
                duration: 4.0,
                delay: isGrowingFromSapling ? 4.2 : 3.4,
                repeat: Infinity,
                repeatDelay: 2.4,
                ease: 'easeIn',
              }}
            />
          )}
        </g>
      ) : (
        <g id="ambient-falling-leaf">
          <motion.path
            d="M 0 0 C -2 -4 2 -8 4 -7 C 6 -3 3 0 0 0 Z"
            fill="#7EA899"
            initial={{ x: 88, y: 132, opacity: 0, rotate: 0 }}
            animate={{
              x: [88, 96, 84, 92],
              y: [132, 158, 184, 212],
              rotate: [0, 50, 110, 180],
              opacity: [0, 0.9, 0.85, 0],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              repeatDelay: 3.5,
              ease: 'easeIn',
              delay: isGrowingFromSapling ? 2.2 : 0,
            }}
          />
        </g>
      )}
    </g>
  );
}

/**
 * Main GrowthTreeWidget Component
 * Canvas targeted at ~240-255px, dominant visual anchor directly below navigation
 */
export default function GrowthTreeWidget({ readinessScore = 78 }) {
  const stageInfo = useMemo(() => getStageInfo(readinessScore), [readinessScore]);
  const shouldReduceMotion = useReducedMotion();

  // Track initial mount to play full grow-in sequence once per session
  const [isInitialMount, setIsInitialMount] = useState(false);

  // Transition tracking
  const prevStageIndexRef = useRef(stageInfo.stageIndex);
  const prevScoreRef = useRef(readinessScore);
  const prevClusterCountRef = useRef(0);

  // Tracks active growth transition from Medium Plant (Sapling, stage 1) to Full Tree (stage >= 2)
  const [growingFromSapling, setGrowingFromSapling] = useState(false);

  // Transition sparkle micro-moments & toast banner
  const [showSparkles, setShowSparkles] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [sameStagePulse, setSameStagePulse] = useState(false);

  useEffect(() => {
    // Check if full grow-in already played in this browser session
    const hasMountedInSession = sessionStorage.getItem(SESSION_KEY);
    if (!hasMountedInSession) {
      setIsInitialMount(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
    }
  }, []);

  // Monitor score changes & stage boundary crossings
  useEffect(() => {
    const prevKey = getStageInfo(prevScoreRef.current).key;
    const prevStage = prevStageIndexRef.current;

    // Trigger Medium Plant -> Full Tree growth transition flag
    if (prevStage === 1 && stageInfo.stageIndex >= 2) {
      setGrowingFromSapling(true);
      const saplingGrowthTimer = setTimeout(() => {
        setGrowingFromSapling(false);
      }, 2600);

      prevScoreRef.current = readinessScore;
      prevStageIndexRef.current = stageInfo.stageIndex;

      if (prevKey !== stageInfo.key) {
        setShowSparkles(true);
        setShowToast(true);
        const sparkleTimer = setTimeout(() => setShowSparkles(false), 900);
        const toastTimer = setTimeout(() => setShowToast(false), 3800);
        return () => {
          clearTimeout(saplingGrowthTimer);
          clearTimeout(sparkleTimer);
          clearTimeout(toastTimer);
        };
      }
      return () => clearTimeout(saplingGrowthTimer);
    }

    if (prevKey !== stageInfo.key) {
      // Crossed other stage boundary
      setShowSparkles(true);
      setShowToast(true);

      const sparkleTimer = setTimeout(() => setShowSparkles(false), 900);
      const toastTimer = setTimeout(() => setShowToast(false), 3800);

      prevScoreRef.current = readinessScore;
      prevStageIndexRef.current = stageInfo.stageIndex;

      return () => {
        clearTimeout(sparkleTimer);
        clearTimeout(toastTimer);
      };
    } else if (readinessScore > prevScoreRef.current) {
      // Score increased within same stage -> subtle pulse
      setSameStagePulse(true);
      const pulseTimer = setTimeout(() => setSameStagePulse(false), 450);
      prevScoreRef.current = readinessScore;
      return () => clearTimeout(pulseTimer);
    } else {
      prevScoreRef.current = readinessScore;
      prevStageIndexRef.current = stageInfo.stageIndex;
    }
  }, [stageInfo.key, stageInfo.stageIndex, readinessScore]);

  // Determine active blossom cluster count for current stage
  const currentClusterCount = useMemo(() => {
    if (stageInfo.stageIndex < 3) return 0;
    if (stageInfo.subVariant === 'bloom-peak') return 13;
    if (stageInfo.subVariant === 'bloom-vibrant') return 8;
    return 5;
  }, [stageInfo.stageIndex, stageInfo.subVariant]);

  // Update cluster count ref after render cycle
  useEffect(() => {
    prevClusterCountRef.current = currentClusterCount;
  }, [currentClusterCount]);

  // Determine if transitioning into mature tree from Sprout or Sapling
  const isGrowingFromSapling =
    growingFromSapling || (prevStageIndexRef.current === 1 && stageInfo.stageIndex >= 2);

  const isTransitionToMature =
    stageInfo.stageIndex >= 2 && prevStageIndexRef.current < 2;

  // Render stage content:
  // Note: Stage 2 (Young Tree) and Stage 3 (Blossoming Tree) share the persistent MatureTreeStage
  // key="mature-tree" so trunk, branches, and canopy stay stable without re-mounting!
  const renderStageContent = () => {
    switch (stageInfo.stageIndex) {
      case 0:
        return (
          <SproutStage
            key="sprout-stage"
            isInitialMount={isInitialMount}
            shouldReduceMotion={shouldReduceMotion}
          />
        );
      case 1:
        return (
          <SaplingStage
            key="sapling-stage"
            shouldReduceMotion={shouldReduceMotion}
          />
        );
      case 2:
      case 3:
      default:
        return (
          <MatureTreeStage
            key="mature-tree"
            isBlossomStage={stageInfo.stageIndex === 3}
            subVariant={stageInfo.subVariant}
            isInitialMount={isInitialMount}
            isTransitionToMature={isTransitionToMature}
            isGrowingFromSapling={isGrowingFromSapling}
            prevClusterCount={prevClusterCountRef.current}
            shouldReduceMotion={shouldReduceMotion}
          />
        );
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-teal-100/80 bg-gradient-to-b from-[#F8FCFD] via-[#F2F8FA] to-teal-50/20 p-2.5 shadow-sm transition-all duration-200">
      {/* Sparkles Micro-interaction burst */}
      <AnimatePresence>
        {showSparkles && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-20">
            {[
              { id: 1, left: '22%', top: '38%', color: '#5B8C7B', delay: 0 },
              { id: 2, left: '74%', top: '32%', color: '#F472B6', delay: 0.08 },
              { id: 3, left: '48%', top: '22%', color: '#F59E0B', delay: 0.15 },
              { id: 4, left: '32%', top: '56%', color: '#10B981', delay: 0.2 },
              { id: 5, left: '68%', top: '54%', color: '#EC4899', delay: 0.12 },
            ].map((spark) => (
              <motion.div
                key={spark.id}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0], y: -24, scale: [0.5, 1.2, 0.4] }}
                transition={{ duration: 0.75, delay: spark.delay, ease: 'easeOut' }}
                className="absolute"
                style={{ left: spark.left, top: spark.top }}
              >
                <Sparkles className="h-4 w-4" style={{ color: spark.color }} />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Dominant SVG Illustration Canvas (~240-250px tall) */}
      <div className="relative w-full flex items-center justify-center pt-0.5 overflow-hidden">
        <motion.div
          animate={sameStagePulse ? { scale: [1, 1.025, 1] } : {}}
          transition={sameStagePulse ? { duration: 0.35, ease: 'easeInOut' } : {}}
          style={{ transformOrigin: '50% 90%' }}
          className="w-full max-w-[245px] h-[245px] sm:h-[250px] mx-auto flex items-center justify-center select-none"
        >
          {/* Persistent SVG canvas:Defs & Ground Base stay rock-solid */}
          <svg
            viewBox="0 0 240 240"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full max-w-[245px] max-h-[250px] block mx-auto drop-shadow-2xs overflow-visible"
          >
            <SvgDefs />
            <GroundBase />
            <AnimatePresence mode="wait">
              {renderStageContent()}
            </AnimatePresence>
          </svg>
        </motion.div>

        {/* Floating Celebration Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute bottom-2 inset-x-3 text-center rounded-lg bg-ai-accent-700/95 backdrop-blur-xs px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm flex items-center justify-center gap-1.5 z-30"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Grown to {stageInfo.badge}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Supporting Narrative Copy Sitting Below the Illustration */}
      <div className="mt-2 text-center px-1">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-xs font-semibold text-ai-accent-800">
            {stageInfo.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-ai-accent-50 text-ai-accent-800 font-bold border border-ai-accent-200">
            {readinessScore}%
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-snug font-normal">
          {stageInfo.narrative}
        </p>
      </div>
    </div>
  );
}
