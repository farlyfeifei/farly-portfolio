import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ACCENT = 0x63d7e8;
const INK = 0xd8e7eb;
const METAL = 0x17232a;

const clamp01 = value => Math.min(1, Math.max(0, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const smoothstep = (from, to, value) => {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

function createSeededRandom(seed = 9417) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function rememberOpacity(material, opacity) {
  material.transparent = true;
  material.opacity = opacity;
  material.userData.baseOpacity = opacity;
  return material;
}

function setGroupOpacity(materials, amount) {
  materials.forEach(material => {
    material.opacity = material.userData.baseOpacity * amount;
  });
}

function createRadar() {
  const group = new THREE.Group();
  const materials = [];

  const plateMaterial = rememberOpacity(new THREE.MeshBasicMaterial({
    color: 0x071015,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), 0.64);
  materials.push(plateMaterial);
  const plate = new THREE.Mesh(new THREE.CircleGeometry(2.42, 96), plateMaterial);
  plate.position.z = -0.035;
  group.add(plate);

  const ringMaterial = rememberOpacity(new THREE.MeshBasicMaterial({
    color: ACCENT,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), 0.32);
  materials.push(ringMaterial);
  [0.62, 1.2, 1.8, 2.4].forEach(radius => {
    group.add(new THREE.Mesh(new THREE.RingGeometry(radius - 0.008, radius + 0.008, 96), ringMaterial));
  });

  const axisMaterial = rememberOpacity(new THREE.LineBasicMaterial({
    color: ACCENT,
    depthWrite: false,
  }), 0.22);
  materials.push(axisMaterial);
  const axisPositions = [];
  for (let i = 0; i < 4; i += 1) {
    const angle = (Math.PI / 4) * i;
    const x = Math.cos(angle) * 2.4;
    const y = Math.sin(angle) * 2.4;
    axisPositions.push(-x, -y, 0, x, y, 0);
  }
  const axisGeometry = new THREE.BufferGeometry();
  axisGeometry.setAttribute('position', new THREE.Float32BufferAttribute(axisPositions, 3));
  group.add(new THREE.LineSegments(axisGeometry, axisMaterial));

  const tickMaterial = rememberOpacity(new THREE.LineBasicMaterial({
    color: INK,
    depthWrite: false,
  }), 0.24);
  materials.push(tickMaterial);
  const tickPositions = [];
  for (let i = 0; i < 36; i += 1) {
    const angle = (Math.PI * 2 * i) / 36;
    const inner = i % 3 === 0 ? 2.25 : 2.32;
    tickPositions.push(
      Math.cos(angle) * inner,
      Math.sin(angle) * inner,
      0.01,
      Math.cos(angle) * 2.4,
      Math.sin(angle) * 2.4,
      0.01,
    );
  }
  const tickGeometry = new THREE.BufferGeometry();
  tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tickPositions, 3));
  group.add(new THREE.LineSegments(tickGeometry, tickMaterial));

  const sweepMaterial = rememberOpacity(new THREE.MeshBasicMaterial({
    color: ACCENT,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), 0.12);
  materials.push(sweepMaterial);
  const sweep = new THREE.Mesh(new THREE.CircleGeometry(2.36, 40, 0, Math.PI * 0.2), sweepMaterial);
  sweep.position.z = 0.025;
  group.add(sweep);

  const trackMaterial = rememberOpacity(new THREE.LineBasicMaterial({
    color: INK,
    depthWrite: false,
  }), 0.55);
  materials.push(trackMaterial);
  const trackPoints = [
    new THREE.Vector3(-1.55, -0.78, 0.06),
    new THREE.Vector3(-0.88, -0.34, 0.06),
    new THREE.Vector3(-0.2, 0.1, 0.06),
    new THREE.Vector3(0.62, 0.48, 0.06),
    new THREE.Vector3(1.38, 0.88, 0.06),
  ];
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(trackPoints), trackMaterial));

  const blipMaterial = rememberOpacity(new THREE.MeshBasicMaterial({ color: INK }), 0.95);
  materials.push(blipMaterial);
  const blips = trackPoints.map((point, index) => {
    const blip = new THREE.Mesh(new THREE.SphereGeometry(index === trackPoints.length - 1 ? 0.075 : 0.045, 12, 12), blipMaterial);
    blip.position.copy(point);
    group.add(blip);
    return blip;
  });

  group.rotation.set(-0.18, 0.08, -0.12);
  return { group, sweep, blips, materials };
}

function createDrone() {
  const group = new THREE.Group();
  const rotors = [];

  const bodyMaterial = rememberOpacity(new THREE.MeshStandardMaterial({
    color: METAL,
    roughness: 0.4,
    metalness: 0.72,
  }), 1);
  const edgeMaterial = rememberOpacity(new THREE.MeshStandardMaterial({
    color: 0x6f858e,
    roughness: 0.5,
    metalness: 0.48,
  }), 0.88);
  const sensorMaterial = rememberOpacity(new THREE.MeshStandardMaterial({
    color: ACCENT,
    emissive: 0x17454c,
    emissiveIntensity: 0.65,
    roughness: 0.3,
    metalness: 0.32,
  }), 1);
  const rotorMaterial = rememberOpacity(new THREE.MeshStandardMaterial({
    color: INK,
    roughness: 0.5,
    metalness: 0.42,
    side: THREE.DoubleSide,
  }), 0.48);
  const materials = [bodyMaterial, edgeMaterial, sensorMaterial, rotorMaterial];

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.28, 0.58), bodyMaterial);
  body.castShadow = true;
  group.add(body);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.22), edgeMaterial);
  nose.position.set(0, -0.02, -0.4);
  nose.castShadow = true;
  group.add(nose);

  const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.12, 20), sensorMaterial);
  sensor.position.set(0, 0.2, -0.06);
  sensor.castShadow = true;
  group.add(sensor);

  const armGeometry = new THREE.BoxGeometry(1.85, 0.065, 0.09);
  [-Math.PI / 4, Math.PI / 4].forEach(rotation => {
    const arm = new THREE.Mesh(armGeometry, edgeMaterial);
    arm.rotation.y = rotation;
    arm.castShadow = true;
    group.add(arm);
  });

  const motorPositions = [
    [0.66, 0.08, -0.66],
    [-0.66, 0.08, -0.66],
    [0.66, 0.08, 0.66],
    [-0.66, 0.08, 0.66],
  ];
  motorPositions.forEach(([x, y, z]) => {
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.16, 18), bodyMaterial);
    motor.position.set(x, y, z);
    motor.castShadow = true;
    group.add(motor);

    const rotor = new THREE.Group();
    rotor.position.set(x, y + 0.13, z);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.014, 8, 44), rotorMaterial);
    ring.rotation.x = Math.PI / 2;
    rotor.add(ring);
    const bladeA = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.012, 0.055), rotorMaterial);
    const bladeB = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.58), rotorMaterial);
    rotor.add(bladeA, bladeB);
    group.add(rotor);
    rotors.push(rotor);
  });

  const skidGeometry = new THREE.CylinderGeometry(0.016, 0.016, 0.54, 8);
  [-0.23, 0.23].forEach(x => {
    const skid = new THREE.Mesh(skidGeometry, edgeMaterial);
    skid.rotation.z = Math.PI / 2;
    skid.position.set(x, -0.24, 0.02);
    group.add(skid);
  });

  group.rotation.set(0.12, -0.62, -0.04);
  return { group, rotors, materials };
}

function createMorphCloud(count) {
  const random = createSeededRandom();
  const start = new Float32Array(count * 3);
  const end = new Float32Array(count * 3);
  const phase = new Float32Array(count);

  const motors = [
    [0.66, 0.1, -0.66],
    [-0.66, 0.1, -0.66],
    [0.66, 0.1, 0.66],
    [-0.66, 0.1, 0.66],
  ];

  for (let i = 0; i < count; i += 1) {
    const ring = 0.35 + Math.floor(random() * 5) * 0.42 + random() * 0.12;
    const angle = random() * Math.PI * 2;
    start[i * 3] = Math.cos(angle) * ring;
    start[i * 3 + 1] = Math.sin(angle) * ring;
    start[i * 3 + 2] = (random() - 0.5) * 0.05;

    const component = random();
    if (component < 0.28) {
      end[i * 3] = (random() - 0.5) * 0.72;
      end[i * 3 + 1] = (random() - 0.5) * 0.28;
      end[i * 3 + 2] = (random() - 0.5) * 0.58;
    } else if (component < 0.62) {
      const diagonal = random() > 0.5 ? 1 : -1;
      const distance = (random() - 0.5) * 1.75;
      end[i * 3] = distance;
      end[i * 3 + 1] = (random() - 0.5) * 0.08;
      end[i * 3 + 2] = distance * diagonal;
    } else {
      const motor = motors[Math.floor(random() * motors.length)];
      const rotorAngle = random() * Math.PI * 2;
      const rotorRadius = 0.12 + random() * 0.2;
      end[i * 3] = motor[0] + Math.cos(rotorAngle) * rotorRadius;
      end[i * 3 + 1] = motor[1] + 0.13 + (random() - 0.5) * 0.025;
      end[i * 3 + 2] = motor[2] + Math.sin(rotorAngle) * rotorRadius;
    }
    phase[i] = random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(start.slice(), 3));
  const material = rememberOpacity(new THREE.PointsMaterial({
    color: ACCENT,
    size: count < 700 ? 0.045 : 0.032,
    sizeAttenuation: true,
    depthWrite: false,
  }), 0.82);

  return {
    points: new THREE.Points(geometry, material),
    positions: geometry.attributes.position.array,
    start,
    end,
    phase,
    material,
    count,
  };
}

function createFlightTrail() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.8, -0.8, -0.7),
    new THREE.Vector3(-1.7, -0.42, -0.35),
    new THREE.Vector3(-0.65, -0.08, -0.08),
    new THREE.Vector3(0.1, 0.1, 0.05),
    new THREE.Vector3(1.25, 0.48, -0.18),
  ]);
  const material = rememberOpacity(new THREE.LineBasicMaterial({
    color: ACCENT,
    depthWrite: false,
  }), 0.46);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(90)), material);
  return { line, material };
}

export function initFlightStory({ reducedMotion = false } = {}) {
  const story = document.getElementById('hero');
  const stage = document.getElementById('flightStage');
  const canvas = document.getElementById('flightCanvas');
  if (!story || !stage || !canvas) return () => {};

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !window.matchMedia('(pointer: coarse)').matches,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    story.classList.add('scene-ready', 'scene-fallback');
    return () => {};
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06090c, 0.055);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  const world = new THREE.Group();
  scene.add(world);

  scene.add(new THREE.HemisphereLight(0xc8f7ff, 0x081014, 1.15));
  const keyLight = new THREE.DirectionalLight(0xd8f8ff, 2.8);
  keyLight.position.set(4, 5, 6);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(ACCENT, 14, 16, 2);
  rimLight.position.set(-3, 1.4, 2.5);
  scene.add(rimLight);

  const radar = createRadar();
  const drone = createDrone();
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const cloud = createMorphCloud(coarsePointer ? 560 : 1120);
  const trail = createFlightTrail();
  world.add(radar.group, cloud.points, drone.group, trail.line);

  const beatElements = [...stage.querySelectorAll('[data-beat]')];
  const intro = stage.querySelector('.hero-content');
  const introAction = intro?.querySelector('a');
  const beatPanel = stage.querySelector('.story-beats');
  let currentBeat = -1;
  let introHidden = false;

  function setBeat(index) {
    if (index === currentBeat) return;
    currentBeat = index;
    beatElements.forEach((element, beatIndex) => {
      const active = beatIndex === index;
      element.classList.toggle('active', active);
      element.setAttribute('aria-hidden', String(!active));
    });
  }

  function updateIntroState(progress) {
    const shouldHide = progress > 0.3;
    if (shouldHide === introHidden) return;
    introHidden = shouldHide;
    intro?.classList.toggle('is-hidden', shouldHide);
    if (introAction) introAction.tabIndex = shouldHide ? -1 : 0;
  }

  function updateCloud(morph, time) {
    const swirl = Math.sin(Math.PI * morph) * 0.22;
    for (let i = 0; i < cloud.count; i += 1) {
      const offset = i * 3;
      const phase = cloud.phase[i] + time * 0.25;
      cloud.positions[offset] = lerp(cloud.start[offset], cloud.end[offset], morph) + Math.cos(phase) * swirl;
      cloud.positions[offset + 1] = lerp(cloud.start[offset + 1], cloud.end[offset + 1], morph) + Math.sin(phase * 1.17) * swirl;
      cloud.positions[offset + 2] = lerp(cloud.start[offset + 2], cloud.end[offset + 2], morph) + Math.sin(phase) * swirl * 0.55;
    }
    cloud.points.geometry.attributes.position.needsUpdate = true;
  }

  function updateScene(progress, time) {
    const radarExit = smoothstep(0.34, 0.62, progress);
    const morph = smoothstep(0.3, 0.69, progress);
    const solid = smoothstep(0.57, 0.76, progress);
    const flight = smoothstep(0.73, 1, progress);

    radar.sweep.rotation.z = time * 0.55 + progress * Math.PI * 1.6;
    radar.group.rotation.x = lerp(-0.18, -1.02, radarExit);
    radar.group.rotation.z = lerp(-0.12, 0.08, radarExit);
    radar.group.scale.setScalar(lerp(1, 0.78, radarExit));
    radar.group.position.y = lerp(0, -0.24, radarExit);
    setGroupOpacity(radar.materials, 1 - radarExit);
    radar.blips.forEach((blip, index) => {
      const pulse = 1 + Math.sin(time * 2.3 + index) * 0.18;
      blip.scale.setScalar(pulse);
    });

    updateCloud(morph, time);
    cloud.points.rotation.set(
      lerp(-0.18, 0.12, morph),
      lerp(0.08, -0.62, morph),
      lerp(-0.12, -0.04, morph),
    );
    cloud.material.opacity = cloud.material.userData.baseOpacity * (1 - smoothstep(0.66, 0.82, progress));

    drone.group.visible = progress > 0.48 || reducedMotion;
    setGroupOpacity(drone.materials, solid);
    drone.group.scale.setScalar(lerp(0.84, 1.05, solid));
    drone.group.position.set(
      lerp(0, 1.25, flight),
      lerp(0, 0.55, flight),
      lerp(0, -0.35, flight),
    );
    drone.group.rotation.x = lerp(0.12, 0.02, flight);
    drone.group.rotation.y = lerp(-0.62, -1.02, flight);
    drone.group.rotation.z = lerp(-0.04, -0.14, flight);
    drone.rotors.forEach((rotor, index) => {
      rotor.rotation.y = time * (index % 2 === 0 ? 8 : -8) * (0.25 + solid * 0.75);
    });

    trail.material.opacity = trail.material.userData.baseOpacity * smoothstep(0.73, 0.9, progress);
    trail.line.scale.x = lerp(0.08, 1, flight);

    camera.position.z = lerp(8.2, 7.25, smoothstep(0.52, 1, progress));
    camera.position.y = lerp(0.12, 0.4, flight);
    camera.lookAt(world.position.x + flight * 0.26, world.position.y + flight * 0.18, 0);

    if (progress < 0.24) setBeat(0);
    else if (progress < 0.48) setBeat(1);
    else if (progress < 0.74) setBeat(2);
    else setBeat(3);

    if (!reducedMotion) updateIntroState(progress);
    if (beatPanel) beatPanel.style.opacity = reducedMotion ? '0' : String(smoothstep(0.12, 0.25, progress));
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const mobile = rect.width < 720;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.35 : 1.8));
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.fov = mobile ? 49 : 40;
    camera.updateProjectionMatrix();
    world.position.set(mobile ? 0 : 1.72, mobile ? -0.62 : -0.02, 0);
    world.scale.setScalar(mobile ? 0.84 : 1);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  let targetProgress = reducedMotion ? 0.78 : 0;
  let renderedProgress = targetProgress;
  let frameId = 0;
  let storyVisible = true;
  const visibilityObserver = new IntersectionObserver(entries => {
    storyVisible = entries[0]?.isIntersecting ?? true;
  }, { rootMargin: '25% 0px' });
  visibilityObserver.observe(story);

  let scrollTrigger;
  if (!reducedMotion) {
    scrollTrigger = ScrollTrigger.create({
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: self => {
        targetProgress = self.progress;
      },
    });
  }

  function render(timeMs = 0) {
    if (storyVisible && document.visibilityState === 'visible') {
      const time = timeMs * 0.001;
      renderedProgress += (targetProgress - renderedProgress) * 0.095;
      updateScene(renderedProgress, time);
      renderer.render(scene, camera);
    }
    if (!reducedMotion) frameId = requestAnimationFrame(render);
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    story.classList.add('scene-fallback');
  }, { once: true });

  updateScene(targetProgress, 0);
  renderer.render(scene, camera);
  story.classList.add('scene-ready');
  if (!reducedMotion) frameId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(frameId);
    scrollTrigger?.kill();
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    renderer.dispose();
  };
}
