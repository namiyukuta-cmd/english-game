(()=>{
  // 手紙屋の「依頼人」データ。
  // 英単語・英文・手紙本文はここには持たせない。
  // 依頼人プロフィールと、学習内容は別々に抽選する。
  const requesters=[
    {id:'visitor_001',age:'10代',gender:'男性',pronoun:'彼'},
    {id:'visitor_002',age:'10代',gender:'女性',pronoun:'彼女'},
    {id:'visitor_003',age:'20代',gender:'男性',pronoun:'彼'},
    {id:'visitor_004',age:'20代',gender:'女性',pronoun:'彼女'},
    {id:'visitor_005',age:'30代',gender:'男性',pronoun:'彼'},
    {id:'visitor_006',age:'30代',gender:'女性',pronoun:'彼女'},
    {id:'visitor_007',age:'40代',gender:'男性',pronoun:'彼'},
    {id:'visitor_008',age:'40代',gender:'女性',pronoun:'彼女'},
    {id:'visitor_009',age:'50代',gender:'男性',pronoun:'彼'},
    {id:'visitor_010',age:'50代',gender:'女性',pronoun:'彼女'},
    {id:'visitor_011',age:'60代',gender:'男性',pronoun:'彼'},
    {id:'visitor_012',age:'60代',gender:'女性',pronoun:'彼女'},
    {id:'visitor_013',age:'10歳未満',gender:'男性',pronoun:'彼'},
    {id:'visitor_014',age:'10歳未満',gender:'女性',pronoun:'彼女'},
    {id:'visitor_015',age:'10代',gender:'男性',pronoun:'彼'},
    {id:'visitor_016',age:'10代',gender:'女性',pronoun:'彼女'},
    {id:'visitor_017',age:'20代',gender:'男性',pronoun:'彼'},
    {id:'visitor_018',age:'20代',gender:'女性',pronoun:'彼女'}
  ];
  window.LETTER_REQUESTERS={requesters};
})();
