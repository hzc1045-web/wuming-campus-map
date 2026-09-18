import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { layout, places } from './campus-layout.js';

export function buildCampus(campus, renderer) {
  const X = (x) => (x - layout.width / 2) * 0.25,
    Z = (y) => (y - layout.height / 2) * 0.25;
  const buildings = [],
    data = [],
    excluded = [];
  let architecturalBlocks = 0,
    seed = 9182026;
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.88 });
  const white = material(0xe9eadf),
    roof = material(0x299dc5),
    edge = material(0xcbd5d6),
    stone = material(0xd4dedc),
    glass = material(0x397f9a);
  const canvas = document.createElement('canvas');
  canvas.width = layout.width * 2;
  canvas.height = layout.height * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  ctx.fillStyle = '#eef2e9';
  ctx.fillRect(0, 0, layout.width, layout.height);
  function polygon(points, fill, stroke, width = 1) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }
  function line(points, width, color, smooth = true) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    if (smooth) {
      for (let i = 1; i < points.length - 1; i++)
        ctx.quadraticCurveTo(
          ...points[i],
          (points[i][0] + points[i + 1][0]) / 2,
          (points[i][1] + points[i + 1][1]) / 2,
        );
      ctx.lineTo(...points.at(-1));
    } else points.slice(1).forEach((p) => ctx.lineTo(...p));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  polygon(layout.boundary, '#96b96e');
  polygon(
    [
      [161, 44],
      [708, 43],
      [604, 161],
      [474, 241],
      [340, 307],
      [371, 389],
      [590, 406],
      [651, 392],
      [646, 537],
      [672, 594],
      [494, 598],
      [487, 735],
      [568, 783],
      [188, 826],
    ],
    '#78a55c',
  );
  for (let i = 0; i < 15000; i++) {
    const x = 160 + random() * 1400,
      y = 45 + random() * 785;
    ctx.fillStyle = i % 2 ? '#709b5130' : '#b4ce872e';
    ctx.beginPath();
    ctx.arc(x, y, 1 + random() * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  line(
    [
      [122, 0],
      [145, 853],
      [1640, 868],
    ],
    51,
    '#647d92',
    false,
  );
  ctx.setLineDash([12, 12]);
  line(
    [
      [122, 0],
      [145, 853],
      [1640, 868],
    ],
    1.8,
    '#dce3dd',
    false,
  );
  ctx.setLineDash([]);
  for (const r of layout.roads) line(r.points, r.width + 6, '#d0d9bd');
  for (const r of layout.roads) line(r.points, r.width, '#526b7b');
  polygon(layout.woods, '#709d52', '#c6d5b7', 3);
  polygon(layout.lake, '#469b99', '#dce2b1', 10);
  polygon(layout.lake, '#499e9e', '#8bc3b1', 2);
  line(
    [
      [702, 344],
      [738, 335],
      [776, 347],
      [807, 334],
      [850, 335],
      [883, 342],
      [1001, 341],
      [1035, 344],
    ],
    3,
    '#e1e4cb',
  );
  line(
    [
      [701, 453],
      [771, 450],
      [845, 450],
      [921, 446],
      [1016, 450],
    ],
    3,
    '#e1e4cb',
  );
  line(
    [
      [877, 510],
      [878, 731],
      [990, 731],
      [990, 510],
    ],
    4,
    '#e3e5d9',
    false,
  );
  for (let i = 0; i < 15; i++)
    line(
      [
        [882, 531 + i * 14],
        [986, 531 + i * 14],
      ],
      1,
      '#c7d0cc',
      false,
    );

  function outline(p) {
    const a = ((p.angle || 0) * Math.PI) / 180;
    return [
      [-p.w / 2, -p.d / 2],
      [p.w / 2, -p.d / 2],
      [p.w / 2, p.d / 2],
      [-p.w / 2, p.d / 2],
    ].map(([x, y]) => [
      p.x + x * Math.cos(a) - y * Math.sin(a),
      p.y + x * Math.sin(a) + y * Math.cos(a),
    ]);
  }
  function shape(points, color, height = 0) {
    const path = new THREE.Shape();
    points.forEach(([x, y], i) => (i ? path.lineTo(X(x), -Z(y)) : path.moveTo(X(x), -Z(y))));
    path.closePath();
    const geo = height
      ? new THREE.ExtrudeGeometry(path, { depth: height, bevelEnabled: false })
      : new THREE.ShapeGeometry(path);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, material(color));
    mesh.receiveShadow = true;
    mesh.castShadow = height > 0;
    return mesh;
  }
  function box(g, x, y, z, w, h, d, mat = white) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  }
  const facades = new Map();
  function facade(w, h) {
    const cols = Math.max(2, Math.round(w / 1.7)),
      rows = Math.max(2, Math.round(h / 1.4)),
      key = `${cols}:${rows}`;
    if (facades.has(key)) return facades.get(key);
    const c = document.createElement('canvas');
    c.width = cols * 32;
    c.height = rows * 32;
    const p = c.getContext('2d');
    p.fillStyle = '#efebdf';
    p.fillRect(0, 0, c.width, c.height);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        p.fillStyle = '#afbab7';
        p.fillRect(x * 32 + 5, y * 32 + 6, 22, 22);
        p.fillStyle = '#477d94';
        p.fillRect(x * 32 + 7, y * 32 + 8, 18, 17);
        p.fillStyle = '#dce3df';
        p.fillRect(x * 32 + 15, y * 32 + 8, 2, 17);
        p.fillRect(x * 32, y * 32 + 29, 32, 3);
      }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    facades.set(key, mat);
    return mat;
  }
  function block(g, flat, [px, py, pw, pd, angle = 0, h = 6], pitched = true) {
    const w = pw * 0.25,
      d = pd * 0.25,
      u = new THREE.Group();
    u.position.set(X(px), 0, Z(py));
    u.rotation.y = (-angle * Math.PI) / 180;
    g.add(u);
    const ground = outline({ x: px, y: py, w: pw + 9, d: pd + 9, angle });
    excluded.push(ground);
    polygon(ground, '#d5ddd3', '#e1e5d9', 1);
    box(u, 0, 0.15, 0, w, h, d, [
      facade(d, h),
      facade(d, h),
      white,
      white,
      facade(w, h),
      facade(w, h),
    ]);
    box(u, 0, 0, 0, w + 0.3, 0.18, d + 0.3, edge);
    box(u, 0, h + 0.15, 0, w + 0.5, 0.18, d + 0.5, white);
    if (pitched) {
      const s = new THREE.Shape();
      s.moveTo(-d / 2 - 0.2, 0);
      s.lineTo(0, Math.min(1.1, d * 0.2));
      s.lineTo(d / 2 + 0.2, 0);
      s.closePath();
      const r = new THREE.Mesh(
        new THREE.ExtrudeGeometry(s, { depth: w + 0.5, bevelEnabled: false }),
        roof,
      );
      r.rotation.y = Math.PI / 2;
      r.position.set(-w / 2 - 0.25, h + 0.33, 0);
      r.castShadow = true;
      u.add(r);
    } else box(u, 0, h + 0.33, 0, w - 0.4, 0.25, d - 0.4, roof);
    const f = shape(outline({ x: px, y: py, w: pw, d: pd, angle }), 0x55afcd, 0.15);
    f.position.y = 0.2;
    flat.add(f);
    architecturalBlocks++;
    return u;
  }
  function planeImage(g, p, c) {
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(p.w * 0.25, p.d * 0.25),
      new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 1 }),
    );
    m.rotation.set(-Math.PI / 2, 0, 0);
    m.rotateZ((-(p.angle || 0) * Math.PI) / 180);
    m.position.set(X(p.x), 0.12, Z(p.y));
    m.receiveShadow = true;
    g.add(m);
  }
  function sportsTexture(track) {
    const c = document.createElement('canvas');
    c.width = 400;
    c.height = 600;
    const p = c.getContext('2d');
    if (track) {
      p.fillStyle = '#ca8c96';
      p.beginPath();
      p.roundRect(5, 5, 390, 590, 194);
      p.fill();
      p.strokeStyle = '#f9e0db';
      p.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        p.beginPath();
        p.roundRect(14 + i * 7, 14 + i * 7, 372 - i * 14, 572 - i * 14, 181 - i * 7);
        p.stroke();
      }
      p.fillStyle = '#79b14c';
      p.fillRect(72, 126, 256, 348);
      for (let i = 0; i < 12; i++) {
        p.fillStyle = i % 2 ? '#85bc53' : '#72a847';
        p.fillRect(72, 126 + i * 29, 256, 29);
      }
      p.strokeStyle = '#eff4d6';
      p.lineWidth = 2;
      p.strokeRect(82, 137, 236, 326);
      p.beginPath();
      p.moveTo(82, 300);
      p.lineTo(318, 300);
      p.stroke();
      p.beginPath();
      p.arc(200, 300, 41, 0, Math.PI * 2);
      p.stroke();
      p.strokeRect(128, 137, 144, 52);
      p.strokeRect(128, 411, 144, 52);
    } else {
      p.fillStyle = '#8bac65';
      p.fillRect(0, 0, 400, 600);
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 3; j++) {
          const x = 16 + i * 190,
            y = 14 + j * 196;
          p.fillStyle = j ? '#80a36a' : '#b78599';
          p.fillRect(x, y, 178, 180);
          p.strokeStyle = '#eef0dc';
          p.lineWidth = 3;
          p.strokeRect(x + 7, y + 7, 164, 166);
          p.beginPath();
          p.moveTo(x + 7, y + 90);
          p.lineTo(x + 171, y + 90);
          p.stroke();
          p.beginPath();
          p.arc(x + 89, y + 90, 25, 0, Math.PI * 2);
          p.stroke();
        }
    }
    return c;
  }
  function inPoly(x, y, points) {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const [xi, yi] = points[i],
        [xj, yj] = points[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  for (const p of places) {
    const body = new THREE.Group(),
      flat = new THREE.Group();
    const item = {
      ...p,
      x: X(p.x),
      z: Z(p.y),
      typeName: {
        study: '教学与公共服务',
        life: '学生生活',
        sport: '运动场地',
        gate: '出入口',
        land: '校园景观',
      }[p.type],
      text:
        p.description ||
        '依据你提供的校园导览图调整位置与轮廓，楼体高度为示意；实际名称及用途以学校现场标识为准。',
    };
    if (p.kind === 'dorm') p.blocks.forEach((b) => block(body, flat, b));
    else if (p.kind === 'courtyard') {
      block(body, flat, [p.x, p.y - p.d / 2 + 7, p.w, 14, 0, 6]);
      block(body, flat, [p.x, p.y + p.d / 2 - 7, p.w, 14, 0, 6]);
      block(body, flat, [p.x - p.w / 2 + 7, p.y, 14, p.d - 22, 0, 6]);
      block(body, flat, [p.x + p.w / 2 - 7, p.y, 14, p.d - 22, 0, 6]);
      polygon(outline({ ...p, w: p.w - 28, d: p.d - 28 }), '#a1ba81');
    } else if (p.kind === 'library') {
      block(body, flat, [p.x, p.y, 100, 58, 0, 9], false);
      block(body, flat, [p.x - 61, p.y + 3, 24, 48, 0, 7], false);
      block(body, flat, [p.x + 61, p.y + 3, 24, 48, 0, 7], false);
      box(body, X(p.x), 9.6, Z(p.y - 8), 13, 1.8, 8, roof);
      for (let i = -3; i <= 3; i++) box(body, X(p.x + i * 10), 0, Z(p.y + 34), 0.45, 5, 1, white);
    } else if (p.kind === 'information') {
      block(body, flat, [p.x, p.y, 127, 25, 0, 6.5], false);
      block(body, flat, [p.x - 75, p.y + 4, 27, 40, 0, 7]);
      block(body, flat, [p.x + 75, p.y + 4, 27, 40, 0, 7]);
    } else if (p.kind === 'hall') {
      const ground = outline({ ...p, w: p.w + 22, d: p.d + 22 });
      polygon(ground, '#d7dfd9');
      excluded.push(ground);
      block(body, flat, [p.x, p.y, p.w, p.d, p.angle || 0, p.height], false);
      if (p.name.includes('食堂')) {
        const r = block(
          body,
          flat,
          [p.x - 8, p.y - 8, p.w * 0.64, p.d * 0.57, p.angle || 0, p.height + 1.4],
          false,
        );
        r.children[0].material = white;
      }
    } else if (p.kind === 'track' || p.kind === 'courts') {
      const c = sportsTexture(p.kind === 'track');
      planeImage(body, p, c);
      planeImage(flat, p, c);
      excluded.push(outline(p));
    } else if (p.kind === 'stand') {
      const u = new THREE.Group();
      u.position.set(X(p.x), 0, Z(p.y));
      u.rotation.y = (-p.angle * Math.PI) / 180;
      body.add(u);
      for (let i = 0; i < 5; i++)
        box(u, -p.w * 0.125 + i * 1.6, 0, 0, 1.6, 0.5 + i * 0.6, p.d * 0.25, stone);
      block(body, flat, [p.x - 5, p.y + 3, 12, 115, p.angle, 4], false);
    } else if (p.kind === 'gym') {
      block(body, flat, [p.x, p.y, p.w, p.d, p.angle, 8], false);
      const u = new THREE.Group();
      u.position.set(X(p.x), 8.6, Z(p.y));
      u.rotation.y = (-p.angle * Math.PI) / 180;
      body.add(u);
      box(u, 0, 0, -6, 26, 0.9, 22, white);
      box(u, 0, 0, 13, 23, 0.7, 13, roof);
    } else if (p.kind === 'gate') {
      for (const dx of [-36, -24, 24, 36]) box(body, X(p.x + dx), 0, Z(p.y), 0.7, 4.1, 1.5, white);
      box(body, X(p.x), 4.1, Z(p.y), 20, 0.8, 2.8, roof);
      box(body, X(p.x), 4.6, Z(p.y), 8, 0.8, 3.4, white);
      flat.add(shape(outline(p), 0x427e9e, 0.2));
      excluded.push(outline({ ...p, d: 45 }));
    } else if (p.kind === 'plaza') {
      const surface = outline(p);
      polygon(surface, '#d4dfe1', '#e6ede5', 4);
      excluded.push(surface);
      for (let i = 0; i < 14; i++)
        line(
          [
            [p.x - 48, p.y - 98 + i * 15],
            [p.x + 48, p.y - 98 + i * 15],
          ],
          0.6,
          '#bfcfd4',
          false,
        );
      for (let i = 0; i < 5; i++)
        line(
          [
            [p.x - 40 + i * 20, p.y - 100],
            [p.x - 40 + i * 20, p.y + 100],
          ],
          0.6,
          '#bfced3',
          false,
        );
      const paving = shape(surface, 0xd4dfe1, 0);
      paving.material.transparent = true;
      paving.material.opacity = 0;
      paving.material.depthWrite = false;
      body.add(paving);
      flat.add(paving.clone());
      for (let i = 0; i < 12; i++)
        for (const dx of [-60, 60]) {
          box(body, X(p.x + dx), 0, Z(p.y - 91 + i * 16), 1.5, 0.25, 2, stone);
          box(body, X(p.x + dx), 0.25, Z(p.y - 91 + i * 16), 1.1, 0.6, 1.5, material(0x658c48));
        }
    } else if (p.kind === 'lake') {
      const water = shape(layout.lake, 0x438f94, 0);
      water.position.y = 0.08;
      water.material.roughness = 0.4;
      body.add(water);
      flat.add(water.clone());
      excluded.push(layout.lake);
    } else if (p.kind === 'woods') {
      const ground = shape(layout.woods, 0x7da45a, 0);
      ground.position.y = 0.01;
      body.add(ground);
      flat.add(ground.clone());
    }
    body.traverse((o) => {
      if (o.isMesh) o.userData = item;
    });
    flat.traverse((o) => {
      if (o.isMesh) o.userData = item;
    });
    flat.visible = false;
    const el = document.createElement('div');
    el.className = 'map-label';
    el.textContent = p.short || p.name;
    const label = new CSS2DObject(el);
    label.position.set(X(p.x), p.type === 'land' ? 2 : 11, Z(p.y));
    const group = new THREE.Group();
    group.add(body, flat, label);
    group.userData = { item, body, flatBody: flat, label };
    campus.add(group);
    buildings.push(group);
    data.push(item);
  }

  // Trees are rejected on road pixels and within building footprints.
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height),
    trees = [];
  function green(x, y) {
    const i = (Math.floor(y * 2) * canvas.width + Math.floor(x * 2)) * 4;
    return (
      pixels.data[i + 1] > pixels.data[i] * 1.08 && pixels.data[i + 1] > pixels.data[i + 2] * 1.15
    );
  }
  function hill(x, y) {
    if (!green(x, y)) return 0;
    if (x > 220 && x < 620 && y > 60 && y < 790)
      return (
        4 * Math.sin(((x - 220) / 400) * Math.PI) ** 2 * Math.sin(((y - 60) / 730) * Math.PI) ** 2
      );
    if (inPoly(x, y, layout.woods))
      return 2 * Math.max(0, 1 - ((x - 1200) / 140) ** 2 - ((y - 440) / 150) ** 2);
    return 0;
  }
  for (let i = 0; i < 13000 && trees.length < 2300; i++) {
    const x = 173 + random() * 1370,
      y = 52 + random() * 763;
    if (!inPoly(x, y, layout.boundary) || !green(x, y)) continue;
    const forest = x < 660 || inPoly(x, y, layout.woods);
    if (!forest && random() > 0.16) continue;
    if (excluded.some((p) => inPoly(x, y, p))) continue;
    trees.push({
      x: X(x),
      z: Z(y),
      y: hill(x, y),
      size: forest ? 0.8 + random() * 0.75 : 0.55 + random() * 0.3,
    });
  }
  const crowns = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    material(0xffffff),
    trees.length * 2,
  );
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.1, 0.16, 1.5, 5),
    material(0x827660),
    trees.length,
  );
  const transform = new THREE.Object3D(),
    palette = [0x437638, 0x52883f, 0x619747, 0x76a750, 0x4e7f35];
  trees.forEach((t, i) => {
    transform.position.set(t.x, t.y + 0.75, t.z);
    transform.scale.set(1, 1, 1);
    transform.updateMatrix();
    trunks.setMatrixAt(i, transform.matrix);
    for (let j = 0; j < 2; j++) {
      transform.position.set(
        t.x + (j ? -0.45 : 0.3) * t.size,
        t.y + 1.5 + t.size + j * 0.35,
        t.z + (j ? 0.3 : -0.2) * t.size,
      );
      transform.scale.set(t.size * 1.1, t.size * 1.2, t.size);
      transform.rotation.y = i * 0.73;
      transform.updateMatrix();
      crowns.setMatrixAt(i * 2 + j, transform.matrix);
      crowns.setColorAt(i * 2 + j, new THREE.Color(palette[i % palette.length]));
    }
  });
  crowns.castShadow = true;
  crowns.receiveShadow = true;
  campus.add(crowns, trunks);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const geo = new THREE.PlaneGeometry(layout.width * 0.25, layout.height * 0.25, 164, 88);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++)
    pos.setY(
      i,
      hill(pos.getX(i) / 0.25 + layout.width / 2, pos.getZ(i) / 0.25 + layout.height / 2) - 0.08,
    );
  geo.computeVertexNormals();
  const base = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
  base.receiveShadow = true;
  campus.add(base);
  return {
    buildings,
    data,
    crowns,
    trunks,
    stats: {
      places: data.length,
      architecturalBlocks,
      trees: trees.length,
      revision: layout.revision,
    },
  };
}
