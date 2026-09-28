const $ = id => document.getElementById(id);
let settings, media=[], index=-1, timer, playToken=0;
let currentEl=$('photoA'), nextEl=$('photoB');
const videoEl=$('video');

function shuffledIndex(){ if(media.length<2)return 0; let n=Math.floor(Math.random()*media.length); if(n===index)n=(n+1)%media.length; return n; }
function hideVideo(){ videoEl.pause(); videoEl.removeAttribute('src'); videoEl.load(); videoEl.classList.remove('active'); }
function showImage(item){
  hideVideo(); $('empty').style.display='none';
  nextEl.onload=()=>{ currentEl.classList.remove('active'); nextEl.classList.add('active'); [currentEl,nextEl]=[nextEl,currentEl]; };
  nextEl.src=item.url+`?t=${item.mtimeMs||Date.now()}`;
}
function videoAllowed(item, done){
  const probe=document.createElement('video'); probe.preload='metadata';
  probe.onloadedmetadata=()=>{ const portrait=probe.videoHeight>probe.videoWidth; URL.revokeObjectURL?.(probe.src); done(settings.videoOrientation==='all'||(settings.videoOrientation==='portrait'&&portrait)||(settings.videoOrientation==='landscape'&&!portrait)); };
  probe.onerror=()=>done(false); probe.src=item.url;
}
function showVideo(item, finished){
  $('empty').style.display='none'; currentEl.classList.remove('active'); nextEl.classList.remove('active');
  videoEl.src=item.url; videoEl.currentTime=0; videoEl.classList.add('active');
  videoEl.onended=finished; videoEl.onerror=finished;
  const p=videoEl.play(); if(p&&p.catch)p.catch(finished);
}
function showItem(item, newItem=false){
  clearTimeout(timer); const token=++playToken;
  if(!item)return scheduleNormal();
  if(item.type==='video'){
    videoAllowed(item, allowed=>{
      if(token!==playToken)return;
      if(!allowed){ if(newItem)return scheduleNormal(); return advance(); }
      showVideo(item,()=>{ if(token===playToken)scheduleNormal(); });
    });
  } else {
    showImage(item);
    timer=setTimeout(()=>{ if(token===playToken)scheduleNormal(); },Math.max(1,newItem?settings.newPhotoSeconds:settings.durationSeconds)*1000);
  }
}
function advance(){
  clearTimeout(timer);
  if(!media.length){ timer=setTimeout(advance,1000); return; }
  index=settings.shuffle?shuffledIndex():(index+1)%media.length;
  showItem(media[index],false);
}
function scheduleNormal(){ clearTimeout(timer); timer=setTimeout(advance,100); }
async function init(){
  settings=await window.snapbooth.getSettings(); media=await window.snapbooth.listMedia();
  $('eventTitle').textContent=settings.eventTitle||''; $('eventSubtitle').textContent=settings.eventSubtitle||'';
  $('overlay').style.display=(settings.eventTitle||settings.eventSubtitle)?'block':'none';
  if(media.length){ index=settings.shuffle?shuffledIndex():0; showItem(media[index],false); } else scheduleNormal();
  window.snapbooth.onMediaAdded(item=>{
    media.push(item); media.sort((a,b)=>a.mtimeMs-b.mtimeMs); ++playToken; clearTimeout(timer); hideVideo(); showItem(item,true);
  });
}
$('back').addEventListener('click',()=>window.snapbooth.exitSlideshow());
window.addEventListener('keydown',e=>{if(e.key==='Escape')window.snapbooth.exitSlideshow();});
init();
