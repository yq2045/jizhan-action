'use strict';
const ENEMY_ROTATION=['tank','m109','drone','m270','heli','m1a2','engineer','fighter'];
const ENEMY_CLASSES={
 tank:{name:'普通坦克',ammo:'尖头炮弹',note:'直射 · 中型尖头弹'},
 engineer:{name:'工程装甲车',ammo:'短筒炮弹',note:'短粗弹体 · 同时筑垒'},
 m1a2:{name:'M1A2 重型坦克',ammo:'长杆穿甲弹',note:'长弹芯 · 清晰尾迹'},
 m109:{name:'M109 自行榴弹炮',ammo:'圆头榴弹',note:'明显下坠 · 范围爆炸'},
 m270:{name:'M270 火箭炮',ammo:'带尾翼火箭',note:'三发齐射 · 持续尾焰'},
 drone:{name:'轻型无人机',ammo:'微型枪弹',note:'小光点 · 短曳光'},
 heli:{name:'突击直升机',ammo:'机枪曳光弹',note:'细长弹体 · 连续射击'},
 fighter:{name:'高速战斗机',ammo:'航空机枪弹',note:'与直升机同级机枪参数'}
};
MAP_THEMES.wasteland={name:'废弃工业区',sky:['#15232c','#3b4b4b','#76806b'],soil:'#263329',edge:'#8d8c65',far:'#39494b',near:'#253638',scene:'industrial'};
const wastelandMounds=terrainMounds.map(m=>({...m})),wastelandBuildings=buildings.map(b=>({...b}));
const themedMap=applyOperationMap;
applyOperationMap=function(theme,index){if(theme!=='wasteland')return themedMap(theme,index);operation.theme='wasteland';terrainMounds.splice(0,terrainMounds.length,...wastelandMounds.map(m=>({...m})));buildings=wastelandBuildings.map(b=>({...b}));};
const classifiedSpawn=spawnOperationEnemy;
spawnOperationEnemy=function(spec){let e;if(spec.type==='fighter'){e=newEnemyHeli(clamp(player().x+1000,1300,WORLD-450));e.fighter=true;e.hp=e.max=180;e.level=1;e.dir=-1;e.flip=-1;enemyHelis.push(e);e.attackBonus=operation.endless?endlessBonus(operation.wave):0;e.armor=operation.endless?endlessBonus(operation.wave):0;e.marked=!!spec.marked;e.operationWave=operation.wave;dispatchCount++;}else e=classifiedSpawn(spec);e.unitKind=spec.type;const c=ENEMY_CLASSES[spec.type];if(c)toast(`敌方增援：${c.name} · ${c.ammo}`);return e;};
const typedWeaponProfile=weaponProfile;
weaponProfile=function(kind,level=1){const w=typedWeaponProfile(kind==='fighter'?'heli':kind,level);return kind==='engineer'?{...w,visual:'carShell'}:w};
const typedWeaponLevel=weaponLevel;
weaponLevel=function(unit,kind,enemy){return typedWeaponLevel(unit,kind==='fighter'?'heli':kind,enemy)};
const typedUnitAim=unitWeaponAim;
unitWeaponAim=function(unit,kind,tx,ty){return typedUnitAim(unit,kind==='fighter'?'heli':kind,tx,ty)};
function missileBlastProfile(m){const level=clamp(m.level||1,1,3);return{radius:MISSILE_RADIUS[level]*(m.intercepted?.12:1),damage:MISSILE_DAMAGE[level]+(m.enemy?(m.owner?.attackBonus||0):0)}}
function missileBulletEntry(b,m,dt){const a=Math.atan2(m.vy,m.vx),c=Math.cos(a),s=Math.sin(a),x0=b.px-m.x,y0=b.py-m.y,x1=b.x-m.x-m.vx*dt,y1=b.y-m.y-m.vy*dt;return segmentEntryTime(x0*c+y0*s,-x0*s+y0*c,x1*c+y1*s,-x1*s+y1*c,-26,-10,56,20)}
function interceptMissileHit(b,dt){
 if(b.life<=0)return false;let best=null;
 for(const m of missiles){if(m.life<=0||!!m.enemy===!!b.enemy)continue;const t=missileBulletEntry(b,m,dt);if(t===null||t*dt>=m.life)continue;const impact=missileContact(m,m.x,m.y,m.x+m.vx*dt,m.y+m.vy*dt);if(impact&&impact.t<t)continue;if(!best||t<best.t)best={m,t};}
 if(!best)return false;
 const targets=b.enemy?friendlyTargets():enemies();for(const v of targets){const box=bodyBox(v),t=segmentEntryTime(b.px,b.py,b.x,b.y,v.x-box.rx,v.y-box.ry,box.rx*2,box.ry*2);if(t!==null&&t<best.t)return false;}
 if(operation.active)for(const o of operation.objects){if(o.dead||o.kind==='file'||!!o.allied!==!!b.enemy)continue;const t=segmentEntryTime(b.px,b.py,b.x,b.y,o.x-62,o.y-55,124,115);if(t!==null&&t<best.t)return false;}
 const steps=Math.max(1,Math.ceil(Math.hypot(b.x-b.px,b.y-b.py)/6));for(let i=0;i<=steps;i++){const t=i/steps;if(t>=best.t)break;const x=mix(b.px,b.x,t),y=mix(b.py,b.y,t);if(y>=groundAt(x))return false;}
 const {m,t}=best;b.x=mix(b.px,b.x,t);b.y=mix(b.py,b.y,t);b.life=0;m.interceptHits=(m.interceptHits||0)+1;m.hitFlash=.12;impactEffect(b.x,b.y,true);
 if(m.interceptHits>=5){m.x+=m.vx*dt*t;m.y+=m.vy*dt*t;m.intercepted=true;m.life=0;detonateMissile(m);toast('导弹已被五次命中拦截 · 小范围爆炸');}return true;
}
function drawGuidedMissile(m){
 ctx.save();ctx.translate(m.x,m.y);ctx.scale(1.65,1.65);ctx.rotate(Math.atan2(m.vy,m.vx));const level=m.level||1,fl=16+level*5;
 poly([[-12,-4],[-12-fl*(.8+Math.random()*.3),0],[-12,4]],'#ff7f25');poly([[-13,-2],[-13-fl*.6,0],[-13,2]],'#fff8a1');poly([[-14,-4],[10,-4],[18,0],[10,4],[-14,4]],m.enemy?'#ed615c':'#f2d34b','#8f7a36');
 if(level>1){rect(-7,-4,level===3?6:3,8,m.enemy?'#ffaaa2':'#f58d27');rect(2,-4,level===3?6:3,8,m.enemy?'#ffaaa2':'#f58d27');}poly([[-12,-3],[-18,-10],[-7,-4]],'#9c9a6a');poly([[-12,3],[-18,10],[-7,4]],'#9c9a6a');
 if(m.interceptHits)for(let i=0;i<5;i++)circle(-10+i*5,9,1.2,i<m.interceptHits?'#f9f2cc':'#634d43');ctx.restore();
}
const beforeGuideOperations=openOperations;
openOperations=function(){beforeGuideOperations();const anchor=$('modalContent').querySelector?.('.operation-tabs');if(anchor?.insertAdjacentHTML){anchor.insertAdjacentHTML('afterend','<button class="enemy-guide-link" id="enemyGuide">敌军分类与弹药识别 ↗</button>');$('enemyGuide').onclick=openEnemyGuide;}};
function openEnemyGuide(){
 openModal(`<div class="eyebrow">ENEMY IDENTIFICATION / 敌情识别</div><h2>不同兵种，不同弹药</h2><p>敌弹均为红色，用弹体、尾迹与弹道区分。相同等级的敌我武器数值一致，无尽模式另加波次增益。</p><div class="ammo-guide-grid">${Object.entries(ENEMY_CLASSES).map(([kind,c])=>`<article><h3>${c.name}</h3><canvas width="300" height="95" data-ammo="${kind}" aria-label="${c.ammo}动态演示"></canvas><b>${c.ammo}</b><small>${c.note}</small></article>`).join('')}<article><h3>制导导弹</h3><canvas width="300" height="95" data-ammo="missile" aria-label="导弹动态演示"></canvas><b>五次命中可以拦截</b><small>拦截后爆炸半径缩至 12% · 伤害不变</small></article></div><button class="secondary" id="guideBack">返回任务选择</button>`);$('guideBack').onclick=openOperations;
}
const renderBeforeGuide=renderSelectionPreview;
renderSelectionPreview=function(){renderBeforeGuide();if($('modal').hidden)return;for(const c of document.querySelectorAll('[data-ammo]')){const main=ctx;try{ctx=c.getContext('2d');ctx.clearRect(0,0,300,95);const kind=c.dataset.ammo,t=(time*.55)%1,x=35+t*210,y=kind==='m109'?20+60*t*t:47;ctx.save();ctx.strokeStyle='#99acb62a';ctx.setLineDash([5,8]);line(20,75,280,75,'#99acb62a',1);ctx.setLineDash([]);if(kind==='missile')drawGuidedMissile({x,y,level:1,enemy:true,vx:1,vy:0});else{const w=weaponProfile(kind,1);ctx.translate(x,y);ctx.scale(2,2);for(let i=0;i<(kind==='m270'?3:1);i++)drawWeaponProjectile({x:-i*18,y:i*7,vx:1,vy:kind==='m109'?t*.6:0,enemy:true,weapon:w.visual,rocket:w.visual==='rocket'});}ctx.restore();}finally{ctx=main;}}};
const originalProjectileArt=drawWeaponProjectile;
drawWeaponProjectile=function(b){const visual=b.weapon||(b.droneShot?'drone':b.shell?'shell':'gun'),color=b.enemy?'#f36965':'#ffb347';if(!['carShell','shell','heavy','grenade','drone'].includes(visual))return originalProjectileArt(b);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));if(visual==='drone'){circle(0,0,2,color);line(-6,0,-2,0,color,1);}else if(visual==='carShell'){rect(-6,-4,10,8,color);rect(4,-3,4,6,b.enemy?'#ffb3a9':'#e8d39d');}else if(visual==='grenade'){ctx.beginPath();ctx.ellipse(0,0,11,7,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();rect(-7,-6,4,12,'#746355');line(-17,0,-12,0,'#b4b6ad80',3);}else if(visual==='heavy'){poly([[-19,-2],[6,-2],[15,0],[6,2],[-19,2]],color,'#c7b89d');rect(-10,-5,4,10,b.enemy?'#f6b2a4':'#d6b46c');line(-42,0,-21,0,color,2);}else{poly([[-10,-4],[3,-4],[11,0],[3,4],[-10,4]],color,'#66594a');line(-24,0,-12,0,color,2);}ctx.restore();};
