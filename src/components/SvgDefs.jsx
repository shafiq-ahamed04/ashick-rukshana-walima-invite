import React from 'react';

export default function SvgDefs() {
  return (
    <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        {/* Gradients for floral and foliage */}
        <linearGradient id="sageLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C2D4C0" />
          <stop offset="60%" stopColor="#9BB59A" />
          <stop offset="100%" stopColor="#758F74" />
        </linearGradient>

        <linearGradient id="oliveLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B5C4AE" />
          <stop offset="100%" stopColor="#6C7A67" />
        </linearGradient>

        <linearGradient id="rosePetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F9ECE9" />
          <stop offset="50%" stopColor="#E8C4C4" />
          <stop offset="100%" stopColor="#D49E9E" />
        </linearGradient>

        <linearGradient id="blushPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDF7F5" />
          <stop offset="70%" stopColor="#F6E6E4" />
          <stop offset="100%" stopColor="#E8C4C4" />
        </linearGradient>

        <linearGradient id="goldStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2CA92" />
          <stop offset="50%" stopColor="#C8A96A" />
          <stop offset="100%" stopColor="#8A6F3A" />
        </linearGradient>

        <linearGradient id="lanternGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#FFECC0" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#F8D48E" stopOpacity="0.8" />
        </linearGradient>

        <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBE6" stopOpacity="1" />
          <stop offset="45%" stopColor="#FFDE82" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#F6AA3E" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F6AA3E" stopOpacity="0" />
        </radialGradient>

        {/* 1. Eucalyptus Sprig */}
        <g id="eucalyptus-sprig" viewBox="0 0 100 120">
          <path d="M50 115 Q48 60 52 10" fill="none" stroke="#758F74" strokeWidth="1.6" strokeLinecap="round" />
          {/* Alternating rounded eucalyptus leaves */}
          <ellipse cx="40" cy="95" rx="14" ry="10" transform="rotate(-25 40 95)" fill="url(#sageLeafGrad)" opacity="0.9" />
          <ellipse cx="62" cy="80" rx="15" ry="11" transform="rotate(22 62 80)" fill="url(#sageLeafGrad)" opacity="0.9" />
          <ellipse cx="38" cy="62" rx="13" ry="9" transform="rotate(-30 38 62)" fill="url(#sageLeafGrad)" opacity="0.92" />
          <ellipse cx="64" cy="48" rx="12" ry="9" transform="rotate(25 64 48)" fill="url(#sageLeafGrad)" opacity="0.92" />
          <ellipse cx="43" cy="32" rx="10" ry="7" transform="rotate(-20 43 32)" fill="url(#sageLeafGrad)" opacity="0.95" />
          <ellipse cx="58" cy="22" rx="9" ry="6" transform="rotate(18 58 22)" fill="url(#sageLeafGrad)" opacity="0.95" />
          <circle cx="51" cy="10" r="4" fill="url(#sageLeafGrad)" />
        </g>

        {/* 2. Olive Sprig */}
        <g id="olive-sprig" viewBox="0 0 80 120">
          <path d="M40 115 Q38 65 42 10" fill="none" stroke="#6C7A67" strokeWidth="1.5" strokeLinecap="round" />
          {/* Slender lanceolate leaves */}
          <path d="M40 95 C25 90 20 80 25 75 C32 75 38 88 40 95 Z" fill="url(#oliveLeafGrad)" opacity="0.9" />
          <path d="M40 85 C55 80 60 70 55 65 C48 65 42 78 40 85 Z" fill="url(#oliveLeafGrad)" opacity="0.9" />
          <path d="M40 65 C26 60 22 50 28 45 C34 46 39 58 40 65 Z" fill="url(#oliveLeafGrad)" opacity="0.92" />
          <path d="M41 52 C54 48 58 38 52 34 C46 35 41 46 41 52 Z" fill="url(#oliveLeafGrad)" opacity="0.95" />
          <path d="M41 32 C30 26 30 18 36 15 C40 18 41 26 41 32 Z" fill="url(#oliveLeafGrad)" opacity="0.95" />
          {/* Tiny olive fruit */}
          <ellipse cx="32" cy="74" rx="3.5" ry="5" fill="#4B5646" />
          <ellipse cx="50" cy="42" rx="3.5" ry="5" fill="#4B5646" />
        </g>

        {/* 3. Soft Rose */}
        <g id="soft-rose" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="url(#blushPetalGrad)" opacity="0.85" />
          {/* Layered watercolor rose petals */}
          <path d="M22 36 C20 22 35 15 48 20 C58 24 58 38 48 42 C36 44 24 42 22 36 Z" fill="url(#rosePetalGrad)" opacity="0.8" />
          <path d="M30 52 C22 42 30 28 42 28 C52 28 56 38 52 48 C46 54 36 56 30 52 Z" fill="url(#rosePetalGrad)" opacity="0.85" />
          <path d="M34 32 C32 26 42 24 46 28 C50 32 46 38 42 38 C37 38 34 35 34 32 Z" fill="#D49E9E" opacity="0.75" />
          <circle cx="41" cy="33" r="4.5" fill="#C88E8E" opacity="0.85" />
        </g>

        {/* 4. Peony Bud */}
        <g id="peony-bud" viewBox="0 0 50 60">
          <ellipse cx="25" cy="28" rx="18" ry="20" fill="url(#rosePetalGrad)" />
          <path d="M12 30 C12 18 22 12 28 14 C20 18 18 26 22 36 Z" fill="url(#blushPetalGrad)" opacity="0.9" />
          <path d="M38 30 C38 18 28 12 22 14 C30 18 32 26 28 36 Z" fill="url(#blushPetalGrad)" opacity="0.9" />
          {/* Calyx */}
          <path d="M18 42 Q25 45 32 42 Q25 48 18 42 Z" fill="#758F74" />
          <path d="M25 45 L25 58" stroke="#758F74" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* 5. Hanging Garland */}
        <g id="hanging-garland" viewBox="0 0 300 60">
          <path d="M0 10 Q150 55 300 10" fill="none" stroke="#758F74" strokeWidth="1.2" />
          {/* Leaves along curve */}
          <ellipse cx="50" cy="22" rx="9" ry="5" transform="rotate(18 50 22)" fill="url(#sageLeafGrad)" opacity="0.85" />
          <ellipse cx="90" cy="31" rx="10" ry="6" transform="rotate(10 90 31)" fill="url(#sageLeafGrad)" opacity="0.9" />
          <ellipse cx="130" cy="35" rx="10" ry="5" transform="rotate(3 130 35)" fill="url(#sageLeafGrad)" opacity="0.9" />
          <ellipse cx="170" cy="35" rx="10" ry="5" transform="rotate(-3 170 35)" fill="url(#sageLeafGrad)" opacity="0.9" />
          <ellipse cx="210" cy="31" rx="10" ry="6" transform="rotate(-10 210 31)" fill="url(#sageLeafGrad)" opacity="0.9" />
          <ellipse cx="250" cy="22" rx="9" ry="5" transform="rotate(-18 250 22)" fill="url(#sageLeafGrad)" opacity="0.85" />
          {/* Small floral accents */}
          <circle cx="70" cy="28" r="4.5" fill="url(#rosePetalGrad)" />
          <circle cx="150" cy="37" r="5" fill="url(#rosePetalGrad)" />
          <circle cx="230" cy="28" r="4.5" fill="url(#rosePetalGrad)" />
        </g>

        {/* 6. Arched Window Frame (Thin gold double outline) */}
        <g id="arch-window" viewBox="0 0 400 600">
          {/* Outer Arch */}
          <path
            d="M 20 580 L 20 200 A 180 180 0 0 1 380 200 L 380 580"
            fill="none"
            stroke="url(#goldStrokeGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Inner Arch */}
          <path
            d="M 32 580 L 32 205 A 168 168 0 0 1 368 205 L 368 580"
            fill="none"
            stroke="url(#goldStrokeGrad)"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />
          {/* Delicate peak finial */}
          <circle cx="200" cy="18" r="3.5" fill="#C8A96A" />
          <line x1="200" y1="21" x2="200" y2="35" stroke="#C8A96A" strokeWidth="1" />
        </g>

        {/* 7. Lantern (Ring, arched body, soft flame glow, drawn properly) */}
        <g id="lantern" viewBox="0 0 60 120">
          {/* Hanging chain / wire */}
          <line x1="30" y1="0" x2="30" y2="25" stroke="#8A6F3A" strokeWidth="1" />
          {/* Hanging ring */}
          <circle cx="30" cy="28" r="5.5" fill="none" stroke="#C8A96A" strokeWidth="1.4" />
          {/* Top cap / dome */}
          <path d="M16 42 Q30 33 44 42 L42 46 L18 46 Z" fill="#C8A96A" stroke="#8A6F3A" strokeWidth="0.8" />
          {/* Glass arched body */}
          <path
            d="M18 46 L16 88 Q30 92 44 88 L42 46 Q30 43 18 46 Z"
            fill="url(#lanternGlassGrad)"
            stroke="#C8A96A"
            strokeWidth="1.2"
          />
          {/* Internal flame glow */}
          <circle cx="30" cy="68" r="14" fill="url(#flameGlow)" className="lantern-flame" />
          <ellipse cx="30" cy="68" rx="2.5" ry="5.5" fill="#FFF9E6" />
          {/* Bottom base and small finial */}
          <path d="M15 88 L45 88 L41 94 L19 94 Z" fill="#C8A96A" stroke="#8A6F3A" strokeWidth="0.8" />
          <circle cx="30" cy="98" r="2.5" fill="#8A6F3A" />
        </g>

        {/* 8. Floral Arch (Header ornament) */}
        <g id="floral-arch" viewBox="0 0 320 80">
          {/* Symmetrical gentle curve */}
          <path d="M20 70 Q160 5 300 70" fill="none" stroke="url(#goldStrokeGrad)" strokeWidth="1" strokeOpacity="0.6" />
          {/* Left branches */}
          <ellipse cx="60" cy="55" rx="10" ry="5" transform="rotate(-25 60 55)" fill="url(#sageLeafGrad)" opacity="0.9" />
          <ellipse cx="95" cy="40" rx="11" ry="6" transform="rotate(-18 95 40)" fill="url(#sageLeafGrad)" opacity="0.92" />
          <ellipse cx="130" cy="27" rx="12" ry="6" transform="rotate(-10 130 27)" fill="url(#sageLeafGrad)" opacity="0.92" />
          {/* Right branches */}
          <ellipse cx="260" cy="55" rx="10" ry="5" transform="rotate(25 260 55)" fill="url(#sageLeafGrad)" opacity="0.9" />
          <ellipse cx="225" cy="40" rx="11" ry="6" transform="rotate(18 225 40)" fill="url(#sageLeafGrad)" opacity="0.92" />
          <ellipse cx="190" cy="27" rx="12" ry="6" transform="rotate(10 190 27)" fill="url(#sageLeafGrad)" opacity="0.92" />
          {/* Central floral arrangement */}
          <circle cx="160" cy="20" r="13" fill="url(#blushPetalGrad)" />
          <circle cx="160" cy="20" r="8" fill="url(#rosePetalGrad)" />
          <circle cx="160" cy="20" r="3.5" fill="#8A6F3A" />
          {/* Flanking blossoms */}
          <circle cx="138" cy="24" r="7" fill="url(#rosePetalGrad)" />
          <circle cx="182" cy="24" r="7" fill="url(#rosePetalGrad)" />
          {/* Tiny buds */}
          <circle cx="112" cy="34" r="4.5" fill="url(#blushPetalGrad)" />
          <circle cx="208" cy="34" r="4.5" fill="url(#blushPetalGrad)" />
        </g>

        {/* 9. Star Divider (8-pointed star with gold hairlines) */}
        <g id="star-divider" viewBox="0 0 240 24">
          <line x1="0" y1="12" x2="105" y2="12" stroke="url(#goldStrokeGrad)" strokeWidth="0.9" strokeOpacity="0.8" />
          {/* 8-pointed star */}
          <path
            d="M 120 4 L 122.5 9.5 L 128 12 L 122.5 14.5 L 120 20 L 117.5 14.5 L 112 12 L 117.5 9.5 Z"
            fill="url(#goldStrokeGrad)"
          />
          <circle cx="120" cy="12" r="1.5" fill="#FFF9E6" />
          <line x1="135" y1="12" x2="240" y2="12" stroke="url(#goldStrokeGrad)" strokeWidth="0.9" strokeOpacity="0.8" />
        </g>
      </defs>
    </svg>
  );
}
