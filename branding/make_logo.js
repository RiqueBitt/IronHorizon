// Gera o logotipo e o icone do Iron Horizon como SVG (texto convertido em curvas).
// Uso: node make_logo.js <pasta_saida>
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const out = process.argv[2];
const font = opentype.loadSync('C:/Windows/Fonts/ariblk.ttf');

const SIZE = 150;
const SPACING = 0.03;
const SKEW = -12;

function textPath(text, x, baseline, size = SIZE) {
	const p = font.getPath(text, x, baseline, size, { letterSpacing: SPACING });
	const bb = p.getBoundingBox();
	return { d: p.toPathData(2), bb };
}

const chromeStops = `
	<stop offset="0" stop-color="#ffffff"/>
	<stop offset="0.30" stop-color="#dfe3e8"/>
	<stop offset="0.48" stop-color="#8a9099"/>
	<stop offset="0.50" stop-color="#2b2f35"/>
	<stop offset="0.62" stop-color="#5d636c"/>
	<stop offset="0.85" stop-color="#cfd4da"/>
	<stop offset="1" stop-color="#f7f8fa"/>`;
const redStops = `
	<stop offset="0" stop-color="#ff8a7a"/>
	<stop offset="0.40" stop-color="#e01b22"/>
	<stop offset="0.52" stop-color="#6a0407"/>
	<stop offset="0.70" stop-color="#b3121a"/>
	<stop offset="1" stop-color="#ff5a4a"/>`;

function grad(id, stops, y1, y2) {
	return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}">${stops}</linearGradient>`;
}

const filters = `
	<filter id="shadow" x="-10%" y="-20%" width="120%" height="140%">
		<feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.85"/>
	</filter>
	<filter id="glow" x="-30%" y="-60%" width="160%" height="220%">
		<feGaussianBlur stdDeviation="10"/>
	</filter>`;

// Desenha uma camada de letras cromadas: contorno escuro, borda clara e preenchimento.
function chromeLayer(d, fillId) {
	return `
	<path d="${d}" fill="none" stroke="#050506" stroke-width="12" stroke-linejoin="round"/>
	<path d="${d}" fill="none" stroke="#9ba1a9" stroke-width="5" stroke-linejoin="round"/>
	<path d="${d}" fill="url(#${fillId})"/>
	<path d="${d}" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.2"/>`;
}

// ---------- Logotipo ----------
function logo() {
	const x0 = 70;
	const l1 = textPath('IRON', x0, 160);
	const l2 = textPath('HORIZON', x0, 335);
	const right = l2.bb.x2;
	const barY = 186, barH = 16;

	// Sol nascendo sobre a linha do horizonte, no espaco ao lado de "IRON".
	const cx = l1.bb.x2 + (right - l1.bb.x2) / 2 + 10;
	const r = 88;
	const rays = [];
	for (let i = 0; i <= 8; i++) {
		const a = Math.PI + (Math.PI * i) / 8;
		const inner = r + 14, outer = r + (i % 2 ? 34 : 58), w = i % 2 ? 0.05 : 0.075;
		const p = (rad, ang) => `${(cx + rad * Math.cos(ang)).toFixed(1)},${(barY + rad * Math.sin(ang)).toFixed(1)}`;
		rays.push(`<polygon points="${p(inner, a - w)} ${p(outer, a)} ${p(inner, a + w)}"/>`);
	}
	const sun = `M${cx - r},${barY} A${r},${r} 0 0 1 ${cx + r},${barY} Z`;

	const width = Math.ceil(right + 90);
	const height = 380;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<title>Iron Horizon</title>
<defs>
	${grad('chrome1', chromeStops, l1.bb.y1, l1.bb.y2)}
	${grad('chrome2', chromeStops, l2.bb.y1, l2.bb.y2)}
	${grad('red', redStops, barY - r - 10, barY)}
	${grad('redbar', redStops, barY, barY + barH)}
	${filters}
</defs>
<g transform="translate(${-SKEW * 1.9},0) skewX(${SKEW})">
	<g filter="url(#shadow)">
		<path d="${sun}" fill="#ff2a1a" opacity="0.55" filter="url(#glow)"/>
		<g fill="#050506" stroke="#050506" stroke-width="10" stroke-linejoin="round">${rays.join('')}</g>
		<g fill="url(#red)">${rays.join('')}</g>
		<path d="${sun}" fill="#050506" stroke="#050506" stroke-width="12" stroke-linejoin="round"/>
		<path d="${sun}" fill="url(#red)" stroke="#ffb0a0" stroke-opacity="0.6" stroke-width="2"/>
		${chromeLayer(l1.d, 'chrome1')}
		<polygon points="${x0 - 30},${barY + barH} ${x0 - 6},${barY} ${right + 40},${barY} ${right + 14},${barY + barH}" fill="#050506" stroke="#050506" stroke-width="10" stroke-linejoin="round"/>
		<polygon points="${x0 - 30},${barY + barH} ${x0 - 6},${barY} ${right + 40},${barY} ${right + 14},${barY + barH}" fill="url(#redbar)"/>
		${chromeLayer(l2.d, 'chrome2')}
	</g>
</g>
</svg>
`;
}

// ---------- Icone (IH) ----------
function icon() {
	const t = textPath('IH', 0, 0, 150);
	const w = t.bb.x2 - t.bb.x1, h = t.bb.y2 - t.bb.y1;
	const s = 256;
	const tx = (s - w) / 2 - t.bb.x1 + 10, ty = (s - h) / 2 - t.bb.y1;
	const barY = s / 2 - 8;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
<title>Iron Horizon</title>
<defs>
	${grad('bg', '<stop offset="0" stop-color="#2a2d33"/><stop offset="1" stop-color="#08090b"/>', 0, s)}
	${grad('chrome', chromeStops, ty + t.bb.y1, ty + t.bb.y2)}
	${grad('redbar', redStops, barY, barY + 16)}
</defs>
<rect x="6" y="6" width="${s - 12}" height="${s - 12}" rx="36" fill="url(#bg)" stroke="#9ba1a9" stroke-width="6"/>
<g transform="translate(${-SKEW * 2.1},0) skewX(${SKEW})">
	<g transform="translate(${tx.toFixed(1)},${ty.toFixed(1)})">${chromeLayer(t.d, 'chrome')}</g>
	<polygon points="24,${barY + 16} 34,${barY} ${s - 14},${barY} ${s - 24},${barY + 16}" fill="#050506" stroke="#050506" stroke-width="8"/>
	<polygon points="24,${barY + 16} 34,${barY} ${s - 14},${barY} ${s - 24},${barY + 16}" fill="url(#redbar)"/>
</g>
</svg>
`;
}

fs.writeFileSync(path.join(out, 'iron_horizon_logo.svg'), logo());
fs.writeFileSync(path.join(out, 'iron_horizon_icon.svg'), icon());
console.log('ok');
