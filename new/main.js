/* ============================================================
   Lee Hyowon Portfolio — navigation and chapter interactions
   ============================================================ */
(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const header = $("#site-header");
  const progress = $("#progress");
  const menuButton = $("#menu-btn");
  const navigation = $("#site-nav");

  const updatePageChrome = () => {
    const scrollTop = window.scrollY;
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle("scrolled", scrollTop > 30);
    if (progress) {
      progress.style.width = `${maximum > 0 ? (scrollTop / maximum) * 100 : 0}%`;
    }
  };

  window.addEventListener("scroll", updatePageChrome, { passive: true });
  updatePageChrome();

  if (menuButton && navigation) {
    const setMenu = (open) => {
      navigation.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      menuButton.textContent = open ? "CLOSE" : "MENU";
    };

    menuButton.addEventListener("click", () => {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });
    $$("a", navigation).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  const navLinks = $$("[data-nav]");

  const updateNavigation = (activeHref) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === activeHref);
    });
  };

  const navSections = $$('[data-nav-section]');
  let navigationSyncFrame = 0;

  const syncNavigationToViewport = () => {
    navigationSyncFrame = 0;
    const focusLine = window.innerHeight * 0.5;
    const activeSection = navSections.find((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= focusLine && bounds.bottom > focusLine;
    });
    updateNavigation(activeSection?.dataset.navSection || "");
  };

  const scheduleNavigationSync = () => {
    if (navigationSyncFrame) return;
    navigationSyncFrame = window.requestAnimationFrame(syncNavigationToViewport);
  };

  window.addEventListener('scroll', scheduleNavigationSync, { passive: true });
  window.addEventListener('resize', scheduleNavigationSync, { passive: true });
  syncNavigationToViewport();

  const experience = $("[data-experience]");
  if (experience) {
    const experienceSteps = $$('[data-experience-step]', experience);
    const experiencePoints = $$('[data-experience-point]', experience);
    const experienceDetail = $('[data-experience-detail]', experience);
    const experienceOrganization = $('[data-experience-organization]', experience);
    const experienceRole = $('[data-experience-role]', experience);
    const experienceStatus = $('[data-experience-status]', experience);
    const experienceDescription = $('[data-experience-description]', experience);
    const experienceCount = $('[data-experience-count]', experience);
    let activeExperience = 0;
    let experienceSwapTimer = 0;

    const experienceData = experienceSteps.map((step) => {
      const copy = $('.experience-step-copy', step);
      return {
        organization: $('p', copy)?.textContent.trim() || "",
        role: $('h3', copy)?.textContent.trim() || "",
        status: $('span', copy)?.textContent.trim() || "",
        description: $$('p', copy)[1]?.textContent.trim() || "",
      };
    });

    const updateExperience = (index, animate = true) => {
      const next = experienceData[index];
      if (!next) return;
      activeExperience = index;
      const pointGap = Math.min(135, Math.max(100, window.innerHeight * 0.13));

      experiencePoints.forEach((point, pointIndex) => {
        point.classList.toggle('is-active', pointIndex === index);
        point.style.setProperty('--point-shift', `${(pointIndex - index) * pointGap}px`);
      });

      window.clearTimeout(experienceSwapTimer);
      if (animate) experienceDetail?.classList.add('is-changing');
      experienceSwapTimer = window.setTimeout(() => {
        if (experienceOrganization) experienceOrganization.textContent = next.organization;
        if (experienceRole) experienceRole.textContent = next.role;
        if (experienceDescription) experienceDescription.textContent = next.description;
        if (experienceStatus) {
          experienceStatus.textContent = next.status;
          experienceStatus.hidden = !next.status;
        }
        if (experienceCount) experienceCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(experienceData.length).padStart(2, '0')}`;
        experienceDetail?.classList.remove('is-changing');
      }, animate ? 130 : 0);

      experience.dataset.activeExperience = String(index);
    };

    const experienceObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) updateExperience(Number(entry.target.dataset.experienceStep));
        });
      },
      { rootMargin: '-46% 0px -46% 0px', threshold: 0 }
    );

    experienceSteps.forEach((step) => experienceObserver.observe(step));
    window.addEventListener('resize', () => updateExperience(activeExperience, false), { passive: true });
    updateExperience(0, false);
  }

  $$("[data-indexed-chapter]").forEach((chapter) => {
    const chapterLinks = $$("[data-chapter-link]", chapter);
    const chapterPanels = $$("[data-chapter-panel]", chapter);
    const updateChapter = (index) => {
      chapterLinks.forEach((link) => {
        const active = link.dataset.chapterLink === index;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      document.documentElement.dataset.activeChapter = chapter.id;
      document.documentElement.dataset.activeProject = index;
    };

    const panelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          updateChapter(entry.target.dataset.chapterPanel);
        });
      },
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 }
    );
    chapterPanels.forEach((panel) => panelObserver.observe(panel));
  });

  const snapTargets = [
    $("#top"),
    ...$$('[data-snap-panel], [data-chapter-panel]'),
    $("#contact"),
  ].filter(Boolean);
  const timedSnapQuery = window.matchMedia("(min-width: 1051px) and (pointer: fine)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let wheelGesture = null;
  let wheelIdleTimer = 0;
  let snapAnimationFrame = 0;
  let lastWheelAt = 0;

  const timedSnapEnabled = () => timedSnapQuery.matches && !reducedMotionQuery.matches;

  const targetTop = (target) => target.getBoundingClientRect().top + window.scrollY;

  const snapPositions = () => snapTargets.map(targetTop);

  const nearestSnapIndex = (positions) => positions.reduce((nearest, position, index) => (
    Math.abs(position - window.scrollY) < Math.abs(positions[nearest] - window.scrollY) ? index : nearest
  ), 0);

  const normalizeWheelDelta = (event) => {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16;
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
    return event.deltaY;
  };

  const isEditableTarget = (target) => (
    target instanceof Element
    && Boolean(target.closest("input, textarea, select, [contenteditable='true']"))
  );

  const isInteractiveTarget = (target) => (
    target instanceof Element
    && Boolean(target.closest("a, button, input, textarea, select, summary, [contenteditable='true']"))
  );

  const stopSnapAnimation = () => {
    if (snapAnimationFrame) window.cancelAnimationFrame(snapAnimationFrame);
    snapAnimationFrame = 0;
  };

  const animateSnap = (destination, duration) => {
    stopSnapAnimation();
    const origin = window.scrollY;
    const distance = destination - origin;
    if (Math.abs(distance) < 1) {
      delete document.documentElement.dataset.pageSnap;
      return;
    }

    const startedAt = performance.now();
    const returning = duration <= 200;
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - ((1 - progress) ** (returning ? 4 : 3));
      window.scrollTo(0, origin + (distance * eased));
      if (progress < 1) snapAnimationFrame = window.requestAnimationFrame(tick);
      else {
        window.scrollTo(0, destination);
        snapAnimationFrame = 0;
        delete document.documentElement.dataset.pageSnap;
      }
    };
    snapAnimationFrame = window.requestAnimationFrame(tick);
  };

  const targetCanContinue = (index, position, direction) => {
    const end = position + snapTargets[index].offsetHeight - window.innerHeight;
    if (end <= position + 2) return false;
    return direction > 0 ? window.scrollY < end - 2 : window.scrollY > position + 2;
  };

  const settleWheelGesture = () => {
    if (!wheelGesture) return;
    const { anchorIndex, delta } = wheelGesture;
    wheelGesture = null;

    const positions = snapPositions();
    const anchor = positions[anchorIndex];
    const displacement = window.scrollY - anchor;
    const direction = Math.sign(delta || displacement);
    if (!direction || targetCanContinue(anchorIndex, anchor, direction)) {
      delete document.documentElement.dataset.pageSnap;
      return;
    }

    const threshold = Math.min(180, window.innerHeight * 0.2);
    const crossedThreshold = Math.abs(displacement) >= threshold || Math.abs(delta) >= threshold;
    const movedDistance = Math.abs(displacement);
    const requestedSteps = crossedThreshold
      ? Math.max(1, Math.round(movedDistance / Math.max(window.innerHeight, 1)))
      : 0;
    const destinationIndex = Math.max(
      0,
      Math.min(anchorIndex + (direction * requestedSteps), snapTargets.length - 1)
    );
    const destination = positions[destinationIndex];
    const movedPanels = Math.abs(destinationIndex - anchorIndex);
    const remainingDistance = Math.abs(destination - window.scrollY);
    const duration = movedPanels > 0
      ? Math.min(560, 360 + (Math.max(movedPanels - 1, 0) * 55))
      : Math.min(200, Math.max(120, remainingDistance * 0.75));
    animateSnap(destination, duration);
  };

  window.addEventListener("wheel", (event) => {
    if (
      !timedSnapEnabled()
      || event.defaultPrevented
      || event.ctrlKey
      || isEditableTarget(event.target)
      || Math.abs(event.deltaY) <= Math.abs(event.deltaX)
    ) return;

    if (snapAnimationFrame) {
      event.preventDefault();
      return;
    }

    const delta = normalizeWheelDelta(event);
    const positions = snapPositions();
    const contactIndex = snapTargets.length - 1;
    const contactTop = positions[contactIndex];
    const contactFree = document.documentElement.dataset.pageSnap === "contact-free";
    if (contactFree) {
      if (delta > 0 || window.scrollY > contactTop + 2) return;
      delete document.documentElement.dataset.pageSnap;
    }

    const anchorIndex = nearestSnapIndex(positions);
    if (anchorIndex === contactIndex && delta > 0) {
      wheelGesture = null;
      window.clearTimeout(wheelIdleTimer);
      document.documentElement.dataset.pageSnap = "contact-free";
      return;
    }

    const now = performance.now();
    const elapsed = lastWheelAt ? Math.max(now - lastWheelAt, 8) : 16;
    lastWheelAt = now;
    const speed = Math.abs(delta) / elapsed;
    if (Math.abs(delta) < 3 || speed < 0.16) return;

    if (!wheelGesture) {
      wheelGesture = { anchorIndex, delta: 0 };
      document.documentElement.dataset.pageSnap = "timed";
    }
    wheelGesture.delta += delta;
    window.clearTimeout(wheelIdleTimer);
    wheelIdleTimer = window.setTimeout(settleWheelGesture, 90);
  }, { passive: false });

  window.addEventListener("scroll", () => {
    if (document.documentElement.dataset.pageSnap !== "contact-free") return;
    const contactTop = targetTop(snapTargets[snapTargets.length - 1]);
    if (window.scrollY < contactTop - 2) delete document.documentElement.dataset.pageSnap;
  }, { passive: true });

  window.addEventListener("keydown", (event) => {
    if (
      !timedSnapEnabled()
      || event.defaultPrevented
      || event.repeat
      || event.metaKey
      || event.ctrlKey
      || event.altKey
      || isInteractiveTarget(event.target)
    ) return;

    const backwards = event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey);
    const forwards = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey);
    const edgeIndex = event.key === "Home" ? 0 : event.key === "End" ? snapTargets.length - 1 : null;
    if (!backwards && !forwards && edgeIndex === null) return;

    const positions = snapPositions();
    const currentIndex = nearestSnapIndex(positions);
    const direction = forwards ? 1 : -1;
    if (edgeIndex === null && currentIndex === snapTargets.length - 1 && direction > 0) return;
    if (edgeIndex === null && targetCanContinue(currentIndex, positions[currentIndex], direction)) return;

    event.preventDefault();
    if (snapAnimationFrame) return;
    const destinationIndex = edgeIndex ?? Math.max(0, Math.min(currentIndex + direction, snapTargets.length - 1));
    document.documentElement.dataset.pageSnap = "timed";
    animateSnap(positions[destinationIndex], 360);
  });

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const href = link.getAttribute("href");
      const target = href && href !== "#" ? $(href) : null;
      if (!target) return;

      event.preventDefault();
      wheelGesture = null;
      window.clearTimeout(wheelIdleTimer);
      stopSnapAnimation();
      document.documentElement.dataset.pageSnap = "timed";

      const destination = targetTop(target);
      const pageDistance = Math.abs(destination - window.scrollY) / Math.max(window.innerHeight, 1);
      const duration = Math.min(620, 320 + (pageDistance * 42));
      animateSnap(destination, duration);
      window.history.pushState(null, "", href);
      if (link.matches("[data-nav]")) updateNavigation(href);
    });
  });

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
