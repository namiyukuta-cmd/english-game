const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../image-transparent-tool.html'),'utf8');
const start=html.indexOf('  function detectObjects('),end=html.indexOf('  function drawDetectedOverlay(',start);
const detect=vm.runInNewContext('('+html.slice(start,end).trim()+')');
function canvas(w,h,rects){
 const data=new Uint8ClampedArray(w*h*4);
 for(const [x,y,rw,rh,alpha=255] of rects)for(let yy=y;yy<y+rh;yy++)for(let xx=x;xx<x+rw;xx++)data[(yy*w+xx)*4+3]=alpha;
 return {width:w,height:h,getContext:()=>({getImageData:()=>({data})})};
}
const grid=[];for(let row=0;row<2;row++)for(let col=0;col<5;col++)grid.push([20+col*100,20+row*130,60,85]);
let found=detect(canvas(520,280,grid));assert.equal(found.length,10);
for(let i=0;i<10;i++){
 const [x,y,rw,rh]=grid[i],r=found[i];assert.ok(r.x<=x&&r.y<=y&&r.x+r.w>=x+rw&&r.y+r.h>=y+rh);
 assert.ok(r.h<110,'one box must not contain both rows');
}
assert.equal(detect(canvas(850,200,Array.from({length:8},(_,i)=>[20+i*100,30,60,120]))).length,8);
assert.equal(detect(canvas(200,500,[[40,20,80,100],[40,220,80,110]])).length,2);
assert.equal(detect(canvas(520,280,grid.map(([x,y,w,h],i)=>[x+(i>=5?30:0),y,w,h]))).length,10,'staggered rows');
assert.equal(detect(canvas(200,200,[[40,20,80,140]])).length,1);
assert.equal(detect(canvas(200,200,[])).length,0);
assert.equal(detect(canvas(520,280,[...grid,[510,275,1,1]])).length,10,'discard isolated dust');
assert.equal(detect(canvas(200,200,[[20,20,50,50,10]])).length,0,'ignore near-transparent pixels');
// Disconnected strokes with tiny gaps within one icon stay together.
assert.equal(detect(canvas(200,200,[[30,20,70,60],[30,82,70,60],[130,20,50,120]])).length,2);
if(process.env.SPLIT_SCREENSHOT_MASK){
 const image=JSON.parse(fs.readFileSync(process.env.SPLIT_SCREENSHOT_MASK));
 const result=detect({width:image.width,height:image.height,getContext:()=>({getImageData:()=>({data:image.data})})});
 assert.equal(result.length,10,'reported screenshot, with preview background/overlays removed');
 console.log('PASS: screenshot diagnostic mask gives 10 separate boxes');
}
console.log('PASS: 2x5 grid, horizontal/vertical strips, staggered rows, ordering, bounds, dust and tiny gaps');
