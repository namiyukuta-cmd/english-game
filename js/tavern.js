(()=>{
  const image=document.getElementById('tavernImage');
  if(image&&window.TAVERN_BG_DATA){
    image.style.backgroundImage=`url("${window.TAVERN_BG_DATA}")`;
  }
})();
