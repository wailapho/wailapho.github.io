// ── Mobile hamburger ──
var hamburger = document.getElementById('hamburger');
var mobileNav = document.getElementById('mobile-nav');

hamburger.addEventListener('click', function(e) {
  e.stopPropagation();
  var isOpen = mobileNav.classList.toggle('open');
  var spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

document.querySelectorAll('.mobile-link').forEach(function(link) {
  link.addEventListener('click', function() {
    mobileNav.classList.remove('open');
    var spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  });
});

document.addEventListener('click', function(e) {
  if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
    mobileNav.classList.remove('open');
    var spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

// ── Language dropdown ──
var langWrap     = document.getElementById('lang-wrap');
var langBtn      = document.getElementById('lang-btn');
var langDropdown = document.getElementById('lang-dropdown');

langBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  e.preventDefault();
  langWrap.classList.toggle('open');
});

langDropdown.querySelectorAll('a').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    var href = a.getAttribute('href');
    langWrap.classList.remove('open');
    setTimeout(function() { window.location.href = href; }, 50);
  });
});

document.addEventListener('click', function(e) {
  if (!langWrap.contains(e.target)) langWrap.classList.remove('open');
});

// ── Sticky shadow ──
var headerTop = document.getElementById('header-top');
window.addEventListener('scroll', function() {
  headerTop.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.5)' : 'none';
});

// ── Active nav on scroll ──
var sections = document.querySelectorAll('section[id], div[id="stats"]');
var navLinks = document.querySelectorAll('.nav-link[data-section]');
var OFFSET   = 140;

function setActive() {
  var current = '';
  sections.forEach(function(sec) {
    if (window.scrollY >= sec.offsetTop - OFFSET) current = sec.id;
  });
  navLinks.forEach(function(link) {
    link.classList.toggle('active', link.dataset.section === current);
  });
}
window.addEventListener('scroll', setActive, { passive: true });
setActive();

// ── Scroll-triggered reveal ──
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('#about, #services, #why, #stats, #quote, #contact').forEach(function(el) {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(22px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(el);
});
