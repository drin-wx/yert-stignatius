(() => {
  const MOVIES = window.CINEMA_MOVIES || [];
  // Add more accounts here when needed. This is a front-end booth demo, not a secure server authentication system.
  const USERS = [
    { username: 'admin_vp', password: 'admin@yert.org', name: 'Cinema Booth Admin' }
  ];
  // Each movie can have its own URL for every playback server.
  // Replace the empty strings with your authorized movie/server URLs.
  // Example: server links are stored in servers.js

  const $ = s => document.querySelector(s);
  const loginView = $('#loginView'), cinemaView = $('#cinemaView');
  const loginForm = $('#loginForm'), loginError = $('#loginError');
  const movieGrid = $('#movieGrid'), featureTrack = $('#featureTrack'), sliderDots = $('#sliderDots');
  const playerModal = $('#playerModal'), profileModal = $('#profileModal');
  let currentMovie = null, currentSlide = 0, sliderTimer = null;

  function escapeHtml(v) { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function posterFallback(title) { return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"><rect width="600" height="900" fill="#0d4d3d"/><circle cx="300" cy="280" r="170" fill="#83d63f" opacity=".18"/><text x="300" y="420" fill="white" font-family="Arial" font-size="40" text-anchor="middle">Y.E.R.T.</text><text x="300" y="480" fill="#83d63f" font-family="Arial" font-size="30" text-anchor="middle">${title.slice(0,26)}</text><text x="300" y="540" fill="white" opacity=".65" font-family="Arial" font-size="20" text-anchor="middle">ADD POSTER</text></svg>`)}`; }

  function setPosterFallback(img, title) { img.onerror = null; img.src = posterFallback(title); }
  function loginUser() { return sessionStorage.getItem('yertCinemaUser'); }
  function showCinema() { loginView.hidden = true; cinemaView.hidden = false; renderAll(); }
  function showLogin() { loginView.hidden = false; cinemaView.hidden = true; loginForm.reset(); loginError.classList.remove('show'); $('#username').focus(); }

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const u = $('#username').value.trim(), p = $('#password').value;
    const found = USERS.find(x => x.username === u && x.password === p);
    if (!found) { loginError.textContent = 'Incorrect username or password. Please check your login details and try again.'; loginError.classList.add('show'); $('#password').focus(); return; }
    loginError.classList.remove('show'); loginError.textContent='Incorrect username or password.'; sessionStorage.setItem('yertCinemaUser', found.username); sessionStorage.setItem('yertCinemaName', found.name); showCinema();
  });
  $('#logoutBtn').addEventListener('click', () => { sessionStorage.removeItem('yertCinemaUser'); sessionStorage.removeItem('yertCinemaName'); stopPlayback(); closePlayer(); showLogin(); });

  function renderAll() { renderFeatures(); renderMovies(); renderHistory(); loadProfile(); }
  function renderFeatures() {
    featureTrack.innerHTML = MOVIES.map(m => `<article class="feature-slide" style="background-image:url('${m.img}')"><div class="feature-content"><span class="quality-badge">4K</span><h2>${escapeHtml(m.title)}</h2><div class="feature-meta"><span>${m.year}</span><span>${escapeHtml(m.genre)}</span><span>${m.duration}</span><span>${m.rating}</span></div><p>${escapeHtml(m.desc)}</p><div class="hero-actions" style="margin-top:22px"><button class="btn btn-primary feature-play" data-id="${m.id}"><i class="fa-solid fa-play"></i> Play Movie</button></div></div></article>`).join('');
    sliderDots.innerHTML = MOVIES.map((m,i) => `<button class="slider-dot ${i===0?'active':''}" data-slide="${i}" aria-label="Slide ${i+1}"></button>`).join('');
    featureTrack.querySelectorAll('img').forEach(() => {});
    featureTrack.querySelectorAll('.feature-play').forEach(b => b.addEventListener('click', () => openPlayer(b.dataset.id)));
    sliderDots.querySelectorAll('button').forEach(b => b.addEventListener('click', () => goSlide(Number(b.dataset.slide))));
    featureTrack.querySelectorAll('.feature-slide').forEach((el,i) => { el.addEventListener('error',()=>{}); el.style.backgroundImage = `linear-gradient(90deg,rgba(4,24,19,.97),rgba(4,24,19,.2)),url("${MOVIES[i].img}")`; });
    goSlide(0,false); startSlider();
  }
  function goSlide(i, animate=true) { currentSlide = (i + MOVIES.length) % MOVIES.length; featureTrack.style.transition = animate ? '' : 'none'; featureTrack.style.transform = `translateX(-${currentSlide*100}%)`; sliderDots.querySelectorAll('.slider-dot').forEach((d,n)=>d.classList.toggle('active',n===currentSlide)); }
  function startSlider() { clearInterval(sliderTimer); sliderTimer=setInterval(()=>goSlide(currentSlide+1),6500); }
  $('#prevSlide').addEventListener('click',()=>{goSlide(currentSlide-1);startSlider()}); $('#nextSlide').addEventListener('click',()=>{goSlide(currentSlide+1);startSlider()});

  function renderMovies() {
    movieGrid.innerHTML = MOVIES.map(m => `<article class="movie-card" data-id="${m.id}"><div class="poster"><span class="quality-corner">4K</span><img src="${m.img}" alt="${escapeHtml(m.title)} poster" onerror="this.onerror=null;this.src='${posterFallback(m.title)}'"></div><div class="movie-info"><h3>${escapeHtml(m.title)}</h3><p>${m.year} • ${escapeHtml(m.genre)}</p></div></article>`).join('');
    movieGrid.querySelectorAll('.movie-card').forEach(c=>c.addEventListener('click',()=>openPlayer(c.dataset.id)));
  }

  function openPlayer(id) {
    currentMovie = MOVIES.find(m=>m.id===id); if(!currentMovie) return;
    $('#playerTitle').textContent=currentMovie.title; $('#detailTitle').textContent=currentMovie.title; $('#detailDesc').textContent=currentMovie.desc;
    $('#detailMeta').innerHTML=[currentMovie.year,currentMovie.genre,currentMovie.duration,currentMovie.rating,`Director: ${currentMovie.director}`].map(x=>`<span>${escapeHtml(x)}</span>`).join('');
    playerModal.classList.add('open'); playerModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    resetStage(); recordHistory(currentMovie.id);
  }
  function closePlayer(){ playerModal.classList.remove('open'); playerModal.setAttribute('aria-hidden','true'); stopPlayback(); document.body.style.overflow=''; }
  $('#closePlayer').addEventListener('click',closePlayer); playerModal.addEventListener('click',e=>{if(e.target===playerModal)closePlayer()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePlayer();closeProfile()}});

  function resetStage(){ $('#videoStage').classList.remove('is-playing'); $('#videoStage').innerHTML='<div class="empty-screen"><div><i class="fa-solid fa-clapperboard"></i><h3>Select a playback source</h3><p>Choose a server or a video file from the device.</p></div></div><div class="player-overlay-controls" aria-label="Video controls"><button id="back5Btn" title="Back 5 seconds"><i class="fa-solid fa-rotate-left"></i><span>5</span></button><button id="pauseBtn" title="Pause or play"><i class="fa-solid fa-pause"></i></button><button id="forward5Btn" title="Forward 5 seconds"><i class="fa-solid fa-rotate-right"></i><span>5</span></button></div>'; $('#serverStatus').textContent='No server selected'; document.querySelectorAll('.server-btn[data-server]').forEach(b=>b.classList.remove('active')); }
  function stopPlayback(){ const v=$('#videoStage video'); if(v){v.pause();v.removeAttribute('src');v.load();} $('#videoStage').querySelectorAll('iframe').forEach(x=>x.src='about:blank'); }
  function bindPlayerControls(){ const stage=$('#videoStage'), back=$('#back5Btn'), pause=$('#pauseBtn'), forward=$('#forward5Btn'); if(!stage||!back||!pause||!forward)return; const video=stage.querySelector('video'); if(!video)return; const seek=d=>{video.currentTime=Math.max(0,Math.min(video.duration||Infinity,video.currentTime+d));}; back.onclick=e=>{e.stopPropagation();seek(-5)}; forward.onclick=e=>{e.stopPropagation();seek(5)}; pause.onclick=e=>{e.stopPropagation(); if(video.paused){video.play();}else{video.pause();}}; video.addEventListener('play',()=>pause.innerHTML='<i class="fa-solid fa-pause"></i>'); video.addEventListener('pause',()=>pause.innerHTML='<i class="fa-solid fa-play"></i>'); stage.onclick=e=>{if(e.target===video){if(video.paused)video.play();else video.pause();}}; }
  function playSource(url,label){ if(!url){ resetStage(); $('#serverStatus').textContent=label+' — no link configured for this movie'; return; } stopPlayback(); const stage=$('#videoStage'); const lower=url.split('?')[0].toLowerCase(); if(/\.(mp4|webm|ogg|m4v)(\?|$)/i.test(url)){ const v=document.createElement('video'); v.controls=true; v.autoplay=true; v.playsInline=true; v.preload='metadata'; v.src=url; stage.querySelector('.empty-screen')?.remove(); stage.querySelector('.player-overlay-controls')?.remove(); stage.innerHTML=''; stage.appendChild(v); const controls=document.createElement('div'); controls.className='player-overlay-controls'; controls.innerHTML='<button id="back5Btn" title="Back 5 seconds"><i class="fa-solid fa-rotate-left"></i><span>5</span></button><button id="pauseBtn" title="Pause or play"><i class="fa-solid fa-pause"></i></button><button id="forward5Btn" title="Forward 5 seconds"><i class="fa-solid fa-rotate-right"></i><span>5</span></button>'; stage.appendChild(controls); stage.classList.add('is-playing'); bindPlayerControls(); } else { const f=document.createElement('iframe'); f.src=url; f.allow='autoplay; fullscreen; picture-in-picture'; f.allowFullscreen=true; f.setAttribute('referrerpolicy','no-referrer'); stage.innerHTML=''; stage.appendChild(f); stage.classList.add('is-playing'); } $('#serverStatus').textContent=label+' — playing in this tab'; }
  document.querySelectorAll('.server-btn[data-server]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.server-btn[data-server]').forEach(x=>x.classList.remove('active'));b.classList.add('active');playSource(window.CINEMA_SERVER_LINKS?.[currentMovie?.id]?.[b.dataset.server] || '',`Server ${b.dataset.server}`)}));
  $('#deviceFile').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;document.querySelectorAll('.server-btn[data-server]').forEach(x=>x.classList.remove('active'));stopPlayback();const stage=$('#videoStage');const v=document.createElement('video');v.controls=true;v.autoplay=true;v.playsInline=true;v.src=URL.createObjectURL(file);stage.innerHTML='';stage.appendChild(v);const controls=document.createElement('div');controls.className='player-overlay-controls';controls.innerHTML='<button id="back5Btn" title="Back 5 seconds"><i class="fa-solid fa-rotate-left"></i><span>5</span></button><button id="pauseBtn" title="Pause or play"><i class="fa-solid fa-pause"></i></button><button id="forward5Btn" title="Forward 5 seconds"><i class="fa-solid fa-rotate-right"></i><span>5</span></button>';stage.appendChild(controls);stage.classList.add('is-playing');bindPlayerControls();$('#serverStatus').textContent=`Device File — ${file.name}`;e.target.value='';});
  $('#fullscreenBtn').addEventListener('click',()=>{const el=$('.screen-panel');if(document.fullscreenElement)document.exitFullscreen();else el.requestFullscreen?.()}); document.addEventListener('fullscreenchange',()=>{const b=$('#fullscreenBtn');if(!b)return;b.innerHTML=document.fullscreenElement?'<i class="fa-solid fa-compress"></i> Exit Full Screen':'<i class="fa-solid fa-expand"></i> Full Screen';});

  function history(){try{return JSON.parse(localStorage.getItem('yertCinemaHistory')||'[]')}catch{return[]}}
  function recordHistory(id){let h=history().filter(x=>x!==id);h.unshift(id);localStorage.setItem('yertCinemaHistory',JSON.stringify(h.slice(0,8)));renderHistory();}
  function renderHistory(){const h=history().map(id=>MOVIES.find(m=>m.id===id)).filter(Boolean);const sec=$('#historySection'),row=$('#historyRow');if(!h.length){sec.style.display='none';return}sec.style.display='block';row.innerHTML=h.map(m=>`<article class="history-item" data-id="${m.id}"><div class="poster"><img src="${m.img}" alt="${escapeHtml(m.title)}" onerror="this.onerror=null;this.src='${posterFallback(m.title)}'"></div><div class="movie-info"><h3>${escapeHtml(m.title)}</h3></div></article>`).join('');row.querySelectorAll('.history-item').forEach(x=>x.addEventListener('click',()=>openPlayer(x.dataset.id)));}

  function loadProfile(){const p=JSON.parse(localStorage.getItem('yertCinemaProfile')||'{}');['Name','Section','Genre','Note'].forEach(k=>{const el=$('#profile'+k);if(el)el.value=p[k.toLowerCase()]||''});}
  function openProfile(){loadProfile();profileModal.classList.add('open');profileModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeProfile(){profileModal.classList.remove('open');profileModal.setAttribute('aria-hidden','true');if(!playerModal.classList.contains('open'))document.body.style.overflow=''}
  $('#profileBtn').addEventListener('click',openProfile); $('#closeProfile').addEventListener('click',closeProfile); $('#cancelProfile').addEventListener('click',closeProfile); profileModal.addEventListener('click',e=>{if(e.target===profileModal)closeProfile()});
  $('#saveProfile').addEventListener('click',()=>{localStorage.setItem('yertCinemaProfile',JSON.stringify({name:$('#profileName').value,section:$('#profileSection').value,genre:$('#profileGenre').value,note:$('#profileNote').value}));closeProfile()});

  if(loginUser()) showCinema(); else showLogin();
})();
