import { useState, useEffect } from "react";
import { supabase } from "./supabase";



// ── デザイントークン ──
const C = {
  coral:"#E8856A", coralLight:"#F2A48E", coralPale:"#FCEAE4", coralBg:"#FDF6F3",
  white:"#FFFFFF", beige:"#F7F2EE", beigeLight:"#FAF7F4", border:"#EDE5DF",
  text:"#3D2E28", textSub:"#8C7B74", textMuted:"#B5A8A2",
  purple:"#7C6FF7", purplePale:"#EDEBFE",
  green:"#5CB98A", greenPale:"#E8F7EF",
  red:"#E05252", redPale:"#FEECEC",
};

// ── 定数 ──
const AREAS        = ["県央","県北","県南","沿岸","県外"];
const FILTER_AREAS = ["全域",...AREAS];
const AGE_GROUPS   = ["全員","妊婦","0〜6ヶ月","6〜12ヶ月","1〜2歳","3〜6歳（園児期）","小学校低学年","小学校高学年","中学生","高校生"];
const CHILD_AGES   = ["妊娠中","0〜6ヶ月","6〜12ヶ月","1〜2歳","3〜6歳","小学校低学年","小学校高学年","中学生","高校生"];
const AVATARS      = ["🌸","🌻","🍀","🐟","🌺","🌷","🦋","🐣","🌼","🍓","🐨","🌙"];
const BOARD_CATS   = ["すべて","育児相談","発達・先天障害","妊活・産院","仕事と育児","習い事・受験","マイホーム","家族問題","その他"];
const BOARD_ICONS  = {"育児相談":"💬","発達・先天障害":"🌈","妊活・産院":"🌷","仕事と育児":"💼","習い事・受験":"✏️","マイホーム":"🏠","家族問題":"👨‍👩‍👧","その他":"📝"};
const ADMIN_ID    = "admin";
const OFFICIAL_ID = "tecco_official";

const SPOT_TYPES   = ["すべて","支援センター","室内遊び場","公園","勉強スペース"];
const AGE_MAP = {
  "妊婦":["妊娠中","妊娠"],
  "0〜6ヶ月":["0〜6ヶ月","0ヶ月","1ヶ月","2ヶ月","3ヶ月","4ヶ月","5ヶ月","6ヶ月"],
  "6〜12ヶ月":["6〜12ヶ月","7ヶ月","8ヶ月","9ヶ月","10ヶ月","11ヶ月","12ヶ月"],
  "1〜2歳":["1〜2歳","1歳","2歳"],
  "3〜6歳（園児期）":["3〜6歳","3歳","4歳","5歳","6歳"],
  "小学校低学年":["小学校低学年","小1","小2","小3"],
  "小学校高学年":["小学校高学年","小4","小5","小6"],
  "中学生":["中学生","中1","中2","中3"],
  "高校生":["高校生","高1","高2","高3"],
};
const SC_COLOR = {all:C.green, wall:C.coral, followers:C.purple};
const SC_SHORT = {all:"🌍 全員", wall:"🪞 壁打ち", followers:"👥 フォロワー"};
const SC_LONG  = {all:"🌍 全員に公開", wall:"🪞 壁打ち（自分のみ）", followers:"👥 フォロワーのみ"};
const SC_DESC  = {all:"すべてのユーザーに表示", wall:"自分だけが見られる日記", followers:"フォロワーだけに表示"};

// ── サンプルデータ ──
const INIT_POSTS = [
  {id:0, user:"tecco公式", userId:"tecco_official", area:"県央", avatar:"🍀", childAges:[],
   content:"teccoへようこそ！🍀\n岩手のパパママのためのSNSです。地域・月齢でつながって、子育ての悩みや楽しいことをシェアしましょう。\nまずは自己紹介投稿から始めてみてください😊",
   time:"", likes:0, dislikes:0, scope:"all", tags:["はじめに"], comments:[]},
  {id:-1, user:"tecco公式", userId:"tecco_official", area:"県央", avatar:"🍀", childAges:[],
   content:"【使い方】📖\n🌍 全員公開：みんなに見せたい投稿\n🪞 壁打ち：自分だけの日記・ひとりごと\n👥 フォロワーのみ：フォロワーだけに見せたい投稿\n\n掲示板は匿名で書き込めます。デリケートな悩みもお気軽に🌿",
   time:"", likes:0, dislikes:0, scope:"all", tags:["使い方"], comments:[]},
  {id:1,user:"もりおかまま",userId:"morioka_mama",area:"県央",avatar:"🌸",childAges:["0〜6ヶ月"],
   content:"夜泣きが続いて限界です😭 3ヶ月になったら楽になるって聞いてたのに…同じ月齢のママさんいますか？",
   time:"2分前",likes:12,dislikes:0,scope:"all",tags:["夜泣き","3ヶ月"],
   comments:[{id:101,user:"はなまきん",userId:"hanamaki_n",avatar:"🌻",text:"うちも3ヶ月のとき同じでした！もう少しで楽になりますよ🌸",time:"1分前"}]},
  {id:2,user:"はなまきん",userId:"hanamaki_n",area:"県南",avatar:"🌻",childAges:["6〜12ヶ月"],
   content:"離乳食中期スタートしました！花巻で離乳食教室やってるとこ知ってる方いませんか？",
   time:"15分前",likes:8,dislikes:0,scope:"all",tags:["離乳食","花巻"],comments:[]},
  {id:3,user:"いちのへまま",userId:"ichinohe_m",area:"県北",avatar:"🍀",childAges:["1〜2歳"],
   content:"イヤイヤ期突入…ごはんも着替えも全部「いや！」。田舎だから支援センターもなくて孤独だな〜😮‍💨",
   time:"32分前",likes:24,dislikes:0,scope:"wall",tags:["イヤイヤ期","田舎育児"],
   comments:[{id:201,user:"みやこまま",userId:"miyako_mama",avatar:"🐟",text:"わかりすぎます…オンラインでよければ話しましょ！",time:"20分前"}]},
  {id:4,user:"みやこまま",userId:"miyako_mama",area:"沿岸",avatar:"🐟",childAges:["0〜6ヶ月"],
   content:"おすすめの育児スポットはどこですか？宮古周辺で穴場があれば教えてほしいです🌊",
   time:"1時間前",likes:41,dislikes:0,scope:"all",tags:["宮古","授乳"],comments:[]},
  {id:5,user:"きたかみん",userId:"kitakami_n",area:"県南",avatar:"🌺",childAges:["妊娠中"],
   content:"もうすぐ出産！teccoで産後も繋がれるといいな🤰 同じ時期のプレママさん教えてください〜",
   time:"2時間前",likes:17,dislikes:0,scope:"all",tags:["妊婦","プレママ"],comments:[]},
];
const INIT_BOARDS = [
  {id:1,category:"育児相談",content:"1歳半健診で要観察になりました。同じ経験のある方、その後どうでしたか？",time:"30分前",
   comments:[{id:301,text:"うちも同じでした。半年後の再健診で問題なしでしたよ。",time:"15分前"}]},
  {id:2,category:"妊活・産院",content:"2人目不妊で治療中です。岩手で評判いいクリニック教えてください",time:"3時間前",comments:[]},
  {id:3,category:"発達・先天障害",content:"特別支援学校と普通学級どちらにするか悩んでいます。盛岡近辺で相談できるところありますか",time:"昨日",
   comments:[{id:401,text:"盛岡市内に相談窓口があります。市の教育委員会に問い合わせると案内してもらえました。",time:"23時間前"}]},
  {id:4,category:"家族問題",content:"育児中の夫婦のコミュニケーション、みなさんどうしてますか？喧嘩が増えて悩んでいます。",time:"2日前",comments:[]},
];
const INIT_SPOTS = [
  // 県央
  {id:1, name:"もりおか子ども図書館", area:"県央", type:"支援センター", address:"盛岡市本宮2-1-1", memo:"絵本が充実。0歳から使えて授乳室あり。", mapUrl:"https://maps.google.com/?q=盛岡市本宮2-1-1", reviews:[]},
  {id:2, name:"岩手県立児童館いわて子どもの森", area:"県央", type:"室内遊び場", address:"岩手郡滝沢市砂込1番地2", memo:"雨の日でも遊べる大型施設。小学生まで楽しめる。", mapUrl:"https://maps.google.com/?q=岩手子どもの森", reviews:[]},
  {id:3, name:"高松公園", area:"県央", type:"公園", address:"盛岡市高松1丁目", memo:"桜の名所。広い芝生で子どもが走り回れる。", mapUrl:"https://maps.google.com/?q=盛岡高松公園", reviews:[]},
  // 県南
  {id:4, name:"花巻市子育て支援センターはなまき", area:"県南", type:"支援センター", address:"花巻市花城町1-41", memo:"スタッフが丁寧。月齢別の集まりがある。", mapUrl:"https://maps.google.com/?q=花巻市子育て支援センター", reviews:[]},
  {id:5, name:"北上市立公園展勝地", area:"県南", type:"公園", address:"北上市立花町", memo:"桜の季節は最高。ベビーカーでも歩きやすい。", mapUrl:"https://maps.google.com/?q=展勝地", reviews:[]},
  {id:6, name:"一関市児童センター", area:"県南", type:"室内遊び場", address:"一関市竹山町4-10", memo:"雨の日の定番。乳幼児コーナーあり。", mapUrl:"https://maps.google.com/?q=一関市児童センター", reviews:[]},
  // 県北
  {id:7, name:"二戸市子育て支援センター", area:"県北", type:"支援センター", address:"二戸市石切所字荒沢10-1", memo:"アットホームな雰囲気。相談しやすい。", mapUrl:"https://maps.google.com/?q=二戸市子育て支援センター", reviews:[]},
  {id:8, name:"九戸村ふれあい広場", area:"県北", type:"公園", address:"九戸郡九戸村伊保内", memo:"のびのび遊べる。地元ならではのゆったり感。", mapUrl:"https://maps.google.com/?q=九戸村ふれあい広場", reviews:[]},
  // 沿岸
  {id:9, name:"宮古市子育て支援センター結", area:"沿岸", type:"支援センター", address:"宮古市五月町2-20", memo:"海沿いの街ならではの温かさ。プレパパも来やすい。", mapUrl:"https://maps.google.com/?q=宮古市子育て支援センター", reviews:[]},
  {id:10, name:"大船渡市立公園おおふなと夢商店街広場", area:"沿岸", type:"公園", address:"大船渡市大船渡町野々田15-1", memo:"海が見える公園。天気のいい日は最高。", mapUrl:"https://maps.google.com/?q=大船渡夢商店街広場", reviews:[]},
];
const INIT_USERS = [
  {userId:"morioka_mama",user:"もりおかまま",avatar:"🌸",area:"県央",bio:"はると（3ヶ月）のママ🌱"},
  {userId:"hanamaki_n",  user:"はなまきん",  avatar:"🌻",area:"県南",bio:"花巻在住、8ヶ月の女の子のまま"},
  {userId:"ichinohe_m",  user:"いちのへまま",avatar:"🍀",area:"県北",bio:"県北でひとりでがんばってます"},
  {userId:"miyako_mama", user:"みやこまま",  avatar:"🐟",area:"沿岸",bio:"宮古の海が好き🌊"},
  {userId:"kitakami_n",  user:"きたかみん",  avatar:"🌺",area:"県南",bio:"プレママです！よろしくお願いします"},
];

// ── スタイル ──
const s = {
  authRoot:{minHeight:"100vh",background:C.coralBg,display:"flex",alignItems:"center",justifyContent:"center"},
  authInner:{width:"100%",maxWidth:400,padding:"0 20px",boxSizing:"border-box"},
  authHero:{textAlign:"center",paddingTop:48,paddingBottom:32},
  authTagline:{fontSize:12,color:C.textMuted,letterSpacing:"0.05em",marginBottom:12},
  authLogoText:{fontWeight:900,fontSize:42,color:C.coral,letterSpacing:"2px",lineHeight:1},
  authSubtitle:{fontSize:13,color:C.textSub,marginTop:10},
  authCard:{background:C.white,borderRadius:20,padding:"28px 24px 32px",boxShadow:"0 2px 24px rgba(180,100,70,0.10)"},
  authCardTitle:{fontSize:17,fontWeight:800,color:C.coral,textAlign:"center",marginBottom:18},
  authLabel:{fontSize:12,fontWeight:700,color:C.textSub,marginBottom:4},
  authInput:{display:"block",width:"100%",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",background:C.white,marginBottom:12,boxSizing:"border-box",color:C.text},
  authBtn:{display:"block",width:"100%",padding:"13px",background:C.coral,color:C.white,border:"none",borderRadius:12,fontSize:15,fontWeight:800,cursor:"pointer",marginBottom:10},
  authBtnSub:{display:"block",width:"100%",padding:"12px",background:C.white,color:C.coral,border:`1.5px solid ${C.coral}`,borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10},
  authLink:{display:"block",textAlign:"center",fontSize:13,color:C.textSub,marginTop:8,cursor:"pointer",textDecoration:"underline"},
  authError:{background:C.redPale,border:`1px solid ${C.red}44`,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.red,marginBottom:10},
  checkRow:{display:"flex",alignItems:"flex-start",gap:10,margin:"8px 0",cursor:"pointer"},
  checkBox:{width:20,height:20,borderRadius:5,border:`2px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1},
  checkBoxOn:{width:20,height:20,borderRadius:5,border:`2px solid ${C.coral}`,background:C.coral,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1},
  checkLabel:{fontSize:13,color:C.text,lineHeight:1.5},
  checkLink:{color:C.coral,fontWeight:700,textDecoration:"underline",cursor:"pointer"},
  termsOverlay:{position:"fixed",inset:0,background:"rgba(50,30,20,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
  termsSheet:{background:C.white,borderRadius:20,width:"100%",maxWidth:440,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden"},
  termsHeader:{padding:"16px 20px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0},
  termsTitle:{fontWeight:800,fontSize:16,color:C.text},
  termsBody:{padding:"16px 20px",overflowY:"auto",flex:1,fontSize:13,color:C.text,lineHeight:1.8},
  termsFooter:{padding:"12px 20px 20px",borderTop:`1px solid ${C.border}`,flexShrink:0},
  termsAgreeBtn:{display:"block",width:"100%",padding:"12px",background:C.coral,color:C.white,border:"none",borderRadius:12,fontSize:14,fontWeight:800,cursor:"pointer"},
  termsSectionTitle:{fontWeight:700,fontSize:14,color:C.coral,margin:"16px 0 6px"},
  authNote:{textAlign:"center",fontSize:11,color:C.textMuted,marginTop:12},
  root:{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:C.beigeLight,paddingBottom:80},
  header:{background:C.coral,padding:"13px 16px",position:"sticky",top:0,zIndex:100,boxShadow:`0 1px 8px rgba(180,100,70,0.18)`},
  headerInner:{display:"flex",alignItems:"center",justifyContent:"space-between"},
  headerTitle:{color:C.white,fontWeight:900,fontSize:22,letterSpacing:"2px"},
  headerRight:{display:"flex",gap:8,alignItems:"center"},
  adminBadge:{background:"rgba(255,255,255,0.22)",color:C.white,fontSize:11,fontWeight:700,borderRadius:8,padding:"3px 8px"},
  backBtn:{background:"none",border:"none",color:C.white,fontSize:15,fontWeight:700,cursor:"pointer",padding:0},
  tabNav:{display:"flex",background:C.white,borderBottom:`1.5px solid ${C.border}`,position:"sticky",top:54,zIndex:90,overflowX:"auto"},
  tabBtn:{flex:1,minWidth:68,padding:"11px 4px",border:"none",background:"none",fontSize:12,fontWeight:600,color:C.textMuted,cursor:"pointer",whiteSpace:"nowrap"},
  tabActive:{color:C.coral,borderBottom:`2px solid ${C.coral}`,marginBottom:-2},
  filterBar:{padding:"10px 16px",background:C.white,borderBottom:`1px solid ${C.border}`},
  hint:{fontSize:11,color:C.textMuted,marginTop:4},
  select:{width:"100%",padding:"9px 12px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.coralPale,fontSize:14,color:C.text,outline:"none"},
  main:{padding:"14px 12px 24px"},
  emptyMsg:{textAlign:"center",color:C.textMuted,padding:"48px 0",fontSize:14},
  tagBanner:{background:C.greenPale,borderBottom:`1px solid ${C.green}44`,padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,color:C.green,fontWeight:600},
  tagBannerBtn:{background:"none",border:"none",color:C.green,fontWeight:700,cursor:"pointer",fontSize:13},
  card:{background:C.white,borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",border:`1px solid ${C.border}`,position:"relative"},
  cardTop:{display:"flex",gap:10,marginBottom:8},
  avatarBtn:{background:"none",border:"none",padding:0,cursor:"pointer",flexShrink:0},
  avatarCircle:{width:42,height:42,borderRadius:"50%",background:C.coralPale,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`2px solid ${C.coralLight}`},
  cardMeta:{flex:1,minWidth:0},
  nameRow:{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap"},
  userNameBtn:{background:"none",border:"none",fontWeight:700,fontSize:14,color:C.text,cursor:"pointer",padding:0},
  userIdText:{fontSize:12,color:C.textMuted},
  subMeta:{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"},
  areaTag:{fontSize:11,color:C.textSub,background:C.beige,borderRadius:6,padding:"1px 7px"},
  ageTag:{fontSize:11,color:C.coral,background:C.coralPale,borderRadius:6,padding:"1px 7px"},
  timeText:{fontSize:11,color:C.textMuted},
  scopeBadge:{fontSize:10,borderRadius:6,padding:"2px 7px",fontWeight:600,whiteSpace:"nowrap"},
  content:{fontSize:14,color:C.text,lineHeight:1.7,margin:"0 0 10px"},
  tagRow:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10},
  tagBtn:{background:"none",border:"none",fontSize:12,color:C.purple,fontWeight:700,cursor:"pointer",padding:0},
  actions:{display:"flex",gap:2,alignItems:"center",borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:2},
  actionBtn:{background:"none",border:"none",fontSize:13,color:C.textSub,padding:"4px 8px",borderRadius:8,cursor:"pointer",fontWeight:600},
  menuBtn:{background:"none",border:"none",fontSize:12,color:C.textMuted,padding:"4px 8px",borderRadius:8,cursor:"pointer",marginLeft:"auto"},
  inlineMenu:{position:"absolute",right:12,top:56,background:C.white,borderRadius:12,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",border:`1px solid ${C.border}`,zIndex:50,minWidth:150,overflow:"hidden"},
  menuItem:{display:"block",width:"100%",padding:"11px 16px",background:"none",border:"none",textAlign:"left",fontSize:13,cursor:"pointer",color:C.text},
  menuItemDanger:{display:"block",width:"100%",padding:"11px 16px",background:"none",border:"none",textAlign:"left",fontSize:13,cursor:"pointer",color:C.red},
  commentSection:{borderTop:`1px solid ${C.border}`,marginTop:10,paddingTop:10},
  commentRow:{display:"flex",gap:8,marginBottom:10},
  commentAvatar:{width:28,height:28,borderRadius:"50%",background:C.coralPale,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,border:`1.5px solid ${C.coralLight}`},
  commentNameRow:{display:"flex",gap:6,alignItems:"baseline"},
  commentUser:{fontWeight:700,fontSize:12,color:C.text},
  commentUserId:{fontSize:11,color:C.textMuted},
  commentText:{fontSize:13,color:C.text,lineHeight:1.55,marginTop:2},
  commentTime:{fontSize:11,color:C.textMuted,marginTop:2},
  commentDeleteBtn:{background:"none",border:"none",fontSize:11,color:C.red,cursor:"pointer",padding:"0 4px",marginLeft:4},
  anonRow:{display:"flex",gap:8,marginBottom:10,alignItems:"flex-start"},
  commentInputRow:{display:"flex",gap:8,marginTop:8},
  commentInput:{flex:1,padding:"8px 13px",borderRadius:20,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",background:C.beigeLight},
  commentSendBtn:{padding:"8px 16px",borderRadius:20,background:C.coral,border:"none",fontSize:12,fontWeight:700,color:C.white,cursor:"pointer"},
  fab:{position:"fixed",bottom:24,right:20,height:52,borderRadius:26,background:C.coral,border:"none",fontSize:14,fontWeight:800,boxShadow:`0 4px 16px ${C.coral}66`,cursor:"pointer",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,gap:8,padding:"0 22px"},
  overlayBg:{position:"fixed",inset:0,background:"rgba(50,30,20,0.40)",zIndex:300,display:"flex",alignItems:"flex-end"},
  modalSheet:{width:"100%",maxWidth:480,margin:"0 auto",background:C.white,borderRadius:"20px 20px 0 0",paddingBottom:8},
  modalHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 12px",borderBottom:`1px solid ${C.border}`},
  modalTitle:{fontWeight:800,fontSize:16,color:C.text},
  closeBtn:{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.textMuted,padding:4},
  postBtn:{background:C.coral,color:C.white,border:"none",borderRadius:20,padding:"8px 22px",fontWeight:800,fontSize:14,cursor:"pointer"},
  composeUser:{display:"flex",gap:10,alignItems:"center",padding:"12px 16px 4px"},
  composeAvatar:{width:40,height:40,borderRadius:"50%",background:C.coralPale,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`2px solid ${C.coralLight}`},
  composeUserName:{fontWeight:700,fontSize:14,color:C.text},
  composeUserSub:{fontSize:12,color:C.textMuted},
  textarea:{display:"block",width:"100%",border:"none",padding:"12px 16px",fontSize:15,resize:"none",outline:"none",fontFamily:"inherit",lineHeight:1.7,boxSizing:"border-box",background:C.white,color:C.text},
  divider:{height:1,background:C.border,margin:"6px 0"},
  sectionPad:{padding:"10px 16px 6px"},
  subLabel:{fontSize:12,fontWeight:700,color:C.textMuted,marginBottom:8},
  scopeCards:{display:"flex",gap:6},
  scopeCard:{flex:1,padding:"9px 6px",borderRadius:10,border:"1.5px solid",background:C.white,cursor:"pointer",textAlign:"left"},
  scopeTitle:{fontSize:11,fontWeight:700,marginBottom:2},
  scopeDesc:{fontSize:10,color:C.textMuted,lineHeight:1.4},
  tagInputRow:{display:"flex",gap:8,marginBottom:8},
  tagInput:{flex:1,padding:"8px 12px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",background:C.coralPale},
  tagAddBtn:{padding:"8px 14px",borderRadius:10,background:C.coralPale,border:"none",fontSize:13,fontWeight:700,color:C.coral,cursor:"pointer"},
  tagChip:{fontSize:13,color:C.purple,background:C.purplePale,borderRadius:8,padding:"3px 9px",display:"flex",alignItems:"center",gap:4},
  tagRemove:{background:"none",border:"none",cursor:"pointer",color:C.purple,fontSize:14,padding:0,lineHeight:1},
  charCount:{fontSize:11,color:C.textMuted,textAlign:"right",padding:"6px 16px 12px"},
  boardCatBar:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12},
  boardCatBtn:{padding:"6px 13px",borderRadius:20,border:"1.5px solid",fontSize:12,fontWeight:700,cursor:"pointer"},
  boardNotice:{background:"#FFF8E6",color:"#7A5C00",borderRadius:12,padding:"10px 14px",fontSize:12,lineHeight:1.6,marginBottom:12,border:"1px solid #FFE49A"},
  boardCard:{background:C.white,borderRadius:16,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.purplePale}`,boxShadow:"0 1px 6px rgba(0,0,0,0.04)"},
  boardTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8},
  boardBadge:{fontSize:12,fontWeight:700,background:C.purplePale,color:C.purple,borderRadius:8,padding:"3px 10px",cursor:"pointer"},
  boardTime:{fontSize:11,color:C.textMuted},
  boardContent:{fontSize:14,color:C.text,lineHeight:1.65,margin:"0 0 8px"},
  boardReplyBtn:{background:"none",border:"none",fontSize:12,color:C.purple,fontWeight:600,cursor:"pointer",padding:0},
  myCard:{background:C.white,borderRadius:16,padding:"18px",display:"flex",gap:14,alignItems:"flex-start",marginBottom:16,border:`1px solid ${C.border}`},
  myAvatarBox:{width:58,height:58,borderRadius:"50%",background:C.coral,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0},
  myName:{fontWeight:800,fontSize:17,color:C.text},
  myUserId:{fontSize:13,color:C.textMuted,marginTop:2},
  myArea:{fontSize:13,color:C.textSub,marginTop:2},
  myBio:{fontSize:13,color:C.textSub,marginTop:5,lineHeight:1.55},
  editProfBtn:{background:C.coralPale,border:`1px solid ${C.coralLight}`,color:C.coral,borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0},
  secTitle:{fontWeight:700,fontSize:13,color:C.textMuted,marginBottom:8,marginTop:4},
  childCard:{background:C.white,borderRadius:14,padding:"12px 16px",display:"flex",gap:12,alignItems:"center",border:`1.5px solid ${C.border}`,marginBottom:8},
  childName:{fontWeight:700,fontSize:15,color:C.text},
  childSub:{fontSize:12,color:C.textMuted,marginTop:2},
  editChildBtn:{marginLeft:"auto",background:C.coralPale,border:`1px solid ${C.coralLight}`,color:C.coral,borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer"},
  addChildBtn:{width:"100%",padding:"11px",background:"none",border:`2px dashed ${C.coralLight}`,borderRadius:14,color:C.coral,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16},
  stats:{display:"flex",justifyContent:"space-around",background:C.white,borderRadius:14,padding:"16px",border:`1px solid ${C.border}`},
  statItem:{textAlign:"center",cursor:"pointer"},
  statNum:{fontWeight:800,fontSize:22,color:C.coral},
  statLabel:{fontSize:12,color:C.textMuted,marginTop:2},
  userListItem:{display:"flex",gap:10,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`},
  userListAvatar:{width:36,height:36,borderRadius:"50%",background:C.coralPale,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:`1.5px solid ${C.coralLight}`},
  userListName:{fontWeight:700,fontSize:14,color:C.text},
  userListId:{fontSize:12,color:C.textMuted},
  unfollowBtn:{marginLeft:"auto",background:"none",border:`1px solid ${C.coralLight}`,color:C.coral,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,cursor:"pointer"},
  userPageWrap:{background:`linear-gradient(160deg,${C.coralPale},${C.beige})`,padding:"28px 20px",textAlign:"center",borderBottom:`1px solid ${C.border}`},
  userPageAvatar:{width:64,height:64,borderRadius:"50%",background:C.coral,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 10px"},
  followBtn:{background:C.coral,color:C.white,border:"none",borderRadius:20,padding:"9px 28px",fontWeight:800,fontSize:14,cursor:"pointer",marginTop:12},
  unfollowBtnLg:{background:C.white,border:`2px solid ${C.coral}`,color:C.coral,borderRadius:20,padding:"9px 28px",fontWeight:800,fontSize:14,cursor:"pointer",marginTop:12},
  frozenBanner:{background:C.redPale,border:`1px solid ${C.red}44`,borderRadius:12,padding:"10px 14px",fontSize:13,color:C.red,margin:"12px 12px 0",textAlign:"center"},
  adminPanel:{background:C.white,borderRadius:16,padding:"14px 16px",marginBottom:10,border:"2px solid #FFE49A"},
  adminTitle:{fontWeight:800,fontSize:15,color:"#7A5C00",marginBottom:10},
  adminUserRow:{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:"1px solid #FFF3C4"},
  adminFreezeBtn:{background:C.redPale,border:`1px solid ${C.red}44`,color:C.red,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",marginLeft:"auto"},
  adminUnfreezeBtn:{background:C.greenPale,border:`1px solid ${C.green}44`,color:C.green,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",marginLeft:"auto"},
  reportSection:{background:C.white,borderRadius:16,padding:"16px",marginBottom:10,border:`1px solid ${C.border}`},
  reportTitle:{fontWeight:800,fontSize:15,color:C.text,marginBottom:10},
  feedbackArea:{width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${C.purplePale}`,fontSize:13,outline:"none",background:"#FAFAFF",boxSizing:"border-box",fontFamily:"inherit",resize:"none",lineHeight:1.6,color:C.text},
  feedbackBtn:{marginTop:8,padding:"9px 20px",background:C.purple,color:C.white,border:"none",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer"},
  successMsg:{background:C.greenPale,border:`1px solid ${C.green}44`,borderRadius:10,padding:"10px 14px",fontSize:13,color:C.green,marginTop:8},
  formLabel:{fontSize:12,fontWeight:700,color:C.textSub,marginBottom:6},
  formInput:{width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,outline:"none",background:C.coralPale,boxSizing:"border-box",color:C.text},
  avatarPicker:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8},
  avatarOpt:{width:44,height:44,borderRadius:"50%",fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  radioRow:{display:"flex",gap:6,flexWrap:"wrap"},
  radioBtn:{padding:"7px 10px",borderRadius:10,border:"1.5px solid",fontSize:12,fontWeight:600,cursor:"pointer"},
  deleteBtn:{display:"block",width:"calc(100% - 32px)",margin:"16px 16px 0",padding:"10px",background:"none",border:`1.5px solid ${C.red}66`,borderRadius:12,color:C.red,fontSize:13,fontWeight:700,cursor:"pointer"},
  logoutBtn:{display:"block",width:"100%",marginTop:24,padding:"13px",background:"none",border:`1.5px solid ${C.border}`,borderRadius:14,color:C.textSub,fontSize:14,fontWeight:700,cursor:"pointer"},
  donateSection:{background:`linear-gradient(135deg,${C.coralPale},#FFF8E6)`,borderRadius:16,padding:"20px",marginBottom:10,border:`1px solid ${C.coralLight}`,textAlign:"center"},
  donateTitle:{fontWeight:800,fontSize:16,color:C.coral,marginBottom:6},
  donateDesc:{fontSize:13,color:C.textSub,lineHeight:1.6,marginBottom:14},
  donateBtn:{display:"inline-block",padding:"12px 32px",background:C.coral,color:C.white,border:"none",borderRadius:20,fontSize:15,fontWeight:800,cursor:"pointer"},
  // スポットマップ
  spotFilterBar:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12},
  spotFilterBtn:{padding:"6px 13px",borderRadius:20,border:"1.5px solid",fontSize:12,fontWeight:700,cursor:"pointer"},
  spotCard:{background:C.white,borderRadius:16,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.border}`,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"},
  spotCardOpen:{background:C.white,borderRadius:16,padding:"14px 16px",marginBottom:10,border:`2px solid ${C.coral}`,boxShadow:"0 2px 12px rgba(232,133,106,0.15)"},
  spotTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6},
  spotName:{fontWeight:800,fontSize:15,color:C.text,flex:1},
  spotTypeBadge:{fontSize:11,fontWeight:700,background:C.coralPale,color:C.coral,borderRadius:8,padding:"2px 9px",whiteSpace:"nowrap",marginLeft:8},
  spotArea:{fontSize:12,color:C.textMuted,marginBottom:4},
  spotAddress:{fontSize:12,color:C.textSub,marginBottom:6},
  spotMemo:{fontSize:13,color:C.text,lineHeight:1.6,background:C.beigeLight,borderRadius:10,padding:"8px 12px",marginBottom:10},
  spotMapBtn:{display:"inline-block",padding:"7px 16px",background:C.green,color:C.white,border:"none",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:10},
  spotReviewTitle:{fontSize:12,fontWeight:700,color:C.textMuted,marginBottom:6},
  spotReviewItem:{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"},
  spotReviewText:{fontSize:13,color:C.text,lineHeight:1.5},
  spotReviewTime:{fontSize:11,color:C.textMuted,marginTop:2},
};

// ── Overlay ──
function Overlay({children, onClose, scrollable}) {
  return (
    <div style={s.overlayBg} onClick={onClose}>
      <div style={{...s.modalSheet,...(scrollable?{maxHeight:"90vh",overflowY:"auto"}:{})}}
        onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ── PostCard ──
function PostCard({post,liked,disliked,onLike,onDislike,onUserClick,onTagClick,isOpen,onToggleComments,commentText,onCommentChange,onCommentSubmit,onDelete,onDeleteComment,onReport,isAdmin,isMine}) {
  const [menuOpen,setMenuOpen] = useState(false);
  const uInfo = {user:post.user,userId:post.userId,avatar:post.avatar,area:post.area};
  return (
    <div style={s.card}>
      {menuOpen && (
        <div style={s.inlineMenu}>
          {(isMine||isAdmin) && <button style={s.menuItemDanger} onClick={()=>{onDelete(post.id);setMenuOpen(false);}}>🗑️ 削除する</button>}
          {!isMine && <button style={s.menuItem} onClick={()=>{onReport(post.id,post.user);setMenuOpen(false);}}>🚩 通報する</button>}
          <button style={{...s.menuItem,color:C.textMuted}} onClick={()=>setMenuOpen(false)}>閉じる</button>
        </div>
      )}
      <div style={s.cardTop}>
        <button style={s.avatarBtn} onClick={()=>onUserClick(uInfo)}>
          <div style={s.avatarCircle}>{post.avatar}</div>
        </button>
        <div style={s.cardMeta}>
          <div style={s.nameRow}>
            <button style={s.userNameBtn} onClick={()=>onUserClick(uInfo)}>{post.user}</button>
            {post.userId===OFFICIAL_ID && <span style={{fontSize:11,background:"#E8F4FD",color:"#1DA1F2",borderRadius:6,padding:"1px 6px",fontWeight:700}}>公式</span>}
            <span style={s.userIdText}>@{post.userId}</span>
          </div>
          <div style={s.subMeta}>
            <span style={s.areaTag}>📍{post.area}</span>
            {post.childAges && post.childAges.map(age=>(
              <span key={age} style={s.ageTag}>👶{age}</span>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          <span style={s.timeText}>{post.time}</span>
          <span style={{...s.scopeBadge,background:SC_COLOR[post.scope]+"20",color:SC_COLOR[post.scope],border:`1px solid ${SC_COLOR[post.scope]}44`}}>
            {SC_SHORT[post.scope]}
          </span>
        </div>
      </div>
      <p style={s.content}>{post.content}</p>
      {post.tags.length>0 && (
        <div style={s.tagRow}>
          {post.tags.map(t=><button key={t} style={s.tagBtn} onClick={()=>onTagClick(t)}>#{t}</button>)}
        </div>
      )}
      <div style={s.actions}>
        <button style={{...s.actionBtn,color:liked?C.red:C.textSub}} onClick={()=>onLike(post.id)}>{liked?"❤️":"🤍"} {post.likes+(liked?1:0)}</button>
        <button style={{...s.actionBtn,color:disliked?C.purple:C.textSub}} onClick={()=>onDislike(post.id)}>{disliked?"💔":"🖤"} {post.dislikes+(disliked?1:0)}</button>
        <button style={s.actionBtn} onClick={onToggleComments}>💬 {post.comments.length}</button>
        <button style={s.menuBtn} onClick={()=>setMenuOpen(v=>!v)}>▾ メニュー</button>
      </div>
      {isOpen && (
        <div style={s.commentSection}>
          {post.comments.map(c=>(
            <div key={c.id} style={s.commentRow}>
              <div style={s.commentAvatar}>{c.avatar}</div>
              <div style={{flex:1}}>
                <div style={s.commentNameRow}>
                  <span style={s.commentUser}>{c.user}</span>
                  <span style={s.commentUserId}>@{c.userId}</span>
                  {(c.userId===post.userId||isAdmin) && <button style={s.commentDeleteBtn} onClick={()=>onDeleteComment(post.id,c.id)}>削除</button>}
                </div>
                <div style={s.commentText}>{c.text}</div>
                <div style={s.commentTime}>{c.time}</div>
              </div>
            </div>
          ))}
          <div style={s.commentInputRow}>
            <input style={s.commentInput} placeholder="返信する…" value={commentText}
              onChange={e=>onCommentChange(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&onCommentSubmit(post.id)}/>
            <button style={s.commentSendBtn} onClick={()=>onCommentSubmit(post.id)}>送信</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ──
function App() {
  const [screen,setScreen]           = useState("login");
  const [tab,setTab]                 = useState("timeline");
  const [filterArea,setFilterArea]   = useState("全域");
  const [filterAge,setFilterAge]     = useState("全員");
  const [boardCat,setBoardCat]       = useState("すべて");
  const [posts,setPosts]             = useState(INIT_POSTS);
  const [boards,setBoards]           = useState(INIT_BOARDS);
  const [users]                      = useState(INIT_USERS);
  const [frozenIds,setFrozenIds]     = useState(new Set());
  const [reports,setReports]         = useState([]);
  const [feedbacks,setFeedbacks]     = useState([]);
  const [likedIds,setLikedIds]       = useState(new Set());
  const [dislikedIds,setDislikedIds] = useState(new Set());
  const [profile,setProfile]         = useState(null);
  const [following,setFollowing]     = useState([]);
  const [lastSeenTimeline,setLastSeenTimeline] = useState(Date.now()); // タイムライン最終閲覧時刻
  const [lastSeenBoard,setLastSeenBoard]       = useState(Date.now()); // 掲示板最終閲覧時刻
  const [newFollowers,setNewFollowers]         = useState([]); // 新しいフォロワーのuserId一覧
  const [seenNotif,setSeenNotif]               = useState(false); // 通知タブを見たか
  const [tagSearch,setTagSearch]     = useState(null);
  const [viewUser,setViewUser]       = useState(null);
  const [openPostId,setOpenPostId]   = useState(null);
  const [openBoardId,setOpenBoardId] = useState(null);
  const [commentText,setCommentText] = useState("");
  const [boardCommentText,setBoardCommentText] = useState("");
  const [showFollowers,setShowFollowers] = useState(false);
  const [showFollowing,setShowFollowing] = useState(false);
  const [draftText,setDraftText]     = useState("");
  const [draftScope,setDraftScope]   = useState("all");
  const [draftTag,setDraftTag]       = useState("");
  const [draftTags,setDraftTags]     = useState([]);
  const [boardComposing,setBoardComposing] = useState(false);
  const [boardDraftCat,setBoardDraftCat]   = useState("育児相談");
  const [boardDraftText,setBoardDraftText] = useState("");
  const [composing,setComposing]           = useState(false);
  const [editProf,setEditProf]             = useState(false);
  const [spots,setSpots]             = useState(INIT_SPOTS);
  const [spotArea,setSpotArea]       = useState("すべて");
  const [spotType,setSpotType]       = useState("すべて");
  const [openSpotId,setOpenSpotId]   = useState(null);
  const [spotReviewText,setSpotReviewText] = useState("");
  const [spotReview,setSpotReview]   = useState("");
  const [viewSpot,setViewSpot]       = useState(null);
  const [profDraft,setProfDraft]     = useState(null);
  const [childMode,setChildMode]     = useState(null);
  const [childDraft,setChildDraft]   = useState(null);
  const [feedbackText,setFeedbackText] = useState("");
  const [feedbackSent,setFeedbackSent] = useState(false);
  const [loginId,setLoginId]         = useState("");
  const [loginPw,setLoginPw]         = useState("");
  const [loginError,setLoginError]   = useState("");
  const [signupName,setSignupName]   = useState("");
  const [signupId,setSignupId]       = useState("");
  const [signupPw,setSignupPw]       = useState("");
  const [signupArea,setSignupArea]   = useState("県央");
  const [signupAvatar,setSignupAvatar] = useState("🌸");
  const [signupError,setSignupError] = useState("");
  const [showTerms,setShowTerms]     = useState(false);   // 利用規約モーダル
  const [showPrivacy,setShowPrivacy] = useState(false);   // PPモーダル
  const [agreedTerms,setAgreedTerms] = useState(false);   // 利用規約同意
  const [agreedPrivacy,setAgreedPrivacy] = useState(false); // PP同意

  const isAdmin = profile?.userId === ADMIN_ID;
  const allKnownUsers = [...users,...posts.map(p=>({userId:p.userId,user:p.user,avatar:p.avatar,area:p.area,bio:""}))].filter((u,i,arr)=>arr.findIndex(x=>x.userId===u.userId)===i);
  const followingList = allKnownUsers.filter(u=>following.includes(u.userId));
  const followerList  = [];

  // バッジ計算
  // HOMEバッジ：フォロー中ユーザー（公式含む）の新着投稿数
  const timelineBadge = posts.filter(p =>
    (following.includes(p.userId) || p.userId === OFFICIAL_ID) &&
    p.userId !== profile?.userId &&
    p.scope !== "wall" &&
    p._ts > lastSeenTimeline
  ).length;

  // 掲示板バッジ：自分が関わった掲示板スレッドへの新着コメント数
  const boardBadge = boards.reduce((acc, b) => {
    const myRelated = b.comments.some(c => c._ts && c._ts > lastSeenBoard);
    return acc + (myRelated ? 1 : 0);
  }, 0);

  // 通知バッジ：未確認の新しいフォロワー数
  const notifBadge = seenNotif ? 0 : newFollowers.length;

  const handleLogin = async () => {
    setLoginError("");
    if (!loginId.trim()||!loginPw.trim()){setLoginError("IDとパスワードを入力してください");return;}
    if (loginId===ADMIN_ID&&loginPw==="admin"){
      setProfile({name:"管理者",userId:ADMIN_ID,area:"県央",avatar:"⚙️",bio:"tecco運営アカウント",children:[]});
      setTab("timeline");setScreen("main");return;
    }
    const {data,error} = await supabase.from("users").select("*").eq("user_id",loginId).single();
    if (error||!data){setLoginError("このIDは登録されていません");return;}
    if (data.password!==loginPw){setLoginError("パスワードが違います");return;}
    setProfile({name:data.name,userId:data.user_id,area:data.area,avatar:data.avatar,bio:data.bio||"",children:[]});
    setTab("timeline");setScreen("main");
  };

  const handleSignup = async () => {
    setSignupError("");
    if (!signupName.trim()||!signupId.trim()||!signupPw.trim()){setSignupError("すべての項目を入力してください");return;}
    if (signupId===ADMIN_ID){setSignupError("このIDは使用できません");return;}
    if (signupPw.length<6){setSignupError("パスワードは6文字以上にしてください");return;}
    const {data:existing} = await supabase.from("users").select("user_id").eq("user_id",signupId).single();
    if (existing){setSignupError("このIDはすでに使われています");return;}
    const {error} = await supabase.from("users").insert({user_id:signupId,name:signupName,area:signupArea,avatar:signupAvatar,bio:"",password:signupPw});
    if (error){setSignupError("登録に失敗しました");console.log(error);return;}
    setProfile({name:signupName,userId:signupId,area:signupArea,avatar:signupAvatar,bio:"",children:[]});
    setFollowing([OFFICIAL_ID]);
    setTab("timeline");setScreen("main");
  };

  const handleLogout = () => {
    setProfile(null);setFollowing([]);
    setLikedIds(new Set());setDislikedIds(new Set());
    setTagSearch(null);setViewUser(null);setTab("timeline");
    setLoginId("");setLoginPw("");setScreen("login");
  };

  // ── Supabaseデータ読み込み ──
  useEffect(() => {
    const fetchAll = async () => {
      const {data:postsData} = await supabase.from("posts").select("*").order("created_at",{ascending:false});
      if (postsData) {
        setPosts(prev => {
          const dbPosts = postsData.map(p=>({
            id:p.id, user:p.user, userId:p.user_id, area:p.area, avatar:p.avatar,
            childAges:JSON.parse(p.child_ages||"[]"),
            content:p.content, time:new Date(p.created_at).toLocaleString("ja-JP"),
            likes:p.likes||0, dislikes:p.dislikes||0,
            scope:p.scope||"all", tags:JSON.parse(p.tags||"[]"), comments:[],
          }));
          const officialPosts = prev.filter(p=>p.userId===OFFICIAL_ID);
          return [...officialPosts, ...dbPosts];
        });
      }
      const {data:commentsData} = await supabase.from("comments").select("*").order("created_at",{ascending:true});
      if (commentsData) {
        setPosts(p=>p.map(post=>({
          ...post,
          comments: commentsData.filter(c=>c.post_id===post.id).map(c=>({
            id:c.id, user:c.user, userId:c.user_id, avatar:c.avatar,
            text:c.text, time:new Date(c.created_at).toLocaleString("ja-JP"),
          }))
        })));
      }
      const {data:boardsData} = await supabase.from("boards").select("*").order("created_at",{ascending:false});
      if (boardsData) {
        setBoards(boardsData.map(b=>({
          id:b.id, category:b.category, content:b.content,
          time:new Date(b.created_at).toLocaleString("ja-JP"), comments:[],
        })));
      }
      const {data:spotsData} = await supabase.from("spots").select("*").order("created_at",{ascending:true});
      if (spotsData) {
        setSpots(spotsData.map(sp=>({
          id:sp.id, name:sp.name, area:sp.area, type:sp.type,
          address:sp.address, memo:sp.memo, mapUrl:sp.map_url, reviews:[],
        })));
      }
    };
    fetchAll();
  }, []);

  const toggleLike = async id => {
    const isLiked = likedIds.has(id);
    const post = posts.find(x=>x.id===id);
    if (!post) return;
    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id",id).eq("user_id",profile.userId).eq("type","like");
      await supabase.from("posts").update({likes:post.likes-1}).eq("id",id);
      setLikedIds(p=>{const n=new Set(p);n.delete(id);return n;});
      setPosts(p=>p.map(x=>x.id!==id?x:{...x,likes:x.likes-1}));
    } else {
      await supabase.from("likes").insert({post_id:id,user_id:profile.userId,type:"like"});
      await supabase.from("posts").update({likes:post.likes+1}).eq("id",id);
      setLikedIds(p=>{const n=new Set(p);n.add(id);return n;});
      setPosts(p=>p.map(x=>x.id!==id?x:{...x,likes:x.likes+1}));
      if (dislikedIds.has(id)) {
        await supabase.from("likes").delete().eq("post_id",id).eq("user_id",profile.userId).eq("type","dislike");
        await supabase.from("posts").update({dislikes:post.dislikes-1}).eq("id",id);
        setDislikedIds(p=>{const n=new Set(p);n.delete(id);return n;});
        setPosts(p=>p.map(x=>x.id!==id?x:{...x,dislikes:x.dislikes-1}));
      }
    }
  };

  const toggleDislike = async id => {
    const isDisliked = dislikedIds.has(id);
    const post = posts.find(x=>x.id===id);
    if (!post) return;
    if (isDisliked) {
      await supabase.from("likes").delete().eq("post_id",id).eq("user_id",profile.userId).eq("type","dislike");
      await supabase.from("posts").update({dislikes:post.dislikes-1}).eq("id",id);
      setDislikedIds(p=>{const n=new Set(p);n.delete(id);return n;});
      setPosts(p=>p.map(x=>x.id!==id?x:{...x,dislikes:x.dislikes-1}));
    } else {
      await supabase.from("likes").insert({post_id:id,user_id:profile.userId,type:"dislike"});
      await supabase.from("posts").update({dislikes:post.dislikes+1}).eq("id",id);
      setDislikedIds(p=>{const n=new Set(p);n.add(id);return n;});
      setPosts(p=>p.map(x=>x.id!==id?x:{...x,dislikes:x.dislikes+1}));
      if (likedIds.has(id)) {
        await supabase.from("likes").delete().eq("post_id",id).eq("user_id",profile.userId).eq("type","like");
        await supabase.from("posts").update({likes:post.likes-1}).eq("id",id);
        setLikedIds(p=>{const n=new Set(p);n.delete(id);return n;});
        setPosts(p=>p.map(x=>x.id!==id?x:{...x,likes:x.likes-1}));
      }
    }
  };

  const toggleFollow = userId => {
    setFollowing(p => {
      if (p.includes(userId)) return p.filter(id=>id!==userId);
      setNewFollowers(prev => prev.includes(userId) ? prev : [...prev, userId]);
      setSeenNotif(false);
      return [...p, userId];
    });
  };

  const submitPost = async () => {
    if (!draftText.trim()) return;
    const {data,error} = await supabase.from("posts").insert({
      user:profile.name, user_id:profile.userId, area:profile.area, avatar:profile.avatar,
      content:draftText, scope:draftScope,
      tags:JSON.stringify(draftTags),
      child_ages:JSON.stringify(profile.children.map(c=>c.age)),
      likes:0, dislikes:0,
    }).select().single();
    if (error){console.log(error);return;}
    setPosts(p=>[{
      id:data.id, user:data.user, userId:data.user_id, area:data.area, avatar:data.avatar,
      childAges:JSON.parse(data.child_ages||"[]"),
      content:data.content, time:"たった今",
      likes:0, dislikes:0, scope:data.scope,
      tags:JSON.parse(data.tags||"[]"), comments:[],
    }, ...p]);
    setDraftText("");setDraftScope("all");setDraftTags([]);setDraftTag("");setComposing(false);
  };

  const addTag = () => {
    const t=draftTag.trim().replace(/^#/,"");
    if (t&&!draftTags.includes(t)&&draftTags.length<5){setDraftTags(p=>[...p,t]);setDraftTag("");}
  };
  const deletePost = id => setPosts(p=>p.filter(x=>x.id!==id));
  const deleteComment = (postId,cid) => setPosts(p=>p.map(x=>x.id!==postId?x:{...x,comments:x.comments.filter(c=>c.id!==cid)}));

  const submitComment = async postId => {
    if (!commentText.trim()) return;
    const {data,error} = await supabase.from("comments").insert({
      post_id:postId, user:profile.name, user_id:profile.userId, avatar:profile.avatar, text:commentText,
    }).select().single();
    if (error){console.log(error);return;}
    setPosts(p=>p.map(x=>x.id!==postId?x:{...x,comments:[...x.comments,{
      id:data.id, user:data.user, userId:data.user_id, avatar:data.avatar, text:data.text, time:"たった今",
    }]}));
    setCommentText("");
  };

  const submitBoardComment = async boardId => {
    if (!boardCommentText.trim()) return;
    const {data,error} = await supabase.from("board_comments").insert({
      board_id:boardId, text:boardCommentText,
    }).select().single();
    if (error){
      // board_commentsテーブルがない場合はローカルで追加
      setBoards(p=>p.map(b=>b.id!==boardId?b:{...b,comments:[...b.comments,{id:Date.now(),text:boardCommentText,time:"たった今"}]}));
      setBoardCommentText("");
      return;
    }
    setBoards(p=>p.map(b=>b.id!==boardId?b:{...b,comments:[...b.comments,{id:data.id,text:data.text,time:"たった今"}]}));
    setBoardCommentText("");
  };

  const submitBoard = async () => {
    if (!boardDraftText.trim()) return;
    const {data,error} = await supabase.from("boards").insert({
      category:boardDraftCat, content:boardDraftText,
    }).select().single();
    if (error){console.log(error);return;}
    setBoards(p=>[{id:data.id,category:data.category,content:data.content,time:"たった今",comments:[]}, ...p]);
    setBoardDraftText("");setBoardComposing(false);
  };
  const handleReport = (postId,userName) => {
    setReports(p=>[...p,{id:Date.now(),postId,userName,time:"たった今"}]);
    alert("通報しました。運営が確認します。");
  };
  const freezeUser   = uid => setFrozenIds(p=>{const n=new Set(p);n.add(uid);return n;});
  const unfreezeUser = uid => setFrozenIds(p=>{const n=new Set(p);n.delete(uid);return n;});
  const submitFeedback = () => {
    if (!feedbackText.trim()) return;
    setFeedbacks(p=>[...p,{id:Date.now(),text:feedbackText,time:"たった今"}]);
    setFeedbackText("");setFeedbackSent(true);
    setTimeout(()=>setFeedbackSent(false),3000);
  };
  const submitSpotReview = spotId => {
    if (!spotReviewText.trim()) return;
    setSpots(p=>p.map(sp=>sp.id!==spotId?sp:{...sp,reviews:[...sp.reviews,{id:Date.now(),user:profile.name,avatar:profile.avatar,text:spotReviewText,time:"たった今"}]}));
    setSpotReviewText("");
  };
  const deleteBoard = id => setBoards(p=>p.filter(b=>b.id!==id));
  const [editingSpot,setEditingSpot] = useState(null); // 編集中のスポット
  const openEditSpot = sp => setEditingSpot({...sp});
  const saveSpot = () => {
    if (!editingSpot.name.trim()) return;
    if (editingSpot.isNew) {
      // 新規追加
      const {isNew, ...spotData} = editingSpot;
      setSpots(p=>[...p, {...spotData, reviews:[]}]);
    } else {
      // 既存編集
      setSpots(p=>p.map(sp=>sp.id===editingSpot.id?editingSpot:sp));
    }
    setEditingSpot(null);
  };
  const deleteSpot = id => setSpots(p=>p.filter(sp=>sp.id!==id));
  const openEditProf = () => {setProfDraft({...profile,children:profile.children.map(c=>({...c}))});setEditProf(true);};
  const saveProf = () => {setProfile(profDraft);setEditProf(false);};
  const openAddChild = () => {setChildDraft({id:Date.now(),name:"",age:"0〜6ヶ月",gender:"女の子"});setChildMode("new");};
  const openEditChild = c => {setChildDraft({...c});setChildMode("edit");};
  const saveChild = () => {
    if (!childDraft.name.trim()) return;
    setProfile(p=>({...p,children:childMode==="new"?[...p.children,childDraft]:p.children.map(c=>c.id===childDraft.id?childDraft:c)}));
    setChildMode(null);
  };
  const deleteChild = () => {setProfile(p=>({...p,children:p.children.filter(c=>c.id!==childDraft.id)}));setChildMode(null);};

  const pcp = post => ({
    post, liked:likedIds.has(post.id), disliked:dislikedIds.has(post.id),
    onLike:toggleLike, onDislike:toggleDislike,
    onUserClick:u=>setViewUser(u),
    onTagClick:t=>{setTagSearch(t);setTab("timeline");setViewUser(null);},
    isOpen:openPostId===post.id,
    onToggleComments:()=>setOpenPostId(openPostId===post.id?null:post.id),
    commentText, onCommentChange:setCommentText, onCommentSubmit:submitComment,
    onDelete:deletePost, onDeleteComment:deleteComment, onReport:handleReport,
    isAdmin, isMine:post.userId===profile?.userId,
  });

  const visiblePosts = posts.filter(p=>{
    if (frozenIds.has(p.userId)&&!isAdmin) return false;
    if (p.scope==="wall"&&p.userId!==profile?.userId) return false;
    if (p.scope==="followers"&&p.userId!==profile?.userId&&!following.includes(p.userId)) return false;
    if (tagSearch) return p.tags.includes(tagSearch);
    if (tab==="area"&&filterArea!=="全域"&&p.area!==filterArea) return false;
    if (tab==="age"&&filterAge!=="全員"){
      const allowed=AGE_MAP[filterAge]||[];
      return (p.childAges||[]).some(age=>allowed.some(k=>age.includes(k)||k.includes(age)));
    }
    return true;
  });
  const myPosts = posts.filter(p=>p.userId===profile?.userId);
  const filteredBoards = boardCat==="すべて"?boards:boards.filter(b=>b.category===boardCat);

  // ── ログイン画面 ──
  if (screen==="login") return (
    <div style={s.authRoot}>
      <div style={s.authInner}>
        <div style={s.authHero}>
          <div style={s.authTagline}>手っこ取り合い　みんなで育てるいわてっ子</div>
          <div style={s.authLogoText}>tecco</div>
          <div style={s.authSubtitle}>いわてのパパママでつくるSNS</div>
        </div>
        <div style={s.authCard}>
          <div style={s.authCardTitle}>ログインする</div>
          <div style={s.authLabel}>ユーザーID</div>
          <input style={s.authInput} placeholder="ユーザーIDを入力してください" value={loginId}
            onChange={e=>{setLoginId(e.target.value);setLoginError("");}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          <div style={s.authLabel}>パスワード</div>
          <input style={s.authInput} type="password" placeholder="パスワードを入力してください" value={loginPw}
            onChange={e=>{setLoginPw(e.target.value);setLoginError("");}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          {loginError && <div style={s.authError}>{loginError}</div>}
          <div style={{height:8}}/>
          <button style={s.authBtn} onClick={handleLogin}>ログインする</button>
          <button style={s.authBtnSub} onClick={()=>{setScreen("signup");setLoginError("");}}>新規登録</button>
        </div>
        <div style={s.authNote}>※岩手在住・出身のパパママ限定です</div>
      </div>
    </div>
  );

  // ── 新規登録画面 ──
  if (screen==="signup") return (
    <div style={s.authRoot}>
      <div style={s.authInner}>
        <div style={{...s.authHero,paddingTop:32,paddingBottom:20}}>
          <div style={s.authLogoText}>tecco</div>
        </div>
        <div style={s.authCard}>
          <div style={s.authCardTitle}>アカウントを新規作成する</div>
          <div style={s.formLabel}>アイコンを選ぶ</div>
          <div style={s.avatarPicker}>
            {AVATARS.map(av=>(
              <button key={av} onClick={()=>setSignupAvatar(av)}
                style={{...s.avatarOpt,background:signupAvatar===av?C.coralPale:"#f8fafc",border:signupAvatar===av?`2px solid ${C.coral}`:"2px solid transparent"}}>{av}</button>
            ))}
          </div>
          <div style={{height:8}}/>
          <div style={s.authLabel}>ニックネーム</div>
          <input style={s.authInput} placeholder="ニックネームを入力" value={signupName} onChange={e=>{setSignupName(e.target.value);setSignupError("");}}/>
          <div style={s.authLabel}>ユーザーID（英数字）</div>
          <input style={s.authInput} placeholder="例：iwate_mama" value={signupId} onChange={e=>{setSignupId(e.target.value);setSignupError("");}}/>
          <div style={s.authLabel}>地域</div>
          <select style={{...s.authInput,background:C.coralPale}} value={signupArea} onChange={e=>setSignupArea(e.target.value)}>
            {AREAS.map(a=><option key={a}>{a}</option>)}
          </select>
          <div style={s.authLabel}>パスワード（6文字以上）</div>
          <input style={s.authInput} type="password" placeholder="6文字以上" value={signupPw} onChange={e=>{setSignupPw(e.target.value);setSignupError("");}}/>
          <div style={{height:4}}/>
          {/* 利用規約チェック */}
          <div style={s.checkRow} onClick={()=>setAgreedTerms(v=>!v)}>
            <div style={agreedTerms?s.checkBoxOn:s.checkBox}>
              {agreedTerms && <span style={{color:"#fff",fontSize:12,lineHeight:1}}>✓</span>}
            </div>
            <div style={s.checkLabel}>
              <span style={s.checkLink} onClick={e=>{e.stopPropagation();setShowTerms(true);}}>利用規約</span>
              に同意する
            </div>
          </div>
          {/* PPチェック */}
          <div style={s.checkRow} onClick={()=>setAgreedPrivacy(v=>!v)}>
            <div style={agreedPrivacy?s.checkBoxOn:s.checkBox}>
              {agreedPrivacy && <span style={{color:"#fff",fontSize:12,lineHeight:1}}>✓</span>}
            </div>
            <div style={s.checkLabel}>
              <span style={s.checkLink} onClick={e=>{e.stopPropagation();setShowPrivacy(true);}}>プライバシーポリシー</span>
              に同意する
            </div>
          </div>
          {signupError && <div style={s.authError}>{signupError}</div>}
          <button style={{...s.authBtn,opacity:(agreedTerms&&agreedPrivacy)?1:0.4,marginTop:8}}
            onClick={()=>{
              if (!agreedTerms||!agreedPrivacy){setSignupError("利用規約とプライバシーポリシーへの同意が必要です");return;}
              handleSignup();
            }}>登録する</button>
          <button style={s.authBtnSub} onClick={()=>{setScreen("login");setSignupError("");}}>ログインに戻る</button>
        </div>
        <div style={s.authNote}>※岩手在住・出身のパパママ限定です</div>
      </div>

      {/* 利用規約モーダル */}
      {showTerms && (
        <div style={s.termsOverlay} onClick={()=>setShowTerms(false)}>
          <div style={s.termsSheet} onClick={e=>e.stopPropagation()}>
            <div style={s.termsHeader}>
              <span style={s.termsTitle}>利用規約</span>
              <button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888"}} onClick={()=>setShowTerms(false)}>✕</button>
            </div>
            <div style={s.termsBody}>
              <p style={{fontSize:11,color:"#888",marginBottom:16}}>制定日：2026年○月○日</p>
              {[
                ["第1条　総則・目的","本利用規約（以下「本規約」）は、tecco（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆さまには、本規約に同意のうえ本サービスをご利用いただきます。本サービスは、岩手県在住・出身の子育て世代が地域のつながりを育むことを目的としたコミュニティプラットフォームです。"],
                ["第2条　利用登録","本サービスへの登録は、本規約に同意した方に限ります。虚偽の情報を登録した場合、アカウントを停止することがあります。"],
                ["第3条　禁止事項","以下の行為を禁止します。①他のユーザーへの誹謗中傷・ハラスメント行為　②個人情報（住所・電話番号・氏名等）の掲載　③商業目的の宣伝・勧誘（運営が許可した場合を除く）　④虚偽情報・デマの流布　⑤政治・宗教活動を目的とした投稿　⑥著作権・肖像権等の侵害　⑦なりすまし行為　⑧その他運営が不適切と判断した行為"],
                ["第4条　投稿コンテンツ","投稿の著作権は投稿者本人に帰属します。投稿することで、本サービス内での表示・共有に必要な範囲での利用を許諾したものとみなします。運営は、禁止事項に違反する投稿を予告なく削除できるものとします。"],
                ["第5条　免責事項","本サービスはユーザー間のコミュニケーションを媒介するものであり、ユーザー間のトラブルに対して運営は責任を負いません。システム障害・メンテナンス等によるサービス停止について、運営は責任を負いません。投稿内容の正確性・信頼性について、運営は保証しません。"],
                ["第6条　アカウントの停止","本規約に違反した場合、予告なくアカウントを停止・削除することがあります。アカウントの削除を希望する場合は、お問い合わせ窓口よりご連絡ください。"],
                ["第7条　規約の変更","運営は、必要に応じて本規約を変更できるものとします。変更後の規約は、本サービス上での告知をもって効力を生じます。"],
                ["第8条　準拠法・管轄","本規約は日本法に準拠します。本サービスに関する紛争は、岩手地方裁判所を第一審の専属的合意管轄裁判所とします。"],
              ].map(([title,body])=>(
                <div key={title} style={{marginBottom:20}}>
                  <div style={s.termsSectionTitle}>{title}</div>
                  <p style={{fontSize:13,lineHeight:1.8,color:"#3a3a3a"}}>{body}</p>
                </div>
              ))}
            </div>
            <div style={s.termsFooter}>
              <button style={s.termsAgreeBtn} onClick={()=>{setAgreedTerms(true);setShowTerms(false);}}>同意して閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* プライバシーポリシーモーダル */}
      {showPrivacy && (
        <div style={s.termsOverlay} onClick={()=>setShowPrivacy(false)}>
          <div style={s.termsSheet} onClick={e=>e.stopPropagation()}>
            <div style={s.termsHeader}>
              <span style={s.termsTitle}>プライバシーポリシー</span>
              <button style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#888"}} onClick={()=>setShowPrivacy(false)}>✕</button>
            </div>
            <div style={s.termsBody}>
              <p style={{fontSize:11,color:"#888",marginBottom:16}}>制定日：2026年○月○日</p>
              {[
                ["基本方針","tecco運営（以下「運営」）は、ユーザーの個人情報を適切に取り扱うことを重要な責務と考え、個人情報保護法その他関連法令を遵守します。"],
                ["第1条　取得する情報","登録情報（ニックネーム、パスワード）、プロフィール情報（居住エリア、子どもの年齢層）、投稿・活動情報、アクセス情報を取得します。※本名・住所・電話番号・メールアドレスの収集は行いません。"],
                ["第2条　利用目的","取得した情報は、①本サービスの提供・運営・改善　②ユーザー認証・不正アクセス防止　③禁止事項への対応・アカウント管理　④利用状況の統計的分析（個人を特定しない形式）にのみ使用します。"],
                ["第3条　第三者への提供","ユーザーの同意がある場合、法令に基づく開示請求がある場合、人の生命・身体・財産の保護のために必要な場合を除き、個人情報を第三者に提供しません。"],
                ["第4条　Cookieの使用","本サービスは、ログイン状態の維持のためにCookieを使用します。Cookieにより個人を特定することはありません。"],
                ["第5条　情報の管理","パスワードは暗号化（ハッシュ化）して保存します。通信はSSL/TLSにより暗号化します。不正アクセス・漏洩防止のための適切な措置を講じます。"],
                ["第6条　ユーザーの権利","ユーザーは個人情報の開示請求・訂正・削除を求めることができます。アカウントの削除を希望する場合は、お問い合わせ窓口よりご連絡ください。"],
                ["第7条　子どもの個人情報","本サービスは保護者向けのサービスです。子ども自身の個人情報（氏名・顔写真等）の投稿、および子ども個人の特定につながる投稿は行わないようお願いします。"],
                ["第8条　ポリシーの変更","本ポリシーは、法令の改正やサービスの変更に伴い更新することがあります。重要な変更がある場合は、本サービス上でお知らせします。"],
              ].map(([title,body])=>(
                <div key={title} style={{marginBottom:20}}>
                  <div style={s.termsSectionTitle}>{title}</div>
                  <p style={{fontSize:13,lineHeight:1.8,color:"#3a3a3a"}}>{body}</p>
                </div>
              ))}
            </div>
            <div style={s.termsFooter}>
              <button style={s.termsAgreeBtn} onClick={()=>{setAgreedPrivacy(true);setShowPrivacy(false);}}>同意して閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── フォロー中一覧 ──
  if (showFollowing) return (
    <div style={s.root}>
      <header style={s.header}><div style={s.headerInner}>
        <button style={s.backBtn} onClick={()=>setShowFollowing(false)}>← 戻る</button>
        <span style={s.headerTitle}>フォロー中</span><div style={{width:40}}/>
      </div></header>
      <div style={{padding:"12px 16px"}}>
        {followingList.length===0 && <div style={s.emptyMsg}>まだフォローしていません</div>}
        {followingList.map(u=>(
          <div key={u.userId} style={s.userListItem}>
            <button style={s.avatarBtn} onClick={()=>{setShowFollowing(false);setViewUser(u);}}>
              <div style={s.userListAvatar}>{u.avatar}</div>
            </button>
            <div style={{flex:1,cursor:"pointer"}} onClick={()=>{setShowFollowing(false);setViewUser(u);}}>
              <div style={s.userListName}>{u.user}</div>
              <div style={s.userListId}>@{u.userId}</div>
            </div>
            <button style={s.unfollowBtn} onClick={()=>toggleFollow(u.userId)}>フォロー解除</button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── フォロワー一覧 ──
  if (showFollowers) return (
    <div style={s.root}>
      <header style={s.header}><div style={s.headerInner}>
        <button style={s.backBtn} onClick={()=>setShowFollowers(false)}>← 戻る</button>
        <span style={s.headerTitle}>フォロワー</span><div style={{width:40}}/>
      </div></header>
      <div style={{padding:"12px 16px"}}>
        {followerList.length===0 && <div style={s.emptyMsg}>フォロワーがいません</div>}
        {followerList.map(u=>(
          <div key={u.userId} style={s.userListItem}>
            <button style={s.avatarBtn} onClick={()=>{setShowFollowers(false);setViewUser(u);}}>
              <div style={s.userListAvatar}>{u.avatar}</div>
            </button>
            <div style={{flex:1,cursor:"pointer"}} onClick={()=>{setShowFollowers(false);setViewUser(u);}}>
              <div style={s.userListName}>{u.user}</div>
              <div style={s.userListId}>@{u.userId}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── 他ユーザーページ ──
  if (viewUser) {
    const isFrozen    = frozenIds.has(viewUser.userId);
    const isFollowing = following.includes(viewUser.userId);
    const userPosts   = posts.filter(p=>p.userId===viewUser.userId&&p.scope!=="wall");
    return (
      <div style={s.root}>
        <header style={s.header}><div style={s.headerInner}>
          <button style={s.backBtn} onClick={()=>setViewUser(null)}>← 戻る</button>
          <span style={s.headerTitle}>tecco</span><div style={{width:40}}/>
        </div></header>
        {isFrozen && <div style={s.frozenBanner}>🔒 このアカウントは凍結されています</div>}
        <div style={s.userPageWrap}>
          <div style={s.userPageAvatar}>{viewUser.avatar}</div>
          <div style={s.myName}>{viewUser.user}</div>
          <div style={s.myUserId}>@{viewUser.userId}</div>
          <div style={s.myArea}>📍 {viewUser.area}</div>
          <div style={{display:"flex",gap:32,justifyContent:"center",marginTop:14}}>
            <div style={s.statItem}><div style={s.statNum}>{userPosts.length}</div><div style={s.statLabel}>投稿</div></div>
            <div style={s.statItem}><div style={s.statNum}>—</div><div style={s.statLabel}>フォロワー</div></div>
            <div style={s.statItem}><div style={s.statNum}>—</div><div style={s.statLabel}>フォロー中</div></div>
          </div>
          {viewUser.userId!==profile?.userId && (
            <button style={isFollowing?s.unfollowBtnLg:s.followBtn} onClick={()=>toggleFollow(viewUser.userId)}>
              {isFollowing?"フォロー中（解除）":"フォローする"}
            </button>
          )}
          {isAdmin && (
            <div style={{marginTop:10}}>
              {isFrozen
                ?<button style={s.adminUnfreezeBtn} onClick={()=>unfreezeUser(viewUser.userId)}>凍結を解除する</button>
                :<button style={s.adminFreezeBtn} onClick={()=>freezeUser(viewUser.userId)}>このアカウントを凍結する</button>}
            </div>
          )}
        </div>
        <div style={{padding:"12px 12px 24px"}}>
          {userPosts.length===0 && <div style={s.emptyMsg}>公開投稿がありません</div>}
          {userPosts.map(p=><PostCard key={p.id} {...pcp(p)}/>)}
        </div>
      </div>
    );
  }

  // ── 遊び場詳細 ──
  if (viewSpot) {
    const spot = spots.find(s=>s.id===viewSpot);
    const submitReview = () => {
      if (!spotReview.trim()) return;
      setSpots(prev=>prev.map(s=>s.id===viewSpot?{...s,reviews:[...s.reviews,{id:Date.now(),user:profile.name,avatar:profile.avatar,text:spotReview,time:"たった今"}]}:s));
      setSpotReview("");
    };
    return (
      <div style={s.root}>
        <header style={s.header}><div style={s.headerInner}>
          <button style={s.backBtn} onClick={()=>setViewSpot(null)}>← 戻る</button>
          <span style={s.headerTitle}>遊び場詳細</span><div style={{width:40}}/>
        </div></header>
        <div style={{padding:"16px 14px"}}>
          <div style={{background:C.white,borderRadius:16,padding:"18px",border:`1px solid ${C.border}`,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <span style={{fontSize:12,fontWeight:700,background:C.coralPale,color:C.coral,borderRadius:8,padding:"3px 10px"}}>
                {spot.type==="支援センター"?"🏡":spot.type==="室内遊び場"?"🎪":"🌳"} {spot.type}
              </span>
              <span style={{fontSize:11,color:C.textMuted}}>{spot.area}</span>
            </div>
            <div style={{fontWeight:800,fontSize:18,color:C.text,marginBottom:6}}>{spot.name}</div>
            <div style={{fontSize:13,color:C.textSub,marginBottom:8}}>📍 {spot.address}</div>
            <div style={{fontSize:13,color:C.text,lineHeight:1.6,background:C.beigeLight,borderRadius:10,padding:"10px 12px",marginBottom:12}}>{spot.memo}</div>
            <a href={spot.mapUrl} target="_blank" rel="noreferrer"
              style={{display:"block",textAlign:"center",padding:"11px",background:C.coral,color:C.white,borderRadius:12,fontSize:14,fontWeight:700,textDecoration:"none"}}>
              🗺️ Google マップで開く
            </a>
          </div>
          <div style={{fontWeight:700,fontSize:14,color:C.textSub,marginBottom:10}}>💬 クチコミ（{spot.reviews.length}件）</div>
          {spot.reviews.length===0 && <div style={s.emptyMsg}>まだクチコミがありません。最初の一件を書いてみてください！</div>}
          {spot.reviews.map(r=>(
            <div key={r.id} style={{background:C.white,borderRadius:14,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:C.coralPale,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,border:`1.5px solid ${C.coralLight}`}}>{r.avatar}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:12,color:C.text}}>{r.user}</div>
                  <div style={{fontSize:11,color:C.textMuted}}>{r.time}</div>
                </div>
              </div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.55}}>{r.text}</div>
            </div>
          ))}
          <div style={{...s.commentInputRow,marginTop:12}}>
            <input style={s.commentInput} placeholder="クチコミを書く…" value={spotReview}
              onChange={e=>setSpotReview(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submitReview()}/>
            <button style={s.commentSendBtn} onClick={submitReview}>投稿</button>
          </div>
        </div>
      </div>
    );
  }

  // ── メイン ──
  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.headerInner}>
          {/* 左：ベルアイコン（通知） */}
          <button style={{background:"none",border:"none",cursor:"pointer",position:"relative",padding:4,display:"flex",alignItems:"center"}}
            onClick={()=>{setTab("notif");setSeenNotif(true);setTagSearch(null);}}>
            <span style={{fontSize:22}}>🔔</span>
            {notifBadge>0 && (
              <span style={{position:"absolute",top:0,right:0,background:C.red,color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,minWidth:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",lineHeight:1}}>
                {notifBadge>99?"99+":notifBadge}
              </span>
            )}
          </button>
          <span style={s.headerTitle}>tecco</span>
          <div style={s.headerRight}>
            {isAdmin && <span style={s.adminBadge}>⚙️ 管理者</span>}
          </div>
        </div>
      </header>

      {tagSearch && (
        <div style={s.tagBanner}>
          <span>🔍 #{tagSearch} の投稿</span>
          <button style={s.tagBannerBtn} onClick={()=>setTagSearch(null)}>✕ 解除</button>
        </div>
      )}

      <nav style={s.tabNav}>
        {[
          {key:"timeline", label:"HOME",    badge:timelineBadge},
          {key:"area",     label:"地域",    badge:0},
          {key:"age",      label:"月齢",    badge:0},
          {key:"board",    label:"掲示板",  badge:boardBadge},
          {key:"spots",    label:"遊び場",  badge:0},
          {key:"mypage",   label:"マイページ", badge:0},
        ].map(t=>(
          <button key={t.key} onClick={()=>{
            setTab(t.key);setTagSearch(null);
            if (t.key==="timeline") setLastSeenTimeline(Date.now());
            if (t.key==="board") setLastSeenBoard(Date.now());
          }}
            style={{...s.tabBtn,...(tab===t.key?s.tabActive:{}),position:"relative"}}>
            {t.label}
            {t.badge>0 && (
              <span style={{position:"absolute",top:4,right:2,background:C.red,color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,minWidth:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",lineHeight:1}}>
                {t.badge>99?"99+":t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {tab==="area"&&!tagSearch&&(
        <div style={s.filterBar}>
          <select style={s.select} value={filterArea} onChange={e=>setFilterArea(e.target.value)}>
            {FILTER_AREAS.map(a=><option key={a}>{a}</option>)}
          </select>
          <div style={s.hint}>県央／県北／県南／沿岸／県外でしぼり込み</div>
        </div>
      )}
      {tab==="age"&&!tagSearch&&(
        <div style={s.filterBar}>
          <select style={s.select} value={filterAge} onChange={e=>setFilterAge(e.target.value)}>
            {AGE_GROUPS.map(a=><option key={a}>{a}</option>)}
          </select>
          <div style={s.hint}>妊娠中〜高校生まで選べます</div>
        </div>
      )}

      <main style={s.main}>
        {(tab==="timeline"||tab==="area"||tab==="age"||tagSearch) && (
          <>
            {visiblePosts.length===0 && <div style={s.emptyMsg}>投稿がありません</div>}
            {visiblePosts.map(p=><PostCard key={p.id} {...pcp(p)}/>)}
          </>
        )}

        {tab==="spots"&&!tagSearch && (
          <>
            <div style={{fontSize:13,color:C.textSub,marginBottom:8,lineHeight:1.6}}>
              🗺️ 岩手県内の支援センター・遊び場・勉強スペースの情報です。クチコミもぜひ書いてください！<br/>
              <span style={{fontSize:12,color:C.textMuted}}>📚 勉強スペースは中高生向けの自習・学習できる場所をまとめています。</span>
            </div>
            {/* 管理者：新規スポット追加ボタン */}
            {isAdmin && (
              <button style={{...s.addChildBtn,marginBottom:12}}
                onClick={()=>setEditingSpot({id:Date.now(),name:"",type:"支援センター",area:"県央",address:"",memo:"",mapUrl:"",reviews:[],isNew:true})}>
                ＋ 遊び場・スポットを追加する
              </button>
            )}
            {/* エリアフィルタ */}
            <div style={s.spotFilterBar}>
              {["すべて",...AREAS].map(a=>(
                <button key={a} style={{...s.spotFilterBtn,background:spotArea===a?C.coral:C.white,borderColor:spotArea===a?C.coral:C.border,color:spotArea===a?C.white:C.textSub}}
                  onClick={()=>setSpotArea(a)}>{a}</button>
              ))}
            </div>
            {/* 種別フィルタ */}
            <div style={s.spotFilterBar}>
              {SPOT_TYPES.map(t=>(
                <button key={t} style={{...s.spotFilterBtn,background:spotType===t?C.purple:C.white,borderColor:spotType===t?C.purple:C.border,color:spotType===t?C.white:C.textSub}}
                  onClick={()=>setSpotType(t)}>{t}</button>
              ))}
            </div>
            {/* スポットカード */}
            {spots
              .filter(sp=>(spotArea==="すべて"||sp.area===spotArea)&&(spotType==="すべて"||sp.type===spotType))
              .map(sp=>{
                const isOpen = openSpotId===sp.id;
                return (
                  <div key={sp.id}
                    style={{...(isOpen?s.spotCardOpen:s.spotCard), cursor:"pointer"}}
                    onClick={()=>setOpenSpotId(isOpen?null:sp.id)}>
                    <div style={s.spotTop}>
                      <div style={s.spotName}>{sp.name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={s.spotTypeBadge}>{sp.type}</span>
                        {isAdmin && (
                          <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                            <button style={{background:"none",border:"none",fontSize:12,color:C.textSub,cursor:"pointer",fontWeight:700}}
                              onClick={()=>openEditSpot(sp)}>✏️</button>
                            <button style={{background:"none",border:"none",fontSize:12,color:C.red,cursor:"pointer",fontWeight:700}}
                              onClick={()=>deleteSpot(sp.id)}>🗑️</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={s.spotArea}>📍 {sp.area}</div>
                    <div style={s.spotAddress}>🏠 {sp.address}</div>
                    <div style={{fontSize:12,color:C.coral,fontWeight:600,marginBottom:isOpen?8:0}}>
                      💬 クチコミ {sp.reviews.length}件 {isOpen?"▲":"▼"}
                    </div>
                    {isOpen && (
                      <div onClick={e=>e.stopPropagation()}>
                        <div style={s.spotMemo}>💡 {sp.memo}</div>
                        <button style={s.spotMapBtn} onClick={()=>window.open(sp.mapUrl,"_blank")}>
                          🗺️ Google マップで開く
                        </button>
                        <div style={s.spotReviewTitle}>みんなのクチコミ</div>
                        {sp.reviews.length===0 && <div style={{fontSize:13,color:C.textMuted,marginBottom:8}}>まだクチコミがありません。最初の一言を！</div>}
                        {sp.reviews.map(r=>(
                          <div key={r.id} style={s.spotReviewItem}>
                            <div style={{...s.commentAvatar,fontSize:14}}>{r.avatar}</div>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:700,fontSize:12,color:C.text}}>{r.user}</div>
                              <div style={s.spotReviewText}>{r.text}</div>
                              <div style={s.spotReviewTime}>{r.time}</div>
                            </div>
                          </div>
                        ))}
                        <div style={s.commentInputRow}>
                          <input style={s.commentInput} placeholder="クチコミを書く…"
                            value={spotReviewText}
                            onChange={e=>setSpotReviewText(e.target.value)}
                            onKeyDown={e=>e.key==="Enter"&&submitSpotReview(sp.id)}/>
                          <button style={s.commentSendBtn} onClick={()=>submitSpotReview(sp.id)}>投稿</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            {spots.filter(sp=>(spotArea==="すべて"||sp.area===spotArea)&&(spotType==="すべて"||sp.type===spotType)).length===0 &&
              <div style={s.emptyMsg}>この条件のスポットはまだありません</div>}
          </>
        )}

        {tab==="notif" && (
          <>
            <div style={s.secTitle}>🔔 通知</div>
            {newFollowers.length===0 && (
              <div style={s.emptyMsg}>まだ通知はありません</div>
            )}
            {newFollowers.map((uid,i)=>{
              const u = allKnownUsers.find(x=>x.userId===uid);
              if (!u) return null;
              return (
                <div key={i} style={{...s.userListItem, background:C.white, borderRadius:12, padding:"12px 14px", marginBottom:8, border:`1px solid ${C.border}`}}>
                  <div style={s.userListAvatar}>{u.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={s.userListName}>{u.user}</div>
                    <div style={{fontSize:12,color:C.textMuted}}>@{u.userId} さんがフォローしました</div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab==="board"&&!tagSearch && (
          <>
            <div style={s.boardNotice}>🔒 掲示板はアカウントと紐付かない匿名投稿です。</div>
            <div style={s.boardCatBar}>
              {BOARD_CATS.map(c=>(
                <button key={c} style={{...s.boardCatBtn,background:boardCat===c?C.purplePale:C.white,borderColor:boardCat===c?C.purple:C.border,color:boardCat===c?C.purple:C.textSub}}
                  onClick={()=>setBoardCat(c)}>{c}</button>
              ))}
            </div>
            {filteredBoards.length===0 && <div style={s.emptyMsg}>この分類の投稿はまだありません</div>}
            {filteredBoards.map(b=>(
              <div key={b.id} style={s.boardCard}>
                <div style={s.boardTop}>
                  <span style={s.boardBadge} onClick={()=>setBoardCat(b.category)}>{BOARD_ICONS[b.category]||"💬"} {b.category}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={s.boardTime}>{b.time}</span>
                    {isAdmin && (
                      <button style={{background:"none",border:"none",fontSize:12,color:C.red,cursor:"pointer",fontWeight:700}}
                        onClick={()=>deleteBoard(b.id)}>🗑️</button>
                    )}
                  </div>
                </div>
                <p style={s.boardContent}>{b.content}</p>
                <button style={s.boardReplyBtn} onClick={()=>setOpenBoardId(openBoardId===b.id?null:b.id)}>
                  💬 {b.comments.length}件の返信 {openBoardId===b.id?"▲":"▼"}
                </button>
                {openBoardId===b.id && (
                  <div style={s.commentSection}>
                    {b.comments.map(c=>(
                      <div key={c.id} style={s.anonRow}>
                        <span style={{fontSize:18}}>🙈</span>
                        <div style={{flex:1}}>
                          <div style={s.commentText}>{c.text}</div>
                          <div style={s.commentTime}>{c.time}</div>
                        </div>
                      </div>
                    ))}
                    <div style={s.commentInputRow}>
                      <input style={s.commentInput} placeholder="匿名で返信する…" value={boardCommentText}
                        onChange={e=>setBoardCommentText(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&submitBoardComment(b.id)}/>
                      <button style={s.commentSendBtn} onClick={()=>submitBoardComment(b.id)}>送信</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {tab==="spots"&&!tagSearch && (
          <>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <select style={{...s.select,flex:1}} value={spotArea} onChange={e=>setSpotArea(e.target.value)}>
                {FILTER_AREAS.map(a=><option key={a}>{a}</option>)}
              </select>
              <select style={{...s.select,flex:1}} value={spotType} onChange={e=>setSpotType(e.target.value)}>
                {SPOT_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            {spots
              .filter(sp=>(spotArea==="全域"||sp.area===spotArea)&&(spotType==="すべて"||sp.type===spotType))
              .map(sp=>(
                <div key={sp.id} style={{...s.card,cursor:"pointer"}} onClick={()=>setViewSpot(sp.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,background:C.coralPale,color:C.coral,borderRadius:8,padding:"3px 10px"}}>
                      {sp.type==="支援センター"?"🏡":sp.type==="室内遊び場"?"🎪":"🌳"} {sp.type}
                    </span>
                    <span style={{fontSize:11,color:C.textMuted}}>📍{sp.area}</span>
                  </div>
                  <div style={{fontWeight:800,fontSize:15,color:C.text,marginBottom:4}}>{sp.name}</div>
                  <div style={{fontSize:12,color:C.textSub,marginBottom:6}}>{sp.address}</div>
                  <div style={{fontSize:13,color:C.textSub,lineHeight:1.5}}>{sp.memo}</div>
                  <div style={{fontSize:12,color:C.purple,marginTop:8,fontWeight:600}}>💬 クチコミ {sp.reviews.length}件 →</div>
                </div>
              ))}
            <div style={{...s.boardNotice,marginTop:8}}>
              📍 掲載してほしい場所はフィードバックから教えてください！
            </div>
          </>
        )}

        {tab==="mypage"&&!tagSearch && (
          <>
            <div style={s.myCard}>
              <div style={s.myAvatarBox}>{profile.avatar}</div>
              <div style={{flex:1}}>
                <div style={s.myName}>{profile.name}</div>
                <div style={s.myUserId}>@{profile.userId}</div>
                <div style={s.myArea}>📍 {profile.area}</div>
                <div style={s.myBio}>{profile.bio||"自己紹介がまだありません"}</div>
              </div>
              <button style={s.editProfBtn} onClick={openEditProf}>編集</button>
            </div>
            <div style={s.stats}>
              <div style={s.statItem}><div style={s.statNum}>{myPosts.length}</div><div style={s.statLabel}>投稿</div></div>
              <div style={s.statItem} onClick={()=>setShowFollowers(true)}><div style={s.statNum}>{followerList.length}</div><div style={s.statLabel}>フォロワー</div></div>
              <div style={s.statItem} onClick={()=>setShowFollowing(true)}><div style={s.statNum}>{following.length}</div><div style={s.statLabel}>フォロー中</div></div>
            </div>
            <div style={{...s.secTitle,marginTop:16}}>👶 子ども情報</div>
            {profile.children.map(c=>(
              <div key={c.id} style={s.childCard}>
                <span style={{fontSize:24}}>👶</span>
                <div style={{flex:1}}><div style={s.childName}>{c.name}</div><div style={s.childSub}>{c.age} / {c.gender}</div></div>
                <button style={s.editChildBtn} onClick={()=>openEditChild(c)}>編集</button>
              </div>
            ))}
            <button style={s.addChildBtn} onClick={openAddChild}>＋ 子どもを追加</button>
            <div style={s.secTitle}>📝 自分の投稿</div>
            {myPosts.length===0 && <div style={s.emptyMsg}>まだ投稿がありません</div>}
            {myPosts.map(p=><PostCard key={p.id} {...pcp(p)}/>)}
            <div style={{...s.secTitle,marginTop:20}}>💌 要望・フィードバック</div>
            <div style={s.reportSection}>
              <div style={s.reportTitle}>teccoへのご意見・改善要望</div>
              <textarea style={s.feedbackArea} rows={4} placeholder="機能のご要望、使いにくかった点など、なんでもお気軽にどうぞ"
                value={feedbackText} onChange={e=>setFeedbackText(e.target.value)}/>
              <button style={s.feedbackBtn} onClick={submitFeedback}>送信する</button>
              {feedbackSent && <div style={s.successMsg}>✅ 送信しました！ありがとうございます。</div>}
            </div>
            <div style={{...s.secTitle,marginTop:8}}>💝 teccoを応援する</div>
            <div style={s.donateSection}>
              <div style={s.donateTitle}>teccoを応援する</div>
              <div style={s.donateDesc}>teccoは岩手のパパママのために<br/>有志で運営しています。<br/>ご支援いただけると嬉しいです🍀</div>
              <button style={s.donateBtn} onClick={()=>alert("準備中です。ありがとうございます！💝")}>💝 寄付する</button>
            </div>
            {isAdmin && (
              <>
                <div style={{...s.secTitle,marginTop:8}}>⚙️ 管理者パネル</div>
                <div style={s.adminPanel}>
                  <div style={s.adminTitle}>ユーザー管理（{users.length}名登録）</div>
                  {users.map(u=>(
                    <div key={u.userId} style={s.adminUserRow}>
                      <span style={{fontSize:20}}>{u.avatar}</span>
                      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:C.text}}>{u.name}</div><div style={{fontSize:11,color:C.textMuted}}>@{u.userId}</div></div>
                      {frozenIds.has(u.userId)
                        ?<button style={s.adminUnfreezeBtn} onClick={()=>unfreezeUser(u.userId)}>凍結解除</button>
                        :<button style={s.adminFreezeBtn} onClick={()=>freezeUser(u.userId)}>凍結</button>}
                    </div>
                  ))}
                  {users.length===0 && <div style={{fontSize:13,color:C.textMuted}}>まだ登録ユーザーがいません</div>}
                </div>
                <div style={s.adminPanel}>
                  <div style={s.adminTitle}>通報一覧（{reports.length}件）</div>
                  {reports.length===0 && <div style={{fontSize:13,color:C.textMuted}}>通報はありません</div>}
                  {reports.map(r=><div key={r.id} style={{fontSize:13,padding:"6px 0",borderBottom:"1px solid #FFF3C4"}}>🚩 <strong>{r.userName}</strong> の投稿 — {r.time}</div>)}
                </div>
                <div style={s.adminPanel}>
                  <div style={s.adminTitle}>フィードバック（{feedbacks.length}件）</div>
                  {feedbacks.length===0 && <div style={{fontSize:13,color:C.textMuted}}>フィードバックはありません</div>}
                  {feedbacks.map(f=><div key={f.id} style={{fontSize:13,padding:"8px 0",borderBottom:"1px solid #FFF3C4",lineHeight:1.5}}>💌 {f.text} <span style={{color:C.textMuted}}>— {f.time}</span></div>)}
                </div>
              </>
            )}
            <button style={s.logoutBtn} onClick={handleLogout}>ログアウト</button>
            <div style={{height:8}}/>
          </>
        )}
      </main>

      {tab!=="spots" && <button style={s.fab} onClick={()=>tab==="board"?setBoardComposing(true):setComposing(true)}>＋ 投稿する</button>}

      {composing && (
        <Overlay onClose={()=>setComposing(false)}>
          <div style={s.modalHeader}>
            <button style={s.closeBtn} onClick={()=>setComposing(false)}>✕</button>
            <span style={s.modalTitle}>つぶやく</span>
            <button style={{...s.postBtn,opacity:draftText.trim()?1:0.4}} onClick={submitPost}>投稿</button>
          </div>
          <div style={s.composeUser}>
            <div style={s.composeAvatar}>{profile.avatar}</div>
            <div><div style={s.composeUserName}>{profile.name}</div><div style={s.composeUserSub}>@{profile.userId} · 📍{profile.area}</div></div>
          </div>
          <textarea style={s.textarea} autoFocus rows={5} maxLength={280}
            placeholder="今どんな気持ち？岩手のみんなに話してみよう☁️"
            value={draftText} onChange={e=>setDraftText(e.target.value)}/>
          <div style={s.divider}/>
          <div style={s.sectionPad}>
            <div style={s.subLabel}>📢 公開範囲</div>
            <div style={s.scopeCards}>
              {["all","wall","followers"].map(sc=>(
                <button key={sc} onClick={()=>setDraftScope(sc)}
                  style={{...s.scopeCard,borderColor:draftScope===sc?SC_COLOR[sc]:C.border,background:draftScope===sc?SC_COLOR[sc]+"18":C.white}}>
                  <div style={{...s.scopeTitle,color:draftScope===sc?SC_COLOR[sc]:C.textSub}}>{SC_LONG[sc]}</div>
                  <div style={s.scopeDesc}>{SC_DESC[sc]}</div>
                </button>
              ))}
            </div>
          </div>
          <div style={s.divider}/>
          <div style={s.sectionPad}>
            <div style={s.subLabel}>🏷️ タグ（最大5個）</div>
            <div style={s.tagInputRow}>
              <input style={s.tagInput} placeholder="例：夜泣き" value={draftTag}
                onChange={e=>setDraftTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()}/>
              <button style={s.tagAddBtn} onClick={addTag}>追加</button>
            </div>
            <div style={s.tagRow}>
              {draftTags.map(t=>(
                <span key={t} style={s.tagChip}>#{t}
                  <button style={s.tagRemove} onClick={()=>setDraftTags(p=>p.filter(x=>x!==t))}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div style={s.charCount}>{draftText.length} / 280</div>
        </Overlay>
      )}

      {boardComposing && (
        <Overlay onClose={()=>setBoardComposing(false)}>
          <div style={s.modalHeader}>
            <button style={s.closeBtn} onClick={()=>setBoardComposing(false)}>✕</button>
            <span style={s.modalTitle}>匿名で書き込む</span>
            <button style={{...s.postBtn,opacity:boardDraftText.trim()?1:0.4}} onClick={submitBoard}>投稿</button>
          </div>
          <div style={s.sectionPad}>
            <div style={s.boardNotice}>🔒 この投稿はアカウントと紐付きません</div>
            <div style={s.subLabel}>カテゴリ</div>
            <div style={s.radioRow}>
              {BOARD_CATS.filter(c=>c!=="すべて").map(c=>(
                <button key={c} onClick={()=>setBoardDraftCat(c)}
                  style={{...s.radioBtn,background:boardDraftCat===c?C.purplePale:C.white,borderColor:boardDraftCat===c?C.purple:C.border,color:boardDraftCat===c?C.purple:C.textSub}}>{c}</button>
              ))}
            </div>
            <div style={{...s.subLabel,marginTop:14}}>内容</div>
            <textarea style={{...s.textarea,border:`1.5px solid ${C.purplePale}`,borderRadius:10,background:"#FAFAFF"}}
              rows={5} maxLength={500} placeholder="悩みや相談を書いてください…"
              value={boardDraftText} onChange={e=>setBoardDraftText(e.target.value)}/>
          </div>
          <div style={{height:16}}/>
        </Overlay>
      )}

      {editProf&&profDraft && (
        <Overlay onClose={()=>setEditProf(false)} scrollable>
          <div style={s.modalHeader}>
            <button style={s.closeBtn} onClick={()=>setEditProf(false)}>✕</button>
            <span style={s.modalTitle}>プロフィール編集</span>
            <button style={s.postBtn} onClick={saveProf}>保存</button>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>アイコン</div>
            <div style={s.avatarPicker}>
              {AVATARS.map(av=>(
                <button key={av} onClick={()=>setProfDraft(p=>({...p,avatar:av}))}
                  style={{...s.avatarOpt,background:profDraft.avatar===av?C.coralPale:"#f8fafc",border:profDraft.avatar===av?`2px solid ${C.coral}`:"2px solid transparent"}}>{av}</button>
              ))}
            </div>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>ニックネーム</div>
            <input style={s.formInput} value={profDraft.name} onChange={e=>setProfDraft(p=>({...p,name:e.target.value}))}/>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>地域</div>
            <select style={s.select} value={profDraft.area} onChange={e=>setProfDraft(p=>({...p,area:e.target.value}))}>
              {AREAS.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>自己紹介</div>
            <textarea rows={3} style={{...s.textarea,border:`1.5px solid ${C.border}`,borderRadius:10,background:C.coralPale}}
              value={profDraft.bio} onChange={e=>setProfDraft(p=>({...p,bio:e.target.value}))} placeholder="育児のこと、趣味、なんでも"/>
          </div>
          <div style={{height:20}}/>
        </Overlay>
      )}

      {childMode&&childDraft && (
        <Overlay onClose={()=>setChildMode(null)}>
          <div style={s.modalHeader}>
            <button style={s.closeBtn} onClick={()=>setChildMode(null)}>✕</button>
            <span style={s.modalTitle}>{childMode==="new"?"子どもを追加":"子ども情報を編集"}</span>
            <button style={s.postBtn} onClick={saveChild}>保存</button>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>名前（ニックネームでOK）</div>
            <input style={s.formInput} value={childDraft.name} onChange={e=>setChildDraft(c=>({...c,name:e.target.value}))} placeholder="例：はると"/>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>月齢・年齢</div>
            <select style={s.select} value={childDraft.age} onChange={e=>setChildDraft(c=>({...c,age:e.target.value}))}>
              {CHILD_AGES.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>性別</div>
            <div style={s.radioRow}>
              {["女の子","男の子","回答しない"].map(g=>(
                <button key={g} onClick={()=>setChildDraft(c=>({...c,gender:g}))}
                  style={{...s.radioBtn,background:childDraft.gender===g?C.coralPale:C.white,borderColor:childDraft.gender===g?C.coral:C.border,color:childDraft.gender===g?C.coral:C.textSub}}>{g}</button>
              ))}
            </div>
          </div>
          {childMode==="edit" && <button style={s.deleteBtn} onClick={deleteChild}>この子の情報を削除する</button>}
          <div style={{height:16}}/>
        </Overlay>
      )}

      {/* 遊び場編集モーダル（管理者のみ） */}
      {editingSpot && (
        <Overlay onClose={()=>setEditingSpot(null)} scrollable>
          <div style={s.modalHeader}>
            <button style={s.closeBtn} onClick={()=>setEditingSpot(null)}>✕</button>
            <span style={s.modalTitle}>{editingSpot.isNew?"スポットを追加":"遊び場を編集"}</span>
            <button style={s.postBtn} onClick={saveSpot}>保存</button>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>名前</div>
            <input style={s.formInput} value={editingSpot.name}
              onChange={e=>setEditingSpot(p=>({...p,name:e.target.value}))}/>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>種別</div>
            <div style={s.radioRow}>
              {["支援センター","室内遊び場","公園","勉強スペース"].map(t=>(
                <button key={t} onClick={()=>setEditingSpot(p=>({...p,type:t}))}
                  style={{...s.radioBtn,background:editingSpot.type===t?C.coralPale:C.white,borderColor:editingSpot.type===t?C.coral:C.border,color:editingSpot.type===t?C.coral:C.textSub}}>{t}</button>
              ))}
            </div>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>エリア</div>
            <select style={s.select} value={editingSpot.area}
              onChange={e=>setEditingSpot(p=>({...p,area:e.target.value}))}>
              {AREAS.map(a=><option key={a}>{a}</option>)}
            </select>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>住所</div>
            <input style={s.formInput} value={editingSpot.address}
              onChange={e=>setEditingSpot(p=>({...p,address:e.target.value}))}/>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>メモ</div>
            <textarea rows={3} style={{...s.textarea,border:`1.5px solid ${C.border}`,borderRadius:10,background:C.coralPale}}
              value={editingSpot.memo}
              onChange={e=>setEditingSpot(p=>({...p,memo:e.target.value}))}/>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>Google マップURL</div>
            <input style={s.formInput} value={editingSpot.mapUrl}
              onChange={e=>setEditingSpot(p=>({...p,mapUrl:e.target.value}))}/>
          </div>
          <div style={{height:20}}/>
        </Overlay>
      )}
    </div>
  );
}

export default App;