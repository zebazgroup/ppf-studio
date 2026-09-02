(()=>{
  const root=document.getElementById('carsSettings');
  const toggle=document.getElementById('carsSettingsToggle');
  const menu=document.getElementById('carsSettingsMenu');
  if(!root||!toggle||!menu)return;
  const close=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false')};
  const open=()=>{menu.hidden=false;toggle.setAttribute('aria-expanded','true')};
  toggle.addEventListener('click',e=>{e.stopPropagation();menu.hidden?open():close()});
  menu.querySelector('.c-settings-close')?.addEventListener('click',close);
  document.addEventListener('click',e=>{if(!root.contains(e.target))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  menu.querySelector('[data-lang-select]')?.addEventListener('change',e=>window.ZebazLang?.set(e.target.value));
  menu.querySelectorAll('[data-theme-mode]').forEach(button=>button.addEventListener('click',()=>window.ZebazTheme?.set(button.dataset.themeMode)));
  const syncTheme=()=>{const mode=localStorage.getItem('zebaz-theme')||'system';menu.querySelectorAll('[data-theme-mode]').forEach(button=>button.classList.toggle('active',button.dataset.themeMode===mode))};
  const syncLang=()=>{const lang=localStorage.getItem('zebaz-lang')||'ku';const select=menu.querySelector('[data-lang-select]');if(select)select.value=lang};
  window.addEventListener('zebaz:theme',syncTheme);
  window.addEventListener('zebaz:lang',syncLang);
  syncTheme();syncLang();
})();
