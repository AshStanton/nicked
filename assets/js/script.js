// ============================================
// script.js – Nicked
// Mobile menu toggle, smooth scroll, form handler
// ============================================

// ----- 1. MOBILE MENU TOGGLE -----
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('nav-menu');

menuToggle.addEventListener('click', function () {
  const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
  this.setAttribute('aria-expanded', expanded);
  navMenu.classList.toggle('open');
});

// Close menu when a link is clicked (better UX)
navMenu.addEventListener('click', function (e) {
  if (e.target.tagName === 'A') {
    menuToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
  }
});

// ----- 2. SMOOTH SCROLL for anchor links -----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ----- 3. CONTACT FORM (dummy submission) -----
const form = document.querySelector('.contact-form');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  if (!name || !email) {
    alert('Please fill in your name and email.');
    return;
  }
  alert('Thank you for your message! We\'ll be in touch soon.');
  form.reset();
});

// ----- 4. AUTO-UPDATE COPYRIGHT YEAR -----
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
