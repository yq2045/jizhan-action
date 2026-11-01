'use strict';
// Fifty explicit chassis/armament combinations. Names are original game designs.
const MECHANIC_FAMILIES={scout:'侦察车辆',ifv:'步兵战车',armor:'重装坦克',artillery:'自行榴弹炮',rocket:'火箭炮',aa:'防空机械',heli:'突击直升机',fighter:'战斗机',drone:'无人机',support:'工程支援'};
const MECHANIC_ROWS=[
 ['scout','萤火侦察车',340,160,9,.18,1100,1,1,0,0,'gun',null],
 ['scout','雨燕突击车',420,150,7,.3,1050,1,3,0,0,'drone',null],
 ['scout','沙狐巡逻车',520,135,22,.32,1000,2,1,0,0,'carShell',null],
 ['scout','追猎速射车',650,125,16,.15,1200,2,2,0,0,'gun',null],
 ['scout','夜枭穿甲车',780,115,100,.8,1400,3,1,0,0,'heavy',null],
 ['ifv','磐石步战车',700,88,28,.35,980,2,1,0,0,'carShell',null],
 ['ifv','獾式双炮战车',820,80,24,.4,950,2,2,0,0,'shell',null],
 ['ifv','火蜥榴弹战车',900,72,85,1.2,620,3,1,115,160,'grenade',null],
 ['ifv','雷獾齐射战车',1050,68,42,.7,1050,3,3,0,0,'carShell',null],
 ['ifv','壁垒重步战车',1250,58,140,1,1200,3,1,80,0,'heavy',null],
 ['armor','苍狼主战坦克',1100,72,100,1,1100,3,1,0,0,'shell',null],
 ['armor','铁犀装甲坦克',1450,62,125,1.1,1150,3,1,0,0,'heavy','armor'],
 ['armor','破城双炮坦克',1650,55,95,1.2,1000,4,2,85,0,'heavy',null],
 ['armor','玄武堡垒坦克',2000,45,210,1.4,1100,4,1,120,0,'heavy','armor'],
 ['armor','泰坦重型坦克',2400,38,260,1.6,1250,5,1,150,0,'heavy','armor'],
 ['artillery','山雀轻榴弹炮',650,80,100,1.6,610,3,1,140,190,'grenade',null],
 ['artillery','赤隼自行火炮',850,68,160,2,650,4,1,190,200,'grenade',null],
 ['artillery','震岳攻坚炮',1100,55,230,2.4,700,4,1,220,210,'grenade',null],
 ['artillery','双峰齐射榴弹炮',1250,48,140,2.5,680,5,2,190,200,'grenade',null],
 ['artillery','雷鸣重榴弹炮',1500,40,340,3,760,5,1,270,230,'grenade',null],
 ['rocket','飞蝗轻火箭车',620,100,45,2,650,3,2,100,0,'rocket',null],
 ['rocket','赤潮三联火箭车',850,82,65,2.5,720,4,3,125,0,'rocket',null],
 ['rocket','流星四联火箭车',1050,68,65,3,800,5,4,140,0,'rocket',null],
 ['rocket','暴雨六联火箭车',1250,55,55,3.5,780,5,6,150,0,'rocket',null],
 ['rocket','天火攻城火箭车',1550,45,130,4,850,5,4,210,0,'rocket',null],
 ['aa','刺蜂机炮车',600,100,12,.1,1250,1,1,0,0,'gun',null],
 ['aa','银隼双联机炮车',800,88,13,.15,1300,2,2,0,0,'gun',null],
 ['aa','追星防空导弹车',900,72,115,2.4,650,4,1,150,0,'rocket','guided'],
 ['aa','长空双联导弹车',1100,60,105,3,720,5,2,165,0,'rocket','guided'],
 ['aa','穹顶远程防空车',1400,48,210,3.5,820,5,2,190,0,'rocket','guided'],
 ['heli','蜂鸟轻型直升机',480,340,10,.1,1150,1,1,0,0,'gun',null],
 ['heli','黑隼突击直升机',650,325,16,.12,1150,1,1,0,0,'gun',null],
 ['heli','岩鹫双炮直升机',780,310,14,.15,1050,2,2,0,0,'carShell',null],
 ['heli','赤翼火箭直升机',850,300,60,1.5,780,3,2,125,0,'rocket',null],
 ['heli','重锤武装直升机',1000,285,22,.12,1200,2,2,0,0,'gun','armor'],
 ['fighter','迅风轻型战斗机',500,520,12,.1,1200,1,1,0,0,'gun',null],
 ['fighter','猎隼截击机',650,540,18,.1,1350,1,1,0,0,'gun',null],
 ['fighter','雷翼双炮战斗机',800,500,15,.12,1300,2,2,0,0,'gun',null],
 ['fighter','风暴火箭攻击机',900,480,75,1.6,900,4,3,140,0,'rocket',null],
 ['fighter','苍穹重型战斗机',1100,460,27,.1,1450,2,2,0,0,'gun','armor'],
 ['drone','蜻蜓侦察无人机',110,500,4,.2,1100,1,1,0,0,'drone',null],
 ['drone','飞萤双弹无人机',160,470,5,.3,1050,2,2,0,0,'drone',null],
 ['drone','黄雀突击无人机',230,440,12,.22,1200,2,1,0,0,'gun',null],
 ['drone','雨燕火箭无人机',300,400,40,1.5,750,3,2,100,0,'rocket',null],
 ['drone','钢蜂重型无人机',420,360,24,.28,1300,3,2,0,0,'carShell','armor'],
 ['support','筑垒工程履带车',900,60,45,.65,950,2,1,0,0,'carShell','build'],
 ['support','白鹭战地救护车',760,95,12,.3,1000,1,1,0,0,'gun','heal'],
 ['support','雷池移动补能车',900,80,16,.35,1000,2,1,0,0,'carShell','energy'],
 ['support','天幕护盾发生车',1300,55,30,.6,1100,2,1,0,0,'shell','shield'],
 ['support','蜂巢前线指挥车',1800,40,18,.3,1050,2,1,0,0,'gun','command']
];
const MECHANICS={};
const familyBase={scout:'tank',ifv:'tank',armor:'m1a2',artillery:'m109',rocket:'m270',aa:'tank',heli:'heli',fighter:'fighter',drone:'drone',support:'tank'};
for(let i=0;i<MECHANIC_ROWS.length;i++){
 const [family,name,hp,speed,damage,interval,shotSpeed,energy,count,splash,gravity,visual,ability]=MECHANIC_ROWS[i],key='machine_'+String(i+1).padStart(2,'0'),tier=i%5+1;
 const base=ability==='build'?'engineer':ability==='command'?'factory':familyBase[family];
 const power=Math.round(hp*.025+damage*count/interval*.8+(splash||0)*.18+speed*.035+({build:35,heal:45,energy:40,shield:80,command:110,armor:35,guided:50}[ability]||0));
 const abilityText={build:'自动三层筑垒',heal:'190范围每秒治疗10',energy:'190范围每秒补能5',shield:'180范围护盾，8秒工作/12秒充能',command:'生产菜单与自动派出2架侦察机',armor:'额外20%减伤',guided:'追踪导弹'}[ability]||'自主作战';
 const spec={key,family,name,hp,speed,damage,interval,shotSpeed,energy,count,splash,gravity,visual,ability,tier,base,power,abilityText};MECHANICS[key]=spec;
 VEHICLE_CARDS[key]={title:name,code:'M-'+String(i+1).padStart(2,'0'),desc:`${MECHANIC_FAMILIES[family]} · ${hp} 耐久`,detail:`${hp} 耐久 · 基础伤害 ${damage}${count>1?' × '+count:''} · 射击间隔 ${interval}秒 · 耗能 ${energy}。${abilityText}。战力 ${power}，越强的敌军越稀有。`};
 ENEMY_CLASSES[key]={name,ammo:visual==='grenade'?'曲射榴弹':visual==='rocket'?(ability==='guided'?'追踪导弹':'多联火箭'):visual==='heavy'?'穿甲弹':visual==='drone'?'微型弹':'机炮弹',note:abilityText};ALLIED_HEALTH[key]=hp;
}
const AUTHOR_KIND='author',ENEMY_DAMAGE_FACTOR=.4;
VEHICLE_CARDS.author={title:'作者专属',code:'AUTHOR',desc:'密码解锁 · 绿色飞行方块',detail:'无限耐久、不耗能、无需助跑。左键每发50伤害，右键发射秒杀弹；手机有独立秒杀按钮。敌军不会生成此单位。'};
let authorUnlocked=false,authorAltHeld=false,authorAltCd=0;
try{authorUnlocked=localStorage.getItem('jizhan-author-unlocked')==='1'}catch{}
function unlockAuthor(code){if(String(code).trim().toUpperCase()!=='ABCD')return false;authorUnlocked=true;try{localStorage.setItem('jizhan-author-unlocked','1')}catch{}return true}
function expandedBase(kind){return kind===AUTHOR_KIND?'drone':MECHANICS[kind]?.base||kind}
function withBaseVehicle(fn){const key=selectedVehicle,base=expandedBase(key);selectedVehicle=base;try{return fn()}finally{selectedVehicle=key}}
const expansionPlayer=player;player=function(){return withBaseVehicle(()=>expansionPlayer())};
const expansionFlying=isFlyingVehicle;isFlyingVehicle=function(){return withBaseVehicle(()=>expansionFlying())};
const expansionPilot=isPilotedAircraft;isPilotedAircraft=function(){return withBaseVehicle(()=>expansionPilot())};
function applyMechanic(u,key,enemy=false){const s=MECHANICS[key];if(!s)return u;u.variant=key;u.allied=!enemy;u.enemy=enemy;u.hp=u.max=s.hp*(enemy?.65:1);u.level=u.level||1;u.energy=100;u.passiveAge=0;u.factory=s.base==='factory';if(u.factory)u.productionReady=0;u.traction=clamp(Math.ceil(s.tier/2),1,3);return u}
const expansionStart=start;
start=function(kind='heli'){if(typeof kind!=='string'||!VEHICLE_CARDS[kind])kind=VEHICLE_CARDS[selectedVehicle]?selectedVehicle:'heli';if(kind===AUTHOR_KIND&&!authorUnlocked){toast('作者专属尚未解锁，请输入密码');return false}authorAltHeld=false;authorAltCd=0;const s=MECHANICS[kind];expansionStart(expandedBase(kind));const u=player();if(s)applyMechanic(u,kind);if(kind===AUTHOR_KIND){u.author=true;u.hp=u.max=Infinity;u.energy=100;u.y=groundAt(u.x)-190;u.grounded=false;}selectedVehicle=kind;choiceVehicle=kind;updateHud();return true};
const expansionCreate=createAllied;
createAllied=function(kind,role='combat',slot=0){if(kind===AUTHOR_KIND)return null;const u=expansionCreate(expandedBase(kind),role,slot);if(MECHANICS[kind])applyMechanic(u,kind);return u};
const expansionSpawn=spawnOperationEnemy;
spawnOperationEnemy=function(unit){if(unit.type===AUTHOR_KIND)return null;const s=MECHANICS[unit.type],base=s?.base||unit.type;let u;if(base==='factory'){addTank(clamp(player().x+1000,1200,WORLD-300));u=tanks.at(-1);u.factory=true;u.mechanicId=++mechanicSerial;u.unitKind='factory';u.hp=u.max=1800;u.attackBonus=operation.endless?endlessBonus(operation.wave):0;u.armor=operation.endless?endlessBonus(operation.wave):0;dispatchCount++;}else u=expansionSpawn({...unit,type:base});if(s)applyMechanic(u,unit.type,true);u.unitKind=unit.type;u.marked=!!unit.marked;toast(`敌方增援：${VEHICLE_CARDS[unit.type]?.title||'机械单位'}${s?' · 战力 '+s.power:''}`);return u};
function enemyPower(kind){if(MECHANICS[kind])return MECHANICS[kind].power;const hp=kind==='factory'?1800:ALLIED_HEALTH[kind]||600,w=weaponProfile(kind,1);return Math.round(hp*.025+(w.damage||0)*(w.count||1)/(w.interval||1)*.8+(w.splash||0)*.18+(kind==='factory'?110:0))}
function enemyWeight(kind){return kind===AUTHOR_KIND?0:1/Math.pow(1+enemyPower(kind)/60,2.6)}
function eligibleEnemyKinds(){return Object.keys(VEHICLE_CARDS).filter(k=>k!==AUTHOR_KIND)}
function weightedEnemyKind(random=rand,excluded=new Set()){const list=eligibleEnemyKinds().filter(k=>!excluded.has(k)),sum=list.reduce((n,k)=>n+enemyWeight(k),0);let pick=clamp(random(),0,1-Number.EPSILON)*sum;for(const k of list){pick-=enemyWeight(k);if(pick<0)return k}return list.at(-1)}
function weightedEnemyBatch(count,random=rand){const out=[];for(let i=0;i<count;i++)out.push(weightedEnemyKind(random,new Set(out)));return out}
const expansionDispatch=dispatchEnemy;dispatchEnemy=function(dt){enemyQueue=enemyQueue.filter(k=>k!==AUTHOR_KIND);return expansionDispatch(dt)};
const expansionProfile=weaponProfile;
weaponProfile=function(kind,level=1){const s=MECHANICS[kind];if(!s)return expansionProfile(kind,level);return{damage:s.damage*(1+(clamp(level,1,3)-1)*.2),interval:s.interval,speed:s.shotSpeed,energy:s.energy,count:s.count,splash:s.splash,gravity:s.gravity,visual:s.visual,sound:s.visual==='rocket'?'missile':s.visual==='gun'||s.visual==='drone'?'gun':'cannon',shell:s.visual!=='gun'&&s.visual!=='drone',life:6,guided:s.ability==='guided'}};
const expansionLevel=weaponLevel;weaponLevel=function(u,kind,enemy){return expansionLevel(u,expandedBase(kind),enemy)};
const expansionAim=unitWeaponAim;unitWeaponAim=function(u,kind,x,y){return expansionAim(u,expandedBase(kind),x,y)};
const expansionEmit=emitVehicleWeapon;
emitVehicleWeapon=function(u,kind,a,enemy=false,level=1){if(u.factory&&!u.variant)return false;kind=u.variant||kind;const w=weaponProfile(kind,level),bonus=enemy?(u.attackBonus||0):0;
 if(w.guided){if(u.dead||(u.energy??100)<w.energy)return false;u.energy-=w.energy;u.aimAngle=a.a;const target=enemy?combatTarget(u):enemies().sort((x,y)=>Math.hypot(x.x-u.x,x.y-u.y)-Math.hypot(y.x-u.x,y.y-u.y))[0];for(let i=0;i<w.count;i++){const angle=a.a+(i-(w.count-1)/2)*.07;missiles.push({x:a.x,y:a.y,vx:Math.cos(angle)*220,vy:Math.sin(angle)*220,tx:target?.x??a.x+a.dx*1000,ty:target?.y??a.y+a.dy*1000,lock:target,life:12,level:1,enemy,owner:u,friendlyAI:!enemy,guided:true,damageOverride:w.damage,radiusOverride:w.splash,speedLimit:w.speed,turnRate:3.6});}battleAudio.play('missile',{x:u.x,y:u.y});return w.interval;}
 const index=bullets.length,wait=expansionEmit(u,kind,a,enemy,level);if(wait!==false&&enemy)for(let i=index;i<bullets.length;i++)bullets[i].damage=(bullets[i].damage-bonus)*ENEMY_DAMAGE_FACTOR+bonus;return wait;};
const expansionBlast=missileBlastProfile;
missileBlastProfile=function(m){const r=expansionBlast(m),bonus=m.enemy?(m.owner?.attackBonus||0):0,damage=m.damageOverride??(r.damage-bonus);return{radius:m.radiusOverride?(m.radiusOverride*(m.intercepted?.12:1)):r.radius,damage:damage*(m.enemy?ENEMY_DAMAGE_FACTOR:1)+bonus}};
const expansionFire=fire;
fire=function(){const u=player();if(u.author)return authorFire(false);if(u.variant){if(shotCd>0||u.dead)return false;const wait=emitVehicleWeapon(u,u.variant,aim(),false,weaponLevel(u,u.variant,false));if(wait===false)return false;shotCd=wait;return true}return expansionFire()};
function authorFire(instant=false){const u=player();if(!u.author||u.dead||mode!=='play'||paused||(instant?authorAltCd>0:shotCd>0))return false;const a=aim();bullets.push({x:a.x,y:a.y,vx:a.dx*(instant?1400:1200),vy:a.dy*(instant?1400:1200),life:5,enemy:false,owner:u,damage:instant?Infinity:50,instantKill:instant,weapon:instant?'authorKill':'authorSmall'});if(instant)authorAltCd=.2;else shotCd=.1;return true}
const expansionHurt=hurt;hurt=function(d){if(player().author)return;return expansionHurt(d*shieldReduction(player(),false)*(MECHANICS[player().variant]?.ability==='armor'?.8:1))};
const expansionFriendlyDamage=damageFriendly;damageFriendly=function(v,d){if(v.author)return;return expansionFriendlyDamage(v,d*(v===player()?1:shieldReduction(v,false))*(v===player()?1:MECHANICS[v.variant]?.ability==='armor'?.8:1))};
const expansionEnemyDamage=damageEnemy;damageEnemy=function(v,d){if(v.allied)return expansionEnemyDamage(v,d);return expansionEnemyDamage(v,d*(v.allied?1:shieldReduction(v,true))*(MECHANICS[v.variant]?.ability==='armor'?.8:1))};
const expansionMovement=tankMovement;
tankMovement=function(u,ax,dt,level){const s=MECHANICS[u.variant];if(!s)return expansionMovement(u,ax,dt,level);const factor=s.speed/(u.factory?28:u.allied?[0,65,78,92][save.tracks]:65);return expansionMovement(u,ax,dt*factor,level)};
const expansionDrone=stepDrone;stepDrone=function(u,ax,ay,dt){const s=MECHANICS[u.variant];if(!s)return expansionDrone(u,ax,ay,dt);const oldX=u.x,oldY=u.y;expansionDrone(u,ax,ay,dt);const factor=s.speed/440;u.x=clamp(oldX+(u.x-oldX)*factor,80,WORLD-80);u.y=clamp(oldY+(u.y-oldY)*Math.min(1.3,factor),55,groundAt(u.x)-(u.role==='suicide'?16:22));};
const expansionFlight=stepFlight;stepFlight=function(u,ax,ay,dt,enemy){const x=u.x;expansionFlight(u,ax,ay,dt,enemy);const s=MECHANICS[u.variant];if(s&&!u.grounded){u.x=clamp(x+(u.x-x)*s.speed/(u.fighter?450:310),120,WORLD-150);}};
const expansionUpdate=update;
update=function(dt){withBaseVehicle(()=>expansionUpdate(dt));if(player().author){player().energy=100;player().hp=player().max=Infinity;authorAltCd=Math.max(0,authorAltCd-dt);if(authorAltHeld)authorFire(true);}updateMechanicalAbilities(dt);updateHud()};
function allLiveMechanics(){return[...friendlyTargets(),...enemies()]}
function shieldReduction(unit,enemy){return allLiveMechanics().some(s=>s!==unit&&!s.dead&&!!s.allied===!enemy&&MECHANICS[s.variant]?.ability==='shield'&&(s.passiveAge||0)%20<8&&Math.hypot(s.x-unit.x,s.y-unit.y)<180)?.5:1}
function updateMechanicalAbilities(dt){for(const u of allLiveMechanics()){u.passiveAge=(u.passiveAge||0)+dt;const s=MECHANICS[u.variant],enemy=!u.allied&&u!==player();if(s?.ability==='heal'||s?.ability==='energy'){const targets=enemy?enemies():friendlyTargets().concat(operation.active?operation.objects.filter(o=>o.allied&&!o.dead):[]);for(const a of targets)if(Math.hypot(a.x-u.x,a.y-u.y)<190){if(s.ability==='heal')a.hp=Math.min(a.max,a.hp+10*dt);else if(Number.isFinite(a.energy))a.energy=Math.min(100,a.energy+5*dt);}}
 if((s?.ability==='command'||u.factory&&u!==player())&&(u.nextDispatch??0)<=u.passiveAge&&u.energy>=5){const children=(enemy?enemies():alliedUnits).filter(v=>v.commanderId===u.mechanicId&&!v.dead);if(children.length<2&&(enemy?enemies().length<5:alliedUnits.filter(a=>a.role==='combat').length<FLEET_LIMITS.combat)){let child;if(enemy){const x=clamp(u.x-120,200,WORLD-200);child=newDrone(x,true);enemyDrones.push(child);child.attackBonus=u.attackBonus||0;child.armor=u.armor||0;}else{child=createAllied('drone');child.x=clamp(u.x+120,120,WORLD-150);child.y=groundAt(child.x)-140;}child.commanderId=u.mechanicId;u.energy-=5;}u.nextDispatch=u.passiveAge+18;}
 }}
let mechanicSerial=0;const identifyMechanic=applyMechanic;applyMechanic=function(u,key,enemy){const v=identifyMechanic(u,key,enemy);v.mechanicId=++mechanicSerial;return v};
// Keep legacy movement and abilities while each new chassis retains its own weapon and identity.
const expansionTurret=turretAim;
turretAim=function(u,x,y){const s=MECHANICS[u.variant];if(!s||['heli','fighter','drone'].includes(s.base))return expansionTurret(u,x,y);const lift=s.family==='artillery'?40:s.family==='rocket'||s.family==='aa'?37:s.family==='armor'?29:23,length=s.family==='artillery'?87:s.family==='armor'?101:s.family==='rocket'||s.family==='aa'?70:61,pivot={x:u.x,y:u.y-lift},a=Math.atan2(y-pivot.y,x-pivot.x);return{x:pivot.x+Math.cos(a)*length,y:pivot.y+Math.sin(a)*length,a,dx:Math.cos(a),dy:Math.sin(a),pivot}};
const expansionBody=bodyBox;
bodyBox=function(u){if(u.author)return{rx:13,ry:13,mass:2,air:true};const s=MECHANICS[u.variant];if(s&&!['heli','fighter','drone'].includes(s.base))return{rx:s.family==='scout'?48:60,ry:s.family==='artillery'?48:35,mass:6+s.tier*2,air:false};return expansionBody(u)};
const expansionReduction=damageReduction;damageReduction=function(){return withBaseVehicle(()=>expansionReduction())};
const expansionAction=action;action=function(a){return withBaseVehicle(()=>expansionAction(a))};
const expansionProduction=openProductionMenu;openProductionMenu=function(){return withBaseVehicle(()=>expansionProduction())};
const expansionResolveProduction=resolveProduction;resolveProduction=function(){return withBaseVehicle(()=>expansionResolveProduction())};
const expansionHud=updateHud;
updateHud=function(){withBaseVehicle(()=>expansionHud());const u=player(),key=u.variant||selectedVehicle,s=MECHANICS[key];if(s){$('unitName').textContent=VEHICLE_CARDS[key].code+' '+s.name;$('hint').textContent=`${s.name} · ${s.abilityText} · 基础伤害 ${s.damage}${s.count>1?'×'+s.count:''} · ${s.interval}秒 / ${s.energy}能量`;}
 if(u.author){$('unitName').textContent='作者专属';$('flightState').textContent='自由飞行';$('hpText').textContent='∞ / ∞';$('hpBar').style.width='100%';$('energyText').textContent='不消耗能量';$('energyBar').style.width='100%';$('hint').textContent='WASD 自由飞行 · 左键50伤害 · 右键秒杀 · 手机点击“秒杀”';}
 const alt=$('authorAltFire');if(alt)alt.hidden=!u.author||mode!=='play'||paused;};
const expansionSystemsArt=drawSystems;
drawSystems=function(){withBaseVehicle(()=>expansionSystemsArt());const u=player(),s=MECHANICS[u.variant];if(s?.base==='heli')drawHeli(u.x,u.y,1,u.angle,u.gear,u.flip,false,u);for(const v of allLiveMechanics()){const a=MECHANICS[v.variant]?.ability;if(!['heal','energy','shield'].includes(a))continue;ctx.save();ctx.globalAlpha=a==='shield'?(v.passiveAge%20<8?.16:.04):.1;const color=a==='heal'?'#79e4a4':a==='energy'?'#7ecdea':'#ceadff';circle(v.x,v.y,a==='shield'?180:190,color);ctx.globalAlpha=.5;circle(v.x,v.y,a==='shield'?180:190,null,color);ctx.restore();}};
function drawAuthorCube(u,scale=1){ctx.save();ctx.translate(u.x,u.y);ctx.scale(scale,scale);ctx.shadowColor='#60ff99';ctx.shadowBlur=14;rect(-12,-12,24,24,'#61f494');ctx.shadowBlur=0;ctx.strokeStyle='#e4ffdb';ctx.lineWidth=1.5;ctx.strokeRect(-12,-12,24,24);ctx.restore()}
function drawExpandedGround(u,s){const enemy=!u.allied&&u!==player(),color=enemy?'#78524b':['#657e72','#64788b','#8b805f','#526e78','#786c86'][s.tier-1],accent=enemy?'#f47469':'#e7ce70',wheeled=['scout','ifv'].includes(s.family)||s.ability==='heal'||s.ability==='energy';
 ctx.save();ctx.translate(u.x,u.y);ctx.rotate(u.angle||0);ctx.scale(u.turn??u.dir??1,1);
 if(wheeled){for(const x of (s.family==='scout'?[-35,32]:[-42,-12,18,44])){circle(x,10,13,'#12232b','#96a59b');circle(x,10,7,color);ctx.save();ctx.translate(x,10);ctx.rotate((u.tread||0)/12);line(-6,0,6,0,'#c4c9ad',2);ctx.restore()}}else{ctx.beginPath();ctx.roundRect(-58,-2,116,25,11);ctx.fillStyle='#14242a';ctx.fill();for(let x=-42;x<=42;x+=17)circle(x,10,8,color,'#a1ac94');for(let i=0;i<28;i++){let p=((i/28-(u.tread||0)/230)%1+1)%1,x,y;if(p<.42){x=43-p/.42*86;y=0}else if(p<.5){const a=-Math.PI/2-(p-.42)/.08*Math.PI;x=-43+10*Math.cos(a);y=10+10*Math.sin(a)}else if(p<.92){x=-43+(p-.5)/.42*86;y=20}else{const a=Math.PI/2-(p-.92)/.08*Math.PI;x=43+10*Math.cos(a);y=10+10*Math.sin(a)}rect(x-3,y-2,6,4,'#a7b29a')}}
 const height=s.family==='scout'?28:s.family==='ifv'?32:25;poly([[-59,0],[-53,-height],[-26,-height-9],[28,-height-7],[59,-13],[59,0]],color,'#152a31',2);poly([[-42,-height+2],[-24,-height-5],[4,-height-4],[16,-height+7],[-40,-height+7]],'#254854','#9aafa4');
 for(let i=0;i<s.tier;i++)rect(-45+i*12,-13,7,8,accent);rect(47,-13,9,5,accent);
 if(s.family==='armor'){for(let i=0;i<4;i++)rect(-43+i*24,-23,17,11,'#293c36');poly([[-35,-24],[-24,-42],[25,-43],[44,-27]],color,'#1b3033',2);}
 if(s.family==='artillery'){rect(-34,-59,61,34,color);rect(-24,-56,16,13,'#b1bca2');line(-31,-60,-31,-88,'#b8cdb7',2);}
 if(s.family==='rocket'||s.family==='aa'){rect(-20,-43,50,19,'#2a4248');if(s.family==='aa'){line(-39,-30,-39,-68,'#bacbb1',2);ctx.save();ctx.translate(-39,-68);ctx.rotate(Math.sin(time)*.3);ctx.beginPath();ctx.arc(0,0,18,0,Math.PI);ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.stroke();ctx.restore();}}
 if(s.family==='support'){rect(-33,-53,61,29,color);const symbol={heal:'✚',energy:'ϟ',shield:'◇',command:'▦',build:'⚒'}[s.ability];ctx.fillStyle=s.ability==='heal'?'#b2edc2':accent;ctx.font='bold 24px sans-serif';ctx.fillText(symbol||'+',-17,-31);if(s.ability==='command'){line(35,-30,35,-71,'#b8cdb7',2);line(20,-67,50,-67,accent,3);}}
 ctx.restore();
 const a=u.aimAngle||0,pivot=turretAim(u,u.x+Math.cos(a)*10000,u.y-30+Math.sin(a)*10000).pivot;
 ctx.save();ctx.translate(pivot.x,pivot.y);
 if(s.family==='rocket'||s.ability==='guided'){const facing=Math.cos(a)<0?-1:1;ctx.scale(facing,1);ctx.rotate(Math.atan2(Math.sin(a),Math.abs(Math.cos(a))));rect(-18,-18,75,34,color);for(let i=0;i<Math.min(6,s.count+1);i++){rect(-12+i*10,-13,7,24,'#20393b');circle(-8+i*10,-4,2.5,accent)}rect(57,-20,10,38,'#1c3436');}else{ctx.rotate(a);const barrel=s.family==='artillery'?87:s.family==='armor'?101:61;rect(4,-4-(s.tier>3?1:0),barrel-10,8+(s.tier>3?2:0),color);rect(barrel-9,-6,9,12,'#1b3036');line(9,-3,barrel-11,-3,'#b2baa1',2);circle(0,0,9,color,'#a1b09b');if(s.count>1&&!s.gravity){line(10,7,barrel-8,7,color,4);}}
 ctx.restore();if(u.kind==='engineer'||s.ability==='build')drawAlliedPlow(u);if(u.hp<u.max){rect(u.x-31,u.y-76,62,3,'#203137');rect(u.x-31,u.y-76,62*u.hp/u.max,3,enemy?'#e9756b':'#a1d7b8');}}
const expansionTankArt=drawTank;drawTank=function(u){const s=MECHANICS[u.variant];return s?drawExpandedGround(u,s):expansionTankArt(u)};
const expansionFactoryArt=drawFactory;drawFactory=function(u,scale=1){const s=MECHANICS[u.variant];if(!s)return expansionFactoryArt(u,scale);ctx.save();ctx.translate(u.x,u.y);ctx.scale(scale,scale);ctx.translate(-u.x,-u.y);drawExpandedGround(u,s);ctx.restore()};
const expansionArmoredArt=drawArmoredCar;drawArmoredCar=function(u){const s=MECHANICS[u.variant];return s?drawExpandedGround(u,s):expansionArmoredArt(u)};
const expansionProjectileArt=drawWeaponProjectile;drawWeaponProjectile=function(b){if(!b.instantKill&&b.weapon!=='authorSmall')return expansionProjectileArt(b);ctx.save();ctx.shadowColor='#78ffb0';ctx.shadowBlur=b.instantKill?18:5;circle(b.x,b.y,b.instantKill?8:2.5,b.instantKill?'#e3fff0':'#66f2a4');if(b.instantKill){circle(b.x,b.y,12,null,'#60efaa');line(b.x-b.vx*.02,b.y-b.vy*.02,b.x,b.y,'#78ffb0',3);}ctx.restore()};
// Two separate pointer actions, including touch controls for the author's alternate shot.
canvas.addEventListener('pointerdown',e=>{if(!player().author||mode!=='play'||paused)return;pointer.x=e.clientX;pointer.y=e.clientY;if(e.button===2){e.preventDefault();e.stopImmediatePropagation();authorAltHeld=true;canvas.setPointerCapture?.(e.pointerId);authorFire(true)}else if(e.button===0)authorFire(false);},true);
canvas.addEventListener('pointerup',()=>authorAltHeld=false,true);canvas.addEventListener('pointercancel',()=>authorAltHeld=false,true);
addEventListener('blur',()=>authorAltHeld=false);
const expansionHome=home;home=function(){authorAltHeld=false;const alt=$('authorAltFire');if(alt)alt.hidden=true;expansionHome()};

const expansionPlayerAim=aim;aim=function(){return withBaseVehicle(()=>expansionPlayerAim())};
// A bounded, searchable roster keeps sixty animated choices usable on phones.
let mechanicPicker={purpose:'select',category:'all',query:'',page:0};
function mechanicPickerKinds(){const {purpose,category,query}=mechanicPicker,q=query.trim().toLowerCase();return Object.keys(VEHICLE_CARDS).filter(k=>!(purpose!=='select'&&k===AUTHOR_KIND)&&!(purpose==='produce'&&k==='factory')&&(category==='all'||category==='base'&&!MECHANICS[k]&&k!==AUTHOR_KIND||category===AUTHOR_KIND&&k===AUTHOR_KIND||MECHANICS[k]?.family===category)&&(!q||(VEHICLE_CARDS[k].title+' '+VEHICLE_CARDS[k].code).toLowerCase().includes(q)))}
function openMechanicPicker(purpose='select'){
 mechanicPicker={purpose,category:'all',query:'',page:0};choiceVehicle=purpose==='select'?selectedVehicle:'heli';
 const titles={select:'选择你的作战载具',produce:'选择生产的机械',guide:'敌方机械与弹药',market:'载具商店'};
 openModal(`<div class="eyebrow">MECHANICAL ROSTER / ${purpose==='guide'?'敌情识别':'机械整备'}</div><h2 class="selection-title">${titles[purpose]}</h2><div class="roster-topline"><span>新增 50 种 + 变形花苞 · 常规 ${Object.keys(VEHICLE_CARDS).length-1} 种${purpose==='guide'?' · 基础敌弹伤害降至40%':''}</span>${purpose==='select'?`<button class="author-unlock" id="authorUnlock">${authorUnlocked?'▣ 作者专属已解锁':'▣ 解锁作者专属'}</button>`:''}</div>${typeof economyPickerHeader==='function'?economyPickerHeader(purpose):''}<div class="selection-preview"><span id="previewCode"></span><canvas id="vehiclePreview" width="1000" height="340" aria-label="载具动态预览"></canvas></div><div class="bloom-preview-controls" id="bloomPreviewControls" hidden><button class="secondary" data-bloom-preview="0">圆球形态</button><button class="secondary" data-bloom-preview="1">爬行形态</button><button class="secondary" data-bloom-preview="2">导弹形态</button></div><button id="bloomPreviewAttack" class="secondary bloom-attack-preview" hidden>演示抬腿抓击 ↗</button><div class="roster-filters"><input id="mechanicSearch" type="search" placeholder="搜索名称或编号" aria-label="搜索机械"><select id="mechanicCategory" aria-label="机械分类"><option value="all">全部机械</option><option value="base">原有载具</option>${Object.entries(MECHANIC_FAMILIES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}${purpose==='select'?'<option value="author">作者专属</option>':''}</select></div><div id="mechanicGrid" class="vehicle-choices"></div><div class="roster-pagination"><button class="secondary" id="rosterPrev">← 上一页</button><span id="rosterCount" aria-live="polite"></span><button class="secondary" id="rosterNext">下一页 →</button></div><p class="vehicle-detail" id="vehicleDetail"></p>${purpose==='select'?'<button class="primary select-deploy" id="deployVehicle">确认载具 · 开始行动 ↗</button>':purpose==='market'||purpose==='produce'?'<button class="primary select-deploy" id="buyVehicle">购买并解锁</button>':''}<button class="secondary vehicle-back" id="${purpose==='produce'?'productionBack':'rosterBack'}">${purpose==='produce'?'返回生产类型':'返回任务选择'}</button>`);
 $('mechanicSearch').oninput=e=>{mechanicPicker.query=e.target.value;mechanicPicker.page=0;paintMechanicGrid()};$('mechanicCategory').onchange=e=>{mechanicPicker.category=e.target.value;mechanicPicker.page=0;paintMechanicGrid()};
 $('rosterPrev').onclick=()=>{mechanicPicker.page--;paintMechanicGrid()};$('rosterNext').onclick=()=>{mechanicPicker.page++;paintMechanicGrid()};
 if(purpose==='select'){$('deployVehicle').onclick=()=>choiceVehicle===AUTHOR_KIND&&!authorUnlocked?openAuthorUnlock():start(choiceVehicle);$('authorUnlock').onclick=()=>authorUnlocked?chooseAuthor():openAuthorUnlock();}
 $(purpose==='produce'?'productionBack':'rosterBack').onclick=purpose==='produce'?openProductionMenu:()=>openMissionBrief(selectedMission||1);
 paintMechanicGrid();
}
function paintMechanicGrid(){const list=mechanicPickerKinds(),pages=Math.max(1,Math.ceil(list.length/12));mechanicPicker.page=clamp(mechanicPicker.page,0,pages-1);const shown=list.slice(mechanicPicker.page*12,mechanicPicker.page*12+12),attribute=mechanicPicker.purpose==='produce'?'make':'vehicle';
 $('mechanicGrid').innerHTML=shown.map(k=>`<button class="vehicle-choice" data-${attribute}="${k}"><b>${VEHICLE_CARDS[k].title}${k===AUTHOR_KIND&&!authorUnlocked?' · 锁定':''}</b><small>${VEHICLE_CARDS[k].desc}${MECHANICS[k]?' · 战力 '+MECHANICS[k].power:''}</small></button>`).join('')||'<p class="roster-empty">没有找到机械，请更换关键词。</p>';
 document.querySelectorAll(`[data-${attribute}]`).forEach(b=>b.onclick=()=>{const k=b.dataset[attribute];if(k===AUTHOR_KIND&&!authorUnlocked){openAuthorUnlock();return}choiceVehicle=k;refreshMechanicChoice();if(mechanicPicker.purpose==='produce')openProductionDial('combat',k)});
 $('rosterCount').textContent=`${list.length} 种 · ${mechanicPicker.page+1} / ${pages} 页`;$('rosterPrev').disabled=mechanicPicker.page===0;$('rosterNext').disabled=mechanicPicker.page>=pages-1;refreshMechanicChoice();
}
function refreshMechanicChoice(){const v=VEHICLE_CARDS[choiceVehicle]||VEHICLE_CARDS.heli;document.querySelectorAll('[data-vehicle],[data-make]').forEach(b=>{const active=(b.dataset.vehicle||b.dataset.make)===choiceVehicle;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});$('previewCode').textContent=v.code+' / '+v.title+ (mechanicPicker.purpose==='guide'?' / ENEMY':'');$('vehicleDetail').textContent=v.detail+(mechanicPicker.purpose==='guide'?' 敌军使用同类弹体，基础伤害为标注数值的40%；越强刷新越少。':'');}
openVehicleSelection=function(){openMechanicPicker('select')};openMechanicalMenu=function(){openMechanicPicker('produce')};openEnemyGuide=function(){openMechanicPicker('guide')};
function openAuthorUnlock(){openModal('<div class="eyebrow">AUTHOR ACCESS / 作者专属</div><h2>解锁绿色方块</h2><p>无限耐久 · 自由飞行 · 不耗能<br>左键 50 伤害，右键秒杀。</p><form id="authorForm" class="author-form"><label for="authorPassword">请输入四位字母密码</label><input id="authorPassword" type="password" maxlength="4" autocomplete="off" aria-label="作者密码"><p id="authorError" role="alert"></p><button class="primary" type="submit">解锁作者专属</button></form><button class="secondary vehicle-back" id="unlockBack">返回载具选择</button>');$('authorForm').onsubmit=e=>{e.preventDefault();if(!unlockAuthor($('authorPassword').value)){$('authorError').textContent='密码不正确，请重试';return}openVehicleSelection();chooseAuthor();toast('作者专属已解锁')};$('unlockBack').onclick=openVehicleSelection;$('authorPassword').focus?.();}
const expansionPreview=renderSelectionPreview;
renderSelectionPreview=function(){if($('modal').hidden)return;const s=MECHANICS[choiceVehicle],author=choiceVehicle===AUTHOR_KIND,c=$('vehiclePreview');if(!c||!s&&!author)return expansionPreview();const main=ctx;try{ctx=c.getContext('2d');ctx.save();ctx.clearRect(0,0,c.width,c.height);rect(0,284,1000,2,'#718d8555');for(let i=0;i<17;i++)rect((i*80-time*28)%1100,300,30,3,'#c7b96a30');const enemy=mechanicPicker.purpose==='guide',u={...heli,x:500,y:220,variant:s?.key,author,kind:s?.base||'drone',enemy,allied:!enemy,angle:0,turn:1,dir:1,flip:1,tread:time*65,hp:s?.hp||Infinity,max:s?.hp||Infinity,aimAngle:Math.sin(time*.8)*.1-.06,gear:1,gearTarget:1,level:1,rotor:time*65,vx:200,grounded:false};if(author)drawAuthorCube({...u,y:175+Math.sin(time*2)*4},4);else if(s.base==='heli')drawHeli(540,205+Math.sin(time*2)*3,1.65,-.03,1,1,true,u);else if(s.base==='fighter')drawFighter({...u,y:210},1.7,true);else if(s.base==='drone')drawDrone({...u,y:190},3.5,true);else{ctx.translate(500,210);ctx.scale(2.4,2.4);ctx.translate(-500,-210);drawExpandedGround(u,s)}}finally{ctx.restore();ctx=main}};
if(document.createElement){const alt=document.createElement('button');alt.id='authorAltFire';alt.textContent='秒杀';alt.hidden=true;alt.setAttribute('aria-label','发射秒杀弹');document.body.appendChild(alt);alt.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!player().author||paused)return;authorAltHeld=true;authorFire(true);alt.setPointerCapture?.(e.pointerId)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])alt.addEventListener(evt,()=>authorAltHeld=false);}
const expansionSnapshot=window.gameSnapshot;window.gameSnapshot=()=>({...expansionSnapshot(),vehicle:selectedVehicle,authorUnlocked,mechanicCount:Object.keys(MECHANICS).length});

const expansionAudioTick=battleAudio.tick;battleAudio.tick=function(state){return expansionAudioTick.call(battleAudio,{...state,vehicle:expandedBase(state.vehicle)})};
$('start').onclick=openOperations;

function chooseAuthor(){choiceVehicle=AUTHOR_KIND;mechanicPicker.category=AUTHOR_KIND;mechanicPicker.query='';mechanicPicker.page=0;$('mechanicCategory').value=AUTHOR_KIND;$('mechanicSearch').value='';paintMechanicGrid();}
function expandedCampaignRoster(pending,level,random=rand){return pending.map(u=>{if(u.marked||random()>.45)return u;const choices=Object.values(MECHANICS).filter(s=>s.base===expandedBase(u.type)&&s.tier<=Math.ceil(level/2));if(!choices.length)return u;let p=random()*choices.reduce((n,s)=>n+enemyWeight(s.key),0);const next=choices.find(s=>(p-=enemyWeight(s.key))<0)||choices.at(-1);return{...u,type:next.key}})}
