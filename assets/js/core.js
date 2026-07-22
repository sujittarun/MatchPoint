/* ============================================================
   MATCH POINT — core shell (window.LT)
   The LT namespace is inherited from the Leo codebase for
   code-compat; every user-visible string is Match Point. Storage keys
   are prefixed "mp-" (Leo shares the github.io origin).
   Storage layer is localStorage for now (LT.store); swap for the
   production API/Supabase without touching page controllers.
   ============================================================ */
(function () {
  "use strict";

  var LT = (window.LT = {});

  /* ---------- Compact Match Point court mark ---------- */
  LT.logoSVG = function (size) {
    var w = size || 30;
    return '<svg width="' + w + '" height="' + w + '" viewBox="0 0 40 40" fill="none" aria-hidden="true">' +
      '<rect x="1" y="1" width="38" height="38" rx="11" fill="#c9ff35"/>' +
      '<path d="M10 29V11h4.2l5.8 8.2 5.8-8.2H30v18h-5v-9.7L20 26l-5-6.7V29h-5Z" fill="#11160f"/>' +
      '<path d="M30.5 6.5 34 10l-3.5 3.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  };

  /* ---------- Theme (dark-first, persisted) ---------- */
  LT.theme = {
    get: function () { return document.documentElement.dataset.theme || "dark"; },
    set: function (t) {
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem("mp-theme", t); } catch (e) {}
      document.querySelectorAll(".theme-toggle").forEach(LT.theme.paint);
    },
    toggle: function () { LT.theme.set(LT.theme.get() === "dark" ? "light" : "dark"); },
    paint: function (btn) {
      var dark = LT.theme.get() === "dark";
      btn.innerHTML = dark
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    },
  };

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  LT.toast = function (msg, ms) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "lt-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, ms || 2600);
  };

  /* ---------- Store (localStorage-backed persistence seam) ---------- */
  LT.store = {
    read: function (key, fallback) {
      try { return JSON.parse(localStorage.getItem("mp-" + key)) || fallback; }
      catch (e) { return fallback; }
    },
    write: function (key, val) {
      try { localStorage.setItem("mp-" + key, JSON.stringify(val)); } catch (e) {}
    },
  };

  /* ---------- Auth (tenant-scoped Supabase staff session) ---------- */
  LT.auth = {
    login: function (email) { LT.store.write("session", { email: email || "staff@matchpointacademy.in", at: Date.now() }); },
    logout: function () {
      try { localStorage.removeItem("mp-session"); localStorage.removeItem("mp-cloud-session"); } catch (e) {}
      location.href = "index.html";
    },
    session: function () {
      try {
        var cloud = JSON.parse(localStorage.getItem("mp-cloud-session"));
        if (cloud && cloud.access_token) return cloud;
      } catch (e) {}
      return LT.store.read("session", null);
    },
    require: function () {
      var s = LT.auth.session();
      if (!s) return location.replace("login.html");
      // once strict auth is on, a legacy local session no longer counts
      if (window.LT_CLOUD && LT_CLOUD.STRICT_AUTH && !s.access_token) location.replace("login.html");
    },
  };

  /* ---------- Formatters ---------- */
  LT.fmtINR = function (n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); };
  // escape user-supplied text before it goes into innerHTML — booking/
  // applicant names come from the public and could carry <script>/onerror
  LT.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  LT.initials = function (name) {
    return String(name || "").split(/\s+/).slice(0, 2).map(function (w) { return w[0] || ""; }).join("").toUpperCase();
  };
  LT.isoDate = function (d) { // local date, not UTC — IST is +5:30 and
    // toISOString() shifts early-morning dates back a day
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  LT.today = function () { return LT.isoDate(new Date()); };

  /* ---------- Count-up ---------- */
  LT.countUp = function (el, target, opts) {
    opts = opts || {};
    var dur = opts.dur || 1100, start = null, prefix = opts.prefix || "", suffix = opts.suffix || "";
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString("en-IN") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* ---------- Venue scope ----------
     Data remains venue-keyed from day one, so the planned second branch can
     be added without changing any member, booking or finance controller. */
  LT.venue = {
    KEYS: ["all", "manikonda"],
    get: function () {
      var v = LT.store.read("venue-scope", "all");
      return LT.venue.KEYS.indexOf(v) === -1 ? "all" : v;
    },
    set: function (v) {
      LT.store.write("venue-scope", LT.venue.KEYS.indexOf(v) === -1 ? "all" : v);
      location.reload();
    },
    label: function (v) {
      v = v || LT.venue.get();
      return v === "manikonda" ? "Manikonda" : "All venues";
    },
    // true when a record tagged with venue key k is inside the scope.
    // Untagged records (k falsy, e.g. shared expenses) stay visible in
    // every scope rather than silently disappearing.
    match: function (k) {
      var s = LT.venue.get();
      return s === "all" || !k || k === s;
    },
    // filter an array by venue; getter maps row -> venue key and
    // defaults to row.venue || row.sport (bookings carry the key as sport)
    filter: function (arr, getter) {
      var s = LT.venue.get();
      if (s === "all") return arr;
      return (arr || []).filter(function (x) {
        var k = getter ? getter(x) : (x.venue || x.sport);
        return !k || k === s;
      });
    },
  };

  /* ---------- Manager nav shell ---------- */
  var MANAGER_TABS = [
    ["dashboard.html", "Dashboard", '<path d="M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"/>'],
    ["players.html", "Members", '<path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>'],
    ["progress.html", "Progress", '<path d="M4 19h16v2H4zm1-2 4.2-5.6 3.1 2.4L17.5 7H15V5h6v6h-2V8.5l-6.3 8.2-3.1-2.4L6.6 18zM5 5h3v5H5z"/>'],
    ["bookings.html", "Bookings", '<path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14zM5 8V6h14v2zm4 6H7v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2zm-8 4H7v-2h2zm4 0h-2v-2h2z"/>'],
    ["attendance.html", "Attendance", '<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>'],
    ["fees.html", "Finance",'<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1H6.32c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>'],
  ];

  LT.managerShell = function (activeHref) {
    var s = LT.auth.session();
    var tabsHtml = MANAGER_TABS.map(function (t) {
      var act = t[0] === activeHref ? " active" : "";
      return '<a class="nav-tab' + act + '" href="' + t[0] + '"><svg viewBox="0 0 24 24" fill="currentColor">' + t[2] + "</svg><span>" + t[1] + "</span></a>";
    }).join("");
    var dockHtml = MANAGER_TABS.map(function (t) {
      var act = t[0] === activeHref ? " active" : "";
      return '<a class="dock-tab' + act + '" href="' + t[0] + '"><svg viewBox="0 0 24 24" fill="currentColor">' + t[2] + "</svg>" + t[1] + "</a>";
    }).join("");

    var scopeHtml = LT.venue.KEYS.map(function (v) {
      var lbl = v === "all" ? "All venues" : "Manikonda";
      return '<option value="' + v + '"' + (LT.venue.get() === v ? " selected" : "") + ">" + lbl + "</option>";
    }).join("");

    var nav = document.createElement("nav");
    nav.className = "lt-nav glass";
    nav.innerHTML =
      '<a class="nav-brand" href="index.html"><span class="mark">' + LT.logoSVG(28) + "</span>" +
      '<span class="t"><strong>Match Point</strong><span>Academy OS</span></span></a>' +
      '<div class="nav-tabs">' + tabsHtml + "</div>" +
      '<div class="nav-actions">' +
      '<span class="lt-filter"><select data-venue-scope aria-label="Venue scope">' + scopeHtml + "</select></span>" +
      '<button type="button" class="theme-toggle"></button>' +
      '<button type="button" class="btn btn-icon btn-glass only-mobile" data-logout aria-label="Sign out" title="Sign out">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>' +
      "</button>" +
      '<button type="button" class="btn btn-ghost btn-sm hide-mobile" data-logout>Sign out</button>' +
      "</div>";
    document.body.prepend(nav);

    var dock = document.createElement("nav");
    dock.className = "lt-dock glass";
    dock.innerHTML = dockHtml;
    document.body.appendChild(dock);

    if (s && s.email) {
      var badge = nav.querySelector("[data-logout]");
      badge.title = s.email;
    }

    nav.querySelector("[data-venue-scope]").addEventListener("change", function () {
      LT.venue.set(this.value);
    });
  };

  /* ---------- Emblem ink filter (light theme) ----------
     The player emblem is white linework + a gold centre figure. In light
     mode we recolor ONLY the white players to dark ink and keep the gold
     highlight — the artwork's blue channel is the separator (white has
     full blue, gold has almost none), so one feColorMatrix does it:
     R' = R − .87B, G' = G − .85B, B' = .2B  →  white → slate ink,
     gold → deep amber. Injected once; referenced from glass.css as
     filter: url(#mxInk). */
  (function injectInkFilter() {
    if (!document.body || document.getElementById("mxInk")) return;
    var host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    host.setAttribute("width", "0");
    host.setAttribute("height", "0");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "absolute";
    host.innerHTML =
      '<filter id="mxInk" color-interpolation-filters="sRGB">' +
      '<feColorMatrix type="matrix" values="1 0 -0.87 0 0  0 1 -0.85 0 0  0 0 0.2 0 0  0 0 0 1 0"/>' +
      "</filter>";
    document.body.appendChild(host);
  })();

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    // brand marks
    document.querySelectorAll("[data-logo]").forEach(function (el) {
      el.innerHTML = LT.logoSVG(el.dataset.logo || 30);
    });

    // theme toggles
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      LT.theme.paint(btn);
      btn.addEventListener("click", LT.theme.toggle);
    });

    // logout buttons
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-logout]")) LT.auth.logout();
    });

    // scroll reveal
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
      // Safety net: Safari sometimes doesn't fire the observer, or freezes the
      // reveal's opacity transition mid-way (paint/compositing race), leaving a
      // card stuck invisible. Force any un-revealed card fully visible with the
      // transition disabled so opacity snaps to 1 instead of animating (which is
      // what stalls). Content can then never stay hidden.
      setTimeout(function () {
        document.querySelectorAll(".reveal").forEach(function (el) {
          // .in may already be set yet the opacity transition frozen at 0 on
          // Safari, so force every reveal regardless of class.
          if (getComputedStyle(el).opacity !== "1") {
            el.style.transition = "none";
            el.style.opacity = "1";
            el.style.transform = "none";
          }
          el.classList.add("in");
        });
      }, 1000);
    } else {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    }

    // cursor-following specular on hover cards
    document.querySelectorAll(".glass-hover").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });

    // global: freeze page scroll whenever ANY modal backdrop is open, so a
    // touch-scroll moves the modal (which scrolls internally), not the page
    // behind it. Covers every popup without per-page wiring.
    if ("MutationObserver" in window) {
      var lockSync = function () {
        document.body.classList.toggle("lt-noscroll", !!document.querySelector(".lt-modal-backdrop.open"));
      };
      var lockMo = new MutationObserver(lockSync);
      document.querySelectorAll(".lt-modal-backdrop").forEach(function (b) {
        lockMo.observe(b, { attributes: true, attributeFilter: ["class"] });
      });
    }

    // count-up stats when visible
    var seen = new WeakSet();
    if ("IntersectionObserver" in window) {
      var cu = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !seen.has(en.target)) {
            seen.add(en.target);
            var el = en.target;
            LT.countUp(el, Number(el.dataset.countup || 0), { prefix: el.dataset.prefix || "", suffix: el.dataset.suffix || "" });
            cu.unobserve(el);
          }
        });
      }, { threshold: 0.4 });
      document.querySelectorAll("[data-countup]").forEach(function (el) { cu.observe(el); });
    }
  });
})();
