// Start button functionality
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});

// 1. Intersection Observer for fade/slide-in animations
const sections = document.querySelectorAll('.section');
const observer = new window.IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
sections.forEach(section => observer.observe(section));

// Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    parallaxLayers.forEach(layer => {
        const speed = layer.getAttribute('data-speed') || 0.5;
        const yPos = -(scrolled * speed);
        layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
});

// 2. Dynamic background color changes at section boundaries
const colorSections = [
  { id: 'hero', color: '#0f1021' },
  { id: 'about', color: '#1a1b3a' },
  { id: 'whyweb', color: '#23234b' },  // Fixed ID
  { id: 'showcase', color: '#181a2b' },
  { id: 'arcade', color: '#0f1021' },
  { id: 'contact', color: '#1a1b3a' }
];
window.addEventListener('scroll', () => {
  let current = colorSections[0].color;
  for (const section of colorSections) {
    const el = document.getElementById(section.id);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= window.innerHeight * 0.3) {
        current = section.color;
        break;
      }
    }
  }
  document.body.style.background = current;
});

// Smooth section transitions
const navLinks = document.querySelectorAll('.main-nav a');

// Intersection Observer for sections with enhanced animation handling
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Add visible class when entering viewport
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Update active nav link
            const currentSection = entry.target.id;
            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        } else {
            // Remove visible class when leaving viewport
            entry.target.classList.remove('visible');
        }
    });
}, { 
    threshold: 0.2, // Trigger when 20% of the section is visible
    rootMargin: '-10% 0px' // Adds a small buffer to prevent premature triggering
});

sections.forEach(section => sectionObserver.observe(section));

// Smooth scroll with dynamic background color transition
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add hover effect to showcase cards
const showcaseCards = document.querySelectorAll('.showcase-card');
showcaseCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (y - centerY) / 20;
        const angleY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.05, 1.05, 1.05)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// 4. Smooth anchor navigation for accessibility
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        target.focus({ preventScroll: true });
      }
    }
  });
});

// Typing effect for About section
const aboutText = "Hi! I'm Adaliz — combining global perspective from International Relations with a passion for web development. Through years of navigating fast-paced customer service environments, I've developed exceptional ability in solving complex problems under pressure. Now, I'm channeling that same drive as I develop my skills in HTML, CSS, and JavaScript, with the goal of building innovative solutions that bridge business needs and user experience.";

const aboutTyped = document.getElementById('about-typed');
let aboutIndex = 0;

function typeAbout() {
    if (aboutIndex < aboutText.length) {
        aboutTyped.textContent += aboutText[aboutIndex];
        aboutIndex++;
        const delay = aboutText[aboutIndex - 1] === '\n' ? 1000 : // Long pause after paragraphs
                     aboutText[aboutIndex - 1] === '.' ? 700 : // Longer pause after sentences
                     aboutText[aboutIndex - 1] === ',' ? 500 : // Medium pause after commas
                     30; // Normal typing speed
        setTimeout(typeAbout, delay);
    }
}

// Trigger typing when About section becomes visible
const aboutSection = document.getElementById('about');
const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && aboutTyped.textContent.length === 0) {
            typeAbout();
        }
    });
}, { threshold: 0.5 });
aboutObserver.observe(aboutSection);

// Why Web Dev section typing effect
const whyText = ` Switching into tech wasn't a random decision; it came from a growing curiosity and desire to build things.

Earlier this year, I began teaching myself HTML, CSS, and JavaScript through platforms like freeCodeCamp and Academia X. The more I learned about how the web works, the more excited I became about the logic, creativity, and problem-solving involved in web development. I haven't stopped since.

I believe it's the perfect place to continue learning, grow alongside others, and put into practice everything I've worked so hard to understand. Being part of a supportive team that values learning and purpose would be a huge step forward in my journey.`;

const whyTyped = document.getElementById('typing-text');
let whyIndex = 0;

function typeWhy() {
    if (whyIndex < whyText.length) {
        whyTyped.textContent += whyText[whyIndex];
        if (whyText[whyIndex] !== ' ' && whyText[whyIndex] !== ',' && whyText[whyIndex] !== '.') {
          
        }
        whyIndex++;
        const delay = whyText[whyIndex - 1] === '\n' ? 800 : // Long pause after paragraphs
                     whyText[whyIndex - 1] === '.' ? 500 : // Medium pause after sentences
                     whyText[whyIndex - 1] === ',' ? 200 : // Short pause after commas
                     50; // Normal typing speed
        setTimeout(typeWhy, delay);
    }
}

// Trigger typing for Why Web Dev section
const whySection = document.getElementById('whyweb');
const whyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && whyTyped.textContent.length === 0) {
            typeWhy();
        }
    });
}, { threshold: 0.5 });
whyObserver.observe(whySection); 