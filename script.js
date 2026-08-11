
document.addEventListener('DOMContentLoaded',()=>{
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav-links');
 const dropdowns=document.querySelectorAll('.nav-dropdown');
 if(toggle&&nav) toggle.addEventListener('click',e=>{e.stopPropagation();const open=nav.classList.toggle('open');toggle.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));});
 dropdowns.forEach(d=>{
  const b=d.querySelector('.nav-parent');
  b&&b.addEventListener('click',e=>{
   if(innerWidth<=760){e.preventDefault();e.stopPropagation();dropdowns.forEach(x=>{if(x!==d){x.classList.remove('open');x.querySelector('.nav-parent')?.setAttribute('aria-expanded','false')}});const o=d.classList.toggle('open');b.setAttribute('aria-expanded',String(o));}
  });
 });
 document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('open');toggle?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));
 document.addEventListener('click',e=>{if(!e.target.closest('.site-header')){nav?.classList.remove('open');toggle?.classList.remove('open');dropdowns.forEach(d=>d.classList.remove('open'));}});
 addEventListener('resize',()=>{if(innerWidth>760){nav?.classList.remove('open');toggle?.classList.remove('open');dropdowns.forEach(d=>d.classList.remove('open'));}});
 const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}}),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(x=>obs.observe(x));
 const top=document.querySelector('.to-top');
 addEventListener('scroll',()=>top?.classList.toggle('show',scrollY>500));
 top?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
 document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
});
