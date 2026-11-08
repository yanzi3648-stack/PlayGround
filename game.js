import * as THREE from 'three';

const world = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#c7e4dc');
scene.fog = new THREE.Fog('#c7e4dc', 34, 72);
const camera = new THREE.OrthographicCamera(-16, 16, 10, -10, .1, 100);
camera.position.set(17, 22, 18);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
world.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight('#f4fff0', '#7b9671', 2.2); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1ca', 2.5); sun.position.set(-12, 24, 10); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-28; sun.shadow.camera.right=28; sun.shadow.camera.top=28; sun.shadow.camera.bottom=-28; sun.shadow.bias=-.0002; scene.add(sun);
const mat = (color, roughness=1) => new THREE.MeshStandardMaterial({color, roughness, flatShading:true});
const groundMat=mat('#a8c996'), grassMat=mat('#b9d5a5'), roadMat=mat('#ded9bd'), sidewalkMat=mat('#e9e5cd'), whiteMat=mat('#fff8e6');
const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,90),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
const grid = new THREE.GridHelper(80,40,'#91b586','#91b586');grid.position.y=-.105;grid.material.transparent=true;grid.material.opacity=.13;scene.add(grid);

function box(parent,x,y,z,w,h,d,material, opts={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y+h/2,z);m.castShadow=opts.cast!==false;m.receiveShadow=true;parent.add(m);return m}
function cone(parent,x,y,z,r,h,material,segments=5){const m=new THREE.Mesh(new THREE.ConeGeometry(r,h,segments),material);m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function sphere(parent,x,y,z,r,material,segments=8){const m=new THREE.Mesh(new THREE.SphereGeometry(r,segments,segments),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
function cylinder(parent,x,y,z,rt,rb,h,material,n=7){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),material);m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function road(x,z,w,d){box(scene,x,-.04,z,w,.08,d,roadMat,{cast:false});}
road(0,0,45,7); road(0,0,7,43);
// Little sidewalks and crosswalks
for(const s of [-1,1]){box(scene,0,-.015,s*4.1,45,.11,.45,sidewalkMat,{cast:false});box(scene,s*4.1,-.015,0,.45,.11,43,sidewalkMat,{cast:false});}
for(let i=-3;i<=3;i++){box(scene,i*.72,.012,-3.22,.42,.015,.11,whiteMat,{cast:false});box(scene,i*.72,.012,3.22,.42,.015,.11,whiteMat,{cast:false});box(scene,-3.22,.012,i*.72,.11,.015,.42,whiteMat,{cast:false});box(scene,3.22,.012,i*.72,.11,.015,.42,whiteMat,{cast:false});}

const locations=[
 {id:'cafe',name:'Moss & Mugs',type:'Cozy café',emoji:'☕',x:-9,z:-8,color:'#d58c64',roof:'#9c6652',need:'energy',description:'The neighborhood café smells like cinnamon and fresh coffee. Pick up a shift, grab a bite, or just enjoy a warm drink.',action:'Get a barista shift',pay:42,job:'Barista',hours:'9:00 AM – 5:00 PM'},
 {id:'studio',name:'Petal & Press',type:'Creative studio',emoji:'🎨',x:9,z:-8,color:'#91b5a2',roof:'#638a76',need:'fun',description:'A sunlit little print studio full of color, kind people, and half-finished ideas. They are always looking for a creative hand.',action:'Apply for a role',pay:56,job:'Design assistant',hours:'10:00 AM – 6:00 PM'},
 {id:'park',name:'Clover Park',type:'City park',emoji:'🌳',x:-9,z:8,color:'#81ad76',roof:'#568659',need:'social',description:'A leafy pocket of calm with friendly faces, a pond, and the best patch of afternoon sunshine in Maplewood.',action:'Take a breather',needBoost:{energy:9,social:24,fun:15,hunger:-5,hygiene:-2},hours:'Open all day'},
 {id:'home',name:'Your Tiny Home',type:'Home sweet home',emoji:'🏡',x:9,z:8,color:'#e6b866',roof:'#bd7955',need:'hunger',description:'Your own little corner of the world. Make something simple in the kitchen and settle in for a restorative moment.',action:'Make a home-cooked meal',needBoost:{hunger:38,energy:12,hygiene:5,social:-2,fun:5},hours:'Always open'},
];
const clickable=[];
function makeBuilding(loc){
 const g=new THREE.Group();g.position.set(loc.x,0,loc.z);scene.add(g);loc.group=g;
 const main=mat(loc.color), roof=mat(loc.roof), trim=mat('#f4e8cc'), dark=mat('#596a58'), glass=mat('#b5d8d0',.45), door=mat('#735d49');
 // parcel/garden
 box(g,0,0,0,6.2,.12,5.4,grassMat,{cast:false});
 box(g,0,.12,0,3.9,.12,3.6,sidewalkMat,{cast:false});
 // steps
 box(g,0,.18,2.1,1.3,.12,.55,trim); box(g,0,.28,1.8,1.05,.12,.45,trim);
 // body and roof
 box(g,0,.24,0,3.2,2.6,3,main);
 const roofMesh=new THREE.Mesh(new THREE.ConeGeometry(2.55,1.5,4),roof);roofMesh.rotation.y=Math.PI/4;roofMesh.position.set(0,3.6,0);roofMesh.scale.set(1,1,.82);roofMesh.castShadow=true;g.add(roofMesh);
 // front facade details
 box(g,0,.55,1.54,.9,1.45,.12,door);
 box(g,-.9,1.45,1.56,.75,.72,.10,glass);box(g,.9,1.45,1.56,.75,.72,.10,glass);
 box(g,-.9,1.45,1.63,.08,.8,.08,trim);box(g,.9,1.45,1.63,.08,.8,.08,trim);
 box(g,0,2.38,1.62,1.8,.28,.16,trim);
 // sign board and location text plaque
 box(g,0,2.12,1.72,1.12,.35,.12,roof);
 // awning
 if(loc.id==='cafe'){for(let i=0;i<5;i++)box(g,-1.45+i*.72,1.92,1.92,.36,.38,.28,i%2?trim:mat('#f4bd86'));}
 if(loc.id==='studio'){box(g,0,1.82,1.92,2.3,.28,.35,trim);}
 // chimney / rooftop embellishment
 if(loc.id==='home'){box(g,1.05,3.35,-.65,.4,1,.4,main);}
 // stepping stones
 for(let i=0;i<3;i++){const stone=new THREE.Mesh(new THREE.CylinderGeometry(.23,.25,.07,6),trim);stone.position.set(0,.15,2.55+i*.5);g.add(stone)}
 // doorway light / pennant
 sphere(g,-.72,2.65,1.7,.1,mat('#f2c56f'));
 // clickable pad with pulsing marker
 const pad=new THREE.Mesh(new THREE.CircleGeometry(.65,24),mat('#fff3cf'));pad.rotation.x=-Math.PI/2;pad.position.set(0,.15,3.5);g.add(pad);loc.pad=pad;
 const marker=new THREE.Group();marker.position.set(0,4.9,0);g.add(marker);loc.marker=marker;
 const bubble=new THREE.Mesh(new THREE.SphereGeometry(.31,10,8),mat('#fffaf0'));bubble.castShadow=true;marker.add(bubble);
 const iconCanvas=document.createElement('canvas');iconCanvas.width=128;iconCanvas.height=128;const ctx=iconCanvas.getContext('2d');ctx.font='90px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(loc.emoji,64,69);
 const tex=new THREE.CanvasTexture(iconCanvas);tex.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));sprite.scale.set(.55,.55,1);sprite.position.z=.04;marker.add(sprite);
 const hit=new THREE.Mesh(new THREE.BoxGeometry(5,5,5),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(0,2,0);g.add(hit);hit.userData.location=loc;clickable.push(hit);loc.hit=hit;
 // bushes and trees
 for(const [tx,tz] of [[-2.2,-1.7],[2.25,-1.8],[-2.2,1.8],[2.15,1.8]]){cylinder(g,tx,.12,tz,.13,.18,.28,mat('#795b47'),6);sphere(g,tx,.62,tz,.55,mat(loc.id==='park'?'#77a875':'#81ac79'),7);sphere(g,tx-.18,.95,tz+.05,.42,mat('#91bd83'),7);}
 // little side flower pots
 for(let i=0;i<3;i++){cylinder(g,-2.7,.13,-.7+i*.65,.17,.19,.24,mat('#b77a5b'),7);sphere(g,-2.7,.47,-.7+i*.65,.2,mat(i%2?'#e6a886':'#d99a9b'),6)}
 return g;
}
locations.forEach(makeBuilding);

function makeTree(x,z,scale=1){const group=new THREE.Group();group.position.set(x,0,z);group.scale.setScalar(scale);scene.add(group);cylinder(group,0,0,0,.18,.28,1.1,mat('#80634a'),6);cone(group,0,0.65,0,1.05,1.6,mat('#75a96e'),6);cone(group,0,1.35,0,.78,1.35,mat('#8ebc7a'),6);cone(group,0,1.95,0,.48,1.1,mat('#a4c985'),6);}
[[-16,-13],[-15,0],[-16,14],[-4,-15],[3,-15],[15,-14],[16,-1],[15,14],[-4,15],[3,15],[-12,-2],[12,2]].forEach((p,i)=>makeTree(...p,.8+(i%3)*.14));
// street lamps and benches
function lamp(x,z){cylinder(scene,x,0,z,.1,.13,2.5,mat('#5f725d'),6);box(scene,x,2.55,z,.5,.12,.5,mat('#667c61'));sphere(scene,x,2.82,z,.22,mat('#f9d991'));}
[[-5,-4],[5,-4],[-5,4],[5,4]].forEach(p=>lamp(...p));
function bench(x,z){box(scene,x,.25,z,1.3,.12,.42,mat('#a77c52'));box(scene,x,.12,z-.16,1.2,.12,.12,mat('#87664a'));box(scene,x,.12,z+.16,1.2,.12,.12,mat('#87664a'));for(const s of [-.48,.48])box(scene,x+s,0,z,.12,.25,.12,mat('#64735d'));}
bench(-6,0);bench(6,0);
// Flower beds add color to the plaza edges
for(let i=0;i<18;i++){const x=-3.6+(i%6)*1.44,z=(i<9?-5:5);const f=mat(['#eaa797','#f2d077','#c39bc8'][i%3]);sphere(scene,x,.2,z,.17,f,6);}

// Avatar: tiny low-poly wanderer
const player=new THREE.Group();scene.add(player);player.position.set(0,0,0);
const skin=mat('#e9b38c'), shirt=mat('#568b70'), pants=mat('#526776'), hair=mat('#624a3d'), shoe=mat('#f0e2c8');
const body=new THREE.Mesh(new THREE.ConeGeometry(.42,.85,6),shirt);body.position.y=.95;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.IcosahedronGeometry(.3,1),skin);head.position.set(0,1.58,0);head.castShadow=true;player.add(head);
const hairMesh=new THREE.Mesh(new THREE.SphereGeometry(.31,7,5,0,Math.PI*2,0,Math.PI*.56),hair);hairMesh.position.set(0,1.68,0);player.add(hairMesh);
const legs=[];for(const x of [-.17,.17]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,.47,.18),pants);leg.position.set(x,.36,0);leg.castShadow=true;player.add(leg);legs.push(leg);const foot=box(player,x,.02,.08,.2,.13,.3,shoe)}
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.45,16),new THREE.MeshBasicMaterial({color:'#3c573c',transparent:true,opacity:.18}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;player.add(shadow);

const state={needs:{hunger:82,energy:88,social:70,fun:77,hygiene:84},money:120,xp:0,level:1,job:null,time:8*60,day:1,speed:1,muted:true,goalDone:false,position:new THREE.Vector3(0,0,0),target:null,selected:null};
const needDefs=[['hunger','🍓','Hunger'],['energy','⚡','Energy'],['social','♡','Social'],['fun','✦','Fun'],['hygiene','✿','Hygiene']];
const needList=document.querySelector('#need-list');
needList.innerHTML=needDefs.map(([id,icon,label])=>`<div class="need-row"><span class="need-icon">${icon}</span><div><div class="need-label">${label}</div><div class="need-bar"><i id="bar-${id}"></i></div></div><span class="need-value" id="value-${id}">80</span></div>`).join('');
const $=s=>document.querySelector(s);
function renderUI(){
 for(const [id] of needDefs){const v=Math.round(state.needs[id]);const bar=$(`#bar-${id}`);bar.style.width=`${v}%`;bar.style.background=v<25?'#dc806b':v<50?'#e5b35e':'#80b78b';$(`#value-${id}`).textContent=v;}
 const low=Math.min(...Object.values(state.needs));$('#mood').textContent=low<20?'Needs a reset':low<40?'A little tired':'Feeling good';$('#mood').style.background=low<25?'#f8e5df':'#e8f4e5';$('#mood').style.color=low<25?'#bd7868':'#638a5d';
 $('#money').textContent=`$${state.money}`;$('#job-title').textContent=state.job||'New in town';$('#xp-label').textContent=`${state.xp} / 100`;$('#xp-fill').style.width=`${state.xp}%`;$('#level').textContent=String(state.level).padStart(2,'0');
 $('#goal-title').textContent=state.goalDone?'Make this place yours':'Find your first job';$('#goal-desc').textContent=state.goalDone?'Your Maplewood story is officially underway.':'Stop by the studio or café to get started.';$('#goal-check').textContent=state.goalDone?'✓':'○';$('#goal-check').classList.toggle('done',state.goalDone);
 updateClock();
}
function addXP(n){state.xp+=n;if(state.xp>=100){state.xp-=100;state.level++;state.money+=25;toast('Level up! +$25 pocket money ✨');playTone(660,.1);setTimeout(()=>playTone(880,.15),120)}renderUI()}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2400)}
function setNeed(id,n){state.needs[id]=THREE.MathUtils.clamp(state.needs[id]+n,0,100);renderUI()}

const audio={ctx:null,master:null,osc:[],playing:false,timer:null};
function ensureAudio(){if(!audio.ctx){audio.ctx=new (window.AudioContext||window.webkitAudioContext)();audio.master=audio.ctx.createGain();audio.master.gain.value=.08;audio.master.connect(audio.ctx.destination)}}
function playTone(freq,duration=.18,type='sine'){if(state.muted)return;ensureAudio();const o=audio.ctx.createOscillator(),g=audio.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,audio.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.13,audio.ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,audio.ctx.currentTime+duration);o.connect(g);g.connect(audio.master);o.start();o.stop(audio.ctx.currentTime+duration+.03)}
function startMusic(){if(audio.playing||state.muted)return;ensureAudio();audio.playing=true;const notes=[261.6,329.6,392,329.6,293.7,349.2,440,349.2,261.6,329.6,392,523.3,440,392,329.6,293.7];let i=0;const tick=()=>{if(!audio.playing)return;playTone(notes[i++%notes.length],.42,'triangle');audio.timer=setTimeout(tick,520)};tick()}
$('#sound-toggle').addEventListener('click',()=>{state.muted=!state.muted;$('#sound-toggle').classList.toggle('sound-on',!state.muted);$('#sound-toggle').textContent=state.muted?'♫':'♪';if(state.muted){audio.playing=false;clearTimeout(audio.timer)}else{startMusic();playTone(523,.16)}});

function timeString(minutes){const h=Math.floor(minutes/60),m=minutes%60;return `${String(h%12||12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`}
function updateClock(){const t=state.time,h=Math.floor(t/60);$('#clock').textContent=timeString(t);$('#day-label').textContent=`${['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'][(state.day-1)%7]} · DAY ${state.day}`;const phase=h<6||h>=20?'night':h<11?'morning':h<16?'afternoon':'evening';const labels={morning:'Morning glow',afternoon:'Golden afternoon',evening:'Soft evening',night:'Quiet night'};$('#daytime-copy').textContent=labels[phase];$('#season-copy').textContent=`Spring · Week ${Math.ceil(state.day/7)}`;$('#clock-sun').textContent=phase==='night'?'☾':'☀';$('#weather-icon').textContent=phase==='night'?'☾':'☀';$('#weather-text').textContent=phase==='night'?'CLEAR NIGHT':'CLEAR SKIES';const amount=phase==='night'?.2:phase==='morning'?.78:phase==='evening'?.48:1;sun.intensity=.45+1.9*amount;hemi.intensity=phase==='night'?1.0:2.2;scene.fog.color.set(phase==='night'?'#647d85':'#c7e4dc');scene.background.set(phase==='night'?'#657d89':'#c7e4dc');sun.color.set(phase==='evening'?'#f5c995':'#fff1ca');}
function advanceTime(mins){state.time+=mins;if(state.time>=1440){state.time-=1440;state.day++;toast(`Day ${state.day} has begun 🌤`)}renderUI()}

function selectLocation(loc){state.selected=loc;$('#selected-text').textContent=`${loc.name} · ${loc.type}`;document.querySelectorAll('.place-item').forEach(el=>el.classList.toggle('active',el.dataset.id===loc.id));locations.forEach(l=>l.pad.material.color.set(l===loc?'#f5d992':'#fff3cf'));}
function populatePlaces(){const list=$('#place-list');list.innerHTML=locations.map(l=>`<button class="place-item" data-id="${l.id}"><span class="place-emoji">${l.emoji}</span><span class="place-meta"><strong>${l.name}</strong><small>${l.type} · ${l.hours}</small></span><span class="place-arrow">›</span></button>`).join('');list.querySelectorAll('.place-item').forEach(el=>el.addEventListener('click',()=>travelTo(locations.find(l=>l.id===el.dataset.id))));}
function travelTo(loc){selectLocation(loc);state.target=new THREE.Vector3(loc.x,0,loc.z+3.1);toast(`Heading to ${loc.name}…`);playTone(460,.1);}
populatePlaces();
