(function () {
  const S = window.SITE || {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const fmtPrice = (n) => n == null ? null : new Intl.NumberFormat("ru-RU").format(n) + " ₽";
  const tgLink = (text) => S.telegram + (text ? "?text=" + encodeURIComponent(text) : "");

  /* ---- Контакты ---- */
  $$("[data-link='telegram']").forEach((a) => {
    a.href = tgLink("Здравствуйте! Интересует программа «Собственник 2.0»");
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-link='phone']").forEach((a) => {
    if (!S.phone) { a.hidden = true; return; }
    a.href = "tel:" + S.phone.replace(/[^\d+]/g, "");
    a.textContent = S.phone;
  });
  const legal = $("[data-legal]");
  if (legal) legal.textContent = S.legal || "";
  const startPill = $("[data-start-pill]");
  if (startPill && S.startLabel) startPill.textContent = S.startLabel;

  /* ---- Бургер ---- */
  const burger = $("[data-burger]");
  const mobile = $("[data-mobile]");
  if (burger && mobile) {
    burger.addEventListener("click", () => mobile.classList.toggle("is-open"));
    $$("a", mobile).forEach((a) => a.addEventListener("click", () => mobile.classList.remove("is-open")));
  }

  /* ---- Тарифы ---- */
  const tariffsRoot = $("[data-tariffs]");
  if (tariffsRoot) {
    tariffsRoot.innerHTML = (S.tariffs || []).map((t) => {
      const now = fmtPrice(t.price);
      const old = fmtPrice(t.oldPrice);
      const priceHtml = now
        ? `<div class="tariff__price"><span class="tariff__price-now">${now}</span>${old ? `<span class="tariff__price-old">${old}</span>` : ""}</div>`
        : `<div class="tariff__price"><span class="tariff__price-tbd">Стоимость уточняется</span></div>`;
      const btnText = t.requestOnly ? "Оставить заявку" : "Занять место";
      return `
        <div class="glass tariff ${t.featured ? "glass--blue tariff--featured" : ""}" data-tariff-id="${t.id}">
          ${t.featured ? `<div class="tariff__badge">Рекомендуем</div>` : ""}
          <div class="tariff__tag">${t.tag || ""}</div>
          <div class="tariff__name">${t.name}</div>
          <div class="tariff__for">${t.for || ""}</div>
          ${priceHtml}
          <div class="tariff__seats">${t.seats || ""}</div>
          ${t.featuresLead ? `<div class="tariff__lead">${t.featuresLead}</div>` : ""}
          <ul class="check check--dots">${(t.features || []).map((f) => `<li>${f}</li>`).join("")}</ul>
          <button class="btn ${t.featured ? "btn--white" : "btn--primary"} btn--full" data-buy="${t.id}">${btnText}</button>
        </div>`;
    }).join("");
  }

  /* ---- Кейсы ---- */
  const cases = S.cases || [];
  if (cases.length) {
    const sec = $("[data-section='cases']");
    const grid = $("[data-cases-grid]");
    if (sec && grid) {
      grid.innerHTML = cases.map((c) => `
        <div class="glass case">
          <div class="case__company">${c.company || ""}</div>
          ${c.before ? `<div class="case__row"><div class="case__k">Было</div><div>${c.before}</div></div>` : ""}
          ${c.after ? `<div class="case__row"><div class="case__k">Стало</div><div>${c.after}</div></div>` : ""}
          ${c.quote ? `<div class="case__quote">${c.quote}</div>` : ""}
          ${c.author ? `<div class="case__author">${c.author}</div>` : ""}
        </div>`).join("");
      sec.hidden = false;
      $$("[data-nav='cases']").forEach((a) => (a.hidden = false));
    }
  }

  /* ---- Модалка оплаты ---- */
  const modal = $("[data-modal]");
  const consent = $("[data-consent]");
  const payBtn = $("[data-pay]");
  let current = null;

  function openModal(t) {
    current = t;
    $("[data-modal-tariff]").textContent = t.name;
    const now = fmtPrice(t.price);
    $("[data-modal-price]").textContent = now ? now : "Стоимость уточняется — подтвердим при созвоне";
    consent.checked = false;
    payBtn.disabled = true;
    payBtn.textContent = (t.requestOnly || !t.payUrl) ? "Оставить заявку" : "Перейти к оплате";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-buy]");
    if (!b) return;
    const t = (S.tariffs || []).find((x) => x.id === b.dataset.buy);
    if (t) openModal(t);
  });
  $$("[data-modal-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  consent.addEventListener("change", () => { payBtn.disabled = !consent.checked; });
  payBtn.addEventListener("click", () => {
    if (!current || !consent.checked) return;
    const url = (!current.requestOnly && current.payUrl)
      ? current.payUrl
      : tgLink(`Здравствуйте! Хочу на программу «Собственник 2.0», тариф «${current.name}». С офертой ознакомлен(а).`);
    window.open(url, "_blank", "noopener");
    closeModal();
  });

  /* ---- Cookie ---- */
  const cookie = $("[data-cookie]");
  if (cookie && !localStorage.getItem("cookie_ok")) {
    cookie.hidden = false;
    $("[data-cookie-ok]").addEventListener("click", () => {
      localStorage.setItem("cookie_ok", "1");
      cookie.hidden = true;
    });
  }
})();
