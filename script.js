/* =====================================================
   SETTINGS - ဒီနေရာလေးတွေကို ပြင်ပါ
   ===================================================== */
const RECEIVER_EMAIL = "kopinn204@gmail.com";   // စာလက်ခံမယ့် Gmail
const START_DATE = new Date(2025, 10, 1);        // 13 October 2025 (လက 0 ကနေစရေတွက်: 9 = October)
const DATE_TEXT = "01 November 2025";

/* ===================================================== */
const screens = Array.from(document.querySelectorAll(".screen"));
const total = screens.length;
let current = 0;

const body = document.body;
const progressFill = document.getElementById("progressFill");
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

/* ---------- Navigation ---------- */
function go(index) {
  if (index < 0 || index >= total) return;
  screens[current].classList.remove("active");
  current = index;
  screens[current].classList.add("active");

  body.classList.toggle("intro", current === 0);
  progressFill.style.width = (current / (total - 1)) * 100 + "%";
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

  if (screens[current].id === "s3") runCounter();
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-next]")) go(current + 1);
  else if (e.target.closest("[data-prev]")) go(current - 1);
  else if (e.target.closest("[data-restart]")) {
    resetInteractive();
    go(0);
  }
});

/* ---------- Music ---------- */
let musicOn = false;
musicBtn.addEventListener("click", async () => {
  if (!musicOn) {
    try {
      await bgm.play();
      musicOn = true;
      musicBtn.textContent = "Music On";
    } catch (err) {
      musicBtn.textContent = "Music Off";
      console.warn("Music could not play (check music.mp3):", err);
    }
  } else {
    bgm.pause();
    musicOn = false;
    musicBtn.textContent = "Music Off";
  }
});

/* ---------- Day counter ---------- */
function calcTogether() {
  const now = new Date();
  const startMid = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate());
  const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.max(0, Math.round((nowMid - startMid) / 86400000));

  let years = nowMid.getFullYear() - startMid.getFullYear();
  let months = nowMid.getMonth() - startMid.getMonth();
  if (nowMid.getDate() < startMid.getDate()) months--;
  if (months < 0) { years--; months += 12; }
  return { days, years: Math.max(0, years), months };
}

function animateNumber(el, to, duration = 1400) {
  const t0 = performance.now();
  function tick(t) {
    const p = Math.min((t - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function runCounter() {
  const { days, years, months } = calcTogether();
  document.getElementById("dateText").textContent = DATE_TEXT;
  animateNumber(document.getElementById("daysBig"), days);
  animateNumber(document.getElementById("statYears"), years, 900);
  animateNumber(document.getElementById("statMonths"), months, 900);
  animateNumber(document.getElementById("statDays"), days);
}

/* ---------- Envelope ---------- */
const envWrap = document.getElementById("envWrap");
const envelope = document.getElementById("envelope");
const envHint = document.getElementById("envHint");
const letter = document.getElementById("letter");

envelope.addEventListener("click", () => {
  if (envWrap.classList.contains("open")) return;
  envWrap.classList.add("open");
  envHint.classList.add("hide");
  burstHearts(10);
  setTimeout(() => letter.classList.add("show"), 1100);
});

/* ---------- Gift ---------- */
const gift = document.getElementById("gift");
const giftHint = document.getElementById("giftHint");
const reveal = document.getElementById("reveal");

gift.addEventListener("click", () => {
  if (gift.classList.contains("open")) return;
  gift.classList.add("open");
  giftHint.classList.add("hide");
  burstHearts(18);
  setTimeout(() => reveal.classList.add("show"), 700);
});

function resetInteractive() {
  envWrap.classList.remove("open");
  envHint.classList.remove("hide");
  letter.classList.remove("show");
  gift.classList.remove("open");
  giftHint.classList.remove("hide");
  reveal.classList.remove("show");
}

/* ---------- Floating hearts ---------- */
const heartsLayer = document.getElementById("hearts");
const heartChars = ["♥", "♡", "♥", "❤"];

function spawnHeart(x) {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
  h.style.left = (x ?? Math.random() * 100) + "%";
  h.style.fontSize = 14 + Math.random() * 26 + "px";
  h.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
  h.style.setProperty("--rot", (Math.random() * 60 - 30) + "deg");
  h.style.animationDuration = 7 + Math.random() * 6 + "s";
  heartsLayer.appendChild(h);
  setTimeout(() => h.remove(), 14000);
}

function burstHearts(n) {
  for (let i = 0; i < n; i++) setTimeout(() => spawnHeart(), i * 90);
}

setInterval(() => {
  if (!document.hidden && heartsLayer.children.length < 22) spawnHeart();
}, 900);

/* ---------- Reply form ---------- */
const chips = document.querySelectorAll(".chip");
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const on = chip.getAttribute("aria-pressed") === "true";
    chip.setAttribute("aria-pressed", String(!on));
  });
});

const form = document.getElementById("replyForm");
const msg = document.getElementById("msg");
const statusEl = document.getElementById("formStatus");
const sendBtn = document.getElementById("sendBtn");
const thanks = document.getElementById("thanks");
const s8 = document.getElementById("s8");

function setStatus(text, isErr) {
  statusEl.textContent = text;
  statusEl.classList.toggle("err", !!isErr);
}

function showThanks() {
  s8.classList.add("sent");
  thanks.classList.add("show");
  burstHearts(22);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const feelings = Array.from(chips)
    .filter((c) => c.getAttribute("aria-pressed") === "true")
    .map((c) => c.dataset.value);
  const text = msg.value.trim();

  if (!feelings.length && !text) {
    setStatus("ခံစားချက်တစ်ခုခု ရွေးပေးပါ၊ ဒါမှမဟုတ် စာလေးရေးပေးပါနော်။", true);
    return;
  }

  const sentAt = new Date().toLocaleString();
  const feelingText = feelings.length ? feelings.join(", ") : "(မရွေးထားပါ)";
  const messageText = text || "(စာမရေးထားပါ)";

  sendBtn.disabled = true;
  setStatus("ပို့နေပါတယ်...", false);

  // Email မထည့်ရသေးရင် mailto နဲ့ ဖွင့်ပေးမယ်
  if (!RECEIVER_EMAIL || RECEIVER_EMAIL.startsWith("kopinn204@gmail.com")) {
    const subject = encodeURIComponent("ကလေးလေးရဲ့ အဖြေ 💌");
    const bodyTxt = encodeURIComponent(`ခံစားချက်: ${feelingText}\n\n${messageText}\n\n(${sentAt})`);
    window.location.href = `mailto:kopinn204@gmail.com?subject=${subject}&body=${bodyTxt}`;
    setStatus("kopinn204@gmail.com", true);
    sendBtn.disabled = false;
    return;
  }

  try {
    const res = await fetch("https://formsubmit.cloud/f/55d358c1-6aeb-478d-9206-970faf5b9e84/" + encodeURIComponent(RECEIVER_EMAIL), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: "ကလေးလေးရဲ့ အဖြေ 💌",
        _template: "table",
        _captcha: "false",
        ခံစားချက်: feelingText,
        စာ: messageText,
        ပို့ခဲ့တဲ့အချိန်: sentAt,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.success === true || data.success === "true")) {
      setStatus("", false);
      showThanks();
    } else {
      throw new Error(data.message || "send failed");
    }
  } catch (err) {
    console.error(err);
    setStatus("မပို့နိုင်သေးပါဘူး။ အင်တာနက်စစ်ပြီး ပြန်ကြိုးစားပေးပါနော်။", true);
  } finally {
    sendBtn.disabled = false;
  }
});

/* ---------- Init ---------- */
progressFill.style.width = "0%";
