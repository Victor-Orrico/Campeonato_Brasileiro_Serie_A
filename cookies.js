/* Aviso de cookies do site Brasileirão Série A.
 * - Guarda a escolha no navegador (localStorage, chave "bra_consent") com a data.
 * - Categorias: "necessário" (sempre ativo) e "publicidade" (só com consentimento).
 * - Para ligar anúncios depois: defina window.braLoadAds = function(){ ...carrega o script do AdSense... }
 *   Ela só é chamada quando o visitante permitiu publicidade (agora e nas próximas visitas).
 * - Evento: document.addEventListener('bra-consent', e => e.detail.ads) dispara a cada escolha.
 * - Para reabrir: qualquer link/botão com o atributo data-cookie-prefs, ou window.braConsent.open().
 */
(function () {
  'use strict';
  var KEY = 'bra_consent', VER = 1, box = null, ads = null, det = null, bCfg = null, bSave = null, hasChoice = false;

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); if (v && v.v === VER) return v; } catch (e) {}
    return null;
  }
  function write(a) {
    var c = { v: VER, ads: !!a, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }
  function apply(c) {
    try { document.dispatchEvent(new CustomEvent('bra-consent', { detail: { ads: !!c.ads } })); } catch (e) {}
    if (c.ads && typeof window.braLoadAds === 'function') { try { window.braLoadAds(); } catch (e) {} }
  }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function css() {
    var s = document.createElement('style');
    s.textContent =
      '.ck{position:fixed;left:12px;right:12px;bottom:12px;z-index:200;max-width:760px;margin:0 auto;background:var(--card,#fff);color:var(--fg,#18221d);border:1px solid var(--line,#e3e9e5);border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.28);padding:16px 18px;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
      '.ck[hidden]{display:none}.ck b.t{display:block;font-size:16px;margin-bottom:4px}.ck p{margin:0 0 10px}.ck a{color:var(--acc,#0e6f7e)}' +
      '.ck-btns{display:flex;flex-wrap:wrap;gap:8px}' +
      '.ck button{font:inherit;font-weight:600;padding:10px 16px;border-radius:10px;border:1px solid var(--acc,#0e6f7e);cursor:pointer;min-height:44px}' +
      '.ck .ck-b{background:var(--acc,#0e6f7e);color:var(--on,#fff)}.ck .ck-o{background:transparent;color:var(--acc,#0e6f7e)}' +
      '.ck button:focus-visible,.ck input:focus-visible{outline:3px solid var(--acc,#0e6f7e);outline-offset:2px}' +
      '.ck-det{margin:6px 0 12px;border:1px solid var(--line,#e3e9e5);border-radius:10px;overflow:hidden}.ck-det[hidden]{display:none}' +
      '.ck-row{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:10px 12px}.ck-row+.ck-row{border-top:1px solid var(--line,#e3e9e5)}' +
      '.ck-row small{display:block;color:var(--mut,#5a675f);font-size:13px}.ck-row input{width:22px;height:22px;flex:none}' +
      '@media(max-width:560px){.ck{left:8px;right:8px;bottom:8px;padding:14px}.ck-btns button{flex:1 1 100%}}' +
      '@media print{.ck{display:none}}';
    document.head.appendChild(s);
  }
  function build() {
    if (box) return;
    css();
    ads = h('input', { type: 'checkbox', id: 'ck-ads' });
    var always = h('input', { type: 'checkbox', checked: 'checked', disabled: 'disabled', 'aria-label': 'Necessário (sempre ativo)' });
    det = h('div', { class: 'ck-det' }, [
      h('label', { class: 'ck-row' }, [h('span', {}, [h('b', { text: 'Necessário' }), h('small', { text: 'Tema, cópia dos dados do campeonato e modo offline. Sempre ativo.' })]), always]),
      h('label', { class: 'ck-row' }, [h('span', {}, [h('b', { text: 'Publicidade' }), h('small', { text: 'Cookies do Google AdSense e de parceiros para exibir e personalizar anúncios.' })]), ads])
    ]);
    det.hidden = true;
    var bAll = h('button', { type: 'button', class: 'ck-b', text: 'Aceitar todos' });
    var bNone = h('button', { type: 'button', class: 'ck-b', text: 'Só o necessário' });
    bCfg = h('button', { type: 'button', class: 'ck-o', text: 'Personalizar' });
    bSave = h('button', { type: 'button', class: 'ck-b', text: 'Salvar escolha' });
    bSave.hidden = true;
    bAll.addEventListener('click', function () { decide(true); });
    bNone.addEventListener('click', function () { decide(false); });
    bCfg.addEventListener('click', function () { det.hidden = false; bSave.hidden = false; bCfg.hidden = true; });
    bSave.addEventListener('click', function () { decide(ads.checked); });
    var link = h('a', { href: 'privacidade.html', text: 'Política de privacidade' });
    box = h('div', { class: 'ck', role: 'dialog', 'aria-label': 'Aviso de cookies', 'aria-describedby': 'ck-d', id: 'ck' }, [
      h('b', { class: 't', text: 'Cookies e privacidade' }),
      h('p', { id: 'ck-d' }, [
        'Este site usa o armazenamento do seu navegador para lembrar o tema e guardar os dados do campeonato (necessário para funcionar). Se você permitir, o Google e outros parceiros de publicidade também poderão usar cookies para exibir e personalizar anúncios. Você pode mudar a escolha quando quiser em “Preferências de cookies”, no rodapé. Saiba mais na ', link, '.'
      ]),
      det,
      h('div', { class: 'ck-btns' }, [bAll, bNone, bCfg, bSave])
    ]);
    box.hidden = true;
    document.body.appendChild(box);
  }
  function hide() { if (box) box.hidden = true; }
  function decide(v) { var c = write(v); hasChoice = true; apply(c); hide(); }
  function open(fromUser) {
    build();
    var c = read();
    ads.checked = !!(c && c.ads);
    det.hidden = true; bSave.hidden = true; bCfg.hidden = false;
    if (fromUser && c) { det.hidden = false; bSave.hidden = false; bCfg.hidden = true; }
    box.hidden = false;
    if (fromUser) { try { box.querySelector('button').focus(); } catch (e) {} }
  }
  var api = window.braConsent = {
    get: function () { var c = read(); return c ? { ads: c.ads, ts: c.ts } : null; },
    open: function () { open(true); }
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('[data-cookie-prefs]');
    if (a) { e.preventDefault(); open(true); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hasChoice) hide(); });
  function init() {
    var c = read();
    if (c) { hasChoice = true; apply(c); } else { open(false); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
