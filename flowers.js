const bouquet=document.getElementById('bouquet');
const flowerSpecs=[[-22,209,-27,.77,1.3],[20,211,28,.8,2.1],[-15,251,-15,.93,.7],[12,270,13,.94,1.6],[0,296,-2,1.06,0],[-8,171,-16,.75,3],[10,184,19,.79,3.7]];
function bloom(){
  bouquet.replaceChildren();
  const message=document.querySelector('.message');
  message.classList.remove('reveal');
  void message.offsetWidth;
  message.classList.add('reveal');
  flowerSpecs.forEach(([x,h,lean,size,delay],i)=>{
    const flower=document.createElement('div');flower.className='flower';
    flower.style.cssText=`--x:${x}px;--h:${h}px;--lean:${lean}deg;--size:${size};--delay:${delay}s;--sway:${3.8+i*.3}s`;
    const stem=document.createElement('div');stem.className='stem';
    for(const side of ['',' left']){const leaf=document.createElement('i');leaf.className='leaf'+side;stem.append(leaf);}
    const head=document.createElement('div');head.className='head';const bloom=document.createElement('div');bloom.className='bloom';
    for(let layer=0;layer<2;layer++)for(let j=0;j<10;j++){const p=document.createElement('i');p.className='petal'+(layer===0?' back':'');p.style.setProperty('--angle',`${j*36+(layer===0?18:0)}deg`);p.style.setProperty('--unfurl',`${j*.095+layer*.2}s`);bloom.append(p);}
    const center=document.createElement('i');center.className='center';bloom.append(center);head.append(bloom);flower.append(stem,head);bouquet.append(flower);
  });
}
bloom();
document.getElementById('replay').addEventListener('click',bloom);
const lights=document.getElementById('lights');
for(let i=0;i<24;i++){const light=document.createElement('i');light.className='light';light.style.cssText=`left:${8+Math.random()*84}%;top:${22+Math.random()*70}%;--duration:${4+Math.random()*5}s;--delay:${-Math.random()*9}s`;lights.append(light);}
const garden=document.querySelector('.garden');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const particles=[];
let heldPointer=null, pointerX=0, pointerY=0, frame=0, lastTime=0, lastEmission=0;
function emitSpark(){
  if(particles.length>=80)return;
  const node=document.createElement('i');node.className='spark live-spark';
  const angle=Math.random()*Math.PI*2, speed=35+Math.random()*85;
  lights.append(node);
  particles.push({node,x:pointerX,y:pointerY,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-35,age:0,life:1.1+Math.random()*.6});
}
function resetFlowers(){
  for(const flower of bouquet.children){flower.style.removeProperty('--pull');flower.querySelector('.head').style.removeProperty('filter');}
}
function animateInteraction(time){
  const dt=Math.min((time-lastTime)/1000||.016,.04);lastTime=time;
  if(heldPointer!==null&&!reducedMotion.matches&&time-lastEmission>=55){
    for(let i=0;i<3;i++)emitSpark();
    lastEmission=time;
  }
  const targets=[...bouquet.children].map(flower=>{
    const head=flower.querySelector('.head'),rect=head.getBoundingClientRect();
    return {flower,head,x:rect.x,y:rect.y,energy:0,pull:0};
  });
  if(heldPointer!==null){
    for(const target of targets){
      const distance=Math.hypot(pointerX-target.x,pointerY-target.y);
      if(distance<140){target.energy=1-distance/140;target.pull=Math.max(-9,Math.min(9,(pointerX-target.x)*.09))*target.energy;}
    }
  }
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.age+=dt;
    if(p.age>=p.life){p.node.remove();particles.splice(i,1);continue;}
    p.vy+=18*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    for(const target of targets){
      const dx=p.x-target.x,dy=p.y-target.y,distance=Math.hypot(dx,dy);
      if(distance<52){
        target.energy=Math.max(target.energy,(1-distance/65)*(1-p.age/p.life));
        if(!p.hit){p.hit=true;p.vx=dx/Math.max(distance,1)*65;p.vy=dy/Math.max(distance,1)*65-15;p.node.classList.add('kiss');}
      }
    }
    p.node.style.transform=`translate3d(${p.x}px,${p.y}px,0) rotate(${p.age*110}deg)`;
    p.node.style.opacity=String(Math.min(1,(p.life-p.age)*2));
  }
  for(const target of targets){
    target.flower.style.setProperty('--pull',`${reducedMotion.matches?0:target.pull}deg`);
    target.head.style.filter=`drop-shadow(0 0 ${15+target.energy*22}px rgba(255,216,85,${.22+target.energy*.65})) brightness(${1+target.energy*.3})`;
  }
  if(heldPointer!==null||particles.length)frame=requestAnimationFrame(animateInteraction);
  else{frame=0;lastTime=0;resetFlowers();}
}
function releasePointer(e){
  if(e&&e.pointerId!==undefined&&e.pointerId!==heldPointer)return;
  const id=heldPointer;heldPointer=null;
  if(id!==null&&garden.hasPointerCapture(id))garden.releasePointerCapture(id);
  if(reducedMotion.matches)resetFlowers();
}
function clearInteraction(){
  releasePointer();cancelAnimationFrame(frame);frame=0;lastTime=0;
  for(const p of particles)p.node.remove();particles.length=0;resetFlowers();
}
garden.addEventListener('pointerdown',e=>{
  if(heldPointer!==null||!e.isPrimary||e.button!==0)return;
  e.preventDefault();heldPointer=e.pointerId;pointerX=e.clientX;pointerY=e.clientY;
  garden.setPointerCapture(e.pointerId);
  if(!frame){lastTime=0;lastEmission=-Infinity;frame=requestAnimationFrame(animateInteraction);}
});
garden.addEventListener('pointermove',e=>{if(e.pointerId===heldPointer){pointerX=e.clientX;pointerY=e.clientY;}});
for(const event of ['pointerup','pointercancel','lostpointercapture'])garden.addEventListener(event,releasePointer);
garden.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('blur',clearInteraction);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInteraction();});
reducedMotion.addEventListener('change',clearInteraction);


const sky=document.getElementById('night-sky');
for(let i=0;i<110;i++){
  const star=document.createElement('i');
  star.className='star'+(i%6===0?' twinkle':'');
  const size=i%9===0?2.5:1+Math.random();
  star.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;--shine:${.25+Math.random()*.65};--time:${3+Math.random()*5}s;--start:${-Math.random()*8}s`;
  sky.append(star);
}
for(let i=0;i<3;i++){
  const meteor=document.createElement('i');meteor.className='meteor';
  meteor.style.cssText=`top:${10+i*18}%;left:${35+i*25}%;animation-delay:${2+i*5}s`;
  sky.append(meteor);
}
