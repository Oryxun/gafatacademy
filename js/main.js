(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Year
  $("#year").textContent = new Date().getFullYear();

  // Sticky header shadow + back-to-top
  const header = $("#header");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 10);
    toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = $("#menuToggle");
  const nav = $("#nav");
  const closeMenu = () => {
    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", closeMenu));

  // Active nav link on scroll
  const navLinks = $$('.nav a[href^="#"]:not(.btn)');
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // Rotating hero word
  const words = ["Cybersecurity", "Networking", "Cloud Computing", "IT Support", "DevOps"];
  const typed = $("#typed");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typed && !reduced) {
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, i);
      if (deleting) {
        i--;
        if (i < 0) { deleting = false; w = (w + 1) % words.length; i = 0; }
        setTimeout(tick, 45);
      } else {
        i++;
        if (i > words[w].length) { deleting = true; i = words[w].length; setTimeout(tick, 2200); return; }
        setTimeout(tick, 85);
      }
    };
    setTimeout(tick, 2500);
  }

  // Program filters
  const filters = $$(".filter");
  const cards = $$(".course-card");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const f = btn.dataset.filter;
      cards.forEach((c) => c.classList.toggle("hide", f !== "all" && c.dataset.cat !== f));
    })
  );

  // "Request info" links preselect the course in the contact form
  const courseSelect = $("#courseSelect");
  $$("[data-course]").forEach((a) =>
    a.addEventListener("click", () => {
      const name = a.dataset.course;
      const opt = Array.from(courseSelect.options).find((o) => o.text === name);
      if (opt) courseSelect.value = opt.value || opt.text;
    })
  );

  // Animated counters
  const counters = $$(".stat-num");
  const runCounter = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Reveal on scroll
  const revealTargets = $$(".section-head, .course-card, .cert, .feature, .format, .steps li, .corp-card, .faq details, .contact-form, .partner");
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          if (e.target.classList.contains("stat-num")) runCounter(e.target);
          else e.target.classList.add("in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => io.observe(el));
    counters.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in"));
    counters.forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || "")));
  }

  // Contact form: validate, then open the visitor's email client addressed to Info@gafatacademy.com
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      status.className = "form-status err";
      status.textContent = "Please fill in your name and a valid email address.";
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const subject = "Gafat Academy inquiry" + (d.course ? " - " + d.course : "");
    const body =
      "Name: " + d.first + " " + d.last + "\n" +
      "Email: " + d.email + "\n" +
      "Phone: " + (d.phone || "-") + "\n" +
      "Program: " + (d.course || "-") + "\n\n" +
      (d.message || "");
    window.location.href =
      "mailto:Info@gafatacademy.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    status.className = "form-status ok";
    status.textContent = "Thanks! Your email app should open with your message ready to send.";
    form.reset();
  });
  $$("input, select, textarea", form).forEach((f) => f.addEventListener("input", () => f.classList.remove("invalid")));
})();
