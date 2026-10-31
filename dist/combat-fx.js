'use strict';
// Explosion bodies are drawn separately from the capped, lightweight spark pool.
// This keeps the fireball visible even during dense combat with many projectiles.
let explosionBursts=[];
function spawnExplosionBurst(x,y,count,power){if(!Number.isFinite(x)||!Number.isFinite(y))return;const small=count<30,size=(14+power*24)*(small?.6:1),life=small?.65:1.25;const seed=Math.random()*6.28;explosionBursts.push({x,y,size,life,age:0,seed,ground:Math.abs(groundAt(x)-y)<95,smoke:Array.from({length:small?4:7},(_,i)=>({angle:seed+i*2.399,r:.4+Math.random()*.5,drift:(Math.random()-.5)*.8})),shards:Array.from({length:small?5:10},(_,i)=>({angle:seed+i*2.399,speed:(.8+Math.random())*size*2.1,length:3+Math.random()*5}))});if(explosionBursts.length>24)explosionBursts.splice(0,explosionBursts.length-24)}
const particleExplosion=effects;
effects=function(x,y,count=40,power=1){const first=particles.length;particleExplosion(x,y,count,power);if(count<18||power<.45)return;spawnExplosionBurst(x,y,count,power);for(let i=first;i<particles.length;i++){const p=particles[i];if(p.smoke){p.alpha=.27;p.size=Math.min(p.size,8+power*3);p.life=Math.min(p.life,1.1);p.max=p.life;p.block=i%2===0;}}if(count>=30&&count<40)battleAudio.play('explosion',{x,y,volume:.6})};
const particlesBeforeBursts=updateParticles;
updateParticles=function(dt){particlesBeforeBursts(dt);for(const b of explosionBursts)b.age+=dt;explosionBursts=explosionBursts.filter(b=>b.age<b.life)};
const startBeforeBursts=start;
start=function(...args){explosionBursts=[];return startBeforeBursts(...args)};
const homeBeforeBursts=home;
home=function(){explosionBursts=[];return homeBeforeBursts()};
function drawExplosionBursts(){ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';for(const b of explosionBursts){const screen=worldToScreen(b.x,b.y),extent=b.size*4*viewScale;if(screen.x+extent<0||screen.x-extent>W||screen.y+extent<0||screen.y-extent>H)continue;const t=b.age/b.life,size=b.size,fire=Math.max(0,1-t/.53),fade=1-t;
 // Low, broad grey smoke and angular dark pieces, with a slow upward drift.
 if(t>.04){const smokeAlpha=Math.min(1,t*9)*fade*.32;for(let i=0;i<b.smoke.length;i++){const p=b.smoke[i],spread=size*(.3+t*.7),x=b.x+Math.cos(p.angle)*spread*.75+p.drift*size*t,y=b.y-size*(.15+t*.7)+Math.sin(p.angle)*spread*.25,r=size*p.r*(.32+t*.26);ctx.save();ctx.globalAlpha=smokeAlpha;ctx.translate(x,y);ctx.scale(1.35,.8);if(i%3===0){ctx.rotate(p.angle*.1);poly([[-r,-r*.5],[-r*.2,-r],[r*.7,-r*.7],[r,r*.4],[r*.2,r],[-r*.8,r*.7]],'#384249');}else circle(0,0,r,i%2?'#69716f':'#92958b');ctx.restore();}}
 if(b.ground&&t<.7){ctx.save();ctx.globalAlpha=fade*.22;ctx.beginPath();ctx.ellipse(b.x,Math.min(groundAt(b.x)-2,b.y+25),size*(.6+t*2.2),size*(.09+t*.12),0,0,Math.PI*2);ctx.fillStyle='#b5a07c';ctx.fill();ctx.restore()}
 // A bright local flash, then a layered orange fireball instead of loose dots.
 if(fire>0){const core=size*(.22+Math.sin(Math.min(1,t/.3)*Math.PI*.62)*.72);ctx.save();ctx.globalCompositeOperation='lighter';const glow=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,size*1.75);glow.addColorStop(0,'#ffd77e99');glow.addColorStop(.45,'#f4772f44');glow.addColorStop(1,'#de3c0800');ctx.globalAlpha=fire;ctx.fillStyle=glow;ctx.fillRect(b.x-size*1.75,b.y-size*1.75,size*3.5,size*3.5);ctx.restore();
 ctx.save();ctx.globalAlpha=fire;for(let i=0;i<8;i++){const a=b.seed+i*Math.PI/4,r=core*(.45+.12*Math.sin(i*4)),x=b.x+Math.cos(a)*core*.62,y=b.y+Math.sin(a)*core*.53-size*t*.35;circle(x,y,r,i%2?'#ef6b22':'#b9461c');circle(x-r*.12,y-r*.14,r*.63,'#ffb33e');}circle(b.x,b.y-size*t*.25,core*.7,'#ffd66c');if(t<.15){ctx.globalAlpha=(1-t/.15)*.95;circle(b.x,b.y,core*(.6+t),'#fff5cf')}ctx.restore();}
 // The expanding pressure wave stays readable after the initial flash.
 if(t<.42){ctx.save();ctx.globalAlpha=Math.max(0,1-t/.42)*.8;ctx.strokeStyle='#ffe8ab';ctx.lineWidth=2.5*(1-t);ctx.beginPath();ctx.arc(b.x,b.y,size*(.25+t*4.2),0,Math.PI*2);ctx.stroke();ctx.restore()}
 ctx.save();for(let i=0;i<b.shards.length;i++){const p=b.shards[i],distance=p.speed*b.age/(1+b.age*2),x=b.x+Math.cos(p.angle)*distance,y=Math.min(groundAt(x)-3,b.y+Math.sin(p.angle)*distance+80*b.age*b.age),a=p.angle+b.age*4;ctx.globalAlpha=fade*(i%3===0?.75:1);if(i%3===0){ctx.save();ctx.translate(x,y);ctx.rotate(a);poly([[-p.length,-2],[p.length*.6,-3],[p.length,2],[-p.length*.5,3]],'#26363d','#85918b',.8);ctx.restore()}else{line(x-Math.cos(p.angle)*p.length*2,y-Math.sin(p.angle)*p.length*2,x,y,i%2?'#ffbb51':'#ffe6a5',1.6);circle(x,y,1.5*fade,'#fff0bc')}}ctx.restore();
 }ctx.restore()}
