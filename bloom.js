'use strict';
// Morphing ground robot: one body and resource pool, three articulated poses.
const BLOOM_FORMS=[
 {name:'圆球',speed:260,jump:260,energy:1,reduction:.35,foot:33,rx:33,ry:33,damage:0,interval:.75},
 {name:'爬行',speed:160,jump:660,energy:3,reduction:.5,foot:34,rx:50,ry:29,damage:180,interval:.75},
 {name:'导弹',speed:115,jump:480,energy:2,reduction:.6,foot:36,rx:46,ry:40,damage:120,interval:1}
];
// Keep the existing blueprint price during this model/contact correction.
const BLOOM_ECONOMY={speed:260,ability:'armor',valuationDamage:65};
ALLIED_HEALTH.bloom=1300;
VEHICLE_CARDS.bloom={title:'变形花苞',code:'MH-1300',desc:'三态变形 · 滚动 / 抬腿抓击 / 导弹',detail:'1300 耐久。G / 变形循环切换：圆球移速260、减伤65%，低跳且无法攻击；爬行移速160、减伤50%，抬腿抓击180伤害 / 0.75秒，高跳；导弹形态移速115、减伤40%，抬腿抓击120伤害 / 1秒，中跳，可发射导弹。W单次跳跃耗能1 / 3 / 2；变形耗能2；抓击耗能2。Q瞄准导弹，25能量 / 10秒，导弹可升级。能量每秒恢复1。'};
ENEMY_CLASSES.bloom={name:'变形花苞',ammo:'装甲腿抓击 / 制导导弹',note:'圆球接近、近身抬腿抓击、远程展开导弹瓣'};
function bloomForm(u){return BLOOM_FORMS[u.form||0]}
function initBloom(u,enemy=false){Object.assign(u,{morph:true,variant:'bloom',kind:'tank',unitKind:'bloom',allied:!enemy,enemy,form:0,bloomPose:0,formCooldown:0,legCooldown:0,legAttack:null,legSerial:0,missileCd:2,jumpHeld:false,grounded:true,vx:0,vy:0,roll:0,gait:0,hit:0,energy:100,hp:enemy?845:1300,max:enemy?845:1300});u.y=groundAt(u.x)-33;return u}
const bloomBase=expandedBase;expandedBase=function(k){return k==='bloom'?'tank':bloomBase(k)};
const bloomStart=start;start=function(kind='heli'){if(kind!=='bloom')return bloomStart(kind);const result=bloomStart('tank');if(result===false)return false;initBloom(player());selectedVehicle=choiceVehicle='bloom';armed=false;updateHud();return true};
const bloomCreate=createAllied;createAllied=function(kind,role='combat',slot=0){if(kind!=='bloom')return bloomCreate(kind,role,slot);return initBloom(bloomCreate('tank',role,slot))};
const bloomSpawn=spawnOperationEnemy;spawnOperationEnemy=function(spec){if(spec.type!=='bloom')return bloomSpawn(spec);const u=bloomSpawn({...spec,type:'tank'});initBloom(u,true);toast('敌方增援：变形花苞');return u};
function changeBloomForm(u,next=(u.form+1)%3,quiet=false){if(!u?.morph||u.dead||u.formCooldown>0||u.energy<2||next===u.form)return false;u.energy-=2;u.form=clamp(next,0,2);u.formCooldown=.65;u.legAttack=null;if(u===player()){armed=false;toast('变形花苞 · '+bloomForm(u).name+'形态');battleAudio.play('gear',{x:u.x,y:u.y})}settleBloomContact(u);return true}
function jumpBloom(u){if(!u?.morph||u.dead||!u.grounded)return false;const f=bloomForm(u);if(u.energy<f.energy)return false;u.energy-=f.energy;u.grounded=false;u.vy=-f.jump;return true}
function settleBloomContact(u){const floor=groundAt(u.x)-bloomForm(u).foot;if(u.grounded||u.y>floor){u.y=floor;if(u.vy>=0){u.vy=0;u.grounded=true}}}
function stepBloom(u,ax,dt){
 const f=bloomForm(u),oldX=u.x,oldFloor=groundAt(u.x)-f.foot;u.formCooldown=Math.max(0,u.formCooldown-dt);u.legCooldown=Math.max(0,(u.legCooldown||0)-dt);if(u===player()||!u.allied)u.missileCd=Math.max(0,(u.missileCd||0)-dt);u.hit=Math.max(0,(u.hit||0)-dt);u.bloomPose=mix(u.bloomPose,u.form,Math.min(1,dt*7));
 if(u===player()){const held=!!(keys.w||keys.ArrowUp||joy.y<-.55);if(held&&!u.jumpHeld)jumpBloom(u);u.jumpHeld=held;}
 const desired=clamp(ax,-1,1)*f.speed;u.vx=mix(u.vx,desired,Math.min(1,dt*(u.grounded?9:3)));if(Math.abs(u.vx)<.2)u.vx=0;u.x=clamp(u.x+u.vx*dt,80,WORLD-80);
 if(Math.abs(ax)>.1)u.dir=Math.sign(ax);u.turn=mix(u.turn||u.dir,u.dir,Math.min(1,dt*10));u.roll+=(u.x-oldX)/33;u.gait+=(u.x-oldX)/16;
 const floor=groundAt(u.x)-f.foot;if(u.grounded){if(floor-oldFloor>8){u.grounded=false;u.vy=0}else u.y=floor;}
 if(!u.grounded){u.vy+=900*dt;u.y+=u.vy*dt;if(u.y<55){u.y=55;u.vy=Math.max(0,u.vy)}if(u.y>=floor&&u.vy>=0){u.y=floor;u.vy=0;u.grounded=true;}}
 u.angle=mix(u.angle||0,u.grounded?Math.atan2(groundAt(u.x+24)-groundAt(u.x-24),48)*.35:clamp(u.vx*.00025,-.1,.1),Math.min(1,dt*7));u.blocked=false;advanceBloomLegAttack(u,dt);
}
function bloomTargets(u,enemy){return(enemy?friendlyTargets():enemies()).concat(operation.active?operation.objects.filter(o=>!o.dead&&o.kind!=='file'&&!!o.allied===enemy):[])}
function bloomNearest(u,enemy){return bloomTargets(u,enemy).sort((a,b)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y))[0]}
const BLOOM_ATTACK_DURATION=.64,BLOOM_STRIKE_START=.18,BLOOM_STRIKE_END=.39;
function bloomToLocal(u,dx,dy){const a=u.angle||0,c=Math.cos(a),s=Math.sin(a);return{x:(dx*c+dy*s)*(u.dir||1),y:-dx*s+dy*c}}
function bloomToWorld(u,p){const a=u.angle||0,c=Math.cos(a),s=Math.sin(a),x=p.x*(u.dir||1);return{x:u.x+x*c-p.y*s,y:u.y+x*s+p.y*c}}
function bloomLegAttack(u,a,enemy=false){
 const f=bloomForm(u);if(!u.morph||u.form===0||u.dead||u.legCooldown>0||u.legAttack||u.energy<2)return false;
 const local=bloomToLocal(u,Math.cos(a.a),Math.sin(a.a)),column=Math.abs(local.x)<.35?1:local.x<0?0:2;
 u.energy-=2;u.legCooldown=f.interval;u.legSerial=(u.legSerial||0)+1;
 const index=column+(u.legSerial%2?3:0),damage=f.damage*(enemy?ENEMY_DAMAGE_FACTOR:1)+(enemy?u.attackBonus||0:0);
 u.legAttack={elapsed:0,index,angle:a.a,damage,enemy,hits:new Set(),fortHits:new Set(),previousTip:null};
 // Start with a visible lift. Contact is resolved by the animated leg on later frames.
 battleAudio.play('gear',{x:u.x,y:u.y,volume:.22});return f.interval;
}
// Bend an existing leg without telescoping either segment into a long arm.
function solveBloomLeg(hip,goal,upper,lower,bend){
 const dx=goal.x-hip.x,dy=goal.y-hip.y,raw=Math.hypot(dx,dy)||1,d=clamp(raw,Math.abs(upper-lower)+.01,upper+lower-.01),ux=dx/raw,uy=dy/raw;
 const along=(upper*upper-lower*lower+d*d)/(2*d),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 return{foot:{x:hip.x+ux*d,y:hip.y+uy*d},knee:{x:hip.x+ux*along-uy*height*bend,y:hip.y+uy*along+ux*height*bend}};
}
function bloomLegRig(u,preview=false){
 const pose=clamp(u.bloomPose??u.form??0,0,2),open=clamp(pose,0,1),bloom=clamp(pose-1,0,1),phase=preview?time*5:u.gait||0,moving=preview||Math.abs(u.vx||0)>2;
 const legs=[];for(let index=0;index<6;index++){
  const back=index<3,i=index%3,offset=back?-5:0,hip={x:[-22,0,22][i]+offset,y:back?-10:-1};
  const wave=moving?Math.sin(phase+i*2.1+(back?Math.PI:0)):0;
  // Each white plate belongs to the knee-to-foot segment of this leg.
  const fold=1-open,knee={x:mix([-38,0,38][i]+offset,[-49,-2,49][i]+offset,bloom)*(1-fold*.35),y:mix([0,7,0][i],[-49,-62,-49][i],bloom)-Math.max(0,wave)*5};
  const foot={x:[-53,3,53][i]+offset+wave*7*open,y:mix(29,34+back*-5,open)-Math.max(0,wave)*7};
  knee.x=mix(hip.x*.75,knee.x,open);knee.y=mix(-19,knee.y,open);foot.x=mix(hip.x*1.1,foot.x,open);foot.y=mix(19,foot.y,open);
  const attack=u.legAttack,active=!!attack&&attack.index===index&&u.form!==0;
  let grip=0;if(active){
   const upper=Math.hypot(knee.x-hip.x,knee.y-hip.y),lower=Math.hypot(foot.x-knee.x,foot.y-knee.y),t=attack.elapsed,lift={x:hip.x+(i===0?-18:i===2?18:0),y:hip.y-32},target=bloomToLocal(u,Math.cos(attack.angle)*86,-8+Math.sin(attack.angle)*72),ease=v=>{v=clamp(v,0,1);return v*v*(3-2*v)};
   let f;if(t<BLOOM_STRIKE_START){f=ease(t/BLOOM_STRIKE_START);foot.x=mix(foot.x,lift.x,f);foot.y=mix(foot.y,lift.y,f);}
   else if(t<.31){f=ease((t-BLOOM_STRIKE_START)/.13);foot.x=mix(lift.x,target.x,f);foot.y=mix(lift.y,target.y,f);}
   else if(t<.4){foot.x=target.x;foot.y=target.y;grip=clamp((t-.31)/.06,0,1);}
   else{f=ease((t-.4)/(.64-.4));foot.x=mix(target.x,foot.x,f);foot.y=mix(target.y,foot.y,f);grip=1-f;}
   const solved=solveBloomLeg(hip,foot,upper,lower,foot.x<hip.x?1:-1);knee.x=solved.knee.x;knee.y=solved.knee.y;foot.x=solved.foot.x;foot.y=solved.foot.y;
  }
  const dx=foot.x-knee.x,dy=foot.y-knee.y,len=Math.hypot(dx,dy)||1,plate={x:mix(knee.x,foot.x,.52),y:mix(knee.y,foot.y,.52),angle:Math.atan2(dy,dx)-Math.PI/2,w:back?14:17,h:22+bloom*17};
  legs.push({index,back,hip,knee,foot,plate,active,grip});
 }return legs;
}
function advanceBloomLegAttack(u,dt){
 const attack=u.legAttack;if(!attack)return;if(u.dead||u.form===0){u.legAttack=null;return}
 const old=attack.elapsed;attack.elapsed=Math.min(BLOOM_ATTACK_DURATION,old+dt);
 // Sample large steps too: fast targets cannot be hit through a stale, invisible ray.
 const from=Math.max(old,BLOOM_STRIKE_START),to=Math.min(attack.elapsed,BLOOM_STRIKE_END);
 if(to>=from){const samples=Math.max(1,Math.ceil((to-from)/.016));let previous=null;const elapsed=attack.elapsed;
  for(let i=0;i<=samples;i++){attack.elapsed=mix(from,to,i/samples);const tip=bloomToWorld(u,bloomLegRig(u)[attack.index].foot);if(previous)bloomLegContact(u,attack,previous,tip);else bloomLegContact(u,attack,tip,tip);previous=tip;}
  attack.elapsed=elapsed;attack.previousTip=previous;
 }
 if(attack.elapsed>=BLOOM_ATTACK_DURATION)u.legAttack=null;
}
function bloomLegContact(u,attack,from,tip){
 for(const v of bloomTargets(u,attack.enemy)){if(v.dead||attack.hits.has(v))continue;const objective=(operation.objects||[]).includes(v),box=objective?{rx:62,ry:55}:bodyBox(v);if(!segmentHit(from.x,from.y,tip.x,tip.y,v.x-box.rx-10,v.y-box.ry-10,box.rx*2+20,box.ry*2+20))continue;
  attack.hits.add(v);if(objective)damageObjective(v,attack.damage);else if(attack.enemy)damageFriendly(v,attack.damage);else damageEnemy(v,attack.damage);
  if(!objective&&!v.dead){v.vx=(v.vx||0)+Math.cos(attack.angle)*45;v.x=clamp(v.x+Math.cos(attack.angle)*5,80,WORLD-80);}
  impactEffect(clamp(tip.x,v.x-box.rx,v.x+box.rx),clamp(tip.y,v.y-box.ry,v.y+box.ry),false);battleAudio.play('impact',{x:tip.x,y:tip.y,volume:.65});if(u===player())shake=Math.max(shake,3);
 }
 for(const fort of forts)if(!fort.dead&&!!fort.allied===attack.enemy&&!attack.fortHits.has(fort)&&segmentHit(from.x,from.y,tip.x,tip.y,fort.x,GROUND-fortHeight(fort),fort.rise+fort.top+fort.fall,fortHeight(fort))){attack.fortHits.add(fort);damageFort(fort,attack.damage);impactEffect(tip.x,tip.y,false);}
}
function bloomMissile(u,target,enemy=false){if(!u.morph||u.form!==2||u.dead||u.missileCd>0||u.energy<25)return false;const a=Math.atan2(target.y-(u.y-55),target.x-u.x),x=u.x+Math.cos(a)*28,y=u.y-55+Math.sin(a)*28;u.energy-=25;u.missileCd=10;missiles.push({x,y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,tx:target.x,ty:target.y,lock:target.dead===false?target:null,life:12,level:enemy?clamp(u.level||1,1,3):save.missile,enemy,owner:u,friendlyAI:!enemy&&u!==player(),guided:true});battleAudio.play('missile',{x:u.x,y:u.y});return true}
function bloomAIMove(u,dt){const enemy=!u.allied,target=enemy?combatTarget(u):fleetGoal(u),utility=target?.kind==='file'||target?.extraction;if(!target){stepBloom(u,Math.abs(player().x+100-u.x)>90?Math.sign(player().x+100-u.x):0,dt);return}const dx=target.x-u.x,dist=Math.hypot(dx,target.y-u.y);if(!utility){const form=dist<180?1:dist<850&&u.energy>=27?2:0;changeBloomForm(u,form,true);if(u.form===2)bloomMissile(u,target,enemy);}const direction=Math.abs(dx)>(utility?35:95)?Math.sign(dx):0;if(u.grounded&&((groundAt(u.x+direction*60)<groundAt(u.x)-25)||target.y<u.y-90)&&dist<600)jumpBloom(u);stepBloom(u,direction,dt);}
const bloomMovement=tankMovement;tankMovement=function(u,ax,dt,level){if(!u.morph)return bloomMovement(u,ax,dt,level);return u===player()?stepBloom(u,ax,dt):bloomAIMove(u,dt)};
const bloomProfile=weaponProfile;weaponProfile=function(kind,level=1){if(kind==='bloom')return{damage:180,interval:.75,speed:0,energy:2,count:1,splash:0,gravity:0,visual:'claw',life:0};return bloomProfile(kind,level)};
const bloomEmit=emitVehicleWeapon;emitVehicleWeapon=function(u,kind,a,enemy=false,level=1){return u.morph?bloomLegAttack(u,a,enemy):bloomEmit(u,kind,a,enemy,level)};
const bloomFire=fire;fire=function(){if(!player().morph)return bloomFire();if(shotCd>0||mode!=='play'||paused)return false;const wait=bloomLegAttack(player(),aim());if(wait===false)return false;shotCd=wait;return true};
const bloomAim=turretAim;turretAim=function(u,x,y){if(!u.morph)return bloomAim(u,x,y);const pivot={x:u.x,y:u.y-(u.form===2?55:12)},a=Math.atan2(y-pivot.y,x-pivot.x),length=u.form===2?28:35;return{x:pivot.x+Math.cos(a)*length,y:pivot.y+Math.sin(a)*length,a,dx:Math.cos(a),dy:Math.sin(a),pivot}};
const bloomLaunch=launchMissile;launchMissile=function(x,y){const u=player();if(!u.morph)return bloomLaunch(x,y);const target=screenToWorld(x,y);if(bloomMissile(u,target)){armed=false;missileCd=10;return true}return false};
const bloomBox=bodyBox;bodyBox=function(u){if(!u.morph)return bloomBox(u);const f=bloomForm(u);return{rx:f.rx,ry:f.ry,mass:u.form===0?10:8,air:!u.grounded}};
const bloomReduction=damageReduction;damageReduction=function(){return player()?.morph?bloomForm(player()).reduction:bloomReduction()};
const bloomFriendlyDamage=damageFriendly;damageFriendly=function(u,d){return bloomFriendlyDamage(u,d*(u?.morph&&u!==player()?bloomForm(u).reduction:1))};
const bloomEnemyDamage=damageEnemy;damageEnemy=function(u,d){return bloomEnemyDamage(u,d*(u?.morph&&!u.allied?bloomForm(u).reduction:1))};
const bloomAction=action;action=function(a){const u=player();if(u?.morph&&mode==='play'&&!paused&&!u.dead){if(a==='gear'||a==='transform'){changeBloomForm(u);updateHud();return}if(a==='land'||a==='jump'){jumpBloom(u);return}if(a==='missile'){if(u.form!==2){toast('切换到导弹形态才能发射导弹');return}if(u.missileCd>0||u.energy<25){toast(u.missileCd>0?'导弹冷却中 · '+Math.ceil(u.missileCd)+' 秒':'导弹需要25能量');return}armed=!armed;toast(armed?'导弹就绪 · 点击战场发射':'已取消导弹瞄准');return}}return bloomAction(a)};
const bloomHud=updateHud;updateHud=function(){bloomHud();const u=player();$('landingBtn').querySelector('kbd').textContent=u?.morph?'W':'L';$('touchFire').textContent=u?.morph?'抓击':'开火';$('touchFire').disabled=!!u?.morph&&u.form===0;if(!u?.morph)return;const f=bloomForm(u);$('unitName').textContent='MH-1300 / 变形花苞';$('flightState').textContent=f.name+'形态 · '+(u.grounded?'地面':'跳跃中');$('gearBtn').disabled=false;$('gearBtn').querySelector('span').textContent='变形';$('gearBtn').querySelector('small').textContent='下一形态：'+BLOOM_FORMS[(u.form+1)%3].name;$('landingBtn').disabled=false;$('landingBtn').querySelector('span').textContent='跳跃';$('landingBtn').querySelector('small').textContent=u.grounded?f.energy+' 能量':'空中';$('missileBtn').disabled=u.form!==2;$('missileBtn').querySelector('small').textContent=u.form!==2?'导弹形态解锁':armed?'点击发射':u.missileCd>0?Math.ceil(u.missileCd)+' 秒':'25 能量';$('hint').textContent=`A/D移动 · W跳跃 · G变形 · ${f.name}：减伤${Math.round((1-f.reduction)*100)}% · ${u.form===0?'无法攻击':u.form===1?'左键抬腿抓击180伤害 · 高跳':'左键抬腿抓击120伤害 · Q→点击发射导弹'}`;};

// A single articulated rig drives every limb, its attached white armor and hit tests.
function bloomPetal(x,y,w,h,tilt,light){
 ctx.save();ctx.translate(x,y);ctx.rotate(tilt);const g=ctx.createLinearGradient(-w,-h,w,h);g.addColorStop(0,'#fffefa');g.addColorStop(.38,light?'#e1dfea':'#c6c8dc');g.addColorStop(1,'#7c85a4');
 ctx.beginPath();ctx.moveTo(0,-h);ctx.bezierCurveTo(w*.75,-h*.8,w,h*.15,0,h);ctx.bezierCurveTo(-w,h*.15,-w*.75,-h*.8,0,-h);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#687392';ctx.lineWidth=1.3;ctx.stroke();
 ctx.beginPath();ctx.moveTo(-w*.16,-h*.72);ctx.quadraticCurveTo(-w*.55,0,-w*.08,h*.65);ctx.strokeStyle='#ffffffb0';ctx.lineWidth=1.1;ctx.stroke();ctx.restore();
}
function drawBloomLeg(leg,open,accent){
 const {hip,knee,foot,plate}=leg;ctx.save();ctx.globalAlpha=(leg.back?.64:1)*open;
 line(hip.x,hip.y,knee.x,knee.y,'#111c28',8);line(hip.x,hip.y,knee.x,knee.y,'#8998a9',2);
 line(knee.x,knee.y,foot.x,foot.y,'#101a27',7);line(knee.x,knee.y,foot.x,foot.y,'#a1acba',1.8);
 circle(hip.x,hip.y,4,'#8291a7','#172434');circle(knee.x,knee.y,4.3,'#c3c9d5','#23324a');
 // Plate and shin use the same joint transform, including while a leg attacks.
 bloomPetal(plate.x,plate.y,plate.w,plate.h,plate.angle,!leg.back);
 ctx.save();ctx.translate(foot.x,foot.y);ctx.rotate(plate.angle+(leg.active?leg.grip*.35:0));
 // Three short walking toes; no hand or pincer at the end of the leg.
 for(const x of [-5,0,5]){line(x,-1,x*1.3,5,'#b9c4d1',2);line(x*1.3,5,x*1.3+2,7,'#b9c4d1',1.5)}ctx.restore();ctx.restore();
}
function drawBloom(u,scale=1,preview=false){
 const pose=clamp(u.bloomPose??u.form??0,0,2),open=clamp(pose,0,1),bloom=clamp(pose-1,0,1),accent=u.enemy?'#ff9b8e':'#a3e4d6',legs=bloomLegRig(u,preview);
 ctx.save();ctx.translate(u.x,u.y);ctx.rotate(u.angle||0);ctx.scale(scale*(u.dir||1),scale);ctx.lineJoin='round';
 ctx.save();ctx.globalAlpha=.16;ctx.beginPath();ctx.ellipse(0,35,34+open*22,5,0,0,Math.PI*2);ctx.fillStyle='#07131d';ctx.fill();ctx.restore();
 if(open>.01){for(const leg of legs.filter(l=>l.back))drawBloomLeg(leg,open,accent);
  ctx.save();ctx.globalAlpha=open;const core=ctx.createLinearGradient(0,-23,0,20);core.addColorStop(0,'#4a5365');core.addColorStop(1,'#111c29');ctx.beginPath();ctx.ellipse(0,-4,35,24,0,0,Math.PI*2);ctx.fillStyle=core;ctx.fill();ctx.strokeStyle='#8d97b0';ctx.lineWidth=1.5;ctx.stroke();for(let i=-2;i<=2;i++)line(i*11,-18,i*13,13,'#798496',2);circle(0,-5,11,'#263346','#96a6b9');circle(0,-5,5,accent);
  if(bloom<.99){ctx.save();ctx.globalAlpha=1-bloom;const g=ctx.createLinearGradient(-22,-46,28,4);g.addColorStop(0,'#f2f0fb');g.addColorStop(.48,'#c6c9e0');g.addColorStop(1,'#7b86aa');ctx.beginPath();ctx.moveTo(-35,-3);ctx.bezierCurveTo(-37,-30,-21,-45,0,-45);ctx.bezierCurveTo(24,-43,38,-25,35,-3);ctx.quadraticCurveTo(0,7,-35,-3);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#8994af';ctx.stroke();for(const x of [-17,15]){ctx.beginPath();ctx.moveTo(x*.6,-42);ctx.quadraticCurveTo(x*1.6,-20,x*1.9,-1);ctx.strokeStyle='#ffffff80';ctx.stroke()}ctx.restore();}
  if(bloom>.01){ctx.save();ctx.globalAlpha=bloom;for(const x of [-13,13]){rect(x-4,-41,8,27,'#162435');rect(x-2,-40,4,19,'#bcc6d6');poly([[x-2,-40],[x,-48],[x+2,-40]],u.enemy?'#ff9a84':'#e2cf7e')}ctx.restore();}ctx.restore();
  for(const leg of legs.filter(l=>!l.back&&!l.active))drawBloomLeg(leg,open,accent);for(const leg of legs.filter(l=>l.active))if(!leg.back)drawBloomLeg(leg,open,accent);
  if(u.legAttack){const leg=legs[u.legAttack.index];if(leg.back)drawBloomLeg({...leg,back:false},open,accent);const t=u.legAttack.elapsed;if(t>=BLOOM_STRIKE_START&&t<=BLOOM_STRIKE_END){ctx.save();ctx.globalAlpha=.32;line(leg.knee.x,leg.knee.y,leg.foot.x,leg.foot.y,accent,2);ctx.restore();}}
 }
 if(open<.995){ctx.save();ctx.globalAlpha=1-open;ctx.rotate(u.roll||0);const g=ctx.createRadialGradient(-13,-18,2,0,0,34);g.addColorStop(0,'#fffdfb');g.addColorStop(.4,'#d8daeb');g.addColorStop(.8,'#a8afcd');g.addColorStop(1,'#737f9e');circle(0,0,33,g,'#7d88a3');
  for(let i=0;i<6;i++){ctx.save();ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.moveTo(0,-32);ctx.bezierCurveTo(14,-25,13,13,0,32);ctx.strokeStyle=i%2?'#f8f8ff99':'#8994b3';ctx.lineWidth=1.15;ctx.stroke();ctx.restore()}ctx.restore();
 }ctx.restore();
}
const bloomArt=drawTank;drawTank=function(u){return u.morph?drawBloom(u):bloomArt(u)};
const bloomPickerKinds=mechanicPickerKinds;mechanicPickerKinds=function(){const list=bloomPickerKinds(),index=list.indexOf('bloom');if(index>=0&&mechanicPicker.purpose!=='market'){list.splice(index,1);list.splice(Math.min(1,list.length),0,'bloom')}return list};
let bloomPreviewForm=0,bloomPreviewAttackStart=-1;
const bloomChoice=refreshMechanicChoice;refreshMechanicChoice=function(){bloomChoice();const controls=$('bloomPreviewControls');if(controls)controls.hidden=choiceVehicle!=='bloom';const demo=$('bloomPreviewAttack');if(demo){demo.hidden=choiceVehicle!=='bloom';demo.disabled=bloomPreviewForm===0;demo.onclick=()=>bloomPreviewAttackStart=time;}document.querySelectorAll('[data-bloom-preview]').forEach(b=>{b.classList.toggle('active',+b.dataset.bloomPreview===bloomPreviewForm);b.setAttribute('aria-pressed',String(+b.dataset.bloomPreview===bloomPreviewForm));b.onclick=()=>{bloomPreviewForm=+b.dataset.bloomPreview;bloomPreviewAttackStart=-1;refreshMechanicChoice()}})};
const bloomPreview=renderSelectionPreview;
renderSelectionPreview=function(){
 if($('modal').hidden||choiceVehicle!=='bloom')return bloomPreview();const c=$('vehiclePreview');if(!c)return;const main=ctx;
 try{ctx=c.getContext('2d');ctx.save();ctx.clearRect(0,0,c.width,c.height);rect(0,286,1000,2,'#718d8555');const f=bloomPreviewForm,t=bloomPreviewAttackStart<0?time%2.4:time-bloomPreviewAttackStart;
  const demo={x:500,y:205,form:f,bloomPose:f,dir:1,roll:time*1.7,gait:time*5,vx:55,enemy:mechanicPicker.purpose==='guide',legAttack:f!==0&&t<BLOOM_ATTACK_DURATION?{elapsed:t,index:5,angle:-.12}:null};
  drawBloom(demo,2.35,true);ctx.font='16px sans-serif';ctx.fillStyle='#d3d8df';ctx.textAlign='center';ctx.fillText(BLOOM_FORMS[f].name+'形态 · '+['闭合白色外壳 / 高速滚动 / 无法攻击','六足连动装甲片 / 抬腿抓击180 / 高跳','装甲片随腿展开 / 抓击120 / 制导导弹'][f],500,324);
 }finally{ctx.restore();ctx=main}
};
const bloomSnapshot=window.gameSnapshot;window.gameSnapshot=()=>({...bloomSnapshot(),bloom:player()?.morph?{form:player().form,name:bloomForm(player()).name,grounded:player().grounded,missileCd:player().missileCd}:null});
