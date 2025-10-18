/* PARALLAX ON SCROLL - simple & efficient
       Layers with [data-parallax] and data-speed attribute move at different rates. */
(function () {
  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
  let lastScroll = window.scrollY;
  let ticking = false;

  function update() {
    const scrollY = window.scrollY || window.pageYOffset;
    parallaxEls.forEach((el) => {
      const speedAttr = el.getAttribute("data-speed") || 0;
      const speed = Number(speedAttr);
      // compute offset relative to center of viewport for subtle depth
      const rect = el.getBoundingClientRect();
      const offsetFromCenter =
        rect.top + rect.height / 2 - window.innerHeight / 2;
      const translateY = -offsetFromCenter * speed;
      el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  // initial call to position layers correctly
  update();

  // small mousemove parallax for character and blobs to feel responsive on large screens
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("mousemove", (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      document.querySelectorAll(".lights .blob").forEach((b, i) => {
        const intensity = 12 + i * 6;
        b.style.transform = `translate3d(${dx * intensity}px, ${
          dy * intensity
        }px, 0) scale(${1 + i * 0.02})`;
      });
      const char = document.querySelector(".character-wrap");
      if (char)
        char.style.transform = `translate3d(${dx * 18}px, ${dy * 10}px, 0)`;
    });
  }
})();

//skills section--------------------___________________________________________________________________-----------

/* ====== CUSTOM VARIABLE NAMES TO AVOID CONFLICT ====== */
const glowArea = document.querySelector(".glow-zone");
const glowCards = document.querySelectorAll(".glow-zone .glow-card");

/* ====== CONFIGURABLE SETTINGS ====== */
const glowRadius = 200; // 🔧 cursor effect radius
const trailCount = 30; // 🔧 number of dots
const trailSmooth = 0.2; // 🔧 smoothness (0.1–0.3)
const trailSizeStart = 150; // 🔧 biggest dot size
const trailSizeEnd = 3; // 🔧 smallest dot size
const tiltIntensity = 50; // 🔧 box tilt amount

/* ====== DATA STORAGE ====== */
let cardOffsets = Array.from(glowCards).map(() => ({ x: 0, y: 0 }));
let mousePosX = 0;
let mousePosY = 0;
let glowActive = false;

/* ====== CREATE TRAIL DOTS ====== */
const lightTrailDots = [];
for (let i = 0; i < trailCount; i++) {
  const newDot = document.createElement("div");
  newDot.classList.add("trail-light");
  glowArea.appendChild(newDot);
  lightTrailDots.push(newDot);
}

let trailPath = Array(trailCount).fill({ x: 0, y: 0 });

/* ====== MOUSE TRACKER ====== */
document.addEventListener("mousemove", (e) => {
  mousePosX = e.clientX;
  mousePosY = e.clientY;
});

/* ====== LINEAR INTERPOLATION ====== */
function lerpValue(start, end, amount) {
  return start + (end - start) * amount;
}

/* ====== ANIMATION LOOP ====== */
function runGlowAnimation() {
  glowCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const diffX = mousePosX - centerX;
    const diffY = mousePosY - centerY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

    // Proximity hover activation
    if (dist < glowRadius) {
      card.classList.add("glow-active");
    } else {
      card.classList.remove("glow-active");
    }

    const force = Math.max(0, 15 - dist / 80) * 2;
    const moveX = (diffX / dist) * force || 0;
    const moveY = (diffY / dist) * force || 0;
    cardOffsets[index].x = lerpValue(cardOffsets[index].x, moveX, 0.08);
    cardOffsets[index].y = lerpValue(cardOffsets[index].y, moveY, 0.08);

    const rotateY = ((diffX / window.innerWidth) * tiltIntensity).toFixed(2);
    const rotateX = ((-diffY / window.innerHeight) * tiltIntensity).toFixed(2);

    card.style.transform = `
            translate(${cardOffsets[index].x}px, ${cardOffsets[index].y}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
          `;
  });

  /* ====== TRAIL MOTION ====== */
  if (glowActive) {
    trailPath[0] = { x: mousePosX, y: mousePosY };
    for (let i = 1; i < trailCount; i++) {
      trailPath[i] = {
        x: lerpValue(trailPath[i].x, trailPath[i - 1].x, trailSmooth),
        y: lerpValue(trailPath[i].y, trailPath[i - 1].y, trailSmooth),
      };
    }

    lightTrailDots.forEach((dot, i) => {
      const { x, y } = trailPath[i];
      const size = lerpValue(
        trailSizeEnd,
        trailSizeStart,
        (trailCount - i) / trailCount
      );
      dot.style.setProperty("--light-size", `${size}px`);
      dot.style.transform = `translate(${x}px, ${y}px)`;
      dot.style.opacity = 1 - i / trailCount;
    });
  }

  requestAnimationFrame(runGlowAnimation);
}

runGlowAnimation();

/* ====== TRAIL VISIBILITY CONTROL ====== */
glowArea.addEventListener("mouseenter", () => {
  glowActive = true;
  lightTrailDots.forEach((dot) => (dot.style.opacity = 1));
});

glowArea.addEventListener("mouseleave", () => {
  glowActive = false;
  lightTrailDots.forEach((dot) => (dot.style.opacity = 0));
});

const glowIcons = document.querySelectorAll(".glow-zone .glow-icon");

// Apply fixed positions, scale, rotation
glowIcons.forEach((icon) => {
  const x = icon.dataset.posx;
  const y = icon.dataset.posy;
  const scale = icon.dataset.scale;
  const rotation = icon.dataset.rotate;

  icon.style.left = x + "%";
  icon.style.top = y + "%";
  icon.style.transform = `rotate(${rotation}deg) scale(${scale})`;
  icon.style.opacity = 1;
});

let iconOffsets = Array.from(glowIcons).map(() => ({ x: 0, y: 0 }));

function runIconAnimation() {
  glowIcons.forEach((icon, index) => {
    const rect = icon.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const diffX = mousePosX - centerX;
    const diffY = mousePosY - centerY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

    // Glow effect on proximity
    if (dist < glowRadius) {
      icon.classList.add("glow-active");
    } else {
      icon.classList.remove("glow-active");
    }

    const force = Math.max(0, 15 - dist / 80) * 2;
    const moveX = (diffX / dist) * force || 0;
    const moveY = (diffY / dist) * force || 0;
    iconOffsets[index].x = lerpValue(iconOffsets[index].x, moveX, 0.08);
    iconOffsets[index].y = lerpValue(iconOffsets[index].y, moveY, 0.08);

    const rotateY = ((diffX / window.innerWidth) * tiltIntensity).toFixed(2);
    const rotateX = ((-diffY / window.innerHeight) * tiltIntensity).toFixed(2);

    icon.style.transform = `
        translate(${iconOffsets[index].x}px, ${iconOffsets[index].y}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        rotate(${icon.dataset.rotate}deg)
        scale(${icon.dataset.scale})
      `;
  });

  requestAnimationFrame(runIconAnimation);
}

runIconAnimation();
// AI Images Cursor Animation
const aiCursor = document.getElementById("aiCursorCircle");
const aiShowcaseSection = document.getElementById("aiShowcase");

let mouseX = 0,
  mouseY = 0,
  cursorPosX = 0,
  cursorPosY = 0;

document.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

function animateCursor() {
  cursorPosX += (mouseX - cursorPosX) * 0.1; // smooth delay
  cursorPosY += (mouseY - cursorPosY) * 0.1;
  aiCursor.style.transform = `translate(${cursorPosX - 45}px, ${
    cursorPosY - 45
  }px)`; // center
  requestAnimationFrame(animateCursor);
}
animateCursor();

aiShowcaseSection.addEventListener("mouseenter", () => {
  aiCursor.style.opacity = 1;
});
aiShowcaseSection.addEventListener("mouseleave", () => {
  aiCursor.style.opacity = 0;
});

// AI Images Wiggle Animation
const shapes = document.querySelectorAll(".shape"); // all your shape divs
const maxRotation = 3; // max rotation in degrees
const maxTranslate = 5; // max movement in px
const durationMin = 1; // min duration of wiggle in seconds
const durationMax = 5; // max duration of wiggle in seconds

shapes.forEach((shape) => {
  const rotate = (Math.random() * maxRotation * 2 - maxRotation).toFixed(2);
  const translateX = (Math.random() * maxTranslate * 2 - maxTranslate).toFixed(
    2
  );
  const translateY = (Math.random() * maxTranslate * 2 - maxTranslate).toFixed(
    2
  );
  const duration = (
    Math.random() * (durationMax - durationMin) +
    durationMin
  ).toFixed(2);

  shape.style.animation = `wiggle ${duration}s ease-in-out infinite alternate`;
  shape.style.setProperty("--rotateAmount", rotate + "deg");
  shape.style.setProperty("--translateX", translateX + "px");
  shape.style.setProperty("--translateY", translateY + "px");
});
const contactCircle = document.getElementById("contactCircle");
const contactOverlay = document.getElementById("contactOverlay");

// Open card
contactCircle.addEventListener("click", () => {
  contactOverlay.classList.add("active");
});

// Close card when clicking outside
contactOverlay.addEventListener("click", (e) => {
  if (e.target === contactOverlay) {
    contactOverlay.classList.remove("active");
  }
});

const cube = document.getElementById("cube");

// Adjustable speed factor: increase = faster response, decrease = slower
let speedFactor = 0.5; // 🔧 change this to adjust speed

let lastMouseX = 0;
let lastMouseY = 0;
let rotationX = 0;
let rotationY = 0;
let speedX = 0;
let speedY = 0;

function lerp(start, end, t) {
  return start + (end - start) * t;
}

document.addEventListener("mousemove", (e) => {
  const deltaX = e.clientX - lastMouseX;
  const deltaY = e.clientY - lastMouseY;

  // Multiply delta by speed factor
  speedY = deltaX * speedFactor;
  speedX = -deltaY * speedFactor;

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

function animateCube() {
  rotationX = lerp(rotationX, rotationX + speedX, 0.1);
  rotationY = lerp(rotationY, rotationY + speedY, 0.1);

  cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;

  // Smooth stop
  speedX *= 0.92;
  speedY *= 0.92;

  requestAnimationFrame(animateCube);
}

animateCube();
