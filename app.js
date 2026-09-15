import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const sceneHost = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f4f3);
scene.fog = new THREE.Fog(0xf2f4f3, 1800, 3000);

const camera = new THREE.PerspectiveCamera(
  39,
  sceneHost.clientWidth / sceneHost.clientHeight,
  1,
  2400,
);
camera.position.set(0, 280, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(sceneHost.clientWidth, sceneHost.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
sceneHost.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(sceneHost.clientWidth, sceneHost.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.inset = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
sceneHost.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 85;
controls.maxDistance = 1500;
controls.maxPolarAngle = Math.PI * 0.47;

scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x83946f, 1.6));
const sun = new THREE.DirectionalLight(0xfff1dc, 2.2);
sun.position.set(-95, 170, 80);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -220;
sun.shadow.camera.right = 220;
sun.shadow.camera.top = 220;
sun.shadow.camera.bottom = -220;
sun.shadow.camera.far = 650;
sun.shadow.normalBias = 0.045;
sun.shadow.bias = -0.0001;
scene.add(sun);

const campus = new THREE.Group();
campus.rotation.y = 0;
scene.add(campus);

// All positions and names follow the source 1280 x 960 campus diagram.
// This is a schematic map. Extrusion is a visual treatment, not measured height.
const X = (px) => (px - 640) * 0.25,
  Z = (py) => (py - 480) * 0.25;
const buildings = [],
  data = [];
const mapCanvas = document.createElement('canvas');
mapCanvas.width = 2560;
mapCanvas.height = 1920;
const ctx = mapCanvas.getContext('2d');
ctx.scale(2, 2);
ctx.fillStyle = '#f2f4f3';
ctx.fillRect(0, 0, 1280, 960);
function poly(p, fill, stroke, width = 1) {
  ctx.beginPath();
  p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
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
function route(p, width, color) {
  ctx.beginPath();
  p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}
function curve(p, width, color) {
  ctx.beginPath();
  ctx.moveTo(...p[0]);
  for (let i = 1; i < p.length; i += 3) ctx.bezierCurveTo(...p[i], ...p[i + 1], ...p[i + 2]);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}
// Landscape and perimeter follow the new reference, including the open west side.
poly(
  [
    [94, 89],
    [145, 85],
    [213, 99],
    [327, 98],
    [455, 114],
    [548, 116],
    [544, 251],
    [500, 292],
    [438, 334],
    [454, 369],
    [450, 559],
    [489, 640],
    [324, 642],
    [322, 751],
    [294, 757],
    [278, 793],
    [135, 795],
  ],
  '#658b4b',
);
poly(
  [
    [445, 358],
    [528, 286],
    [625, 253],
    [744, 257],
    [800, 336],
    [900, 352],
    [980, 388],
    [971, 476],
    [948, 545],
    [845, 606],
    [821, 767],
    [502, 765],
    [499, 645],
    [452, 559],
  ],
  '#9eb77c',
);
poly(
  [
    [848, 597],
    [958, 552],
    [1104, 554],
    [1142, 669],
    [1160, 763],
    [1147, 801],
    [1109, 815],
    [859, 797],
    [824, 768],
    [831, 643],
  ],
  '#a6bc86',
);
curve(
  [
    [901, 365],
    [862, 357],
    [816, 368],
    [790, 399],
    [772, 426],
    [786, 468],
    [770, 503],
    [762, 536],
    [779, 551],
    [806, 576],
    [851, 564],
    [902, 524],
    [935, 488],
    [958, 455],
    [973, 405],
    [953, 385],
    [942, 376],
    [925, 369],
    [901, 365],
  ],
  1,
  '#729851',
);
ctx.fillStyle = '#729851';
ctx.fill();
const road = '#4f626f';
curve(
  [
    [637, 145],
    [754, 147],
    [932, 143],
    [1033, 166],
    [1081, 177],
    [1066, 246],
    [1078, 304],
    [1077, 348],
    [1101, 426],
    [1104, 550],
    [1116, 622],
    [1135, 678],
    [1155, 731],
    [1170, 778],
    [1158, 811],
    [1118, 811],
    [1021, 807],
    [920, 807],
    [860, 794],
    [837, 786],
    [822, 779],
    [821, 753],
  ],
  10,
  road,
);
route(
  [
    [637, 146],
    [637, 253],
  ],
  10,
  road,
);
curve(
  [
    [501, 764],
    [593, 766],
    [734, 765],
    [822, 765],
    [825, 707],
    [810, 641],
    [845, 605],
    [879, 570],
    [937, 550],
    [962, 502],
    [982, 460],
    [992, 399],
    [959, 369],
    [933, 348],
    [891, 351],
    [855, 350],
  ],
  12,
  road,
);
curve(
  [
    [502, 762],
    [503, 714],
    [503, 659],
    [482, 624],
    [470, 598],
    [460, 578],
    [451, 558],
    [451, 495],
    [448, 430],
    [456, 390],
    [469, 351],
    [499, 339],
    [522, 317],
    [551, 287],
    [581, 264],
    [618, 258],
    [653, 254],
    [703, 253],
    [728, 257],
    [752, 260],
    [766, 298],
    [791, 327],
    [808, 346],
    [832, 350],
    [857, 350],
  ],
  12,
  road,
);
curve(
  [
    [111, 374],
    [144, 431],
    [175, 452],
    [227, 463],
    [282, 473],
    [326, 461],
    [376, 464],
    [411, 464],
    [430, 442],
    [450, 433],
  ],
  11,
  road,
);
route(
  [
    [455, 503],
    [579, 503],
  ],
  7,
  road,
);
curve(
  [
    [615, 586],
    [605, 560],
    [581, 543],
    [587, 510],
    [590, 478],
    [662, 482],
    [711, 491],
    [744, 498],
    [731, 539],
    [700, 581],
  ],
  7,
  road,
);
route(
  [
    [616, 587],
    [705, 587],
  ],
  7,
  road,
);
route(
  [
    [616, 587],
    [615, 750],
  ],
  7,
  road,
);
route(
  [
    [326, 643],
    [491, 643],
  ],
  8,
  road,
);
route(
  [
    [324, 747],
    [373, 755],
    [410, 765],
    [502, 765],
  ],
  10,
  road,
);
route(
  [
    [678, 149],
    [678, 250],
  ],
  8,
  road,
);
route(
  [
    [753, 150],
    [751, 230],
    [771, 258],
  ],
  7,
  road,
);
route(
  [
    [899, 153],
    [940, 212],
    [976, 267],
    [1040, 337],
  ],
  8,
  road,
);
route(
  [
    [750, 272],
    [818, 223],
    [899, 153],
  ],
  8,
  road,
);
route(
  [
    [858, 275],
    [939, 213],
  ],
  7,
  road,
);
route(
  [
    [893, 332],
    [977, 270],
  ],
  7,
  road,
);
route(
  [
    [968, 375],
    [1037, 330],
    [1073, 308],
  ],
  8,
  road,
);
route(
  [
    [967, 526],
    [1086, 443],
  ],
  8,
  road,
);
route(
  [
    [951, 549],
    [1104, 554],
  ],
  9,
  road,
);
// External roads, as named in the supplied image.
route(
  [
    [20, 42],
    [20, 842],
    [0, 842],
  ],
  27,
  '#334a5c',
);
route(
  [
    [80, 42],
    [80, 844],
    [1272, 848],
  ],
  27,
  '#334a5c',
);
route(
  [
    [0, 905],
    [1278, 910],
  ],
  25,
  '#334a5c',
);
ctx.font = '24px "Microsoft YaHei", sans-serif';
ctx.textAlign = 'center';
ctx.fillStyle = '#365265';
ctx.fillText('发展大道', 888, 883);
ctx.save();
ctx.translate(53, 440);
ctx.font = '22px "Microsoft YaHei", sans-serif';
['新', '庆', '路'].forEach((v, i) => ctx.fillText(v, 0, (i - 1) * 27));
ctx.restore();
ctx.fillStyle = '#37502e';
ctx.font = '34px "Microsoft YaHei",sans-serif';
const lakePoints = [
  [464, 410],
  [482, 395],
  [504, 401],
  [536, 390],
  [564, 396],
  [605, 389],
  [629, 403],
  [671, 405],
  [690, 391],
  [723, 390],
  [748, 395],
  [756, 411],
  [746, 432],
  [752, 451],
  [768, 466],
  [757, 480],
  [724, 482],
  [700, 472],
  [665, 479],
  [634, 474],
  [606, 478],
  [576, 485],
  [546, 479],
  [512, 480],
  [489, 469],
  [462, 471],
];
poly(lakePoints, '#c6eaf2', '#edf9e8', 3);

ctx.strokeStyle = '#e5eadf';
ctx.lineWidth = 1.2;
ctx.setLineDash([10, 10]);
ctx.beginPath();
ctx.moveTo(20, 44);
ctx.lineTo(20, 840);
ctx.moveTo(80, 44);
ctx.lineTo(80, 844);
ctx.lineTo(1272, 848);
ctx.moveTo(0, 905);
ctx.lineTo(1278, 910);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = '#799864';
for (let i = 0; i < 1800; i++) {
  const x = 128 + ((i * 67) % 304),
    y = 131 + ((i * 113) % 642);
  ctx.globalAlpha = 0.08;
  ctx.fillRect(x, y, 3, 3);
}
ctx.globalAlpha = 1;

const tex = new THREE.CanvasTexture(mapCanvas);
tex.colorSpace = THREE.SRGBColorSpace;
tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
const base = new THREE.Mesh(
  new THREE.PlaneGeometry(320, 240),
  new THREE.MeshBasicMaterial({ map: tex }),
);
base.rotation.x = -Math.PI / 2;
base.position.y = -0.04;
campus.add(base);
function footprint(points, color, height = 1) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? shape.lineTo(X(x), -Z(y)) : shape.moveTo(X(x), -Z(y))));
  shape.closePath();
  const geo = height
    ? new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
    : new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1 }));
  mesh.castShadow = height > 0;
  mesh.receiveShadow = true;
  return mesh;
}
function register(name, type, px, py, body, description, flat = false) {
  const item = {
    name,
    type,
    typeName: {
      study: '教学与公共服务',
      life: '学生生活',
      sport: '运动场地',
      gate: '出入口',
      land: '校园景观',
    }[type],
    x: X(px),
    z: Z(py),
    text:
      description ||
      '名称与相对位置依据参考资料中的新版武鸣校区示意图。建筑轮廓为示意，实际位置与用途以学校现场标识为准。',
    flat,
  };
  data.push(item);
  body.traverse((o) => {
    if (o.isMesh) o.userData = item;
  });
  const el = document.createElement('div');
  el.className = 'map-label';
  el.textContent = name;
  const label = new CSS2DObject(el);
  label.position.set(X(px), flat ? 0.6 : 3.2, Z(py));
  const group = new THREE.Group();
  group.add(body, label);
  group.userData = { item, body, label };
  campus.add(group);
  buildings.push(group);
  return item;
}
function area(name, type, points, px, py, color, description, height = 1.3) {
  return register(name, type, px, py, footprint(points, color, height), description, height === 0);
}
function rect(name, type, x, y, w, h, color = 0xdbaacb, description) {
  return area(
    name,
    type,
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    x + w / 2,
    y + h / 2,
    color,
    description,
  );
}
// Dormitories use the numbered names printed in the latest map.
area(
  '1号学生宿舍',
  'life',
  [
    [684, 154],
    [745, 154],
    [745, 234],
    [750, 249],
    [735, 264],
    [712, 250],
    [683, 246],
  ],
  716,
  204,
  0x86b5d4,
);
area(
  '2号学生宿舍',
  'life',
  [
    [757, 154],
    [811, 154],
    [817, 203],
    [789, 228],
    [769, 246],
    [758, 228],
  ],
  781,
  192,
  0x8fb8d5,
);
area(
  '3号学生宿舍',
  'life',
  [
    [819, 235],
    [899, 169],
    [934, 213],
    [858, 270],
  ],
  875,
  224,
  0x86b5d4,
);
area(
  '4号学生宿舍',
  'life',
  [
    [865, 278],
    [942, 220],
    [977, 269],
    [895, 325],
  ],
  923,
  278,
  0x86b5d4,
);
area(
  '5号学生宿舍',
  'life',
  [
    [906, 333],
    [982, 277],
    [1030, 335],
    [974, 371],
  ],
  972,
  326,
  0x86b5d4,
);
area(
  '6号学生宿舍',
  'life',
  [
    [910, 155],
    [1037, 170],
    [1052, 180],
    [1066, 216],
    [1066, 292],
    [1041, 324],
    [945, 207],
  ],
  1018,
  221,
  0x86b5d4,
);
area(
  '7号学生宿舍',
  'life',
  [
    [1048, 337],
    [1075, 320],
    [1084, 438],
    [978, 515],
    [969, 505],
    [985, 448],
    [988, 396],
    [980, 379],
  ],
  1031,
  422,
  0x86b5d4,
);
area(
  '8号教师公寓',
  'life',
  [
    [984, 536],
    [1087, 454],
    [1098, 546],
    [991, 546],
  ],
  1045,
  521,
  0x86b5d4,
);
area(
  '9号学生宿舍',
  'life',
  [
    [438, 338],
    [496, 295],
    [522, 324],
    [460, 369],
  ],
  482,
  336,
  0x86b5d4,
);
area(
  '10号学生宿舍',
  'life',
  [
    [503, 290],
    [564, 252],
    [584, 278],
    [528, 317],
  ],
  543,
  288,
  0x86b5d4,
);
area(
  '校医院',
  'study',
  [
    [819, 155],
    [882, 156],
    [824, 201],
  ],
  845,
  174,
  0xe8bed7,
);
area(
  '大学生活动中心',
  'life',
  [
    [779, 274],
    [817, 244],
    [855, 290],
    [823, 311],
  ],
  813,
  271,
  0xdeafd0,
);
area(
  '食堂',
  'life',
  [
    [784, 287],
    [823, 307],
    [858, 290],
    [885, 336],
    [836, 342],
    [803, 330],
  ],
  838,
  320,
  0xf2d88c,
);
rect('图文中心', 'study', 610, 284, 100, 29, 0xdeafd0);
rect('会议中心', 'study', 558, 326, 70, 48, 0xdeafd0);
rect('大礼堂', 'study', 691, 329, 64, 48, 0xdeafd0);
rect(
  '生活服务点 · 通讯服务点',
  'life',
  760,
  349,
  46,
  24,
  0xf1cf89,
  '位置依据新图中的服务点文字与箭头，范围为近似示意。',
);
area(
  '美食街',
  'life',
  [
    [1082, 310],
    [1125, 303],
    [1145, 424],
    [1099, 435],
  ],
  1111,
  370,
  0xefb77c,
);
area(
  '快递站',
  'life',
  [
    [1101, 444],
    [1147, 430],
    [1160, 545],
    [1116, 550],
  ],
  1134,
  494,
  0xd7a2cd,
);
rect(
  '信息综合楼',
  'study',
  601,
  501,
  111,
  47,
  0xe4b6d2,
  '新图标注：信息综合楼（管理学院、应用技术学院）。',
);
rect('2号公共教学楼', 'study', 480, 516, 75, 54, 0xe4b6d2);
rect('1号公共教学楼B', 'study', 515, 596, 85, 69, 0xe4b6d2);
rect('1号公共教学楼A', 'study', 515, 679, 85, 73, 0xe4b6d2);
rect('1号公共实验楼B', 'study', 718, 592, 99, 73, 0xe4b6d2);
rect(
  '1号公共实验楼A',
  'study',
  718,
  678,
  99,
  73,
  0xe4b6d2,
  '新图标注：1号公共实验楼A（建筑工程学院）。',
);
rect('2号学院楼', 'study', 329, 650, 80, 97, 0xe4b6d2, '新图标注：2号学院楼（材料与环境学院）。');
rect('1号学院楼', 'study', 419, 650, 73, 97, 0xe4b6d2, '新图标注：1号学院楼（预科教育学院）。');
rect('橄榄报告厅', 'study', 710, 565, 43, 15, 0xe4b6d2);
area(
  '校前广场',
  'land',
  [
    [623, 598],
    [700, 598],
    [700, 726],
    [623, 726],
  ],
  660,
  649,
  0xddedc1,
  '南大门内侧的校前广场，名称及位置依据新版参考图。',
  0,
);
area('湖', 'land', lakePoints, 616, 447, 0xc6eaf2, '新图标注为“湖”，尚未提供正式湖名。', 0);
// Flat sports markings preserve the infographic appearance of the reference.
const trackGroup = new THREE.Group();
const trackCanvas = document.createElement('canvas');
trackCanvas.width = 300;
trackCanvas.height = 500;
const tc = trackCanvas.getContext('2d');
tc.fillStyle = '#dba6cd';
tc.beginPath();
tc.roundRect(4, 4, 292, 492, 144);
tc.fill();
for (let i = 0; i < 6; i++) {
  tc.strokeStyle = '#f3ddef';
  tc.lineWidth = 2;
  tc.beginPath();
  tc.roundRect(12 + i * 7, 12 + i * 7, 276 - i * 14, 476 - i * 14, 132 - i * 7);
  tc.stroke();
}
tc.strokeStyle = '#f6e9f3';
tc.lineWidth = 2;
tc.strokeRect(65, 114, 170, 275);
tc.beginPath();
tc.moveTo(65, 251);
tc.lineTo(235, 251);
tc.stroke();
tc.beginPath();
tc.arc(150, 251, 31, 0, Math.PI * 2);
tc.stroke();
tc.strokeRect(105, 114, 90, 38);
tc.strokeRect(105, 351, 90, 38);
const trTex = new THREE.CanvasTexture(trackCanvas);
trTex.colorSpace = THREE.SRGBColorSpace;
const trMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(31, 50),
  new THREE.MeshBasicMaterial({ map: trTex, transparent: true }),
);
trMesh.rotation.x = -Math.PI / 2;
trMesh.rotation.z = 0.56;
trMesh.position.set(X(950), 0.08, Z(687));
trackGroup.add(trMesh);
register('田径场', 'sport', 950, 687, trackGroup, '位置与方向按新图右下方田径场绘制。', true);
area(
  '体育馆',
  'sport',
  [
    [1037, 727],
    [1087, 687],
    [1101, 690],
    [1142, 749],
    [1140, 767],
    [1097, 799],
    [1081, 796],
  ],
  1093,
  744,
  0xdba6cd,
);
rect('风雨球场', 'sport', 549, 121, 76, 114, 0xe2c3cf);
for (let i = 0; i < 3; i++) {
  const court = footprint(
    [
      [555 + i * 22, 134],
      [570 + i * 22, 134],
      [570 + i * 22, 224],
      [555 + i * 22, 224],
    ],
    0xaecfbc,
    0.03,
  );
  court.position.y = 1.4;
  campus.add(court);
}
// Stylized south gate, matching the orange entrance icon in the reference.
const gate = new THREE.Group();
function gateBox(x, y, w, d, h, color, lift = 0) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.25, h, d * 0.25),
    new THREE.MeshStandardMaterial({ color, roughness: 1 }),
  );
  m.position.set(X(x), h / 2 + lift, Z(y));
  gate.add(m);
}
gateBox(623, 756, 7, 8, 5, 0xe3a03f);
gateBox(701, 756, 7, 8, 5, 0xe3a03f);
gateBox(662, 756, 92, 13, 1.2, 0xe3a03f, 5);
gateBox(634, 739, 6, 6, 4, 0xe3a03f);
gateBox(690, 739, 6, 6, 4, 0xe3a03f);
gateBox(662, 739, 70, 12, 1, 0xf0b24d, 4);
register('南大门', 'gate', 662, 790, gate, '新图标注：南大门（新生接待点），面向发展大道。');

// Courtyard openings shown within the teaching buildings on the new reference.
for (const b of buildings) {
  const name = b.userData.item.name;
  if (name.startsWith('1号公共') || name.endsWith('号学院楼')) {
    const box = new THREE.Box3().setFromObject(b.userData.body),
      c = box.getCenter(new THREE.Vector3()),
      s = box.getSize(new THREE.Vector3());
    const inset = new THREE.Mesh(
      new THREE.PlaneGeometry(s.x * 0.67, s.z * 0.56),
      new THREE.MeshBasicMaterial({ color: 0xf9f6f4 }),
    );
    inset.rotation.x = -Math.PI / 2;
    inset.position.set(c.x, box.max.y + 0.015, c.z);
    inset.userData = b.userData.item;
    b.userData.body.add(inset);
  }
  if (name === '生活服务点 · 通讯服务点') b.userData.label.position.set(X(796), 2, Z(390));
}
// Architectural detail follows the diagram's parcels; heights and facades are illustrative.
const offWhite = new THREE.MeshStandardMaterial({ color: 0xe7e9e1, roughness: 0.82 });
const roofMat = new THREE.MeshStandardMaterial({ color: 0x526a7e, roughness: 0.78 });
const edgeMat = new THREE.MeshStandardMaterial({ color: 0xaeb9bc, roughness: 0.8 });
const glassMat = new THREE.MeshStandardMaterial({
  color: 0x5792ae,
  metalness: 0.25,
  roughness: 0.35,
});
const facadeCache = new Map();
function facade(w, h) {
  const cols = Math.max(2, Math.round(w / 1.6)),
    rows = Math.max(2, Math.round(h / 1.5));
  const key = cols + ':' + rows;
  if (facadeCache.has(key)) return facadeCache.get(key);
  const c = document.createElement('canvas');
  c.width = cols * 32;
  c.height = rows * 32;
  const p = c.getContext('2d');
  p.fillStyle = '#e4e8df';
  p.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      p.fillStyle = '#bdcaca';
      p.fillRect(i * 32 + 5, j * 32 + 6, 22, 21);
      p.fillStyle = '#477188';
      p.fillRect(i * 32 + 7, j * 32 + 8, 18, 16);
      p.fillStyle = '#a6c4ce';
      p.fillRect(i * 32 + 15, j * 32 + 8, 2, 16);
      p.fillStyle = '#f7f7f0';
      p.fillRect(i * 32, j * 32 + 29, 32, 2);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.75 });
  facadeCache.set(key, m);
  return m;
}
function solid(g, x, y, z, w, h, d, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
let architecturalBlocks = 0;
function architecture(g, px, py, pw, pd, height = 7, angle = 0, pitched = true) {
  const w = pw * 0.25,
    d = pd * 0.25;
  const unit = new THREE.Group();
  unit.position.set(X(px), 0, Z(py));
  unit.rotation.y = (-angle * Math.PI) / 180;
  g.add(unit);
  solid(unit, 0, 0.3, 0, w, height, d, [
    facade(d, height),
    facade(d, height),
    offWhite,
    offWhite,
    facade(w, height),
    facade(w, height),
  ]);
  solid(unit, 0, 0, 0, w + 0.5, 0.3, d + 0.5, edgeMat);
  solid(unit, 0, height + 0.3, 0, w + 0.7, 0.25, d + 0.7, offWhite);
  if (pitched) {
    const rise = Math.min(1.4, d * 0.3);
    const shape = new THREE.Shape();
    shape.moveTo(-d / 2 - 0.35, 0);
    shape.lineTo(0, rise);
    shape.lineTo(d / 2 + 0.35, 0);
    shape.closePath();
    const roof = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: w + 0.7, bevelEnabled: false }),
      roofMat,
    );
    roof.rotation.y = Math.PI / 2;
    roof.position.set(-w / 2 - 0.35, height + 0.55, 0);
    roof.castShadow = true;
    unit.add(roof);
  } else {
    solid(unit, 0, height + 0.55, 0, w - 0.5, 0.15, d - 0.5, roofMat);
    solid(unit, w * 0.22, height + 0.7, 0, w * 0.18, 0.7, d * 0.3, edgeMat);
  }
  solid(unit, 0, 0.3, d / 2 + 0.1, Math.min(1.5, w * 0.2), 1.8, 0.2, glassMat);
  architecturalBlocks++;
  return unit;
}
function courtyard(g, x, y, w, d, h = 6) {
  architecture(g, x, y - d / 2 + 7, w, 14, h);
  architecture(g, x, y + d / 2 - 7, w, 14, h);
  architecture(g, x - w / 2 + 7, y, 14, d - 22, h);
  architecture(g, x + w / 2 - 7, y, 14, d - 22, h);
  solid(
    g,
    X(x),
    0.03,
    Z(y),
    (w - 28) * 0.25,
    0.06,
    (d - 28) * 0.25,
    new THREE.MeshStandardMaterial({ color: 0x9cad7e, roughness: 1 }),
  );
}
const parcelBounds = [];
for (const b of buildings) {
  const bounds = new THREE.Box3().setFromObject(b.userData.body);
  parcelBounds.push(bounds.clone().expandByScalar(1));
  const item = b.userData.item;
  if (item.flat || item.type === 'gate') continue;
  const old = b.userData.body,
    newBody = new THREE.Group();
  b.remove(old);
  b.add(newBody);
  b.userData.body = newBody;
  b.userData.flatBody = old;
  old.visible = false;
  b.add(old);
  const name = item.name,
    px = item.x / 0.25 + 640,
    py = item.z / 0.25 + 480;
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(bounds.max.x - bounds.min.x, 0.12, bounds.max.z - bounds.min.z),
    new THREE.MeshStandardMaterial({ color: 0xcbd2c0, roughness: 1 }),
  );
  pad.position.set((bounds.max.x + bounds.min.x) / 2, 0.03, (bounds.max.z + bounds.min.z) / 2);
  newBody.add(pad);
  const dorms = {
    '1号学生宿舍': [714, 202, 53, 15, 0, 3, 27],
    '2号学生宿舍': [782, 194, 39, 13, 0, 3, 22],
    '3号学生宿舍': [876, 218, 73, 14, -36, 2, 25],
    '4号学生宿舍': [922, 276, 72, 14, -36, 2, 24],
    '5号学生宿舍': [966, 328, 73, 14, -36, 2, 25],
    '6号学生宿舍': [1009, 231, 105, 14, 56, 3, 25],
    '7号学生宿舍': [1031, 418, 91, 15, -36, 3, 25],
    '8号教师公寓': [1044, 511, 69, 14, -36, 2, 24],
    '9号学生宿舍': [480, 333, 61, 17, -36, 1, 0],
    '10号学生宿舍': [544, 285, 59, 17, -36, 1, 0],
  };
  if (dorms[name]) {
    const [cx, cy, w, d, angle, count, gap] = dorms[name];
    for (let j = 0; j < count; j++) {
      const shift = (j - (count - 1) / 2) * gap,
        a = (angle * Math.PI) / 180;
      architecture(newBody, cx - Math.sin(a) * shift, cy + Math.cos(a) * shift, w, d, 7.5, angle);
    }
  } else if (name.startsWith('1号公共') || name.endsWith('号学院楼')) {
    const sz = bounds.getSize(new THREE.Vector3());
    courtyard(newBody, px, py, sz.x / 0.25 - 6, sz.z / 0.25 - 6, 6.5);
  } else if (name === '信息综合楼') {
    architecture(newBody, px, py, 84, 30, 10, 0, false);
    architecture(newBody, px - 42, py + 5, 17, 37, 7);
    architecture(newBody, px + 42, py + 5, 17, 37, 7);
  } else if (name === '图文中心') {
    architecture(newBody, px, py, 92, 29, 11, 0, false);
    solid(newBody, X(px), 11.8, Z(py), 9, 1.8, 5, glassMat);
  } else if (name === '体育馆') {
    architecture(newBody, px, py, 65, 88, 7.5, -36, false);
    const cover = solid(
      newBody,
      X(px),
      8.4,
      Z(py),
      16,
      1.3,
      20,
      new THREE.MeshStandardMaterial({ color: 0xe4e9ec, roughness: 0.7 }),
    );
    cover.rotation.y = 0.63;
  } else if (name === '风雨球场') {
    for (let j = 0; j < 3; j++) {
      const x = 565 + j * 21;
      architecture(newBody, x, 180, 18, 94, 2.8, 0, false);
    }
  } else if (name === '食堂') {
    architecture(newBody, px, py, 63, 35, 5, -25, false);
  } else if (name === '美食街' || name === '快递站') {
    for (let j = 0; j < 4; j++) architecture(newBody, px, py - 36 + j * 24, 33, 20, 3, -8, false);
  } else if (name === '生活服务点 · 通讯服务点') {
    architecture(newBody, px, py, 25, 14, 2.5, 0, false);
  } else {
    const sz = bounds.getSize(new THREE.Vector3());
    architecture(
      newBody,
      px,
      py,
      Math.max(20, sz.x / 0.25 - 8),
      Math.max(14, sz.z / 0.25 - 8),
      name === '大礼堂' ? 7 : 5,
      0,
      false,
    );
  }
  newBody.traverse((o) => {
    if (o.isMesh) o.userData = item;
  });
  b.userData.label.position.y = 12;
}
buildings.find((b) => b.userData.item.name === '湖').userData.body.material.color.setHex(0x5f9eac);
// Replace infographic running track with a green field, red lanes and white markings.
tc.clearRect(0, 0, 300, 500);
tc.fillStyle = '#b57565';
tc.beginPath();
tc.roundRect(4, 4, 292, 492, 144);
tc.fill();
for (let i = 0; i < 6; i++) {
  tc.strokeStyle = '#eac9ae';
  tc.lineWidth = 1.5;
  tc.beginPath();
  tc.roundRect(12 + i * 7, 12 + i * 7, 276 - i * 14, 476 - i * 14, 132 - i * 7);
  tc.stroke();
}
tc.fillStyle = '#4c963f';
tc.fillRect(57, 106, 186, 288);
for (let j = 0; j < 12; j++) {
  if (j % 2 === 0) {
    tc.fillStyle = '#60a54a';
    tc.fillRect(57, 106 + j * 24, 186, 24);
  }
}
tc.strokeStyle = '#f1f3e2';
tc.lineWidth = 2;
tc.strokeRect(66, 116, 168, 268);
tc.beginPath();
tc.moveTo(66, 250);
tc.lineTo(234, 250);
tc.stroke();
tc.beginPath();
tc.arc(150, 250, 34, 0, Math.PI * 2);
tc.stroke();
tc.strokeRect(102, 116, 96, 40);
tc.strokeRect(102, 344, 96, 40);
trTex.needsUpdate = true;
// The main approach is a tiled plaza with rows of planting beds.
const plazaGroup = buildings.find((b) => b.userData.item.name === '校前广场').userData.body;
plazaGroup.material.color.setHex(0xdce1d8);
for (let j = 0; j < 9; j++) {
  for (let k = 0; k < 2; k++)
    solid(
      campus,
      X(628 + k * 66),
      0.05,
      Z(605 + j * 14),
      1.2,
      0.22,
      1.6,
      new THREE.MeshStandardMaterial({ color: 0x748e62, roughness: 1 }),
    );
}
// Terrain is raised gently within the western woods, away from roads and buildings.
function hill(px, py) {
  const tx = X(px),
    tz = Z(py);
  let taper = 1;
  for (const b of parcelBounds) {
    const dx = Math.max(b.min.x - tx, 0, tx - b.max.x),
      dz = Math.max(b.min.z - tz, 0, tz - b.max.z);
    taper = Math.min(taper, Math.hypot(dx, dz) / 4);
  }
  if (taper <= 0) return 0;
  if (px < 130 || px > 430 || py < 130 || py > 780) return 0;
  const edge = Math.min(1, (px - 130) / 55, (430 - px) / 55, (py - 130) / 60, (780 - py) / 60);
  return (
    taper *
    Math.max(0, edge) *
    (3 + 3.2 * Math.sin(((px - 130) / 300) * Math.PI) * Math.sin(((py - 130) / 650) * Math.PI))
  );
}
const terrain = new THREE.PlaneGeometry(320, 240, 160, 120);
terrain.rotateX(-Math.PI / 2);
const pos = terrain.attributes.position;
for (let i = 0; i < pos.count; i++) {
  pos.setY(i, hill(pos.getX(i) / 0.25 + 640, pos.getZ(i) / 0.25 + 480) - 0.06);
}
terrain.computeVertexNormals();
base.geometry.dispose();
base.geometry = terrain;
base.rotation.x = 0;
base.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 1 });
base.receiveShadow = true;
// Deterministic trees, placed only in landscape and away from road pixels/parcels.
const pixels = ctx.getImageData(0, 0, mapCanvas.width, mapCanvas.height);
let seed = 8120;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const trees = [];
for (let i = 0; i < 7500; i++) {
  const px = 120 + random() * 980,
    py = 126 + random() * 650;
  const west = px < 435,
    east = px > 793 && px < 952 && py > 376 && py < 555;
  const edge = random() < 0.075;
  if (!west && !east && !edge) continue;
  const tx = X(px),
    tz = Z(py);
  if (parcelBounds.some((b) => tx > b.min.x && tx < b.max.x && tz > b.min.z && tz < b.max.z))
    continue;
  const index = (Math.floor(py * 2) * mapCanvas.width + Math.floor(px * 2)) * 4;
  const rr = pixels.data[index],
    gg = pixels.data[index + 1],
    bb = pixels.data[index + 2];
  if (!(gg > rr * 1.04 && gg > bb * 1.04)) continue;
  if (west && Math.abs(py - (455 + 15 * Math.sin(px * 0.012))) < 16) continue;
  trees.push({
    x: tx,
    z: tz,
    y: hill(px, py),
    scale: west ? 1 + random() * 1.25 : 0.65 + random() * 0.5,
    color: new THREE.Color(
      [0x38612f, 0x4a733a, 0x537f37, 0x315d32, 0x6a8e44][Math.floor(random() * 5)],
    ),
  });
  if (trees.length >= 1900) break;
}
const crownGeo = new THREE.IcosahedronGeometry(1, 2),
  trunkGeo = new THREE.CylinderGeometry(0.15, 0.23, 1.8, 5);
const crowns = new THREE.InstancedMesh(
  crownGeo,
  new THREE.MeshStandardMaterial({ roughness: 1 }),
  trees.length * 2,
);
const trunks = new THREE.InstancedMesh(
  trunkGeo,
  new THREE.MeshStandardMaterial({ color: 0x665443, roughness: 1 }),
  trees.length,
);
const transform = new THREE.Object3D();
trees.forEach((t, i) => {
  transform.position.set(t.x, t.y + 0.85, t.z);
  transform.scale.set(1, 1, 1);
  transform.updateMatrix();
  trunks.setMatrixAt(i, transform.matrix);
  for (let j = 0; j < 2; j++) {
    transform.position.set(
      t.x + (j ? -0.5 : 0.4) * t.scale,
      t.y + 2 + t.scale + j * 0.6,
      t.z + (j ? 0.4 : -0.3) * t.scale,
    );
    transform.scale.set(t.scale * 1.15, t.scale * (j ? 0.98 : 1.15), t.scale);
    transform.rotation.y = i * 0.39;
    transform.updateMatrix();
    crowns.setMatrixAt(i * 2 + j, transform.matrix);
    crowns.setColorAt(i * 2 + j, t.color);
  }
});
crowns.castShadow = true;
crowns.receiveShadow = true;
campus.add(trunks, crowns);
// Pedestrian paths, lamp posts and boundary planting add scale without hiding locations.
const lampMaterial = new THREE.MeshStandardMaterial({ color: 0x879196, roughness: 0.7 });
for (let i = 0; i < 18; i++) {
  const px = 530 + i * 29;
  const py = 776;
  solid(campus, X(px), 0, Z(py), 0.1, 3.5, 0.1, lampMaterial);
  solid(campus, X(px), 3.5, Z(py), 0.55, 0.2, 0.55, offWhite);
}
// Details needed for local visual and interaction verification.
window.__campusStats = { places: data.length, architecturalBlocks, trees: trees.length };

const raycaster = new THREE.Raycaster(),
  pointer = new THREE.Vector2();
let selected = null,
  touring = false,
  labelsVisible = true,
  isTop = false,
  activeFilter = 'all',
  viewMode = 'bird';
const detail = {
  box: document.querySelector('#detail'),
  type: document.querySelector('#detail-type'),
  title: document.querySelector('#detail-title'),
  text: document.querySelector('#detail-text'),
  meta: document.querySelector('#detail-meta'),
};
const placesDialog = document.querySelector('#places-dialog');
const icons = {
  study: '<path d="M3 21V7l9-4 9 4v14M7 10h2m6 0h2M7 14h2m6 0h2M10 21v-4h4v4"/>',
  life: '<path d="M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7"/>',
  sport:
    '<circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6zM12 7V3M7 11l-4-2m14 2 4-2M9 17l-2 3m8-3 2 3"/>',
  gate: '<path d="M4 21V7h16v14M2 7h20M6 3h12M9 21V11h6v10"/>',
  land: '<path d="M3 16c3-4 5 4 9 0s6 4 9 0M3 21c3-4 5 4 9 0s6 4 9 0M7 11l5-8 5 8z"/>',
};
const majorNames = [
  '7号学生宿舍',
  '田径场',
  '南大门',
  '食堂',
  '图文中心',
  '生活服务点 · 通讯服务点',
  '湖',
];
buildings.forEach((b) => {
  const item = b.userData.item,
    el = b.userData.label.element;
  el.textContent = '';
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  el.setAttribute('aria-label', item.name);
  const pin = document.createElement('span');
  pin.className = 'pin';
  pin.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[item.type] + '</svg>';
  const name = document.createElement('span');
  name.className = 'label-name';
  name.textContent = item.name;
  el.append(pin, name);
  el.style.setProperty(
    '--pin',
    item.type === 'sport' ? '#d58c75' : item.type === 'gate' ? '#e9a64d' : '#25b9d9',
  );
  el.classList.toggle('featured', item.name === '7号学生宿舍');
  if (item.name === '7号学生宿舍') b.userData.label.position.y = 32;
  el.classList.toggle('minor', !majorNames.includes(item.name));
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    select(item);
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(item);
    }
  });
});
function setTour(value) {
  touring = value;
  controls.autoRotate = value;
  document.querySelector('#tour').classList.toggle('active', value);
  document.querySelector('#tour').setAttribute('aria-pressed', String(value));
}
function applyFilter(type) {
  activeFilter = type;
  buildings.forEach((b) => (b.visible = type === 'all' || b.userData.item.type === type));
  document
    .querySelectorAll('.filter')
    .forEach((b) => b.classList.toggle('active', b.dataset.filter === type));
  document.querySelector('#status-text').textContent =
    '位置服务 · 当前共 ' + buildings.filter((b) => b.visible).length + ' 处地点';
  renderPlaces();
}
function select(item) {
  selected = item;
  setTour(false);
  applyFilter('all');
  detail.box.hidden = false;
  detail.type.textContent = item.typeName;
  detail.title.textContent = item.name;
  detail.text.textContent = item.text;
  detail.meta.innerHTML = '<span>武鸣校区</span><span>按参考图标注</span>';
  buildings.forEach((b) => {
    b.userData.label.element.classList.toggle('selected', b.userData.item === item);
    b.userData.body.traverse((o) => {
      if (o.isMesh && o.material.emissive) {
        if (!o.userData.highlightMaterial) {
          o.material = o.material.clone();
          o.userData.highlightMaterial = true;
        }
        o.material.emissive.setHex(b.userData.item === item ? 0x103a42 : 0);
      }
    });
  });
  placesDialog.close();
  layoutLabels();
}
let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY };
  setTour(false);
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, (-(e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(
    buildings
      .filter((b) => b.visible)
      .map((b) => (isTop && b.userData.flatBody ? b.userData.flatBody : b.userData.body)),
    true,
  );
  const hit = hits.find((h) => h.object.userData?.name);
  if (hit) select(hit.object.userData);
});
const search = document.querySelector('#search'),
  results = document.querySelector('#results');
search.addEventListener('input', () => {
  const q = search.value.trim();
  results.replaceChildren();
  if (!q) {
    results.hidden = true;
    return;
  }
  const matches = data.filter(
    (x) => x.name.includes(q) || x.typeName.includes(q) || x.text.includes(q),
  );
  matches.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'result';
    btn.textContent = item.name;
    const small = document.createElement('small');
    small.textContent = item.typeName;
    btn.append(document.createElement('br'), small);
    btn.addEventListener('click', () => {
      select(item);
      search.value = item.name;
      results.hidden = true;
      search.blur();
    });
    results.append(btn);
  });
  if (!matches.length) {
    const p = document.createElement('p');
    p.textContent = '没有找到这个地点，请试试楼号或类别。';
    p.style.cssText = 'padding:8px 13px;font-size:12px;color:#8899a1';
    results.append(p);
  }
  results.hidden = false;
});
document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.search-wrap')) results.hidden = true;
});
function renderPlaces(servicesOnly = false) {
  const list = document.querySelector('#places-list');
  list.replaceChildren();
  data
    .filter(
      (x) =>
        (activeFilter === 'all' || x.type === activeFilter) &&
        (!servicesOnly ||
          ['食堂', '美食街', '快递站', '生活服务点 · 通讯服务点', '校医院', '南大门'].includes(
            x.name,
          )),
    )
    .forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'place-row';
      const title = document.createElement('span');
      title.textContent = item.name;
      const arrow = document.createElement('small');
      arrow.textContent = '查看地点 ›';
      btn.append(title, arrow);
      btn.addEventListener('click', () => select(item));
      list.append(btn);
    });
}
document
  .querySelectorAll('.filter')
  .forEach((btn) => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
document.querySelector('#categories').addEventListener('click', () => {
  document.querySelector('#places-title').textContent = '地点分类';
  renderPlaces();
  placesDialog.showModal();
});
document.querySelector('#services').addEventListener('click', () => {
  document.querySelector('#places-title').textContent = '位置服务';
  applyFilter('all');
  renderPlaces(true);
  placesDialog.showModal();
});
document.querySelector('#close-places').addEventListener('click', () => placesDialog.close());
document.querySelector('#labels').addEventListener('click', (e) => {
  labelsVisible = !labelsVisible;
  e.currentTarget.classList.toggle('active', labelsVisible);
  e.currentTarget.setAttribute('aria-pressed', String(labelsVisible));
  layoutLabels();
});
document.querySelector('#tour').addEventListener('click', () => {
  if (viewMode !== 'bird') resetView(false);
  setTour(!touring);
});
function clearSelection() {
  selected = null;
  detail.box.hidden = true;
  buildings.forEach((b) => {
    b.userData.label.element.classList.remove('selected');
    b.userData.body.traverse((o) => {
      if (o.isMesh && o.material.emissive) o.material.emissive.setHex(0);
    });
  });
}
document.querySelector('#close-detail').addEventListener('click', clearSelection);
const about = document.querySelector('#about-dialog');
document.querySelector('#about').addEventListener('click', () => about.showModal());
document.querySelector('#campus-info').addEventListener('click', () => about.showModal());
document.querySelector('#close-about').addEventListener('click', () => about.close());
const ref = document.querySelector('#reference-dialog');
document.querySelector('#reference').addEventListener('click', () => ref.showModal());
document.querySelector('#close-reference').addEventListener('click', () => ref.close());
let homeDistance = 600,
  googleAttempt = 0;
const googleQuery = encodeURIComponent('广西民族大学武鸣校区');
const googleLink = 'https://www.google.com/maps?q=' + googleQuery + '&t=k&z=17&hl=zh-CN';
document.querySelector('#google-open').href = googleLink;
async function connectGoogle() {
  const attempt = ++googleAttempt,
    status = document.querySelector('#google-status'),
    message = document.querySelector('#google-placeholder-text'),
    frame = document.querySelector('#google-frame');
  status.textContent = '正在检测本机到 Google 地图的连接…';
  message.textContent = 'Google 卫星地图需要在线连接，正在检测服务。';
  frame.hidden = true;
  document.querySelector('#google-placeholder').hidden = false;
  try {
    const response = await fetch('/api/google-map-status', { cache: 'no-store' });
    if (!response.ok) throw Error('连接检测服务暂不可用');
    const result = await response.json();
    if (attempt !== googleAttempt) return;
    if (result.reachable) {
      status.textContent = 'Google 服务可连接，卫星图由 Google 在线加载。';
      message.textContent = '正在加载 Google 地图。';
      frame.src = googleLink + '&output=embed';
      frame.hidden = false;
      document.querySelector('#google-placeholder').hidden = true;
    } else {
      status.textContent = '当前网络未能连接 Google 地图。';
      message.textContent =
        '本机连接 Google 超时，暂时无法显示卫星图。可重试、在 Google 地图中打开，或返回本地鸟瞰。';
      frame.removeAttribute('src');
    }
  } catch (error) {
    if (attempt !== googleAttempt) return;
    status.textContent = '暂时无法完成 Google 连接检测。';
    message.textContent = '可以在 Google 地图中打开校区，或返回本地鸟瞰。';
  }
}
function setView(mode) {
  viewMode = mode;
  setTour(false);
  const google = mode === 'google';
  sceneHost.hidden = google;
  document.querySelector('#google-layer').hidden = !google;
  document.querySelector('.map-tools').hidden = google;
  document.querySelector('.zoom-tools').hidden = google;
  document.querySelector('.view-caption').hidden = google;
  document.querySelector('.compass').hidden = google;
  document.querySelector('.hint').hidden = google;
  document.querySelectorAll('[data-view]').forEach((btn) => {
    const current = btn.dataset.view === mode;
    btn.classList.toggle('active', current);
    btn.setAttribute('aria-pressed', String(current));
  });
  if (google) {
    detail.box.hidden = true;
    connectGoogle();
    return;
  }
  isTop = mode === 'plan';
  const overhead = mode === 'overhead' || isTop;
  controls.enableRotate = !overhead;
  campus.scale.y = 1;
  crowns.visible = !isTop;
  trunks.visible = !isTop;
  buildings.forEach((b) => {
    if (b.userData.flatBody) {
      b.userData.flatBody.visible = isTop;
      b.userData.body.visible = !isTop;
    }
  });
  controls.target.set(0, 0, 0);
  const w = sceneHost.clientWidth,
    h = sceneHost.clientHeight;
  if (w && h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  }
  const dir = (
    overhead ? new THREE.Vector3(0, 1, 0.0001) : new THREE.Vector3(95, 510, 200)
  ).normalize();
  const right = new THREE.Vector3().crossVectors(camera.up, dir).normalize(),
    up = new THREE.Vector3().crossVectors(dir, right).normalize();
  const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)),
    tanX = tanY * camera.aspect;
  let distance = 0;
  for (const x of [-146, 143])
    for (const z of [-105, 108])
      for (const y of [0, 16]) {
        const p = new THREE.Vector3(x, y, z);
        distance = Math.max(
          distance,
          Math.abs(p.dot(right)) / tanX + p.dot(dir),
          Math.abs(p.dot(up)) / tanY + p.dot(dir),
        );
      }
  homeDistance = distance * 1.015;
  camera.position.copy(dir.multiplyScalar(homeDistance));
  camera.lookAt(controls.target);
  controls.update();
  document.querySelector('#view-label').textContent = isTop ? '鸟瞰' : '二维';
  document
    .querySelector('#view-toggle')
    .setAttribute('aria-label', isTop ? '切换鸟瞰地图' : '切换二维地图');
  document.querySelector('#view-caption-title').textContent = {
    bird: '鸟瞰 3D',
    overhead: '正上方 · 立体模型',
    plan: '平面图',
  }[mode];
  document.querySelector('#view-caption-text').textContent =
    mode === 'bird'
      ? '高空斜俯视 · 拖动旋转，点击放大'
      : mode === 'overhead'
        ? '垂直俯视 · 保留楼体与树木'
        : '二维区域 · 按校园参考图绘制';
  layoutLabels();
}
function resetView(top = false) {
  setView(top ? 'plan' : 'bird');
}
document
  .querySelectorAll('[data-view]')
  .forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.view)));
document.querySelector('#google-retry').addEventListener('click', connectGoogle);
document.querySelector('#google-back').addEventListener('click', () => setView('bird'));
function zoomMap(factor) {
  if (viewMode === 'google') return;
  setTour(false);
  const offset = camera.position.clone().sub(controls.target),
    distance = Math.min(
      controls.maxDistance,
      Math.max(controls.minDistance, offset.length() * factor),
    );
  camera.position.copy(controls.target).add(offset.normalize().multiplyScalar(distance));
  controls.update();
  layoutLabels();
}
document.querySelector('#zoom-in').addEventListener('click', () => zoomMap(0.8));
document.querySelector('#zoom-out').addEventListener('click', () => zoomMap(1.25));

document
  .querySelector('#view-toggle')
  .addEventListener('click', () => setView(viewMode === 'plan' ? 'bird' : 'plan'));
function overview() {
  clearSelection();
  applyFilter('all');
  search.value = '';
  resetView(false);
}
document.querySelector('#reset').addEventListener('click', overview);
document.querySelector('#overview').addEventListener('click', overview);
controls.autoRotateSpeed = 0.6;
controls.maxPolarAngle = Math.PI * 0.47;
function layoutLabels() {
  const w = sceneHost.clientWidth,
    h = sceneHost.clientHeight,
    zoomed = camera.position.distanceTo(controls.target) < homeDistance * 0.67;
  const used = [];
  const ranked = [...buildings].sort((a, b) => {
    const rank = (x) =>
      x.userData.item === selected
        ? -100
        : majorNames.indexOf(x.userData.item.name) < 0
          ? 99
          : majorNames.indexOf(x.userData.item.name);
    return rank(a) - rank(b);
  });
  let count = 0;
  const max = zoomed ? 24 : innerWidth < 720 ? 5 : 10;
  for (const b of ranked) {
    const item = b.userData.item,
      el = b.userData.label.element;
    let visible =
      labelsVisible && b.visible && (zoomed || majorNames.includes(item.name) || item === selected);
    if (visible) {
      const p = b.userData.label.getWorldPosition(new THREE.Vector3()).project(camera);
      const x = (p.x * 0.5 + 0.5) * w,
        y = (-p.y * 0.5 + 0.5) * h;
      const width = Math.min(240, item.name.length * (innerWidth < 720 ? 10 : 12) + 20),
        rect = { x: x - width / 2, y: y - 38, w: width, h: 55 };
      visible =
        p.z < 1 &&
        p.z > -1 &&
        rect.x > 2 &&
        rect.x + rect.w < w - 5 &&
        rect.y > 2 &&
        rect.y + rect.h < h - 4 &&
        count < max;
      if (visible && innerWidth < 720 && x > w - 73 && y < 266) visible = false;
      if (
        visible &&
        used.some(
          (r) =>
            rect.x < r.x + r.w + 8 &&
            rect.x + rect.w + 8 > r.x &&
            rect.y < r.y + r.h + 7 &&
            rect.y + rect.h + 7 > r.y,
        )
      )
        visible = false;
      if (visible) {
        used.push(rect);
        count++;
      }
    }
    el.style.visibility = visible ? 'visible' : 'hidden';
    el.tabIndex = visible ? 0 : -1;
  }
}
let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (frame++ % 5 === 0) layoutLabels();
  document.querySelector('.compass i').style.transform =
    'rotate(' + -controls.getAzimuthalAngle() + 'rad)';
  if (viewMode !== 'google') {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
}
resetView(false);
animate();
new ResizeObserver(() => {
  const w = sceneHost.clientWidth,
    h = sceneHost.clientHeight;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  if (viewMode !== 'google') setView(viewMode);
}).observe(sceneHost);
window.__mapReady = true;
window.__campusView = () => ({
  viewMode,
  isTop,
  touring,
  selected: selected?.name,
  filter: activeFilter,
  labelsVisible,
  visibleLabels: buildings.filter((b) => b.userData.label.element.style.visibility === 'visible')
    .length,
  ...window.__campusStats,
});
