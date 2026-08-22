(()=>{
  const stage=document.getElementById('tavernStage');
  if(!stage)return;
  Promise.all([
    fetch('assets/tavern-bg-small/part0.txt').then(r=>r.text()),
    fetch('assets/tavern-bg-small/part1.txt').then(r=>r.text())
  ]).then(parts=>{
    stage.style.backgroundImage=`url("data:image/webp;base64,${parts.join('')}")`;
  }).catch(()=>{});
})();
