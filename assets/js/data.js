/* Match Point — tenant data and local-first operating dataset. */
(function () {
  "use strict";

  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function daysFromNow(n) { var d = new Date(); d.setDate(d.getDate() + n); return iso(d); }

  var venue = "manikonda";
  window.LT_DATA = {
    programs: [
      { id: "found", name: "Foundation", level: "Beginners · ages 6+", days: "Mon · Wed · Fri", time: "5:30–7 AM & 5:30–7 PM" },
      { id: "inter", name: "Intermediate", level: "Footwork, control & match play", days: "Tue · Thu · Sat", time: "7–8:30 AM & 7–8:30 PM" },
      { id: "perf", name: "Performance", level: "Tournament pathway", days: "Mon–Sat", time: "4:30–6 AM & 8:30–10 PM" },
      { id: "private", name: "Personal Coaching", level: "Focused 1-on-1 development", days: "By appointment", time: "Coach-selected slots" }
    ],

    plans: [
      { id: "m", label: "Monthly", amount: 3000, months: 1 },
      { id: "q", label: "Quarterly", amount: 8550, months: 3, note: "5% off" },
      { id: "h", label: "Half-yearly", amount: 16200, months: 6, note: "10% off" }
    ],

    sports: {
      manikonda: { label: "Match Point · Manikonda", short: "Manikonda", rates: { offPeak: 350, peak: 450 } }
    },
    venues: {
      manikonda: {
        key: "manikonda",
        name: "Match Point · Manikonda",
        full: "Match Point (It's Next Level)",
        area: "Alkapur Township · Manikonda",
        address: "Plot 131, Block B, Sector II, Survey 235, Road 14, Alkapur Township, Puppalguda, Telangana 500089",
        phone: "+91 77320 77327",
        hours: "9 AM – 12 midnight",
        note: "Indoor synthetic badminton courts",
        courts: 3,
        prefix: "M",
        maps: "https://maps.google.com/?q=Match+Point+Badminton+Academy+Alkapur+Township+Manikonda"
      }
    },
    courtsMeta: [
      { id: "M1", sport: venue, name: "Court 1", note: "Training & open play", img: "assets/img/matchpoint-hero.png" },
      { id: "M2", sport: venue, name: "Court 2", note: "Intermediate & match play", img: "assets/img/matchpoint-hero.png" },
      { id: "M3", sport: venue, name: "Court 3", note: "Advanced & performance", img: "assets/img/matchpoint-hero.png" }
    ],
    slotHours: { open: 9, close: 24 },
    rates: { peakFrom: 17 },

    billing: {
      payee: "Match Point Badminton Academy",
      upiIds: ["7732077327@ybl"],
      upiWindowDays: 5
    },

    contact: {
      address: "Plot 131, Road 14, Alkapur Township, Puppalguda, Hyderabad 500089",
      phone: "+91 77320 77327",
      hours: "Open daily · 9 AM – 12 midnight",
      instagram: "https://www.instagram.com/matchpoint_badminton_academy/",
      site: "https://playo.co/venues/manikonda-hyderabad/match-point-its-next-level-manikonda-hyderabad"
    },

    members: [
      { id: 1, name: "Aarav Reddy", program: "perf", venue: venue, age: 15, phone: "98490 11223", joined: "2025-08-05", validTill: daysFromNow(38), status: "active" },
      { id: 2, name: "Ananya Rao", program: "found", venue: venue, age: 9, phone: "97010 38854", joined: "2026-03-01", validTill: daysFromNow(21), status: "active" },
      { id: 3, name: "Vihaan Gupta", program: "inter", venue: venue, age: 12, phone: "98661 90035", joined: "2026-01-18", validTill: daysFromNow(-3), status: "due" },
      { id: 4, name: "Nitya Menon", program: "perf", venue: venue, age: 16, phone: "90000 87641", joined: "2025-06-02", validTill: daysFromNow(56), status: "active" },
      { id: 5, name: "Rohan Varma", program: "found", venue: venue, age: 10, phone: "99490 55876", joined: "2026-04-18", validTill: daysFromNow(41), status: "active" },
      { id: 6, name: "Meera Iyer", program: "private", venue: venue, age: 31, phone: "96520 71148", joined: "2025-12-01", validTill: daysFromNow(-8), status: "due" },
      { id: 7, name: "Arjun Sai", program: "inter", venue: venue, age: 13, phone: "90104 22983", joined: "2025-10-22", validTill: daysFromNow(14), status: "active" },
      { id: 8, name: "Diya Chandran", program: "found", venue: venue, age: 8, phone: "98850 61147", joined: "2026-05-12", validTill: daysFromNow(33), status: "active" },
      { id: 9, name: "Kabir Sharma", program: "perf", venue: venue, age: 17, phone: "98481 33290", joined: "2025-11-10", validTill: daysFromNow(5), status: "active" },
      { id: 10, name: "Saanvi Goud", program: "inter", venue: venue, age: 14, phone: "99890 44215", joined: "2026-02-15", validTill: daysFromNow(27), status: "active" },
      { id: 11, name: "Aditya Pillai", program: "private", venue: venue, age: 38, phone: "98123 40987", joined: "2026-04-20", validTill: daysFromNow(52), status: "active" },
      { id: 12, name: "Tara Agarwal", program: "perf", venue: venue, age: 16, phone: "97654 12309", joined: "2026-06-15", validTill: daysFromNow(74), status: "active" }
    ],

    staff: [
      { id: "s1", venue: venue, name: "Venu Muppala", role: "Founder & Head Coach" },
      { id: "s2", venue: venue, name: "Karthik Reddy", role: "Performance Coach" },
      { id: "s3", venue: venue, name: "Sowmya Rao", role: "Foundation Coach" },
      { id: "s4", venue: venue, name: "Naveen Kumar", role: "Front Desk" },
      { id: "s5", venue: venue, name: "Ravi Goud", role: "Courts & Maintenance" }
    ],

    expenseCats: ["Salaries", "Court maintenance", "Shuttles & equipment", "Rent", "Power & utilities", "Other"],
    expenses: [
      { ref: "E-MP01", venue: venue, category: "Salaries", payee: "Coach & staff payroll", detail: "Monthly salaries · 5 staff", amount: 185000, mode: "Bank", on: daysFromNow(-3) },
      { ref: "E-MP02", venue: venue, category: "Rent", payee: "Facility lease", detail: "Alkapur Township venue", amount: 120000, mode: "Bank", on: daysFromNow(-4) },
      { ref: "E-MP03", venue: venue, category: "Power & utilities", payee: "TGSPDCL", detail: "Court lighting & ventilation", amount: 48500, mode: "Bank", on: daysFromNow(-6) },
      { ref: "E-MP04", venue: venue, category: "Court maintenance", payee: "CourtCare Hyderabad", detail: "Mat deep-clean & net check", amount: 16500, mode: "UPI", on: daysFromNow(-8) },
      { ref: "E-MP05", venue: venue, category: "Shuttles & equipment", payee: "Sports distributor", detail: "Feather shuttles · 20 tubes", amount: 19200, mode: "Card", on: daysFromNow(-10) }
    ],

    bookings: [
      { id: "MP-2041", name: "Rohit Venkatesh", phone: "90000 87641", court: "M1", sport: venue, date: daysFromNow(0), hour: 9, amount: 350, status: "confirmed", source: "Website" },
      { id: "MP-2042", name: "Aarav Reddy", phone: "98490 11223", court: "M2", sport: venue, date: daysFromNow(0), hour: 10, amount: 350, status: "confirmed", source: "Website" },
      { id: "MP-2043", name: "Smash Circle", phone: "98111 22334", court: "M3", sport: venue, date: daysFromNow(0), hour: 11, amount: 350, status: "confirmed", source: "Playo" },
      { id: "MP-2044", name: "Lakshmi Menon", phone: "98123 40987", court: "M1", sport: venue, date: daysFromNow(0), hour: 17, amount: 450, status: "confirmed", source: "Playo" },
      { id: "MP-2045", name: "Racquet Republic", phone: "96555 77889", court: "M2", sport: venue, date: daysFromNow(0), hour: 18, amount: 450, status: "confirmed", source: "Website" },
      { id: "MP-2046", name: "Cygnus Tech", phone: "98450 22110", court: "M3", sport: venue, date: daysFromNow(0), hour: 19, amount: 450, status: "pending", source: "Walk-in" },
      { id: "MP-2047", name: "Farhan Sheikh", phone: "90104 22983", court: "M1", sport: venue, date: daysFromNow(0), hour: 21, amount: 450, status: "confirmed", source: "Website" },
      { id: "MP-2048", name: "Pooja Mandava", phone: "96888 20416", court: "M2", sport: venue, date: daysFromNow(1), hour: 9, amount: 350, status: "confirmed", source: "Playo" }
    ],

    payments: [
      { id: 101, venue: venue, name: "Tara Agarwal", type: "Membership", detail: "Monthly · Performance", amount: 3200, on: daysFromNow(-1), mode: "UPI" },
      { id: 102, venue: venue, name: "Lakshmi Menon", type: "Court", detail: "Court 1 · 5–6 PM", amount: 450, on: daysFromNow(-1), mode: "UPI" },
      { id: 103, venue: venue, name: "Aarav Reddy", type: "Membership", detail: "Quarterly · Performance", amount: 9120, on: daysFromNow(-4), mode: "UPI" },
      { id: 104, venue: venue, name: "Rohan Varma", type: "Membership", detail: "Monthly · Foundation", amount: 2800, on: daysFromNow(-5), mode: "Cash" },
      { id: 105, venue: venue, name: "Cygnus Tech", type: "Court", detail: "Courts 2–3 · 7–9 PM", amount: 1800, on: daysFromNow(-6), mode: "Bank" }
    ],

    finance: [
      { m: "Feb", rev: 620, exp: 390, memberships: 410, courts: 210, salaries: 175, maintenance: 24, power: 45, gear: 19 },
      { m: "Mar", rev: 675, exp: 405, memberships: 438, courts: 237, salaries: 175, maintenance: 28, power: 49, gear: 21 },
      { m: "Apr", rev: 648, exp: 410, memberships: 425, courts: 223, salaries: 180, maintenance: 26, power: 52, gear: 20 },
      { m: "May", rev: 712, exp: 418, memberships: 462, courts: 250, salaries: 180, maintenance: 30, power: 55, gear: 22 },
      { m: "Jun", rev: 756, exp: 426, memberships: 487, courts: 269, salaries: 185, maintenance: 27, power: 58, gear: 24 },
      { m: "Jul", rev: 486, exp: 287, memberships: 316, courts: 170, salaries: 124, maintenance: 18, power: 39, gear: 16 }
    ],
    financeFor: function () { return this.finance; },
    activity: [
      { icon: "trophy", text: "<strong>Performance squad</strong> completed match-simulation training", time: "Today" },
      { icon: "join", text: "<strong>Tara Agarwal</strong> joined Performance · Monthly plan", time: "Yesterday" },
      { icon: "court", text: "<strong>Cygnus Tech</strong> requested Court 3, 7–8 PM", time: "Yesterday" },
      { icon: "pay", text: "<strong>Aarav Reddy</strong> renewed Quarterly · ₹9,120", time: "4 days ago" },
      { icon: "join", text: "<strong>4 coaching enquiries</strong> received from the website", time: "This week" }
    ]
  };

  LT_DATA.channels = [
    { id: "Website", label: "Website", cls: "gold" },
    { id: "Playo", label: "Playo", cls: "green" },
    { id: "Walk-in", label: "Walk-in", cls: "" }
  ];

  (function backfill() {
    function rng(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    var names = ["Aditi Rao", "Karthik S", "Neha Bansal", "Praveen Y", "Ritu Sharma", "Mohit Jain", "Sneha K", "Imran Ali", "Deepa Nair", "Suresh Babu"];
    var src = ["Website", "Website", "Playo", "Playo", "Walk-in"];
    var hist = [];
    for (var d = 1; d <= 30; d++) {
      var date = daysFromNow(-d), r = rng(parseInt(date.replace(/-/g, ""), 10)), used = {};
      var n = 5 + Math.floor(r() * 5);
      for (var k = 0; k < n; k++) {
        var hour = r() < .65 ? 17 + Math.floor(r() * 6) : 9 + Math.floor(r() * 8);
        var court = LT_DATA.courtsMeta[Math.floor(r() * LT_DATA.courtsMeta.length)];
        var key = hour + ":" + court.id;
        if (used[key]) continue;
        used[key] = 1;
        hist.push({ id: "MP-H" + date.replace(/-/g, "").slice(4) + "-" + hour + court.id, name: names[Math.floor(r() * names.length)], phone: "", court: court.id, sport: venue, date: date, hour: hour, amount: hour >= LT_DATA.rates.peakFrom ? 450 : 350, status: "confirmed", source: src[Math.floor(r() * src.length)] });
      }
    }
    LT_DATA.bookings = LT_DATA.bookings.concat(hist);
  })();

  window.LT_ROSTER = function () {
    var seen = {}, out = LT_DATA.members.slice();
    out.forEach(function (m) { seen[String(m.id)] = 1; });
    (LT.store.read("members", []) || []).forEach(function (m) { if (!seen[String(m.id)]) out.push(m); });
    var ov = LT.store.read("member-overrides", {});
    return out.map(function (m) { return ov[m.id] ? Object.assign({}, m, ov[m.id]) : m; });
  };

  window.LT_STAFF = function () {
    var removed = LT.store.read("staff-removed", []) || [];
    return LT_DATA.staff.concat(LT.store.read("staff-added", []) || []).filter(function (s) { return removed.indexOf(s.id) === -1; });
  };

  window.LT_SLOTS = {
    hours: (function () { var a = []; for (var h = LT_DATA.slotHours.open; h < LT_DATA.slotHours.close; h++) a.push(h); return a; })(),
    rate: function (h) { return h >= LT_DATA.rates.peakFrom ? 450 : 350; },
    label: function (h) {
      function f(x) { var ap = x >= 12 && x < 24 ? "PM" : "AM"; var v = x % 12 || 12; return v + " " + ap; }
      return f(h) + " – " + f(h + 1);
    },
    courtId: function (c) { return typeof c === "number" ? "M" + c : c; },
    courtsOf: function () { return LT_DATA.courtsMeta; },
    venueOf: function () { return venue; }
  };
})();
