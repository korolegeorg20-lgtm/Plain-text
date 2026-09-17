"use strict";

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".nav");
const bookingForm = document.querySelector("#booking-form");
const toast = document.querySelector("#toast");
const dateInput = bookingForm.querySelector('input[type="date"]');
let toastTimer;

function closeMenu() {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Открыть меню");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const shouldOpen = menuButton.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("open", shouldOpen);
  menuButton.setAttribute("aria-expanded", String(shouldOpen));
  menuButton.setAttribute("aria-label", shouldOpen ? "Закрыть меню" : "Открыть меню");
  document.body.classList.toggle("menu-open", shouldOpen);
});

document.querySelectorAll('.nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 720) closeMenu();
});

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.min = [
  tomorrow.getFullYear(),
  String(tomorrow.getMonth() + 1).padStart(2, "0"),
  String(tomorrow.getDate()).padStart(2, "0")
].join("-");

function hideToast() {
  toast.classList.remove("show");
}

function showToast() {
  window.clearTimeout(toastTimer);
  toast.classList.add("show");
  toastTimer = window.setTimeout(hideToast, 5500);
}

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }
  bookingForm.reset();
  showToast();
});

toast.querySelector("button").addEventListener("click", hideToast);
document.querySelector("#year").textContent = new Date().getFullYear();
