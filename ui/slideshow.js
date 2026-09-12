const $ = id => document.getElementById(id);
let settings;
let photos = [];
let index = -1;
let timer;
let currentEl = $('photoA');
let nextEl = $('photoB');

function shuffledIndex(){
  if (photos.length < 2) return 0;
  let n = Math.floor(Math.random() * photos.length);
  if (n === index) n = (n + 1) % photos.length;
  return n;
}

function show(photo){
  if (!photo) return;
  $('empty').style.display = 'none';
  nextEl.onload = () => {
    currentEl.classList.remove('active');
    nextEl.classList.add('active');
    [currentEl, nextEl] = [nextEl, currentEl];
  };
  nextEl.src = photo.url + `?t=${photo.mtimeMs || Date.now()}`;
}

function scheduleNormal(){
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (!photos.length) return scheduleNormal();
    index = settings.shuffle ? shuffledIndex() : (index + 1) % photos.length;
    show(photos[index]);
    scheduleNormal();
  }, Math.max(1, settings.durationSeconds) * 1000);
}

async function init(){
  settings = await window.snapbooth.getSettings();
  photos = await window.snapbooth.listPhotos();
  $('eventTitle').textContent = settings.eventTitle || '';
  $('eventSubtitle').textContent = settings.eventSubtitle || '';
  $('overlay').style.display = (settings.eventTitle || settings.eventSubtitle) ? 'block' : 'none';

  if (photos.length){
    index = settings.shuffle ? shuffledIndex() : 0;
    show(photos[index]);
  }
  scheduleNormal();

  window.snapbooth.onPhotoAdded(photo => {
    photos.push(photo);
    photos.sort((a,b) => a.mtimeMs - b.mtimeMs);
    clearTimeout(timer);
    show(photo);
    timer = setTimeout(() => {
      scheduleNormal();
    }, Math.max(1, settings.newPhotoSeconds) * 1000);
  });
}

$('back').addEventListener('click', () => window.snapbooth.exitSlideshow());
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') window.snapbooth.exitSlideshow();
});

init();
