
const $=s=>document.querySelector(s),T=80;let C=10,R=6;
const {units:U,armies:AR,levels:LV}=window.GAME_DATA;
let save={pick:0,done:0,stars:[0,0,0,0,0,0]};
try{const s=JSON.parse(localStorage.getItem('nic'));if(s)save=Object.assign(save,s)}catch(e){}
if(!Array.isArray(save.stars))save.stars=[];while(save.stars.length<LV.length)save.stars.push(0);
const store=()=>{try{localStorage.setItem('nic',JSON.stringify(save))}catch(e){}};
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id===id));if(id==='select')drawSel();if(id==='campaign')drawCamp();live=id==='game'}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
$('#bPlay').onclick=()=>show('campaign');$('#bArmy').onclick=()=>show('select');
$('#bHow').onclick=()=>{const h=$('#how');h.style.display=h.style.display==='none'?'block':'none'};
$('#bOk').onclick=()=>{store();show('campaign')};

function unit(g,x,y,type,team,f){ // x,y feet center
 const c=team==='p'?'#0d69ac':'#c4281c';g.save();g.translate(x,y);g.scale(f,1);
 if(type==='t'){g.fillStyle='#222';g.fillRect(-26,-10,52,10);g.fillStyle='#5b6b45';g.fillRect(-22,-24,44,14);g.fillStyle=c;g.fillRect(-22,-18,44,4);g.fillStyle='#4a5838';g.fillRect(-10,-34,20,10);g.fillStyle='#222';g.fillRect(8,-31,28,4)}
 else{g.fillStyle='#4b974b';g.fillRect(-7,-16,6,16);g.fillRect(1,-16,6,16);g.fillStyle=c;g.fillRect(-8,-34,16,18);g.fillStyle='#f5cd30';g.fillRect(-6,-48,12,13);
  g.fillStyle='#000';g.fillRect(2,-44,2,3);if(type==='s'){g.fillStyle='#333';g.fillRect(-7,-51,14,4)}
  g.fillStyle='#222';const L=type==='k'?30:type==='s'?10:18;g.fillRect(6,-30,L,3)}
 g.restore()}
function drawSel(){const b=$('#armies');b.innerHTML='';AR.forEach((a,i)=>{const d=document.createElement('button');d.className='card'+(save.pick===i?' sel':'');
 d.innerHTML='<canvas width="150" height="90"></canvas><b>'+a.n+'</b><p>'+a.d+'</p>';const g=d.querySelector('canvas').getContext('2d');
 unit(g,35,75,'r','p',1);unit(g,80,80,'t','p',1);unit(g,125,75,'k','p',1);
 d.onclick=()=>{save.pick=i;drawSel()};b.appendChild(d)})}
function drawCamp(){$('#who').textContent='Army: '+AR[save.pick].n;const b=$('#lvls');b.innerHTML='';
 LV.forEach((l,i)=>{const k=document.createElement('button');const lock=i>save.done&&!l.test;k.className='lvl'+(lock?' lock':'');
 k.innerHTML='<div class="n">'+(l.test?'TEST':l.boss?'BOSS':i+1)+'</div>'+l.n+(l.test?'<small>Test map · 1 enemy outpost</small>':'')+'<div class="stars">'+(lock?'Locked':'★'.repeat(save.stars[i])+'☆'.repeat(3-save.stars[i]))+'</div>';
 k.disabled=lock;k.onclick=()=>start(i);b.appendChild(k)})}

/* game */
const cv=$('#cv'),g=cv.getContext('2d');
let live=false,lvl,L,units,flags,walls,turn,sel,reach,over,fl=[],tc,start0;
const key=(x,y)=>x+','+y,at=(x,y)=>units.find(u=>u.x===x&&u.y===y),dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function start(i){lvl=i;L=LV[i];walls=new Set();flags=[];units=[];fl=[];sel=null;reach={};over=false;turn='p';tc=1;
 L.m.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==='#')walls.add(key(x,y));if(ch==='F')flags.push({x,y,o:null})}));
 place(L.me,'p',[0,1]);place(L.en,'e',[9,8]);start0=units.filter(u=>u.team==='p').length;
 $('#over').classList.remove('on');show('game');ui('Your turn');info('Tap one of your units to begin.');requestAnimationFrame(loop)}
function place(s,team,cols){const rows=[2,3,1,4,0,5];let n=0;const a=AR[save.pick];
 for(const col of cols)for(const y of rows){if(n>=s.length)return;if(walls.has(key(col,y))||flags.some(f=>f.x===col&&f.y===y))continue;
  const t=s[n++],b=U[t];const u={t,team,x:col,y,hp:b.hp,max:b.hp,mv:b.mv,rg:b.rg,dm:b.dm,moved:false,acted:false,f:team==='p'?1:-1};
  if(team==='p'){u.hp+=a.hp;u.max+=a.hp;u.mv+=a.mv;u.dm+=a.dm}
  if(team==='e'&&L.boss&&n===1){u.hp=u.max=40;u.dm+=2}units.push(u)}}
function bfs(u){const out={},q=[[u.x,u.y,0]],seen=new Set([key(u.x,u.y)]);
 while(q.length){const[x,y,d]=q.shift();if(d>=u.mv)continue;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);
   if(nx<0||ny<0||nx>=C||ny>=R||seen.has(k)||walls.has(k)||at(nx,ny))continue;seen.add(k);out[k]=1;q.push([nx,ny,d+1])}}return out}
function ui(t){$('#turn').textContent=t+' · Turn '+tc;$('#fl').textContent='Flags '+flags.filter(f=>f.o==='p').length+'/'+flags.length;$('#end').disabled=turn!=='p'||over}
function info(t){$('#info').textContent=t}
function attack(a,d){d.hp-=a.dm;a.f=d.x>=a.x?1:-1;fl.push({x:d.x,y:d.y,t:1,s:'-'+a.dm});if(d.hp<=0)units=units.filter(u=>u!==d)}
cv.addEventListener('click',e=>{if(turn!=='p'||over)return;const r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*C),y=Math.floor((e.clientY-r.top)/r.height*R),u=at(x,y);
 if(u&&u.team==='p'){sel=u;reach=u.moved?{}:bfs(u);info(U[u.t].n+' · HP '+u.hp+'/'+u.max+' · Move '+u.mv+' · Range '+u.rg+' · Damage '+u.dm+(u.acted?' · done':''));return}
 if(!sel)return;
 if(u&&u.team==='e'&&!sel.acted&&dist(sel,u)<=sel.rg){attack(sel,u);sel.acted=sel.moved=true;reach={};info('Hit for '+sel.dm+'.');check();return}
 if(!u&&!sel.moved&&reach[key(x,y)]){sel.f=x>=sel.x?1:-1;sel.x=x;sel.y=y;sel.moved=true;reach={};info('Moved. Tap an enemy in range to attack, or another unit.');return}
 sel=null;reach={}});
$('#end').onclick=()=>{if(turn!=='p'||over)return;sel=null;reach={};cap('p');if(check())return;turn='e';ui('Enemy turn');info('Enemy is moving...');
 const list=units.filter(u=>u.team==='e');let i=0;
 (function next(){if(over)return;if(i>=list.length){cap('e');if(check())return;units.forEach(u=>u.moved=u.acted=false);turn='p';tc++;ui('Your turn');info('Your move.');return}
  const e=list[i++];if(e.hp>0&&units.includes(e))ai(e);setTimeout(next,520)})()};
function ai(e){const rc=bfs(e);rc[key(e.x,e.y)]=1;const P=units.filter(u=>u.team==='p');let best=null,bs=-1e9;
 for(const k in rc){const[x,y]=k.split(',').map(Number);for(const p of P){if(Math.abs(x-p.x)+Math.abs(y-p.y)<=e.rg){const s=(p.hp<=e.dm?100:0)-p.hp+(Math.abs(x-p.x)+Math.abs(y-p.y))*.5;if(s>bs){bs=s;best={x,y,p}}}}}
 if(best){e.f=best.p.x>=best.x?-1*-1:-1;e.f=best.p.x>=best.x?1:-1;e.x=best.x;e.y=best.y;attack(e,best.p);return check()}
 const goals=P.concat(flags.filter(f=>f.o!=='e'));if(!goals.length)return;goals.sort((a,b)=>dist(e,a)-dist(e,b));const t=goals[0];let bk=null,bd=1e9;
 for(const k in rc){const[x,y]=k.split(',').map(Number);const d=Math.abs(x-t.x)+Math.abs(y-t.y);if(d<bd){bd=d;bk=[x,y]}}
 if(bk){e.f=bk[0]>=e.x?1:-1;e.x=bk[0];e.y=bk[1]}}
function cap(team){flags.forEach(f=>{const u=at(f.x,f.y);if(u&&u.team===team)f.o=team})}
function check(){ui(turn==='p'?'Your turn':'Enemy turn');const P=units.filter(u=>u.team==='p').length,E=units.filter(u=>u.team==='e').length;
 if(!E||(flags.length&&flags.every(f=>f.o==='p')))return fin(true);if(!P||(flags.length&&flags.every(f=>f.o==='e')))return fin(false);return false}
function fin(win){over=true;const s=win?(P3()):0;if(win){save.stars[lvl]=Math.max(save.stars[lvl],s);if(!LV[lvl].test)save.done=Math.max(save.done,Math.min(lvl+1,LV.length-1));store()}
 $('#oT').textContent=win?(lvl===LV.length-1?'Campaign cleared!':'Victory!'):'Defeat';$('#oS').textContent=win?'★'.repeat(s)+'☆'.repeat(3-s):'';
 $('#oA').style.display=win&&lvl<LV.length-1?'':'none';ui('Battle over');setTimeout(()=>$('#over').classList.add('on'),600);return true}
function P3(){const a=units.filter(u=>u.team==='p').length;return a===start0?3:a>=start0/2?2:1}
$('#oA').onclick=()=>start(lvl+1);$('#oR').onclick=()=>start(lvl);$('#oQ').onclick=$('#quit').onclick=()=>show('campaign');

function loop(){if(!live)return;draw();requestAnimationFrame(loop)}
function draw(){
 for(let y=0;y<R;y++)for(let x=0;x<C;x++){g.fillStyle=(x+y)%2?'#6d7a88':'#76838f';g.fillRect(x*T,y*T,T,T);
  if(walls.has(key(x,y))){g.fillStyle='#8b5a2b';g.fillRect(x*T+4,y*T+4,T-8,T-8);g.fillStyle='#6b3f17';g.fillRect(x*T+4,y*T+36,T-8,4);g.fillRect(x*T+38,y*T+4,4,32)}
  if(reach[key(x,y)]){g.fillStyle='#4aa3ff66';g.fillRect(x*T+2,y*T+2,T-4,T-4)}}
 flags.forEach(f=>{const px=f.x*T+T/2,py=f.y*T+T-8;g.fillStyle='#ddd';g.fillRect(px-2,py-52,4,52);g.fillStyle=f.o==='p'?'#0d69ac':f.o==='e'?'#c4281c':'#aaa';g.fillRect(px+2,py-52,26,16)});
 if(sel&&units.includes(sel)){g.strokeStyle='#f5cd30';g.lineWidth=4;g.strokeRect(sel.x*T+3,sel.y*T+3,T-6,T-6);
  if(!sel.acted&&turn==='p')units.filter(u=>u.team==='e'&&dist(sel,u)<=sel.rg).forEach(u=>{g.strokeStyle='#ff3b30';g.lineWidth=4;g.strokeRect(u.x*T+3,u.y*T+3,T-6,T-6)})}
 units.slice().sort((a,b)=>a.y-b.y).forEach(u=>{const px=u.x*T+T/2,py=u.y*T+T-10;g.globalAlpha=u.team==='p'&&u.acted?.55:1;g.fillStyle='#0004';g.beginPath();g.ellipse(px,py,22,6,0,0,7);g.fill();unit(g,px,py,u.t,u.team,u.f);g.globalAlpha=1;
  g.fillStyle='#000a';g.fillRect(u.x*T+10,u.y*T+T-8,T-20,5);g.fillStyle=u.team==='p'?'#4b974b':'#c4281c';g.fillRect(u.x*T+10,u.y*T+T-8,(T-20)*u.hp/u.max,5)});
 fl.forEach(f=>{f.t-=.02;g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=4;g.font='700 20px Orbitron,sans-serif';g.textAlign='center';const y=f.y*T+20-(1-f.t)*30;g.strokeText(f.s,f.x*T+T/2,y);g.fillText(f.s,f.x*T+T/2,y)});fl=fl.filter(f=>f.t>0)}


U.r.n='Trooper';U.t.n='Armor';U.s.n='Recon Drone';U.k.n='Marksman';
AR[0].n='Vanguard Corps';AR[1].n='Recon Wing';AR[2].n='Heavy Ordnance';
['Range Zero','Urban Sector','Collapsed Grid','Reactor Core','Command Citadel'].forEach((n,i)=>LV[i].n=n);
function unit(g,x,y,type,team,f){
 const a=team==='p'?'#29e0ff':'#ff3b4e';g.save();g.translate(x,y);g.scale(f,1);
 if(type==='t'){g.fillStyle='#10161c';g.fillRect(-29,-12,58,12);g.fillStyle='#2a343e';for(let i=0;i<5;i++)g.fillRect(-25+i*11,-10,7,8);
  g.fillStyle='#3a4651';g.beginPath();g.moveTo(-27,-12);g.lineTo(-20,-24);g.lineTo(22,-24);g.lineTo(31,-12);g.closePath();g.fill();
  g.fillStyle=a;g.fillRect(-18,-20,34,3);g.fillStyle='#46535f';g.beginPath();g.moveTo(-10,-24);g.lineTo(-6,-35);g.lineTo(12,-35);g.lineTo(17,-24);g.closePath();g.fill();
  g.fillStyle='#1c242c';g.fillRect(15,-32,25,4);g.fillStyle=a;g.fillRect(-4,-32,8,3)}
 else if(type==='s'){const b=Math.sin(Date.now()/250)*2;g.fillStyle='#8fa3b3';g.fillRect(-20,-42+b,12,2);g.fillRect(8,-42+b,12,2);g.fillRect(-2,-42+b,4,6);
  g.fillStyle='#3a4651';g.fillRect(-11,-38+b,22,9);g.fillStyle='#1c242c';g.fillRect(-7,-29+b,14,3);g.fillStyle=a;g.fillRect(2,-36+b,7,3)}
 else{g.fillStyle='#1c242c';g.fillRect(-7,-16,6,16);g.fillRect(1,-16,6,16);g.fillStyle='#3a4651';g.fillRect(-9,-36,18,21);
  g.fillStyle=a;g.fillRect(-9,-33,4,9);g.fillStyle='#2a343e';g.fillRect(-7,-49,14,13);g.fillStyle=a;g.fillRect(0,-45,7,4);
  g.fillStyle='#10161c';g.fillRect(5,-30,type==='k'?34:20,4);if(type==='k'){g.fillStyle=a;g.fillRect(14,-34,7,3)}}
 g.restore()}
function br(x,y,c){g.strokeStyle=c;g.lineWidth=3;const s=16,p=4,x0=x*T+p,y0=y*T+p,x1=x*T+T-p,y1=y*T+T-p;
 [[x0,y0,1,1],[x1,y0,-1,1],[x0,y1,1,-1],[x1,y1,-1,-1]].forEach(([a,b,dx,dy])=>{g.beginPath();g.moveTo(a+dx*s,b);g.lineTo(a,b);g.lineTo(a,b+dy*s);g.stroke()})}
function draw(){
 g.fillStyle='#05080c';g.fillRect(0,0,800,480);
 for(let y=0;y<R;y++)for(let x=0;x<C;x++){g.fillStyle=(x+y)%2?'#0b141c':'#0d1822';g.fillRect(x*T,y*T,T,T);g.strokeStyle='#16303d';g.lineWidth=1;g.strokeRect(x*T+.5,y*T+.5,T,T);
  if(walls.has(key(x,y))){g.fillStyle='#1b232b';g.fillRect(x*T+6,y*T+10,T-12,T-20);g.fillStyle='#2a343e';g.fillRect(x*T+6,y*T+10,T-12,T-30);g.fillStyle='#ffb020';for(let i=0;i<5;i++)g.fillRect(x*T+12+i*13,y*T+14,7,4)}
  if(reach[key(x,y)]){g.fillStyle='#29e0ff29';g.fillRect(x*T+3,y*T+3,T-6,T-6);g.strokeStyle='#29e0ff88';g.strokeRect(x*T+3.5,y*T+3.5,T-7,T-7)}}
 flags.forEach(f=>{const cx=f.x*T+T/2,cy=f.y*T+T/2,c=f.o==='p'?'#29e0ff':f.o==='e'?'#ff3b4e':'#8fa3b3';
  g.beginPath();for(let i=0;i<6;i++){const an=Math.PI/3*i;g.lineTo(cx+26*Math.cos(an),cy+26*Math.sin(an))}g.closePath();g.fillStyle=c+'2a';g.fill();g.strokeStyle=c;g.lineWidth=2;g.stroke();
  g.fillStyle=c;g.fillRect(cx-3,cy-3,6,6)});
 if(sel&&units.includes(sel)){br(sel.x,sel.y,'#29e0ff');if(!sel.acted&&turn==='p')units.filter(u=>u.team==='e'&&dist(sel,u)<=sel.rg).forEach(u=>br(u.x,u.y,'#ff3b4e'))}
 units.slice().sort((a,b)=>a.y-b.y).forEach(u=>{const px=u.x*T+T/2,py=u.y*T+T-12;g.globalAlpha=u.team==='p'&&u.acted?.5:1;g.fillStyle='#0008';g.beginPath();g.ellipse(px,py,22,5,0,0,7);g.fill();unit(g,px,py,u.t,u.team,u.f);g.globalAlpha=1;
  });
 fl.forEach(f=>{f.t-=.02;g.fillStyle='#ffb020';g.strokeStyle='#000';g.lineWidth=4;g.font='700 20px Orbitron,sans-serif';g.textAlign='center';const y=f.y*T+20-(1-f.t)*30;g.strokeText(f.s,f.x*T+T/2,y);g.fillText(f.s,f.x*T+T/2,y)});fl=fl.filter(f=>f.t>0)}


['Beachhead','Hedgerows','Ruined Village','Trench Line','Fortress Hill'].forEach((n,i)=>LV[i].n=n);
const hh=(x,y)=>((x*73856093)^(y*19349663))>>>0;
function draw(){
 g.fillStyle='#3a4226';g.fillRect(0,0,800,480);
 for(let y=0;y<R;y++)for(let x=0;x<C;x++){const h=hh(x,y),r=h%100,px=x*T,py=y*T,w=walls.has(key(x,y));
  g.fillStyle=r<22?'#5b4a36':(x+y)%2?'#48512d':'#4d5732';g.fillRect(px,py,T,T);
  g.fillStyle=r<22?'#4d3e2c':'#3d4624';for(let i=0;i<6;i++){const k=(h>>(i*3))&63;g.fillRect(px+8+(k%8)*8,py+8+((k>>3)%8)*8,3,2)}
  g.fillStyle='#5d6a38';for(let i=0;i<3;i++){const k=(h>>(i*4+2))&63;g.fillRect(px+6+(k%9)*8,py+10+((k>>3)%8)*8,2,4)}
  if(!w&&r>88&&!flags.some(f=>f.x===x&&f.y===y)){g.fillStyle='#6b5d44';g.beginPath();g.ellipse(px+40,py+44,26,15,0,0,7);g.fill();g.fillStyle='#2e2a1e';g.beginPath();g.ellipse(px+40,py+46,21,11,0,0,7);g.fill()}
  g.strokeStyle='#00000026';g.lineWidth=1;g.strokeRect(px+.5,py+.5,T,T);
  if(w){g.fillStyle='#00000040';g.fillRect(px+8,py+T-12,T-14,6);
   for(let i=0;i<5;i++){const ht=34+((h>>i)&7)*5;g.fillStyle=i%2?'#7a6a5a':'#86766a';g.fillRect(px+8+i*13,py+T-10-ht,13,ht)}
   g.fillStyle='#5a4c40';for(let j=0;j<5;j++)g.fillRect(px+8,py+T-18-j*10,T-16,2);
   g.fillStyle='#5a4c40';g.fillRect(px+14,py+T-14,5,4);g.fillRect(px+54,py+T-13,6,4)}
  if(reach[key(x,y)]){g.fillStyle='#29e0ff30';g.fillRect(px+3,py+3,T-6,T-6);g.strokeStyle='#29e0ffaa';g.lineWidth=2;g.strokeRect(px+4,py+4,T-8,T-8)}}
 flags.forEach(f=>{const cx=f.x*T+T/2,cy=f.y*T+T/2+6,c=f.o==='p'?'#29e0ff':f.o==='e'?'#ff3b4e':'#cfd6dc';
  for(let i=0;i<10;i++){const an=Math.PI*2*i/10,sx=cx+26*Math.cos(an),sy=cy+17*Math.sin(an);g.fillStyle='#a8935f';g.fillRect(sx-6,sy-3,12,6);g.strokeStyle='#6e5e3a';g.lineWidth=1;g.strokeRect(sx-5.5,sy-2.5,11,5)}
  g.fillStyle='#ddd';g.fillRect(cx-1.5,cy-34,3,38);g.fillStyle=c;g.fillRect(cx+1.5,cy-34,22,13)});
 if(sel&&units.includes(sel)){br(sel.x,sel.y,'#29e0ff');if(!sel.acted&&turn==='p')units.filter(u=>u.team==='e'&&dist(sel,u)<=sel.rg).forEach(u=>br(u.x,u.y,'#ff3b4e'))}
 units.slice().sort((a,b)=>a.y-b.y).forEach(u=>{const px=u.x*T+T/2,py=u.y*T+T-12;g.globalAlpha=u.team==='p'&&u.acted?.5:1;g.fillStyle='#0006';g.beginPath();g.ellipse(px,py,22,5,0,0,7);g.fill();unit(g,px,py,u.t,u.team,u.f);g.globalAlpha=1;
  });
 fl.forEach(f=>{f.t-=.02;g.fillStyle='#ffb020';g.strokeStyle='#000';g.lineWidth=4;g.font='700 20px Orbitron,sans-serif';g.textAlign='center';const y=f.y*T+20-(1-f.t)*30;g.strokeText(f.s,f.x*T+T/2,y);g.fillText(f.s,f.x*T+T/2,y)});fl=fl.filter(f=>f.t>0)}


function attack(a,d){d.hp-=a.dm;a.f=d.x>=a.x?1:-1;a.ang=Math.atan2(d.y-a.y,d.x-a.x);fl.push({x:d.x,y:d.y,t:1,s:'-'+a.dm});if(d.hp<=0)units=units.filter(u=>u!==d)}
function unit(g,x,y,type,team,f,ang){
 const a=team==='p'?'#29e0ff':'#ff3b4e';if(ang===undefined)ang=f>0?0:Math.PI;g.save();g.translate(x,y);
 if(type==='s'){const t=Date.now()/60;g.rotate(ang+Math.PI/4);g.strokeStyle='#2a343e';g.lineWidth=4;g.beginPath();g.moveTo(-16,0);g.lineTo(16,0);g.moveTo(0,-16);g.lineTo(0,16);g.stroke();
  [[-16,0],[16,0],[0,-16],[0,16]].forEach(([px,py])=>{g.fillStyle='#8fa3b355';g.beginPath();g.arc(px,py,9,0,7);g.fill();g.strokeStyle='#cfd6dc';g.lineWidth=1.5;g.save();g.translate(px,py);g.rotate(t);g.beginPath();g.moveTo(-9,0);g.lineTo(9,0);g.stroke();g.restore()});
  g.rotate(-Math.PI/4);g.fillStyle='#3a4651';g.beginPath();g.arc(0,0,7,0,7);g.fill();g.fillStyle=a;g.fillRect(2,-2,5,4)}
 else{g.rotate(ang);
  if(type==='t'){g.fillStyle='#10161c';g.fillRect(-30,-23,60,9);g.fillRect(-30,14,60,9);g.fillStyle='#2a343e';for(let i=0;i<10;i++){g.fillRect(-28+i*6,-23,2,9);g.fillRect(-28+i*6,14,2,9)}
   g.fillStyle='#3a4651';g.fillRect(-27,-15,54,30);g.fillStyle=a;g.fillRect(-25,-4,12,8);g.fillStyle='#2f3a44';g.fillRect(14,-12,10,24);
   g.fillStyle='#1c242c';g.fillRect(6,-2.5,34,5);g.fillStyle='#46535f';g.beginPath();g.arc(-2,0,12,0,7);g.fill();g.fillStyle=a;g.beginPath();g.arc(-5,0,4,0,7);g.fill()}
  else{g.fillStyle='#2a343e';g.fillRect(-10,-7,6,14);g.fillStyle='#3a4651';g.beginPath();g.ellipse(0,0,7,14,0,0,7);g.fill();g.fillStyle=a;g.fillRect(-3,-15,7,3);g.fillRect(-3,12,7,3);
   g.fillStyle='#2a343e';g.beginPath();g.arc(1,0,6.5,0,7);g.fill();g.fillStyle=a;g.fillRect(4,-3,3,6);
   g.fillStyle='#10161c';g.fillRect(4,5,type==='k'?34:22,3);if(type==='k'){g.fillStyle=a;g.fillRect(14,3.5,6,2.5)}}}
 g.restore()}
function drawSel(){const b=$('#armies');b.innerHTML='';AR.forEach((a,i)=>{const d=document.createElement('button');d.className='card'+(save.pick===i?' sel':'');
 d.innerHTML='<canvas width="150" height="90"></canvas><b>'+a.n+'</b><p>'+a.d+'</p>';const c=d.querySelector('canvas').getContext('2d');
 c.fillStyle='#48512d';c.fillRect(0,0,150,90);[[24,'r'],[76,'t'],[122,'k']].forEach(([x,t])=>{c.save();c.translate(x,45);c.scale(.8,.8);unit(c,0,0,t,'p',1);c.restore()});
 d.onclick=()=>{save.pick=i;drawSel()};b.appendChild(d)})}
function draw(){
 g.fillStyle='#3a4226';g.fillRect(0,0,800,480);
 for(let y=0;y<R;y++)for(let x=0;x<C;x++){const h=hh(x,y),r=h%100,px=x*T,py=y*T,w=walls.has(key(x,y));
  g.fillStyle=r<22?'#5b4a36':(x+y)%2?'#48512d':'#4d5732';g.fillRect(px,py,T,T);
  g.fillStyle=r<22?'#4d3e2c':'#3d4624';for(let i=0;i<6;i++){const k=(h>>(i*3))&63;g.fillRect(px+8+(k%8)*8,py+8+((k>>3)%8)*8,3,3)}
  g.fillStyle='#5d6a38';for(let i=0;i<3;i++){const k=(h>>(i*4+2))&63;g.fillRect(px+6+(k%9)*8,py+10+((k>>3)%8)*8,2,2)}
  if(!w&&r>88&&!flags.some(f=>f.x===x&&f.y===y)){g.fillStyle='#6b5d44';g.beginPath();g.ellipse(px+40,py+40,27,24,0,0,7);g.fill();g.fillStyle='#2e2a1e';g.beginPath();g.ellipse(px+40,py+41,21,18,0,0,7);g.fill()}
  g.strokeStyle='#00000022';g.lineWidth=1;g.strokeRect(px+.5,py+.5,T,T);
  if(w){const j=k=>((h>>k)&7)-3,P=[[8,8],[40,6+j(0)],[72,9],[73+j(3),40],[71,72],[40,74+j(6)],[9,71],[7+j(9),40]];
   const path=o=>{g.beginPath();P.forEach(([a,b],i)=>i?g.lineTo(px+a+o,py+b+o):g.moveTo(px+a+o,py+b+o));g.closePath()};
   path(5);g.fillStyle='#00000055';g.fill();path(0);g.fillStyle='#86766a';g.fill();g.save();path(0);g.clip();g.strokeStyle='#5a4c40';g.lineWidth=2;
   for(let i=1;i<8;i++){g.beginPath();g.moveTo(px,py+i*10);g.lineTo(px+T,py+i*10);g.stroke();for(let k=0;k<4;k++){g.beginPath();g.moveTo(px+k*20+(i%2)*10,py+i*10-10);g.lineTo(px+k*20+(i%2)*10,py+i*10);g.stroke()}}
   g.fillStyle='#6b5d4e';g.fillRect(px+20+j(1)*3,py+20,14,10);g.fillRect(px+46,py+44+j(4)*2,16,12);g.restore();path(0);g.strokeStyle='#4a3f35';g.lineWidth=2;g.stroke();
   g.fillStyle='#6b5d4e';for(let i=0;i<4;i++)g.fillRect(px+4+((h>>(i*5))&31)*2,py+((i%2)?T-6:3),4,3)}
  if(reach[key(x,y)]){g.fillStyle='#29e0ff30';g.fillRect(px+3,py+3,T-6,T-6);g.strokeStyle='#29e0ffaa';g.lineWidth=2;g.strokeRect(px+4,py+4,T-8,T-8)}}
 flags.forEach(f=>{const cx=f.x*T+T/2,cy=f.y*T+T/2,c=f.o==='p'?'#29e0ff':f.o==='e'?'#ff3b4e':'#cfd6dc';
  g.fillStyle='#00000030';g.beginPath();g.arc(cx,cy,23,0,7);g.fill();g.strokeStyle=c;g.lineWidth=2;g.beginPath();g.arc(cx,cy,19,0,7);g.stroke();
  for(let i=0;i<12;i++){const an=Math.PI*2*i/12;g.save();g.translate(cx+28*Math.cos(an),cy+28*Math.sin(an));g.rotate(an+Math.PI/2);g.fillStyle='#a8935f';g.fillRect(-8,-4,16,8);g.strokeStyle='#6e5e3a';g.lineWidth=1;g.strokeRect(-7.5,-3.5,15,7);g.restore()}
  g.fillStyle=c;g.fillRect(cx+2,cy-8,18,11);g.fillStyle='#eee';g.beginPath();g.arc(cx,cy,3.5,0,7);g.fill()});
 if(sel&&units.includes(sel)){br(sel.x,sel.y,'#29e0ff');if(!sel.acted&&turn==='p')units.filter(u=>u.team==='e'&&dist(sel,u)<=sel.rg).forEach(u=>br(u.x,u.y,'#ff3b4e'))}
 units.slice().sort((a,b)=>a.y-b.y).forEach(u=>{const px=u.x*T+T/2,py=u.y*T+T/2-4;
  if(u.ang===undefined)u.ang=u.f>0?0:Math.PI;if(u._lx!==undefined&&(u._lx!==u.x||u._ly!==u.y))u.ang=Math.atan2(u.y-u._ly,u.x-u._lx);u._lx=u.x;u._ly=u.y;
  g.globalAlpha=u.team==='p'&&u.acted?.5:1;g.fillStyle='#00000055';g.beginPath();g.ellipse(px+5,py+7,u.t==='t'?30:16,u.t==='t'?22:15,0,0,7);g.fill();unit(g,px,py,u.t,u.team,u.f,u.ang);g.globalAlpha=1;
  });
 fl.forEach(f=>{f.t-=.02;g.fillStyle='#ffb020';g.strokeStyle='#000';g.lineWidth=4;g.font='700 20px Orbitron,sans-serif';g.textAlign='center';const y=f.y*T+20-(1-f.t)*30;g.strokeText(f.s,f.x*T+T/2,y);g.fillText(f.s,f.x*T+T/2,y)});fl=fl.filter(f=>f.t>0)}


U.r.n='Rifleman';U.t.n='Tank';U.s.n='Scout Jeep';U.k.n='Sniper';
AR[0].n='101st Airborne';AR[1].n='Desert Rats';AR[2].n='Red Army';
const UC={p:{u:'#b8a574',h:'#6b7a45',a:'#4a90d9',v:'#6b7340',v2:'#58612f'},e:{u:'#8a8f94',h:'#4d5258',a:'#d9483b',v:'#70747a',v2:'#5a5e63'}};
function unit(g,x,y,type,team,f,ang){
 const k=UC[team];if(ang===undefined)ang=f>0?0:Math.PI;g.save();g.translate(x,y);g.rotate(ang);
 if(type==='t'){g.fillStyle='#24241f';g.fillRect(-31,-24,62,10);g.fillRect(-31,14,62,10);g.fillStyle='#3b3b33';for(let i=0;i<10;i++){g.fillRect(-29+i*6,-24,2,10);g.fillRect(-29+i*6,14,2,10)}
  g.fillStyle=k.v;g.fillRect(-28,-15,56,30);g.fillStyle=k.v2;g.fillRect(-28,-15,14,30);g.fillRect(20,-15,8,30);g.fillStyle='#00000045';for(let i=0;i<4;i++)g.fillRect(-26+i*3.5,-12,1.5,24);
  g.fillStyle=k.a;g.fillRect(-28,-15,3,30);g.fillStyle=k.v;g.beginPath();g.ellipse(-2,0,14,12,0,0,7);g.fill();g.strokeStyle=k.v2;g.lineWidth=2;g.stroke();
  g.fillStyle='#2a2a26';g.fillRect(10,-2.5,32,5);g.fillRect(40,-3.5,4,7);g.fillStyle=k.v2;g.beginPath();g.arc(-6,-4,4,0,7);g.fill();
  g.fillStyle='#000a';g.beginPath();g.arc(-9,5,4.5,0,7);g.fill();g.fillStyle='#f3ead0';if(team==='p'){g.beginPath();g.arc(-9,5,3.2,0,7);g.fill()}else{g.fillRect(-13,3.8,8,2.4);g.fillRect(-10.2,1,2.4,8)}}
 else if(type==='s'){g.fillStyle='#1a1a17';g.fillRect(-14,-13,9,5);g.fillRect(-14,8,9,5);g.fillRect(8,-13,9,5);g.fillRect(8,8,9,5);
  g.fillStyle=k.v;g.fillRect(-17,-9,34,18);g.fillStyle=k.v2;g.fillRect(6,-8,11,16);g.fillStyle='#1a1a17';g.fillRect(4,-8,2,16);g.fillStyle='#3a2f1c';g.fillRect(-12,-6,6,5);g.fillRect(-12,1,6,5);
  g.fillStyle=k.a;g.fillRect(-17,-9,3,18);g.fillStyle='#1a1a17';g.fillRect(-2,-1.5,16,3);g.fillStyle='#f3ead0';g.beginPath();g.arc(11,0,2.5,0,7);g.fill()}
 else{g.fillStyle='#6b5d3a';g.fillRect(-10,-7,6,14);g.fillStyle=k.u;g.beginPath();g.ellipse(0,0,7,14,0,0,7);g.fill();g.fillStyle=k.a;g.fillRect(-3,-15,7,3);
  g.fillStyle=k.u;g.fillRect(-3,12,7,3);g.fillStyle=k.h;g.beginPath();g.arc(1,0,7,0,7);g.fill();g.strokeStyle='#00000066';g.lineWidth=1.5;g.stroke();
  g.fillStyle='#5a3d22';g.fillRect(3,5,10,3);g.fillStyle='#2a2a26';g.fillRect(13,5.5,type==='k'?24:12,2);if(type==='k'){g.fillStyle='#2a2a26';g.fillRect(16,3.5,8,2)}}
 g.restore()}
let s=draw.toString();
s=s.replace("u.team==='p'?'#29e0ff':'#ff3b4e'","u.team==='p'?'#5aa0e0':'#d9483b'").replace("f.o==='p'?'#29e0ff':f.o==='e'?'#ff3b4e':'#cfd6dc'","f.o==='p'?'#5aa0e0':f.o==='e'?'#d9483b':'#cfd6dc'").replace(/#29e0ff/g,'#f2e6a0').replace(/#ff3b4e/g,'#e0482f').replace(/#ffb020/g,'#fff2b0').replace(/Orbitron,sans-serif/g,'Stardos Stencil,Impact,sans-serif');
(0,eval)(s);


const ROS=['r','m'],DESC={r:'Reliable infantry. A solid all-round fighter.',m:'Anti-tank specialist with a shoulder launcher. Long range, slow, fragile. +6 damage against tanks.'};
if(!Array.isArray(save.squad))save.squad=['r','r','r','m'];
let eq=false,insp='r';
const _u=unit;unit=function(g,x,y,type,team,f,ang){if(type!=='m')return _u(g,x,y,type,team,f,ang);_u(g,x,y,'r',team,f,ang);
 if(ang===undefined)ang=f>0?0:Math.PI;g.save();g.translate(x,y);g.rotate(ang);g.fillStyle='#4a5230';g.fillRect(-12,-9,38,6);g.fillStyle='#2a2a26';g.fillRect(24,-10,5,8);g.fillStyle='#d9a441';g.fillRect(-12,-9,3,6);g.restore()};
attack=function(a,d){const dm=a.dm+(a.t==='m'&&d.t==='t'?6:0);d.hp-=dm;a.f=d.x>=a.x?1:-1;a.ang=Math.atan2(d.y-a.y,d.x-a.x);fl.push({x:d.x,y:d.y,t:1,s:'-'+dm});if(d.hp<=0)units=units.filter(u=>u!==d)};
place=function(s,team,cols){if(team==='p')s=save.squad.slice(0,L.me.length);const rows=[2,3,1,4,0,5];let n=0;const a=AR[save.pick];
 for(const col of cols)for(const y of rows){if(n>=s.length)return;if(walls.has(key(col,y))||flags.some(f=>f.x===col&&f.y===y))continue;
  const t=s[n++],b=U[t];const u={t,team,x:col,y,hp:b.hp,max:b.hp,mv:b.mv,rg:b.rg,dm:b.dm,moved:false,acted:false,f:team==='p'?1:-1};
  if(team==='p'){u.hp+=a.hp;u.max+=a.hp;u.mv+=a.mv;u.dm+=a.dm}
  if(team==='e'&&L.boss&&n===1){u.hp=u.max=40;u.dm+=2}units.push(u)}};
function drawLobby(){
 $('#bEquip').textContent='Equip mode: '+(eq?'on':'off');$('#bEquip').className=eq?'':'alt';
 $('#lhint').textContent=eq?'Tap a unit to add it to your squad. Tap a squad slot to remove it.':'Tap a unit to inspect it. Turn on equip mode to build your squad.';
 const rb=$('#roster');rb.innerHTML='';
 ROS.forEach(t=>{const u=U[t],d=document.createElement('button');d.className='card'+(!eq&&insp===t?' sel':'');
  d.innerHTML='<canvas width="150" height="90"></canvas><b>'+u.n+'</b><p>'+DESC[t]+'</p><p>HP '+u.hp+' · Move '+u.mv+' · Range '+u.rg+' · Damage '+u.dm+'</p>';
  const c=d.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,150,90);c.save();c.translate(75,45);c.scale(1.2,1.2);unit(c,0,0,t,'p',1);c.restore();
  d.onclick=()=>{if(eq){if(save.squad.length<6){save.squad.push(t);store()}}else insp=t;drawLobby()};rb.appendChild(d)});
 const sb=$('#slots');sb.innerHTML='';
 for(let i=0;i<6;i++){const t=save.squad[i],d=document.createElement('button');d.className='card';d.style.cssText='width:100px;padding:8px;min-width:0';
  d.innerHTML=t?'<canvas width="80" height="56"></canvas><b style="font-size:13px">'+U[t].n+'</b>':'<div style="height:56px;line-height:56px;color:#8a8f7a">Empty</div><b style="font-size:13px">Slot '+(i+1)+'</b>';
  if(t){const c=d.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,80,56);c.save();c.translate(40,28);unit(c,0,0,t,'p',1);c.restore()}
  d.onclick=()=>{if(eq&&t){save.squad.splice(i,1);store();drawLobby()}};sb.appendChild(d)}
 $('#cnt').textContent='Squad '+save.squad.length+'/6'}
const _sh=show;show=function(id){_sh(id);if(id==='lobby')drawLobby()};
const _dc=drawCamp;drawCamp=function(){_dc();$('#who').textContent='Army: '+AR[save.pick].n+' · Squad: '+(save.squad.map(t=>t==='r'?'Rifleman':'Missile').join(', ')||'empty')+' · You place your whole squad at the start of each battle (Training Camp is set up for you)'};
const _st=start;start=function(i){if(!save.squad.length){eq=true;show('lobby');$('#lhint').textContent='Equip at least one unit before a battle.';return}_st(i)};
$('#bLobby').onclick=()=>show('lobby');$('#bEquip').onclick=()=>{eq=!eq;drawLobby()};$('#bGo').onclick=()=>show('campaign');


let pl=null;
const _pl=place;place=function(s,team,cols){if(team==='p')return;_pl(s,team,cols)};
const freeTile=(x,y)=>x<2&&!walls.has(key(x,y))&&!flags.some(f=>f.x===x&&f.y===y)&&!at(x,y);
function mk(t,x,y){const b=U[t],a=AR[save.pick];return{t,team:'p',x,y,hp:b.hp+a.hp,max:b.hp+a.hp,mv:b.mv+a.mv,rg:b.rg,dm:b.dm+a.dm,moved:false,acted:false,f:1}}
function trayHide(){$('#tray').style.display='none'}
function refresh(){reach={};for(let y=0;y<R;y++)for(let x=0;x<2;x++)if(freeTile(x,y))reach[key(x,y)]=1;
 sel=pl.cur!=null?(pl.at[pl.cur]||null):null;const n=Object.keys(pl.at).length,tr=$('#tray');tr.innerHTML='';tr.style.display='flex';
 pl.sq.forEach((t,i)=>{const b=document.createElement('button');b.className='card'+(pl.cur===i?' sel':'');b.style.cssText='width:84px;padding:6px;min-width:0'+(pl.at[i]?';opacity:.6':'');
  b.innerHTML='<canvas width="60" height="40"></canvas><b style="font-size:12px">'+U[t].n.split(' ')[0]+(pl.at[i]?' ✓':'')+'</b>';
  const c=b.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,60,40);c.save();c.translate(30,20);c.scale(.6,.6);unit(c,0,0,t,'p',1);c.restore();
  b.onclick=()=>{pl.cur=i;refresh()};tr.appendChild(b)});
 const au=document.createElement('button');au.className='back';au.textContent='Auto place';au.onclick=autoPlace;tr.appendChild(au);
 const go=document.createElement('button');go.textContent='Start battle';go.disabled=!n;go.onclick=goBattle;tr.appendChild(go);
 info('Deployed '+n+'/'+pl.cap+'. Pick a unit below, then tap a highlighted tile. Tap a placed unit twice to remove it.')}
function beginPlace(){if(!save.squad.length)return;pl={cap:L.me.length,sq:save.squad.slice(),at:{},cur:null};turn='x';ui('Deploy');refresh()}
function autoPlace(){const order=[];for(const x of[0,1])for(const y of[2,3,1,4,0,5])order.push([x,y]);
 pl.sq.forEach((t,i)=>{if(pl.at[i]||Object.keys(pl.at).length>=pl.cap)return;const s=order.find(([x,y])=>freeTile(x,y));if(!s)return;const u=mk(t,s[0],s[1]);units.push(u);pl.at[i]=u});pl.cur=null;refresh()}
function goBattle(){if(!Object.keys(pl.at).length)return;start0=units.filter(u=>u.team==='p').length;pl=null;turn='p';reach={};sel=null;trayHide();ui('Your turn');info('Tap one of your units to begin.')}
cv.addEventListener('click',e=>{if(turn!=='x'||!pl)return;const r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*C),y=Math.floor((e.clientY-r.top)/r.height*R),u0=at(x,y);
 if(u0&&u0.team==='p'){const idx=+Object.keys(pl.at).find(k=>pl.at[k]===u0);if(pl.cur===idx){units=units.filter(u=>u!==u0);delete pl.at[idx];pl.cur=null}else pl.cur=idx;refresh();return}
 if(pl.cur==null){info('Pick a unit from the tray first.');return}
 if(!freeTile(x,y)){info('Deploy only on the highlighted tiles.');return}
 const p0=pl.at[pl.cur];if(p0){p0.x=x;p0.y=y}else{if(Object.keys(pl.at).length>=pl.cap){info('Unit limit reached ('+pl.cap+'). Tap a placed unit twice to remove it.');return}const u=mk(pl.sq[pl.cur],x,y);units.push(u);pl.at[pl.cur]=u}
 refresh()});
const _st2=start;start=function(i){_st2(i);if(save.squad.length)beginPlace()};
const _sh2=show;show=function(id){_sh2(id);if(id!=='game')trayHide()};


const START_MONEY=120,COST={r:20,m:25};
const funds=()=>START_MONEY-save.squad.reduce((a,t)=>a+COST[t],0);
while(funds()<0)save.squad.pop();
LV[0].n='Training Camp';
beginPlace=function(){if(!save.squad.length)return;pl={cap:save.squad.length,sq:save.squad.slice(),at:{},cur:null};turn='x';ui('Deploy');refresh()};
drawLobby=function(){
 $('#bEquip').textContent='Equip mode: '+(eq?'on':'off');$('#bEquip').className=eq?'':'alt';
 $('#lhint').textContent=eq?'Tap a unit to buy it into your squad. Tap a squad slot to remove it and get a refund.':'Tap a unit to inspect it. Turn on equip mode to build your squad.';
 const rb=$('#roster');rb.innerHTML='';
 ROS.forEach(t=>{const u=U[t],d=document.createElement('button');d.className='card'+(!eq&&insp===t?' sel':'');
  d.innerHTML='<canvas width="150" height="90"></canvas><b>'+u.n+' · $'+COST[t]+'</b><p>'+DESC[t]+'</p><p>HP '+u.hp+' · Move '+u.mv+' · Range '+u.rg+' · Damage '+u.dm+'</p>';
  const c=d.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,150,90);c.save();c.translate(75,45);c.scale(1.2,1.2);unit(c,0,0,t,'p',1);c.restore();
  d.onclick=()=>{if(!eq){insp=t;drawLobby();return}if(funds()>=COST[t]&&save.squad.length<6){save.squad.push(t);store();drawLobby()}else{drawLobby();$('#lhint').textContent=funds()<COST[t]?'Not enough money for a '+u.n+'.':'Your squad is full.'}};rb.appendChild(d)});
 const sb=$('#slots');sb.innerHTML='';
 for(let i=0;i<6;i++){const t=save.squad[i],d=document.createElement('button');d.className='card';d.style.cssText='width:100px;padding:8px;min-width:0';
  d.innerHTML=t?'<canvas width="80" height="56"></canvas><b style="font-size:13px">'+U[t].n+'</b>':'<div style="height:56px;line-height:56px;color:#8a8f7a">Empty</div><b style="font-size:13px">Slot '+(i+1)+'</b>';
  if(t){const c=d.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,80,56);c.save();c.translate(40,28);unit(c,0,0,t,'p',1);c.restore()}
  d.onclick=()=>{if(eq&&t){save.squad.splice(i,1);store();drawLobby()}};sb.appendChild(d)}
 $('#cnt').textContent='Squad '+save.squad.length+' · Money $'+funds()};
function trainSet(){trayHide();const order=[];for(const x of[0,1])for(const y of[2,3,1,4,0,5])order.push([x,y]);
 ['r','r','m'].forEach(t=>{const s=order.find(([x,y])=>freeTile(x,y));units.push(mk(t,s[0],s[1]))});
 start0=units.filter(u=>u.team==='p').length;pl=null;turn='p';reach={};sel=null;ui('Your turn');info('Training Camp: the game has set up your squad. Tap a unit to begin.')}
const _st3=start;start=function(i){if(i===0){_st(0);trainSet()}else _st3(i)};


let training=false,spawnSel=null,bm=120,bld=[],lost=0;
AR.forEach(a=>{a.hp=a.mv=a.dm=0});['Olive drab and khaki. Cosmetic only.','Sandy desert uniforms. Cosmetic only.','Brown-green greatcoats. Cosmetic only.'].forEach((d,i)=>AR[i].d=d);
const SK=[{u:'#b8a574',h:'#6b7a45',v:'#6b7340',v2:'#58612f'},{u:'#c9b27a',h:'#8a7a4a',v:'#b09a60',v2:'#8f7c46'},{u:'#7a6a4a',h:'#5a5f3a',v:'#5a6e3a',v2:'#46582c'}];
const applySkin=()=>Object.assign(UC.p,SK[save.pick]);applySkin();
if(!Array.isArray(save.loadout))save.loadout=['r','m'];save.loadout=save.loadout.filter(t=>ROS.includes(t)).slice(0,4);
drawSel=function(){const b=$('#armies');b.innerHTML='';AR.forEach((a,i)=>{const d=document.createElement('button');d.className='card'+(save.pick===i?' sel':'');
 d.innerHTML='<canvas width="150" height="90"></canvas><b>'+a.n+'</b><p>'+a.d+'</p>';const c=d.querySelector('canvas').getContext('2d');Object.assign(UC.p,SK[i]);
 c.fillStyle='#48512d';c.fillRect(0,0,150,90);[[24,'r'],[76,'t'],[122,'m']].forEach(([x,t])=>{c.save();c.translate(x,45);c.scale(.8,.8);unit(c,0,0,t,'p',1);c.restore()});applySkin();
 d.onclick=()=>{save.pick=i;store();applySkin();drawSel()};b.appendChild(d)})};
const _sh3=show;show=function(id){_sh3(id);applySkin()};
drawLobby=function(){
 $('#bEquip').textContent='Equip mode: '+(eq?'on':'off');$('#bEquip').className=eq?'':'alt';
 $('#lhint').textContent=eq?'Tap a unit type to equip it (max 4 types). Tap an equipped slot to remove it. In battle you can spawn equipped types as often as your money allows.':'Tap a unit type to inspect it. Turn on equip mode to choose your loadout.';
 const rb=$('#roster');rb.innerHTML='';
 ROS.forEach(t=>{const u=U[t],on=save.loadout.includes(t),d=document.createElement('button');d.className='card'+((!eq&&insp===t)||(eq&&on)?' sel':'');
  d.innerHTML='<canvas width="150" height="90"></canvas><b>'+u.n+' · $'+COST[t]+'</b><p>'+DESC[t]+'</p><p>HP '+u.hp+' · Move '+u.mv+' · Range '+u.rg+' · Damage '+u.dm+'</p>'+(on?'<p>Equipped</p>':'');
  const c=d.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,150,90);c.save();c.translate(75,45);c.scale(1.2,1.2);unit(c,0,0,t,'p',1);c.restore();
  d.onclick=()=>{if(!eq){insp=t;drawLobby();return}if(on)save.loadout=save.loadout.filter(x=>x!==t);else if(save.loadout.length<4)save.loadout.push(t);store();drawLobby()};rb.appendChild(d)});
 const sb=$('#slots');sb.innerHTML='';
 for(let i=0;i<4;i++){const t=save.loadout[i],d=document.createElement('button');d.className='card';d.style.cssText='width:110px;padding:8px;min-width:0';
  d.innerHTML=t?'<canvas width="80" height="56"></canvas><b style="font-size:13px">'+U[t].n+'</b>':'<div style="height:56px;line-height:56px;color:#8a8f7a">Empty</div><b style="font-size:13px">Slot '+(i+1)+'</b>';
  if(t){const c=d.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,80,56);c.save();c.translate(40,28);unit(c,0,0,t,'p',1);c.restore()}
  d.onclick=()=>{if(eq&&t){save.loadout.splice(i,1);store();drawLobby()}};sb.appendChild(d)}
 $('#cnt').textContent='Loadout '+save.loadout.length+'/4 · Battle money $'+START_MONEY};
const _dc2=drawCamp;drawCamp=function(){_dc2();$('#who').textContent='Skin: '+AR[save.pick].n+' · Loadout: '+(save.loadout.map(t=>U[t].n).join(', ')||'empty')+' · Spawn units from your barracks with $'+START_MONEY+' (Training Camp is set up for you)'};
ui=function(t){$('#turn').textContent=t+' · Turn '+tc;$('#fl').textContent='Flags '+flags.filter(f=>f.o==='p').length+'/'+flags.length+(training?'':' · $'+bm);$('#end').disabled=turn!=='p'||over;if(turn!=='p')spawnSel=null;buildTray()};
function spawnTiles(){const b=bld[0],o=[];if(!b)return o;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const x=b.x+dx,y=b.y+dy;if(Math.abs(dx)+Math.abs(dy)!==1||x<0||y<0||x>=C||y>=R||walls.has(key(x,y))||flags.some(f=>f.x===x&&f.y===y)||at(x,y))continue;o.push([x,y])}return o}
function showSpawn(){reach={};if(spawnSel)spawnTiles().forEach(([x,y])=>reach[key(x,y)]=1)}
function buildTray(){const tr=$('#tray');if(training||over||turn!=='p'||!bld.length){trayHide();return}
 tr.innerHTML='';tr.style.display='flex';
 save.loadout.forEach(t=>{const ok=bm>=COST[t],b=document.createElement('button');b.className='card'+(spawnSel===t?' sel':'');b.style.cssText='width:104px;padding:6px;min-width:0'+(ok?'':';opacity:.45');
  b.innerHTML='<canvas width="60" height="40"></canvas><b style="font-size:12px">'+U[t].n+'</b><p style="font-size:12px">$'+COST[t]+'</p>';
  const c=b.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,60,40);c.save();c.translate(30,20);c.scale(.6,.6);unit(c,0,0,t,'p',1);c.restore();
  b.onclick=()=>{if(!ok||turn!=='p'||over)return;spawnSel=spawnSel===t?null:t;sel=null;showSpawn();info(spawnSel?'Tap a highlighted tile next to your barracks to spawn a '+U[t].n+'.':'Spawn cancelled.');buildTray()};tr.appendChild(b)});
 if(!save.loadout.length){tr.innerHTML='<p>No unit types equipped. Equip some in the lobby.</p>'}}
cv.addEventListener('click',e=>{if(turn!=='p'||over||!spawnSel||training)return;const r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*C),y=Math.floor((e.clientY-r.top)/r.height*R);
 if(at(x,y)){spawnSel=null;buildTray();return}
 if(spawnTiles().some(([a,b])=>a===x&&b===y)&&bm>=COST[spawnSel]){const u=mk(spawnSel,x,y);u.moved=u.acted=true;units.push(u);bm-=COST[spawnSel];info('Spawned a '+U[spawnSel].n+'. Money $'+bm+'.');if(bm<COST[spawnSel])spawnSel=null;ui('Your turn')}
 else info('Spawn only on the highlighted tiles next to your barracks.');
 showSpawn();buildTray()});
const _bf=bfs;bfs=function(u){const ks=bld.map(b=>key(b.x,b.y)).filter(k=>!walls.has(k));ks.forEach(k=>walls.add(k));const o=_bf(u);ks.forEach(k=>walls.delete(k));return o};
attack=function(a,d){const dm=a.dm+(a.t==='m'&&d.t==='t'?6:0);d.hp-=dm;a.f=d.x>=a.x?1:-1;a.ang=Math.atan2(d.y-a.y,d.x-a.x);fl.push({x:d.x,y:d.y,t:1,s:'-'+dm});if(d.hp<=0){if(d.team==='p')lost++;units=units.filter(u=>u!==d)}};
P3=function(){return lost===0?3:lost<=2?2:1};
const canSpawn=()=>!training&&save.loadout.some(t=>COST[t]<=bm);
check=function(){ui(turn==='p'?'Your turn':'Enemy turn');const P=units.filter(u=>u.team==='p').length,E=units.filter(u=>u.team==='e').length;
 if(!E||(flags.length&&flags.every(f=>f.o==='p')))return fin(true);if((!P&&!canSpawn())||(flags.length&&flags.every(f=>f.o==='e')))return fin(false);return false};
const _d=draw;draw=function(){_d();bld.forEach(b=>{const px=b.x*T,py=b.y*T;g.fillStyle='#00000055';g.fillRect(px+10,py+11,66,62);g.fillStyle='#6e6350';g.fillRect(px+6,py+6,68,68);g.fillStyle='#8a7b62';g.fillRect(px+10,py+10,60,60);
 g.strokeStyle='#5e5240';g.lineWidth=2;for(let i=1;i<6;i++){g.beginPath();g.moveTo(px+10+i*10,py+10);g.lineTo(px+10+i*10,py+70);g.stroke()}
 g.fillStyle='#f3ead0';g.fillRect(px+13,py+12,2,28);g.fillStyle='#5aa0e0';g.fillRect(px+15,py+12,18,12);g.font='700 11px Stardos Stencil,Impact,sans-serif';g.textAlign='center';g.fillStyle='#2b2418';g.fillText('Barracks',px+44,py+58)})};
start=function(i){_st(i);lost=0;training=i===0;spawnSel=null;bm=START_MONEY;bld=[];pl=null;trayHide();
 if(training){trainSet();return}
 const rows=[2,3,1,4,0,5];const y=rows.find(y=>!walls.has(key(0,y))&&!flags.some(f=>f.x===0&&f.y===y));bld.push({x:0,y,team:'p'});
 turn='p';start0=0;reach={};sel=null;ui('Your turn');info('Pick a unit type below, then tap a tile next to your barracks to spawn it.')};


let pf=[],prevT='p',dragging=null,dpath=[],dragged=false,skillMode=false,lastT=performance.now();
const SKILL={r:{n:'Grenade',rg:3,cd:3,hit:(x,y)=>[[x,y,6],[x+1,y,3],[x-1,y,3],[x,y+1,3],[x,y-1,3]]},m:{n:'Rocket Salvo',rg:5,cd:4,hit:(x,y)=>[[x,y,10]]}};
let busy=()=>units.some(u=>u.anim);const tileAt=e=>{const r=cv.getBoundingClientRect();return[Math.floor((e.clientX-r.left)/r.width*C),Math.floor((e.clientY-r.top)/r.height*R)]};
const blocked=(x,y,self)=>x<0||y<0||x>=C||y>=R||(walls.has(key(x,y))&&!(tb.has(key(x,y))&&self&&self.cls==='inf'))||bld.some(b=>b.x===x&&b.y===y)||!canEnter(self,x,y)||(at(x,y)&&at(x,y)!==self);
function findPath(sx,sy,dx,dy,self){const q=[[sx,sy]],prev={};prev[key(sx,sy)]=null;
 while(q.length){const[x,y]=q.shift();if(x===dx&&y===dy){const p=[];let k=key(x,y);while(prev[k]){const[a,b]=k.split(',').map(Number);p.unshift([a,b]);k=prev[k]}return p}
  for(const[ax,ay]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+ax,ny=y+ay,nk=key(nx,ny);if(nk in prev||blocked(nx,ny,self))continue;prev[nk]=key(x,y);q.push([nx,ny])}}return null}
function startAnim(u,pts){u.anim={pts,i:0,p:0};u.vx=pts[0][0];u.vy=pts[0][1]}
function tick(dt){units.forEach(u=>{const a=u.anim;if(!a)return;let s=7*dt;
 while(s>0&&a.i<a.pts.length-1){a.p+=s;if(a.p>=1){s=a.p-1;a.p=0;a.i++}else s=0}
 if(a.i>=a.pts.length-1){u.vx=u.x;u.vy=u.y;delete u.anim;u._lx=u.x;u._ly=u.y}
 else{const[x0,y0]=a.pts[a.i],[x1,y1]=a.pts[a.i+1];u.vx=x0+(x1-x0)*a.p;u.vy=y0+(y1-y0)*a.p}})}
const _u2=unit;unit=function(g2,x,y,type,team,f,ang){const tx=(x-T/2)/T,ty=(y+4-T/2)/T;
 if(g2!==g||(Math.abs(tx-Math.round(tx))<.01&&Math.abs(ty-Math.round(ty))<.01))return _u2(g2,x,y,type,team,f,ang);
 const t=Date.now();if(ang===undefined)ang=f>0?0:Math.PI;g2.save();
 if(type!=='t'&&type!=='s'){g2.translate(x,y);g2.rotate(ang);const s=Math.sin(t/90)*6;g2.fillStyle='#2a2a26';g2.fillRect(s-4,-8,9,5);g2.fillRect(-s-4,3,9,5);g2.rotate(-ang);g2.translate(-x,-y)}
 g2.translate(x,y+(type==='s'?Math.sin(t/60):0));g2.rotate(Math.sin(t/65)*(type==='t'?.03:.1));g2.translate(-x,-y);_u2(g2,x,y,type,team,f,ang);g2.restore()};
attack=function(a,d){const dm=a.dm+(a.t==='m'&&d.t==='t'?6:0);d.hp-=dm;a.f=d.x>=a.x?1:-1;a.ang=Math.atan2(d.y-a.y,d.x-a.x);fl.push({x:d.x,y:d.y,t:1,s:'-'+dm});
 for(let i=0;i<7;i++)pf.push({x:d.x*T+40,y:d.y*T+36,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:.4,c:'#ffd34d'});if(d.hp<=0){if(d.team==='p')lost++;units=units.filter(u=>u!==d)}};
const _ai=ai;ai=function(e){const sx=e.x,sy=e.y;_ai(e);if((e.x!==sx||e.y!==sy)&&units.includes(e)){const p=findPath(sx,sy,e.x,e.y,e);startAnim(e,[[sx,sy],...(p||[[e.x,e.y]])])}};
const _ui=ui;ui=function(t){if(turn==='p'&&prevT==='e'&&!over){units.forEach(u=>{if(u.team==='p'&&u.cd>0)u.cd--});
  if(!training&&bld.length){const n=flags.filter(f=>f.o==='p').length,inc=10+5*n;bm+=inc;fl.push({x:bld[0].x,y:bld[0].y,t:1,s:'+$'+inc});setTimeout(()=>info('Turn '+tc+': income +$'+inc+' ('+n+' flags held).'),0)}}
 prevT=turn;if(turn!=='p')skillMode=false;_ui(t)};
function hurt(e,dm){e.hp-=dm;fl.push({x:e.x,y:e.y,t:1,s:'-'+dm});if(e.hp<=0)units=units.filter(v=>v!==e)}
function doSkill(x,y){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.acted||u.cd>0)return;
 if(Math.abs(x-u.x)+Math.abs(y-u.y)>k.rg||walls.has(key(x,y))){info('Out of range. Tap a highlighted tile.');return}
 u.f=x>=u.x?1:-1;k.hit(x,y).forEach(([tx,ty,dm])=>{const e=units.find(v=>v.team==='e'&&v.x===tx&&v.y===ty);if(e)hurt(e,dm+(u.t==='m'&&e.t==='t'?6:0))});
 for(let i=0;i<18;i++)pf.push({x:x*T+40,y:y*T+40,vx:(Math.random()-.5)*9,vy:(Math.random()-.5)*9,l:.6,c:i%2?'#ff9a1f':'#ffd34d'});
 u.acted=u.moved=true;u.cd=k.cd;skillMode=false;reach={};info(k.n+'!');check()}
const sb=document.createElement('button');sb.className='back';sb.style.display='none';$('#hud').insertBefore(sb,$('#end'));let sbT='';
sb.onclick=()=>{if(!sel||busy())return;skillMode=!skillMode;spawnSel=null;reach={};if(skillMode){const k=SKILL[sel.t];for(let y=0;y<R;y++)for(let x=0;x<C;x++)if(Math.abs(x-sel.x)+Math.abs(y-sel.y)<=k.rg&&!walls.has(key(x,y)))reach[key(x,y)]=1;info(k.n+': tap a target tile in range.')}else reach=sel.moved?{}:bfs(sel)};
function updateSkill(){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.team!=='p'||turn!=='p'||over||!units.includes(u)){if(sb.style.display!=='none')sb.style.display='none';return}
 const txt=k.n+(u.cd>0?' ('+u.cd+')':''),dis=u.acted||u.cd>0;if(sbT!==txt+dis+skillMode){sbT=txt+dis+skillMode;sb.textContent=txt;sb.disabled=dis;sb.className=skillMode?'alt':'back';sb.style.display=''}}
cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{dragged=false;if(turn!=='p'||over||busy()||spawnSel||skillMode)return;const[x,y]=tileAt(e),u=at(x,y);
 if(u&&u.team==='p'&&!u.moved){dragging=u;dpath=[];sel=u;reach=bfs(u);try{cv.setPointerCapture(e.pointerId)}catch(_){}}});
cv.addEventListener('pointermove',e=>{if(!dragging)return;const[x,y]=tileAt(e),u=dragging,last=dpath.length?dpath[dpath.length-1]:[u.x,u.y];if(x===last[0]&&y===last[1])return;
 if(x===u.x&&y===u.y){dpath=[];dragged=true;return}const i=dpath.findIndex(p=>p[0]===x&&p[1]===y);if(i>=0){dpath=dpath.slice(0,i+1);dragged=true;return}
 if(blocked(x,y,u)||dpath.length>=u.mv)return;
 if(Math.abs(x-last[0])+Math.abs(y-last[1])===1){dpath.push([x,y]);dragged=true}else{const p=findPath(last[0],last[1],x,y,u);if(p&&dpath.length+p.length<=u.mv){dpath.push(...p);dragged=true}}});
cv.addEventListener('pointerup',()=>{if(!dragging)return;const u=dragging;dragging=null;if(dpath.length){const pts=[[u.x,u.y],...dpath],l=dpath[dpath.length-1];startAnim(u,pts);u.f=l[0]>=u.x?1:-1;u.x=l[0];u.y=l[1];u.moved=true;reach={};sel=u;info('Moved. Tap an enemy in range to attack, or use your skill.')}dpath=[]});
cv.addEventListener('pointercancel',()=>{dragging=null;dpath=[]});
cv.addEventListener('click',e=>{if(busy()){e.stopImmediatePropagation();return}if(dragged){dragged=false;e.stopImmediatePropagation();return}if(turn!=='p'||over)return;const[x,y]=tileAt(e),u0=at(x,y);
 if(skillMode&&sel){if(u0&&u0.team==='p'&&u0!==sel){skillMode=false;reach={};return}e.stopImmediatePropagation();doSkill(x,y);return}
 if(!spawnSel&&sel&&!sel.moved&&!u0&&reach[key(x,y)]){e.stopImmediatePropagation();const p=findPath(sel.x,sel.y,x,y,sel);startAnim(sel,[[sel.x,sel.y],...(p||[[x,y]])]);sel.f=x>=sel.x?1:-1;sel.x=x;sel.y=y;sel.moved=true;reach={};info('Moved. Tap an enemy in range to attack, or use your skill.')}},true);
const _d3=draw;draw=function(){const now=performance.now(),dt=Math.min(.05,(now-lastT)/1000);lastT=now;tick(dt);
 const sw=[];units.forEach(u=>{if(u.anim){sw.push([u,u.x,u.y]);u.x=u.vx;u.y=u.vy}});_d3();sw.forEach(([u,x,y])=>{u.x=x;u.y=y});
 if(dragging&&dpath.length){const u=dragging,l=dpath[dpath.length-1];g.save();g.strokeStyle='#fff2b0';g.lineWidth=4;g.setLineDash([8,6]);g.beginPath();g.moveTo(u.x*T+40,u.y*T+40);dpath.forEach(p=>g.lineTo(p[0]*T+40,p[1]*T+40));g.stroke();g.setLineDash([]);
  g.fillStyle='#fff2b0';g.beginPath();g.arc(l[0]*T+40,l[1]*T+40,13,0,7);g.fill();g.fillStyle='#000';g.font='700 13px Arial';g.textAlign='center';g.fillText(dpath.length+'/'+u.mv,l[0]*T+40,l[1]*T+45);g.restore()}
 pf.forEach(p=>{p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.l-=dt;g.globalAlpha=Math.max(0,Math.min(1,p.l*2));g.fillStyle=p.c;g.fillRect(p.x,p.y,6,6)});g.globalAlpha=1;pf=pf.filter(p=>p.l>0);updateSkill()};
const _st4=start;start=function(i){_st4(i);prevT='p';skillMode=false;dragging=null;pf=[];units.forEach(u=>delete u.anim)};


let pend=null,baseSel=false,lastBm=120;
SKILL.r={n:'Rifle Fire',rg:2,cd:0,pct:d=>d<=1?1:.5};SKILL.m={n:'Missile',rg:2,cd:0,pct:d=>1};
doSkill=function(x,y){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.acted)return;const d=Math.abs(x-u.x)+Math.abs(y-u.y);
 if(d<1||d>k.rg){info('Out of range. Tap a red square.');return}const e=units.find(v=>v.team==='e'&&v.x===x&&v.y===y);if(!e){info('No enemy on that square.');return}
 const pc=k.pct(d),dm=Math.max(1,Math.round((u.dm+(u.t==='m'&&e.t==='t'?6:0))*pc));u.f=x>=u.x?1:-1;u.ang=Math.atan2(y-u.y,x-u.x);hurt(e,dm);
 for(let i=0;i<12;i++)pf.push({x:x*T+40,y:y*T+40,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,l:.5,c:i%2?'#ff9a1f':'#ffd34d'});
 u.acted=u.moved=true;skillMode=false;reach={};info(k.n+' hit for '+dm+' ('+Math.round(pc*100)+'%).');check()};
sb.onclick=()=>{if(!sel||busy())return;pend=null;skillMode=!skillMode;spawnSel=null;baseSel=false;buildTray();reach=skillMode?{}:(sel.moved?{}:bfs(sel));info(skillMode?SKILL[sel.t].n+': tap a red square with an enemy.':'Skill cancelled.')};
const _bt=buildTray;buildTray=function(){if(!baseSel){trayHide();return}_bt()};
const _ui2=ui;ui=function(t){if(bm<lastBm&&baseSel){baseSel=false;spawnSel=null}lastBm=bm;_ui2(t)};
function drawArrow(pts,label,frozen){if(pts.length<2)return;const p=pts.map(([x,y])=>[x*T+40,y*T+40]),n=p.length,[lx,ly]=p[n-1],[px,py]=p[n-2],a=Math.atan2(ly-py,lx-px),col=frozen?'#ffd34d':'#fff2b0';
 g.save();g.globalAlpha=frozen?.75+.25*Math.sin(Date.now()/180):.9;g.lineCap=g.lineJoin='round';const sx=lx-Math.cos(a)*12,sy=ly-Math.sin(a)*12;
 const path=()=>{g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<n-1;i++)g.lineTo(p[i][0],p[i][1]);g.lineTo(sx,sy)};
 path();g.strokeStyle='#000b';g.lineWidth=13;g.stroke();path();g.strokeStyle=col;g.lineWidth=8;g.stroke();
 g.translate(lx,ly);g.rotate(a);g.beginPath();g.moveTo(18,0);g.lineTo(-10,-17);g.lineTo(-10,17);g.closePath();g.fillStyle=col;g.fill();g.strokeStyle='#000b';g.lineWidth=3;g.stroke();
 g.rotate(-a);g.font='700 13px Arial';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000';g.strokeText(label,0,-24);g.fillStyle='#fff';g.fillText(label,0,-24);g.restore()}
const _d4=draw;draw=function(){const dg=dragging;dragging=null;_d4();dragging=dg;
 if(pend&&(turn!=='p'||over||!units.includes(pend.u)||pend.u.moved))pend=null;
 if(dragging&&dpath.length)drawArrow([[dragging.x,dragging.y],...dpath],dpath.length+'/'+dragging.mv,false);
 if(pend)drawArrow(pend.pts,(pend.pts.length-1)+'/'+pend.u.mv+' · click to confirm',true);
 if(baseSel&&bld[0])br(bld[0].x,bld[0].y,'#f2e6a0');
 if(skillMode&&sel&&units.includes(sel)&&SKILL[sel.t]){const k=SKILL[sel.t];for(let y=0;y<R;y++)for(let x=0;x<C;x++){const d=Math.abs(x-sel.x)+Math.abs(y-sel.y);if(d<1||d>k.rg||walls.has(key(x,y))||shotBlocked(sel,x,y))continue;
  g.fillStyle='#e0382a55';g.fillRect(x*T+3,y*T+3,T-6,T-6);g.strokeStyle='#ff4a38';g.lineWidth=2;g.strokeRect(x*T+3.5,y*T+3.5,T-7,T-7);
  const target=tgtAt(x,y,'e','p'),s=target?'-'+calcDmg(sel,target,k.pct(d))*(sel.t==='r'?3:1):'—';g.font='700 18px Arial';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#000';g.strokeText(s,x*T+40,y*T+22);g.fillStyle='#fff';g.fillText(s,x*T+40,y*T+22);
  if(units.some(v=>v.team==='e'&&v.x===x&&v.y===y))br(x,y,'#ff4a38')}}};
cv.addEventListener('pointerdown',()=>{if(dragging)pend=null});
cv.addEventListener('pointerup',()=>{const u=dragging;if(!u)return;dragging=null;if(dpath.length){pend={u,pts:[[u.x,u.y],...dpath]};info('Click the arrow to confirm the path, or click elsewhere to cancel.')}dpath=[]},true);
window.addEventListener('click',e=>{if(e.target!==cv)return;const stop=()=>{e.stopPropagation();e.stopImmediatePropagation()};
 if(busy()&&!(sel&&sel.shooting)){stop();return}if(dragged){dragged=false;stop();return}if(turn!=='p'||over)return;
 const[x,y]=tileAt(e),u0=at(x,y),b=bld[0];if(u0&&u0.team==='p')inspectUnit=null;
 if(pend){const i=pend.pts.findIndex((p,j)=>j>0&&p[0]===x&&p[1]===y);
  if(i>0){const u=pend.u,pts=pend.pts,l=pts[pts.length-1];startAnim(u,pts);u.f=l[0]>=u.x?1:-1;u.x=l[0];u.y=l[1];u.moved=true;reach={};sel=u;pend=null;info('Moved. Press the Skill button to attack.');stop();return}
  pend=null;reach=sel&&!sel.moved?bfs(sel):{};if(!(u0&&u0.team==='p')){info('Path cancelled.');stop();return}}
 if(b&&x===b.x&&y===b.y&&!training){baseSel=!baseSel;spawnSel=null;sel=null;skillMode=false;reach={};buildTray();info(baseSel?'Barracks ability: pick a unit to spawn within 1 tile.':'');stop();return}
 if(baseSel&&u0&&u0.team==='p'){baseSel=false;spawnSel=null;reach={};buildTray()}
 if(skillMode&&sel){if(u0&&u0.team==='p'&&u0!==sel){skillMode=false;reach={};return}stop();doSkill(x,y);return}
 const capturable=sel&&units.includes(sel)&&sel.team==='p'&&!sel.moved&&(sel.tr||[]).includes('capture')?capTarget2(sel):null;
 if(capturable&&x===capturable.x&&y===capturable.y){doCapture(sel,capturable);reach={};info('Outpost captured. Your unit stays on its tile.');check();stop();return}
 if(u0&&u0.team==='e'&&!spawnSel){if(!seenBy('p',u0)){info('No visible enemy on that tile.');stop();return}inspectUnit=u0;updateUnitStatus();info(U[u0.t].n+' · enemy information');stop();return}
 if(!spawnSel&&!baseSel&&sel&&!sel.moved&&!u0){const moveReach=reach[key(x,y)]?reach:bfs(sel);if(moveReach[key(x,y)]){const p=findPath(sel.x,sel.y,x,y,sel);pend={u:sel,pts:[[sel.x,sel.y],...(p||[[x,y]])]};info('Click the arrow to confirm the path, or click elsewhere to cancel.');stop()}}},true);
const _st5=start;start=function(i){_st5(i);pend=null;baseSel=false;lastBm=bm;if(!training)setTimeout(()=>info('Tap your barracks to spawn units, or select a unit to move and attack.'),0)};


updateSkill=function(){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.team!=='p'||turn!=='p'||over||!units.includes(u)){sb.style.display='none';sbT='';return}
 const txt=k.n,dis=!!u.acted;sb.style.display='';if(sbT!==txt+dis+skillMode){sbT=txt+dis+skillMode;sb.textContent=txt;sb.disabled=dis;sb.className=skillMode?'alt':'back'}};
doSkill=function(x,y){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.acted)return;const d=Math.abs(x-u.x)+Math.abs(y-u.y);
 if(d<1||d>k.rg){info('Out of range. Tap a red square.');return}const e=units.find(v=>v.team==='e'&&v.x===x&&v.y===y);if(!e){info('No enemy on that square.');return}
 const pc=k.pct(d),dm=Math.max(1,Math.round((u.dm+(u.t==='m'&&e.t==='t'?6:0))*pc));u.f=x>=u.x?1:-1;u.ang=Math.atan2(y-u.y,x-u.x);hurt(e,dm);
 for(let i=0;i<12;i++)pf.push({x:x*T+40,y:y*T+40,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,l:.5,c:i%2?'#ff9a1f':'#ffd34d'});
 u.acted=u.moved=true;skillMode=false;reach={};info(k.n+' hit for '+dm+' ('+Math.round(pc*100)+'%).');check()};
cv.addEventListener('pointerup',()=>{if(pend&&dragged)pend.drag=true},true);
const _d5=draw;draw=function(){if(pend&&!pend.drag&&!busy()){const u=pend.u,pts=pend.pts,l=pts[pts.length-1];pend=null;startAnim(u,pts);u.f=l[0]>=u.x?1:-1;u.x=l[0];u.y=l[1];u.moved=true;reach={};sel=u;info('Moved. Press the Skill button to attack.')}_d5()};


let camX=0,camY=0,pan=null,hm=[],sh=new Set(),tb=new Set(),goalB=false;
const _rr=Element.prototype.getBoundingClientRect;
cv.getBoundingClientRect=function(){const r=_rr.call(cv);return{left:r.left-camX*r.width/800,top:r.top-camY*r.height/480,width:r.width*C*T/800,height:r.height*R*T/480,right:0,bottom:0,x:0,y:0}};
const clampCam=()=>{camX=Math.max(0,Math.min(camX,Math.max(0,C*T-800)));camY=Math.max(0,Math.min(camY,Math.max(0,R*T-480)))};
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{if(e.button!==0){e.stopImmediatePropagation();if(e.button===2){pan={x:e.clientX,y:e.clientY,cx:camX,cy:camY,m:true,btn:2};try{cv.setPointerCapture(e.pointerId)}catch(_){}}}},true);
cv.addEventListener('pointerdown',e=>{if(e.button===0&&!dragging&&(C*T>800||R*T>480))pan={x:e.clientX,y:e.clientY,cx:camX,cy:camY,m:false,btn:0}});
cv.addEventListener('pointermove',e=>{if(!pan)return;const r=_rr.call(cv),dx=(e.clientX-pan.x)*800/r.width,dy=(e.clientY-pan.y)*480/r.height;if(!pan.m&&Math.hypot(dx,dy)<8)return;pan.m=true;camX=pan.cx-dx;camY=pan.cy-dy;clampCam();if(pan.btn===0)dragged=true});
cv.addEventListener('pointerup',()=>{pan=null});cv.addEventListener('pointercancel',()=>{pan=null});

const TR={r:['capture'],m:['capture'],k:['capture'],s:[],t:[]};
SKILL.k={n:'Snipe',rg:4,cd:0,pct:d=>d<=2?.5:1};SKILL.s={n:'Machine Gun',rg:3,cd:0,pct:d=>d<=2?1:.5};SKILL.t={n:'Cannon',rg:3,cd:0,pct:d=>1};SKILL.o={n:'Supply Cargo',rg:0,cd:2};
COST.k=30;COST.s=35;COST.t=60;
DESC.k='Long-range infantry. Full damage from 3 tiles away, half up close.';DESC.s='Fast light vehicle with a machine gun. Great against infantry.';DESC.t='Heavy armor. Shrugs off rifles and crushes infantry. Weak to missiles.';
const STORE=[['k',150],['s',200],['t',400]];
if(typeof save.credits!=='number')save.credits=300;if(!Array.isArray(save.owned))save.owned=['r','m'];
const syncOwned=()=>{ROS.length=0;save.owned.forEach(t=>ROS.push(t))};syncOwned();
const CLS={inf:'Infantry',veh:'Vehicle',tank:'Tank'};
const TRTXT=t=>{const u=U[t];return CLS[u.cls]+' · Armor '+u.armor+' · AP '+u.ap+((TR[t]||[]).includes('capture')?' · Trait: Capture':'')};

mk=function(t,x,y){const b=U[t],a=AR[save.pick];return{t,team:'p',x,y,hp:b.hp+a.hp,max:b.hp+a.hp,mv:b.mv+a.mv,rg:b.rg,dm:b.dm+a.dm,ap:b.ap||0,armor:b.armor||0,cls:b.cls,tr:(TR[t]||[]).slice(),moved:false,acted:false,f:1}};
function calcDmg(a,d,pc){let m=1;if(a.ap>=4)m=d.cls==='inf'?.5:d.cls==='bld'?1:1.5;else if(a.cls&&a.cls!=='inf'&&d.cls==='inf')m=1.5;
 const ha=hgt(a.x,a.y),hd=hgt(d.x,d.y),heightDefense=hd>ha?.8:1,covered=fo.has(key(d.x,d.y))||sh.has(key(d.x,d.y))||d.inB,terrainDefense=covered?.8:1,armorReduction=2*Math.max(0,(d.armor||0)-(a.ap||0));
 return Math.max(1,Math.round(Math.max(0,a.dm*pc-armorReduction)*terrainDefense*heightDefense*m))}
attack=function(a,d){const dm=calcDmg(a,d,1);d.hp-=dm;a.f=d.x>=a.x?1:-1;a.ang=Math.atan2(d.y-a.y,d.x-a.x);fl.push({x:d.x,y:d.y,t:1,s:'-'+dm});
 for(let i=0;i<7;i++)pf.push({x:d.x*T+40,y:d.y*T+36,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:.4,c:'#ffd34d'});if(d.hp<=0){if(d.team==='p')lost++;units=units.filter(u=>u!==d)}};
doSkill=function(x,y){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.acted||u.bld)return;const d=Math.abs(x-u.x)+Math.abs(y-u.y);
 if(d<1||d>k.rg){info('Out of range. Tap a red square.');return}const e=units.find(v=>v.team==='e'&&v.x===x&&v.y===y);if(!e){info('No enemy on that square.');return}
 const pc=k.pct(d),dm=calcDmg(u,e,pc);u.f=x>=u.x?1:-1;u.ang=Math.atan2(y-u.y,x-u.x);hurt(e,dm);
 for(let i=0;i<12;i++)pf.push({x:x*T+40,y:y*T+40,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,l:.5,c:i%2?'#ff9a1f':'#ffd34d'});
 u.acted=u.moved=true;skillMode=false;reach={};info(k.n+' hit for '+dm+' ('+Math.round(pc*100)+'% power).');check()};
function heal(b){let n=0;units.forEach(v=>{if(v.team===b.team&&v!==b&&!v.bld&&v.hp<v.max&&Math.abs(v.x-b.x)+Math.abs(v.y-b.y)<=2){const h=Math.min(5,v.max-v.hp);v.hp+=h;n++;fl.push({x:v.x,y:v.y,t:1,s:'+'+h})}});return n}
const _sbo=sb.onclick;sb.onclick=function(){if(sel&&sel.bld){if(sel.acted||sel.cd>0||busy())return;const n=heal(sel);if(!n){info('No wounded allies within 2 tiles.');return}sel.acted=true;sel.cd=2;info('Supply Cargo healed '+n+' unit(s).');return}_sbo.call(sb)};
updateSkill=function(){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.team!=='p'||turn!=='p'||over||!units.includes(u)){sb.style.display='none';sbT='';return}
 const txt=k.n,dis=!!u.acted||u.cd>0;sb.style.display='';if(sbT!==txt+dis+skillMode){sbT=txt+dis+skillMode;sb.textContent=txt;sb.disabled=dis;sb.className=skillMode?'alt':'back'}};
const capTarget=u=>units.find(v=>v.bld&&v.team!==u.team&&Math.abs(v.x-u.x)+Math.abs(v.y-u.y)<=1);
function updateCap(){}
const _u3=unit;unit=function(g2,x,y,type,team,f,ang){if(type!=='o')return _u3(g2,x,y,type,team,f,ang);const k=UC[team];g2.save();g2.translate(x,y);
 g2.fillStyle='#3b3428';g2.fillRect(-28,-26,56,52);g2.fillStyle='#6b5d3a';g2.fillRect(-26,-24,52,48);g2.strokeStyle='#4a3f26';g2.lineWidth=2;for(let i=-1;i<=1;i++){g2.beginPath();g2.moveTo(-26,i*16);g2.lineTo(26,i*16);g2.stroke()}
 g2.fillStyle=k.v;g2.fillRect(-18,-16,36,32);g2.fillStyle=k.v2;g2.fillRect(-18,-2,36,4);g2.fillStyle=k.a;g2.fillRect(-26,-24,8,48);g2.fillStyle='#f3ead0';g2.fillRect(-4,-8,8,16);g2.fillRect(-8,-4,16,8);g2.restore()};
const _ai2=ai;ai=function(e){if(e.bld){if(e.cd>0)e.cd--;else if(heal(e))e.cd=2;return}
 if((e.tr||[]).includes('capture')){const b=units.find(v=>v.bld&&v.team==='p'&&Math.abs(v.x-e.x)+Math.abs(v.y-e.y)<=1);if(b){b.team='e';b.cd=0;e.moved=true;fl.push({x:b.x,y:b.y,t:1,s:'Captured!'});return}}_ai2(e)};
check=function(){ui(turn==='p'?'Your turn':'Enemy turn');const E=units.filter(u=>u.team==='e'),P=units.filter(u=>u.team==='p'&&!u.bld).length;
 if(goalB&&!E.some(u=>u.bld))return fin(true);if(!P&&!canSpawn())return fin(false);return false};
const _fin=fin;fin=function(w){const r=_fin(w);if(w){save.credits+=100;store();$('#oS').textContent+='  +100 credits'}return r};
const _ui3=ui;ui=function(t){_ui3(t);const f=$('#fl');f.textContent=f.textContent.replace('Flags','Outposts')};
function drawStore(){$('#credits').textContent='Credits: '+save.credits+' (earn 100 per victory)';const b=$('#shop');b.innerHTML='';
 STORE.forEach(([t,price])=>{const u=U[t],own=save.owned.includes(t),d=document.createElement('button');d.className='card'+(own?' sel':'');
  d.innerHTML='<canvas width="150" height="90"></canvas><b>'+u.n+'</b><p>'+DESC[t]+'</p><p>HP '+u.hp+' · Move '+u.mv+' · Dmg '+u.dm+'</p><p>'+TRTXT(t)+'</p><p>Battle cost $'+COST[t]+'</p><b>'+(own?'Owned':price+' credits')+'</b>';
  const c=d.querySelector('canvas').getContext('2d');c.fillStyle='#48512d';c.fillRect(0,0,150,90);c.save();c.translate(75,45);c.scale(t==='t'?.9:1.2,t==='t'?.9:1.2);unit(c,0,0,t,'p',1);c.restore();
  d.onclick=()=>{if(own)return;if(save.credits>=price){save.credits-=price;save.owned.push(t);store();syncOwned();drawStore()}else{drawStore();$('#credits').textContent='Not enough credits for the '+u.n+'.'}};b.appendChild(d)})}
const _dl=drawLobby;drawLobby=function(){_dl();document.querySelectorAll('#roster .card').forEach((d,i)=>{const t=ROS[i];if(t)d.insertAdjacentHTML('beforeend','<p>'+TRTXT(t)+'</p>')})};
const _sh4=show;show=function(id){_sh4(id);if(id==='store')drawStore();if(id==='lobby'&&!ROS.includes(insp))insp=ROS[0]};
$('#bStore').onclick=()=>show('store');
function terr(){for(let y=0;y<R;y++)for(let x=0;x<C;x++){const k=key(x,y),px=x*T,py=y*T,h=hgt(x,y);
 if(h){g.fillStyle='rgba(255,240,180,'+.07*h+')';g.fillRect(px,py,T,T);g.fillStyle='#00000040';const hr=hgt(x+1,y),hb=hgt(x,y+1);if(hr<h)g.fillRect(px+T-4,py,4,T);if(hb<h)g.fillRect(px,py+T-4,T,4);g.font='700 11px Arial';g.textAlign='left';g.fillStyle='#fff';g.fillText('▲'+h.toFixed(1),px+4,py+13)}
 if(tb.has(k)&&!units.some(u=>u.x===x&&u.y===y)){g.fillStyle='#00000066';g.fillRect(px+8,py+10,T-12,T-12);g.fillStyle='#5b544b';g.fillRect(px+5,py+5,T-10,T-10);g.fillStyle='#7d7468';g.fillRect(px+9,py+9,T-18,T-18);g.fillStyle='#4a443c';g.fillRect(px+9,py+T/2-1,T-18,3);g.fillStyle='#2b2823';for(let i=0;i<3;i++){g.fillRect(px+16+i*18,py+16,8,8);g.fillRect(px+16+i*18,py+48,8,8)}}
 if(sh.has(k)){g.fillStyle='#a8935f';g.strokeStyle='#6e5e3a';g.lineWidth=1;for(let i=0;i<5;i++){g.fillRect(px+6+i*13,py+T-14,12,8);g.strokeRect(px+6.5+i*13,py+T-13.5,11,7)}for(let j=0;j<4;j++){g.fillRect(px+3,py+8+j*14,8,12);g.strokeRect(px+3.5,py+8.5+j*14,7,11)}}}}
const _d7=draw;draw=function(){g.setTransform(1,0,0,1,0,0);g.fillStyle='#0d1008';g.fillRect(0,0,800,480);clampCam();flags=flags.filter(f=>units.includes(f.u));
 g.save();g.translate(-Math.round(camX),-Math.round(camY));_d7();terr();g.restore();updateCap();
 if(C*T>800||R*T>480){g.fillStyle='#ffffffaa';g.font='12px Arial';g.textAlign='left';g.fillText('Right-click and drag to pan',10,470)}};
const _st6=start;start=function(i){const L2=LV[i];C=L2.m[0].length;R=L2.m.length;camX=camY=0;_st6(i);
 hm=(L2.h||[]).map(r=>[...r].map(Number));if(i<2)hm=Array.from({length:R},()=>Array(C).fill(0));tb=new Set();sh=new Set();
 L2.m.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==='B'){walls.add(key(x,y));tb.add(key(x,y))}if(ch==='S')sh.add(key(x,y))}));
 const sx=C-10,sy=(R-6)>>1;units.forEach(u=>{if(u.team==='e'){u.x+=sx;u.y+=sy}});if(bld[0]){bld[0].y+=sy;while(walls.has(key(bld[0].x,bld[0].y)))bld[0].y++}
 const taken=(x,y,s)=>x<0||y<0||x>=C||y>=R||walls.has(key(x,y))||flags.some(f=>f.x===x&&f.y===y)||units.some(v=>v!==s&&v.x===x&&v.y===y)||(bld[0]&&bld[0].x===x&&bld[0].y===y);
 units.forEach(u=>{if(taken(u.x,u.y,u)){out:for(let r=1;r<6;r++)for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)if(!taken(u.x+dx,u.y+dy,u)){u.x+=dx;u.y+=dy;break out}}});
 units.forEach(u=>{const b=U[u.t];u.cls=b.cls;u.armor=b.armor||0;u.ap=b.ap||0;u.tr=(TR[u.t]||[]).slice()});
 flags=flags.map(f=>{const o={t:'o',team:'e',x:f.x,y:f.y,hp:30,max:30,mv:0,rg:0,dm:0,moved:false,acted:false,f:1,cls:'bld',armor:2,ap:0,tr:[],bld:true,cd:0};units.push(o);return{x:f.x,y:f.y,u:o,get o(){return this.u.team}}});
 goalB=flags.length>0;if(bld[0])camY=Math.max(0,bld[0].y*T-200);clampCam();ui('Your turn');
 if(i===0)setTimeout(()=>info('Training Camp: capture or destroy both enemy outposts. Select a rifleman, then click an adjacent outpost outlined in yellow to capture it.'),0)};


let fo=new Set();
const hgt=(x,y)=>((hm[y]&&hm[y][x])||0)/2;
const SIGHT=u=>u.bld?3:(U[u.t].rg||2)+2+(hgt(u.x,u.y)>0?1:0);
const seenBy=(team,v)=>{if(v.bld||v.team===team)return true;const vk=key(v.x,v.y),lim=(fo.has(vk)||tb.has(vk)||sh.has(vk)||walls.has(vk))?1:99;
 return units.some(o=>o.team===team&&Math.abs(o.x-v.x)+Math.abs(o.y-v.y)<=Math.min(lim,SIGHT(o)))||(team==='p'&&bld[0]&&Math.abs(bld[0].x-v.x)+Math.abs(bld[0].y-v.y)<=Math.min(lim,3))};
const tileSeen=(x,y)=>units.some(o=>o.team==='p'&&Math.abs(o.x-x)+Math.abs(o.y-y)<=SIGHT(o))||(bld[0]&&Math.abs(bld[0].x-x)+Math.abs(bld[0].y-y)<=3);
const canEnter=(s,x,y)=>!(s&&(s.cls==='veh'||s.cls==='tank')&&(sh.has(key(x,y))||tb.has(key(x,y))||hgt(x,y)>=1));
LV.forEach((l,i)=>{if(i===5)return;l.m=l.m.map((r,y)=>[...r].map((ch,x)=>ch==='.'&&x>=2&&x<r.length-2&&(x*7+y*13)%9===0?'T':ch).join(''))});
bfs=function(u){const out={},q=[[u.x,u.y,0]],seen=new Set([key(u.x,u.y)]);
 while(q.length){const[x,y,d]=q.shift();if(d>=u.mv)continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(seen.has(k)||blocked(nx,ny,u))continue;seen.add(k);out[k]=1;q.push([nx,ny,d+1])}}return out};
const _sp=spawnTiles;spawnTiles=function(){return _sp().filter(([x,y])=>!spawnSel||canEnter({cls:U[spawnSel].cls},x,y))};
function calcDmg(a,d,pc,fromX=a.x,fromY=a.y){let m=1;if(a.ap>=4)m=d.cls==='inf'?.5:d.cls==='bld'?1:1.5;else if(a.cls&&a.cls!=='inf'&&d.cls==='inf')m=1.5;
 const ha=hgt(fromX,fromY),hd=hgt(d.x,d.y),heightDefense=hd>ha?.8:1,covered=fo.has(key(d.x,d.y))||sh.has(key(d.x,d.y))||d.inB,terrainDefense=covered?.8:1,armorReduction=2*Math.max(0,(d.armor||0)-(a.ap||0));return Math.max(1,Math.round(Math.max(0,a.dm*pc-armorReduction)*terrainDefense*heightDefense*m))}
function tgtAt(x,y,team,viewer){const c=units.filter(v=>v.team===team&&v.x===x&&v.y===y&&(v.bld||seenBy(viewer,v)));return c.find(v=>!v.bld)||c[0]}
doSkill=function(x,y){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.acted||u.bld)return;const d=Math.abs(x-u.x)+Math.abs(y-u.y);
 if(d<1||d>k.rg){info('Out of range. Tap a red square.');return}if(!canFireHeight(u,x,y)){info('The slope blocks that shot.');return}
 const e=tgtAt(x,y,'e','p');if(!e){info('No visible enemy on that square.');return}
 const pc=k.pct(d),dm=calcDmg(u,e,pc);u.f=x>=u.x?1:-1;u.ang=Math.atan2(y-u.y,x-u.x);hurt(e,dm);
 for(let i=0;i<12;i++)pf.push({x:x*T+40,y:y*T+40,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,l:.5,c:i%2?'#ff9a1f':'#ffd34d'});
 u.acted=u.moved=true;skillMode=false;reach={};info(k.n+' hit for '+dm+' ('+Math.round(pc*100)+'% power).');check()};
const capTarget2=u=>units.find(v=>v.bld&&v.team!==u.team&&Math.abs(v.x-u.x)+Math.abs(v.y-u.y)<=1&&!units.some(w=>w!==v&&w.x===v.x&&w.y===v.y));
function doCapture(u,b){b.team=u.team;b.cd=0;b.acted=false;u.moved=true;fl.push({x:b.x,y:b.y,t:1,s:'Captured!'})}
function syncGar(){units.forEach(u=>{if(!u.bld)u.inB=null})}
const sup=document.createElement('button');sup.className='back';sup.textContent='Supply Cargo';sup.style.display='none';$('#hud').insertBefore(sup,sb);
sup.onclick=()=>{const b=sel&&sel.inB;if(!b||b.acted||b.cd>0||busy())return;const n=heal(b);if(!n){info('No wounded allies within 2 tiles.');return}b.acted=true;b.cd=2;info('Supply Cargo healed '+n+' unit(s).')};
updateCap=function(){const u=sel;if(!u||u.team!=='p'||turn!=='p'||over||!units.includes(u)){sup.style.display='none';return}
 if(!u.bld&&u.inB){const b=u.inB;sup.style.display='';sup.disabled=!!b.acted||b.cd>0;sup.textContent='Supply Cargo'+(b.cd>0?' ('+b.cd+')':'')}else sup.style.display='none'};
ai=function(e){if(e.bld){if(e.cd>0)e.cd--;else if(heal(e))e.cd=2;return}
 if((e.tr||[]).includes('capture')&&!e.moved){const b=capTarget2(e);if(b){doCapture(e,b);return}}
 const sx=e.x,sy=e.y,rc=bfs(e);rc[key(e.x,e.y)]=1;const vp=units.filter(v=>v.team==='p'&&seenBy('e',v));let best=null,bs=-1e9;
 for(const k in rc){const[x,y]=k.split(',').map(Number);for(const p of vp){const d=Math.abs(x-p.x)+Math.abs(y-p.y);if(d<1||d>e.rg||!canFireHeight({...e,x,y},p.x,p.y))continue;const dm=calcDmg(e,p,1,x,y),s=(dm>=p.hp?100:0)+dm+d*.3;if(s>bs){bs=s;best={x,y,p}}}}
 if(best){e.x=best.x;e.y=best.y;e.f=best.p.x>=e.x?1:-1}
 else{const goals=vp.concat(units.filter(v=>v.bld&&v.team==='p'),bld[0]?[bld[0]]:[]).sort((a,b)=>(Math.abs(a.x-e.x)+Math.abs(a.y-e.y))-(Math.abs(b.x-e.x)+Math.abs(b.y-e.y)));
  if(goals.length){const t=goals[0];let bk=null,bd=1e9;for(const k in rc){const[x,y]=k.split(',').map(Number),d=Math.abs(x-t.x)+Math.abs(y-t.y);if(d<bd){bd=d;bk=[x,y]}}if(bk){e.f=bk[0]>=e.x?1:-1;e.x=bk[0];e.y=bk[1]}}}

  if((e.x!==sx||e.y!==sy)&&seenBy('p',e)){const p=findPath(sx,sy,e.x,e.y,e);startAnim(e,[[sx,sy],...(p||[[e.x,e.y]])])}
if(best){attack(e,best.p);return check()}};
const _terr=terr;terr=function(){_terr();fo.forEach(k=>{const[x,y]=k.split(',').map(Number),px=x*T,py=y*T;g.fillStyle='#1f4a22cc';[[16,18,15],[50,16,16],[30,40,17],[58,52,14],[14,58,13]].forEach(([a,b,r])=>{g.beginPath();g.arc(px+a,py+b,r,0,7);g.fill()});
 g.fillStyle='#3f7a3a99';[[14,16,8],[48,14,8],[28,38,9]].forEach(([a,b,r])=>{g.beginPath();g.arc(px+a,py+b,r,0,7);g.fill()})})};
const _d8=draw;draw=function(){syncGar();const all=units,hid=all.filter(u=>u.team==='e'&&!u.bld&&!seenBy('p',u));hid.forEach(u=>{delete u.anim;u._lx=u.x;u._ly=u.y});
 const vis=all.filter(u=>!hid.includes(u));units=vis.filter(u=>u.bld).concat(vis.filter(u=>!u.bld));try{_d8()}finally{units=all}
 g.save();g.translate(-Math.round(camX),-Math.round(camY));
 for(let y=0;y<R;y++)for(let x=0;x<C;x++){if(!tileSeen(x,y)){g.fillStyle='rgba(6,12,6,.4)';g.fillRect(x*T,y*T,T,T)}}
 if(sel&&units.includes(sel)&&sel.team==='p'&&turn==='p'&&!over&&!sel.moved&&(sel.tr||[]).includes('capture')){const target=capTarget2(sel);if(target)br(target.x,target.y,'#fff2b0')}
 if(skillMode&&sel&&!sel.bld&&SKILL[sel.t]){const k=SKILL[sel.t];for(let y=0;y<R;y++)for(let x=0;x<C;x++){const d=Math.abs(x-sel.x)+Math.abs(y-sel.y);if(d<1||d>k.rg||!canFireHeight(sel,x,y)||shotBlocked(sel,x,y))continue;
  g.fillStyle='#1a120acc';g.fillRect(x*T+3,y*T+3,T-6,T-6);g.strokeStyle='#ff4a38';g.lineWidth=3;g.beginPath();g.moveTo(x*T+22,y*T+22);g.lineTo(x*T+58,y*T+58);g.moveTo(x*T+58,y*T+22);g.lineTo(x*T+22,y*T+58);g.stroke()}}
 g.restore()};
const _st7=start;start=function(i){fo=new Set();_st7(i);LV[i].m.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==='T')fo.add(key(x,y))}));
 if(LV[i].test){bld=[];bm=0;units.push(mk('r',4,3));start0=1;ui('Your turn')}
 setTimeout(()=>info(i===5?'Zero Zone: move your Rifleman next to the enemy outpost, select the Rifleman, then click the yellow outlined outpost to capture it. The unit stays on its tile.':i===0?'Training Camp: capture or destroy both outposts. Select a rifleman, then click an adjacent outpost outlined in yellow to capture it. Enemy units stay hidden until you see them.':'Fog of war: enemy units stay hidden until one of your units gets close enough to see them.'),1)};


// Final balance, combat animation, and selected-unit status layer.

U.boss&&(U.boss.hp=160);
SKILL.r={n:'Rifle Burst ×3',rg:2,cd:0,pct:d=>d<=1?1:.5};
const shotFx=[];
let inspectUnit=null,queuedEndTurn=false;
const _busyFinal=busy;
busy=()=>_busyFinal()||units.some(u=>u.shooting);
function updateUnitStatus(){const u=inspectUnit&&units.includes(inspectUnit)&&seenBy('p',inspectUnit)?inspectUnit:sel&&units.includes(sel)?sel:null,panel=$('#unitStatus');panel.style.display=u?'grid':'none';if(!u)return;const morale=u.morale==null?100:u.morale;$('#unitName').textContent=(u.team==='e'?'ENEMY · ':'')+U[u.t].n;$('#healthValue').textContent=u.hp+'/'+u.max;$('#healthFill').style.width=Math.max(0,Math.min(100,u.hp/u.max*100))+'%';$('#moraleValue').textContent=morale+'/100';$('#moraleFill').style.width=Math.max(0,Math.min(100,morale))+'%';$('#unitStats').textContent='MOVE '+u.mv+'  ·  RANGE '+u.rg+'  ·  DAMAGE '+u.dm+'  ·  ARMOR '+(u.armor||0)+'  ·  AP '+(u.ap||0)+'  ·  PROPERTIES '+((u.tr||[]).join(', ')||'none');const pc=$('#unitPortrait'),pg=pc.getContext('2d');pg.clearRect(0,0,pc.width,pc.height);pg.fillStyle='#252b1d';pg.fillRect(0,0,pc.width,pc.height);pg.save();pg.translate(62,83);pg.scale(1.4,1.4);unit(pg,0,0,u.t,u.team,u.f||1,0);pg.restore()}
function shotBlocked(a,x1,y1){if(a.t==='m')return false;let x=a.x,y=a.y,dx=Math.abs(x1-x),dy=Math.abs(y1-y),sx=x<x1?1:-1,sy=y<y1?1:-1,err=dx-dy;while(x!==x1||y!==y1){const e2=2*err;if(e2>-dy){err-=dy;x+=sx}if(e2<dx){err+=dx;y+=sy}if(x===x1&&y===y1)break;const k=key(x,y);if(walls.has(k)||bld.some(v=>v.x===x&&v.y===y)||units.some(v=>v.bld&&v.x===x&&v.y===y))return true}return false}
hurt=function(e,dm){e.hp-=dm;fl.push({x:e.x,y:e.y,t:1,s:'-'+dm});if(e.hp<=0){if(e.team==='p')lost++;units=units.filter(v=>v!==e)}};
function emitShot(a,d,done){if(!a||!d||!units.includes(a)||!units.includes(d)){if(done)done();return}a.shooting=true;a.f=d.x>=a.x?1:-1;a.ang=Math.atan2(d.y-a.y,d.x-a.x);shotFx.push({x:a.x*T+40,y:a.y*T+36,tx:d.x*T+40,ty:d.y*T+36,team:a.team,life:.16,max:.16});setTimeout(()=>{if(done)done()},110);setTimeout(()=>{a.shooting=false},180)}
function fireBurst(a,d,count,perShot,done){let n=0;const pulse=()=>{if(!units.includes(a)||!units.includes(d)){a.shooting=false;if(done)done();return}a.shooting=true;a.f=d.x>=a.x?1:-1;a.ang=Math.atan2(d.y-a.y,d.x-a.x);shotFx.push({x:a.x*T+40,y:a.y*T+36,tx:d.x*T+40,ty:d.y*T+36,team:a.team,life:.16,max:.16});setTimeout(()=>{if(units.includes(d))hurt(d,perShot);n++;if(n>=count||!units.includes(d)){a.shooting=false;if(done)done()}else setTimeout(pulse,130)},95)};pulse()}
attack=function(a,d){const dm=calcDmg(a,d,1);emitShot(a,d,()=>{});d.hp-=dm;fl.push({x:d.x,y:d.y,t:1,s:'-'+dm});for(let i=0;i<7;i++)pf.push({x:d.x*T+40,y:d.y*T+36,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:.4,c:'#ffd34d'});if(d.hp<=0){if(d.team==='p')lost++;units=units.filter(u=>u!==d)}};
doSkill=function(x,y){const u=sel,k=u&&SKILL[u.t];if(!u||!k||u.acted||u.bld||busy())return;const d=Math.abs(x-u.x)+Math.abs(y-u.y);if(d<1||d>k.rg){info('Out of range. Tap a red square.');return}if(!canFireHeight(u,x,y)){info('The slope blocks that shot.');return}if(shotBlocked(u,x,y)){info('A building or terrain blocks the shot.');return}const e=tgtAt(x,y,'e','p');if(!e){info('No visible enemy on that square.');return}const pc=k.pct(d),count=u.t==='r'?3:1,each=calcDmg(u,e,pc);inspectUnit=e;u.acted=true;sel=u;skillMode=false;pend=null;reach=u.moved?{}:bfs(u);info(k.n+' · '+each+' damage × '+count);fireBurst(u,e,count,each,()=>{if(check()){queuedEndTurn=false;return}if(queuedEndTurn){queuedEndTurn=false;endPlayerTurn();return}if(units.includes(u)&&turn==='p'&&!u.moved){reach=bfs(u);info('Attack complete. You can still move this unit.')}});};
const _unitFireAnim=unit;unit=function(ctx,x,y,type,team,f,ang){_unitFireAnim(ctx,x,y,type,team,f,ang);const u=units.find(v=>v.shooting&&Math.abs((v.vx==null?v.x:v.vx)*T+40-x)<2&&Math.abs((v.vy==null?v.y:v.vy)*T+36-y)<2);if(!u)return;ctx.save();ctx.translate(x,y);ctx.rotate(u.ang||0);ctx.globalAlpha=.65+.35*Math.sin(performance.now()/24);ctx.fillStyle='#fff4b0';ctx.beginPath();ctx.moveTo(16,-3);ctx.lineTo(30,0);ctx.lineTo(16,3);ctx.closePath();ctx.fill();ctx.fillStyle='#ff9b31';ctx.beginPath();ctx.arc(17,0,4,0,Math.PI*2);ctx.fill();ctx.restore()};
startAnim=function(u,pts,onDone){u.anim={pts,i:0,p:0};u.vx=pts[0][0];u.vy=pts[0][1];if(onDone)u.afterMove=onDone};
tick=function(dt){units.forEach(u=>{const a=u.anim;if(!a)return;let s=7*dt;while(s>0&&a.i<a.pts.length-1){a.p+=s;if(a.p>=1){s=a.p-1;a.p=0;a.i++}else s=0}if(a.i>=a.pts.length-1){u.vx=u.x;u.vy=u.y;delete u.anim;u._lx=u.x;u._ly=u.y;const cb=u.afterMove;delete u.afterMove;if(cb)cb()}else{const[x0,y0]=a.pts[a.i],[x1,y1]=a.pts[a.i+1];u.vx=x0+(x1-x0)*a.p;u.vy=y0+(y1-y0)*a.p}});for(let i=shotFx.length-1;i>=0;i--){shotFx[i].life-=dt;if(shotFx[i].life<=0)shotFx.splice(i,1)}if(queuedEndTurn&&!busy())endPlayerTurn()};
ai=function(e){if(e.bld){if(e.cd>0)e.cd--;else if(heal(e))e.cd=2;return}if((e.tr||[]).includes('capture')&&!e.moved){const b=capTarget2(e);if(b){doCapture(e,b);return}}const sx=e.x,sy=e.y,rc=bfs(e);rc[key(e.x,e.y)]=1;const vp=units.filter(v=>v.team==='p'&&seenBy('e',v));let best=null,bs=-1e9;for(const k in rc){const[x,y]=k.split(',').map(Number);for(const p of vp){const d=Math.abs(x-p.x)+Math.abs(y-p.y);if(d<1||d>e.rg||!canFireHeight({...e,x,y},p.x,p.y)||shotBlocked({...e,x,y},p.x,p.y))continue;const dm=calcDmg(e,p,1,x,y),s=(dm>=p.hp?100:0)+dm+d*.3;if(s>bs){bs=s;best={x,y,p}}}}if(best){e.x=best.x;e.y=best.y;e.f=best.p.x>=e.x?1:-1}else{const goals=vp.concat(units.filter(v=>v.bld&&v.team==='p'),bld[0]?[bld[0]]:[]).sort((a,b)=>dist(e,a)-dist(e,b));if(goals.length){const t=goals[0];let bk=null,bd=1e9;for(const k in rc){const[x,y]=k.split(',').map(Number),d=Math.abs(x-t.x)+Math.abs(y-t.y);if(d<bd){bd=d;bk=[x,y]}}if(bk){e.f=bk[0]>=e.x?1:-1;e.x=bk[0];e.y=bk[1]}}}const fire=()=>{if(best&&units.includes(e)&&units.includes(best.p)){e.f=best.p.x>=e.x?1:-1;attack(e,best.p);check()}};if((e.x!==sx||e.y!==sy)&&seenBy('p',e)){const p=findPath(sx,sy,e.x,e.y,e);startAnim(e,[[sx,sy],...(p||[[e.x,e.y]])],fire)}else fire()};
let rampEdges=new Set();
const edgeKey=(x1,y1,x2,y2)=>key(x1,y1)+'>'+key(x2,y2);
function stepAllowed(x1,y1,x2,y2){const a=hgt(x1,y1),b=hgt(x2,y2),d=Math.abs(a-b);if(d===0)return true;if(d!==.5)return false;return rampEdges.has(edgeKey(x1,y1,x2,y2))||rampEdges.has(edgeKey(x2,y2,x1,y1))}
function canFireHeight(a,x1,y1){let x=a.x,y=a.y,dx=Math.abs(x1-x),dy=Math.abs(y1-y),sx=x<x1?1:-1,sy=y<y1?1:-1,err=dx-dy;while(x!==x1||y!==y1){const px=x,py=y,e2=2*err;if(e2>-dy){err-=dy;x+=sx}if(e2<dx){err+=dx;y+=sy}const before=hgt(px,py),after=hgt(x,y);if(after>before&&(!rampEdges.has(edgeKey(px,py,x,y))||x!==x1||y!==y1))return false}return true}
findPath=function(sx,sy,dx,dy,self){const q=[[sx,sy]],prev={[key(sx,sy)]:null};while(q.length){const[x,y]=q.shift();if(x===dx&&y===dy){const p=[];let k=key(x,y);while(k){const[a,b]=k.split(',').map(Number);p.unshift([a,b]);k=prev[k]}return p.slice(1)}for(const[ox,oy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+ox,ny=y+oy,nk=key(nx,ny);if(nk in prev||blocked(nx,ny,self)||!stepAllowed(x,y,nx,ny))continue;prev[nk]=key(x,y);q.push([nx,ny])}}return null};
bfs=function(u){const out={},q=[[u.x,u.y,0]],seen=new Set([key(u.x,u.y)]);while(q.length){const[x,y,d]=q.shift();if(d>=u.mv)continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(seen.has(k)||blocked(nx,ny,u)||!stepAllowed(x,y,nx,ny))continue;seen.add(k);out[k]=1;q.push([nx,ny,d+1])}}return out};
function makeRamps(){rampEdges=new Set();for(let y=0;y<R;y++)for(let x=0;x<C;x++){const h=hgt(x,y);if(h<=0)continue;for(const[dx,dy]of[[0,-1],[1,0],[0,1],[-1,0]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=C||ny>=R||hgt(nx,ny)!==h-.5)continue;rampEdges.add(edgeKey(nx,ny,x,y));break}}}
const _terrRamp=terr;terr=function(){_terrRamp();rampEdges.forEach(e=>{const[a,b]=e.split('>').map(v=>v.split(',').map(Number)),x1=a[0]*T+T/2,y1=a[1]*T+T/2,x2=b[0]*T+T/2,y2=b[1]*T+T/2,dx=x2-x1,dy=y2-y1,m=Math.hypot(dx,dy)||1;g.strokeStyle='#f4d875';g.fillStyle='#f4d875';g.lineWidth=3;g.beginPath();g.moveTo(x1+dx/m*15,y1+dy/m*15);g.lineTo(x2-dx/m*20,y2-dy/m*20);g.stroke();g.beginPath();g.moveTo(x2-dx/m*13,y2-dy/m*13);g.lineTo(x2-dx/m*25-dy/m*6,y2-dy/m*25+dx/m*6);g.lineTo(x2-dx/m*25+dy/m*6,y2-dy/m*25-dx/m*6);g.closePath();g.fill()})};const _drawStatus=draw;draw=function(){_drawStatus();updateUnitStatus();if(shotFx.length){g.save();g.translate(-Math.round(camX),-Math.round(camY));shotFx.forEach(s=>{const k=1-s.life/s.max;g.globalAlpha=Math.min(1,s.life/.08);g.strokeStyle=s.team==='p'?'#ffe27a':'#ff6257';g.lineWidth=4;g.beginPath();g.moveTo(s.x+(s.tx-s.x)*Math.max(0,k-.25),s.y+(s.ty-s.y)*Math.max(0,k-.25));g.lineTo(s.x+(s.tx-s.x)*k,s.y+(s.ty-s.y)*k);g.stroke();g.fillStyle='#fff4bd';g.beginPath();g.arc(s.x,s.y,4,0,Math.PI*2);g.fill()});g.restore();g.globalAlpha=1}};
const _startStatus=start;start=function(i){queuedEndTurn=false;_startStatus(i);makeRamps();let bossUpgraded=false;units.forEach(u=>{u.morale=100;u.hp=Math.min(u.max,u.hp);if(u.bld){u.max=U.o.hp;u.hp=u.max}else if(LV[i].boss&&u.team==='e'&&!bossUpgraded){u.max=u.hp=160;bossUpgraded=true}});if(LV[i].test){bld=[];bm=0;units.push(mk('r',2,2));units[units.length-1].morale=100;start0=1;ui('Your turn')}if(LV[i].test)setTimeout(()=>info('Zero Zone: right-click and drag to find the distant enemy outpost. Move your Rifleman next to it, select the Rifleman, then click the yellow outlined outpost to capture it.'),1)};
function endPlayerTurn(){if(turn!=='p'||over)return;if(busy()){queuedEndTurn=true;$('#end').disabled=true;info('Finishing the current action, then ending your turn.');return}queuedEndTurn=false;sel=null;reach={};pend=null;skillMode=false;spawnSel=null;baseSel=false;cap('p');if(check())return;turn='e';ui('Enemy turn');info('Enemy is moving...');const list=units.filter(u=>u.team==='e');let i=0;(function next(){if(over)return;if(i>=list.length){cap('e');if(check())return;units.forEach(u=>u.moved=u.acted=false);turn='p';tc++;ui('Your turn');info('Your move.');return}const e=list[i++];if(e.hp>0&&units.includes(e))ai(e);const wait=()=>{if(busy()){setTimeout(wait,45);return}setTimeout(next,120)};wait()})()}
$('#end').onclick=endPlayerTurn;
