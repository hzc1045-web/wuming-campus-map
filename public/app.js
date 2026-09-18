import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import { buildCampus } from './campus-scene.js';

const sceneHost = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f4ef);
scene.fog = new THREE.Fog(0xf1f4ef, 1800, 3000);

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
controls.maxDistance = 2200;
controls.maxPolarAngle = Math.PI * 0.47;

scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x83946f, 1.6));
const sun = new THREE.DirectionalLight(0xfff5e7, 1.8);
sun.position.set(-110, 230, 65);
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

const { buildings, data, crowns, trunks, stats } = buildCampus(campus, renderer);
window.__campusStats = stats;
document.querySelector('#status-text').textContent = '参考图导览 · 共 ' + data.length + ' 处地点';

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
  '校大门',
  '图文中心',
  '校园湖',
  '田径场',
  '二食堂',
  '体育馆',
  '信息综合楼',
  '一食堂 / 学生活动中心',
  '19号学生宿舍',
  '13号学生宿舍',
  '7号学生宿舍',
  '中央林地',
  '1号公共教学楼A',
  '1号公共实验楼A',
  '2号学院楼',
  '北侧球场',
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
  name.textContent = item.short || item.name;
  el.append(pin, name);
  el.style.setProperty(
    '--pin',
    item.type === 'sport' ? '#d58c75' : item.type === 'gate' ? '#e9a64d' : '#25b9d9',
  );
  el.classList.toggle('featured', item.name === '图文中心');
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
  if (viewMode === 'google') setView('bird');
  const direction = camera.position.clone().sub(controls.target).normalize();
  const distance = Math.min(
    camera.position.distanceTo(controls.target),
    innerWidth < 720 ? 255 : 350,
  );
  controls.target.set(item.x, 0, item.z);
  camera.position.copy(controls.target).add(direction.multiplyScalar(distance));
  camera.lookAt(controls.target);
  controls.update();
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
  const aliases = {
    南大门: '校大门',
    大礼堂: '礼堂',
    '8号教师公寓': '8号教职工公寓',
    '2号公共教学楼': '2号教学楼',
  };
  const query = aliases[q] || q;
  results.replaceChildren();
  if (!q) {
    results.hidden = true;
    return;
  }
  const matches = data.filter(
    (x) => x.name.includes(query) || x.typeName.includes(query) || x.text.includes(query),
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
          ['一食堂 / 学生活动中心', '二食堂', '校医院', '校大门', '信息综合楼'].includes(x.name)),
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
  if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    status.textContent = '校园示意图与 Google 在线地图分别查看。';
    message.textContent = '点击上方“在 Google 地图中打开”查看在线影像，能否加载取决于你的网络。';
    frame.hidden = true;
    document.querySelector('#google-placeholder').hidden = false;
    return;
  }
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
  controls.target.set(innerWidth < 720 ? 60 : 0, 0, 0);
  const w = sceneHost.clientWidth,
    h = sceneHost.clientHeight;
  if (w && h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  }
  const dir = (
    overhead ? new THREE.Vector3(0, 1, 0.0001) : new THREE.Vector3(0, 510, 275)
  ).normalize();
  const right = new THREE.Vector3().crossVectors(camera.up, dir).normalize(),
    up = new THREE.Vector3().crossVectors(dir, right).normalize();
  const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)),
    tanX = tanY * camera.aspect;
  let distance = 0;
  for (const x of innerWidth < 720 ? [-80, 203] : [-183, 203])
    for (const z of [-104, 109])
      for (const y of [0, 16]) {
        const p = new THREE.Vector3(x, y, z).sub(controls.target);
        distance = Math.max(
          distance,
          Math.abs(p.dot(right)) / tanX + p.dot(dir),
          Math.abs(p.dot(up)) / tanY + p.dot(dir),
        );
      }
  homeDistance = distance * 1.025;
  camera.position.copy(controls.target).add(dir.multiplyScalar(homeDistance));
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
      ? '按参考图重绘 · 蓝顶楼群与校园湖'
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
  const max = zoomed ? 24 : innerWidth < 720 ? 6 : 16;
  for (const b of ranked) {
    const item = b.userData.item,
      el = b.userData.label.element;
    let visible =
      labelsVisible && b.visible && (zoomed || majorNames.includes(item.name) || item === selected);
    if (visible) {
      const p = b.userData.label.getWorldPosition(new THREE.Vector3()).project(camera);
      const x = (p.x * 0.5 + 0.5) * w,
        y = (-p.y * 0.5 + 0.5) * h;
      const width = Math.min(
          240,
          (item.short || item.name).length * (innerWidth < 720 ? 10 : 11) + 20,
        ),
        rect = { x: x - width / 2, y: y - 15, w: width, h: 30 };
      visible =
        p.z < 1 &&
        p.z > -1 &&
        rect.x > 2 &&
        rect.x + rect.w < w - 5 &&
        rect.y > 2 &&
        rect.y + rect.h < h - 4 &&
        count < max;
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
