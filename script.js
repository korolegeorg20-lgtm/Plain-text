"use strict";

const serviceNames = {
  express: "Экспресс-мойка",
  complex: "Комплексная мойка",
  interior: "Химчистка салона",
  detailing: "Детейлинг",
  polish: "Полировка",
  coating: "Защитное покрытие"
};

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Открыть меню");
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "Закрыть меню" : "Открыть меню");
  navigation.classList.toggle("open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

navLinks.forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => {
  if (window.innerWidth > 780) closeMenu();
});

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 24);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -30px" });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  revealObserver.observe(element);
});

const sections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-35% 0px -55%", threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

const vehicleRadios = [...document.querySelectorAll('input[name="vehicle"]')];
const serviceChecks = [...document.querySelectorAll("#calculator-services input")];
const totalPrice = document.querySelector("#total-price");

function calculateTotal() {
  const multiplier = Number(document.querySelector('input[name="vehicle"]:checked').value);
  const subtotal = serviceChecks
    .filter((checkbox) => checkbox.checked)
    .reduce((sum, checkbox) => sum + Number(checkbox.dataset.price), 0);
  totalPrice.textContent = money.format(Math.round(subtotal * multiplier / 100) * 100);
  return { total: Math.round(subtotal * multiplier / 100) * 100, selected: serviceChecks.filter((item) => item.checked).map((item) => item.value) };
}

vehicleRadios.forEach((radio) => radio.addEventListener("change", () => {
  document.querySelectorAll(".vehicle-option").forEach((option) => option.classList.remove("active"));
  radio.closest(".vehicle-option").classList.add("active");
  calculateTotal();
}));
serviceChecks.forEach((checkbox) => checkbox.addEventListener("change", calculateTotal));

function chooseService(service) {
  serviceChecks.forEach((checkbox) => { checkbox.checked = checkbox.value === service; });
  calculateTotal();
  document.querySelector("#calculator").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll(".choose-service").forEach((button) => {
  button.addEventListener("click", () => chooseService(button.closest(".service-card").dataset.service));
});

document.querySelector("#calculator-book").addEventListener("click", () => {
  const { selected } = calculateTotal();
  const formService = document.querySelector('#booking-form select[name="service"]');
  if (selected.length) formService.value = selected[0];
  document.querySelector("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => document.querySelector('#booking-form input[name="name"]').focus({ preventScroll: true }), 650);
});

const range = document.querySelector("#ba-range");
const afterLayer = document.querySelector("#ba-after");
const afterImage = afterLayer.querySelector("img");
const comparison = document.querySelector("#before-after");
const handle = document.querySelector("#ba-handle");

function updateComparison() {
  const value = `${range.value}%`;
  afterLayer.style.width = value;
  handle.style.left = value;
  afterImage.style.width = `${comparison.clientWidth}px`;
}
range.addEventListener("input", updateComparison);
window.addEventListener("resize", updateComparison);
updateComparison();

const bookingForm = document.querySelector("#booking-form");
const phoneInput = bookingForm.elements.phone;
const dateInput = bookingForm.elements.date;
const toast = document.querySelector("#toast");
let toastTimer;

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const maxDate = new Date();
maxDate.setMonth(maxDate.getMonth() + 3);
const toDateValue = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
dateInput.min = toDateValue(tomorrow);
dateInput.max = toDateValue(maxDate);

phoneInput.addEventListener("input", () => {
  const digits = phoneInput.value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  const normalized = digits.startsWith("7") ? digits : `7${digits}`;
  let formatted = "+7";
  if (normalized.length > 1) formatted += ` (${normalized.slice(1, 4)}`;
  if (normalized.length >= 4) formatted += ")";
  if (normalized.length > 4) formatted += ` ${normalized.slice(4, 7)}`;
  if (normalized.length > 7) formatted += `-${normalized.slice(7, 9)}`;
  if (normalized.length > 9) formatted += `-${normalized.slice(9, 11)}`;
  phoneInput.value = formatted;
});

function fieldMessage(field) {
  if (field.validity.valueMissing) return "Заполните это поле";
  if (field.validity.tooShort) return "Введите минимум 2 символа";
  if (field.name === "phone" && field.value.replace(/\D/g, "").length !== 11) return "Введите телефон полностью";
  if (field.validity.rangeUnderflow) return "Выберите будущую дату";
  return "Проверьте значение";
}

function validateField(field) {
  const phoneInvalid = field.name === "phone" && field.value.replace(/\D/g, "").length !== 11;
  const valid = field.checkValidity() && !phoneInvalid;
  field.classList.toggle("invalid", !valid);
  const error = field.closest("label")?.querySelector(".error-text");
  if (error) error.textContent = valid ? "" : fieldMessage(field);
  return valid;
}

bookingForm.querySelectorAll("input:not([type=checkbox]), select").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.classList.contains("invalid")) validateField(field);
  });
});

function showToast() {
  clearTimeout(toastTimer);
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 6500);
}
toast.querySelector("button").addEventListener("click", () => toast.classList.remove("show"));

// Точка подключения реального API: замените тело функции на fetch() к CRM,
// Telegram-боту или собственному backend. Структура payload уже готова.
async function submitBooking(payload) {
  console.info("Демонстрационная заявка:", payload);
  await new Promise((resolve) => window.setTimeout(resolve, 650));
  return { ok: true };
}

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fields = [...bookingForm.querySelectorAll("input:not([type=checkbox]), select")];
  const fieldsValid = fields.every(validateField);
  const consent = bookingForm.elements.consent;
  consent.closest("label").classList.toggle("invalid", !consent.checked);
  if (!fieldsValid || !consent.checked) {
    bookingForm.querySelector(".invalid")?.focus();
    return;
  }

  const button = bookingForm.querySelector("button[type=submit]");
  const originalText = button.innerHTML;
  button.disabled = true;
  button.textContent = "Отправляем…";
  const payload = Object.fromEntries(new FormData(bookingForm).entries());

  try {
    const result = await submitBooking(payload);
    if (!result.ok) throw new Error("Booking failed");
    bookingForm.reset();
    showToast();
  } catch {
    alert("Не удалось отправить заявку. Пожалуйста, попробуйте ещё раз.");
  } finally {
    button.disabled = false;
    button.innerHTML = originalText;
  }
});

document.querySelectorAll("[data-demo-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    toast.querySelector("strong").textContent = "Демонстрационная ссылка";
    toast.querySelector("p").textContent = "Перед публикацией сюда добавляется реальная ссылка компании.";
    showToast();
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();
calculateTotal();
