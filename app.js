'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const video = $('.hero-film');
const filmToggle = $('.film-toggle');
let userPaused = reduced.matches;
function setFilmState() {
  $('.film-label').textContent = video.paused ? 'Play film' : 'Pause film';
  $('.pause-symbol').textContent = video.paused ? '▷' : 'Ⅱ';
  filmToggle.setAttribute('aria-label', video.paused ? 'Play background film' : 'Pause background film');
}
if (reduced.matches) { video.removeAttribute('autoplay'); video.pause(); }
video.addEventListener('play', setFilmState);
video.addEventListener('pause', setFilmState);
filmToggle.addEventListener('click', () => {
  userPaused = !video.paused;
  if (video.paused) video.play().catch(setFilmState); else video.pause();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) video.pause();
  else if (!userPaused && !reduced.matches) video.play().catch(() => {});
});
new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) video.pause();
  else if (!userPaused && !reduced.matches && !document.hidden) video.play().catch(() => {});
}, {threshold: 0.05}).observe(video);
setFilmState();

// The base page remains visible without JavaScript; reveal classes are attached only after observer setup.
if (!reduced.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -25px 0px'});
  $$('[data-reveal]').forEach((el, i) => {
    el.classList.add('reveal-ready');
    el.style.transitionDelay = `${(i % 3) * 65}ms`;
    observer.observe(el);
  });
}

const mobileToggle = $('.mobile-toggle'), mobileNav = $('#mobile-nav'), header = $('#site-header');
function closeNav() { mobileNav.hidden = true; mobileToggle.setAttribute('aria-expanded', 'false'); mobileToggle.setAttribute('aria-label', 'Open navigation'); header.classList.remove('menu-open'); }
mobileToggle.addEventListener('click', () => {
  const open = mobileToggle.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = open;
  mobileToggle.setAttribute('aria-expanded', String(!open));
  mobileToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  header.classList.toggle('menu-open', !open);
});
$$('a',mobileNav).forEach(a => a.addEventListener('click',closeNav));
document.addEventListener('keydown',e => {if(e.key==='Escape' && !mobileNav.hidden){closeNav();mobileToggle.focus();}});
matchMedia('(min-width: 781px)').addEventListener('change',e => {if(e.matches)closeNav();});
let prevScroll = 0, scrollPending = false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const chapter = document.elementFromPoint(innerWidth / 2, 115)?.closest('.chapter');
    header.dataset.theme = y < 40 ? 'hero' : (chapter?.dataset.tone || 'light');
    header.classList.toggle('header-away', y > 320 && y > prevScroll && mobileNav.hidden);
    prevScroll = y; scrollPending = false;
  });
}, {passive:true});

const experiences = {
 dinner: {title:'Start with steak', text:'Rib eye, filet mignon, and weekend prime rib. Find your cut, then make it your evening.',detail:'Rib eye, 14 oz', value:'$78', image:'assets/table.webp',alt:'Dinner being served at Sterling',action:'Explore the menu',menu:'food'},
 cocktails: {title:'Make it a Sterling',text:'From the Allspice Old Fashion to the Sterling 75, a cocktail list with a character of its own.',detail:'Sterling Allspice Old Fashion',value:'$20',image:'assets/bar.webp',alt:'A bartender pouring a cocktail at Sterling',action:'Explore the drinks',menu:'drink'},
 gathering: {title:'Bring your people',text:'Anniversaries, birthdays, and company celebrations, with room to make the occasion your own.',detail:'Private gatherings',value:'Up to 275',image:'assets/friends.webp',alt:'Friends raising glasses together at Sterling',action:'Plan a gathering',inquiry:'party'}
};
function chooseEvening(name, focus=false) {
 const info=experiences[name];
 $$('.evening-tabs button').forEach(button => {
   const selected=button.dataset.evening===name;
   button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
   if(selected&&focus)button.focus();
 });
 $('#evening-panel').setAttribute('aria-labelledby',name==='gathering'?'gathering-tab':name+'-tab');
 $('#evening-photo').src=info.image;$('#evening-photo').alt=info.alt;
 const content=$('#evening-content');
 content.replaceChildren();
 const h=document.createElement('h3');h.textContent=info.title;
 const p=document.createElement('p');p.textContent=info.text;
 const detail=document.createElement('p');detail.className='evening-detail';detail.append(info.detail);const value=document.createElement('span');value.textContent=info.value;detail.append(value);
 const action=document.createElement(info.menu?'a':'button');action.className='button';action.id='evening-action';action.textContent=info.action;
 if(info.menu){action.href=sourceUrl(info.menu);action.dataset.menu=info.menu;}else{action.type='button';action.dataset.inquiry='party';}
 content.append(h,p,detail,action);
 content.classList.remove('switching');requestAnimationFrame(()=>content.classList.add('switching'));
}
$$('[data-evening]').forEach(button=>{
 button.addEventListener('click',()=>chooseEvening(button.dataset.evening));
 button.addEventListener('keydown',e=>{
  const tabs=$$('[data-evening]');let next=tabs.indexOf(button);
  if(e.key==='ArrowRight')next=(next+1)%tabs.length;else if(e.key==='ArrowLeft')next=(next+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;
  e.preventDefault();chooseEvening(tabs[next].dataset.evening,true);
 });
});

function openDialog(dialog) { closeNav();dialog.showModal();document.body.classList.add('modal-open'); }
$$('dialog').forEach(dialog=>{
 dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
});
$$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));

let menus=null, currentMenu='food';
const menuPromise=fetch('assets/menus.json').then(r=>{if(!r.ok)throw Error('menu unavailable');return r.json();}).then(data=>menus=data).catch(()=>null);
function sourceUrl(type){return `https://sterlingsteakandlounge.com/park-city-kimball-junction-sterling-steaks-and-lounge-${type}-menu`;}
function setMenuType(type,category='') {
 currentMenu=type;
 $$('[data-menu-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.menuType===type)));
 $('#menu-title').textContent=type==='food'?'The menu':'The drinks';
 $('#menu-source').href=sourceUrl(type);
 const select=$('#menu-category');select.replaceChildren();
 const all=document.createElement('option');all.value='';all.textContent='Everything';select.append(all);
 if(menus) [...new Set(menus[type].map(g=>g.menu))].forEach(name=>{const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option);});
 select.value=category;$('#menu-search').value='';renderMenu();
}
const notes={
 'Tapas':'Items marked ** are half price 4–6 PM, Sunday–Thursday.',
 'Appetizers':'Half salads $9.',
 'Entrées':'Add lobster tail $42, scallops $32, or shrimp $25.',
 'Sauces':'$8 per sauce.'
};
function renderMenu() {
 const container=$('#menu-results');container.replaceChildren();
 if(!menus){const p=document.createElement('p');p.className='menu-empty';p.textContent='The menu could not load. Use the link below to view Sterling’s current menu.';container.append(p);return;}
 const q=$('#menu-search').value.trim().toLowerCase(), category=$('#menu-category').value;
 let count=0;
 menus[currentMenu].filter(g=>!category||g.menu===category).forEach(group=>{
  const items=group.items.filter(item=>(item.name+' '+item.description+' '+group.name).toLowerCase().includes(q));
  if(!items.length)return;
  const section=document.createElement('section');section.className='menu-group';
  const title=document.createElement('h3');title.textContent=group.name;section.append(title);
  const note=document.createElement('p');note.textContent=group.menu+(currentMenu==='food'&&notes[group.name]?' · '+notes[group.name]:'');section.append(note);
  const list=document.createElement('div');list.className='menu-items';
  items.forEach(item=>{
   const article=document.createElement('article');article.className='menu-item';
   const top=document.createElement('div');top.className='menu-item-top';
   const name=document.createElement('h4');name.textContent=item.name;top.append(name);
   if(item.price){const price=document.createElement('span');price.className='menu-item-price';price.textContent=item.price;top.append(price);}
   article.append(top);
   if(item.description){const description=document.createElement('p');description.textContent=item.description;article.append(description);}
   list.append(article);count++;
  });
  section.append(list);container.append(section);
 });
 if(!count){const p=document.createElement('p');p.className='menu-empty';p.textContent='No matches. Try another dish or select Everything.';container.append(p);}
}
$$('[data-menu-type]').forEach(b=>b.addEventListener('click',()=>setMenuType(b.dataset.menuType)));
$('#menu-category').addEventListener('change',renderMenu);$('#menu-search').addEventListener('input',renderMenu);

document.addEventListener('click',async e=>{
 const menu=e.target.closest('[data-menu]');
 if(menu){e.preventDefault();openDialog($('#menu-dialog'));$('#menu-results').textContent='Loading the menu…';await menuPromise;setMenuType(menu.dataset.menu,menu.dataset.menuCategory||'');return;}
 const inquiry=e.target.closest('[data-inquiry]');
 if(inquiry){$('#inquiry-title').textContent=inquiry.dataset.inquiry==='catering'?'Let’s talk catering':'Your gathering';if(inquiry.dataset.inquiry==='catering')$('#inquiry-form [name=occasion]').value='Catering';else if($('#inquiry-form [name=occasion]').value==='Catering')$('#inquiry-form [name=occasion]').value='Birthday';$('#email-draft')?.remove();openDialog($('#inquiry-dialog'));return;}
 const photo=e.target.closest('[data-lightbox]');
 if(photo){$('#lightbox-image').src=photo.dataset.lightbox;$('#lightbox-image').alt=photo.querySelector('img').alt;$('#lightbox-caption').textContent=photo.dataset.caption;openDialog($('#photo-dialog'));}
});
const dateField=$('#inquiry-form [name=date]');const now=new Date();dateField.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
$('#inquiry-form').addEventListener('input',()=>$('#email-draft')?.remove());
$('#inquiry-form').addEventListener('submit',e=>{
 e.preventDefault();
 const values=new FormData(e.target);
 const subject=`${values.get('occasion')} inquiry — Sterling`;
 const body=`Hello Sterling team,\n\nI'd like to ask about a ${values.get('occasion').toLowerCase()} for ${values.get('guests')} guests on ${values.get('date')}.\n\n${values.get('notes')||''}\n\nPlease let me know about availability and options. Thank you!`;
 let draft=$('#email-draft');if(!draft){draft=document.createElement('a');draft.id='email-draft';draft.className='button button-dark';draft.textContent='Open email draft';e.target.append(draft);}
 draft.href=`mailto:jackson@sterlingsteakandlounge.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 draft.focus();
});

// Introduce the independently produced concept on each page visit. Native dialog supports Escape and focus trapping.
const welcomeDialog = $('#demo-welcome');
welcomeDialog.addEventListener('close', () => $('.wordmark').focus({preventScroll:true}));
openDialog(welcomeDialog);
