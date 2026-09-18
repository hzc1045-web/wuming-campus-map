import { writeFile } from 'node:fs/promises';
import { layout, places } from '../public/campus-layout.js';

const esc = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const points = (p) => p.map((x) => x.map((n) => n.toFixed(1)).join(',')).join(' ');
const polygon = (p, fill, stroke = 'none', width = 1) =>
  `<polygon points="${points(p)}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const rect = (x, y, w, d, angle = 0, fill = '#53aecd') =>
  `<rect x="${x - w / 2}" y="${y - d / 2}" width="${w}" height="${d}" fill="${fill}" stroke="#f0f4df" stroke-width="2" transform="rotate(${angle} ${x} ${y})"/>`;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="880" viewBox="0 0 1640 880"><title>武鸣校区布局索引 · 2026-09-18 参考图重绘</title><rect width="1640" height="880" fill="#eef3e9"/>`;
svg += polygon(layout.boundary, '#bdd39d');
for (const r of layout.roads)
  svg += `<polyline points="${points(r.points)}" fill="none" stroke="#687f89" stroke-width="${r.width}" stroke-linejoin="round" stroke-linecap="round"/>`;
svg += polygon(layout.woods, '#86b170') + polygon(layout.lake, '#5aa6ad', '#e1e8c9', 6);
for (const p of places) {
  if (p.blocks) for (const [x, y, w, d, a] of p.blocks) svg += rect(x, y, w, d, a);
  else if (p.kind === 'courtyard')
    svg += rect(p.x, p.y, p.w, p.d) + rect(p.x, p.y, p.w - 28, p.d - 28, 0, '#bad196');
  else if (p.kind === 'track')
    svg += `<g transform="rotate(${p.angle} ${p.x} ${p.y})"><rect x="${p.x - p.w / 2}" y="${p.y - p.d / 2}" width="${p.w}" height="${p.d}" rx="${p.w / 2}" fill="#d29ba4" stroke="#eee4cc" stroke-width="3"/><rect x="${p.x - 49}" y="${p.y - 72}" width="98" height="144" fill="#93b85b" stroke="#edf5d8" stroke-width="2"/></g>`;
  else if (p.kind === 'plaza') svg += rect(p.x, p.y, p.w, p.d, 0, '#d3e0e3');
  else if (p.w)
    svg += rect(
      p.x,
      p.y,
      p.w,
      p.d,
      p.angle || 0,
      p.kind === 'courts' ? '#aab878' : p.kind === 'gate' ? '#4f8faa' : '#53aecd',
    );
}
svg +=
  '<g font-family="Microsoft YaHei,PingFang SC,sans-serif" text-anchor="middle" font-size="12" fill="#2e5766">';
for (const p of places) {
  const name = p.short || p.name,
    w = name.length * 12 + 18,
    y = p.y - (p.kind === 'gate' ? 21 : 0);
  svg += `<g><rect x="${p.x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="#f9fff9" stroke="#75b5c2"/><text x="${p.x}" y="${y + 4}">${esc(name)}</text></g>`;
}
svg +=
  '</g><text x="200" y="66" font-family="Microsoft YaHei,sans-serif" font-size="16" fill="#44684d">校园布局索引 · 示意，非测绘地图</text></svg>';
await writeFile(new URL('../public/assets/layout-overview.svg', import.meta.url), svg);
console.log(`Layout generated from ${places.length} places.`);
