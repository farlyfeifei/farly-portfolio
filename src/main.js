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
      date: '2026-07-03',
      link: 'https://github.com/farlyfeifei/stm32-mmwave-radar-demo',
      bullets: ['UART 帧协议 + CRC-16 校验 + 字节流解析器', '轻量最近邻航迹追踪 + 指数平滑', 'PyQt5 实时 2D PPI 可视化上位机', 'JSON 驱动自定义模拟场景']
    },
    {
      name: 'AeroEdu',
      desc: '翼启：浏览器端无人机飞控可视化教学平台。真实四旋翼动力学 + 级联 PID + 中文自然语言场景生成。',
      lang: 'JavaScript',
      date: '2026-07-03',
      link: 'https://github.com/farlyfeifei/AeroEdu',
      bullets: ['Three.js 3D 渲染 + 自研刚体动力学（纯 JS）', '级联 PID（抗积分饱和 + 微分低通 + 悬停前馈）', '中文 NLU 规则解析自动配置场景', '零构建、零运行时依赖，浏览器即开即用']
    }
  ],
  ai: [
    {
      name: 'Bloom',
      desc: '面向大学课程学习的 Agent Harness：上下文准备、流式模型协议适配与多轮对话编排组成运行核心。OpenAI 兼容模型路径支持工具调度和分级授权，记忆与会话可本地持久化。',
      lang: 'JavaScript',
      date: '2026-11-17',
      link: 'https://github.com/farlyfeifei/bloom',
      bullets: ['上下文准备、流式模型适配与多轮 Agent 执行', 'OpenAI 兼容 / Anthropic Messages 协议适配', 'OpenAI 兼容路径上的工具调度与分级权限门控', 'Windows Electron 与 Android WebView 共用界面，通过平台桥接接入本机能力']
    },
    {
      name: '幕僚 Muliáo',
      desc: '本地优先的中文桌面 Agent，Jev 决策门控把模型判断接入工具和后续任务。',
      lang: 'Python',
      date: '2026-09-24',
      link: 'https://github.com/farlyfeifei/muliao',
      bullets: ['权限感知的只读电脑工具', '通知与缓存账本，保留可追踪的运行状态', '并行建设 Ghost Agent 蜂群和语音控制']
    },
    {
      name: 'private-rag-agent',
      desc: '全离线私有多 Agent RAG：把复杂文档问题拆解为并行研究、事实核查与综合回答，数据和推理留在本机。',
      lang: 'Python',
      date: '2026-08-07',
      link: 'https://github.com/farlyfeifei/private-rag-agent',
      bullets: ['PDF / Word / Markdown / Excel / PPT 多格式导入', '混合检索 + RRF 融合 + cross-encoder 重排', 'Decomposer / Researcher / Fact-Checker / Synthesizer 多 Agent 协作', '引用追溯与 groundedness 核查，支持 AMD / ROCm 本地推理']
    },
    {
      name: 'AutoVulnAgent',
      desc: '面向百度 BSRC「Agent+」攻防挑战的自动漏洞发现 Agent，以 ReAct 循环连接观察、工具调用和结果验证。',
      lang: 'Python',
      date: '2026-08-15',
      link: 'https://github.com/farlyfeifei/autovuln-agent',
      bullets: ['覆盖侦察、注入、越权、解码等 13 类工具', '支持 7 类漏洞靶标与离线 mock 靶场', '保留运行轨迹并提供可复现评分流程']
    },
    {
      name: '星码奇航',
      desc: '面向少儿的 Python 交互学习平台，把阅读、预测、运行、调试和创作组织成完整学习循环。',
      lang: 'TypeScript',
      date: '2026-09-04',
      link: 'https://github.com/farlyfeifei/xingmaqihang',
      bullets: ['20 章课程、73 道原创代码题', '浏览器代码实验室：运行观察后再提交验收', '确定性检查与间隔复习，支持自主探索']
    }
  ],
  creative: [
    {
      name: 'Creator City',
      desc: 'AI 创作者的像素城市与线上社区，把个人作品、展厅和 Agent 辩论组织成可漫游的动态主页。',
      lang: 'TypeScript',
      date: '2026-08-10',
      link: 'https://github.com/farlyfeifei/CREATOR-CITY',
      bullets: ['像素城市与个人展厅', '创作者作品主页', '已上线体验：crecity.farly.me']
    },
    {
      name: 'xiaoxiang',
      desc: 'Q 版铅笔小像：上传真人照片，AI 生成彩铅特征移植头像的轻量网页工具。',
      lang: 'TypeScript',
      date: '2026-08-10',
      link: 'https://github.com/farlyfeifei/xiaoxiang',
      bullets: ['Next.js App Router + TypeScript + Tailwind CSS v4', 'OpenAI Images API 图像编辑 + sharp 图像处理', '服务端限流 + 隐私校验（EXIF 去除、不进入画廊）', 'Vitest + Playwright 完整测试覆盖']
    },
    {
      name: 'roki-love-letter',
      desc: '情书·Roki：为 Rokid AI 眼镜打造的沉浸式《情书》卡牌智能体，支持 2-4 人对局、AI 对手、语音唤醒与触控板交互。',
      lang: 'Ink',
      date: '2026-08-26',
      link: 'https://github.com/farlyfeifei/roki-love-letter',
      bullets: ['480×380 眼镜优先交互设计', '完整 21 张牌规则引擎 + AI 宫廷对手', '语音唤醒 + 触控板 + 头控多模态输入', '一键打包 .aix 部署至灵珠平台']
    }
  ],
  forks: [
    {
      name: 'point-game',
      desc: 'Constellation Run：星座连线浏览器小游戏，当前仓库在 GitHub 上标记为 fork。',
      lang: 'HTML',
      date: '2026-07-03',
      link: 'https://github.com/farlyfeifei/point-game',
      fork: true
    },
    {
      name: 'ohmyzsh',
      desc: 'Forked from ohmyzsh/ohmyzsh：社区驱动的 zsh 配置框架。',
      lang: 'Shell',
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
          <span class="gh-card-lang"><span class="gh-lang-dot" aria-hidden="true"></span>${item.lang}</span>
          <span class="gh-card-date">${item.date}</span>
        </div>
      </a>
    `;
  };

  const makeCompact = (item) => `
    <a class="gh-compact" href="${item.link}" target="_blank" rel="noopener">
      <div class="gh-compact-name">${item.name}</div>
      <div class="gh-compact-meta">
        <span class="gh-card-lang"><span class="gh-lang-dot" aria-hidden="true"></span>${item.lang}</span>
        <span>fork</span>
      </div>
    </a>
  `;

  const elFeatured = document.getElementById('ghFeatured');
  const elAI = document.getElementById('ghAI');
  const elCreative = document.getElementById('ghCreative');
  const elForks = document.getElementById('ghForks');

  if (elFeatured) elFeatured.innerHTML = githubData.featured.map(makeCard).join('');
  if (elAI) elAI.innerHTML = githubData.ai.map(makeCard).join('');
  if (elCreative) elCreative.innerHTML = githubData.creative.map(makeCard).join('');
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
