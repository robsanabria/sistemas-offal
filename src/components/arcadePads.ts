// Pads tipo pulsador arcade, solo por CSS (scope: .arcade-pads), sin tocar PrankButton: el ícono Play de cada pad ya trae el color de su
// categoría (style="color: …"). Ese <svg> pasa a ser el botón: color plano (currentColor) +
// una capa de sombreado propia en blanco/negro translúcido (base, ranura, capuchón y brillos).
function shadingSvg(dy: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94 89">
<defs>
<radialGradient id="edge" cx="50%" cy="46%" r="52%"><stop offset="0.72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient>
<linearGradient id="baseLo" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stop-color="#fff" stop-opacity="0"/><stop offset="0.9" stop-color="#fff" stop-opacity="0.95"/><stop offset="1" stop-color="#fff" stop-opacity="0.2"/></linearGradient>
<linearGradient id="baseTone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.38"/><stop offset="0.55" stop-color="#000" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></linearGradient>
<linearGradient id="capTone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.22"/></linearGradient>
<linearGradient id="rimHi" x1="1" y1="0" x2="0.25" y2="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.95"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.25"/><stop offset="0.7" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="rimLo" x1="0" y1="0" x2="0" y2="1"><stop offset="0.7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.6"/></linearGradient>
<filter id="b1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="b0" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0.5"/></filter>
<clipPath id="cap"><ellipse cx="47" cy="33" rx="29" ry="26"/></clipPath>
<linearGradient id="groove" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0.9"/></linearGradient>
<mask id="wallMask"><rect width="94" height="89" fill="#fff"/><ellipse cx="47" cy="${33 + dy}" rx="29" ry="26" fill="#000"/></mask>
<mask id="crescent"><rect width="94" height="89" fill="#000"/><ellipse cx="47" cy="46" rx="40" ry="37" fill="#fff"/><ellipse cx="47" cy="40" rx="42" ry="37" fill="#000"/></mask>
</defs>
<ellipse cx="47" cy="44.5" rx="47" ry="44.5" fill="url(#baseTone)"/>
<ellipse cx="47" cy="44.5" rx="47" ry="44.5" fill="url(#edge)"/>
<rect width="94" height="89" fill="#fff" fill-opacity="0.85" mask="url(#crescent)" filter="url(#b0)"/>
<ellipse cx="47" cy="43" rx="32" ry="29" fill="none" stroke="url(#groove)" stroke-width="${7 - dy * 0.6}" filter="url(#b1)"/>
<ellipse cx="47" cy="40" rx="29" ry="26" fill="#000" fill-opacity="0.5" mask="url(#wallMask)"/>
<ellipse cx="47" cy="40" rx="29" ry="26" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="1" mask="url(#wallMask)"/>
<g transform="translate(0 ${dy})">
<ellipse cx="47" cy="33" rx="29" ry="26" fill="#fff" fill-opacity="0.1"/>
<ellipse cx="47" cy="33" rx="29" ry="26" fill="url(#capTone)"/>
<g clip-path="url(#cap)">
<path d="M10 35 Q30 43 45 37 L47 39 L49 37 Q64 43 84 35 L84 72 L10 72 Z" fill="#000" fill-opacity="0.22"/>
<path d="M10 35 Q30 43 45 37 L47 39 L49 37 Q64 43 84 35" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="1"/>
</g>
<ellipse cx="47" cy="33" rx="26.5" ry="23.5" fill="none" stroke="url(#rimHi)" stroke-width="2.6"/>
<ellipse cx="47" cy="33" rx="28" ry="25" fill="none" stroke="url(#rimLo)" stroke-width="1.4" filter="url(#b0)"/>
<ellipse cx="47" cy="33" rx="29" ry="26" fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="1.2"/>
</g>
</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\n/g, ''))}")`
}

const PAD = '.arcade-pads .grid.custom-scrollbar > .group'
const CAP = `${PAD} > button:first-of-type > svg`
const BASE_FILTER = 'saturate(1.9) brightness(0.9) drop-shadow(0 5px 4px rgba(0,0,0,0.65))'

export const ARCADE_PADS_CSS = `
${PAD} {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  transform: none !important;
  overflow: visible;
}
.arcade-pads .grid.custom-scrollbar { padding-top: 8px; row-gap: 20px; }
${PAD} > div[aria-hidden],
${PAD} > div.top-0,
${PAD} > span[aria-hidden] { display: none; }
${PAD} > button:first-of-type { gap: 8px; padding-top: 4px; justify-content: flex-start; }
${CAP} {
  width: 94px; height: 89px; flex-shrink: 0;
  border-radius: 50%;
  opacity: 1;
  transform: none;
  background-color: currentColor;
  background-image: ${shadingSvg(0)};
  background-size: 100% 100%;
  filter: ${BASE_FILTER};
  transition: filter 0.15s ease;
}
${CAP} > * { display: none; }
/* variación de brillo para que una misma categoría no sea un bloque parejo */
${PAD}:nth-child(3n+2) > button:first-of-type > svg { filter: saturate(1.9) brightness(0.7) drop-shadow(0 5px 4px rgba(0,0,0,0.65)); }
${PAD}:nth-child(5n) > button:first-of-type > svg { filter: saturate(1.5) brightness(1.05) drop-shadow(0 5px 4px rgba(0,0,0,0.65)); }
${PAD} > button:first-of-type:active > svg { background-image: ${shadingSvg(4)}; }
${PAD} > button:first-of-type > svg.scale-125 {
  background-image: ${shadingSvg(4)};
  filter: saturate(2) brightness(1.15) drop-shadow(0 0 10px currentColor) !important;
}
${PAD} > button:first-of-type > span { font-size: 12px; color: #e4e4e7; }
`
