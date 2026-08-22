(()=>{
  const data=window.LETTER_STORY;
  const store=window.GameStore;
  const storyText=document.getElementById('storyText');
  const sceneLabel=document.querySelector('.story-scene-placeholder');
  const button=document.querySelector('.story-choice-button');
  if(!data||!store||!storyText||!sceneLabel||!button)return;

  if(!Number.isInteger(store.state.letterStoryChapter)||store.state.letterStoryChapter<0){
    store.state.letterStoryChapter=0;
  }
  if(!Array.isArray(store.state.letterStoryCompletedIds)){
    store.state.letterStoryCompletedIds=[];
  }

  const params=new URLSearchParams(location.search);
  const completedId=params.get('completed');
  const completedIndex=data.chapters.findIndex(chapter=>chapter.id===completedId);

  if(completedIndex>=0){
    const chapter=data.chapters[completedIndex];
    if(!store.state.letterStoryCompletedIds.includes(chapter.id)){
      store.state.letterStoryCompletedIds.push(chapter.id);
      store.state.letterStoryChapter=Math.max(store.state.letterStoryChapter,completedIndex+1);
      store.save();
    }

    sceneLabel.textContent=chapter.sceneLabel||`第${completedIndex+1}話`;
    storyText.textContent=`${chapter.title}\n\n${chapter.after}`;
    button.textContent=completedIndex===data.chapters.length-1?'物語の結末へ':'次の話へ';
    button.href='story.html';
    return;
  }

  const currentIndex=Math.min(store.state.letterStoryChapter,data.chapters.length);
  if(currentIndex>=data.chapters.length){
    sceneLabel.textContent='終章';
    storyText.textContent=`${data.title}\n\n${data.epilogue}`;
    button.textContent='物語選択に戻る';
    button.href='story-menu.html';
    return;
  }

  const chapter=data.chapters[currentIndex];
  sceneLabel.textContent=chapter.sceneLabel||`第${currentIndex+1}話`;
  storyText.textContent=`${chapter.title}\n\n${chapter.intro}`;
  button.textContent='依頼を受ける';
  button.href=`confession.html?story=${encodeURIComponent(chapter.id)}`;
})();