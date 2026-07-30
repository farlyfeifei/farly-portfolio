/* =========================================
   farly.me — Main Script
   Canvas signals, parallax, 3D tilt, reveals
   ========================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Hero Canvas: Signal Network ---- */
const canvas = document.getElementById('heroCanvas');
let ctx, width, height, nodes = [], animationId;

function initCanvas() {
  if (!canvas || prefersReducedMotion) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  createNodes();
  animateCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); createNodes(); });
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createNodes() {
  const count = width < 640 ? 30 : 70;
  nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
      color: pickColor(),
      pulse: Math.random() < 0.15
    });
  }
}

function pickColor() {
  const r = Math.random();
  if (r < 0.55) return 'rgba(0,229,255,';
  if (r < 0.8) return 'rgba(163,230,53,';
  return 'rgba(251,146,60,';
}

let scanAngle = 0;

function animateCanvas() {
  ctx.clearRect(0, 0, width, height);

  // Draw faint perspective grid
  drawGrid();

  // Update & draw connections
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    a.x += a.vx; a.y += a.vy;
    if (a.x < 0 || a.x > width) a.vx *= -1;
    if (a.y < 0 || a.y > height) a.vy *= -1;

    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const alpha = (1 - dist / 140) * 0.18;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  const t = performance.now() * 0.001;
  nodes.forEach(n => {
    const pulse = n.pulse ? 1 + Math.sin(t * 2 + n.phase) * 0.35 : 1;
    const alpha = n.pulse ? 0.5 + Math.sin(t * 2 + n.phase) * 0.25 : 0.35;
    const r = n.r * pulse;

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = n.color + alpha + ')';
    ctx.fill();

    if (n.pulse) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = n.color + (alpha * 0.08) + ')';
      ctx.fill();
    }
  });

  // Radar sweep line
  if (width >= 640) {
    scanAngle += 0.008;
    const cx = width * 0.7, cy = height * 0.5, len = Math.max(width, height) * 0.8;
    const x2 = cx + Math.cos(scanAngle) * len;
    const y2 = cy + Math.sin(scanAngle) * len;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(0,229,255,0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Radar arc glow
    ctx.beginPath();
    ctx.arc(cx, cy, 80, scanAngle - 0.4, scanAngle + 0.05);
    ctx.strokeStyle = 'rgba(0,229,255,0.06)';
    ctx.lineWidth = 60;
    ctx.stroke();
  }

  animationId = requestAnimationFrame(animateCanvas);
}

function drawGrid() {
  const spacing = 60;
  ctx.strokeStyle = 'rgba(0,229,255,0.025)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < width; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
  }
  for (let y = 0; y < height; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }
}

/* ---- Mouse Parallax on Hero ---- */
const heroContent = document.querySelector('.hero-content');
let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

function initParallax() {
  if (prefersReducedMotion || !heroContent) return;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth - 0.5) * -12;
    targetY = (e.clientY / window.innerHeight - 0.5) * -8;
  });
  function updateParallax() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    heroContent.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(updateParallax);
  }
  updateParallax();
}

/* ---- Scroll Reveal ---- */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ---- 3D Card Tilt + Spotlight ---- */
function initCardTilt() {
  if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.work-card-inner, .gh-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      card.style.setProperty('--mouse-x', px + '%');
      card.style.setProperty('--mouse-y', py + '%');

      const rx = (y / rect.height - 0.5) * -6;
      const ry = (x / rect.width - 0.5) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });
}

/* ---- Mobile Nav ---- */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---- GitHub Data Injection ---- */
const githubData = {
  featured: [
    {
      name: 'stm32-mmwave-radar-demo',
      desc: 'STM32 mmWave radar 目标检测演示：包含可移植的 C 嵌入式追踪核心与 Python 上位机仿真器。',
      lang: 'Python',
      langColor: '#3572A5',
      date: '2026-07-03',
      link: 'https://github.com/farlyfeifei/stm32-mmwave-radar-demo',
      bullets: ['UART 帧协议 + CRC-16 校验 + 字节流解析器', '轻量最近邻航迹追踪 + 指数平滑', 'PyQt5 实时 2D PPI 可视化上位机', 'JSON 驱动自定义模拟场景']
    },
    {
      name: 'AeroEdu',
      desc: '翼启 — 浏览器端无人机飞控可视化教学平台。真实四旋翼动力学 + 级联 PID + 中文自然语言场景生成。',
      lang: 'JavaScript',
      langColor: '#f1e05a',
      date: '2026-07-03',
      link: 'https://github.com/farlyfeifei/AeroEdu',
      bullets: ['Three.js 3D 渲染 + 自研刚体动力学（纯 JS）', '级联 PID（抗积分饱和 + 微分低通 + 悬停前馈）', '中文 NLU 规则解析自动配置场景', '零构建、零运行时依赖，浏览器即开即用']
    }
  ],
  ai: [
    {
      name: 'xiaoxiang',
      desc: 'Q 版铅笔小像 — 上传真人照片，AI 生成彩铅特征移植头像的轻量网页工具。',
      lang: 'TypeScript',
      langColor: '#3178c6',
      date: '2026-07-30',
      link: 'https://github.com/farlyfeifei/xiaoxiang',
      bullets: ['Next.js App Router + TypeScript + Tailwind CSS v4', 'OpenAI Images API 图像编辑 + sharp 图像处理', '服务端限流 + 隐私校验（EXIF 去除、不进入画廊）', 'Vitest + Playwright 完整测试覆盖']
    },
    {
      name: 'roki-love-letter',
      desc: '情书·Roki — 为 Rokid AI 眼镜打造的沉浸式《情书》卡牌智能体，支持 2–4 人对局、AI 对手、语音唤醒与触控板交互。',
      lang: 'Ink',
      langColor: '#f5f5f5',
      date: '2026-07-17',
      link: 'https://github.com/farlyfeifei/roki-love-letter',
      bullets: ['480×380 眼镜优先交互设计', '完整 21 张牌规则引擎 + AI 宫廷对手', '语音唤醒 + 触控板 + 头控多模态输入', '一键打包 .aix 部署至灵珠平台']
    }
  ],
  exp: [
    {
      name: 'point-game',
      desc: 'Constellation Run — 星座连线浏览器小游戏。按真实星座顺序连接编号星点，从仙后座到射手座，把星图重新拼回心跳。',
      lang: 'HTML',
      langColor: '#e34c26',
      date: '2026-07-03',
      link: 'https://github.com/farlyfeifei/point-game',
      bullets: ['单文件零依赖（55KB），浏览器双击即运行', 'Canvas 2D 全屏渲染 + DPR 自适应', '真实天文星座数据驱动关卡', '键盘/鼠标/触屏三套输入 + 防误触']
    }
  ],
  forks: [
    {
      name: 'ohmyzsh',
      desc: 'Forked from ohmyzsh/ohmyzsh — 社区驱动的 zsh 配置框架。',
      lang: 'Shell',
      langColor: '#89e051',
      date: '2026-07-19',
      link: 'https://github.com/farlyfeifei/ohmyzsh',
      fork: true
    }
  ]
};

function renderGitHubCards() {
  const makeCard = (item) => {
    const bullets = item.bullets ? `<ul class="gh-card-bullets">${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '';
    const forkBadge = item.fork ? '<span class="gh-card-fork">fork</span>' : '';
    return `
      <a class="gh-card" href="${item.link}" target="_blank" rel="noopener" data-tilt>
        <div class="gh-card-header">
          <div class="gh-card-name">
            ${item.name}
            ${forkBadge}
          </div>
        </div>
        <p class="gh-card-desc">${item.desc}</p>
        ${bullets}
        <div class="gh-card-meta">
          <span class="gh-card-lang"><span class="gh-lang-dot" style="background:${item.langColor}"></span>${item.lang}</span>
          <span class="gh-card-date">${item.date}</span>
        </div>
      </a>
    `;
  };

  const makeCompact = (item) => `
    <a class="gh-compact" href="${item.link}" target="_blank" rel="noopener">
      <div class="gh-compact-name">${item.name}</div>
      <div class="gh-compact-meta">
        <span class="gh-card-lang"><span class="gh-lang-dot" style="background:${item.langColor}"></span>${item.lang}</span>
        <span>fork</span>
      </div>
    </a>
  `;

  const elFeatured = document.getElementById('ghFeatured');
  const elAI = document.getElementById('ghAI');
  const elExp = document.getElementById('ghExp');
  const elForks = document.getElementById('ghForks');

  if (elFeatured) elFeatured.innerHTML = githubData.featured.map(makeCard).join('');
  if (elAI) elAI.innerHTML = githubData.ai.map(makeCard).join('');
  if (elExp) elExp.innerHTML = githubData.exp.map(makeCard).join('');
  if (elForks) elForks.innerHTML = githubData.forks.map(makeCompact).join('');
}

/* ---- Init ---- */
function init() {
  initCanvas();
  initParallax();
  initReveal();
  initCardTilt();
  initNav();
  renderGitHubCards();

  // Re-init tilt after cards are rendered
  setTimeout(() => initCardTilt(), 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
