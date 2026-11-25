/* Aplica o tema salvo antes de a página aparecer e impede que o site seja embutido em outra página. */
(function(){
  try{ if(window.top!==window.self) window.top.location=window.self.location; }catch(e){ document.documentElement.style.display='none'; }
  try{ var m=localStorage.getItem('bra_theme'); if(m==='light'||m==='dark') document.documentElement.setAttribute('data-theme',m); }catch(e){}
})();
