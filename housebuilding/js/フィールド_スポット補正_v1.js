/* v4の発光円では暗さに負けるため、
   明るい場面の上に暗幕を被せ、前方だけ円形に抜く。 */

/* 元の発光円は非表示。 */
if(typeof spotLight!=='undefined') spotLight.style.display='none';
if(typeof spotCore!=='undefined') spotCore.style.display='none';

/* 暗幕の下では、場面そのものは普通に見える明るさにしておく。 */
world.style.background='linear-gradient(180deg,#747d82 0%,#5e666a 48%,#474d50 100%)';
world.querySelectorAll('.dungeonFloor').forEach(el=>{
  el.style.opacity='.72';
  const hint=el.querySelector('.floorHint');
  if(hint) hint.style.opacity='.38';
});

/* 前方の円内を少し暖色にする下地。 */
const strongSpot=document.createElement('div');
Object.assign(strongSpot.style,{
  position:'absolute',
  width:'190px',height:'190px',
  transform:'translate(-50%,-50%)',
  borderRadius:'50%',
  background:'radial-gradient(circle,rgba(255,246,216,.82) 0%,rgba(255,226,164,.58) 43%,rgba(255,190,105,.26) 68%,rgba(255,170,80,0) 100%)',
  mixBlendMode:'screen',
  zIndex:'42',
  pointerEvents:'none'
});
world.appendChild(strongSpot);

/* 画面全体を暗くする幕。丸い部分だけ透明に抜く。 */
const darknessMask=document.createElement('div');
Object.assign(darknessMask.style,{
  position:'absolute',
  inset:'0',
  background:'rgba(0,0,0,.965)',
  zIndex:'44',
  pointerEvents:'none'
});
world.appendChild(darknessMask);

function updateHardSpot(){
  const cx=state.x+(state.dir*18);
  const cy=state.y-2.2;

  strongSpot.style.left=`${cx}%`;
  strongSpot.style.top=`${cy}%`;

  /* 中央約70pxはほぼ完全に明るい。そこから100px前後までぼかす。 */
  const mask=`radial-gradient(circle 105px at ${cx}% ${cy}%, transparent 0 66px, rgba(0,0,0,.18) 78px, rgba(0,0,0,.68) 94px, #000 105px)`;
  darknessMask.style.webkitMaskImage=mask;
  darknessMask.style.maskImage=mask;

  requestAnimationFrame(updateHardSpot);
}
requestAnimationFrame(updateHardSpot);
