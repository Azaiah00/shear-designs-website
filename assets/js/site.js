/* Shear Designs Hair & Beauty Co. - site interactions (vanilla, no dependencies) */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) doc.classList.add("motion");

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ---------- Header state ---------- */
  var hdr = $("[data-hdr]");
  function onHeader() { if (hdr) hdr.classList.toggle("is-scrolled", window.scrollY > 8); }
  onHeader();

  /* ---------- Mobile menu ---------- */
  var btn = $(".menu-btn");
  var panel = $("#mnav");
  function setMenu(open) {
    if (!btn || !panel) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
    panel.hidden = !open;
    document.body.classList.toggle("nav-open", open);
    if (open) { var first = panel.querySelector("a"); if (first) first.focus(); }
  }
  if (btn && panel) {
    btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1000) setMenu(false); });
  }

  /* ---------- "The cut" headlines: split along a diagonal ---------- */
  $$(".cut").forEach(function (el) {
    var html = el.innerHTML;
    var text = el.textContent.replace(/\s+/g, " ").trim();
    el.innerHTML =
      '<span class="sr-only">' + text.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</span>" +
      '<span class="cut__a" aria-hidden="true">' + html + "</span>" +
      '<span class="cut__b" aria-hidden="true">' + html + "</span>" +
      '<span class="cut__line" aria-hidden="true"></span>';
    var r = el.getBoundingClientRect();
    if (r.width) {
      var ang = Math.atan2(-(0.24 * r.height), r.width) * 180 / Math.PI;
      el.style.setProperty("--ang", ang.toFixed(2) + "deg");
      var line = el.querySelector(".cut__line");
      line.style.top = "64%";
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$(".rv, .rv-mask, .cut");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var t = en.target;
          t.classList.add("is-in"); io.unobserve(t);
          if (t.classList.contains("cut")) setTimeout(function () { t.classList.add("is-done"); }, 1500);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Scroll-linked effects (single rAF loop) ---------- */
  var plx = reduce ? [] : $$("[data-speed]");
  var brow = $("[data-brow]");
  var browPaths = brow && !reduce ? $$(".strokes path", brow) : [];
  var browPowder = brow ? $(".powder", brow) : null;
  var browMeter = $("[data-brow-meter]");
  var browSection = brow ? brow.closest("section") : null;
  var clockHands = reduce ? [] : $$("[data-clock-hand]");
  var clock = $("[data-clock]");
  var heal = $("[data-heal]");
  var healItems = heal ? $$("li", heal) : [];
  var ticking = false;
  var lastBrow = -1;

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    onHeader();

    for (var i = 0; i < plx.length; i++) {
      var el = plx[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var speed = parseFloat(el.getAttribute("data-speed")) || 0;
      var off = (r.top + r.height / 2 - vh / 2) * speed;
      el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
    }

    if (browSection && browPaths.length) {
      var br = browSection.getBoundingClientRect();
      var p = clamp((vh * 0.55 - br.top) / (br.height * 0.68), 0, 1);
      if (Math.abs(p - lastBrow) > 0.002) {
        lastBrow = p;
        var n = browPaths.length;
        for (var k = 0; k < n; k++) {
          var local = clamp((p - (k / n) * 0.82) / 0.18, 0, 1);
          browPaths[k].style.strokeDashoffset = (1 - local).toFixed(3);
        }
        if (browPowder) browPowder.style.opacity = clamp((p - 0.35) / 0.55, 0, 1).toFixed(3);
        if (browMeter) browMeter.style.setProperty("--p", p.toFixed(3));
      }
    }

    if (clock && clockHands.length) {
      var cr = clock.getBoundingClientRect();
      if (cr.bottom > 0 && cr.top < vh) {
        var cp = clamp((vh - cr.top) / (vh + cr.height), 0, 1);
        clockHands.forEach(function (h) {
          var base = parseFloat(h.getAttribute("data-base")) || 0;
          var turn = parseFloat(h.getAttribute("data-turn")) || 0;
          h.style.transform = "rotate(" + (base + cp * turn).toFixed(2) + "deg)";
        });
      }
    }

    if (heal && !reduce) {
      var hr = heal.getBoundingClientRect();
      var hp = clamp((vh * 0.8 - hr.top) / (hr.height + vh * 0.2), 0, 1);
      heal.style.setProperty("--hp", hp.toFixed(3));
      var on = Math.round(hp * healItems.length + 0.35);
      healItems.forEach(function (li, idx) { li.classList.toggle("is-on", idx < on); });
    }
  }
  function requestTick() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  if (heal && reduce) { healItems.forEach(function (li) { li.classList.add("is-on"); }); }
  if (browMeter && reduce) browMeter.style.setProperty("--p", "1");
  update();

  /* ---------- Before / after slider with auto-wipe ---------- */
  $$("[data-ba]").forEach(function (ba) {
    var range = $(".ba__range", ba);
    var userTouched = false;
    function setPos(v) {
      ba.style.setProperty("--pos", v + "%");
      range.value = Math.round(v);
      range.setAttribute("aria-valuetext", Math.round(v) + " percent before image shown");
    }
    range.addEventListener("input", function () { userTouched = true; setPos(parseFloat(range.value)); });
    ["pointerdown", "keydown", "touchstart"].forEach(function (evt) {
      range.addEventListener(evt, function () { userTouched = true; }, { passive: true });
    });
    setPos(50);
    if (reduce || !("IntersectionObserver" in window)) return;
    var played = false;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || played) return;
        played = true; obs.disconnect();
        var keys = [[0, 50], [900, 88], [2100, 12], [3100, 50]];
        var start = null;
        function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
        function frame(ts) {
          if (userTouched) return;
          if (start === null) start = ts;
          var t = ts - start;
          for (var i = 1; i < keys.length; i++) {
            if (t <= keys[i][0]) {
              var a = keys[i - 1], b = keys[i];
              var f = ease((t - a[0]) / (b[0] - a[0]));
              setPos(a[1] + (b[1] - a[1]) * f);
              window.requestAnimationFrame(frame);
              return;
            }
          }
          setPos(50);
        }
        setTimeout(function () { window.requestAnimationFrame(frame); }, 350);
      });
    }, { threshold: 0.5 });
    obs.observe(ba);
  });

  /* ---------- Highlight today's hours ---------- */
  var today = new Date().getDay();
  $$(".hours tr[data-day]").forEach(function (tr) {
    if (parseInt(tr.getAttribute("data-day"), 10) === today) tr.classList.add("is-today");
  });

  /* ---------- Netlify form: validation + async submit ---------- */
  $$("form[data-validate]").forEach(function (form) {
    var success = document.getElementById(form.getAttribute("data-success"));
    function showSuccess() {
      form.hidden = true;
      if (success) { success.hidden = false; success.setAttribute("tabindex", "-1"); success.focus(); }
    }
    if (/[?&]sent=1/.test(window.location.search)) showSuccess();

    function fieldError(input) {
      var msg = "";
      var v = (input.value || "").trim();
      if (input.required && !v) msg = "Please fill in this field.";
      else if (input.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Please enter a valid email address.";
      else if (input.type === "tel" && v && v.replace(/\D/g, "").length < 10) msg = "Please enter a 10-digit phone number.";
      var err = document.getElementById(input.id + "-err");
      if (err) err.textContent = msg;
      if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
      return !msg;
    }
    $$("input, select, textarea", form).forEach(function (input) {
      if (input.type === "hidden" || input.closest(".hp")) return;
      input.addEventListener("blur", function () { fieldError(input); });
      input.addEventListener("input", function () { if (input.getAttribute("aria-invalid")) fieldError(input); });
    });

    form.addEventListener("submit", function (e) {
      var ok = true, firstBad = null;
      $$("input[required], select[required], textarea[required], input[type=email], input[type=tel]", form).forEach(function (input) {
        if (!fieldError(input)) { ok = false; if (!firstBad) firstBad = input; }
      });
      if (!ok) { e.preventDefault(); firstBad.focus(); return; }
      if (!window.fetch) return;
      e.preventDefault();
      var submitBtn = form.querySelector("[type=submit]");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.setAttribute("aria-busy", "true"); }
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body })
        .then(function (res) { if (!res.ok) throw new Error(res.status); showSuccess(); })
        .catch(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute("aria-busy"); }
          var status = form.querySelector("[data-form-status]");
          if (status) status.textContent = "Sorry, the message could not be sent. Please call or text (804) 965-3210.";
        });
    });
  });

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
