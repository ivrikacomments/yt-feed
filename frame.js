const params=new URLSearchParams(location.search);
const selected=Math.max(0,Math.min(SLIDES.length-1,Number(params.get('slide')||1)-1));
const s=SLIDES[selected];
const timing=params.has('timed')&&window.SCENE_DATA?.[selected];
const sceneDuration=timing?.duration||12;
document.querySelector('#slide').innerHTML=`<p class="eyebrow enter">${s.tag}</p>${selected===0?'':`<h1 class="heading ${s.title.length>29?'compact':''} enter">${s.title}</h1>${swash}`}<div class="content">${s.body}</div>`;
const root=document.querySelector('#root');
root.classList.toggle('timed',Boolean(timing));
root.classList.toggle('delay-answers',selected>=18);
root.dataset.duration=String(sceneDuration);
root.classList.toggle('has-speaker-title',selected===0||selected===SLIDES.length-1);
if(params.get('square')==='1'){document.documentElement.style.width='1080px';document.body.style.width='1080px';document.querySelector('.speaker-zone').style.display='none';document.querySelector('.learning-zone').style.left='0';root.dataset.width='1080';}
window.__timelines=window.__timelines||{};
window.ready=false;
document.fonts.ready.then(()=>{
 const tl=gsap.timeline({paused:true});
 const els=[...document.querySelectorAll('#slide .enter')];
 els.forEach((el,i)=>tl.fromTo(el,{opacity:0,y:10,scale:.99},{opacity:1,y:0,scale:1,duration:timing?.28:.45,ease:'power3.out'},.04+Math.min(i*(timing?.025:.11),timing?.15:.88)));
 document.querySelectorAll('.draw').forEach((p,i)=>{const len=p.getTotalLength();tl.fromTo(p,{strokeDasharray:len,strokeDashoffset:len},{strokeDashoffset:0,duration:.6,ease:'power2.out'},.6+i*.13);});
 if(!timing)document.querySelectorAll('.mark').forEach((el,i)=>{tl.fromTo(el,{scale:.7,opacity:0},{scale:1,opacity:1,duration:.4,ease:'power3.out'},1.7+i*.75);});
 const cues=[...document.querySelectorAll('.cue')];
 if(!timing)cues.forEach((el,i)=>{
   const at=1.8+i*(cues.length>6?.86:1.25);
   if(el.classList.contains('word')){
     const base=getComputedStyle(el).color;
     tl.fromTo(el,{color:base},{color:'#a8bd61',duration:.22,ease:'power2.out'},at);
     tl.to(el,{color:base,duration:.35,ease:'power2.out'},at+.8);
   }else{
     const base=getComputedStyle(el).backgroundColor;
     tl.fromTo(el,{backgroundColor:base},{backgroundColor:'#a8bd61',duration:.22,ease:'power2.out'},at);
     tl.to(el,{backgroundColor:base,duration:.35,ease:'power2.out'},at+.8);
   }
   const a=el.querySelector('.answer');
   if(a)tl.fromTo(a,{opacity:0,y:8},{opacity:1,y:0,duration:.25,ease:'power3.out'},at+.55);
 });
 if(timing){
   for(const e of timing.events){
     const nodes=[...document.querySelectorAll(e.selector)];
     if(!nodes.length)throw new Error(`Missing cue selector: ${e.selector}`);
     for(const el of nodes){
       const at=Math.max(0,e.start-.04),end=Math.min(sceneDuration-.04,e.end),d=.08;
       if(e.kind==='mark'){
         tl.fromTo(el,{opacity:0,scale:.95},{opacity:1,scale:1,duration:d,ease:'none'},at);
         tl.to(el,{opacity:0,duration:d,ease:'none'},end);
       }else{
         const prop=e.kind==='word'?'color':'backgroundColor',base=getComputedStyle(el)[prop];
         tl.fromTo(el,{[prop]:base},{[prop]:'#a8bd61',duration:d,ease:'none'},at);
         tl.to(el,{[prop]:base,duration:d,ease:'none'},end);
       }
       const answer=selected>=18&&el.querySelector('.answer');
       if(answer&&!answer.dataset.scheduled){answer.dataset.scheduled='1';tl.fromTo(answer,{opacity:0,y:6},{opacity:1,y:0,duration:.15,ease:'power2.out'},e.answer_at??e.end+.35);}
     }
   }
 }
 if(document.querySelector('.air'))tl.fromTo('.air',{opacity:.2,x:-6},{opacity:1,x:3,duration:.55,ease:'sine.inOut',yoyo:true,repeat:3},2);
 tl.to({hold:0},{hold:1,duration:.01},sceneDuration-.01);
 window.__timelines['reading-review']=tl;
 window.seek=(t)=>{tl.pause();tl.seek(Math.max(0,Math.min(sceneDuration,t)));};
 window.sceneTiming=timing;
 window.play=()=>tl.restart();window.pause=()=>tl.pause();
 window.ready=true;
 if(params.has('still'))window.seek(sceneDuration-.05);
 if(params.has('play'))window.play();
 parent.postMessage({type:'slide-ready',slide:selected+1},'*');
});
addEventListener('message',e=>{if(e.source!==parent)return;if(e.data.type==='play')window.play?.();if(e.data.type==='pause')window.pause?.();if(e.data.type==='seek')window.seek?.(e.data.time);});
