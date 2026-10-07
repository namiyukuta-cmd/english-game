(() => {
  const SIZE=Number(document.body.dataset.size);
  const PREFIX=SIZE===24?'pixel':'pixel'+SIZE;
  const SAVE_KEY=SIZE===24?'englishGamePixelSavesV1':'englishGamePixelSaves'+SIZE+'V1';
  const WORK_KEY='englishGamePixel'+SIZE;
  const COLORS=[
    "#111111","#222222","#444444","#666666","#8D8D8D","#B8B8B8","#D9D9D9","#FFFFFF",
    "#2B2118","#4A2F21","#5A3825","#70452E","#8B5A3C","#A86F4C","#B97A56","#D09A73",
    "#9A5E43","#C98762","#E7AF87","#F3C9A7","#F7E0C2","#FFF3E6",
    "#7E2929","#A93333","#C93F3F","#E34B45","#F06A60",
    "#8A3656","#B84F73","#D66A8D","#E98DA1","#F4B3C5",
    "#A84A1F","#C95F25","#E57B32","#F0A04B",
    "#9A741E","#C79A27","#F0C84B","#FFE27A",
    "#24452F","#2D5A3A","#3F7A4A","#4FAE68","#7BC47F","#A8D99B",
    "#245E5E","#378888","#4FA6A6","#79C9C9",
    "#223D63","#244B76","#356D9E","#4A8FD8","#77B6EA","#A8D8F0",
    "#40305F","#4B3A71","#6A4FC2","#8A70D6","#B09AE8"
  ];
  const ZOOMS=[50,75,100,125,150,200,300,400,600,800];
  const grid=document.getElementById('grid');
  const canvasShell=document.getElementById('canvasShell');
  const palette=document.getElementById('palette');
  const currentColor=document.getElementById('currentColor');
  const currentLabel=document.getElementById('currentLabel');
  const eraserBtn=document.getElementById('eraserBtn');
  const drawModeBtn=document.getElementById('drawModeBtn');
  const zoomLabel=document.getElementById('zoomLabel');
  const message=document.getElementById('message');
  const projectLabel=document.getElementById('projectLabel');

  let selected=COLORS[8];
  let pixels=blankPixels();
  let undoHistory=[];
  let drawing=false;
  let beforeStroke=null;
  let drawMode=false;
  let zoomIndex=2;
  let moveMode=false, tool='pen', redoHistory=[], lastCell=null, dragOrigin=null;
  let pointerStart=null;
  let currentSaveId=null;

  function blankPixels(){return Array.from({length:SIZE},()=>Array(SIZE).fill(null))}
  function decodeArtParam(value){
    if(!value)return null;
    try{
      const json=decodeURIComponent(escape(atob(value.replace(/-/g,'+').replace(/_/g,'/'))));
      const data=JSON.parse(json);
      return validPixels(data)?data:null;
    }catch(e){return null}
  }
  function validPixels(p){return Array.isArray(p)&&p.length===SIZE&&p.every(r=>Array.isArray(r)&&r.length===SIZE)}
  function clone(){return pixels.map(r=>r.slice())}
  function note(t){message.textContent=t;clearTimeout(note.t);note.t=setTimeout(()=>message.textContent='',1800)}
  function readSaveData(){try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(d&&d.slots&&typeof d.slots==='object')return {next:Number(d.next)||1,slots:d.slots}}catch(e){}return {next:1,slots:{}}}
  function writeSaveData(d){localStorage.setItem(SAVE_KEY,JSON.stringify(d))}
  function saveWorking(){try{localStorage.setItem(WORK_KEY,JSON.stringify(pixels))}catch(e){}}
  function updateProjectLabel(){projectLabel.textContent=currentSaveId?'ドット絵セーブ'+currentSaveId:'新しいドット絵'}

  async function loadInitial(){
    const q=new URLSearchParams(location.search),requested=q.get('save'),mode=q.get('mode'),art=q.get('art'),artName=q.get('name'),ai=q.get('ai');
    if(ai==='1'&&SIZE===8){
      try{
        const res=await fetch('pixel8-ai.json?t='+Date.now(),{cache:'no-store'});
        const data=await res.json();
        const incoming=data&&data.pixels;
        if(validPixels(incoming)){
          pixels=incoming.map(r=>r.slice());
          currentSaveId=null;
          saveWorking();
          projectLabel.textContent=data.name?('AI：'+data.name):'AIドット絵';
          return;
        }
      }catch(e){}
    }
    const incomingArt=decodeArtParam(art);
    if(incomingArt){
      pixels=incomingArt.map(r=>r.slice());
      currentSaveId=null;
      saveWorking();
      projectLabel.textContent=artName?('AI：'+artName):'AIドット絵';
      return;
    }
    if(requested){
      const data=readSaveData(),slot=data.slots[requested];
      if(slot&&validPixels(slot.pixels)){currentSaveId=requested;pixels=slot.pixels.map(r=>r.slice());saveWorking();updateProjectLabel();return}
      pixels=blankPixels();currentSaveId=null;updateProjectLabel();setTimeout(()=>note('セーブデータが見つかりませんでした'),50);return;
    }
    if(mode==='new'){pixels=blankPixels();currentSaveId=null;saveWorking();updateProjectLabel();return}
    try{const old=JSON.parse(localStorage.getItem(WORK_KEY));if(validPixels(old))pixels=old}catch(e){}
    updateProjectLabel();
  }

  function saveGame(){
    const data=readSaveData();
    if(!currentSaveId){let n=Math.max(1,Number(data.next)||1),id=String(n).padStart(3,'0');while(data.slots[id]){n++;id=String(n).padStart(3,'0')}currentSaveId=id;data.next=n+1}
    data.slots[currentSaveId]={id:currentSaveId,name:'ドット絵セーブ'+currentSaveId,width:SIZE,height:SIZE,pixels:clone(),updatedAt:new Date().toISOString()};
    writeSaveData(data);saveWorking();updateProjectLabel();window.history.replaceState(null,'',PREFIX+'-editor.html?save='+encodeURIComponent(currentSaveId));note('ドット絵セーブ'+currentSaveId+'に保存しました');
  }

  function updateTool(){
    if(selected===null){currentColor.className='current transparent';currentColor.style.background='';currentLabel.textContent='消しゴム';eraserBtn.classList.add('active')}
    else{currentColor.className='current';currentColor.style.background=selected;currentLabel.textContent=selected;eraserBtn.classList.remove('active')}
    document.querySelectorAll('.swatch').forEach(b=>b.classList.toggle('active',b.dataset.color===(selected===null?'transparent':selected)));
  }
  function updateDrawMode(){drawModeBtn.textContent='なぞり塗り：'+(drawMode?'ON':'OFF');drawModeBtn.classList.toggle('active',drawMode);grid.classList.toggle('draw-mode',drawMode);grid.classList.toggle('tap-mode',!drawMode)}
  function updateZoom(keepCenter=true){
    const oldW=grid.getBoundingClientRect().width||1;
    const cx=(canvasShell.scrollLeft+canvasShell.clientWidth/2-8)/oldW;
    const cy=(canvasShell.scrollTop+canvasShell.clientHeight/2-8)/oldW;
    const base=Math.max(1,canvasShell.clientWidth-16),z=ZOOMS[zoomIndex];
    grid.style.width=Math.round(base*z/100)+'px';grid.style.height=grid.style.width;
    zoomLabel.textContent=z+'%';document.getElementById('zoomRange').value=zoomIndex;
    document.getElementById('zoomOutBtn').disabled=zoomIndex===0;
    document.getElementById('zoomInBtn').disabled=zoomIndex===ZOOMS.length-1;
    requestAnimationFrame(()=>{if(!keepCenter)return;const newW=grid.getBoundingClientRect().width;
      canvasShell.scrollLeft=Math.max(0,cx*newW-canvasShell.clientWidth/2+8);
      canvasShell.scrollTop=Math.max(0,cy*newW-canvasShell.clientHeight/2+8)});
  }
  function renderCell(x,y){grid.children[y*SIZE+x].style.background=pixels[y][x]||'transparent'}
  function render(){for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)renderCell(x,y);updatePreview()}
  function paint(cell){const x=+cell.dataset.x,y=+cell.dataset.y;if(pixels[y][x]===selected)return false;pixels[y][x]=selected;renderCell(x,y);return true}
  function commitSingle(cell){const before=clone();if(!paint(cell))return;undoHistory.push(before);redoHistory=[];if(undoHistory.length>100)undoHistory.shift();saveWorking();updatePreview()}
  function startDraw(cell){drawing=true;beforeStroke=clone();paint(cell)}
  function endDraw(){if(!drawing)return;drawing=false;if(JSON.stringify(beforeStroke)!==JSON.stringify(pixels)){undoHistory.push(beforeStroke);redoHistory=[];if(undoHistory.length>100)undoHistory.shift();saveWorking();updatePreview()}beforeStroke=null}

  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    const b=document.createElement('button');b.type='button';b.className='cell';b.dataset.x=x;b.dataset.y=y;b.setAttribute('aria-label',x+','+y);grid.appendChild(b);
    b.addEventListener('click',e=>{e.preventDefault();if(e.detail===0&&!moveMode)applyCell(b)});
  }
  function cellAt(e){const r=grid.getBoundingClientRect();const x=Math.floor((e.clientX-r.left)/r.width*SIZE),y=Math.floor((e.clientY-r.top)/r.height*SIZE);return x>=0&&y>=0&&x<SIZE&&y<SIZE?grid.children[y*SIZE+x]:null}
  function applyCell(cell){if(tool==='pick'){selected=pixels[+cell.dataset.y][+cell.dataset.x];tool='pen';updateTool();syncTools();return}if(tool==='fill'){fillCell(cell);return}commitSingle(cell)}
  function strokeTo(cell){if(!lastCell){paint(cell);lastCell=cell;return}let x=+lastCell.dataset.x,y=+lastCell.dataset.y;const tx=+cell.dataset.x,ty=+cell.dataset.y,dx=Math.abs(tx-x),dy=Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;let err=dx-dy;for(;;){paint(grid.children[y*SIZE+x]);if(x===tx&&y===ty)break;const e=2*err;if(e>-dy){err-=dy;x+=sx}if(e<dx){err+=dx;y+=sy}}lastCell=cell}
  grid.addEventListener('pointerdown',e=>{if(e.button!==0)return;const cell=cellAt(e);if(!cell)return;pointerStart={x:e.clientX,y:e.clientY,cell,id:e.pointerId};if(moveMode){e.preventDefault();grid.setPointerCapture(e.pointerId);dragOrigin={x:e.clientX,y:e.clientY,left:canvasShell.scrollLeft,top:canvasShell.scrollTop};return}if(drawMode&&tool==='pen'){e.preventDefault();grid.setPointerCapture(e.pointerId);lastCell=cell;startDraw(cell)}});
  grid.addEventListener('pointermove',e=>{if(!pointerStart||e.pointerId!==pointerStart.id)return;if(moveMode&&dragOrigin){canvasShell.scrollLeft=dragOrigin.left-(e.clientX-dragOrigin.x);canvasShell.scrollTop=dragOrigin.top-(e.clientY-dragOrigin.y);return}if(drawing){const cell=cellAt(e);if(cell)strokeTo(cell);else lastCell=null}});
  grid.addEventListener('pointerup',e=>{if(!pointerStart||e.pointerId!==pointerStart.id)return;if(drawing)endDraw();else if(!moveMode&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<8){const cell=cellAt(e);if(cell===pointerStart.cell)applyCell(cell)}pointerStart=null;dragOrigin=null;lastCell=null});
  window.addEventListener('pointerup',()=>{endDraw();pointerStart=null;dragOrigin=null;lastCell=null});
  grid.addEventListener('pointercancel',()=>{endDraw();pointerStart=null;dragOrigin=null;lastCell=null});

  const EXTRA=['#000000','#F4F4F4','#FFE7D3','#E6B89C','#D59A7A','#B8795C','#925C44','#633E2D','#FFD6DD','#FF9EBD','#EB5289','#C72E74','#FFF2B0','#FFD65A','#FFAE44','#FF873D','#EF583D','#A6EDB9','#69D6B4','#35B8A1','#117F85','#D9F2FF','#C0C4FF','#91A2EE','#667EC5','#394E85','#EEDBFF','#D1A4F2','#AF78CE','#84549B','#5F356E','#EDDCC6','#C8C4A4','#918D6F','#646F54','#BCE7A6','#82BA69','#5D8246'];
  const CUSTOM_KEY='englishGamePixelCustomColorsV1';let customColors=[];
  try{customColors=JSON.parse(localStorage.getItem(CUSTOM_KEY))||[]}catch(e){}
  if(!Array.isArray(customColors))customColors=[];customColors=customColors.filter(c=>/^#[0-9A-F]{6}$/i.test(c)).slice(0,32);
  const allColors=[...new Set([...COLORS,...EXTRA])];let colorGroup='all';
  function colorMatches(c){const [r,g,b]=c.slice(1).match(/../g).map(x=>parseInt(x,16));if(colorGroup==='gray')return Math.max(r,g,b)-Math.min(r,g,b)<24;if(colorGroup==='skin')return r>g&&g>=b&&r-g<95&&g-b<80;if(colorGroup==='warm')return r>g&&r>b;if(colorGroup==='cool')return g>=r||b>=r;return true}
  function renderPalette(){palette.replaceChildren();const colors=colorGroup==='custom'?customColors:allColors.filter(colorMatches);for(const color of [null,...colors]){const b=document.createElement('button');b.type='button';b.className='swatch'+(color===null?' transparent':'');b.dataset.color=color||'transparent';if(color)b.style.background=color;b.title=color||'透明';b.setAttribute('aria-label',color||'透明');b.addEventListener('click',()=>{selected=color;tool='pen';moveMode=false;updateTool();syncTools()});palette.appendChild(b)}updateTool()}
  document.getElementById('paletteGroups').addEventListener('click',e=>{const b=e.target.closest('[data-group]');if(!b)return;colorGroup=b.dataset.group;document.querySelectorAll('[data-group]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderPalette()});
  renderPalette();
  eraserBtn.addEventListener('click',()=>{selected=null;tool='pen';moveMode=false;updateTool();syncTools()});
  drawModeBtn.addEventListener('click',()=>{drawMode=!drawMode;tool='pen';moveMode=false;syncTools();note(drawMode?'指でなぞって連続で塗れます':'1マスずつタップするモードです')});
  document.getElementById('useCustom').addEventListener('click',()=>{selected=document.getElementById('customColor').value.toUpperCase();customColors=[selected,...customColors.filter(c=>c!==selected)].slice(0,32);try{localStorage.setItem(CUSTOM_KEY,JSON.stringify(customColors))}catch(e){}tool='pen';moveMode=false;renderPalette();syncTools();note('好きな色に追加しました')});
  document.getElementById('gameSaveBtn').addEventListener('click',saveGame);
  document.getElementById('undoBtn').addEventListener('click',()=>{if(!undoHistory.length){note('戻せる操作がありません');return}redoHistory.push(clone());pixels=undoHistory.pop();render();saveWorking();updatePreview()});
  document.getElementById('clearBtn').addEventListener('click',()=>{undoHistory.push(clone());redoHistory=[];pixels=blankPixels();render();saveWorking();updatePreview()});
  document.getElementById('backBtn').addEventListener('click',()=>{location.href=PREFIX+'-start.html'});
  document.getElementById('saveListBtn').addEventListener('click',()=>{location.href=PREFIX+'-saves.html'});
  document.getElementById('zoomInBtn').addEventListener('click',()=>{if(zoomIndex<ZOOMS.length-1){zoomIndex++;updateZoom()}else note('これ以上拡大できません')});
  document.getElementById('zoomOutBtn').addEventListener('click',()=>{if(zoomIndex>0){zoomIndex--;updateZoom()}else note('これ以上縮小できません')});
  document.getElementById('zoomResetBtn').addEventListener('click',()=>{zoomIndex=2;updateZoom(false);canvasShell.scrollLeft=0;canvasShell.scrollTop=0});

  function syncTools(){document.getElementById('moveBtn').classList.toggle('active',moveMode);document.getElementById('pickBtn').classList.toggle('active',tool==='pick');document.getElementById('fillBtn').classList.toggle('active',tool==='fill');updateDrawMode();grid.classList.toggle('draw-mode',drawMode||moveMode);grid.classList.toggle('tap-mode',!drawMode&&!moveMode);grid.style.cursor=moveMode?'grab':'crosshair';document.getElementById('modeHelp').textContent=moveMode?'絵を動かさず、表示位置をドラッグで移動します':tool==='pick'?'絵をタップして、その色を選びます':tool==='fill'?'同じ色でつながった範囲を一度に塗ります':drawMode?'なぞって連続で描けます':'1マスずつタップ。拡大時は「移動」で見たい所へ';}
  function fillCell(cell){const x=+cell.dataset.x,y=+cell.dataset.y,old=pixels[y][x];if(old===selected)return;const before=clone(),queue=[[x,y]];pixels[y][x]=selected;while(queue.length){const [cx,cy]=queue.pop();for(const [nx,ny] of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]])if(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&pixels[ny][nx]===old){pixels[ny][nx]=selected;queue.push([nx,ny])}}undoHistory.push(before);redoHistory=[];render();saveWorking()}
  document.getElementById('moveBtn').addEventListener('click',()=>{endDraw();moveMode=!moveMode;tool='pen';syncTools()});
  for(const [id,name] of [['pickBtn','pick'],['fillBtn','fill']])document.getElementById(id).addEventListener('click',()=>{moveMode=false;tool=tool===name?'pen':name;syncTools()});
  document.getElementById('redoBtn').addEventListener('click',()=>{if(!redoHistory.length){note('やり直せる操作がありません');return}undoHistory.push(clone());pixels=redoHistory.pop();render();saveWorking()});
  document.getElementById('gridBtn').addEventListener('click',e=>{const hide=grid.classList.toggle('hide-lines');e.currentTarget.textContent='格子：'+(hide?'OFF':'ON')});
  document.getElementById('zoomRange').addEventListener('input',e=>{zoomIndex=Number(e.target.value);updateZoom()});
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>updateZoom(),120)});
  function updatePreview(){const p=document.getElementById('preview'),ctx=p.getContext('2d');p.width=SIZE;p.height=SIZE;ctx.drawImage(makeCanvas(1),0,0)}
  syncTools();
  function makeCanvas(scale){const c=document.createElement('canvas');c.width=SIZE*scale;c.height=SIZE*scale;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const col=pixels[y][x];if(col){ctx.fillStyle=col;ctx.fillRect(x*scale,y*scale,scale,scale)}}return c}
  function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()}
  document.getElementById('savePngBtn').addEventListener('click',()=>{download(makeCanvas(Number(document.getElementById('exportScale').value)).toDataURL('image/png'),(currentSaveId?'pixel_'+currentSaveId:'pixel_'+SIZE+'x'+SIZE)+'.png');note('PNGを保存しました')});
  document.getElementById('saveJsonBtn').addEventListener('click',()=>{const coordinates=[];for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(pixels[y][x])coordinates.push({x,y,color:pixels[y][x]});const data={width:SIZE,height:SIZE,pixels,coordinates};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));download(url,(currentSaveId?'pixel_'+currentSaveId:'pixel_'+SIZE+'x'+SIZE)+'.json');setTimeout(()=>URL.revokeObjectURL(url),1000);note('座標データを保存しました')});

  loadInitial().then(()=>{render();updateTool();updateDrawMode();updateZoom(false)});
})();