/* Bílageirinn: visible HTML first, motion enhancement second. No tracking, no stored form data. */
(() => {
'use strict';
const copy=window.BilageirinnCopy;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(hover: hover) and (pointer: fine)');
let lenis=null, tick=null;
const G=window.gsap, ST=window.ScrollTrigger;
if(G&&ST){
 G.registerPlugin(ST);ST.config({ignoreMobileResize:true});
 const mm=G.matchMedia();
 mm.add('(prefers-reduced-motion: no-preference)',()=>{
  try{
   const hero=G.timeline({defaults:{ease:'expo.out'}});
   if(fine.matches)hero.fromTo('.brand',{opacity:.35,y:8},{opacity:1,y:0,duration:.45},0)
    .fromTo('.site-header nav,.header-actions',{opacity:.35},{opacity:1,duration:.5},.08);
   hero.fromTo('.hero h1 .line>span',{yPercent:105},{yPercent:0,duration:.85,stagger:.08},.08)
    .fromTo('.hero-top,.hero-bottom',{opacity:.3,y:12},{opacity:1,y:0,duration:.55},.35);
   if($('.hero-plate'))hero.fromTo('.hero-plate .plate-reveal',{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:.75},.26);
   if(fine.matches&&$('.hero-plate'))G.fromTo('.hero-plate .plate-inner',{scale:1.06},{scale:1,ease:'none',scrollTrigger:{trigger:'.hero-plate',start:'top bottom',end:'bottom top',scrub:true}});
   $$('[data-heading]').filter(h=>!h.closest('.hero')).forEach(h=>{
    let tween;
    tween=G.fromTo($$('.line>span',h),{yPercent:105},{yPercent:0,duration:1.2,stagger:.08,ease:'expo.out',paused:true});
    ST.create({trigger:h,start:'top 80%',onEnter:()=>tween.play(),onLeave:()=>tween.progress(1),onEnterBack:()=>tween.progress(1)});
   });
   $$('[data-plate]').filter(p=>!p.matches('.hero-plate,.register-frame')).forEach(plate=>{
    const layer=$('.plate-reveal',plate),inner=$('.plate-inner',plate);
    const reveal=G.fromTo(layer,{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:.9,ease:'expo.out',paused:true});
    ST.create({trigger:plate,start:'top 85%',onEnter:()=>reveal.play(),onLeave:()=>reveal.progress(1),onEnterBack:()=>reveal.progress(1)});
    if(fine.matches&&!plate.matches('.register-mobile')&&$('img',plate))G.fromTo(inner,{yPercent:-7.5},{yPercent:7.5,ease:'none',scrollTrigger:{trigger:plate,start:'top bottom',end:'bottom top',scrub:true}});
   });
   $$('.register-row').forEach(row=>{
    const content=$('.register-link',row);
    const tween=G.fromTo(content,{y:24,opacity:.3},{y:0,opacity:1,duration:1.2,ease:'expo.out',paused:true});
    ST.create({trigger:row,start:'top 80%',onEnter:()=>tween.play(),onLeave:()=>tween.progress(1),onEnterBack:()=>tween.progress(1)});
   });
   $$('[data-sequence]').forEach(group=>{
    const targets=group.classList.contains('operations')?$$('.operation-inner',group):[...group.children];
    const tween=G.fromTo(targets,{y:24,opacity:.3},{y:0,opacity:1,duration:.65,ease:'expo.out',stagger:.08,paused:true});
    ST.create({trigger:group,start:'top 85%',onEnter:()=>tween.play(),onLeave:()=>tween.progress(1),onEnterBack:()=>tween.progress(1)});
   });
  }catch(e){console.error('Motion enhancement reset',e);$$('.line>span,.plate-reveal,.plate-inner,.register-link,.operation-inner,.hero-top,.hero-bottom,.brand,.header-actions').forEach(el=>el.removeAttribute('style'))}
  return ()=>{};
 });
 mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',()=>{
  if(!window.Lenis)return;
  lenis=new Lenis({duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true,syncTouch:false});
  lenis.on('scroll',ST.update);tick=t=>lenis?.raf(t*1000);G.ticker.add(tick);G.ticker.lagSmoothing(0);
  return ()=>{G.ticker.remove(tick);lenis?.destroy();lenis=null};
 });
 document.fonts.ready.then(()=>ST.refresh());addEventListener('load',()=>ST.refresh());
}
// One active row and one sticky frame; geometry is read before any writes.
const rows=$$('.register-row'),frames=$$('.register-frame');
let active=0,registerPending=false;
// Establish opacity before class changes, and decode eagerly so an incoming frame is painted.
frames.forEach((frame,i)=>{frame.style.opacity=i===0?'1':'0';const img=$('img',frame);if(img){img.loading='eager';img.decode().catch(()=>{})}});
function activate(index){
 if(index===active)return;active=index;
 rows.forEach((row,i)=>row.classList.toggle('is-active',i===index));
 const show=()=>{if(index!==active)return;
 frames.forEach((frame,i)=>{frame.classList.toggle('is-active',i===index);frame.style.zIndex=i===index?'2':'1';if(reduced.matches||!G){frame.style.opacity=i===index?'1':'0';return}G.to(frame,{opacity:i===index?1:0,duration:.4,ease:'power2.out',overwrite:true})});
 };
 const image=frames[index]?.querySelector('img');
 if(image&&!image.complete)image.decode().then(show).catch(()=>{});else show();
}
function registerScroll(){
 registerPending=false;if(!rows.length)return;
 // A keyboard/pointer choice keeps ownership until it leaves the row. Native focus
 // scrolling and late font geometry must not replace that choice with a neighbour.
 if(fine.matches){const focus=rows.findIndex(row=>row.contains(document.activeElement));if(focus>=0){activate(focus);return}const hover=rows.findIndex(row=>row.matches(':hover'));if(hover>=0){activate(hover);return}}
 const rects=rows.map(r=>r.getBoundingClientRect()),centre=innerHeight/2;
 let index=rects.findIndex(r=>r.top<=centre&&r.bottom>centre);
 if(index<0)index=rects.reduce((best,r,i)=>Math.abs((r.top+r.bottom)/2-centre)<Math.abs((rects[best].top+rects[best].bottom)/2-centre)?i:best,0);
 activate(index);
}
function queueRegister(){if(!registerPending){registerPending=true;requestAnimationFrame(registerScroll)}}
addEventListener('scroll',queueRegister,{passive:true});addEventListener('resize',queueRegister);
rows.forEach((row,i)=>{row.addEventListener('pointerenter',()=>{if(fine.matches)activate(i)});row.addEventListener('pointerleave',()=>{if(fine.matches)queueRegister()});row.addEventListener('focusin',()=>{if(fine.matches)activate(i)});row.addEventListener('focusout',queueRegister)});
reduced.addEventListener('change',()=>{frames.forEach((f,i)=>{G?.killTweensOf(f);f.style.opacity=i===active?'1':'0'})});
registerScroll();
const scrollTo=(el)=>{if(lenis)lenis.scrollTo(el,{offset:-($('.site-header').offsetHeight+24),immediate:reduced.matches});else el.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'})};
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=$(a.getAttribute('href'));if(target){e.preventDefault();scrollTo(target);target.focus({preventScroll:true})}}));
$('.brand')?.addEventListener('click',e=>{if(location.pathname==='/bilageirinn-preview/'){e.preventDefault();lenis?lenis.scrollTo(0,{immediate:reduced.matches}):scrollToTop()}});
function scrollToTop(){window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'})}
// Native modal supplies the keyboard trap. A single reversible timeline preserves rapid input.
const menu=$('#menu'),toggle=$('.menu-toggle'),close=$('.menu-close');
let menuTimeline=null,menuWanted=false,savedY=0;
function releaseMenu(){if(menuWanted)return;menu.close();document.body.classList.remove('menu-open');document.body.style.top='';window.scrollTo(0,savedY);lenis?.start();toggle.focus({preventScroll:true})}
function menuSet(open,event){
 menuWanted=open;toggle.setAttribute('aria-expanded',String(open));
 if(open){
  if(!menu.open){savedY=window.scrollY;lenis?.stop();document.body.style.top=`-${savedY}px`;document.body.classList.add('menu-open');menu.showModal()}
  (event?.detail===0?$('nav a',menu):menu).focus({preventScroll:true});
 }
 if(reduced.matches||!G){if(open)menu.style.clipPath='none';else releaseMenu();return}
 if(!menuTimeline){menuTimeline=G.timeline({paused:true,onReverseComplete:releaseMenu}).fromTo(menu,{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.4,ease:'power3.out'});}
 open?menuTimeline.play():menuTimeline.reverse();
}
toggle?.addEventListener('click',e=>menuSet(!menuWanted,e));close?.addEventListener('click',e=>menuSet(false,e));
menu?.addEventListener('cancel',e=>{e.preventDefault();menuSet(false,e)});
menu?.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY>r.bottom)menuSet(false,e)}});
$$('a',menu).forEach(a=>a.addEventListener('click',()=>menuSet(false)));
reduced.addEventListener('change',()=>{if(menuTimeline){menuTimeline.kill();menuTimeline=null}if(menu.open){menu.style.clipPath='none';if(!menuWanted)releaseMenu()}});
addEventListener('pageshow',()=>{if(menu?.open){menuWanted=false;releaseMenu()}ST?.refresh()});
const form=$('#enquiry');if(!form)return;
form.noValidate=true;
const input=k=>form.elements.namedItem(k),value=k=>String(input(k)?.value||'').trim();
const params=new URLSearchParams(location.search), allowed=[copy.formRuntime_allowed_001,copy.formRuntime_allowed_002,copy.oilName,copy.formRuntime_allowed_003,copy.formRuntime_allowed_004];
if(allowed.includes(params.get('erindi')))input('erindi').value=params.get('erindi');
if([...input('subtopic').options].some(o=>o.value===params.get('undirefni')))input('subtopic').value=params.get('undirefni');
const serviceNames=[copy.formRuntime_serviceNames_001,copy.formRuntime_serviceNames_002,copy.formRuntime_serviceNames_003,copy.formRuntime_serviceNames_004,copy.formRuntime_serviceNames_005,copy.formRuntime_serviceNames_006,copy.formRuntime_serviceNames_007];
const initialErindi=value('erindi'),presetService=serviceNames.includes(params.get('undirefni'))?params.get('undirefni'):'';
let busy=false,submitted=false;
const groupState=new Map();
function expand(el,show,instant=false){
 if(groupState.get(el)===show&&!instant)return;groupState.set(el,show);
 el.inert=!show;el.setAttribute('aria-hidden',String(!show));
 if(!G||reduced.matches||instant){G?.killTweensOf(el);el.hidden=!show;el.style.height=show?'auto':'0px';el.style.opacity=show?'1':'0';return}
 const height=el.hidden?0:el.getBoundingClientRect().height;G.killTweensOf(el);el.hidden=false;
 G.fromTo(el,{height,opacity:show?.4:1},{height:show?'auto':0,opacity:show?1:0,duration:.35,ease:'power2.out',overwrite:true,onComplete:()=>{el.hidden=!groupState.get(el);ST?.refresh()}});
}
function sync(instant=false){
 const erindi=value('erindi'),hasErindi=erindi!=='',vehicle=hasErindi&&erindi!==copy.formRuntime_vehicle_001,noPlate=input('no_plate').checked;
 const context=$('#service-context');input('service').value=erindi===initialErindi?presetService:'';context.hidden=!input('service').value;context.textContent=input('service').value?copy.formRuntime_sync_001+input('service').value:'';
 const state={vehicle:hasErindi,'plate-number':hasErindi&&!noPlate,'make-model':hasErindi&&noPlate,damage:erindi===copy.formRuntime_state_001,'other-insurer':erindi===copy.formRuntime_state_002&&value('insurer')===copy.formRuntime_state_003,repair:erindi===copy.formRuntime_state_004,mileage:[copy.formRuntime_state_005,copy.oilName].includes(erindi),oil:erindi===copy.oilName,alignment:erindi===copy.formRuntime_state_006,inspection:[copy.formRuntime_state_007,copy.formRuntime_state_008].includes(erindi),date:vehicle};
 $$('.conditional',form).forEach(el=>expand(el,!!state[el.dataset.group],instant));
 // Parent state always wins for nested groups. Hidden data never enters the JSON payload.
 $$('input,select,textarea',form).forEach(el=>{const parents=[];let p=el.parentElement;while(p&&p!==form){if(p.matches('.conditional'))parents.push(p);p=p.parentElement}el.disabled=parents.some(p=>!groupState.get(p));});
 input('plate').disabled=!hasErindi||noPlate;input('foreign_plate').disabled=!hasErindi||noPlate;
 input('plate').required=vehicle&&!noPlate;input('make').required=vehicle&&noPlate;input('model').required=vehicle&&noPlate;
 input('email').required=value('reply')===copy.formRuntime_sync_002;input('message').required=[copy.formRuntime_sync_003,copy.formRuntime_sync_004,copy.formRuntime_sync_005].includes(erindi);
 input('subject').value=copy.formRuntime_sync_006+erindi;input('page').value=location.pathname;
 $$('[data-field]',form).forEach(f=>{const el=$('input,select,textarea',f);if(el){const label=$('label',f);if(label&&!['checkbox','radio'].includes(el.type)){label.textContent=label.textContent.replace(/ \*$/,'')+(el.required?' *':'')}if(el.disabled)clearError(el)}});
 if(submitted)validateAll();
}
function message(el){
 if(el.disabled)return '';
 const k=el.name,s=el.type==='radio'?value(k):el.value.trim();
 if(el.required&&!s)return ({erindi:copy.selectPurpose,name:copy.formRuntime_message_001,phone:copy.formRuntime_message_002,email:copy.formRuntime_message_003,plate:copy.formRuntime_message_004,make:copy.formRuntime_message_005,model:copy.formRuntime_message_006,message:copy.formRuntime_message_007})[k]||copy.formRuntime_message_008;
 if(el.type==='date'&&el.validity.badInput)return copy.validDate;
 if(!s)return '';
 if(el.maxLength>0&&s.length>el.maxLength)return copy.maxLength.replace('{max}',el.maxLength);
 if(k==='phone'){const digits=s.replace(/\D/g,'');if(!/^[+\d\s().-]+$/.test(s)||digits.length<7||digits.length>15)return copy.formRuntime_message_009}
 if(k==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))return copy.formRuntime_message_010;
 if(k==='plate'&&!input('foreign_plate').checked){const n=s.replace(/[\s-]/g,'');if(!/^[\p{L}\p{N}]{2,12}$/u.test(n))return copy.formRuntime_message_011}
 if(k==='year'&&!/^\d{4}$/.test(s))return copy.formRuntime_message_012;
 if(k==='mileage'&&!/^\d[\d .,]*$/.test(s))return copy.formRuntime_message_013;
 return '';
}
function clearError(el){el.removeAttribute('aria-invalid');const f=el.closest('.field');f?.removeAttribute('aria-invalid');const error=$(`#${el.name}-error`);if(error)error.textContent=''}
function validate(el){const msg=message(el),error=$(`#${el.name}-error`);if(error)error.textContent=msg;if(msg){el.setAttribute('aria-invalid','true');el.closest('.field')?.setAttribute('aria-invalid','true')}else clearError(el);return !msg}
function validateAll(){return $$('input,select,textarea',form).filter(el=>!['hidden','checkbox','submit'].includes(el.type)&&el.name!=='_honey'&&(el.type!=='radio'||el===document.getElementById(el.name))).map(el=>[el,validate(el)]).filter(([,valid])=>!valid).map(([el])=>el)}
$$('input,select,textarea',form).forEach(el=>{
 el.addEventListener('blur',()=>{if(el.name==='plate')el.value=el.value.trim().toLocaleUpperCase('is');validate(el)});
 el.addEventListener('input',()=>{if(el.getAttribute('aria-invalid')==='true')validate(el)});
});
['erindi','reply','no_plate','insurer'].forEach(k=>$$(`[name="${k}"]`,form).forEach(el=>el.addEventListener('change',()=>sync())));
input('foreign_plate').addEventListener('change',()=>validate(input('plate')));
reduced.addEventListener('change',()=>sync(true));sync(true);
const status=$('#form-status'),summary=$('#error-summary'),output=$('#dryrun-output'),submit=$('button[type=submit]',form);
function announce(html){status.innerHTML=html;if(G&&!reduced.matches)G.fromTo(status,{opacity:.4},{opacity:1,duration:.35});status.focus({preventScroll:true});scrollTo(status)}
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;submitted=true;
 const errors=validateAll();summary.hidden=!errors.length;
 if(errors.length){summary.textContent=copy.errorSummary.replace('{count}',errors.length).replace('{fields}',errors.length===1?copy.singleField:copy.multipleFields);scrollTo(errors[0].closest('.field')||errors[0]);errors[0].focus({preventScroll:true});return}
 const data=new FormData(form),payload=Object.fromEntries([...data].map(([k,v])=>[k,String(v).trim()]));
 payload.site='bilageirinn';payload.page=location.pathname;payload.subject=copy.formRuntime_shared_001+value('erindi');payload.language='is';
 if(payload.plate){payload.plate=payload.plate.toLocaleUpperCase('is');payload.plate_normalized=payload.plate.replace(/[\s-]/g,'')}
 busy=true;submit.disabled=true;submit.textContent=copy.sendingEnquiry;status.textContent='';output.hidden=true;
 const phone=value('erindi')===copy.oilName?copy.formRuntime_phone_001:copy.formRuntime_phone_002,tel=phone.replaceAll(' ','');
 try{
  if(params.get('dryrun')==='1'){
   output.textContent=JSON.stringify(payload,null,2);output.hidden=false;
   announce(copy.formRuntime_shared_002);
  }else{
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
   let response;try{response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal})}finally{clearTimeout(timeout)}
   if(!response.ok)throw Error('HTTP '+response.status);
   const result=await response.json();if(result.ok!==true&&result.success!==true)throw Error('Relay did not confirm acceptance');
   announce(`${copy.acceptedIntro}<a href="tel:+354${tel}">${copy.callLower}${phone}</a>${copy.formRuntime_shared_003}<a href="mailto:bilageirinn@bilageirinn.is">${copy.formRuntime_shared_004}</a>.`);
   submit.hidden=true;if(!status.hasAttribute('tabindex'))status.setAttribute('tabindex','-1');status.focus({preventScroll:true});status.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});
   // Keep disabled after accepted delivery to prevent accidental duplicate submissions.
   submit.textContent=copy.formRuntime_shared_006;return;
  }
 }catch{
  announce(`${copy.failedIntro}<a href="tel:+354${tel}">${copy.callImperative}${phone}</a>${copy.formRuntime_shared_007}<a href="mailto:bilageirinn@bilageirinn.is">${copy.formRuntime_shared_008}</a>.`);
 }
 busy=false;submit.disabled=false;submit.textContent=copy.sendEnquiry;
});
})();
