/* Brasileirão em Números — lógica do site. Carregado por index.html (CSP: script-src 'self'). */
try{if(typeof window!=='undefined'&&window.top!==window.self)window.top.location=window.self.location}catch(e){document.documentElement.style.display='none'}
// ---- segurança: todo texto vindo de dados/URL é limpo ou escapado antes de entrar no HTML
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanName=s=>String(s==null?'':s).normalize('NFC').replace(/[^\p{L}\p{N} .\-]/gu,'').replace(/\s+/g,' ').trim().slice(0,40);
const cleanG=a=>Array.isArray(a)?a.map(g=>({y:+g.y,r:+g.r,d:String(g.d||'').slice(0,10),t:/^\d\d:\d\d$/.test(g.t||'')?g.t:'',h:cleanName(g.h),a:cleanName(g.a),hg:g.hg==null?null:+g.hg,ag:g.ag==null?null:+g.ag})).filter(g=>g.y>1900&&g.y<2200&&g.r>0&&g.r<100&&g.h&&g.a&&g.h!=g.a&&/^\d{4}-\d\d-\d\d$/.test(g.d)&&(g.hg==null||Number.isFinite(g.hg))&&(g.ag==null||Number.isFinite(g.ag))):[];

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let G=[],st={t:'c',m:'t',o:'r',cmp:false,hl:[],evt:false,race:false,ovl:false,tap:null,evr:null,fsIdx:null,scr:false,cols:false,fx:null,xk:null,xd:'d',sk:null,sd:'d',gr:null,tn:'t',sim:{},mc:null,rd:null};
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const AL={r:['rodada','round'],d:['data','date'],h:['mandante','home','time_mandante'],a:['visitante','away','time_visitante'],hg:['mandante_placar','gols_mandante','home_goals','mandante_gols'],ag:['visitante_placar','gols_visitante','away_goals','visitante_gols'],y:['ano_campeonato','ano','season','temporada'],t:['hora','horario','hour','kickoff']};
function csv(t){const l1=t.split('\n')[0],d=(l1.match(/;/g)||[]).length>(l1.match(/,/g)||[]).length?';':',';const rows=[];let r=[],c='',q=false;
for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==d){r.push(c);c=''}else if(ch=='\n'){r.push(c.replace(/\r$/,''));rows.push(r);r=[];c=''}else c+=ch}
if(c||r.length){r.push(c);rows.push(r)}return rows}
function iso(s){s=(s||'').trim();let m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?m[0]:''}
function load(text){const rows=csv(text);if(rows.length<2)throw Error('Arquivo vazio');const hd=rows[0].map(norm),ix={};
for(const k in AL){ix[k]=hd.findIndex(h=>AL[k].includes(h))}
for(const k of['r','d','h','a','hg','ag'])if(ix[k]<0)throw Error('Coluna não encontrada: '+AL[k][0]);
const out=[];for(const r of rows.slice(1)){if(r.length<hd.length-2)continue;const d=iso(r[ix.d]),rd=parseInt(r[ix.r]);if(!d||!rd)continue;
let y=ix.y>=0?parseInt(r[ix.y]):0;if(!y){y=+d.slice(0,4);if(y==2021&&+d.slice(5,7)<=2)y=2020}
const hg=r[ix.hg]===''?null:parseInt(r[ix.hg]),ag=r[ix.ag]===''?null:parseInt(r[ix.ag]);
out.push({y,r:rd,d,t:ix.t>=0&&/^\d{1,2}:\d{2}/.test((r[ix.t]||'').trim())?r[ix.t].trim().slice(0,5).padStart(5,'0'):'',h:cleanName(r[ix.h]),a:cleanName(r[ix.a]),hg:isNaN(hg)?null:hg,ag:isNaN(ag)?null:ag})}
out.splice(0,out.length,...out.filter(g=>g.h&&g.a&&g.h!=g.a));if(!out.length)throw Error('Nenhum jogo válido');return out}
function save(){try{localStorage.setItem('bra_g',JSON.stringify(G))}catch(e){$('#msg').textContent='Não foi possível salvar no navegador (os dados valem só nesta sessão).'}}
function init(){if(!G.length)return;$('#ld').classList.add('hide');$('#bnav').classList.remove('hide');$('#app').classList.remove('hide');$('#clr').classList.remove('hide');
const ys=[...new Set(G.map(g=>g.y))].sort((a,b)=>b-a);const def=[ys[0],ys.includes(2010)?2010:ys[1]];const o=ys.map(y=>`<option>${y}</option>`).join('');$('#sa').innerHTML=o;$('#chk').innerHTML=ys.map(y=>`<label><input type="checkbox" value="${y}" ${def.includes(y)?'checked':''}>${y}</label>`).join('');

{const asc=[...ys].reverse(),oa=asc.map(y=>`<option>${y}</option>`).join('');$('#hf').innerHTML=oa;$('#ht').innerHTML=oa;$('#ht').selectedIndex=asc.length-1;$('#sx').innerHTML='<option value="all">Todas as temporadas</option>'+ys.map(y=>`<option>${y}</option>`).join('');$('#sx').selectedIndex=1}
$('#msg').textContent=`${G.length} jogos • ${ys.length} temporadas (${ys[ys.length-1]}–${ys[0]})`;$('#tl').innerHTML=allTeams().map(t=>`<option value="${t}">`).join('');$('#srchs').innerHTML='<option value="">🔍 Buscar time…</option>'+allTeams().map(t=>`<option value="${t}">${t}</option>`).join('');applyHash();fillTeams();draw()}
function fillTeams(){const y=+$('#sa').value,t=[...new Set(G.filter(g=>g.y==y).flatMap(g=>[g.h,g.a]))].sort();$('#ft').innerHTML='<option value="">Todos</option>'+t.map(x=>`<option>${x}</option>`).join('')}
const TC=new Map();let TCG=null;
function table(y,X,m,tn='t',X0=0){if(TCG!==G){TC.clear();TCG=G}const k=y+'|'+X+'|'+m+'|'+tn+'|'+X0;let r=TC.get(k);if(!r){r=table0(y,X,m,tn,X0);TC.set(k,r)}return r}
function table0(y,X,m,tn='t',X0=0){const hf=halfOf(y);const T={};const get=n=>T[n]||(T[n]={n,P:0,J:0,V:0,E:0,D:0,GP:0,GC:0});
for(const g of G){if(g.y!=y||g.hg==null||g.ag==null||(X&&g.r>X)||(X0&&g.r<X0)||(tn=='1'&&g.r>hf)||(tn=='2'&&g.r<=hf))continue;
const sides=[[g.h,g.hg,g.ag,'h'],[g.a,g.ag,g.hg,'a']];for(const[n,f,c,s]of sides){if(m!='t'&&m!=s)continue;const t=get(n);t.J++;t.GP+=f;t.GC+=c;if(f>c){t.V++;t.P+=3}else if(f==c){t.E++;t.P++}else t.D++}}
const pn=penOn(y,X,m,tn,X0);
return Object.values(T).map(t=>{t.SG=t.GP-t.GC;for(const p of pn)if(nk(p.t)==nk(t.n)){t.P-=p.p;t.pen=(t.pen||0)+p.p}return t}).sort((a,b)=>b.P-a.P||b.V-a.V||b.SG-a.SG||b.GP-a.GP||a.n.localeCompare(b.n))}
let lastPanelPos={};
const dvf=(t,pv)=>{if(!pv)return'';const p=pv[nk(t.n)];if(!p)return'';const d=p-t.pos;return d>0?`<span class="dv up" title="Subiu ${d} posição(ões) em relação ao painel anterior">▲${d}</span>`:d<0?`<span class="dv dn2" title="Caiu ${-d} posição(ões) em relação ao painel anterior">▼${-d}</span>`:''};
function panel(y,pv){lastPanelPos={};const [X0,X]=rng(),m=st.m,zon=m=='t'&&st.tn=='t'&&!X0&&!X,srt=!!st.sk,rows=table(y,X,m,st.tn,X0),n=rows.length,hf=halfOf(y),tl=st.tn=='1'?` • 1º turno (rodadas 1–${hf})`:st.tn=='2'?` • 2º turno (rodadas ${hf+1}–${2*hf})`:'';
const mt={t:'Geral',h:'Só em casa',a:'Só fora'}[m];
if(!rows.length)return`<div class="card"><h2>${y}</h2><p class="mut">Nenhum jogo encontrado com os filtros escolhidos.</p><button data-clear="1">Limpar filtros</button></div>`;
return`<div class="card"><h2>${y} <span class="mut">${mt}${tl} • ${rtxt(X0,X)}</span><button class="mob colbtn" data-cols="1">${st.cols?'Menos colunas':'Mais colunas'}</button><button class="expb" data-exp="1" title="Baixar tabela em CSV">⬇ CSV</button></h2><div class="sc${st.cols?' allc':''}"><table class="ctab${pv?' cmpd':''}"><tr>${heads()}</tr>`+
ord(rows).map((t,ix)=>{const i=t.pos-1,zc=srt?'':(zon||zone(y,i,n)=='dn')?zone(y,i,n):'',kk=nk(t.n);lastPanelPos[kk]=t.pos;return`<tr class="${zc}${st.fx&&nk(st.fx)==kk?' fx':''}" data-k="${kk}"><td>${ix+1}${srt?'':dvf(t,pv)}</td><td class="t">${tb(t.n)}<span class="nm">${t.n}</span></td><td class="p">${t.P}${t.pen?'<sup title="Perdeu '+t.pen+' pts por punição">*</sup>':''}</td><td>${t.J}</td><td>${t.V}</td><td class="xc">${t.E}</td><td class="xc">${t.D}</td><td class="xc">${t.GP}</td><td class="xc">${t.GC}</td><td class="${sgc(t.SG)}">${t.SG>0?'+':''}${t.SG}</td><td class="xc">${ap(t)}</td></tr>`}).join('')+`</table></div>${(()=>{const lg=srt?'':leg(y,n,zon)+(zon?zl(y,n):'');return lg?`<div class="zl">${lg}</div>`:''})()}${penOn(y,X,m,st.tn,X0).length?`<div class="mut" style="margin-top:4px">* Punições: ${penOn(y,X,m,st.tn,X0).map(p=>`${p.t} −${p.p} pts (${p.m})`).join('; ')}.</div>`:''}</div>`}
function hist(){const [X0,X]=rng(),m=st.m,tn=st.tn,a=+$('#hf').value,b=+$('#ht').value,lo=Math.min(a,b),hi=Math.max(a,b);
const ys=[...new Set(G.map(g=>g.y))].filter(y=>y>=lo&&y<=hi).sort((p,q)=>p-q),T={};
for(const y of ys)for(const t of table(y,X,m,tn,X0)){const k=nk(t.n),o=T[k]||(T[k]={n:t.n,P:0,J:0,V:0,E:0,D:0,GP:0,GC:0,ys:0,pen:0});o.n=t.n;for(const f of['P','J','V','E','D','GP','GC'])o[f]+=t[f];o.pen+=t.pen||0;if(t.J)o.ys++}
const rows=Object.values(T).map(t=>(t.SG=t.GP-t.GC,t)).sort(cmpT);
const mt={t:'Geral',h:'Só em casa',a:'Só fora'}[m],tl=tn=='1'?' • 1º turno':tn=='2'?' • 2º turno':'';
return`<div class="card"><h2>Classificação histórica <span class="mut">${lo}–${hi} • ${mt}${tl} • ${rtxt(X0,X,1)}</span><button class="mob colbtn" data-cols="1">${st.cols?'Menos colunas':'Mais colunas'}</button><button class="expb" data-exp="1" title="Baixar tabela em CSV">⬇ CSV</button></h2><div class="sc${st.cols?' allc':''}"><table class="ctab"><tr>${heads()}${SH('ys','Temp.','xc')}</tr>`+
ord(rows).map((t,i)=>`<tr class="${st.fx&&nk(st.fx)==nk(t.n)?'fx':''}" data-k="${nk(t.n)}"><td>${i+1}</td><td class="t">${tb(t.n)}<span class="nm">${t.n}</span></td><td class="p">${t.P}${t.pen?'<sup title="Inclui punições">*</sup>':''}</td><td>${t.J}</td><td>${t.V}</td><td class="xc">${t.E}</td><td class="xc">${t.D}</td><td class="xc">${t.GP}</td><td class="xc">${t.GC}</td><td class="${sgc(t.SG)}">${t.SG>0?'+':''}${t.SG}</td><td class="xc">${ap(t)}</td><td class="xc">${t.ys}</td></tr>`).join('')+
`</table></div><div class="mut" style="margin-top:6px">Soma de todas as temporadas do período, incluindo a que está em andamento e as punições (*). Temp. = temporadas disputadas. Critérios: pontos, vitórias, saldo, gols pró. Times que mudaram de nome aparecem separados. Clique no título de uma coluna para ordenar; a coluna # acompanha a ordem escolhida.</div></div>`}
const SDEF=[['sv','Seq. vitórias',g=>g.f>g.c],['si','Seq. invicta',g=>g.f>=g.c],['sw','Seq. sem vencer',g=>g.f<=g.c],['sd','Seq. derrotas',g=>g.f<g.c],['sc','Seq. sem sofrer gol',g=>g.c==0],['sm','Seq. marcando gol',g=>g.f>0],['sn','Seq. sem marcar',g=>g.f==0],['ss','Seq. sofrendo gol',g=>g.c>0]];
const SX=(k,l,c='')=>`<th data-xk="${k}" class="srt ${c}${st.xk==k?' on':''}" tabindex="0" aria-sort="${st.xk==k?(st.xd=='a'?'ascending':'descending'):'none'}" title="Ordenar por esta coluna">${l}${st.xk==k?(st.xd=='a'?' ▲':' ▼'):'<span class="si" aria-hidden="true">↕</span>'}</th>`;
function sdata(sel){const [X0,X]=rng(),m=st.m,all=sel=='all',cross=all&&$('#sq').value=='c';
const gs=G.filter(g=>(all||g.y==sel)&&g.hg!=null&&g.ag!=null&&(!X||g.r<=X)&&(!X0||g.r>=X0)).sort((a,b)=>a.d.localeCompare(b.d)||(a.t||'').localeCompare(b.t||'')||a.r-b.r),L={},nm={};
for(const g of gs)for(const[n,f,c,sd,o]of[[g.h,g.hg,g.ag,'h',g.a],[g.a,g.ag,g.hg,'a',g.h]]){if(m!='t'&&m!=sd)continue;const k=nk(n);nm[k]=n;(L[k]=L[k]||[]).push({y:g.y,r:g.r,f,c,o})}
const run=(l,fn)=>{let b={n:0},cur=0,i0=0;l.forEach((g,i)=>{const p=l[i-1];if(cur&&p&&(cross?g.y-p.y>1:g.y!=p.y))cur=0;if(fn(g)){if(!cur)i0=i;cur++;if(cur>b.n)b={n:cur,a:l[i0],b:g}}else cur=0});return b};
const fmt=(a,b)=>{if(a.y==b.y){const t=a.r==b.r?`R${a.r}`:`R${a.r}–${b.r}`;return all?`${a.y} ${t}`:t}return`${a.y} R${a.r} – ${b.y} R${b.r}`};
const pos={},A={};for(const y of all?[...new Set(G.map(g=>g.y))]:[sel])for(const t of table(y,X,m,'t',X0)){const k=nk(t.n),o=A[k]||(A[k]={P:0,V:0,GP:0,GC:0});o.P+=t.P;o.V+=t.V;o.GP+=t.GP;o.GC+=t.GC}
Object.keys(A).sort((a,b)=>{const p=A[a],q=A[b];return q.P-p.P||q.V-p.V||(q.GP-q.GC)-(p.GP-p.GC)||q.GP-p.GP||a.localeCompare(b)}).forEach((k,i)=>pos[k]=i+1);
const rows=Object.keys(L).map(k=>{const l=L[k],r={n:nm[k],pos:pos[k]||999,J:l.length,ys:new Set(l.map(g=>g.y)).size};
for(const[q,,fn]of SDEF){const z=run(l,fn);r[q]=z.n;r[q+'t']=z.n?fmt(z.a,z.b):''}
let bw=null,bl=null;for(const g of l){if(g.f>g.c&&(!bw||g.f-g.c>bw.f-bw.c||g.f-g.c==bw.f-bw.c&&g.f>bw.f))bw=g;if(g.f<g.c&&(!bl||g.c-g.f>bl.c-bl.f||g.c-g.f==bl.c-bl.f&&g.c>bl.c))bl=g}
const y0=g=>all?g.y+' ':'';
r.bw=bw?bw.f-bw.c:0;r.bwt=bw?`${bw.f} x ${bw.c}`:'–';r.bwo=bw?`${y0(bw)}R${bw.r} vs ${bw.o}`:'';
r.bl=bl?bl.c-bl.f:0;r.blt=bl?`${bl.f} x ${bl.c}`:'–';r.blo=bl?`${y0(bl)}R${bl.r} vs ${bl.o}`:'';
return r});
return{rows,all,cross,X0,X,m}}
function stats(sel){const{rows,all,cross,X0,X,m}=sdata(sel);
let out=rows.sort((a,b)=>a.pos-b.pos||a.n.localeCompare(b.n));if(st.fx)out=out.filter(r=>nk(r.n)==nk(st.fx));
if(!out.length)return`<div class="card"><h2>Estatísticas</h2><p class="mut">Nenhum jogo encontrado com os filtros escolhidos.</p><button data-clear="1">Limpar filtros</button></div>`;
if(st.xk){const k=st.xk,d=st.xd=='a'?1:-1;out=[...out].sort((a,b)=>{const x=a[k],z=b[k],c=typeof x=='string'?x.localeCompare(z):x-z;return d*c||a.n.localeCompare(b.n)})}
const best={};for(const k of[...SDEF.map(d=>d[0]),'bw','bl'])best[k]=Math.max(0,...rows.map(r=>r[k]));
const cell=k=>r=>`<td class="${r[k]&&r[k]==best[k]?'best':''}" title="${r[k+'t']?'Ocorreu em '+r[k+'t']:''}">${r[k]}</td>`;
const cols=SDEF.map(d=>cell(d[0])),mt={t:'Geral',h:'Só em casa',a:'Só fora'}[m];
const sub=all?(cross?' • sequências contínuas entre temporadas':' • sequências dentro de cada temporada'):'';
return`<div class="card"><h2>Estatísticas ${all?'– todas as temporadas':sel} <span class="mut">${mt} • ${rtxt(X0,X,all)}${sub}${st.fx?' • só '+esc(st.fx):''}</span>${st.xk?'<button data-rst="1" class="rstb" title="Voltar à ordem da classificação">↺ Ordem normal (classificação)</button>':''}<button class="expb" data-exp="1" title="Baixar tabela em CSV">⬇ CSV</button></h2><div class="sc"><table class="stk"><tr><th>#</th>${SX('n','Time','t')}${SDEF.map(d=>SX(d[0],d[1])).join('')}${SX('bw','Maior vitória')}${SX('bl','Maior derrota')}</tr>`+
out.map((r,i)=>`<tr class="${st.fx&&nk(st.fx)==nk(r.n)?'fx':''}"><td>${st.fx?(r.pos<999?r.pos:'–'):i+1}</td><td class="t" data-fx="${encodeURIComponent(r.n)}" title="Clique para focar o infográfico neste time (clique de novo para limpar)">${tb(r.n)}<span class="nm">${r.n}</span></td>${cols.map(c=>c(r)).join('')}<td class="${r.bw&&r.bw==best.bw?'best':''}" title="${r.bwo}">${r.bwt}</td><td class="${r.bl&&r.bl==best.bl?'best':''}" title="${r.blo}">${r.blt}</td></tr>`).join('')+
`</table></div><div class="mut" style="margin-top:6px">Sequências consideram os jogos de cada time em ordem de data (só os jogos em casa ou fora, conforme a condição). R = rodadas em que a sequência ocorreu${all?', com o ano; em "Todas as temporadas" a opção Sequências define se elas podem atravessar temporadas consecutivas':''}. Destaque verde = maior valor da coluna. Passe o mouse sobre um valor para ver as rodadas em que ocorreu. Passe o mouse sobre a maior vitória ou derrota para ver o adversário. Clique no título para ordenar; # = ${st.fx?'posição do time na classificação':'posição na ordenação atual'}.</div></div>`}
const pc=(a,b)=>b?(a/b*100).toFixed(1).replace('.',',')+'%':'–',fn1=v=>v.toFixed(2).replace('.',',');
const trophy=(c,t)=>`<svg viewBox="0 0 64 64" width="62" height="62"><path d="M16 8h32v18c0 9-7 16-16 16S16 35 16 26z" fill="${c}"/><path d="M16 12H6c0 10 4 16 12 18M48 12h10c0 10-4 16-12 18" fill="none" stroke="${c}" stroke-width="5"/><rect x="28" y="42" width="8" height="8" fill="${c}"/><rect x="18" y="50" width="28" height="7" rx="2" fill="${c}"/><text x="32" y="30" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">${t}</text></svg>`;
const medal=(c,t)=>`<svg viewBox="0 0 64 64" width="62" height="62"><circle cx="32" cy="32" r="29" fill="${c}"/><circle cx="32" cy="32" r="22" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><text x="32" y="38" text-anchor="middle" font-size="17" font-weight="800" fill="#fff">${t}</text></svg>`;
const CW=300,CH=112,CL=28,CR=6,CT=14,CB=16,PW=CW-CL-CR,PH=CH-CT-CB;
const scl=(mn,mx,z)=>{const C=[.05,.1,.2,.25,.5,1,2,5,10,20,50,100];const sp=C.find(c=>Math.ceil(mx/c)-(z?0:Math.floor(mn/c))<=4)||100,lo=z?0:Math.max(0,Math.floor(mn/sp)*sp);let hi=Math.ceil(mx/sp)*sp;if(hi<=lo)hi+=sp;const tk=[];for(let t=lo;t<=hi+1e-9;t+=sp)tk.push(+t.toFixed(2));
return{lo,hi,tk,Y:x=>CT+PH-(x-lo)/(hi-lo)*PH,tf:v=>(sp<1?v.toFixed(sp<.1?2:1):String(v)).replace('.',',')}};
const gridY=S=>S.tk.map(t=>`<line x1="${CL}" x2="${CW-CR}" y1="${S.Y(t).toFixed(1)}" y2="${S.Y(t).toFixed(1)}" stroke="currentColor" opacity=".18"/><text x="${CL-4}" y="${(S.Y(t)+3).toFixed(1)}" text-anchor="end" font-size="9.5" fill="currentColor" opacity=".75">${S.tf(t)}</text>`).join('');
const xlab=(xs,pos)=>{const n=xs.length,k=Math.ceil(n/8);return xs.map((x,i)=>i%k==0||(i==n-1&&(n-1)%k>=k/2)?`<text x="${pos(i).toFixed(1)}" y="${CH-4}" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".75">${x}</text>`:'').join('')};
const bars=(v,xs,u)=>{const S=scl(0,Math.max(...v,.1),1),bw=PW/v.length;
return`<svg viewBox="0 0 ${CW} ${CH}" class="ch">${gridY(S)}`+v.map((x,i)=>`<rect class="bar" x="${(CL+i*bw+1).toFixed(1)}" y="${S.Y(x).toFixed(1)}" width="${Math.max(1,bw-2).toFixed(1)}" height="${(CT+PH-S.Y(x)).toFixed(1)}" rx="1.5"><title>Rodada ${xs[i]}: ${fn1(x)} ${u}</title></rect>`).join('')+
`${xlab(xs,i=>CL+i*bw+bw/2)}</svg>`};
const stk=(v,xs,lbl,cl)=>{const S=scl(0,Math.max(...v.map(a=>a[0]+a[1]+a[2]),1),1),bw=PW/v.length;
return`<svg viewBox="0 0 ${CW} ${CH}" class="ch">${gridY(S)}`+v.map((a,i)=>{let acc=0;return a.map((x,j)=>{if(!x)return'';const y0=S.Y(acc+x),hh=S.Y(acc)-y0;acc+=x;return`<rect x="${(CL+i*bw+1).toFixed(1)}" y="${y0.toFixed(1)}" width="${Math.max(1,bw-2).toFixed(1)}" height="${hh.toFixed(1)}" fill="${cl[j]}"><title>Rodada ${xs[i]}: ${a[0]} ${lbl[0]}, ${a[1]} ${lbl[1]}, ${a[2]} ${lbl[2]}</title></rect>`}).join('')}).join('')+`${xlab(xs,i=>CL+i*bw+bw/2)}</svg>`};
const COL=['#0e6f7e','#f2b92c','#3aa5d9','#2fb67c','#8b6fd1','#7e97a8'];
const pie=(v,lb,hole)=>{const T=v.reduce((a,b)=>a+b,0)||1;let a0=-Math.PI/2,o='';const p=a=>[(50+46*Math.cos(a)).toFixed(2),(50+46*Math.sin(a)).toFixed(2)];
v.forEach((x,i)=>{if(!x)return;const a1=a0+x/T*2*Math.PI,s0=p(a0),e0=p(a1);o+=x==T?`<circle cx="50" cy="50" r="46" fill="${COL[i]}"><title>${lb[i]}: ${x} (${pc(x,T)})</title></circle>`:`<path class="sl" d="M50 50L${s0[0]} ${s0[1]}A46 46 0 ${a1-a0>Math.PI?1:0} 1 ${e0[0]} ${e0[1]}Z" fill="${COL[i]}"><title>${lb[i]}: ${x} (${pc(x,T)})</title></path>`;a0=a1});
return`<svg viewBox="0 0 100 100" class="pie">${o}${hole?`<circle cx="50" cy="50" r="27" fill="var(--bg2)"/><text x="50" y="55" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">${hole}</text>`:''}</svg>`};
function infog(sel){const{rows,all,X0,X,m}=sdata(sel),ys=all?[...new Set(G.map(g=>g.y))]:[sel],fk=st.fx?nk(st.fx):'';
const gs=G.filter(g=>(all||g.y==sel)&&g.hg!=null&&g.ag!=null&&(!X||g.r<=X)&&(!X0||g.r>=X0)),mt={t:'Geral',h:'Só em casa',a:'Só fora'}[m];
const rw=fk?rows.find(r=>nk(r.n)==fk):null,tn=rw?rw.n:st.fx;
const ban=`<div class="igt">⚽ ${fk?esc(tn):'Brasileirão Série A'} • ${all?'todas as temporadas':sel}<span>${mt} • ${rtxt(X0,X,all)}</span>${fk?'<button data-fx="">✕ Limpar seleção</button><button data-go="p">Página do time</button>':''}<button data-print="1">🖨 Imprimir / PDF</button></div>`;
const L=fk?gs.filter(g=>m=='t'?nk(g.h)==fk||nk(g.a)==fk:m=='h'?nk(g.h)==fk:nk(g.a)==fk).map(g=>{const hm=nk(g.h)==fk;return{r:g.r,f:hm?g.hg:g.ag,c:hm?g.ag:g.hg}}):gs.map(g=>({r:g.r,f:g.hg,c:g.ag})),N=L.length;
if(!N)return`<div class="ig">${ban}<div class="igc" style="grid-column:1/-1">Sem jogos disputados no período escolhido.</div></div>`;
const T={};for(const y of ys)for(const t of table(y,X,m,'t',X0)){const k=nk(t.n),o=T[k]||(T[k]={n:t.n,P:0,J:0});o.n=t.n;o.P+=t.P;o.J+=t.J}
const top=Object.values(T).filter(t=>t.J).sort((a,b)=>b.P/b.J-a.P/a.J||b.P-a.P).slice(0,10);
const H=L.filter(g=>g.f>g.c).length,A=L.filter(g=>g.f<g.c).length,E=N-H-A,sf=L.reduce((a,g)=>a+g.f,0),sc_=L.reduce((a,g)=>a+g.c,0);
const R={};L.forEach(g=>{const o=R[g.r]||(R[g.r]={n:0,g:0,h:0,e:0,a:0});o.n++;o.g+=fk?g.f:g.f+g.c;o.h+=g.f>g.c;o.e+=g.f==g.c;o.a+=g.f<g.c});
const rk=Object.keys(R).map(Number).sort((a,b)=>a-b),avg=rk.map(r=>R[r].g/R[r].n),lb=rk.map(r=>'Rodada '+r);const sk=rk.map(r=>[R[r].h,R[r].e,R[r].a]);
const SC={};L.forEach(g=>{const k=g.f+' x '+g.c;SC[k]=(SC[k]||0)+1});const sc=Object.entries(SC).sort((a,b)=>b[1]-a[1]).slice(0,8);
const GD=[0,0,0,0,0,0];L.forEach(g=>GD[Math.min(5,fk?g.f:g.f+g.c)]++);const gl6=['0 gols','1 gol','2 gols','3 gols','4 gols','5+ gols'];
let rec;
if(fk){rec=rw?SDEF.filter(([k])=>rw[k]).map(([k,l])=>({l,v:rw[k],sub:rw[k+'t'],w:'Ocorreu em '+rw[k+'t']})):[];if(rw&&rw.bw)rec.push({l:'Maior vitória',v:rw.bwt,sub:rw.bwo,w:rw.bwo});if(rw&&rw.bl)rec.push({l:'Maior derrota',v:rw.blt,sub:rw.blo,w:rw.blo})}
else{rec=SDEF.map(([k,l])=>{const b=Math.max(0,...rows.map(r=>r[k])),ls=rows.filter(r=>b&&r[k]==b);return ls.length?{l,v:b,sub:tb(ls[0].n)+ls[0].n+(ls.length>1?` +${ls.length-1}`:''),w:ls[0][k+'t']?'Ocorreu em '+ls[0][k+'t']:''}:null}).filter(Boolean);
const bw=Math.max(0,...rows.map(r=>r.bw)),b=rows.find(r=>bw&&r.bw==bw);if(b)rec.push({l:'Maior vitória',v:b.bwt,sub:tb(b.n)+b.n+(rows.filter(r=>r.bw==bw).length>1?` +${rows.filter(r=>r.bw==bw).length-1}`:''),w:b.bwo})}
const q=fk?[['vitórias',H,'V'],['empates',E,'E'],['derrotas',A,'D']]:[['vitórias do mandante',H,'C'],['empates',E,'E'],['vitórias do visitante',A,'F']];
const md=fk?[[fn1(sf/N),'gols marcados por jogo','⌀'],[fn1(sc_/N),'gols sofridos por jogo','⌀'],[pc(L.filter(g=>!g.c).length,N),'jogos sem sofrer gol','0']]:[[fn1((sf+sc_)/N),'gols por jogo','⌀'],[pc(L.filter(g=>g.f&&g.c).length,N),'ambos marcam','⇄'],[pc(L.filter(g=>g.f+g.c>=3).length,N),'jogos com 3+ gols','3+']];
const cl=['#f2b92c','#7e97a8','#b97a4a'];
return`<div class="ig">${ban}
${fk?'':`<div class="igc" style="grid-column:1/-1"><div class="rb">Top 10 em aproveitamento</div><div class="t10">${top.map(t=>`<button class="t10b${nk(t.n)==fk?' on':''}" data-fx="${encodeURIComponent(t.n)}" title="${t.n}: ${t.P} pts em ${t.J} jogos. Clique para focar neste time"><span class="ig-c">${tb(t.n)}</span><b>${pc(t.P,t.J*3)}</b><small>${t.n}</small></button>`).join('')}</div></div>`}
<div class="igc"><div class="rb">Resultados</div><div class="trio">${q.map((x,i)=>`<div>${trophy(cl[i],x[2])}<b>${pc(x[1],N)}</b><span>${x[0]}</span></div>`).join('')}</div><div class="mut">Resultados em cada rodada (quantidade de jogos)</div>${stk(sk,rk,q.map(x=>x[0]),cl)}<div class="lgd">${q.map((x,i)=>`<span><i style="background:${cl[i]}"></i>${x[0]}</span>`).join('')}</div></div>
<div class="igc"><div class="rb">Gols</div><div class="trio">${md.map((x,i)=>`<div>${medal(cl[i],x[2])}<b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><div class="mut">${fk?'Gols marcados em cada rodada':'Gols por jogo em cada rodada'}</div>${bars(avg,rk,fk?'gols marcados':'gols por jogo')}</div>
<div class="igc igr"><div class="rb">Recordes</div><div class="pins">${rec.map(r=>`<div class="pin" title="${r.w}"><b>${r.v}</b><span>${r.l}<small>${r.sub}</small></span></div>`).join('')||'<span class="mut">Sem recordes no período.</span>'}</div></div>
<div class="igc"><div class="rb">${fk?'Gols marcados por jogo':'Gols por jogo'}</div><div class="foc">${pie(GD,gl6)}<div class="lg">${GD.map((x,i)=>`<div><i style="background:${COL[i]}"></i>${gl6[i]} <b>${pc(x,N)}</b></div>`).join('')}</div></div></div>
<div class="igc"><div class="rb">Placares mais comuns</div>${fk?'<div class="mut">Gols do time x gols do adversário</div>':'<div class="mut">Mandante x visitante</div>'}${sc.map(([k,n])=>`<div class="hb"><span>${k}</span><i style="width:${(n/sc[0][1]*100).toFixed(0)}%"></i><em>${n} (${pc(n,N)})</em></div>`).join('')}</div></div>`}
const roundsOf=y=>[...new Set(G.filter(g=>g.y==y).map(g=>g.r))].sort((a,b)=>a-b);
const cgj=sh=>sh?'<colgroup class="cgj1"><col><col><col><col><col><col></colgroup>':'<colgroup class="cgj0"><col><col><col><col><col></colgroup>';
const CGS='<colgroup class="cgs"><col><col><col><col><col></colgroup>';
function fixGutter(){$$('.gb').forEach(b=>{const w=b.offsetWidth-b.clientWidth,t=b.previousElementSibling;if(t&&t.style)t.style.width=w>0?`calc(100% - ${w}px)`:'100%'})}
function games(){const y=+$('#sa').value,f=$('#ft').value||seasonTeam(y,st.fx),rs=roundsOf(y);
$('#lo').classList.toggle('hide',!f);
const row=(g,sh)=>`<tr>${sh?`<td>${g.r}</td>`:''}<td><span class="df">${fdt(g.d)}</span><span class="ds">${fdt(g.d).slice(0,5)}</span></td><td>${g.t||'–'}</td><td class="h" title="${g.h}"><span class="tn">${g.h}</span>${tb(g.h)}</td><td><b>${g.hg==null?'–':g.hg+' x '+g.ag}</b></td><td class="a" title="${g.a}">${tb(g.a)}<span class="tn">${g.a}</span></td></tr>`;
const head=sh=>`<table class="g fx">${cgj(sh)}<tr>${sh?'<th>Rod.</th>':''}<th>Data</th><th>Hora</th><th class="h" style="text-align:right"><span class="fl">Mandante</span><span class="sh">Man.</span></th><th>Placar</th><th class="a" style="text-align:left"><span class="fl">Visitante</span><span class="sh">Vis.</span></th></tr></table><div class="sc gb"><table class="g fx">${cgj(sh)}`;
if(f){const l=G.filter(g=>g.y==y&&(g.h==f||g.a==f));
l.sort(st.o=='r'?(a,b)=>a.r-b.r||a.d.localeCompare(b.d):(a,b)=>a.d.localeCompare(b.d)||(a.t||'').localeCompare(b.t||'')||a.r-b.r);
$('#jl').innerHTML=`<div class="mut" style="margin-bottom:8px">${l.length} jogos de ${f} – ${y} <button class="expb" data-exp="1" title="Baixar em CSV">⬇ CSV</button></div>`+head(1)+l.map(g=>row(g,1)).join('')+'</table></div>';fixGutter();return}
if(!rs.length){$('#jl').innerHTML='<div class="mut">Sem jogos nesta temporada.</div>';return}
if(!rs.includes(st.gr)){const pl=G.filter(g=>g.y==y&&g.hg!=null).map(g=>g.r);st.gr=G.some(g=>g.y==y&&g.hg==null)&&pl.length?Math.max(...pl):rs[0]}
const l=G.filter(g=>g.y==y&&g.r==st.gr).sort((a,b)=>a.d.localeCompare(b.d)||(a.t||'').localeCompare(b.t||'')),k=rs.indexOf(st.gr);
$('#jl').innerHTML=`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px"><button data-d="-1" aria-label="Rodada anterior"${k==0?' disabled':''}>◀</button><select id="gs" aria-label="Escolher rodada">${rs.map(r=>`<option value="${r}"${r==st.gr?' selected':''}>${isMob()?'Rod.':'Rodada'} ${r}</option>`).join('')}</select><button data-d="1" aria-label="Próxima rodada"${k==rs.length-1?' disabled':''}>▶</button><button data-cur="1" title="Ir para a rodada atual">Atual</button><span class="mut">${l.length} jogos • ${y}</span><button class="expb" data-exp="1" title="Baixar a rodada em CSV">⬇ CSV</button></div>`+head(0)+l.map(g=>row(g,0)).join('')+'</table></div>';fixGutter()}
// Punições decididas na justiça desportiva (alteram a pontuação, não os placares).
// y = temporada, t = time, p = pontos retirados, r = rodada a partir da qual vale, m = motivo.
const PEN=[
 {y:2013,t:'Portuguesa',p:4,r:38,m:'escalação irregular de Héverton'},
 {y:2013,t:'Flamengo',p:4,r:38,m:'escalação irregular de André Santos'},
 {y:2010,t:'Gremio Prudente',p:3,r:38,m:'escalação irregular de Paulão'},
 {y:2016,t:'Santa Cruz',p:3,r:38,m:'atraso de salário'},
 {y:2018,t:'Sport',p:3,r:38,m:'atraso de salário'}
];
const halfOf=y=>new Set(G.filter(g=>g.y==y).flatMap(g=>[g.h,g.a])).size-1;
const penOn=(y,X,m,tn='t',X0=0)=>{const hf=halfOf(y);return m=='t'?PEN.filter(p=>p.y==y&&(!X||X>=p.r)&&(!X0||X0<=p.r)&&(tn=='t'||(tn=='1'?p.r<=hf:p.r>hf))):[]};
// ===== Vagas continentais por temporada =====
// Para cada ano, informe as POSIÇÕES da tabela que classificam para cada competição, em texto, com faixas e vírgulas:
//   lg = Libertadores (fase de grupos)   lp = Libertadores (fase preliminar)   sa = Sul-Americana   nota = observação opcional na legenda
// Exemplo: VAGAS[2006]={lg:'1-3,11', lp:'4-5', sa:'6-10,12-13', nota:'...'}  (o 11º entra na Libertadores por ter ganho a Copa do Brasil)
// Anos sem linha própria usam as regras-base abaixo (aproximadas; o número real muda com os títulos de Copa do Brasil, Libertadores e Sul-Americana).
const fromCount=(a,b,c)=>({lg:a?`1-${a}`:'',lp:b?`${a+1}-${a+b}`:'',sa:c?`${a+b+1}-${a+b+c}`:''});
const VAGAS={};
for(let y=2027;y<=2050;y++)VAGAS[y]=fromCount(4,1,6);   // anos depois de 2026: 4 direta + 1 preliminar; Sul-Americana do 6º ao 11º
VAGAS[2026]=fromCount(4,2,6);                            // 4 direta + 2 preliminar; Sul-Americana do 7º ao 12º
VAGAS[2006]={lg:'1-3,11',lp:'4-5',sa:'6-10,12-13',nota:'Flamengo: Título Copa do Brasil. Internacional: Título Libertadores'};
VAGAS[2007]={lg:'1-4',lp:'5',sa:'6-12',nota:'Fluminense: Título Copa do Brasil'};
VAGAS[2008]={lg:'1-3,11',lp:'4',sa:'5-10,12-14',nota:'Internacional: Título Sulamericana'};
VAGAS[2009]={lg:'1-3,10',lp:'4',sa:'5-9,11-13',nota:'Corinthians: Título Copa do Brasil'};
VAGAS[2010]={lg:'1-2,7-8',lp:'3-4',sa:'5-6,9-14',nota:'Santos: Título Copa do Brasil. Internacional: Título Libertadores'};
VAGAS[2011]={lg:'1-3,10',lp:'4-5',sa:'6-9,11-14',nota:'Vasco: Título Copa do Brasil. Santos: Título Libertadores'};
VAGAS[2012]={lg:'1-2,6',lp:'3-4',sa:'',nota:'Palmeiras: Título Copa do Brasil. Corinthians: Título Libertadores'};
VAGAS[2013]={lg:'1-2,8,16',lp:'3-4',sa:'',nota:'Flamengo: Título Copa do Brasil. Atlético-MG: Título Libertadores'};
VAGAS[2014]={lg:'1-3,5',lp:'4',sa:'',nota:'Atlético-MG: Título Copa do Brasil'};
VAGAS[2015]={lg:'1-3,9',lp:'4',sa:'',nota:'Palmeiras: Título Copa do Brasil'};
VAGAS[2016]={lg:'1-4,9,11',lp:'5-6',sa:'7-8,10,12-14',nota:'Grêmio: Título Copa do Brasil. Chapecoense: Título Sulamericana'};
VAGAS[2017]={lg:'1-6',lp:'7-8',sa:'9-14',nota:'Cruzeiro: Título Copa do Brasil. Grêmio: Título Libertadores'};
VAGAS[2018]={lg:'1-4,7-8',lp:'5-6',sa:'9-14',nota:'Cruzeiro: Título Copa do Brasil. Athletico-PR: Título Sulamericana'};
VAGAS[2019]={lg:'1-6',lp:'7-8',sa:'9-14',nota:'Athletico: Título Copa do Brasil. Flamengo: Título Libertadores'};
VAGAS[2020]={lg:'1-5,7',lp:'6,8',sa:'9-14',nota:'Palmeiras: Título Copa do Brasil e da Libertadores'};
VAGAS[2021]={lg:'1-6,14',lp:'7-8',sa:'9-15',nota:'Atlético-MG: Título Copa do Brasil. Athletico-PR: Título Sulamericana. Palmeiras: Título Libertadores'};
VAGAS[2022]={lg:'1-6',lp:'7-8',sa:'9-14',nota:'Flamengo: Título Copa do Brasil e da Libertadores'};
VAGAS[2023]={lg:'1-4,7,11',lp:'5-6',sa:'8-10,12-14',nota:'São Paulo: Título Copa do Brasil. Fluminense: Título Libertadores'};
VAGAS[2024]={lg:'1-6',lp:'7-8',sa:'9-14',nota:'Flamengo: Título Copa do Brasil. Botafogo: Título Libertadores'};
VAGAS[2025]={lg:'1-5,13',lp:'6-7',sa:'8-12,14',nota:'Corinthians: Título Copa do Brasil. Flamengo: Título Libertadores'};
// --- Adicione/edite abaixo os demais anos (exemplos):
const parsePos=t=>{const r=new Set();String(t||'').split(',').forEach(p=>{const m=p.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(m)for(let i=+m[1];i<=+(m[2]||m[1]);i++)r.add(i)});return r};
const zset=y=>{const v=VAGAS[y]||fromCount(4,0,0);return{lg:parsePos(v.lg),lp:parsePos(v.lp),sa:parsePos(v.sa),nota:v.nota||''}};
const zone=(y,i,n)=>{const z=zset(y),p=i+1;return z.lg.has(p)?'lg':z.lp.has(p)?'lp':z.sa.has(p)?'sa':i>=n-4&&n>=16?'dn':''};
const leg=(y,n,zon)=>{const z=zset(y),it=(c,t,l)=>`<span><i class="${c}" aria-hidden="true"></i>${t}</span>`;return(zon&&z.lg.size?it('z1','Libertadores – fase de grupos','L'):'')+(zon&&z.lp.size?it('z2','Libertadores – fase preliminar','P'):'')+(zon&&z.sa.size?it('z3','Sul-Americana','S'):'')+(n>=16?it('z4','Rebaixamento','↓'):'')};
const fmtPos=set=>{const a=[...set].sort((x,y)=>x-y),o=[];for(let i=0;i<a.length;){let j=i;while(a[j+1]==a[j]+1)j++;o.push(j>i?`${a[i]}º–${a[j]}º`:`${a[i]}º`);i=j+1}return o.join(', ')};
const zl=(y,n)=>{const z=zset(y);
return z.nota?`<small>${z.nota}</small>`:''};
const ESC={},ESCN={},nk=s=>norm(s).replace(/[^a-z0-9]/g,'');
const tbi=n=>{let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%360;return`<span class="tb" aria-hidden="true" style="background:hsl(${h},50%,42%)">${n.replace(/[^A-Za-zÀ-ÿ]/g,'').slice(0,3).toUpperCase()}</span>`};
const tb=n=>{const u=ESC[n]||ESCN[nk(n)];return u?`<img class="tb" src="${u}" alt="${n.replace(/"/g,'&quot;')}" loading="lazy">`:tbi(n)};
const SH=(k,l,c='')=>`<th data-k="${k}" class="srt ${c}${st.sk==k?' on':''}" tabindex="0" aria-sort="${st.sk==k?(st.sd=='a'?'ascending':'descending'):'none'}" title="Ordenar por esta coluna">${l}${st.sk==k?(st.sd=='a'?' ▲':' ▼'):'<span class="si" aria-hidden="true">↕</span>'}</th>`;
const heads=()=>'<th>#</th>'+SH('n','Time','t')+[['P','P'],['J','J'],['V','V'],['E','E'],['D','D'],['GP','GP'],['GC','GC'],['SG','SG'],['AP','Aprov.']].map(([k,l])=>SH(k,l,['E','D','GP','GC','AP'].includes(k)?'xc':'')).join('');
function ord(rows){rows.forEach((t,i)=>t.pos=i+1);if(!st.sk)return rows;const k=st.sk,d=st.sd=='a'?1:-1,v=t=>k=='n'?t.n:k=='AP'?(t.J?t.P/t.J:-1):t[k];
return[...rows].sort((a,b)=>{const x=v(a),y=v(b),c=typeof x=='string'?x.localeCompare(y):x-y;return d*c||a.pos-b.pos})}
const rng=()=>{let a=+$('#x0').value||0,b=+$('#x').value||0;if(a&&b&&a>b)[a,b]=[b,a];return[a,b]};
const rtxt=(a,b,p)=>a&&b?`rodadas ${a} a ${b}${p?' de cada temporada':''}`:a?`da rodada ${a} em diante`:b?(p?`até a rodada ${b} de cada temporada`:`após ${b} rodadas`):'todas as rodadas';
const ap=t=>t.J?(t.P/(t.J*3)*100).toFixed(1).replace('.',',')+'%':'–';
const sgc=v=>v>0?'pos':v<0?'neg':'';
const sel=()=>st.cmp?[...$$('#chk input:checked')].map(i=>+i.value).sort((a,b)=>b-a):[+$('#sa').value];
const fdt=d=>d.split('-').reverse().join('/');
function fillET(){const ys=sel(),v=$('#et').value,t=[...new Set(G.filter(g=>ys.includes(g.y)).flatMap(g=>[g.h,g.a]))].sort();
const h='<option value="">➕ Adicionar time…</option>'+t.map(x=>`<option>${x}</option>`).join('');
if($('#et').dataset.k!=h){$('#et').innerHTML=h;$('#et').dataset.k=h;if(t.includes(v))$('#et').value=v}}
let RC={},RCD={};
const rcVal=(me,t)=>me=='gp'?t.GP:me=='gc'?t.GC:t.P;
function raceCard(y,idx){const m=st.m,me=$('#mt').value,mt={t:'Geral',h:'Só em casa',a:'Só fora'}[m],hs=new Set(hlNames().map(nk)),mobile=isMob(),rh=mobile?26:28,
R=Math.max(0,...G.filter(g=>g.y==y&&g.hg!=null).map(g=>g.r)),rb={};let n=0,maxV=0;
for(let x=1;x<=R;x++){const rows=table(y,x,m);rb[x]=rows;n=Math.max(n,rows.length);rows.forEach(t=>{maxV=Math.max(maxV,rcVal(me,t))})}
const fin=rb[R].map(t=>t.n),lab={p:'pontos (ordem da classificação)',s:'pontos acumulados',gp:'gols marcados',gc:'gols sofridos'}[me]||'pontos';
const prev=RC[idx];RC[idx]={r:prev&&prev.R==R?prev.r:R,R,playing:prev?prev.playing:false,speed:prev?prev.speed:1,timer:null};RCD[idx]={y,R,me,m,rb,n,rh,maxV};
const rows=fin.map((t,k)=>`<div class="rr${hs.has(nk(t))?' on':''}" data-t="${t}" data-k="${nk(t)}"><span class="rp"></span><span class="rn">${tb(t)}<span class="nm2">${t}</span></span><span class="rt"><i class="rf" style="background:hsl(${(k*137)%360},65%,50%)"></i></span><b class="rv"></b></div>`).join('');
const sp=RC[idx].speed;
return`<div class="card race"><h2>${y} <span class="mut">${mt} • corrida animada: ${lab}</span></h2><div class="rctl"><button class="rplay" data-rplay="${idx}">▶ Reproduzir</button><button data-rrst="${idx}" title="Reiniciar" aria-label="Reiniciar">↺</button><input type="range" class="rslider" data-ri="${idx}" min="1" max="${R}" value="${RC[idx].r}" aria-label="Escolher rodada"><label class="rsp">Velocidade <select class="rspeed" data-ri="${idx}">${[[.5,'0,5x'],[1,'1x'],[2,'2x'],[4,'4x']].map(([v,l])=>`<option value="${v}"${v==sp?' selected':''}>${l}</option>`).join('')}</select></label></div><div class="rinfo" id="ri${idx}"></div><div class="rbox" id="rbx${idx}" style="height:${n*rh}px;--rh:${rh}px" role="img" aria-label="Corrida animada do ranking rodada a rodada">${rows}</div><div class="mut" style="margin-top:6px">Clique em um time para destacá-lo. As barras seguem a escala do valor final da temporada.</div></div>`}
function raceFrame(idx){const c=RC[idx],d=RCD[idx],box=$('#rbx'+idx);if(!c||!d||!box)return;const r=c.r,rows=d.rb[r];if(!rows)return;
const it=rows.map((t,i)=>({n:t.n,v:rcVal(d.me,t),p:i}));if(d.me!='p')it.sort((a,b)=>b.v-a.v||a.p-b.p);const pos={};it.forEach((x,i)=>{pos[nk(x.n)]=i});
box.querySelectorAll('.rr').forEach(el=>{const i=pos[el.dataset.k];if(i==null){el.style.opacity='0';el.style.transform=`translateY(${d.n*d.rh}px)`;return}const x=it[i];el.style.opacity='1';el.style.transform=`translateY(${i*d.rh}px)`;
el.querySelector('.rf').style.width=(d.maxV?x.v/d.maxV*100:0)+'%';el.querySelector('.rv').textContent=x.v+(d.me=='gp'||d.me=='gc'?'':' pts');el.querySelector('.rp').textContent=(i+1)+'º'});
const sl=box.closest&&box.closest('.card')&&box.closest('.card').querySelector('.rslider');if(sl)sl.value=r;
const inf=$('#ri'+idx);inf.innerHTML=`Rodada <b>${r}</b> de ${d.R}${d.me=='gc'?' • Mais sofridos':' • Líder'}: <b>${it[0].n}</b> (${it[0].v}${d.me=='gp'||d.me=='gc'?' gols':' pts'})${r>=d.R?' 🏆':''}`;
const b=$('[data-rplay="'+idx+'"]');if(b)b.textContent=c.playing?'⏸ Pausar':'▶ Reproduzir'}
function racePause(idx){const c=RC[idx];if(!c)return;clearInterval(c.timer);c.timer=null;c.playing=false;raceFrame(idx)}
function racePlay(idx){const c=RC[idx],d=RCD[idx],box=$('#rbx'+idx);if(!c||!d)return;if(c.r>=d.R)c.r=1;c.playing=true;clearInterval(c.timer);const ms=900/c.speed;if(box&&box.style&&box.style.setProperty)box.style.setProperty('--rt',Math.round(Math.min(550,ms*.8))+'ms');
raceFrame(idx);c.timer=setInterval(()=>{if(c.r>=d.R){racePause(idx);return}c.r++;raceFrame(idx)},ms)}
function raceStopAll(keep){Object.values(RC).forEach(c=>{clearInterval(c.timer);c.timer=null;if(!keep)c.playing=false})}
function raceResume(){Object.keys(RCD).forEach(i=>{const c=RC[i];if(!c)return;const box=$('#rbx'+i);if(box&&box.style&&box.style.setProperty)box.style.setProperty('--rt',Math.round(Math.min(550,900/c.speed*.8))+'ms');if(c.playing)racePlay(+i);else raceFrame(+i)})}
let EVS=[];
const ZC={lg:'var(--zg)',lp:'#3b82f6',sa:'#8b5cf6',dn:'var(--neg)'};
const MET={p:'posição',s:'pontos acumulados',gp:'gols marcados acumulados',gc:'gols sofridos acumulados',dl:'diferença de pontos para o líder',d4:'diferença de pontos para o 4º colocado',dz:'diferença de pontos para o 17º (zona de rebaixamento)',ap:'aproveitamento acumulado',sg:'saldo de gols acumulado'};
const evVal=(me,t,i,rows)=>me=='p'?i+1:me=='s'?t.P:me=='gp'?t.GP:me=='gc'?t.GC:me=='dl'?t.P-rows[0].P:me=='d4'?t.P-rows[Math.min(3,rows.length-1)].P:me=='dz'?t.P-rows[Math.max(0,rows.length-4)].P:me=='ap'?(t.J?t.P/(t.J*3)*100:0):t.SG;
const evFmt=(me,v)=>me=='p'?v+'º':me=='ap'?v.toFixed(1).replace('.',',')+'%':(me=='dl'||me=='d4'||me=='dz'||me=='sg')&&v>0?'+'+v:String(v);
const evNice=(mn,mx,z)=>{if(z)mn=0;const C=[1,2,5,10,20,25,50,100,200],sp=C.find(c=>Math.ceil(mx/c)-Math.floor(mn/c)<=6)||500,lo=Math.floor(mn/sp)*sp;let hi=Math.ceil(mx/sp)*sp;if(hi<=lo)hi=lo+sp;const tk=[];for(let v=lo;v<=hi+1e-9;v+=sp)tk.push(v);return{lo,hi,tk}};
const hlNames=()=>{const a=[...st.hl];if(st.fx&&!a.some(x=>nk(x)==nk(st.fx)))a.push(st.fx);return a};
function toggleHl(n){const k=nk(n),i=st.hl.findIndex(x=>nk(x)==k);if(i>=0)st.hl.splice(i,1);else if(st.fx&&nk(st.fx)==k)setFx(null);else st.hl.push(n)}
function evBar(){const hs=hlNames();return`<div class="evbar"><div class="evch">${hs.map(n=>`<span class="chip">${tb(n)}${esc(n)}<button data-hlrm="${encodeURIComponent(n)}" aria-label="Remover destaque: ${esc(n)}">✕</button></span>`).join('')||'<span class="mut">Clique em uma linha ou no nome de um time para destacar (pode destacar vários).</span>'}</div><span class="evbt">${st.cmp&&sel().length>1?`<button data-ovl="1">${st.ovl?'📊 Gráficos separados':'🗂️ Sobrepor temporadas'}</button>`:''}<button data-race="1">${st.race?'📈 Ver gráfico':'🏁 Corrida animada'}</button><button data-evt="1">${st.evt?'📈 Ver gráfico':'📋 Ver como tabela'}</button></span></div>`}
function evList(d,r,lim){if(d.ovl)return d.items(r).slice(0,lim).map(x=>`<div class="evr"><span style="color:${x.c}">●</span><span class="evn">${x.y}</span><b>${evFmt(d.me,x.v)}</b></div>`).join('');const rows=d.rb[r],hs=new Set(hlNames().map(nk)),it=rows.map((t,i)=>({n:t.n,v:evVal(d.me,t,i,rows),p:i+1}));if(d.me!='p')it.sort((a,b)=>b.v-a.v||a.p-b.p);
const hi=it.filter(x=>hs.has(nk(x.n))),rest=it.filter(x=>!hs.has(nk(x.n))),show=hs.size?[...hi,...rest.slice(0,Math.max(0,lim-hi.length))]:it.slice(0,lim);
return show.map(x=>`<div class="evr${hs.has(nk(x.n))?' on':''}"><span>${x.p}º</span><span class="evn">${tb(x.n)}${x.n}</span><b>${evFmt(d.me,x.v)}</b></div>`).join('')+(it.length>show.length?`<div class="mut">… mais ${it.length-show.length} times</div>`:'')}
function evPanel(d,r){if(d.ovl)return`<div class="evh">${esc(d.team)} • Rodada ${r} <span class="mut">${MET[d.me]}</span></div><div class="evl">${evList(d,r,30)}</div>`;const rows=d.rb[r],nm=st.tap||hlNames()[0];let sm='<div class="mut">Toque em uma linha ou no nome de um time para ver o resumo dele.</div>';
if(nm){const k=nk(nm),i=rows.findIndex(t=>nk(t.n)==k);if(i>=0){const t=rows[i];sm=`<div class="evs"><b>${tb(t.n)}${t.n}</b> • ${i+1}º lugar<br>${t.P} pts • ${t.J} jogos • ${t.V}V ${t.E}E ${t.D}D<br>Gols ${t.GP}:${t.GC} (${t.SG>0?'+':''}${t.SG}) • aproveitamento ${ap(t)}</div>`}}
return`<div class="evh">Rodada ${r} <span class="mut">${MET[d.me]}</span></div>${sm}<div class="evl">${evList(d,r,20)}</div>`}
function ovlChart(){const ys=sel().slice().sort((a,b)=>a-b),m=st.m,me=$('#mt').value,mt={t:'Geral',h:'Só em casa',a:'Só fora'}[m],nm=hlNames()[0],idx=0,fs=st.fsIdx===idx;
const fsb=`<button class="fsbtn" data-fs="${idx}" aria-label="${fs?'Sair da tela cheia':'Tela cheia'}" title="${fs?'Sair da tela cheia':'Tela cheia'}">${fs?'✕':'⛶'}</button>`;
const head=x=>`<h2>${nm?tb(nm)+esc(nm):'Sobrepor temporadas'} <span class="mut">${mt} • ${MET[me]} • temporadas sobrepostas</span>${x||''}</h2>`;
if(!nm)return`<div class="card">${head()}<p class="mut">Escolha um time em “➕ Adicionar time…” ou na busca do topo para sobrepor as temporadas dele no mesmo gráfico.</p></div>`;
const k=nk(nm),series=[],miss=[];let n=0,Rmax=0,mx=0;
for(const y of ys){const tn=seasonTeam(y,nm),R=Math.max(0,...G.filter(g=>g.y==y&&g.hg!=null).map(g=>g.r));if(!tn||!R){miss.push(y);continue}
const vals=[];for(let x=1;x<=R;x++){const rows=table(y,x,m),i=rows.findIndex(t=>nk(t.n)==k);n=Math.max(n,rows.length);if(i>=0){const v=evVal(me,rows[i],i,rows);vals[x]=v;if(v>mx)mx=v}}series.push({y,vals,R});Rmax=Math.max(Rmax,R)}
if(!series.length)return`<div class="card">${head()}<p class="mut">Este time não tem jogos nas temporadas escolhidas.</p></div>`;
series.forEach((q,i)=>{q.c=`hsl(${(i*137)%360},65%,48%)`});
const W=780,rows_=me=='p'?Math.max(n,10):20,H=70+rows_*26,L=40,Rm=70,T=14,B=26,X=r=>L+(r-1)*(W-L-Rm)/Math.max(1,Rmax-1);let Y,ticks;
if(me=='p'){Y=p=>T+(p-1)*(H-T-B)/Math.max(1,n-1);ticks=Array.from({length:n},(_,i)=>i+1)}else{const S=evNice(0,mx,true);Y=v=>H-B-(v-S.lo)/(S.hi-S.lo)*(H-T-B);ticks=S.tk}
const bands=me=='p'&&m=='t'&&n>=16;
let o=`<svg class="evsvg ovl" data-ev="${idx}" viewBox="-8 0 ${W+16} ${H}" style="width:100%;min-width:600px;height:auto" font-size="10">`;
if(bands){const bh=(H-T-B)/Math.max(1,n-1);for(let p=1;p<=n;p++){const z=p<=4?'lg':p>n-4?'dn':'';if(z)o+=`<rect x="${L}" y="${(Y(p)-bh/2).toFixed(1)}" width="${W-Rm-L}" height="${bh.toFixed(1)}" style="fill:${ZC[z]}" opacity=".14"/>`}}
for(const v of ticks)o+=`<line x1="${L}" x2="${W-Rm}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" style="stroke:var(--line)"/><text x="${L-6}" y="${(Y(v)+3).toFixed(1)}" text-anchor="end" style="fill:var(--mut)">${v}</text>`;
for(let r=1;r<=Rmax;r++)if(r==1||r%5==0||r==Rmax)o+=`<text x="${X(r).toFixed(1)}" y="${H-8}" text-anchor="middle" style="fill:var(--mut)">${r}</text>`;
const lab=series.map(q=>({q,y:Y(q.vals[q.R]!=null?q.vals[q.R]:q.vals.filter(v=>v!=null).pop())})).sort((a,b)=>a.y-b.y);lab.forEach((l,i)=>{if(i)l.y=Math.max(l.y,lab[i-1].y+11)});
for(const q of series){let d='';for(let r=1;r<=q.R;r++)if(q.vals[r]!=null)d+=(d?'L':'M')+X(r).toFixed(1)+' '+Y(q.vals[r]).toFixed(1);
o+=`<path class="ln" data-t="${q.y}" d="${d}" fill="none" stroke="${q.c}" stroke-width="2.2" stroke-linejoin="round"><title>${nm} ${q.y}</title></path><path class="hit" data-t="${q.y}" d="${d}" fill="none" stroke="transparent" stroke-width="12" pointer-events="stroke"/>`;
const l=lab.find(z=>z.q===q);o+=`<text class="lb" data-t="${q.y}" x="${W-Rm+6}" y="${(l.y+3).toFixed(1)}" fill="${q.c}" font-weight="700">${q.y}</text>`}
o+=`<line class="xh" x1="0" x2="0" y1="${T}" y2="${H-B}" stroke="currentColor" opacity=".45" style="display:none"/></svg>`;
EVS[idx]={ovl:true,team:nm,y:nm,R:Rmax,me,m,X,W,H,L,Rm,vw:W+16,vx0:-8,items:r=>series.filter(q=>q.vals[r]!=null).map(q=>({y:q.y,v:q.vals[r],c:q.c})).sort(me=='p'?(a,b)=>a.v-b.v:(a,b)=>b.v-a.v)};
const rv=Math.min(Rmax,st.evr||Rmax);
return`<div class="card${fs?' fsx':''}">${head(fsb)}<div class="fshint">Vire o aparelho para a horizontal para ver o gráfico melhor.</div><div class="sc evw">${o}</div>${bands?'<div class="zl"><span><i class="z1" aria-hidden="true"></i>G4</span><span><i class="z4" aria-hidden="true"></i>Rebaixamento</span></div>':''}${miss.length?`<div class="mut">Sem dados do time em: ${miss.join(', ')}.</div>`:''}<div class="scrw"><input type="range" class="scrub" data-ev="${idx}" min="1" max="${Rmax}" value="${rv}" aria-label="Escolher rodada"><div class="evp" id="evp${idx}">${evPanel(EVS[idx],rv)}</div></div></div>`}
function chart(y,idx){const m=st.m,me=$('#mt').value,mt={t:'Geral',h:'Só em casa',a:'Só fora'}[m],hs=new Set(hlNames().map(nk));
const R=Math.max(0,...G.filter(g=>g.y==y&&g.hg!=null).map(g=>g.r)),fs=st.fsIdx===idx,fsb=`<button class="fsbtn" data-fs="${idx}" aria-label="${fs?'Sair da tela cheia':'Tela cheia'}" title="${fs?'Sair da tela cheia':'Tela cheia'}">${fs?'✕':'⛶'}</button>`;
const head=x=>`<h2>${y} <span class="mut">${mt} • ${MET[me]} após cada rodada</span>${x||''}</h2>`;
if(!R)return`<div class="card">${head()}<div class="mut">Sem jogos disputados.</div></div>`;
if(st.race)return raceCard(y,idx);
const pos={},rb={};let n=0,mn=Infinity,mx=-Infinity;
for(let x=1;x<=R;x++){const rows=table(y,x,m);rb[x]=rows;n=Math.max(n,rows.length);rows.forEach((t,i)=>{const v=evVal(me,t,i,rows);(pos[t.n]=pos[t.n]||[])[x]=v;if(v<mn)mn=v;if(v>mx)mx=v})}
const fv=t=>pos[t][R]==null?(me=='p'?99:-1e9):pos[t][R],tm=Object.keys(pos).sort((a,b)=>me=='p'?fv(a)-fv(b):fv(b)-fv(a)),hl=t=>hs.has(nk(t)),nH=tm.filter(hl).length,anyH=nH>0;
if(st.evt)return`<div class="card${fs?' fsx':''}">${head('<button class="expb" data-exp="1" title="Baixar em CSV">⬇ CSV</button>')}<div class="sc"><table class="ctab evt"><tr><th>#</th><th class="t">Time</th>${Array.from({length:R},(_,i)=>`<th>${i+1}</th>`).join('')}</tr>`+
tm.map((t,i)=>`<tr class="${hl(t)?'fx':''}" data-k="${nk(t)}"><td>${i+1}</td><td class="t">${tb(t)}<span class="nm">${t}</span></td>${Array.from({length:R},(_,r)=>`<td>${pos[t][r+1]==null?'–':evFmt(me,pos[t][r+1])}</td>`).join('')}</tr>`).join('')+`</table></div><div class="mut" style="margin-top:6px">Colunas = rodadas. Valores após cada rodada. # = ordem do gráfico (pela rodada mais recente).</div></div>`;
const W=780,H=70+n*26,L=40,Rm=140,T=14,B=26,X=r=>L+(r-1)*(W-L-Rm)/Math.max(1,R-1);let Y,ticks;
if(me=='p'){Y=p=>T+(p-1)*(H-T-B)/Math.max(1,n-1);ticks=Array.from({length:n},(_,i)=>i+1)}else{const S=evNice(mn,mx,me=='s'||me=='gp'||me=='gc'||me=='ap');Y=v=>H-B-(v-S.lo)/(S.hi-S.lo)*(H-T-B);ticks=S.tk}
const bands=me=='p'&&m=='t'&&n>=16;
let o=`<svg class="evsvg" data-ev="${idx}" viewBox="-8 0 ${W+16} ${H}" style="width:100%;min-width:${nH&&me!='p'?900:600}px;height:auto" font-size="10">`;
if(bands){const bh=(H-T-B)/Math.max(1,n-1);for(let p=1;p<=n;p++){const z=p<=4?'lg':p>n-4?'dn':'';if(z)o+=`<rect x="${L}" y="${(Y(p)-bh/2).toFixed(1)}" width="${W-Rm-L}" height="${bh.toFixed(1)}" style="fill:${ZC[z]}" opacity=".14"/>`}}
for(const v of ticks)o+=`<line x1="${L}" x2="${W-Rm}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" style="stroke:var(--line)"/><text x="${L-6}" y="${(Y(v)+3).toFixed(1)}" text-anchor="end" style="fill:var(--mut)">${me=='ap'?v+'%':v}</text>`;
if(me!='p'&&ticks[0]<0&&ticks[ticks.length-1]>0)o+=`<line x1="${L}" x2="${W-Rm}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" style="stroke:var(--fg)" opacity=".4"/>`;
for(let r=1;r<=R;r++)if(r==1||r%5==0||r==R)o+=`<text x="${X(r).toFixed(1)}" y="${H-8}" text-anchor="middle" style="fill:var(--mut)">${r}</text>`;
const lab=tm.filter(t=>pos[t][R]!=null).map(t=>({t,y:Y(pos[t][R])})).sort((a,b)=>a.y-b.y),ly={};lab.forEach((l,i)=>{if(i)l.y=Math.max(l.y,lab[i-1].y+10);ly[l.t]=l.y});
const un=me=='p'?'º':me=='ap'?'%':me=='gp'||me=='gc'?' gols':me=='sg'?' de saldo':' pts',order=anyH?[...tm.filter(t=>!hl(t)),...tm.filter(hl)]:tm;
for(const t of order){const k=tm.indexOf(t),c=`hsl(${(k*137)%360},65%,50%)`,on=!anyH||hl(t);let d='';
for(let r=1;r<=R;r++)if(pos[t][r]!=null)d+=(d?'L':'M')+X(r).toFixed(1)+' '+Y(pos[t][r]).toFixed(1);
o+=`<path class="ln" data-t="${t}" d="${d}" fill="none" stroke="${c}" stroke-width="${anyH&&on?3.5:1.8}" stroke-linejoin="round" opacity="${on?1:.18}"><title>${t}</title></path><path class="hit" data-t="${t}" d="${d}" fill="none" stroke="transparent" stroke-width="12" pointer-events="stroke"/>`;
if(ly[t]!=null)o+=`<text class="lb" data-t="${t}" x="${W-Rm+6}" y="${(ly[t]+3).toFixed(1)}" fill="${c}" opacity="${on?1:.3}" ${anyH&&on?'font-weight="700"':''}>${t}</text>`;
if(anyH&&on&&nH<=3)for(let r=1;r<=R;r++)if(pos[t][r]!=null)o+=`<circle cx="${X(r).toFixed(1)}" cy="${Y(pos[t][r]).toFixed(1)}" r="3" fill="${c}"><title>${t}: ${evFmt(me,pos[t][r])}${me=='p'?'':un} após a rodada ${r}</title></circle>`+(me!='p'&&nH<=2?`<text x="${X(r).toFixed(1)}" y="${(Y(pos[t][r])-7).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="700" fill="${c}" style="paint-order:stroke;stroke:var(--card);stroke-width:3px">${evFmt(me,pos[t][r])}</text>`:'')}
o+=`<line class="xh" x1="0" x2="0" y1="${T}" y2="${H-B}" stroke="currentColor" opacity=".45" style="display:none"/></svg>`;
EVS[idx]={y,R,me,m,rb,X,W,H,L,Rm,vw:W+16,vx0:-8};const rv=Math.min(R,st.evr||R);
return`<div class="card${fs?' fsx':''}">${head(fsb)}<div class="fshint">Vire o aparelho para a horizontal para ver o gráfico melhor.</div><div class="sc evw">${o}</div>${bands?'<div class="zl"><span><i class="z1" aria-hidden="true"></i>G4</span><span><i class="z4" aria-hidden="true"></i>Rebaixamento</span></div>':''}<div class="scrw"><input type="range" class="scrub" data-ev="${idx}" min="1" max="${R}" value="${rv}" aria-label="Escolher rodada"><div class="evp" id="evp${idx}">${evPanel(EVS[idx],rv)}</div></div></div>`}
const cmpT=(a,b)=>b.P-a.P||b.V-a.V||b.SG-a.SG||b.GP-a.GP||a.n.localeCompare(b.n);
function calc(l,names){const T={};const get=n=>T[n]||(T[n]={n,P:0,J:0,V:0,E:0,D:0,GP:0,GC:0});names.forEach(get);
for(const g of l)for(const[n,f,c]of[[g.h,g.hg,g.ag],[g.a,g.ag,g.hg]]){const t=get(n);t.J++;t.GP+=f;t.GC+=c;if(f>c){t.V++;t.P+=3}else if(f==c){t.E++;t.P++}else t.D++}
return Object.values(T).map(t=>(t.SG=t.GP-t.GC,t)).sort(cmpT)}
function simY(){const p=G.filter(g=>g.hg==null);return p.length?Math.max(...p.map(g=>g.y)):0}
function pendRounds(){const y=simY();return[...new Set(G.filter(g=>g.y==y&&g.hg==null).map(g=>g.r))].sort((a,b)=>a-b)}
function optHtml(){const y=simY();return pendRounds().map(r=>{const t=[];G.forEach((g,i)=>{if(g.y==y&&g.hg==null&&g.r==r)t.push(i)});
return`<option value="${r}"${r==st.rd?' selected':''}>${isMob()?'Rod.':'Rodada'} ${r} (${t.filter(i=>st.sim[i]).length}/${t.length})</option>`}).join('')}
function sim(){const y=simY();
if(!y){$('#ss').innerHTML='<div class="card"><h2>Simulação</h2><div class="mut">Não há jogos restantes nos dados carregados.</div></div>';$('#sg').innerHTML='';return}
const rs=pendRounds();if(!rs.includes(st.rd))st.rd=rs[0];
const pend=[];G.forEach((g,i)=>{if(g.y==y&&g.hg==null&&g.r==st.rd)pend.push([g,i])});
pend.sort((a,b)=>a[0].d.localeCompare(b[0].d)||(a[0].t||'').localeCompare(b[0].t||''));
const iv=(i,k)=>{const v=st.sim[i];return v?v[k]:''},k=rs.indexOf(st.rd);
$('#sg').innerHTML=`<h2>Jogos restantes de ${y}</h2><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><button data-d="-1" aria-label="Rodada anterior"${k==0?' disabled':''}>◀</button><select id="rs" aria-label="Escolher rodada">${optHtml()}</select><button data-d="1" aria-label="Próxima rodada"${k==rs.length-1?' disabled':''}>▶</button><button data-cur="1" title="Ir para a próxima rodada com jogos">Atual</button></div><table class="g fx">${CGS}<tr><th>Data</th><th>Hora</th><th style="text-align:right"><span class="fl">Mandante</span><span class="sh">Man.</span></th><th>Placar</th><th style="text-align:left"><span class="fl">Visitante</span><span class="sh">Vis.</span></th></tr></table><div class="sc gb"><table class="g fx">${CGS}`+
pend.map(([g,i])=>`<tr><td><span class="df">${fdt(g.d)}</span><span class="ds">${fdt(g.d).slice(0,5)}</span></td><td>${g.t||'–'}</td><td class="h" title="${g.h}"><span class="tn">${g.h}</span>${tb(g.h)}</td><td style="white-space:nowrap"><input type="number" inputmode="numeric" aria-label="Gols" min="0" max="30" data-i="${i}" value="${iv(i,'h')}" style="width:52px"> x <input type="number" inputmode="numeric" aria-label="Gols" min="0" max="30" data-i="${i}" value="${iv(i,'a')}" style="width:52px"></td><td class="a" title="${g.a}">${tb(g.a)}<span class="tn">${g.a}</span></td></tr>`).join('')+'</table></div>';fixGutter();
simTable()}
function simTable(){const y=simY(),all=G.filter(g=>g.y==y),names=[...new Set(all.flatMap(g=>[g.h,g.a]))];
const played=all.filter(g=>g.hg!=null),fixed=[];let np=0;
G.forEach((g,i)=>{if(g.y==y&&g.hg==null){np++;if(st.sim[i])fixed.push({h:g.h,a:g.a,hg:st.sim[i].h,ag:st.sim[i].a})}});
const cur=calc(played,names),prj=calc([...played,...fixed],names),p0={};cur.forEach((t,i)=>p0[t.n]=i+1);
const n=prj.length,mc=st.mc,ex=mc?'<th>Título</th><th>G4</th><th>Z4</th>':'';
const pc=v=>(v/mc.N*100).toFixed(1)+'%';
$('#ss').innerHTML=`<div class="card"><h2>${y} <span class="mut">classificação projetada • ${fixed.length} de ${np} jogos definidos</span></h2><div class="sc"><table><tr><th>#</th><th class="t">Time</th><th>P</th><th>J</th><th>V</th><th>SG</th><th class="dcol">Δ</th>${ex}</tr>`+
prj.map((t,i)=>{const d=(p0[t.n]||i+1)-(i+1),dd=d>0?'▲'+d:d<0?'▼'+(-d):'=';const e=mc?`<td>${pc(mc.d[t.n].c)}</td><td>${pc(mc.d[t.n].g)}</td><td>${pc(mc.d[t.n].r)}</td>`:'';
return`<tr class="${zone(y,i,n)}"><td>${i+1}</td><td class="t">${tb(t.n)}<span class="nm">${t.n}</span></td><td class="p">${t.P}${t.pen?'<sup title="Perdeu '+t.pen+' pts por punição">*</sup>':''}</td><td>${t.J}</td><td>${t.V}</td><td class="${sgc(t.SG)}">${t.SG>0?'+':''}${t.SG}</td><td class="dcol">${dd}</td>${e}</tr>`}).join('')+
`</table></div></div>`}
function monte(){const y=simY(),N=10000,all=G.filter(g=>g.y==y),names=[...new Set(all.flatMap(g=>[g.h,g.a]))].sort(),ix={};names.forEach((q,k)=>ix[q]=k);
const base=names.map(()=>[0,0,0,0]),free=[];
const add=(B,h,a,hg,ag)=>{for(const[k,f,c]of[[h,hg,ag],[a,ag,hg]]){const b=B[k];b[2]+=f-c;b[3]+=f;if(f>c){b[0]+=3;b[1]++}else if(f==c)b[0]++}};
G.forEach((g,i)=>{if(g.y!=y)return;if(g.hg!=null)add(base,ix[g.h],ix[g.a],g.hg,g.ag);else if(st.sim[i])add(base,ix[g.h],ix[g.a],st.sim[i].h,st.sim[i].a);else free.push([ix[g.h],ix[g.a]])});
const n=names.length,cnt=names.map(()=>[0,0,0]),ord=[...Array(n).keys()];
for(let s=0;s<N;s++){const B=base.map(b=>b.slice());
for(const[h,a]of free){const r=Math.random();if(r<.45)add(B,h,a,1,0);else if(r<.72)add(B,h,a,0,0);else add(B,h,a,0,1)}
ord.sort((p,q)=>B[q][0]-B[p][0]||B[q][1]-B[p][1]||B[q][2]-B[p][2]||B[q][3]-B[p][3]||p-q);
cnt[ord[0]][0]++;for(let k=0;k<4;k++)cnt[ord[k]][1]++;for(let k=n-4;k<n;k++)cnt[ord[k]][2]++}
const d={};names.forEach((q,k)=>d[q]={c:cnt[k][0],g:cnt[k][1],r:cnt[k][2]});return{N,d}}
function draw(){const t=st.t,c=st.cmp&&(t=='c'||t=='e'),s=t=='s';syncUI();raceStopAll(t=='e'&&st.race);if(t!='e')st.fsIdx=null;document.body.classList.toggle('fsb',st.fsIdx!=null);
$('#la').classList.toggle('hide',c||s||t=='h'||t=='x'||t=='p');$('#lsx').classList.toggle('hide',t!='x');$('#lsq').classList.toggle('hide',t!='x'||$('#sx').value!='all');$('#lh').classList.toggle('hide',t!='h');$('#rst').textContent=t=='x'?'↺ Ordem normal (A–Z)':'↺ Ordem normal (pontos)';$('#lr').classList.toggle('hide',!(st.sk&&(t=='c'||t=='h')));$('#lb').classList.toggle('hide',!c);$('#le').classList.toggle('hide',t!='e');$('#lk').classList.toggle('hide',t!='e');
$('#lx').classList.toggle('hide',t!='c'&&t!='h'&&t!='x');$('#lm').classList.toggle('hide',t!='c'&&t!='e'&&t!='h'&&t!='x');$('#ln').classList.toggle('hide',t!='c'&&t!='h');
$('#cmp').classList.toggle('on',st.cmp);$('#cmp').classList.toggle('hide',t=='j'||s||t=='h'||t=='x'||t=='p');
$('#vc').classList.toggle('hide',t=='j'||s);$('#vj').classList.toggle('hide',t!='j');$('#vs').classList.toggle('hide',!s);
$('#vc').style.gridTemplateColumns=t=='e'||t=='h'||t=='x'||t=='p'?'1fr':'';
if(t=='c'){const ys=sel();let pv=null;$('#vc').innerHTML=ys.map(y=>{const o=panel(y,ys.length>1?pv:null);pv=lastPanelPos;return o}).join('')||'<div class="mut">Marque ao menos uma temporada.</div>'}
else if(t=='e'){fillET();EVS=[];RCD={};$('#vc').innerHTML=evBar()+(st.ovl&&st.cmp&&sel().length>1&&!st.evt&&!st.race?ovlChart():(sel().map(chart).join('')||'<div class="mut">Marque ao menos uma temporada.</div>'));syncScrubs();raceResume()}
else if(t=='p')$('#vc').innerHTML=teamPage();else if(t=='x'){const v=$('#sx').value=='all'?'all':+$('#sx').value;$('#vc').innerHTML=infog(v)+stats(v)}else if(t=='h')$('#vc').innerHTML=hist();else if(s)sim();else games();chips();writeHash();if(st.scr){st.scr=false;const r=document.querySelector('tr.fx');if(r&&r.scrollIntoView)r.scrollIntoView({block:'center',behavior:'smooth'})}}
const ZI=Object.fromEntries(Object.entries({lg:['L','Libertadores – fase de grupos'],lp:['P','Libertadores – fase preliminar'],sa:['S','Sul-Americana'],dn:['↓','Rebaixamento']}).map(([k,[l,t]])=>[k,`<span class="zi" title="${t}" aria-label="${t}">${l}</span>`]));
const SL={n:'Time',P:'Pontos',J:'Jogos',V:'Vitórias',E:'Empates',D:'Derrotas',GP:'Gols pró',GC:'Gols contra',SG:'Saldo',AP:'Aprov.',ys:'Temporadas'};
const xl=k=>SL[k]||(SDEF.find(d=>d[0]==k)||[])[1]||(k=='bw'?'Maior vitória':k=='bl'?'Maior derrota':k);
function syncUI(){$$('#modo button').forEach(b=>b.classList.toggle('on',b.dataset.m==st.m));$$('#turno button').forEach(b=>b.classList.toggle('on',b.dataset.n==st.tn));$$('#ord button').forEach(b=>b.classList.toggle('on',b.dataset.o==st.o));
$$('#tabs button').forEach(b=>{const on=b.dataset.t==st.t;b.classList.toggle('on',on);b.setAttribute('role','tab');b.setAttribute('aria-selected',on)});
$$('#bnav button').forEach(b=>b.classList.toggle('on',b.dataset.t==st.t||(b.dataset.t=='more'&&(st.t=='h'||st.t=='e'||st.t=='p'))))}
function chips(){const t=st.t,o=[],a=(x,k)=>o.push(`<span class="chip">${esc(x)}${k?`<button data-chip="${k}" aria-label="Remover filtro: ${esc(x)}">✕</button>`:''}</span>`),[X0,X]=rng();let n=0;const r=(x,k)=>{a(x,k);n++};
a(t=='x'?($('#sx').value=='all'?'Todas as temporadas':$('#sx').value):t=='h'?`${$('#hf').value}–${$('#ht').value}`:t=='s'?'Simulação':t=='p'?'Página do time':(t=='c'||t=='e')?(sel().join(', ')||'–'):$('#sa').value);
if(st.m!='t'&&['c','e','h','x'].includes(t))r(st.m=='h'?'Só em casa':'Só fora','m');
if(st.tn!='t'&&(t=='c'||t=='h'))r(st.tn=='1'?'1º turno':'2º turno','n');
if((X0||X)&&['c','h','x'].includes(t))r(rtxt(X0,X,t=='h'),'r');
if(st.fx&&t!='p')r('Time: '+st.fx,'f');
if(t=='j'&&$('#ft').value)r('Time: '+$('#ft').value,'t');
if(st.sk&&(t=='c'||t=='h'))r('Ordem: '+xl(st.sk),'sk');
if(st.xk&&t=='x')r('Ordem: '+xl(st.xk),'xk');
if(n>1)o.push('<button class="chip" data-chip="all">Limpar filtros</button>');
$('#chl').innerHTML=o.join('')}
function resetFilters(){st.m='t';st.tn='t';setFx(null);st.sk=null;st.xk=null;$('#x0').value='';$('#x').value='';$('#ft').value='';draw()}
function openSheet(on){$('#fbar').classList.toggle('open',on);$('#bd').classList.toggle('show',on);$('#more').classList.remove('show')}
function go(t){st.t=t;openSheet(false);draw();if(typeof scrollTo=='function')scrollTo(0,0)}
let tipEl,tipT;function showTip(txt,x,y){if(!tipEl){tipEl=document.createElement('div');tipEl.id='tip';document.body.appendChild(tipEl)}tipEl.textContent=txt;tipEl.style.display='block';const w=tipEl.offsetWidth,hh=tipEl.offsetHeight;tipEl.style.left=Math.max(8,Math.min(innerWidth-w-8,x-w/2))+'px';tipEl.style.top=Math.max(8,y-hh-14)+'px';clearTimeout(tipT);tipT=setTimeout(()=>{tipEl.style.display='none'},3800)}
function swipe(el,fn){let x0=0,y0=0;el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});el.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;if(Math.abs(dx)>70&&Math.abs(dy)<40&&!(e.target.closest&&e.target.closest('input,select')))fn(dx<0?1:-1)},{passive:true})}
let noHash=false,lastT=null;
const allTeams=()=>{const m={};G.forEach(g=>{m[nk(g.h)]=g.h;m[nk(g.a)]=g.a});return Object.values(m).sort((a,b)=>a.localeCompare(b))};
function findTeam(v){const k=nk(v);if(!k)return null;const ts=allTeams(),ex=ts.find(t=>nk(t)==k);if(ex)return ex;const pf=ts.filter(t=>nk(t).startsWith(k));return pf.length==1?pf[0]:null}
function setFx(n){st.fx=n||null;$('#srch').value=n||'';$('#srchs').value=n||'';$('#srchc').innerHTML=n?tb(n):''}
function seasonTeam(y,n){if(!n)return'';const k=nk(n),t=G.find(g=>g.y==y&&(nk(g.h)==k||nk(g.a)==k));return t?(nk(t.h)==k?t.h:t.a):''}
function stepJ(d){if($('#ft').value||seasonTeam(+$('#sa').value,st.fx))return;const rs=roundsOf(+$('#sa').value),k=rs.indexOf(st.gr)+d;if(k>=0&&k<rs.length){st.gr=rs[k];games()}}
function stepS(d){const rs=pendRounds(),k=rs.indexOf(st.rd)+d;if(k>=0&&k<rs.length){st.rd=rs[k];sim()}}
function exportCsv(card){const ts=card&&card.querySelectorAll('table');if(!ts||!ts.length)return;const tx=c=>{const k=c.cloneNode(true);k.querySelectorAll('.tb,.zi,.dv,sup,.ds,.sh').forEach(x=>x.remove());return k.textContent.replace(/\s+/g,' ').trim()};
const rows=[...ts].flatMap(t=>[...t.querySelectorAll('tr')]).map(tr=>[...tr.children].map(c=>'"'+tx(c).replace(/"/g,'""')+'"').join(';'));
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download='brasileirao-'+st.t+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
function hashState(){const q=new URLSearchParams();q.set('t',st.t);const sa=$('#sa').value;if(sa)q.set('y',sa);if(st.m!='t')q.set('m',st.m);if(st.tn!='t')q.set('tn',st.tn);
const x0=$('#x0').value,x=$('#x').value;if(x0)q.set('x0',x0);if(x)q.set('x',x);if(st.cmp){q.set('cmp','1');q.set('cy',sel().join(','))}
if(st.t=='x'){q.set('sx',$('#sx').value);if($('#sx').value=='all'&&$('#sq').value!='w')q.set('sq',$('#sq').value)}
if(st.t=='h'){q.set('hf',$('#hf').value);q.set('ht',$('#ht').value)}if(st.fx)q.set('fx',st.fx);if(st.t=='j'&&st.gr)q.set('gr',st.gr);return q.toString()}
function writeHash(){if(noHash||typeof history=='undefined'||!history.replaceState||typeof location=='undefined')return;const h='#'+hashState();if(h!=location.hash)(st.t!=lastT?history.pushState:history.replaceState).call(history,null,'',h);lastT=st.t}
function applyHash(){if(typeof location=='undefined'||!location.hash||location.hash.length<2){lastT=st.t;return}const q=new URLSearchParams(location.hash.slice(1)),g=(k,re)=>{const v=q.get(k);return v!=null&&re.test(v)?v:null},Y=/^\d{4}$/,N=/^\d{1,3}$/;
st.t='c';st.m='t';st.tn='t';st.cmp=false;st.gr=null;$('#x0').value='';$('#x').value='';setFx(null);
const t=g('t',/^[cehjpsx]$/);if(t)st.t=t;const y=g('y',Y);if(y)$('#sa').value=y;const m=g('m',/^[tha]$/);if(m)st.m=m;const tn=g('tn',/^[t12]$/);if(tn)st.tn=tn;
const x0=g('x0',N);if(x0)$('#x0').value=x0;const x=g('x',N);if(x)$('#x').value=x;
if(g('cmp',/^1$/)){st.cmp=true;const ys=(q.get('cy')||'').split(',').filter(v=>Y.test(v));$$('#chk input').forEach(i=>{i.checked=ys.includes(i.value)})}
const sx=g('sx',/^(all|\d{4})$/);if(sx)$('#sx').value=sx;const sq=g('sq',/^[wc]$/);if(sq)$('#sq').value=sq;const hf=g('hf',Y);if(hf)$('#hf').value=hf;const ht=g('ht',Y);if(ht)$('#ht').value=ht;
const fx=q.get('fx');if(fx){const n=findTeam(cleanName(fx));if(n)setFx(n)}const gr=g('gr',N);if(gr)st.gr=+gr;lastT=st.t}
function teamPage(){const n0=st.fx;if(!n0)return`<div class="card"><h2>Página do time</h2><p class="mut">Busque um time no campo do topo (atalho: tecla /) ou clique em um time do Top 10 ou das tabelas.</p></div>`;
const k=nk(n0),ys=[...new Set(G.map(g=>g.y))].sort((a,b)=>a-b),R=[];let nm=n0;
for(const y of ys){const rows=table(y,0,'t','t',0),i=rows.findIndex(t=>nk(t.n)==k);if(i>=0&&rows[i].J){nm=rows[i].n;R.push({...rows[i],y,pos:i+1,nt:rows.length})}}
if(!R.length)return`<div class="card"><h2>${esc(n0)}</h2><p class="mut">Este time não tem jogos nos dados carregados.</p></div>`;
const sm=f=>R.reduce((a,r)=>a+r[f],0),J=sm('J'),P=sm('P'),best=Math.min(...R.map(r=>r.pos)),worst=Math.max(...R.map(r=>r.pos)),yrs=p=>R.filter(r=>r.pos==p).map(r=>r.y).join(', '),tit=R.filter(r=>r.pos==1).map(r=>r.y);
const k1=(l,v,s)=>`<div class="tkb"><b>${v}</b><span>${l}</span>${s?`<small>${s}</small>`:''}</div>`;
const CLA={lg:'<span class="c1">Libertadores</span>',lp:'<span class="c2">Pré-Libertadores</span>',sa:'<span class="c3">Sul-Americana</span>',dn:'<span class="c4">Rebaixamento</span>'};
const sx=st.m,x0=$('#x0').value,x1=$('#x').value;st.m='t';$('#x0').value='';$('#x').value='';const D=sdata('all');st.m=sx;$('#x0').value=x0;$('#x').value=x1;
const rw=D.rows.find(r=>nk(r.n)==k),rec=rw?SDEF.filter(([q])=>rw[q]).map(([q,l])=>`<div class="pin" title="${rw[q+'t']?'Ocorreu em '+rw[q+'t']:''}"><b>${rw[q]}</b><span>${l}<small>${rw[q+'t']}</small></span></div>`).concat(rw.bw?[`<div class="pin" title="${rw.bwo}"><b>${rw.bwt}</b><span>Maior vitória<small>${rw.bwo}</small></span></div>`]:[],rw.bl?[`<div class="pin" title="${rw.blo}"><b>${rw.blt}</b><span>Maior derrota<small>${rw.blo}</small></span></div>`]:[]):[];
const nt=Math.max(...R.map(r=>r.nt)),X=i=>30+(R.length>1?i*(CW-30-24)/(R.length-1):(CW-54)/2),Y=p=>CT+(p-1)/Math.max(1,nt-1)*PH,tk=[1,...[5,10,15,20].filter(v=>v<=nt)];
let d='';R.forEach((r,i)=>{d+=(i&&r.y-R[i-1].y==1?'L':'M')+X(i).toFixed(1)+','+Y(r.pos).toFixed(1)});
const svg=`<svg viewBox="0 0 ${CW} ${CH}" class="ch">`+tk.map(v=>`<line x1="30" x2="${CW-18}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="currentColor" opacity=".18"/><text x="26" y="${(Y(v)+3).toFixed(1)}" text-anchor="end" font-size="9.5" fill="currentColor" opacity=".75">${v}º</text>`).join('')+`<path d="${d}" fill="none" stroke="var(--acc)" stroke-width="2" stroke-linejoin="round"/>`+R.map((r,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(r.pos).toFixed(1)}" r="3.5" fill="var(--acc)"><title>${r.y}: ${r.pos}º lugar, ${r.P} pts</title></circle>`).join('')+xlab(R.map(r=>r.y),X)+`</svg>`;
return`<div class="tp"><div class="card"><h2>${tb(nm)}${esc(nm)} <span class="mut">${R[0].y}–${R[R.length-1].y} na Série A (dados carregados)</span></h2><div class="tsum">${k1('Temporadas',R.length)}${k1('Melhor posição',best+'º',yrs(best))}${k1('Pior posição',worst+'º',yrs(worst))}${k1('Títulos',tit.length,tit.join(', '))}${k1('Jogos',J)}${k1('Aproveitamento',pc(P,J*3))}${k1('V / E / D',sm('V')+' / '+sm('E')+' / '+sm('D'))}${k1('Gols pró / contra',sm('GP')+' / '+sm('GC'))}</div></div>
<div class="card"><h2>Posição final por temporada</h2><div class="mut">1º lugar no topo</div><div class="tpch">${svg}</div></div>
<div class="card"><h2>Campanhas por ano<button class="expb" data-exp="1" title="Baixar em CSV">⬇ CSV</button></h2><div class="sc"><table><tr><th>Ano</th><th>#</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>Aprov.</th><th title="Classificação final">CLA</th></tr>`+
R.slice().reverse().map(r=>`<tr><td>${r.y}</td><td>${r.pos}º</td><td class="p">${r.P}${r.pen?'<sup title="Inclui punição">*</sup>':''}</td><td>${r.J}</td><td>${r.V}</td><td>${r.E}</td><td>${r.D}</td><td>${r.GP}</td><td>${r.GC}</td><td class="${sgc(r.SG)}">${r.SG>0?'+':''}${r.SG}</td><td>${ap(r)}</td><td class="cla">${CLA[zone(r.y,r.pos-1,r.nt)]||'–'}</td></tr>`).join('')+
`</table></div><div class="mut" style="margin-top:6px">CLA = classificação final no campeonato: Libertadores, Pré-Libertadores (fase preliminar), Sul-Americana ou Rebaixamento, conforme as vagas cadastradas para cada ano.</div></div>
<div class="card"><h2>Recordes de sequência <span class="mut">dentro de cada temporada</span></h2><div class="pins">${rec.join('')||'<span class="mut">Sem recordes.</span>'}</div></div></div>`}
const isMob=()=>typeof matchMedia=='function'&&matchMedia('(max-width:720px)').matches;
const dbd=f=>{let t;return()=>{clearTimeout(t);t=setTimeout(f,220)}};
const mqDark=()=>typeof matchMedia=='function'&&matchMedia('(prefers-color-scheme: dark)').matches;
function applyTheme(m){const r=document.documentElement;if(r){if(m=='light'||m=='dark')r.setAttribute('data-theme',m);else r.removeAttribute('data-theme')}const dark=m=='dark'||(m!='light'&&mqDark()),b=$('#thm');b.checked=dark;b.setAttribute('aria-checked',dark);b.dataset.m=m}
function initTheme(){let m='auto';try{m=localStorage.getItem('bra_theme')||'auto'}catch(e){}if(m!='light'&&m!='dark')m='auto';applyTheme(m);
$('#thm').onchange=()=>{const n=$('#thm').checked?'dark':'light';try{localStorage.setItem('bra_theme',n)}catch(e){}applyTheme(n)};
if(typeof matchMedia=='function'){const q=matchMedia('(prefers-color-scheme: dark)');if(q.addEventListener)q.addEventListener('change',()=>{if(($('#thm').dataset.m||'auto')=='auto')applyTheme('auto')})}}
function seg(id,attr,key){$(id).onclick=e=>{const b=e.target.closest('button');if(!b)return;st[key]=b.dataset[attr];$$(id+' button').forEach(x=>x.classList.toggle('on',x==b));draw()}}
initTheme();
let dip=null;if(typeof addEventListener=='function')addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#inst').classList.remove('hide')});
$('#inst').onclick=()=>{if(dip){dip.prompt();dip=null;$('#inst').classList.add('hide')}};
if(typeof navigator!='undefined'&&navigator.serviceWorker&&typeof location!='undefined'&&/^https?:/.test(location.protocol||''))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
seg('#tabs','t','t');
$('#bnav').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.t=='more'){openSheet(false);$('#more').classList.toggle('show');return}go(b.dataset.t)};
$('#more').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.t)};
$('#srchs').onchange=()=>{const n=$('#srchs').value||null;setFx(n);st.scr=!!n;draw()};
$('#srch').onchange=()=>{const v=$('#srch').value.trim(),n=findTeam(v);if(v&&!n)return;setFx(n);st.scr=!!n;draw()};
$('#srch').oninput=()=>{const v=$('#srch').value.trim();if(!v){if(st.fx){setFx(null);draw()}return}const k=nk(v),n=allTeams().find(t=>nk(t)==k);if(n&&n!=st.fx){setFx(n);st.scr=true;draw()}};
$('#lnk').onclick=()=>{const u=typeof location!='undefined'?location.href:'';const ok=()=>{const r=$('#lnk').getBoundingClientRect();showTip('Link copiado!',r.left+r.width/2,r.top)};
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,()=>prompt('Copie o link:',u));else prompt('Copie o link:',u)};
$('#fclose2').onclick=()=>openSheet(false);$('#fclose').onclick=()=>openSheet(false);$('#bd').onclick=()=>openSheet(false);$('#clrf').onclick=resetFilters;$('#retry').onclick=()=>location.reload();
$('#chips').onclick=e=>{if(e.target.closest('#fbtn')){openSheet(true);return}const b=e.target.closest('[data-chip]');if(!b)return;const k=b.dataset.chip;
if(k=='m')st.m='t';else if(k=='n')st.tn='t';else if(k=='r'){$('#x0').value='';$('#x').value=''}else if(k=='f')setFx(null);else if(k=='t')$('#ft').value='';else if(k=='sk')st.sk=null;else if(k=='xk')st.xk=null;else if(k=='all'){resetFilters();return}draw()};
swipe($('#jl'),stepJ);
swipe($('#sg'),stepS);
if(document.addEventListener){document.addEventListener('keydown',e=>{const tg=e.target,ty=tg.matches&&tg.matches('input,select,textarea');
if((e.key=='Enter'||e.key==' ')&&tg.matches&&tg.matches('th[data-k],th[data-xk]')){e.preventDefault();tg.click();return}
if(ty||e.ctrlKey||e.metaKey||e.altKey)return;
if(e.key=='/'){e.preventDefault();$('#srch').focus();return}
if(e.key=='ArrowLeft'||e.key=='ArrowRight'){const d=e.key=='ArrowLeft'?-1:1;if(st.t=='j')stepJ(d);else if(st.t=='s')stepS(d)}});
if(typeof addEventListener=='function')addEventListener('popstate',()=>{applyHash();noHash=true;draw();noHash=false});
$('#vc').addEventListener('change',e=>{const el=e.target;if(el.matches&&el.matches('select.rspeed')){const k=+el.dataset.ri,c=RC[k];if(!c)return;c.speed=+el.value;const was=c.playing;racePause(k);if(was)racePlay(k)}});
$('#vc').addEventListener('mouseover',e=>{const tr=e.target.closest&&e.target.closest('tr[data-k]');$$('#vc tr[data-k]').forEach(r=>r.classList.toggle('mh',!!tr&&r.dataset.k==tr.dataset.k))});
$('#vc').addEventListener('mouseleave',()=>{$$('#vc tr.mh').forEach(r=>r.classList.remove('mh'));$$('svg.evsvg').forEach(v=>hvSet(v,null));hideEv()});
const touchUi=()=>isMob()||(typeof matchMedia=='function'&&matchMedia('(hover:none)').matches);
function hvSet(svg,t){svg.classList.toggle('hvon',!!t);svg.querySelectorAll('[data-t]').forEach(el=>el.classList.toggle('hv',!!t&&el.dataset.t==t))}
function setXh(svg,d,r){const l=svg&&svg.querySelector('.xh');if(!l)return;l.setAttribute('x1',d.X(r));l.setAttribute('x2',d.X(r));l.style.display=''}
function syncScrubs(){if(!touchUi())return;$$('input.scrub').forEach(i=>{const d=EVS[+i.dataset.ev],c=i.closest('.card');if(d&&c)setXh(c.querySelector('svg.evsvg'),d,+i.value)})}
let evTipEl=null;
function hideEv(){if(evTipEl)evTipEl.style.display='none';if(!touchUi())$$('.xh').forEach(l=>{l.style.display='none'})}
function showEv(d,r,x,y){if(!evTipEl){evTipEl=document.createElement('div');evTipEl.id='evtip';document.body.appendChild(evTipEl)}
evTipEl.innerHTML=`<div class="evh">${d.ovl?esc(d.team):d.y} • Rodada ${r}</div>${evList(d,r,10)}`;evTipEl.style.display='block';const w=evTipEl.offsetWidth,hh=evTipEl.offsetHeight;
evTipEl.style.left=Math.max(8,Math.min(innerWidth-w-8,x+18>innerWidth-w-8?x-w-18:x+18))+'px';evTipEl.style.top=Math.max(8,Math.min(innerHeight-hh-8,y-hh/2))+'px'}
$('#vc').addEventListener('mousemove',e=>{if(touchUi())return;const svg=e.target.closest&&e.target.closest('svg.evsvg');if(!svg){hideEv();return}const d=EVS[+svg.dataset.ev];if(!d)return;
const bb=svg.getBoundingClientRect(),sc=Math.min(bb.width/d.vw,bb.height/d.H),vx=(e.clientX-bb.left-(bb.width-d.vw*sc)/2)/sc+d.vx0;if(vx<d.L-10||vx>d.W-d.Rm+6){hideEv();return}
const r=Math.max(1,Math.min(d.R,Math.round((vx-d.L)/((d.W-d.L-d.Rm)/Math.max(1,d.R-1)))+1));setXh(svg,d,r);showEv(d,r,e.clientX,e.clientY)});
$('#vc').addEventListener('mouseover',e=>{const svg=e.target.closest&&e.target.closest('svg.evsvg');if(!svg)return;const el=e.target.closest('[data-t]');hvSet(svg,el?el.dataset.t:null)});
$('#vc').addEventListener('input',e=>{const i=e.target;if(i.matches&&i.matches('input.rslider')){const k=+i.dataset.ri;if(RC[k]){racePause(k);RC[k].r=+i.value;raceFrame(k)}return}if(!i.matches||!i.matches('input.scrub'))return;const d=EVS[+i.dataset.ev],r=+i.value;if(!d)return;st.evr=r;const p=$('#evp'+i.dataset.ev);if(p)p.innerHTML=evPanel(d,r);setXh(i.closest('.card').querySelector('svg.evsvg'),d,r)});

if(typeof matchMedia=='function')document.addEventListener('click',e=>{if(!matchMedia('(hover:none)').matches)return;const el=e.target;if(el.closest&&el.closest('th,button,select,input,a')){if(tipEl)tipEl.style.display='none';return}
const hit=el.closest&&el.closest('[title]'),ch=el.querySelector&&el.querySelector(':scope > title'),tt=(hit&&hit.getAttribute('title'))||(ch&&ch.textContent);if(tt)showTip(tt,e.clientX,e.clientY);else if(tipEl)tipEl.style.display='none'})}

$('#jl').onclick=e=>{if(e.target.closest('[data-exp]')){exportCsv($('#jl'));return}if(e.target.closest('button[data-cur]')){st.gr=null;games();return}const b=e.target.closest('button[data-d]');if(!b)return;const rs=roundsOf(+$('#sa').value),k=rs.indexOf(st.gr)+(+b.dataset.d);if(k>=0&&k<rs.length){st.gr=rs[k];games()}};
$('#jl').onchange=e=>{if(e.target.id=='gs'){st.gr=+e.target.value;games()}};
$('#clr2').onclick=()=>{st.sim={};st.mc=null;sim()};
$('#mcb').onclick=()=>{st.mc=monte();simTable()};
$('#sg').onclick=e=>{if(e.target.closest('button[data-cur]')){st.rd=null;sim();return}const b=e.target.closest('button[data-d]');if(!b)return;const rs=pendRounds(),k=rs.indexOf(st.rd)+(+b.dataset.d);if(k>=0&&k<rs.length){st.rd=rs[k];sim()}};
$('#sg').onchange=e=>{if(e.target.id=='rs'){st.rd=+e.target.value;sim()}};
$('#sg').oninput=e=>{const i=e.target.dataset.i;if(i==null)return;const [a,b]=e.target.closest('tr').querySelectorAll('input');
if(a.value!==''&&b.value!==''&&+a.value>=0&&+b.value>=0)st.sim[i]={h:Math.floor(+a.value),a:Math.floor(+b.value)};else delete st.sim[i];st.mc=null;simTable();$('#rs').innerHTML=optHtml()};
seg('#modo','m','m');seg('#turno','n','tn');seg('#ord','o','o');
$('#cmp').onclick=()=>{st.cmp=!st.cmp;draw()};
$('#sa').onchange=()=>{st.gr=null;fillTeams();draw()};$('#chk').onchange=draw;$('#mt').onchange=draw;$('#rst').onclick=()=>{st.sk=null;st.xk=null;draw()};$('#vc').onclick=e=>{const dt=e.target.closest&&e.target.closest('svg.evsvg [data-t], .race [data-t]');if(dt){if(dt.closest('.ovl'))return;const n=dt.dataset.t;toggleHl(n);st.tap=hlNames().some(x=>nk(x)==nk(n))?n:null;draw();return}
const hr=e.target.closest('[data-hlrm]');if(hr){const n=decodeURIComponent(hr.dataset.hlrm);if(st.fx&&nk(st.fx)==nk(n))setFx(null);else st.hl=st.hl.filter(x=>nk(x)!=nk(n));if(st.tap&&nk(st.tap)==nk(n))st.tap=null;draw();return}
if(e.target.closest('[data-evt]')){st.evt=!st.evt;st.race=false;st.ovl=false;draw();return}
if(e.target.closest('[data-ovl]')){st.ovl=!st.ovl;st.evt=false;st.race=false;draw();return}
if(e.target.closest('[data-race]')){st.race=!st.race;st.evt=false;st.ovl=false;draw();return}
const rpb=e.target.closest('[data-rplay]');if(rpb){const i=+rpb.dataset.rplay;if(RC[i]&&RC[i].playing)racePause(i);else racePlay(i);return}
const rrs=e.target.closest('[data-rrst]');if(rrs){const i=+rrs.dataset.rrst;if(RC[i]){racePause(i);RC[i].r=1;raceFrame(i)}return}
const fb=e.target.closest('[data-fs]');if(fb){const i=+fb.dataset.fs,on=st.fsIdx!==i;st.fsIdx=on?i:null;try{if(on){const r=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;if(r)r.call(document.documentElement);if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{})}else{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen();if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock()}}catch(x){}draw();return}const ex=e.target.closest('[data-exp]');if(ex){exportCsv(ex.closest('.card'));return}const gg=e.target.closest('[data-go]');if(gg){go(gg.dataset.go);return}if(e.target.closest('[data-print]')){print();return}if(e.target.closest('[data-cols]')){st.cols=!st.cols;draw();return}if(e.target.closest('[data-clear]')){resetFilters();return}if(e.target.closest('button[data-rst]')){st.xk=null;draw();return}const fx=e.target.closest('[data-fx]');if(fx){const n=decodeURIComponent(fx.dataset.fx);setFx(!n||st.fx==n?null:n);draw();return}const tx=e.target.closest('th[data-xk]');if(tx){const k=tx.dataset.xk;if(st.xk==k)st.xd=st.xd=='a'?'d':'a';else{st.xk=k;st.xd=k=='n'||k=='gc'?'a':'d'}draw();return}const th=e.target.closest('th[data-k]');if(!th)return;const k=th.dataset.k;if(st.sk==k)st.sd=st.sd=='a'?'d':'a';else{st.sk=k;st.sd=k=='n'||k=='GC'?'a':'d'}draw()};$('#sx').onchange=draw;$('#sq').onchange=draw;$('#hf').onchange=draw;$('#ht').onchange=draw;$('#et').onchange=()=>{const v=$('#et').value;if(v&&!hlNames().some(x=>nk(x)==nk(v)))st.hl.push(v);$('#et').value='';draw()};$('#x').oninput=dbd(draw);$('#x0').oninput=dbd(draw);$('#ft').onchange=draw;
$('#file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{G=load(await f.text());save();init()}catch(err){$('#msg').textContent='Erro: '+err.message}}
$('#clr').onclick=()=>{try{localStorage.removeItem('bra_g')}catch(e){}G=[];location.reload()}
fetch('data/escudos.json').then(r=>r.ok?r.json():{}).then(j=>{for(const k in j){const v=String(j[k]);if(/^data\/escudos\/[\w.\-]+$/.test(v)||/^https:\/\/crests\.football-data\.org\/[\w.\-\/]+$/.test(v))ESC[k]=v}for(const k in ESC)ESCN[nk(k)]=ESC[k];if(G.length)draw()}).catch(()=>{});
fetch('data/jogos.csv',{cache:'no-cache'}).then(r=>{if(!r.ok)throw 0;return r.text()}).then(t=>{G=load(t);save();$('#imp').classList.add('hide');init()}).catch(()=>{try{const s=localStorage.getItem('bra_g');if(s){G=cleanG(JSON.parse(s));init()}}catch(e){}if(!G.length){$('#ld').classList.add('hide');$('#imp').classList.remove('hide');$('#msg').textContent='Não foi possível carregar os dados. Tente de novo ou selecione o arquivo CSV.'}})

document.addEventListener('error',e=>{const t=e.target;if(t&&t.tagName==='IMG'&&t.classList&&t.classList.contains('tb')){const w=document.createElement('span');w.innerHTML=tbi(t.alt||'');if(w.firstChild)t.replaceWith(w.firstChild)}},true);
fetch('data/atualizacao.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(!j||!j.atualizado_em)return;const d=new Date(j.atualizado_em);if(isNaN(d))return;$('#upd').textContent='Resultados atualizados em '+d.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}).catch(()=>{});
