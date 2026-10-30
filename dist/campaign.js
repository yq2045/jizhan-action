'use strict';
// Campaign rules are separate from the shared movement, weapons and audio systems.
const CAMPAIGN_LEVELS = [
 {id:1,title:'沙丘前哨',type:'clear',theme:'desert',waves:2,size:2,brief:'清除两波前哨守军，打开通向内陆的道路。',tip:'第一波只有两辆轻型坦克。用雷射瞄准炮塔附近。',types:['tank','tank'],distance:2000},
 {id:2,title:'松林密件',type:'steal',theme:'forest',waves:3,size:2,brief:'靠近林间档案箱取得机密，然后返回绿色撤离区。',tip:'无需消灭全部守军。接近文件后自动拾取，带回出发点。',types:['tank','drone','tank'],distance:2400},
 {id:3,title:'冰原断电',type:'destroy',theme:'snow',waves:3,size:3,brief:'摧毁雪原雷达基地的两座军事设施。',tip:'基地有独立耐久，主炮、机枪和导弹均可造成伤害。',types:['tank','m1a2','drone'],distance:2300},
 {id:4,title:'港湾守望',type:'defend',theme:'coast',waves:3,size:3,brief:'守住我方机密终端，击退三波登陆部队。',tip:'红色炮弹能伤害终端。工程装甲车可以在前方筑垒阻挡地面进攻。',types:['tank','drone','tank'],distance:1100},
 {id:5,title:'赤岩封锁',type:'hunt',theme:'canyon',waves:3,size:3,brief:'击毁标有菱形标记的三辆指定重装坦克。',tip:'三辆标记目标分别出现在每波末尾，其他守军可以绕开。',types:['tank','heli','m1a2'],distance:3200},
 {id:6,title:'雨夜潜入',type:'steal',theme:'rain',waves:4,size:3,brief:'穿过雨夜城区，盗取通信密钥并安全撤回。',tip:'飞行载具可以绕过城区，地面载具沿坡道穿行。',types:['drone','tank','heli'],distance:3300},
 {id:7,title:'金色防线',type:'defend',theme:'autumn',waves:4,size:3,brief:'保卫秋林中的我方档案库，击退四波装甲部队。',tip:'优先击毁接近档案库的坦克，火箭齐射适合清除集群。',types:['tank','m109','drone','m1a2'],distance:1100},
 {id:8,title:'熔岩兵工厂',type:'destroy',theme:'volcanic',waves:4,size:3,brief:'摧毁火山盆地中的三座兵工设施。',tip:'榴弹炮的爆炸可以同时损伤相邻设施。红色地层是可通行的岩地。',types:['m1a2','heli','m270'],distance:3600},
 {id:9,title:'高原围猎',type:'hunt',theme:'highland',waves:4,size:3,brief:'在高原击毁四架标记的敌方直升机。',tip:'跟随目标指引，注意敌机起飞后会发射追踪导弹。',types:['tank','drone','heli'],distance:4000},
 {id:10,title:'黎明决战',type:'clear',theme:'dawn',waves:5,size:4,brief:'在黎明海港击退五波混合部队，完成最后的战役。',tip:'七种载具全部可选。每波之间有整备时间，修补道具可在暂停商店购买。',types:['m1a2','drone','heli','m270','m109'],distance:4500}
];
const MAP_THEMES = {
 desert:{name:'黄金沙海',sky:['#354650','#ad8a60','#e6c589'],soil:'#9a7247',edge:'#edd197',far:'#81705a',near:'#a1865b',scene:'dunes'},
 forest:{name:'苍翠松林',sky:['#142e35','#4e7463','#b5c28d'],soil:'#40583b',edge:'#a1bd68',far:'#314d44',near:'#244b3f',scene:'pine'},
 snow:{name:'极地雪原',sky:['#36506b','#9fb8c7','#e4edf0'],soil:'#718d9c',edge:'#f0f4ef',far:'#839ba9',near:'#adc3cd',scene:'snow'},
 coast:{name:'湛蓝海岸',sky:['#183e58','#5890a6','#b7d8d2'],soil:'#b39d72',edge:'#ecddb1',far:'#35748d',near:'#44869b',scene:'sea'},
 canyon:{name:'赤岩峡谷',sky:['#492c3e','#c16c4e','#f6b97a'],soil:'#8b4938',edge:'#da9361',far:'#805047',near:'#ad6751',scene:'mesa'},
 rain:{name:'雨夜城区',sky:['#111d34','#334353','#64747b'],soil:'#35494d',edge:'#81979b',far:'#243543',near:'#304752',scene:'city'},
 autumn:{name:'秋林防线',sky:['#3c4759','#a79478','#e9d0a2'],soil:'#63533a',edge:'#cfaa5b',far:'#75644b',near:'#9a713f',scene:'autumn'},
 volcanic:{name:'火山岩地',sky:['#261e35','#5a3c42','#b16f54'],soil:'#45343a',edge:'#c17757',far:'#513c46',near:'#68494b',scene:'volcano'},
 highland:{name:'青色高原',sky:['#245366','#6a9d9e','#c9d6a8'],soil:'#567255',edge:'#b6c481',far:'#6d8d82',near:'#4d756a',scene:'mountain'},
 dawn:{name:'黎明港口',sky:['#333657','#b2797d','#f4c697'],soil:'#657071',edge:'#d3b78c',far:'#66657c',near:'#77777f',scene:'port'}
};
const NEW_VEHICLES = {
 m1a2:{title:'M1A2 主战坦克',code:'M1A2',desc:'750 耐久 · 重装直射',detail:'以 Abrams 为外观原型。主炮基础伤害 110，每 1.1 秒一发，耗能 3；重装甲额外减伤 20%。',hp:750,damage:110,energy:3,interval:1.1,speed:1050},
 m109:{title:'M109 自行榴弹炮',code:'M109',desc:'420 耐久 · 曲射爆破',detail:'以 M109 为外观原型。榴弹基础伤害 150，爆炸半径 190，每 2 秒一发，耗能 4。炮弹受重力影响，瞄高一些可打得更远。',hp:420,damage:150,energy:4,interval:2,speed:640,splash:190,gravity:200},
 m270:{title:'M270 火箭炮',code:'M270',desc:'460 耐久 · 三发齐射',detail:'以 M270 MLRS 为外观原型。三发火箭齐射，每发基础伤害 75、爆炸半径 130，每组耗能 5，冷却 3 秒。火箭沿发射方向飞行。',hp:460,damage:75,energy:5,interval:3,speed:700,splash:130}
};
Object.assign(VEHICLE_CARDS,NEW_VEHICLES);
let campaignProgress={unlocked:1,completed:[],bestWave:0};
try{const p=JSON.parse(localStorage.getItem('jizhan-campaign-v1'));if(p){campaignProgress.unlocked=clamp(Math.floor(Number(p.unlocked)||1),1,10);campaignProgress.completed=Array.isArray(p.completed)?p.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=10):[];campaignProgress.bestWave=Math.max(0,Math.floor(Number(p.bestWave)||0))}}catch{}
function persistCampaign(){try{localStorage.setItem('jizhan-campaign-v1',JSON.stringify(campaignProgress))}catch{}}
let selectedMission=null;
let operation={active:false};
const missionTypeName=t=>({clear:'波次歼敌',steal:'机密夺取',destroy:'基地摧毁',defend:'机密防守',hunt:'指定目标'})[t];
function openOperations(){
 openModal(`<div class="eyebrow">OPERATION SELECT / 行动指挥部</div><h2>选择作战任务</h2><p>逐关推进战役，或进入持续增援的无尽战场。通关与最高波次保存在本机。</p><div class="operation-tabs"><button class="primary" id="campaignTab">十关战役 <span>01 — 10</span></button><button class="secondary" id="endlessTab">无尽模式 <span>∞</span></button></div><div class="campaign-status">战役进度 <b>${campaignProgress.completed.length} / 10</b><span>无尽最高第 ${campaignProgress.bestWave} 波</span></div><div class="level-grid">${CAMPAIGN_LEVELS.map(l=>{const locked=l.id>campaignProgress.unlocked,done=campaignProgress.completed.includes(l.id),c=MAP_THEMES[l.theme];return `<button class="level-card ${done?'complete':''}" data-level="${l.id}" ${locked?'disabled':''} style="--map-sky:${c.sky[1]};--map-ground:${c.soil};--map-edge:${c.edge}"><span class="level-landscape"><i></i><em>${String(l.id).padStart(2,'0')}</em></span><span class="level-info"><small>${locked?'先完成上一关':done?'✓ 已通关':missionTypeName(l.type)}</small><b>${l.title}</b><span>${c.name} · ${l.waves} 波守军</span></span></button>`}).join('')}</div><button class="secondary operation-back" id="operationHome">返回主菜单 ⌂</button>`);
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>openMissionBrief(+b.dataset.level));
 $('campaignTab').onclick=()=>openMissionBrief(campaignProgress.unlocked);$('endlessTab').onclick=()=>openMissionBrief('endless');$('operationHome').onclick=home;
}
function openMissionBrief(id){
 const level=id==='endless'?null:CAMPAIGN_LEVELS[id-1];if(id!=='endless'&&(!level||id>campaignProgress.unlocked))return;
 selectedMission=id;
 openModal(`<div class="eyebrow">${level?'CAMPAIGN / 第 '+String(id).padStart(2,'0')+' 关':'ENDLESS / 无尽战场'}</div><h2>${level?level.title:'没有终点的战线'}</h2><div class="brief-map" style="background:linear-gradient(155deg,${MAP_THEMES[level?.theme||'desert'].sky.join(',')})"><span>${MAP_THEMES[level?.theme||'desert'].name}</span><b>${level?missionTypeName(level.type):'∞'}</b></div><p class="mission-brief">${level?level.brief:'逐波击退混合部队。每到第 5、10、15……波，全部敌军永久增加 5 点攻击与 5 点防御；波次、攻击、防御持续增长，没有人为上限。'}</p><p>${level?level.tip:'每波逐个派出敌军，清场后进入下一波。防御抵扣所受伤害，任何命中至少造成原伤害的 10%，让弱火力仍有作用。每通过 5 波，战场环境轮换。'}</p><div class="brief-actions"><button class="secondary" id="backLevels">返回选关</button><button class="primary" id="prepareVehicle">选择载具 <b>↗</b></button></div>`);
 $('backLevels').onclick=openOperations;$('prepareVehicle').onclick=openVehicleSelection;
}
const originalVehicleSelection=openVehicleSelection;
openVehicleSelection=function(){originalVehicleSelection();const back=document.createElement?.('button');if(back){back.className='secondary vehicle-back';back.textContent='返回任务选择';back.onclick=()=>openMissionBrief(selectedMission||1);$('modalContent').appendChild(back)}};
const originalStart=start;
start=function(kind='heli'){
 // Clear terrain before resetting actors: stale forts must never set a new spawn height.
 forts=[];terrainMounds.length=0;
 originalStart(kind);
 const spec=NEW_VEHICLES[kind];if(spec){playerTank.vehicle=kind;playerTank.hp=playerTank.max=spec.hp;}
 if(selectedMission!==null)beginOperation(selectedMission);else operation={active:false};
 updateHud();
};
function beginOperation(id){
 const level=id==='endless'?null:CAMPAIGN_LEVELS[id-1];
 operation={active:true,id,endless:!level,level,wave:0,pending:[],spawnIn:0,nextIn:2,finished:false,carrying:false,markedKills:0,markedTotal:level?.type==='hunt'?level.waves:0,objects:[],elapsed:0};
 enemyQueue=[];applyOperationMap(level?.theme||'desert',level?.id||1);
 const h=player();h.x=400;h.y=groundAt(400)-(selectedVehicle==='drone'?135:isFlyingVehicle()?70:23);
 if(level?.type==='steal')operation.objects.push({kind:'file',x:level.distance,y:groundAt(level.distance)-70,hp:1,max:1,dead:false});
 if(level?.type==='destroy')for(let i=0;i<(level.id===8?3:2);i++){const x=level.distance+i*240;operation.objects.push({kind:'base',x,y:groundAt(x)-65,hp:level.id===8?600:420,max:level.id===8?600:420,dead:false});}
 if(level?.type==='defend')operation.objects.push({kind:'terminal',x:950,y:groundAt(950)-55,hp:1400,max:1400,allied:true,dead:false});
 camera.x=0;camera.y=GROUND-H*.77/viewScale;
 toast(level?`第 ${level.id} 关 · ${level.title}：${level.brief}`:'无尽模式 · 第 1 波即将抵达');
}
function applyOperationMap(theme,index){
 operation.theme=theme;terrainMounds.length=0;buildings=[];
 const relief=theme==='desert'?55:theme==='coast'?30:theme==='highland'?140:theme==='canyon'?120:70;
 for(let i=0;i<8;i++)terrainMounds.push({x:1300+i*1000+(index%3)*55,rise:240+(i%3)*70,top:80,fall:350+(i%2)*60,h:relief+(i%3)*18});
 // Keep start, mission facilities and extraction level and free of invisible building walls.
 const objective=operation.level?.distance||3000;
 for(let i=0;i<24;i++){const x=1250+i*350;if(Math.abs(x-objective)<850||i%3===0)continue;buildings.push({x,w:65+(i%3)*20,h:35+(i%4)*20,windows:true});}
 terrainMounds.splice(0,terrainMounds.length,...terrainMounds.filter(m=>Math.abs(m.x-objective)>600));
}
function endlessBonus(wave){return Math.floor(Math.max(0,wave)/5)*5}
function beginWave(){
 const op=operation;op.wave++;op.nextIn=0;op.spawnIn=0;
 if(op.endless&&op.wave>1&&(op.wave-1)%5===0){const themes=Object.keys(MAP_THEMES);op.theme=themes[Math.floor((op.wave-1)/5)%themes.length];}
 const l=op.level,count=op.endless?3+Math.min(5,Math.floor((op.wave-1)/3)):l.size;
 const pool=l?.types||['tank','drone','tank','heli','m1a2','m109','m270','engineer'];
 op.pending=Array.from({length:count},(_,i)=>({type:pool[(i+op.wave-1)%pool.length],marked:false}));
 if(l?.type==='hunt')op.pending[op.pending.length-1]={type:l.id===9?'heli':'m1a2',marked:true};
 if(op.wave===1&&l?.id===1)op.pending=[{type:'tank'},{type:'tank'}];
 if(op.endless){campaignProgress.bestWave=Math.max(campaignProgress.bestWave,op.wave);persistCampaign()}
 toast(`第 ${op.wave}${l?' / '+l.waves:''} 波来袭${op.endless?' · 攻击 +'+endlessBonus(op.wave)+' / 防御 +'+endlessBonus(op.wave):''}`);
}
const originalDispatch=dispatchEnemy;
dispatchEnemy=function(dt){
 if(!operation.active)return originalDispatch(dt);
 const op=operation;if(op.finished)return;op.elapsed+=dt;
 if(op.nextIn>0){op.nextIn-=dt;if(op.nextIn<=0)beginWave();return;}
 op.spawnIn-=dt;
 if(op.pending.length&&op.spawnIn<=0&&enemies().length<5){
  const unit=op.pending.shift();spawnOperationEnemy(unit);op.spawnIn=3.5;
 }
 if(op.level?.type==='hunt'&&!op.pending.length&&op.markedKills>=op.wave){for(const e of enemies())if(!e.marked)e.dead=true;}
 if(!op.pending.length&&enemies().length===0&&op.wave>0){
  if(op.endless||op.wave<op.level.waves){op.nextIn=5;toast('本波清除 · 5 秒后下一波');}
  else if(['clear','defend'].includes(op.level.type))finishOperation(true);
 }
};
function spawnOperationEnemy(unit){
 const h=player(),op=operation,defend=op.level?.type==='defend';
 let x=clamp((defend?950:h.x)+900+(dispatchCount%2)*160,1250,WORLD-450);
 if(x-h.x<350&&!defend)x=clamp(h.x-850,1100,WORLD-450);
 let e;
 if(unit.type==='heli'){for(let i=0;i<24&&Math.abs(slopeAt(x))>.05;i++)x=clamp(x+28,1000,WORLD-400);e=newEnemyHeli(x);enemyHelis.push(e)}
 else if(unit.type==='drone'){e=newDrone(x,true);enemyDrones.push(e)}
 else if(unit.type==='engineer'){e={x,y:groundAt(x)-23,hp:200,max:200,energy:100,vx:0,vy:0,dir:-1,turn:-1,angle:0,tread:0,phase:'travel',progress:0,work:0,site:x-200,cd:0,stage:'engineer',dead:false};engineers.push(e)}
 else{addTank(x);e=tanks[tanks.length-1];if(NEW_VEHICLES[unit.type]){e.vehicle=unit.type;e.hp=e.max=NEW_VEHICLES[unit.type].hp*.55;e.baseDamage=unit.type==='m1a2'?16:unit.type==='m109'?20:14;}}
 e.y=groundAt(e.x)-(e.drone?180:e.enemy?70:23);e.dir=-1;e.turn=-1;if(e.enemy)e.flip=-1;
 e.attackBonus=op.endless?endlessBonus(op.wave):Math.floor((op.level.id-1)/3)*2;
 e.armor=op.endless?endlessBonus(op.wave):Math.floor((op.level.id-1)/4)*2;
 e.marked=!!unit.marked;e.operationWave=op.wave;dispatchCount++;
 return e;
}
function combatTarget(e){const base=operation.active&&operation.level?.type==='defend'&&operation.objects.find(o=>o.kind==='terminal'&&!o.dead);return base&&Math.abs(e?.x-base.x)<1400?base:player()}
const originalDamageEnemy=damageEnemy;
damageEnemy=function(t,d){const wasDead=t.dead;originalDamageEnemy(t,Math.max(d*.1,d-(t.armor||0)));if(!wasDead&&t.dead&&operation.active&&t.marked)operation.markedKills++};
function damageObjective(o,d){if(o.dead||d<=0)return;o.hp=Math.max(0,o.hp-d);if(o.hp===0){o.dead=true;effects(o.x,o.y,75,1.6);if(o.allied)finishOperation(false);else{save.cash+=200;persist()}}}
function missionMissileContact(m,x0,y0,x1,y1){if(!operation.active||operation.finished)return null;let best=null;for(const o of operation.objects){if(o.dead||o.kind==='file'||!!m.enemy!==!!o.allied)continue;const t=segmentEntryTime(x0,y0,x1,y1,o.x-62,o.y-55,124,115);if(t!==null&&(!best||t<best.t))best={t,target:o}}return best}
function missionProjectileHit(b){if(!operation.active||operation.finished||b.life<=0)return false;for(const o of operation.objects){if(o.dead||o.kind==='file'||!!b.enemy!==!!o.allied)continue;if(segmentHit(b.px,b.py,b.x,b.y,o.x-62,o.y-55,124,115)){damageObjective(o,b.damage);b.life=0;if(b.splash)areaBlast(b.x,b.y,b.splash,b.damage,null,o);impactEffect(b.x,b.y,false);return true}}return false}
function areaBlast(x,y,radius,damage,exclude=null,excludeObject=null){effects(x,y,36,.9);rings.push({x,y,r:5,life:.4,speed:radius/.4});for(const e of enemies())if(e!==exclude){const d=Math.hypot(e.x-x,e.y-y);if(d<radius)damageEnemy(e,damage*(1-.5*d/radius));}if(operation.active)for(const o of operation.objects)if(!o.dead&&!o.allied&&o.kind==='base'&&o!==excludeObject){const d=Math.hypot(o.x-x,o.y-y);if(d<radius+55)damageObjective(o,damage*(1-.5*Math.min(d/radius,1)));}for(const f of forts)if(!f.dead&&Math.abs(f.x+f.rise-x)<radius)damageFort(f,damage)}
const originalDetonate=detonateMissile;
detonateMissile=function(m){originalDetonate(m);if(!operation.active)return;const r=m.enemy?260:MISSILE_RADIUS[m.level],d=m.enemy?40+(m.owner?.attackBonus||0):MISSILE_DAMAGE[m.level];for(const o of operation.objects){if(o.dead||o.kind==='file'||!!o.allied!==!!m.enemy)continue;const distance=Math.hypot(o.x-m.x,o.y-m.y);if(distance<r+50)damageObjective(o,d*(1-.5*Math.min(distance/r,1)));}};
function updateOperation(dt){
 const op=operation;if(!op.active||op.finished||player().dead)return;
 const l=op.level,h=player();pruneOperationWrecks();if(!l)return;
 if(l.type==='steal'){
  const file=op.objects[0];if(!op.carrying&&Math.hypot(h.x-file.x,h.y-file.y)<170){op.carrying=true;file.dead=true;battleAudio.play('supply');toast('取得敌方机密 · 返回绿色撤离区');}
  if(op.carrying&&h.x<700&&h.y>groundAt(h.x)-240)finishOperation(true);
 }
 if(l.type==='destroy'&&op.objects.filter(o=>o.kind==='base').every(o=>o.dead))finishOperation(true);
 if(l.type==='hunt'&&op.markedKills>=op.markedTotal)finishOperation(true);

}
function pruneOperationWrecks(){if(tanks.length>30)tanks=tanks.filter(e=>!e.dead);if(enemyHelis.length>16)enemyHelis=enemyHelis.filter(e=>!e.dead);if(enemyDrones.length>20)enemyDrones=enemyDrones.filter(e=>!e.dead);if(engineers.length>12)engineers=engineers.filter(e=>!e.dead);if(forts.length>40)forts=forts.filter(f=>!f.dead||Math.abs(f.x-player().x)<1500);}
function finishOperation(win){
 if(!operation.active||operation.finished)return;operation.finished=true;operation.won=win;
 if(win&&!operation.endless){const id=operation.level.id;if(!campaignProgress.completed.includes(id)){campaignProgress.completed.push(id);save.cash+=300+id*60;persist();}campaignProgress.unlocked=Math.max(campaignProgress.unlocked,Math.min(10,id+1));persistCampaign();}
 mode='dead';showResult(win);
}
const originalUpdate=update;
update=function(dt){originalUpdate(dt);updateOperation(dt);updateOperationHud()};
function missionObjective(){
 const op=operation,l=op.level;if(!op.active||op.finished)return null;
 if(l?.type==='steal')return op.carrying?{x:450,y:GROUND-90,label:'撤离区'}:{...op.objects[0],label:'敌方机密'};
 if(l?.type==='destroy')return {...op.objects.find(o=>!o.dead&&o.kind==='base'),label:'敌方基地'};
 if(l?.type==='defend')return {...op.objects[0],label:'我方机密'};
 const e=enemies().filter(e=>l?.type!=='hunt'||e.marked).sort((a,b)=>Math.abs(a.x-player().x)-Math.abs(b.x-player().x))[0];
 return e?{x:e.x,y:e.y,label:e.marked?'指定目标':'敌方目标'}:null;
}
function updateOperationHud(){if(!operation.active)return;const op=operation,l=op.level,obj=missionObjective(),distance=obj?.x!==undefined?Math.round(Math.abs(obj.x-player().x)):null;
 $('missionSector').textContent=op.endless?'ENDLESS / 无限增援':'CAMPAIGN / '+String(l.id).padStart(2,'0');$('missionTitle').textContent=op.endless?'无尽战场':l.title;
 let text=op.endless?`第 ${Math.max(1,op.wave)} 波 · 攻击 +${endlessBonus(op.wave)} / 防御 +${endlessBonus(op.wave)}`:`${missionTypeName(l.type)} · 第 ${Math.max(1,op.wave)} / ${l.waves} 波`;
 if(l?.type==='defend')text+=` · 机密 ${Math.ceil(op.objects[0].hp)} / 1400`;
 if(l?.type==='hunt')text+=` · 指定目标 ${op.markedKills} / ${op.markedTotal}`;
 if(l?.type==='destroy')text+=` · 设施 ${op.objects.filter(o=>o.dead).length} / ${op.objects.length}`;
 if(l?.type==='steal')text+=' · '+(op.carrying?'携密撤离':'接近文件自动拾取');
 if(op.nextIn>0)text+=` · ${Math.ceil(op.nextIn)} 秒后增援`;
 $('missionText').textContent=op.finished?(op.won?'任务完成':'行动结束'):text;
 $('objectiveGuide').textContent=distance!==null?`${obj.x<player().x?'◀':'▶'} ${obj.label} · ${distance} 米`:operation.finished?(operation.won?'任务完成':'行动结束'):'等待下一波增援';
}
const originalHud=updateHud;
updateHud=function(){originalHud();const spec=NEW_VEHICLES[selectedVehicle];if(spec){$('unitName').textContent=spec.code;$('flightState').textContent=player().blocked?'履带打滑':Math.abs(player().vx)>2?'地面行进':'待命';$('hint').textContent='A/D 移动 · 鼠标 / 空格开火 · '+spec.detail;$('landingBtn').disabled=true;$('landingBtn').querySelector('small').textContent='地面载具';}updateOperationHud()};
const originalResult=showResult;
showResult=function(win){
 if(!operation.active)return originalResult(win);operation.finished=true;operation.won=win;
 const op=operation,l=op.level;
 openModal(`<div class="eyebrow">${win?'MISSION COMPLETE / 任务完成':'OPERATION ENDED / 行动结束'}</div><h2>${win?l.title+' · 通关':op.endless?'无尽战场 · 第 '+op.wave+' 波':'第 '+l.id+' 关 · 行动失败'}</h2><p>${win?l.id===10?'十关战役全部完成！可以重玩任意关卡，或继续挑战无尽模式。':'下一关已解锁，首次通关奖励已保存。':op.endless?'最高波次已保存。升级装备后再挑战更远的战线。':player().dead?'载具已被摧毁。保留本次所获资金，可更换载具重新出击。':'我方机密设施被摧毁。请优先拦截接近设施的敌军。'}</p><div class="result-stats">击毁 ${kills} &nbsp; / &nbsp; 资金 ${save.cash}</div>${win&&l.id<10?'<button class="primary" id="nextMission">下一关 · 选择载具 ↗</button>':''}<div class="result-actions"><button class="secondary" id="retry">重试当前任务</button><button class="secondary" id="resultLevels">返回选关</button><button class="secondary" id="returnHome">返回主菜单</button></div>`);
 const retryKind=selectedVehicle;$('retry').onclick=()=>start(retryKind);$('resultLevels').onclick=openOperations;$('returnHome').onclick=home;if(win&&l.id<10)$('nextMission').onclick=()=>openMissionBrief(l.id+1);
};
const originalFire=fire;
fire=function(){const spec=NEW_VEHICLES[selectedVehicle];if(!spec)return originalFire();const h=player();if(shotCd>0||h.dead||h.energy<spec.energy)return false;const a=aim();h.aimAngle=a.a;h.energy-=spec.energy;shotCd=spec.interval;const count=selectedVehicle==='m270'?3:1;for(let i=0;i<count;i++){const angle=a.a+(i-(count-1)/2)*.06;bullets.push({x:a.x+Math.cos(angle)*i*16,y:a.y+Math.sin(angle)*i*16,vx:Math.cos(angle)*spec.speed,vy:Math.sin(angle)*spec.speed,life:6,enemy:false,damage:spec.damage*(1+(save.tracks-1)*.2),shell:true,splash:spec.splash||0,gravity:spec.gravity||0,rocket:selectedVehicle==='m270'});}effects(a.x,a.y,4,.3);battleAudio.play(selectedVehicle==='m270'?'missile':'cannon',{x:h.x,y:h.y});return true};
const originalReduction=damageReduction;damageReduction=function(){return originalReduction()*(selectedVehicle==='m1a2'?.8:1)};
const originalTurret=turretAim;
turretAim=function(t,tx,ty){const kind=t.vehicle||(t===playerTank?selectedVehicle:null);if(!NEW_VEHICLES[kind])return originalTurret(t,tx,ty);const pivot={x:t.x,y:t.y-(kind==='m1a2'?29:kind==='m109'?40:37)},a=Math.atan2(ty-pivot.y,tx-pivot.x),length=kind==='m1a2'?101:kind==='m109'?87:70;return{x:pivot.x+Math.cos(a)*length,y:pivot.y+Math.sin(a)*length,a,dx:Math.cos(a),dy:Math.sin(a),pivot}};
const originalBodyBox=bodyBox;bodyBox=function(v){if(NEW_VEHICLES[v.vehicle])return{rx:60,ry:40,mass:v.vehicle==='m1a2'?14:10,air:false};return originalBodyBox(v)};
const originalTargetRadius=targetRadius;targetRadius=function(v){return NEW_VEHICLES[v.vehicle]?60:originalTargetRadius(v)};
const originalDrawTank=drawTank;
drawTank=function(t){const kind=t.vehicle;if(!NEW_VEHICLES[kind])return originalDrawTank(t);drawModernVehicle(t,kind)};
function drawModernVehicle(t,kind){
 const sand=kind==='m1a2',col=t.allied?(sand?'#9b9366':kind==='m109'?'#5a7666':'#5e6c4d'):'#71584b';
 ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle||0);ctx.scale(t.turn||1,1);
 ctx.beginPath();ctx.roundRect(-60,-3,120,28,12);ctx.fillStyle='#15232a';ctx.fill();ctx.strokeStyle='#879181';ctx.lineWidth=2;ctx.stroke();
 for(let x=-45;x<=45;x+=15){circle(x,10,9,'#586454','#9caa8b');circle(x,10,3,'#26332d');}
 for(let i=0;i<32;i++){const phase=((i/32+(t.tread||0)/240)%1+1)%1;let x,y;if(phase<.42){x=48-phase/.42*96;y=-2}else if(phase<.5){const a=-Math.PI/2-(phase-.42)/.08*Math.PI;x=-48+12*Math.cos(a);y=10+12*Math.sin(a)}else if(phase<.92){x=-48+(phase-.5)/.42*96;y=22}else{const a=Math.PI/2-(phase-.92)/.08*Math.PI;x=48+12*Math.cos(a);y=10+12*Math.sin(a)}rect(x-3,y-2,6,4,'#a5aa8c')}
 poly([[-63,-5],[-50,-23],[45,-23],[64,-9],[56,1],[-59,1]],col,'#1a2b2d',3);line(-45,-20,43,-20,'#c0c19b',2);
 for(let i=0;i<6;i++)rect(-46+i*16,-13,11,9,sand?'#c1b68b':'#748872');
 if(kind==='m270'){poly([[-52,-23],[-50,-54],[-19,-55],[-2,-34],[-2,-23]],col,'#1a2b2d',2);poly([[-43,-49],[-23,-49],[-12,-36],[-43,-36]],'#284550','#a2b4a0');}
 if(t.allied)rect(-50,-18,9,5,'#8fe4d0');ctx.restore();
 const pivot=turretAim(t,t.x+Math.cos(t.aimAngle||0)*1000,t.y-30+Math.sin(t.aimAngle||0)*1000).pivot;
 ctx.save();ctx.translate(pivot.x,pivot.y);ctx.rotate(t.aimAngle||0);
 if(kind==='m270'){rect(-22,-21,81,42,col);rect(-20,-20,78,4,'#a5b191');for(let row=0;row<2;row++)for(let i=0;i<6;i++){rect(-15+i*11,-14+row*16,8,12,'#293d33');circle(-11+i*11,-8+row*16,3,'#c7b168')}rect(58,-23,12,46,'#26382f');}
 else{poly([[-31,-15],[-22,-26],[17,-25],[36,-9],[32,15],[-31,15]],col,'#263c35',2);const length=kind==='m1a2'?101:87;rect(20,-6,length-26,12,col);rect(length-13,-9,13,18,'#394b3b');line(29,-4,length-17,-4,'#c1c4a1',2);circle(-5,-10,10,'#364b3d','#acb695');if(kind==='m109'){rect(-35,-21,18,40,'#607364');line(-29,-21,-29,-49,'#9eb69c',2)}}
 ctx.restore();if(t.hp<t.max){rect(t.x-42,t.y-74,84,4,'#1a282b');rect(t.x-42,t.y-74,84*t.hp/t.max,4,t.allied?'#91cdb0':'#df7e67')}
}
const originalBackground=background;
background=function(menu=false){if(menu||!operation.active)return originalBackground(menu);drawMapBackground(MAP_THEMES[operation.theme])};
function drawMapBackground(theme){
 const sky=ctx.createLinearGradient(0,0,0,H);theme.sky.forEach((c,i)=>sky.addColorStop(i/2,c));rect(0,0,W,H,sky);
 circle(W*.77,H*.26,theme.scene==='rain'?25:42,theme.scene==='snow'?'#ecf5ec70':'#ffe9b547');
 for(let layer=0;layer<3;layer++){const base=H*(.57+layer*.11),shift=camera.x*(.06+layer*.07);let points=[[-100,H]];for(let i=-2;i<=W/160+3;i++){let x=i*160-(shift%160),height=70+Math.sin(i*7.8+layer)*45+layer*16;points.push([x,base],[x+70,base-height],[x+130,base-height*.75]);}points.push([W+200,H]);poly(points,layer===2?theme.near:theme.far);}
 const scene=theme.scene;
 if(scene==='sea'||scene==='port'){rect(0,H*.66,W,H*.2,theme.near);for(let i=0;i<18;i++){const x=((i*151+time*13-camera.x*.12)%(W+180)+W+180)%(W+180)-90;line(x,H*.67+(i%6)*H*.028,x+75,H*.67+(i%6)*H*.028,'#d8ecea39',1)} }
 for(let i=-2;i<W/100+3;i++){const x=i*110-(camera.x*.23%110),y=H*.78,h=50+(i%4)*18;
  if(scene==='pine'){rect(x-3,y-h*.9,6,h,'#213e34');for(let j=0;j<3;j++)poly([[x,y-h-j*13],[x-28+j*6,y-j*19],[x+28-j*6,y-j*19]],i%2?'#2e5541':'#345f48');}
  if(scene==='autumn'){rect(x-3,y-65,7,70,'#625443');circle(x,y-75,33,i%2?'#ba8d4a':'#9d6b42');circle(x+22,y-57,23,'#be9b59');}
  if(scene==='city'||scene==='port'){rect(x,y-h,62,h,theme.far);for(let j=0;j<3;j++)rect(x+10+j*15,y-h+16,6,11,'#e8c97755');if(scene==='port'){line(x,y-h,x,y-h-65,'#4c5563',3);line(x-25,y-h-60,x+70,y-h-60,'#4c5563',3);line(x+50,y-h-60,x+50,y-h-15,'#4c5563',1)}}
  if(scene==='mesa')poly([[x-35,y],[x-20,y-h],[x+38,y-h],[x+55,y]],'#9f6250');
 }
 if(scene==='volcano'){poly([[W*.4,H*.68],[W*.61,H*.25],[W*.69,H*.3],[W*.9,H*.7]],'#523b42');line(W*.62,H*.32,W*.68,H*.58,'#e7965f80',6);}
 if(scene==='snow'||scene==='rain')for(let i=0;i<65;i++){const x=((i*143+time*(scene==='rain'?-90:12))%(W+100)+W+100)%(W+100)-50,y=(i*97+time*(scene==='rain'?650:34))%H;if(scene==='rain')line(x,y,x-5,y+20,'#d5e6e638',1);else circle(x,y,1.5,'#eff8f280');}
}
const originalTerrain=drawTerrain;
drawTerrain=function(left,right){if(!operation.active)return originalTerrain(left,right);const t=MAP_THEMES[operation.theme];let points=[[left,GROUND+800]];for(let x=left;x<=right+12;x+=12)points.push([x,groundAt(x)]);points.push([right+12,GROUND+800]);poly(points,t.soil,t.edge,4);for(let x=Math.floor(left/65)*65;x<right;x+=65){line(x,groundAt(x)+18,x+26,groundAt(x+26)+22,t.edge+'55',2);if(['forest','autumn','highland'].includes(operation.theme)){line(x+8,groundAt(x+8),x+5,groundAt(x+8)-10,t.edge,2)}}for(const f of forts)if(!f.dead){const top=GROUND-fortHeight(f);for(let i=0;i<5;i++)line(f.x+f.rise+i*20,top,f.x+f.rise+10+i*20,top+12,'#edd6a477',2);}};
function drawMissionObjects(){
 if(!operation.active)return;
 for(const o of operation.objects){if(o.dead){if(o.kind==='base')poly([[o.x-65,o.y+60],[o.x-45,o.y+32],[o.x+30,o.y+28],[o.x+66,o.y+60]],'#363b39');continue;}const allied=o.allied,col=allied?'#9be4c7':'#f4b96a';
  ctx.save();ctx.translate(o.x,o.y);if(o.kind==='file'){rect(-25,-30,50,57,'#2e4b4d');rect(-20,-35,40,32,'#e8d798');for(let i=0;i<3;i++)line(-12,-25+i*8,11,-25+i*8,'#526660',2);rect(-28,5,56,20,'#47666a');}
  else{poly([[-64,60],[-64,-18],[-42,-42],[44,-42],[64,-20],[64,60]],allied?'#3b6268':'#6e6251','#b7bd9c',2);rect(-47,-17,94,12,'#243b41');rect(-20,8,40,52,'#253c40');rect(-11,17,22,20,allied?'#82d8c3':'#d5825e');line(26,-42,26,-100,'#bbcab5',3);ctx.save();ctx.translate(26,-100);ctx.rotate(Math.sin(time)*.3);ctx.beginPath();ctx.arc(0,0,28,0,Math.PI);ctx.strokeStyle=col;ctx.lineWidth=3;ctx.stroke();line(0,0,0,25,col,2);ctx.restore();rect(-62,-65,124,5,'#192b32');rect(-62,-65,124*o.hp/o.max,5,col);}
  ctx.textAlign='center';ctx.font='bold 14px sans-serif';ctx.fillStyle=col;ctx.fillText(o.kind==='file'?'敌方机密 · 靠近拾取':allied?'我方机密终端':'敌方军事设施',0,o.kind==='file'?-60:-135);ctx.textAlign='left';ctx.restore();
 }
 if(operation.level?.type==='steal'){const y=groundAt(450);rect(260,y-5,380,7,'#8fe4bf');ctx.save();ctx.globalAlpha=.12+.04*Math.sin(time*3);rect(260,y-240,380,240,'#8fe4bf');ctx.restore();ctx.fillStyle='#c8f0d7';ctx.font='18px sans-serif';ctx.fillText('撤离区',380,y-30);}
 if(operation.carrying){const h=player();rect(h.x-10,h.y-52,20,25,'#eddb9b');for(let i=0;i<3;i++)line(h.x-6,h.y-46+i*5,h.x+6,h.y-46+i*5,'#596c59',1);}
 for(const e of enemies())if(e.marked){const y=e.y-(e.enemy?125:70);poly([[e.x,y-12],[e.x+10,y],[e.x,y+12],[e.x-10,y]],null,'#ffdb73',2);}
 const target=missionObjective();if(target?.x!==undefined){const left=camera.x+50/viewScale,right=camera.x+(W-50)/viewScale,x=clamp(target.x,left,right),y=clamp(target.y-160,camera.y+Math.min(300,H*.35)/viewScale,camera.y+(H-210)/viewScale);if(target.x<left||target.x>right){ctx.fillStyle='#ffe1a1';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText(target.x<left?'◀':'▶',x,y);ctx.textAlign='left';}}
}
const originalHome=home;home=function(){originalHome();operation={active:false};selectedMission=null};
$('start').onclick=openOperations;
// Visible objective guidance works on narrow touch screens as well as desktop.
const guide=document.createElement?.('div');if(guide){guide.id='objectiveGuide';guide.className='objective-guide';$('hud').appendChild(guide)}
const originalSnapshot=window.gameSnapshot;window.gameSnapshot=()=>({...originalSnapshot(),operation:JSON.parse(JSON.stringify(operation)),campaignProgress:{...campaignProgress}});

function drawRocketProjectile(b){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));poly([[-8,-3],[8,-3],[14,0],[8,3],[-8,3]],'#dac78d','#566852');poly([[-8,-2],[-20-Math.sin(time*45)*4,0],[-8,2]],'#ffae3d');rect(-4,-3,3,6,'#dc8e45');ctx.restore()}
