import React from 'react';
import { motion } from 'framer-motion';

/**
 * StudyLampIllustration
 * Modern flat SVG illustration of an angled desk study lamp with a warm glowing light
 * illuminating a small stack of books. Built with pure SVG, viewBox scaling (no hardcoded width/height),
 * and subtle slow ambient pulse on the lamp glow.
 */
export default function StudyLampIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 170 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={`w-full h-full block select-none ${className}`}
    >
      <defs>
        {/* Soft blur for warm ambient glow */}
        <filter id="lamp-glow-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5.5" />
        </filter>

        {/* Soft radial ambient warm glow */}
        <radialGradient id="lamp-ambient-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>

        {/* Directional light cone emanating from lamp shade */}
        <linearGradient id="lamp-light-cone" x1="42%" y1="18%" x2="78%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#FDE047" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.0" />
        </linearGradient>

        {/* Metallic / sleek lampshade gradient */}
        <linearGradient id="lamp-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Lamp arm gradient */}
        <linearGradient id="lamp-arm-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Warm brass joint gradient */}
        <linearGradient id="brass-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Mirrored container group: Flipped horizontally so Books are on the left (first) and Lamp is on the right */}
      <g transform="scale(-1, 1) translate(-170, 0)">
        {/* 1. Lamp Warm Glow & Light Cone (Gentle slow ambient pulse) */}
        <motion.g
          id="glow"
          animate={{ opacity: [0.85, 1, 0.85], scale: [0.99, 1.02, 0.99] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: '96px 60px' }}
        >
          {/* Soft radial glow blob behind shade and light cone */}
          <ellipse
            cx="102"
            cy="74"
            rx="44"
            ry="32"
            fill="url(#lamp-ambient-glow)"
            filter="url(#lamp-glow-blur)"
          />

          {/* Angular light cone covering the books below */}
          <polygon
            points="88,52 108,63 154,108 58,108"
            fill="url(#lamp-light-cone)"
          />
        </motion.g>

        {/* 2. Stack of 3 Books lying beside/under the lamp */}
        <g id="books">
          {/* Soft table contact shadow */}
          <ellipse cx="120" cy="108" rx="36" ry="3.5" fill="#1E1B4B" opacity="0.32" />

          {/* Book 1 (Bottom — Muted Teal Cover) */}
          <g id="book-bottom">
            <rect x="92" y="98" width="56" height="8.5" rx="1.8" fill="#0D9488" />
            {/* Paper pages block */}
            <rect x="94" y="100.5" width="52" height="4" fill="#F8FAFC" opacity="0.95" />
            {/* Spine curve accent */}
            <rect x="92" y="98" width="3.8" height="8.5" rx="1" fill="#115E59" />
            {/* Subtle page lines */}
            <line x1="97" y1="102.5" x2="144" y2="102.5" stroke="#E2E8F0" strokeWidth="0.8" />
          </g>

          {/* Book 2 (Middle — Dusty Rose Cover, slightly offset) */}
          <g id="book-middle">
            <rect x="98" y="90" width="48" height="7.8" rx="1.6" fill="#FB7185" />
            {/* Paper pages block */}
            <rect x="100" y="92" width="44" height="3.8" fill="#FFF1F2" opacity="0.95" />
            {/* Spine accent */}
            <rect x="98" y="90" width="3.5" height="7.8" rx="1" fill="#E11D48" />
            {/* Page line */}
            <line x1="103" y1="94" x2="142" y2="94" stroke="#FECDD3" strokeWidth="0.8" />
          </g>

          {/* Book 3 (Top — Soft Warm Ivory / Cream Cover with Indigo Ribbon Bookmark) */}
          <g id="book-top">
            <rect x="104" y="82" width="40" height="7.5" rx="1.5" fill="#FEF3C7" />
            {/* Paper pages block */}
            <rect x="106" y="84" width="36" height="3.5" fill="#FFFFFF" />
            {/* Spine accent */}
            <rect x="104" y="82" width="3.2" height="7.5" rx="1" fill="#F59E0B" />
            {/* Bookmark ribbon hanging down across spine */}
            <path
              d="M 132 84 Q 136 94 133 102 L 136 105 L 131 103 L 126 105 L 129 102 Z"
              fill="#818CF8"
              opacity="0.95"
            />
          </g>
        </g>

        {/* 3. Desk Study Lamp (Base, Articulated Arm, Lampshade, Bulb Aperture) */}
        <g id="lamp">
          {/* Base shadow */}
          <ellipse cx="42" cy="108" rx="18" ry="4" fill="#1E1B4B" opacity="0.35" />

          {/* Lamp Circular Base */}
          <ellipse cx="42" cy="105" rx="16" ry="4" fill="url(#lamp-body-grad)" />
          <path
            d="M 26 105 C 26 107.5 58 107.5 58 105 L 58 103 C 58 101 26 101 26 103 Z"
            fill="#94A3B8"
          />
          <circle cx="42" cy="104.5" r="3.2" fill="url(#brass-accent-grad)" />

          {/* Lower Arm (angled up & forward) */}
          <line
            x1="42"
            y1="103"
            x2="56"
            y2="66"
            stroke="url(#lamp-arm-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Counter-balance rod */}
          <line
            x1="46"
            y1="104"
            x2="60"
            y2="67"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Articulated Elbow Joint */}
          <circle cx="58" cy="66" r="4.5" fill="url(#brass-accent-grad)" />
          <circle cx="58" cy="66" r="1.8" fill="#78350F" />

          {/* Upper Arm (reaching forward towards the books) */}
          <line
            x1="58"
            y1="66"
            x2="88"
            y2="44"
            stroke="url(#lamp-arm-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <line
            x1="60"
            y1="69"
            x2="90"
            y2="47"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Swivel Neck Joint */}
          <circle cx="88" cy="44" r="3.8" fill="url(#brass-accent-grad)" />

          {/* Lampshade Top Cap */}
          <ellipse cx="90" cy="42" rx="3.5" ry="2" fill="#64748B" />

          {/* Angled Lampshade Bell Body */}
          <path
            d="M 87 40 L 76 56 C 74 59.5 77 64 82 66 L 105 52 C 109 49.5 109 45 105 42 L 93 38 Z"
            fill="url(#lamp-body-grad)"
          />
          {/* Subtle highlight sheen on shade */}
          <path
            d="M 89 42 L 83 55"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Inner Glowing Lampshade Aperture */}
          <ellipse
            cx="94"
            cy="59"
            rx="13.5"
            ry="6"
            transform="rotate(-30 94 59)"
            fill="#FEF08A"
          />
          {/* Bright central bulb filament core */}
          <ellipse
            cx="94"
            cy="59"
            rx="7"
            ry="3.2"
            transform="rotate(-30 94 59)"
            fill="#FFFFFF"
          />
        </g>
      </g>
    </svg>
  );
}
