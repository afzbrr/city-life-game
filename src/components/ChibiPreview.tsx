import React from 'react';
import { WardrobeItem } from '../data/wardrobeCatalog';

interface ChibiPreviewProps {
  item: WardrobeItem;
  gender?: 'cewek' | 'cowok';
  skinColor?: string;
  hairColor?: string;
}

export default function ChibiPreview({
  item,
  gender = 'cewek',
  skinColor = '#fff0ea',
  hairColor = '#18181b',
}: ChibiPreviewProps) {
  const isGirl =
    item.gender === 'cewek' || (item.gender !== 'cowok' && gender === 'cewek');
  const effectiveSkin = item.category === 'kulit' ? item.color : skinColor;
  const activeHair = item.category === 'rambut' ? hairColor || item.color : '#18181b';

  // Primary item color
  const c1 = item.color;
  const c2 = item.secondaryColor || item.color;

  // Default clothing colors when viewing other categories:
  // Cewe default: pink clothes; Cowo default: blue clothes
  const defaultTop = isGirl ? '#f472b6' : '#38bdf8';
  const defaultBottom = isGirl ? '#93c5fd' : '#1e3a8a';
  const defaultShoes = isGirl ? '#18181b' : '#0284c7';

  const topColor = item.category === 'atasan' || item.category === 'dress_setelan' ? c1 : defaultTop;
  const bottomColor = item.category === 'bawahan' ? c1 : (item.category === 'dress_setelan' ? c1 : defaultBottom);
  const shoesColor = item.category === 'sepatu' ? c1 : defaultShoes;

  return (
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-xs select-none">
      <defs>
        {/* Soft ground shadow */}
        <radialGradient id={`sh_${item.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="114" rx="28" ry="4.5" fill={`url(#sh_${item.id})`} />

      {/* SPARKLE EFFECT FOR SULTAN */}
      {item.isSultan && (
        <g className="animate-pulse">
          <circle cx="20" cy="25" r="2" fill="#facc15" />
          <circle cx="80" cy="20" r="2.5" fill="#fef08a" />
          <circle cx="85" cy="70" r="2" fill="#facc15" />
          <circle cx="15" cy="85" r="2.5" fill="#fef08a" />
          <path d="M 80 20 L 80 15 M 80 20 L 80 25 M 80 20 L 75 20 M 80 20 L 85 20" stroke="#facc15" strokeWidth="0.8" />
        </g>
      )}

      {/* COUPLE HEART EFFECT */}
      {item.isCouple && (
        <g>
          <path d="M 22 18 C 22 14, 16 14, 16 18 C 16 22, 22 25, 22 25 C 22 25, 28 22, 28 18 C 28 14, 22 14, 22 18 Z" fill="#ec4899" opacity="0.85" />
          <path d="M 78 18 C 78 14, 72 14, 72 18 C 72 22, 78 25, 78 25 C 78 25, 84 22, 84 18 C 84 14, 78 14, 78 18 Z" fill="#38bdf8" opacity="0.85" />
        </g>
      )}

      {/* BACK HAIR (Distinct silhouette for Cowo Mullet & all 8 Cewe styles) */}
      {item.id === 'cowo_mullet' && (
        <path d="M 30 35 L 26 62 L 34 57 L 42 64 L 50 58 L 58 64 L 66 57 L 74 62 L 70 35 Z" fill={activeHair} />
      )}
      {(item.id === 'cewe_long_hair' || item.id === 'panjang_hitam') && (
        <path d="M 24 34 L 22 86 L 78 86 L 76 34 Z" fill={activeHair} />
      )}
      {item.id === 'cewe_wolf_cut' && (
        <path d="M 22 32 L 16 52 L 26 56 L 23 80 L 34 74 L 44 84 L 50 75 L 56 84 L 66 74 L 77 80 L 74 56 L 84 52 L 78 32 Z" fill={activeHair} />
      )}
      {(item.id === 'cewe_curtain_bangs' || item.id === 'cewe_side_part' || item.id === 'cewe_curtain_hair') && (
        <path d="M 24 34 C 21 62, 23 78, 30 82 L 70 82 C 77 78, 79 62, 76 34 Z" fill={activeHair} />
      )}
      {item.id === 'cewe_long_layers' && (
        <g fill={activeHair}>
          <path d="M 20 34 L 16 62 L 28 60 L 26 85 L 74 85 L 72 60 L 84 62 L 80 34 Z" />
        </g>
      )}
      {item.id === 'cewe_butterfly_cut' && (
        <g fill={activeHair}>
          <path d="M 18 32 Q 13 52 24 58 L 22 84 L 78 84 L 76 58 Q 87 52 82 32 Z" />
        </g>
      )}
      {item.id === 'cewe_hush_cut' && (
        <path d="M 25 34 Q 23 64 31 78 Q 50 82 69 78 Q 77 64 75 34 Z" fill={activeHair} />
      )}
      {item.category !== 'rambut' && isGirl && (
        <path
          d="M 24 38 C 22 65, 26 82, 34 85 C 42 87, 44 80, 44 80 L 56 80 C 56 80, 58 87, 66 85 C 74 82, 78 65, 76 38 Z"
          fill="#18181b"
        />
      )}

      {/* LEGS & SHOES */}
      {/* Left Leg */}
      <rect x="40" y="86" width="7" height="18" rx="3.5" fill={effectiveSkin} />
      {/* Right Leg */}
      <rect x="53" y="86" width="7" height="18" rx="3.5" fill={effectiveSkin} />

      {/* Left Shoe */}
      <rect x="38" y="103" width="10" height="7" rx="3.5" fill={shoesColor} />
      {/* Right Shoe */}
      <rect x="52" y="103" width="10" height="7" rx="3.5" fill={shoesColor} />

      {/* Flip-flop strap if sendal jepit */}
      {item.id === 'sendal_jepit_coklat' && (
        <>
          <line x1="43" y1="104" x2="40" y2="108" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="43" y1="104" x2="46" y2="108" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="57" y1="104" x2="54" y2="108" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="57" y1="104" x2="60" y2="108" stroke="#ffffff" strokeWidth="1.2" />
        </>
      )}

      {/* BOTTOM (Pants / Skirt) */}
      {item.category === 'bawahan' || item.category === 'dress_setelan' ? (
        item.name.toLowerCase().includes('rok') ? (
          /* Pleated Skirt */
          <path d="M 36 74 L 64 74 L 68 89 L 32 89 Z" fill={bottomColor} />
        ) : (
          /* Pants / Shorts */
          <path
            d="M 37 74 L 63 74 L 63 90 L 52 90 L 50 82 L 48 90 L 37 90 Z"
            fill={bottomColor}
          />
        )
      ) : isGirl ? (
        <path d="M 36 74 L 64 74 L 68 89 L 32 89 Z" fill={bottomColor} />
      ) : (
        <path
          d="M 37 74 L 63 74 L 63 92 L 52 92 L 50 82 L 48 92 L 37 92 Z"
          fill={bottomColor}
        />
      )}

      {/* TORSO & TOP */}
      <rect x="34" y="55" width="32" height="24" rx="8" fill={topColor} />

      {/* Collar / V-neck detail */}
      <path d="M 44 55 Q 50 63 56 55" stroke={c2} strokeWidth="2" fill="none" />

      {/* ARMS & HANDS */}
      {/* Left Arm */}
      <rect x="26" y="56" width="9" height="22" rx="4.5" fill={topColor} />
      <circle cx="30.5" cy="80" r="4" fill={effectiveSkin} />

      {/* Right Arm */}
      <rect x="65" y="56" width="9" height="22" rx="4.5" fill={topColor} />
      <circle cx="69.5" cy="80" r="4" fill={effectiveSkin} />

      {/* NECK */}
      <rect x="46" y="47" width="8" height="10" rx="3" fill={effectiveSkin} />

      {/* HEAD */}
      <circle cx="50" cy="34" r="22" fill={effectiveSkin} />

      {/* EARS (Left & Right aligned with eyes) */}
      <circle cx="28" cy="34" r="3.4" fill={effectiveSkin} />
      <circle cx="72" cy="34" r="3.4" fill={effectiveSkin} />

      {/* PINK CHEEK BLUSH */}
      <ellipse cx="36" cy="39" rx="4.2" ry="2.5" fill="#f472b6" opacity={item.id === 'muka_malu' || item.id === 'muka_love' ? '0.9' : '0.55'} />
      <ellipse cx="64" cy="39" rx="4.2" ry="2.5" fill="#f472b6" opacity={item.id === 'muka_malu' || item.id === 'muka_love' ? '0.9' : '0.55'} />

      {/* EXPRESSIVE EYES (All 13 Expressions) */}
      {item.id === 'muka_ketawa' ? (
        <>
          <path d="M 35 34 Q 40 28 45 34" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 55 34 Q 60 28 65 34" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : item.id === 'muka_kedip_satu' ? (
        <>
          <ellipse cx="40" cy="33" rx="4.6" ry="5.6" fill="#09090b" />
          <circle cx="41.5" cy="31" r="2" fill="#ffffff" />
          <path d="M 55 34 Q 60 28 65 34" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : item.id === 'muka_love' ? (
        <>
          <path d="M 40 37 C 35 33, 35 28, 38 28 C 39.5 28, 40 30, 40 30 C 40 30, 40.5 28, 42 28 C 45 28, 45 33, 40 37 Z" fill="#e11d48" />
          <path d="M 60 37 C 55 33, 55 28, 58 28 C 59.5 28, 60 30, 60 30 C 60 30, 60.5 28, 62 28 C 65 28, 65 33, 60 37 Z" fill="#e11d48" />
        </>
      ) : item.id === 'muka_ngantuk' ? (
        <>
          <path d="M 35 34 Q 40 37 45 34" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 55 34 Q 60 37 65 34" stroke="#09090b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : item.id === 'muka_nangis' ? (
        <>
          <path d="M 35 33 Q 40 36 45 33" stroke="#09090b" strokeWidth="2" fill="none" />
          <path d="M 55 33 Q 60 36 65 33" stroke="#09090b" strokeWidth="2" fill="none" />
          <rect x="37" y="36" width="4" height="7" rx="2" fill="#38bdf8" />
          <rect x="59" y="36" width="4" height="7" rx="2" fill="#38bdf8" />
        </>
      ) : item.id === 'muka_lirik' ? (
        <>
          <ellipse cx="40" cy="33" rx="5" ry="5.5" fill="#ffffff" stroke="#09090b" strokeWidth="1" />
          <circle cx="42" cy="33" r="3" fill="#09090b" />
          <ellipse cx="60" cy="33" rx="5" ry="5.5" fill="#ffffff" stroke="#09090b" strokeWidth="1" />
          <circle cx="62" cy="33" r="3" fill="#09090b" />
        </>
      ) : (
        <>
          <ellipse cx="40" cy="33" rx={item.id === 'muka_kaget' ? 5.2 : 4.6} ry={item.id === 'muka_kaget' ? 6.2 : 5.6} fill="#09090b" />
          <circle cx="41.5" cy="31" r="2" fill="#ffffff" />
          <ellipse cx="60" cy="33" rx={item.id === 'muka_kaget' ? 5.2 : 4.6} ry={item.id === 'muka_kaget' ? 6.2 : 5.6} fill="#09090b" />
          <circle cx="61.5" cy="31" r="2" fill="#ffffff" />
          {item.id === 'muka_berbinar' && (
            <>
              <circle cx="38.5" cy="35" r="1.4" fill="#fef08a" />
              <circle cx="58.5" cy="35" r="1.4" fill="#fef08a" />
            </>
          )}
        </>
      )}

      {/* MOUTH */}
      {item.id === 'muka_kaget' || item.id === 'muka_ngantuk' ? (
        <circle cx="50" cy="43" r="3" fill="#e11d48" />
      ) : item.id === 'muka_senyum_lebar' || item.id === 'muka_ketawa' ? (
        <path d="M 43 40 L 57 40 Q 50 49 43 40 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />
      ) : item.id === 'muka_sedih' || item.id === 'muka_nangis' ? (
        <path d="M 46 44 Q 50 40 54 44" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      ) : item.id === 'muka_marah' ? (
        <path d="M 46 43 Q 48 41 50 43 Q 52 41 54 43" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M 45 41 Q 50 46 55 41" stroke="#e11d48" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      )}

      {/* NOSE */}
      <circle cx="50" cy="37" r="1.2" fill="#f5a898" />

      {/* EYEBROWS */}
      {item.id === 'muka_marah' ? (
        <>
          <line x1="35" y1="22" x2="44" y2="26" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="65" y1="22" x2="56" y2="26" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : item.id === 'muka_sedih' || item.id === 'muka_nangis' ? (
        <>
          <line x1="35" y1="26" x2="44" y2="23" stroke="#18181b" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="65" y1="26" x2="56" y2="23" stroke="#18181b" strokeWidth="1.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M 36 24 Q 40 22 44 24" stroke="#18181b" strokeWidth="1.3" strokeLinecap="round" fill="none" />
          <path d="M 56 24 Q 60 22 64 24" stroke="#18181b" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* FRONT HAIR SILHOUETTES (8 Cowo + 8 Cewe + Active Hair Color) */}
      {item.id === 'cowo_comma' ? (
        <g fill={activeHair}>
          <path d="M 28 26 C 30 12, 70 12, 72 26 Z" />
          <path d="M 42 15 Q 34 21 39 27 Q 44 25 46 21 Z" />
          <path d="M 56 15 Q 64 21 59 26 Q 55 24 53 20 Z" />
        </g>
      ) : item.id === 'cowo_french_crop' ? (
        <g fill={activeHair}>
          <path d="M 29 24 C 31 12, 69 12, 71 24 Z" />
          <rect x="33" y="18" width="34" height="5" rx="2" />
        </g>
      ) : item.id === 'cowo_curtain' || item.id === 'cewe_curtain_bangs' || item.id === 'cewe_curtain_hair' ? (
        <g fill={activeHair}>
          <path d="M 28 26 C 30 12, 70 12, 72 26 Z" />
          <path d="M 50 15 Q 38 18 30 33 L 34 33 Q 41 21 50 18 Z" />
          <path d="M 50 15 Q 62 18 70 33 L 66 33 Q 59 21 50 18 Z" />
        </g>
      ) : item.id === 'cewe_side_part' ? (
        <g fill={activeHair}>
          <path d="M 28 26 C 30 12, 70 12, 72 26 Z" />
          <path d="M 40 15 Q 58 17 70 32 L 73 28 Q 59 14 40 15 Z" />
        </g>
      ) : item.id === 'cowo_perm' ? (
        <g fill={activeHair}>
          <circle cx="34" cy="18" r="6" />
          <circle cx="44" cy="14" r="7" />
          <circle cx="56" cy="14" r="7" />
          <circle cx="66" cy="18" r="6" />
          <circle cx="40" cy="20" r="5" />
          <circle cx="51" cy="20" r="5" />
          <circle cx="61" cy="20" r="5" />
        </g>
      ) : item.id === 'cowo_taper_fade' || item.id === 'cowo_low_fade' ? (
        <g fill={activeHair}>
          <path d="M 30 22 C 32 10, 68 10, 70 22 Q 50 17 30 22 Z" />
          <path d="M 36 15 Q 45 9 58 12 Q 66 15 68 20 Q 52 16 36 15 Z" />
        </g>
      ) : item.id === 'cewe_butterfly_cut' ? (
        <g fill={activeHair}>
          <path d="M 28 26 C 30 12, 70 12, 72 26 Z" />
          <path d="M 30 22 Q 20 35 24 46 Q 28 42 32 28 Z" />
          <path d="M 70 22 Q 80 35 76 46 Q 72 42 68 28 Z" />
        </g>
      ) : item.id === 'cewe_hush_cut' ? (
        <g fill={activeHair}>
          <path d="M 28 26 C 30 12, 70 12, 72 26 Z" />
          <line x1="42" y1="17" x2="42" y2="23" stroke={activeHair} strokeWidth="2" />
          <line x1="50" y1="17" x2="50" y2="23" stroke={activeHair} strokeWidth="2" />
          <line x1="58" y1="17" x2="58" y2="23" stroke={activeHair} strokeWidth="2" />
        </g>
      ) : isGirl ? (
        <g fill={activeHair}>
          <path d="M 28 26 C 30 13, 70 13, 72 26 C 70 19, 30 19, 28 26 Z" />
          <path d="M 33 21 C 42 19, 58 19, 67 21 C 65 23, 35 23, 33 21 Z" />
          <path d="M 28 26 Q 26 46 25 58 Q 28 58 29 35 Z" />
          <path d="M 72 26 Q 74 46 75 58 Q 72 58 71 35 Z" />
        </g>
      ) : (
        <g fill={activeHair}>
          <path d="M 28 26 C 30 12, 70 12, 72 26 C 70 19, 30 19, 28 26 Z" />
          <path d="M 33 21 Q 42 18 48 22 Q 42 19 33 21 Z" />
          <path d="M 52 22 Q 58 18 67 21 Q 58 19 52 22 Z" />
        </g>
      )}

      {/* ACCESSORY OVERLAYS ON CHIBI */}
      {item.category === 'aksesoris' && (
        <g>
          {/* Glasses */}
          {item.name.toLowerCase().includes('kacamata') && (
            <g stroke={c1} strokeWidth="1.5" fill="none">
              {item.name.toLowerCase().includes('hati') ? (
                <>
                  <path d="M 34 32 C 34 30, 31 30, 31 32 C 31 35, 37 38, 37 38 C 37 38, 43 35, 43 32 C 43 30, 40 30, 37 32 Z" fill="rgba(244,63,94,0.3)" />
                  <path d="M 57 32 C 57 30, 54 30, 54 32 C 54 35, 60 38, 60 38 C 60 38, 66 35, 66 32 C 66 30, 63 30, 60 32 Z" fill="rgba(244,63,94,0.3)" />
                  <line x1="43" y1="33" x2="54" y2="33" />
                </>
              ) : (
                <>
                  <circle cx="40" cy="33" r="6" />
                  <circle cx="60" cy="33" r="6" />
                  <line x1="46" y1="33" x2="54" y2="33" />
                </>
              )}
            </g>
          )}

          {/* Hats */}
          {item.name.toLowerCase().includes('topi') || item.name.toLowerCase().includes('bucket') || item.name.toLowerCase().includes('beanie') ? (
            <ellipse cx="50" cy="18" rx="24" ry="9" fill={c1} stroke={c2} strokeWidth="1.5" />
          ) : null}

          {/* Crown / Mahkota / Tiara */}
          {(item.name.toLowerCase().includes('mahkota') || item.name.toLowerCase().includes('tiara')) && (
            <path d="M 34 16 L 38 7 L 44 14 L 50 5 L 56 14 L 62 7 L 66 16 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
          )}

          {/* Ribbon / Pita */}
          {item.name.toLowerCase().includes('pita') && (
            <g transform="translate(64, 18)">
              <polygon points="-8,-4 0,0 -8,4" fill={c1} />
              <polygon points="8,-4 0,0 8,4" fill={c1} />
              <circle cx="0" cy="0" r="2.5" fill={c2} />
            </g>
          )}

          {/* Necklace / Kalung */}
          {item.name.toLowerCase().includes('kalung') && (
            <path d="M 43 54 Q 50 62 57 54" stroke={c1} strokeWidth="1.4" fill="none" />
          )}

          {/* Watch / Jam Tangan */}
          {item.name.toLowerCase().includes('jam') && (
            <circle cx="30" cy="78" r="3" fill={c1} stroke="#ffffff" strokeWidth="0.8" />
          )}

          {/* Bag / Tas */}
          {item.name.toLowerCase().includes('tas') && (
            <rect x="66" y="66" width="14" height="16" rx="4" fill={c1} stroke={c2} strokeWidth="1" />
          )}
        </g>
      )}
    </svg>
  );
}
