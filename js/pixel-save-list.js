(() => {
  const requested=Number(new URLSearchParams(location.search).get('size')),defaultSize=Number(document.currentScript.dataset.size);
  const SIZE=[8,16,24,32,48,64,96,128].includes(requested)?requested:defaultSize;
  const prefix=SIZE>=24?'pixel':'pixel'+SIZE,query=SIZE>24?'size='+SIZE+'&':'';
  const key=SIZE===24?'englishGamePixelSavesV1':'englishGamePixelSaves'+SIZE+'V1';
  document.querySelector('h1').textContent=SIZE+'×'+SIZE+' 続きから';
  PixelCloud.mount(document.getElementById('cloudSettingsMount'));
  const list=document.getElementById('saveList'),status=document.getElementById('cloudListStatus');let loading=false;
  function card(data,href,label){const a=document.createElement('a');a.className='save-card';a.href=href;const canvas=document.createElement('canvas');canvas.width=SIZE;canvas.height=SIZE;canvas.className='preview';const ctx=canvas.getContext('2d');for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const c=data.pixels?.[y]?.[x];if(c){ctx.fillStyle=c;ctx.fillRect(x,y,1,1)}}const copy=document.createElement('div');copy.className='save-copy';const name=document.createElement('strong');name.textContent=data.name||label;const sub=document.createElement('small');sub.textContent=data.updatedAt?new Date(data.updatedAt).toLocaleString('ja-JP'):label;copy.append(name,sub);const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='›';a.append(canvas,copy,arrow);return a}
  async function refresh(){if(loading)return;loading=true;const button=document.getElementById('refreshCloud');button.disabled=true;status.textContent='GitHubから読み込んでいます…';list.replaceChildren();try{const files=await PixelCloud.list(SIZE);if(!files.length)status.textContent='GitHubのセーブはまだありません。';else{for(const file of files){const result=await PixelCloud.read(SIZE,file.id);list.appendChild(card(result.data,prefix+'-editor.html?'+query+'remote='+encodeURIComponent(file.id),'GitHub'))}status.textContent=files.length+'件のGitHubセーブがあります。'}}catch(error){status.textContent=error.message}finally{loading=false;button.disabled=false}}
  const legacy=document.getElementById('legacyList');try{const data=JSON.parse(localStorage.getItem(key)||'null');for(const id of Object.keys(data?.slots||{}).sort())legacy.appendChild(card(data.slots[id],prefix+'-editor.html?'+query+'save='+encodeURIComponent(id),'旧セーブ'+id))}catch(_){}
  if(!legacy.children.length)legacy.textContent='この端末の旧セーブはありません。';
  document.getElementById('refreshCloud').addEventListener('click',refresh);window.addEventListener('pixel-cloud-connected',refresh);
  if(PixelCloud.token())refresh();else status.textContent='保存設定に接続するとGitHubのセーブを表示します。';
})();
