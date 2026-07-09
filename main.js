/* ============================================================
   Lee Hyowon Portfolio — interactions
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header state + progress bar ---------- */
  const header = $("#site-header");
  const progress = $("#progress");

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 30);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const menuBtn = $("#menu-btn");
  const nav = $("#site-nav");
  const closeMenu = () => {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  };
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- reveal on scroll (with sibling stagger) ---------- */
  const revealEls = $$(".reveal, .project-card, .mini-card");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el, i) => {
    // small stagger between siblings that enter together
    el.style.setProperty("--d", `${(i % 4) * 0.08}s`);
    io.observe(el);
  });

  /* ---------- active nav link ---------- */
  const sections = ["about", "projects", "activities", "skills", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$("[data-nav]");
  const sectionIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => sectionIO.observe(s));

  /* ---------- hero: mouse-reactive halftone (spot + tone parallax) ---------- */
  const halftone = $(".hero .halftone");
  const tone = $(".hero .ht-tone");
  const hero = $(".hero");

  if (!reduceMotion && hero && halftone && tone && window.matchMedia("(pointer: fine)").matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let lx = 50, ly = 68, clx = 50, cly = 68;
    let raf = null;

    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      clx += (lx - clx) * 0.1;
      cly += (ly - cly) * 0.1;
      tone.style.transform = `translate(${cx}px, ${cy}px)`;
      halftone.style.setProperty("--mx", `${clx}%`);
      halftone.style.setProperty("--my", `${cly}%`);
      if (Math.abs(tx - cx) > 0.1 || Math.abs(lx - clx) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };

    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tx = nx * 30;
      ty = ny * 20;
      lx = ((e.clientX - r.left) / r.width) * 100;
      ly = ((e.clientY - r.top) / r.height) * 100;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  /* ---------- card tilt ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$(".tilt").forEach((card) => {
      let raf = null;
      card.addEventListener("mousemove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            `perspective(1100px) rotateX(${(-ny * 3.2).toFixed(2)}deg) rotateY(${(nx * 3.2).toFixed(2)}deg) translateY(-4px)`;
          raf = null;
        });
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.24}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- stat counters ---------- */
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterIO.unobserve(el);
        const target = parseInt(el.dataset.count, 10);
        if (reduceMotion) { el.textContent = target; return; }
        const t0 = performance.now();
        const dur = 1100;
        const step = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => counterIO.observe(el));

  /* ---------- project modal ---------- */
  const PROJECTS = {
    sonju: {
      num: "P.01",
      title: "손주 (Sonju)",
      tagline: "음성 기반 AI 민원 상담 서비스",
      sections: [
        ["문제", "공공 민원 정보는 온라인에 존재하지만, 담당 부서·절차·필요 서류를 알아내는 과정이 어렵습니다. 사용자는 일상 언어로 문제를 설명하는 반면 행정 시스템은 공식 용어와 부서명 중심으로 구성되어 있어, 특히 어르신이나 디지털 서비스가 낯선 분들에게 큰 탐색 비용이 발생합니다."],
        ["해결", "음성으로 질문하면 음성을 텍스트로 변환하고, 질문의 의도를 분석해 관련 민원 정보를 검색한 뒤, 이해하기 쉬운 자연어로 다음 절차와 담당 기관을 안내합니다. 정확성이 중요한 공공 도메인이므로, 근거 없는 생성이 아닌 검색 기반(retrieval-grounded) 응답 구조를 중심에 두고 설계했습니다."],
        ["기여", "음성 입력 → 질문 처리 → 정보 검색 → AI 응답 생성으로 이어지는 서비스 플로우 설계에 참여했습니다. 민원 질문을 구조화된 요청으로 변환하는 방법과 응답의 신뢰성 확보에 집중했고, 행정 용어를 모르는 사용자도 쓸 수 있는 접근성 중심 경험을 설계했습니다."],
        ["배운 점", "정확성이 중요한 도메인에서는 자연스러운 답변만큼 답변 뒤의 '구조'가 중요하다는 것, 그리고 음성 인터페이스는 접근성을 높이지만 모호하고 불완전한 입력을 다루는 설계가 반드시 필요하다는 것을 배웠습니다."],
      ],
      keywords: ["AI Service", "Voice Interface", "LLM", "RAG", "Backend", "Public Information", "Accessibility"],
    },
    klap: {
      num: "P.02",
      title: "KLAP-cli",
      tagline: "광운대 LMS(KLAS) 사용성을 개선하는 TUI/CLI 도구",
      sections: [
        ["문제", "공지나 과제를 확인하려면 브라우저를 열고, 로그인하고, 과목마다 페이지와 메뉴를 반복해서 이동해야 합니다. 수강 과목이 많을수록 이 과정은 오래 걸리고, 중요한 업데이트를 놓칠 가능성도 커집니다."],
        ["해결", "KLAS 웹 클라이언트의 네트워크 요청·응답 흐름을 분석해 비공식 API 클라이언트를 구현하고, 자주 쓰는 학사 정보 접근 패턴을 터미널 인터페이스로 재구성했습니다. 데이터를 가져오는 것뿐 아니라 정보 표시 방식, 명령어 구조, 세션 만료 시 에러 처리까지 터미널 UX 전체를 설계했습니다."],
        ["기여", "문제 정의부터 KLAS의 반복적인 사용자 흐름 분석, 인증 요청·응답 구조 파악, 비공식 API 클라이언트 구현, CLI/TUI 구조 설계, 세션 관리·응답 파싱·출력 포맷·에러 처리까지 전 과정을 직접 진행했습니다."],
        ["배운 점", "웹 서비스를 이해하려면 보이는 UI 너머의 요청–응답 구조를 분석해야 한다는 것을 배웠습니다. 또한 비공식 API 클라이언트는 원본 서비스가 바뀌면 깨질 수 있으므로, 요청 로직 분리·명확한 에러 처리 등 변화를 고려한 유지보수 가능한 설계가 중요함을 체감했습니다."],
      ],
      keywords: ["TUI", "CLI", "Reverse Engineering", "Unofficial API Client", "HTTP 분석", "Session Auth", "Developer Tool"],
    },
    insite: {
      num: "P.03",
      title: "INSITE",
      tagline: "AI 기반 코딩 학습 어시스턴트",
      sections: [
        ["문제", "초보 개발자는 에러를 만나면 어디서부터 디버깅해야 할지 막막합니다. 그런데 생성형 AI에게 물어보면 완성된 코드를 너무 빨리 받아버려, 문제 해결 능력을 기를 기회 자체를 잃게 됩니다. 기존 플랫폼의 정답/오답 판정만으로는 '왜 안 되는지, 다음에 무엇을 확인해야 하는지'를 배울 수 없습니다."],
        ["해결", "정답을 바로 공개하지 않고 단계별 힌트, 코드 분석, 오류 원인 설명, 디버깅 가이드를 제공해 학습자의 추론 과정을 지원합니다. 힌트는 문제 이해 → 접근 설계 → 구현 힌트 → 디버깅 포인트 → 최종 리뷰의 흐름으로 구조화됩니다."],
        ["기여", "서비스 컨셉과 AI 피드백 플로우 설계에 참여했습니다. 'AI가 생각을 대신하는 게 아니라 안내해야 한다'는 원칙 아래 단계형 힌트 구조를 만들고, 학습자 코드 처리·피드백 생성·학습 기록 저장을 잇는 백엔드–AI 연결 구조를 고민했습니다."],
        ["배운 점", "교육에서의 AI는 편의성과 학습 효과 사이의 섬세한 균형이 핵심임을 배웠습니다. 정보를 너무 많이 주면 사고력이 약해지고, 너무 적게 주면 학습자가 계속 막혀 있게 됩니다. 학습 행동 데이터의 수집·활용 설계 역시 기능 구현만큼 중요하다는 것도 알게 되었습니다."],
      ],
      keywords: ["AI Education", "LLM", "Code Feedback", "EdTech", "Hint System", "Backend"],
    },
    reminiscence: {
      num: "P.04",
      title: "Reminiscence",
      tagline: "치매 환자를 위한 AI 대화형 스마트 케어 액자 · Sowon H.O.P.E Project (진행 중)",
      sections: [
        ["문제", "치매 환자는 복약, 식사, 병원 일정, 가족 관련 기억을 잊기 쉽습니다. 보호자는 늘 곁에 있을 수 없고, 기존 리마인더 앱은 복잡한 메뉴와 터치 조작 때문에 어르신이 사용하기 어렵습니다."],
        ["해결", "어르신에게 익숙한 '디지털 액자' 형태를 선택했습니다. 액자가 가족사진을 보여주며 예정된 방문 일정을 알려주고, 사진 속 인물이 누구인지 물으면 등록된 정보를 바탕으로 답합니다. 사진·음성 대화·AI·보호자 연결 정보를 결합해 실용적인 케어와 정서적 안정을 함께 지원합니다."],
        ["기여", "문제 정의와 서비스 방향 설계에 참여했습니다. 기억 지원·루틴 케어·정서적 대화라는 세 축으로 프로젝트를 구조화하고, 복잡한 조작 없이 일상을 지원하는 사용자 시나리오를 만들었습니다. 현재도 서비스 구조와 AI 인터랙션 콘셉트를 발전시키고 있습니다."],
        ["배운 점", "소셜 임팩트 서비스는 기술 구현 이상의 것을 요구한다는 걸 배웠습니다. 대상 사용자의 신체적·인지적·정서적 조건에서 출발해야 하고, 기능을 더하는 것보다 인지 부담을 줄이고 자연스럽고 익숙한 방식으로 상호작용하는 것이 더 중요했습니다."],
      ],
      keywords: ["AI Care", "Healthcare", "Elderly Care", "Voice Interaction", "Smart Device", "Social Impact"],
    },
    unipang: {
      num: "P.05",
      title: "UNI PANG",
      tagline: "광운대 학생을 위한 맞춤형 복지 정보 · 참여 플랫폼 (아이디어톤)",
      sections: [
        ["문제", "장학금, 상담, 비교과 프로그램 등 유용한 교내 복지가 존재하지만, 정보가 여러 웹사이트·공지·부서·채널에 흩어져 있어 학생들이 놓칩니다. 핵심은 정보의 부재가 아니라 효과적인 '전달'과 '참여 설계'의 부재입니다."],
        ["해결", "학년·전공·관심사·상황 기반의 맞춤 복지 추천에, 짧은 확인 퀘스트·캐릭터 기반 참여·포인트 리워드·지역 상권 바우처를 연결했습니다. 정보를 '보는 것'에서 확인하고, 저장하고, 실제로 '참여하는 것'으로 이어지는 구조입니다."],
        ["기여", "문제 정의, 서비스 구조 설계, 기능 기획, 사용자 플로우 정리를 맡았습니다. 기획 단계에서부터 공지 노출 수, 클릭률, 저장률, 퀘스트 완료율, 신청 전환율 등 서비스 지표를 함께 설계해 데이터로 개선할 수 있는 구조를 만들었습니다."],
        ["배운 점", "좋은 서비스는 더 많은 정보를 주는 것이 아니라, 적절한 정보를 적절한 사용자에게 적절한 순간에 전달해 의미 있는 행동으로 이끄는 것임을 배웠습니다. 참여와 행동 변화에 의존하는 플랫폼일수록 기획 단계의 지표 정의가 중요하다는 것도요."],
      ],
      keywords: ["Service Planning", "Personalization", "Gamification", "Data Metrics", "Campus Service", "UX"],
    },
    freq: {
      num: "W.01",
      title: "한글 · 일본어 빈도 분석",
      tagline: "언어 데이터 기반 입력 효율 분석 프로젝트",
      sections: [
        ["문제", "자판 배열과 입력 방식은 타이핑 속도, 피로도, 사용자 경험에 영향을 주지만, 정작 어떤 글자·조합을 가장 자주 입력하는지는 잘 알려져 있지 않습니다. 한글과 일본어는 문자 체계와 입력 구조가 달라 각각 다른 분석 접근이 필요합니다."],
        ["과정", "텍스트 데이터를 준비해 불필요한 기호를 정제하고, 글자·음절 단위로 분리해 빈도를 계산했습니다. 자주 등장하는 글자와 반복 패턴을 시각화하고, 그 결과를 키보드 배열·입력 방식 개선의 관점에서 해석했습니다."],
        ["배운 점", "의미 있는 데이터 분석에 항상 복잡한 모델이 필요한 것은 아니라는 걸 배웠습니다. 단순한 빈도 데이터라도 타이핑 효율, 사용자 피로도 같은 실제 문제와 연결되면 유용한 인사이트가 됩니다."],
      ],
      keywords: ["Python", "Pandas", "Text Analysis", "Frequency Analysis", "Data Visualization", "UX"],
    },
    library: {
      num: "W.02",
      title: "광운대 도서관 API",
      tagline: "도서관 정보 접근성을 개선하는 API 서버 프로젝트",
      sections: [
        ["문제", "도서관 정보는 학생들에게 유용하지만, 확인할 때마다 웹사이트에 수동으로 접근해야 하고 다른 서비스에서 재사용하기 어렵습니다."],
        ["해결", "도서관 관련 정보를 수집·구조화해 JSON 형식의 API 엔드포인트로 제공했습니다. 다른 클라이언트, 서비스, 자동화 도구에서 필요한 데이터를 쉽게 요청할 수 있는 재사용 가능한 구조를 설계했습니다."],
        ["배운 점", "백엔드 개발은 서버를 만드는 일을 넘어, 정보를 유용하고 안정적인 구조로 조직하는 일이라는 것을 배웠습니다. 일상적인 학교 시스템도 API로 열리면 훨씬 유용해질 수 있습니다."],
      ],
      keywords: ["Backend", "REST API", "JSON", "API Design", "Information Accessibility"],
    },
    automation: {
      num: "W.03",
      title: "초기 자동화 프로젝트",
      tagline: "개발을 시작하게 만든 작은 도구들",
      sections: [
        ["이야기", "본격적인 AI·백엔드 프로젝트를 하기 전, 일상의 반복 작업을 줄이는 작은 도구들을 만들었습니다. 자가진단 자동화, 시간표 알림 도구, 디스코드 봇, 그 외 여러 유틸리티 프로그램들입니다."],
        ["의미", "규모는 작았지만 '실제 불편함을 찾고, 코드로 해결한다'는 저의 개발 접근 방식을 만들어준 프로젝트들입니다. 프로그래밍이 공부 과목이 아니라 일상 문제를 푸는 실용적인 도구라는 걸 알게 됐고, 백엔드·데이터 분석·AI 서비스에 대한 관심의 출발점이 되었습니다."],
      ],
      keywords: ["Automation", "Discord Bot", "Notification", "Utility", "Problem Solving"],
    },
    llmcode: {
      num: "W.04",
      title: "LLM과 인간의 코드 스타일 구분 가능성 탐구",
      tagline: "LLM 생성 코드와 사람 코드의 스타일 차이를 검증한 클러스터링 실험",
      sections: [
        ["가설", "전공동아리 CHIC 5기 겨울방학 ML 스터디를 마친 후, 팀원들과 함께 'LLM이 생성한 코드와 사람이 작성한 코드는 스타일 상 다를 것이다'라는 가설을 직접 검증해보기로 했습니다."],
        ["실험 설계", "LLM 코드는 동일한 문제에 대해 LLM으로 직접 생성하고, 사람 코드는 라이선스를 확인해 GitHub에서 수집했습니다. 이후 변수명 마스킹, 주석 제거 등 전처리를 조합해 조건이 다른 4개의 데이터셋을 구성하고, PyTorch로 코드를 임베딩해 클러스터링을 수행했습니다. 실험 설계, 전처리 계획, 클러스터링 전 과정을 직접 맡았습니다."],
        ["결과", "4개 데이터셋 모두에서 클러스터링 결과가 LLM 코드와 사람 코드로 뚜렷하게 갈라지지 않았습니다. 처음 세운 가설은 틀린 것으로 확인되었고, 적어도 이번 실험 조건에서는 두 코드가 스타일만으로 명확히 구분되지 않는다는 결론을 얻었습니다."],
        ["배운 점", "가설이 틀렸다는 결과도 유의미한 결론이 될 수 있다는 것을 배웠습니다. 전처리 방식에 따라 결과 해석이 달라질 수 있어, 실험 설계 단계에서 비교 조건을 여러 개로 나누어 두는 것이 결론의 신뢰도를 높인다는 것도 체감했습니다."],
      ],
      keywords: ["Clustering", "PyTorch", "Code Embedding", "Unsupervised Learning", "Data Preprocessing", "Experiment Design"],
    },
  };

  const modal = $("#project-modal");
  const modalContent = $("#modal-content");
  let lastFocused = null;

  const openModal = (id) => {
    const p = PROJECTS[id];
    if (!p) return;
    lastFocused = document.activeElement;
    modalContent.innerHTML = `
      <span class="modal-num">${p.num}</span>
      <h3 id="modal-title">${p.title}</h3>
      <p class="modal-tagline">${p.tagline}</p>
      ${p.sections.map(([h, body]) => `
        <div class="modal-section">
          <h4>${h}</h4>
          <p>${body}</p>
        </div>`).join("")}
      <div class="modal-section">
        <h4>Keywords</h4>
        <ul class="chips">${p.keywords.map((k) => `<li>${k}</li>`).join("")}</ul>
      </div>`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  $$("[data-project]").forEach((card) => {
    const id = card.dataset.project;
    card.addEventListener("click", () => openModal(id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(id);
      }
    });
  });
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  /* ---------- copy email ---------- */
  const copyBtn = $("#copy-email");
  if (copyBtn) {
    const original = copyBtn.textContent;
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("leehyowon14@gmail.com");
        copyBtn.textContent = "복사됐어요 ✓";
      } catch {
        copyBtn.textContent = "leehyowon14@gmail.com";
      }
      setTimeout(() => (copyBtn.textContent = original), 2000);
    });
  }

  /* ---------- footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
