let config = null;
let photos = [];
let currentIndex = -1;
let timer = null;
let paused = false;
let showingA = true;
let priorityPhoto = null;

const stage = document.getElementById('stage');
const emptyState = document.getElementById('emptyState');
const photoA = document.getElementById('photoA');
const photoB = document.getElementById('photoB');
const badge = document.getElementById('badge');
const pauseBtn = document.getElementById('pauseBtn');

function shuffleIndex() {
  if (photos.length <= 1) return 0;
  let next = currentIndex;
  while (next === currentIndex) next = Math.floor(Math.random() * photos.length);
  return next;
}

function nextIndex() {
  if (!photos.length) return -1;
  if (config.playback === 'shuffle') return shuffleIndex();
  return (currentIndex + 1) % photos.length;
}

function setTransitionDuration() {
  const ms = Math.max(0, Number(config.transitionMs || 900));
  photoA.style.transitionDuration = `${ms}ms`;
  photoB.style.transitionDuration = `${ms}ms`;
}

function showPhoto(photo, isNew = false) {
  if (!photo) return;
  emptyState.classList.add('hidden');
  stage.classList.remove('hidden');

  const incoming = showingA ? photoB : photoA;
  const outgoing = showingA ? photoA : photoB;

  incoming.src = `${photo.url}?v=${Math.round(photo.mtimeMs)}`;
  incoming.onload = () => {
    incoming.classList.add('active');
    outgoing.classList.remove('active');
    showingA = !showingA;
  };

  if (config.showNewPhotoBadge && isNew) badge.classList.remove('hidden');
  else badge.classList.add('hidden');
}

function scheduleNext(duration) {
  clearTimeout(timer);
  if (paused || photos.length === 0) return;
  timer = setTimeout(() => {
    if (priorityPhoto) {
      const p = priorityPhoto;
      priorityPhoto = null;
      const idx = photos.findIndex(x => x.rel === p.rel);
      if (idx >= 0) currentIndex = idx;
      showPhoto(p, true);
      scheduleNext(Number(config.newPhotoDurationMs || 10000));
      return;
    }

    currentIndex = nextIndex();
    showPhoto(photos[currentIndex], false);
    scheduleNext(Number(config.slideDurationMs || 7000));
  }, duration);
}

function beginSlideshow() {
  if (!photos.length) {
    stage.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  currentIndex = config.playback === 'shuffle' ? Math.floor(Math.random() * photos.length) : 0;
  showPhoto(photos[currentIndex], false);
  scheduleNext(Number(config.slideDurationMs || 7000));
}

function showNewPhotoImmediately(photo) {
  const existing = photos.findIndex(p => p.rel === photo.rel);
  if (existing >= 0) photos[existing] = photo;
  else photos.push(photo);
  photos.sort((a, b) => a.mtimeMs - b.mtimeMs);

  currentIndex = photos.findIndex(p => p.rel === photo.rel);
  priorityPhoto = null;
  showPhoto(photo, true);
  scheduleNext(Number(config.newPhotoDurationMs || 10000));
}

async function init() {
  config = await fetch('/api/config').then(r => r.json());
  photos = await fetch('/api/photos').then(r => r.json());

  document.body.style.background = config.background || '#000000';
  stage.style.background = config.background || '#000000';
  photoA.style.objectFit = config.fit || 'contain';
  photoB.style.objectFit = config.fit || 'contain';
  document.getElementById('title').textContent = config.title || '';
  document.getElementById('subtitle').textContent = config.subtitle || '';
  document.getElementById('overlayTitle').textContent = config.title || '';
  document.getElementById('overlaySubtitle').textContent = config.subtitle || '';
  setTransitionDuration();
  beginSlideshow();

  const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const socket = new WebSocket(`${wsProtocol}//${location.host}`);
  socket.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'photo-added') showNewPhotoImmediately(msg.photo);
    if (msg.type === 'photo-removed') {
      photos = photos.filter(p => p.rel !== msg.rel);
      if (!photos.length) beginSlideshow();
    }
  };
}

document.getElementById('fullscreenBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (!photos.length) return;
  currentIndex = nextIndex();
  showPhoto(photos[currentIndex], false);
  scheduleNext(Number(config.slideDurationMs || 7000));
});

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if (paused) clearTimeout(timer);
  else scheduleNext(Number(config.slideDurationMs || 7000));
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' && photos.length) document.getElementById('nextBtn').click();
  if (e.key === ' ') {
    e.preventDefault();
    pauseBtn.click();
  }
  if (e.key.toLowerCase() === 'f') document.getElementById('fullscreenBtn').click();
});

init().catch(err => {
  console.error(err);
  document.querySelector('.hint').textContent = 'Could not start slideshow. Check the console window.';
});
