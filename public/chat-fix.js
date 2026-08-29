(()=>{
  const applySingleFieldChat=()=>{
    if(document.getElementById('z-ai-single-field-fix'))return;
    const style=document.createElement('style');
    style.id='z-ai-single-field-fix';
    style.textContent=`
      .z-ai-dock.open .z-ai-bar{display:none!important}
      .z-ai-dock.open .z-ai-panel{bottom:0!important}
    `;
    document.head.appendChild(style);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applySingleFieldChat);
  else applySingleFieldChat();
})();
