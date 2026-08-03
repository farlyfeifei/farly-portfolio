/* =========================================
   farly.me - Main Script
   3D flight story, card depth, reveals
   ========================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function initFlightExperience() {
  try {
    const { initFlightStory } = await import('./flight-scene.js');
    initFlightStory({ reducedMotion: prefersReducedMotion });
  } catch (error) {
    document.getElementById('hero')?.classList.add('scene-ready', 'scene-fallback');
    console.error('Flight scene failed to initialize.', error);
  }
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
      desc: '翼启：浏览器端无人机飞控可视化教学平台。真实四旋翼动力学 + 级联 PID + 中文自然语言场景生成。',
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
      desc: 'Q 版铅笔小像：上传真人照片，AI 生成彩铅特征移植头像的轻量网页工具。',
      lang: 'TypeScript',
      langColor: '#3178c6',
      date: '2026-07-30',
      link: 'https://github.com/farlyfeifei/xiaoxiang',
      bullets: ['Next.js App Router + TypeScript + Tailwind CSS v4', 'OpenAI Images API 图像编辑 + sharp 图像处理', '服务端限流 + 隐私校验（EXIF 去除、不进入画廊）', 'Vitest + Playwright 完整测试覆盖']
    },
    {
      name: 'roki-love-letter',
      desc: '情书·Roki：为 Rokid AI 眼镜打造的沉浸式《情书》卡牌智能体，支持 2-4 人对局、AI 对手、语音唤醒与触控板交互。',
      lang: 'Ink',
      langColor: '#f5f5f5',
      date: '2026-07-17',
      link: 'https://github.com/farlyfeifei/roki-love-letter',
      bullets: ['480×380 眼镜优先交互设计', '完整 21 张牌规则引擎 + AI 宫廷对手', '语音唤醒 + 触控板 + 头控多模态输入', '一键打包 .aix 部署至灵珠平台']
    }
  ],
  infra: [
    {
      name: 'farly-portfolio',
      desc: 'farly.me 的源代码仓库，包含作品集内容、交互系统和响应式构建配置。',
      lang: 'HTML',
      langColor: '#e34c26',
      date: '2026-07-31',
      link: 'https://github.com/farlyfeifei/farly-portfolio',
      bullets: ['Vite 构建与 GitHub Pages 发布', 'Three.js 实时飞行叙事', '桌面与移动端响应式布局', '减弱动画与 WebGL 降级']
    },
    {
      name: 'farlyfeifei.github.io',
      desc: 'farly.me 的 GitHub Pages 发布仓库，用于托管经过构建验证的线上版本。',
      lang: 'HTML',
      langColor: '#e34c26',
      date: '2026-07-31',
      link: 'https://github.com/farlyfeifei/farlyfeifei.github.io',
      bullets: ['自定义域名 farly.me', '静态资源版本化', 'GitHub Pages 托管']
    }
  ],
  forks: [
    {
      name: 'point-game',
      desc: 'Constellation Run：星座连线浏览器小游戏，当前仓库在 GitHub 上标记为 fork。',
      lang: 'HTML',
      langColor: '#e34c26',
      date: '2026-07-03',
      link: 'https://github.com/farlyfeifei/point-game',
      fork: true
    },
    {
      name: 'ohmyzsh',
      desc: 'Forked from ohmyzsh/ohmyzsh：社区驱动的 zsh 配置框架。',
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
  const elInfra = document.getElementById('ghInfra');
  const elForks = document.getElementById('ghForks');

  if (elFeatured) elFeatured.innerHTML = githubData.featured.map(makeCard).join('');
  if (elAI) elAI.innerHTML = githubData.ai.map(makeCard).join('');
  if (elInfra) elInfra.innerHTML = githubData.infra.map(makeCard).join('');
  if (elForks) elForks.innerHTML = githubData.forks.map(makeCompact).join('');
}

/* ---- Init ---- */
function init() {
  initFlightExperience();
  initReveal();
  initNav();
  renderGitHubCards();
  initCardTilt();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
