const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const drawing=new Proxy({},{get:()=>()=>{}}),elements=new Map();
function el(id){if(!elements.has(id))elements.set(id,{style:{},classList:{toggle(){}},hidden:true,textContent:'',innerHTML:'',getContext:()=>drawing,querySelector:()=>({textContent:''}),addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})});return elements.get(id)}
const box={console,innerWidth:1440,innerHeight:900,devicePixelRatio:1,document:{getElementById:el,querySelectorAll:()=>[]},window:{},localStorage:{getItem:()=>null,setItem(){}},performance:{now:()=>0},addEventListener(){},requestAnimationFrame(){},setTimeout(){},Math};vm.createContext(box);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),box);const run=s=>vm.runInContext(s,box);let n=0;function test(name,fn){fn();console.log('PASS',name);n++}
test('新行动初始值与18辆坦克',()=>{run('start()');assert.equal(run('heli.energy'),100);assert.equal(run('tanks.length'),18)});
test('地面不能收轮',()=>{run("action('gear')");assert.equal(run('heli.gearTarget'),1);assert.equal(run('heli.energy'),100)});
test('滑跑助推起飞消耗30能量',()=>{run('heli.vx=100; keys.w=true; update(.01);keys={}') ;assert.equal(run('heli.grounded'),false);assert.ok(run('heli.energy')<=70.01)});
test('起落架渐变并消耗30能量',()=>{run("action('gear')");assert.equal(run('heli.gearTarget'),0);assert.ok(run('heli.gear')>.9);run('update(.1)');assert.ok(run('heli.gear')<1&&run('heli.gear')>0);assert.ok(run('heli.energy')<41)});
test('导弹扣25能量且冷却10秒',()=>{run('heli.energy=100;launchMissile(800,600)');assert.equal(run('heli.energy'),75);assert.equal(run('missileCd'),10);assert.equal(run('missiles.length'),1);run('launchMissile(800,600)');assert.equal(run('missiles.length'),1)});
test('机枪耗能与0.1秒间隔',()=>{run('heli.energy=100;shotCd=0;fire();fire()');assert.equal(run('heli.energy'),99);assert.equal(run('shotCd'),.1)});
test('安全着陆',()=>{run('start();heli.grounded=false;heli.y=GROUND-48;heli.vy=10;update(.016)');assert.equal(run('heli.grounded'),true);assert.equal(run('heli.hp'),100)});
test('收轮撞地坠机',()=>{run('start();heli.grounded=false;heli.gear=0;heli.gearTarget=0;heli.y=GROUND-29;heli.vy=130;update(.016)');assert.equal(run('heli.dead'),true)});
test('修补与60秒雷达',()=>{run("start();heli.hp=40;action('repair');action('radar')");assert.equal(run('heli.hp'),90);assert.equal(run('radarLeft'),60);assert.equal(run('save.repairs'),0)});
test('摧毁奖励与连续碰撞检测',()=>{let before=run('save.cash');run('damageTank(tanks[0],100)');assert.equal(run('kills'),1);assert.equal(run('save.cash'),before+150);assert.equal(run('segmentHit(0,0,100,0,40,-10,20,20)'),true)});
console.log(`${n} gameplay checks passed`);
