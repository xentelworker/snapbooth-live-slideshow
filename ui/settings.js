const $ = id => document.getElementById(id);

function collect(){
  return {
    watchFolder: $('watchFolder').value.trim(),
    durationSeconds: Number($('durationSeconds').value || 7),
    newPhotoSeconds: Number($('newPhotoSeconds').value || 10),
    shuffle: $('shuffle').value === 'true',
    watchSubfolders: $('watchSubfolders').checked,
    fullscreen: $('fullscreen').checked,
    displayIndex: Number($('displayIndex').value || 0),
    eventTitle: $('eventTitle').value.trim(),
    eventSubtitle: $('eventSubtitle').value.trim()
  };
}

function showStatus(message, error=false){
  const el = $('status');
  el.textContent = message;
  el.className = error ? 'status error' : 'status';
}

(async function init(){
  const settings = await window.snapbooth.getSettings();
  $('watchFolder').value = settings.watchFolder || '';
  $('durationSeconds').value = settings.durationSeconds || 7;
  $('newPhotoSeconds').value = settings.newPhotoSeconds || 10;
  $('shuffle').value = String(Boolean(settings.shuffle));
  $('watchSubfolders').checked = settings.watchSubfolders !== false;
  $('fullscreen').checked = settings.fullscreen !== false;
  $('eventTitle').value = settings.eventTitle || '';
  $('eventSubtitle').value = settings.eventSubtitle || '';

  const displays = await window.snapbooth.getDisplays();
  $('displayIndex').innerHTML = displays.map(d => `<option value="${d.index}">${d.label}${d.primary ? ' (Primary)' : ''}</option>`).join('');
  $('displayIndex').value = String(settings.displayIndex || 0);
})();

$('browse').addEventListener('click', async () => {
  const folder = await window.snapbooth.chooseFolder();
  if (folder) $('watchFolder').value = folder;
});

$('save').addEventListener('click', async () => {
  const settings = collect();
  if (!settings.watchFolder) return showStatus('Choose a photo folder first.', true);
  await window.snapbooth.saveSettings(settings);
  showStatus('Settings saved.');
});

$('start').addEventListener('click', async () => {
  const settings = collect();
  if (!settings.watchFolder) return showStatus('Choose a photo folder first.', true);
  showStatus('Starting slideshow...');
  await window.snapbooth.openSlideshow(settings);
});
