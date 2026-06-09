import { useState, useEffect } from "react";
import { supabase } from "./supabase";


// ════════════════════════════════════════
// デザイントークン
// ════════════════════════════════════════

const C = {
  coral:"#F5C97A", coralLight:"#F7D88B", coralPale:"#FEF7E6", coralBg:"#FEFBF0",
  white:"#FFFFFF", beige:"#F7F2EE", beigeLight:"#FAF7F4", border:"#EDE5DF",
  text:"#3D2E28", textSub:"#8C7B74", textMuted:"#B5A8A2",
  purple:"#7C6FF7", purplePale:"#EDEBFE",
  green:"#5CB98A", greenPale:"#E8F7EF",
  red:"#E05252", redPale:"#FEECEC",
};


// ════════════════════════════════════════
// 定数
// ════════════════════════════════════════

const AREAS        = ["県央","県北","県南","沿岸","県外"];
const FILTER_AREAS = ["全域",...AREAS];
const AGE_GROUPS   = ["全員","妊婦","0〜6ヶ月","6〜12ヶ月","1〜2歳","3〜6歳（園児期）","小学校低学年","小学校高学年","中学生","高校生"];
const CHILD_AGES   = ["妊娠中","0〜6ヶ月","6〜12ヶ月","1〜2歳","3〜6歳","小学校低学年","小学校高学年","中学生","高校生"];
const AVATARS      = ["🌸","🌻","🍀","🐟","🌺","🌷","🦋","🐣","🌼","🍓","🐨","🌙"];
const BOARD_CATS   = ["すべて","育児相談","発達・先天障害","妊活・産院","仕事と育児","習い事・受験","マイホーム","家族問題","その他"];
const BOARD_ICONS  = {"育児相談":"💬","発達・先天障害":"🌈","妊活・産院":"🌷","仕事と育児":"💼","習い事・受験":"✏️","マイホーム":"🏠","家族問題":"👨‍👩‍👧","その他":"📝"};
const ADMIN_ID     = "admin";
const OFFICIAL_ID  = "tecco_official";
const SPOT_TYPES   = ["すべて","支援センター","室内遊び場","公園","勉強スペース","その他"];

// 月齢フィルター用マッピング（フィルター選択値 → 投稿の childAges に含まれうる文字列）
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

// 公開範囲の表示設定
const SC_COLOR = {all:C.green, wall:C.coral, followers:C.purple};
const SC_SHORT = {all:"🌍 全員", wall:"🪞 自分のみ", followers:"👥 フォロワー"};
const SC_LONG  = {all:"🌍 全員に公開", wall:"🪞 自分のみ（自分のみ）", followers:"👥 フォロワーのみ"};
const SC_DESC  = {all:"すべてのユーザーに表示", wall:"自分だけが見られる日記", followers:"フォロワーだけに表示"};


// ════════════════════════════════════════
// スタイル
// ════════════════════════════════════════

const s = {
  // ── 認証画面 ──
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
  authNote:{textAlign:"center",fontSize:11,color:C.textMuted,marginTop:12},
  // ── 同意チェックボックス ──
  checkRow:{display:"flex",alignItems:"flex-start",gap:10,margin:"8px 0",cursor:"pointer"},
  checkBox:{width:20,height:20,borderRadius:5,border:`2px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1},
  checkBoxOn:{width:20,height:20,borderRadius:5,border:`2px solid ${C.coral}`,background:C.coral,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1},
  checkLabel:{fontSize:13,color:C.text,lineHeight:1.5},
  checkLink:{color:C.coral,fontWeight:700,textDecoration:"underline",cursor:"pointer"},
  // ── 利用規約・PPモーダル ──
  termsOverlay:{position:"fixed",inset:0,background:"rgba(50,30,20,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
  termsSheet:{background:C.white,borderRadius:20,width:"100%",maxWidth:440,maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden"},
  termsHeader:{padding:"16px 20px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0},
  termsTitle:{fontWeight:800,fontSize:16,color:C.text},
  termsBody:{padding:"16px 20px",overflowY:"auto",flex:1,fontSize:13,color:C.text,lineHeight:1.8},
  termsFooter:{padding:"12px 20px 20px",borderTop:`1px solid ${C.border}`,flexShrink:0},
  termsAgreeBtn:{display:"block",width:"100%",padding:"12px",background:C.coral,color:C.white,border:"none",borderRadius:12,fontSize:14,fontWeight:800,cursor:"pointer"},
  termsSectionTitle:{fontWeight:700,fontSize:14,color:C.coral,margin:"16px 0 6px"},
  // ── メイン画面レイアウト ──
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
  // ── 投稿カード ──
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
  content:{fontSize:14,color:C.text,lineHeight:1.7,margin:"0 0 10px",whiteSpace:"pre-wrap"},
  tagRow:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10},
  tagBtn:{background:"none",border:"none",fontSize:12,color:C.purple,fontWeight:700,cursor:"pointer",padding:0},
  actions:{display:"flex",gap:2,alignItems:"center",borderTop:`1px solid ${C.border}`,paddingTop:8,marginTop:2},
  actionBtn:{background:"none",border:"none",fontSize:13,color:C.textSub,padding:"4px 8px",borderRadius:8,cursor:"pointer",fontWeight:600},
  menuBtn:{background:"none",border:"none",fontSize:12,color:C.textMuted,padding:"4px 8px",borderRadius:8,cursor:"pointer",marginLeft:"auto"},
  inlineMenu:{position:"absolute",right:12,top:56,background:C.white,borderRadius:12,boxShadow:"0 4px 20px rgba(0,0,0,0.12)",border:`1px solid ${C.border}`,zIndex:50,minWidth:150,overflow:"hidden"},
  menuItem:{display:"block",width:"100%",padding:"11px 16px",background:"none",border:"none",textAlign:"left",fontSize:13,cursor:"pointer",color:C.text},
  menuItemDanger:{display:"block",width:"100%",padding:"11px 16px",background:"none",border:"none",textAlign:"left",fontSize:13,cursor:"pointer",color:C.red},
  // ── コメント ──
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
  // ── 投稿ボタン・オーバーレイ ──
  fab:{position:"fixed",bottom:"42%",right:20,height:56,borderRadius:28,background:C.coral,border:"none",fontSize:15,fontWeight:800,boxShadow:`0 4px 16px ${C.coral}66`,cursor:"pointer",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,gap:8,padding:"0 26px"},
  overlayBg:{position:"fixed",inset:0,background:"rgba(50,30,20,0.40)",zIndex:300,display:"flex",alignItems:"flex-end"},
  modalSheet:{width:"100%",maxWidth:480,margin:"0 auto",background:C.white,borderRadius:"20px 20px 0 0",paddingBottom:8},
  modalHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 12px",borderBottom:`1px solid ${C.border}`},
  modalTitle:{fontWeight:800,fontSize:16,color:C.text},
  closeBtn:{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.textMuted,padding:4},
  postBtn:{background:C.coral,color:C.white,border:"none",borderRadius:20,padding:"8px 22px",fontWeight:800,fontSize:14,cursor:"pointer"},
  // ── 投稿フォーム ──
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
  // ── 掲示板 ──
  boardCatBar:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12},
  boardCatBtn:{padding:"6px 13px",borderRadius:20,border:"1.5px solid",fontSize:12,fontWeight:700,cursor:"pointer"},
  boardNotice:{background:"#FFF8E6",color:"#7A5C00",borderRadius:12,padding:"10px 14px",fontSize:12,lineHeight:1.6,marginBottom:12,border:"1px solid #FFE49A"},
  boardCard:{background:C.white,borderRadius:16,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.purplePale}`,boxShadow:"0 1px 6px rgba(0,0,0,0.04)"},
  boardTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8},
  boardBadge:{fontSize:12,fontWeight:700,background:C.purplePale,color:C.purple,borderRadius:8,padding:"3px 10px",cursor:"pointer"},
  boardTime:{fontSize:11,color:C.textMuted},
  boardContent:{fontSize:14,color:C.text,lineHeight:1.65,margin:"0 0 8px",whiteSpace:"pre-wrap"},
  boardReplyBtn:{background:"none",border:"none",fontSize:12,color:C.purple,fontWeight:600,cursor:"pointer",padding:0},
  // ── マイページ ──
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
  // ── ユーザー一覧・他ユーザーページ ──
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
  // ── 管理者パネル ──
  adminPanel:{background:C.white,borderRadius:16,padding:"14px 16px",marginBottom:10,border:"2px solid #FFE49A"},
  adminTitle:{fontWeight:800,fontSize:15,color:"#7A5C00",marginBottom:10},
  adminUserRow:{display:"flex",gap:8,alignItems:"center",padding:"8px 0",borderBottom:"1px solid #FFF3C4"},
  adminFreezeBtn:{background:C.redPale,border:`1px solid ${C.red}44`,color:C.red,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",marginLeft:"auto"},
  adminUnfreezeBtn:{background:C.greenPale,border:`1px solid ${C.green}44`,color:C.green,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer",marginLeft:"auto"},
  // ── フィードバック・フォーム共通 ──
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
  // ── 寄付セクション ──
  donateSection:{background:`linear-gradient(135deg,${C.coralPale},#FFF8E6)`,borderRadius:16,padding:"20px",marginBottom:10,border:`1px solid ${C.coralLight}`,textAlign:"center"},
  donateTitle:{fontWeight:800,fontSize:16,color:C.coral,marginBottom:6},
  donateDesc:{fontSize:13,color:C.textSub,lineHeight:1.6,marginBottom:14},
  donateBtn:{display:"inline-block",padding:"12px 32px",background:C.coral,color:C.white,border:"none",borderRadius:20,fontSize:15,fontWeight:800,cursor:"pointer"},
  // ── 遊び場タブ ──
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


// ════════════════════════════════════════
// 共通コンポーネント
// ════════════════════════════════════════

// 画面下から出るモーダルの共通ラッパー
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

// タイムライン・ユーザーページで使う投稿カード
function PostCard({post,liked,disliked,onLike,onDislike,onUserClick,onTagClick,isOpen,onToggleComments,commentText,onCommentChange,onCommentSubmit,onDelete,onDeleteComment,onReport,isAdmin,isMine,profileUserId,onPin,isPinned}) {
  const [menuOpen,setMenuOpen] = useState(false);
  const uInfo = {user:post.user,userId:post.userId,avatar:post.avatar,area:post.area};
  return (
    <div style={s.card}>
      {menuOpen && (
        <div style={s.inlineMenu}>
          {(isMine||isAdmin) && <button style={s.menuItemDanger} onClick={()=>{onDelete(post.id);setMenuOpen(false);}}>🗑️ 削除する</button>}
          {!isMine && <button style={s.menuItem} onClick={()=>{onReport(post.id,post.user);setMenuOpen(false);}}>🚩 通報する</button>}
          {isMine && (
            <button style={s.menuItem} onClick={()=>{onPin(post.id);setMenuOpen(false);}}>
              {isPinned?"📌 固定を解除":"📌 マイページに固定"}
            </button>
          )}
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
      {post.imageUrl && (
      <img src={post.imageUrl} alt="投稿画像"
      style={{width:"100%",borderRadius:10,maxHeight:300,objectFit:"cover",marginBottom:10}}/>
       )}
      {post.tags.length>0 && (
        <div style={s.tagRow}>
          {post.tags.map(t=><button key={t} style={s.tagBtn} onClick={()=>onTagClick(t)}>#{t}</button>)}
        </div>
      )}
      <div style={s.actions}>
        <button style={{...s.actionBtn,color:liked?C.red:C.textSub}} onClick={()=>onLike(post.id)}>{liked?"️💓":"💕"} {post.likes}</button>
        <button style={{...s.actionBtn,color:disliked?C.purple:C.textSub}} onClick={()=>onDislike(post.id)}>{disliked?"😭":"😢"} {post.dislikes}</button>
        <button style={s.actionBtn} onClick={onToggleComments}>💬 {post.comments.length}</button>
        <button style={s.menuBtn} onClick={()=>setMenuOpen(v=>!v)}>▾ メニュー</button>
      </div>
      {isOpen && (
        <div style={s.commentSection}>
          {post.comments.map(c=>(
            <div key={c.id} style={s.commentRow}>
              <div style={{...s.commentAvatar,cursor:"pointer"}}
                onClick={()=>onUserClick({user:c.user,userId:c.userId,avatar:c.avatar,area:""})}>
                {c.avatar}
              </div>
              <div style={{flex:1}}>
                <div style={s.commentNameRow}>
                  <span style={{...s.commentUser,cursor:"pointer"}}
                    onClick={()=>onUserClick({user:c.user,userId:c.userId,avatar:c.avatar,area:""})}>
                    {c.user}
                  </span>
                  <span style={s.commentUserId}>@{c.userId}</span>
                  {(c.userId===post.userId||c.userId===profileUserId||isAdmin) && (
                    <button style={s.commentDeleteBtn} onClick={()=>onDeleteComment(post.id,c.id)}>削除</button>
                  )}
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


// ════════════════════════════════════════
// App（state宣言）
// ════════════════════════════════════════

function App() {

  // ── 画面制御 ──
  const [screen,setScreen]     = useState("login"); // login / signup / main
  const [tab,setTab]           = useState("timeline");

  // ── フィルター・検索 ──
  const [filterArea,setFilterArea]       = useState("全域");
  const [filterAge,setFilterAge]         = useState("全員");
  const [boardCat,setBoardCat]           = useState("すべて");
  const [timelineFilter,setTimelineFilter] = useState("all"); // all / following
  const [tagSearch,setTagSearch]         = useState(null);
  const [showSearch,setShowSearch]       = useState(false);
  const [searchText,setSearchText]       = useState("");

  // ── データ ──
  const [posts,setPosts]         = useState([]);
  const [boards,setBoards]       = useState([]);
  const [spots,setSpots]         = useState([]);
  const [users,setUsers]         = useState([]);
  const [reports,setReports]     = useState([]);
  const [feedbacks,setFeedbacks] = useState([]);
  const [notifications,setNotifications] = useState([]);

  // ── ユーザー状態 ──
  const [profile,setProfile]         = useState(null);
  const [following,setFollowing]     = useState([]);
  const [followerIds,setFollowerIds] = useState([]);
  const [frozenIds,setFrozenIds]     = useState(new Set());
  const [blockedIds,setBlockedIds]   = useState([]);

  // ── リアクション・固定 ──
  const [likedIds,setLikedIds]     = useState(new Set());
  const [dislikedIds,setDislikedIds] = useState(new Set());
  const [pinnedIds,setPinnedIds]   = useState([]);

  // ── バッジ・通知管理 ──
  const [lastSeenTimeline,setLastSeenTimeline] = useState(Date.now());
  const [lastSeenBoard,setLastSeenBoard]       = useState(Date.now());
  const [,setNewFollowers]                     = useState([]);
  const [seenNotif,setSeenNotif]               = useState(false);

  // ── UI開閉状態 ──
  const [openPostId,setOpenPostId]   = useState(null); // コメント展開中の投稿ID
  const [openBoardId,setOpenBoardId] = useState(null); // コメント展開中の掲示板ID
  const [openSpotId,setOpenSpotId]   = useState(null); // 展開中のスポットID
  const [viewUser,setViewUser]       = useState(null); // 表示中の他ユーザー情報
  const [viewSpot,setViewSpot]       = useState(null); // 表示中のスポットID
  const [showFollowers,setShowFollowers] = useState(false);
  const [showFollowing,setShowFollowing] = useState(false);

  // ── 投稿フォーム ──
  const [composing,setComposing]     = useState(false);
  const [draftText,setDraftText]     = useState("");
  const [draftScope,setDraftScope]   = useState("all");
  const [draftTag,setDraftTag]       = useState("");
  const [draftTags,setDraftTags]     = useState([]);
  const [commentText,setCommentText] = useState("");
  const [draftImage, setDraftImage] = useState(null);

  // ── 掲示板フォーム ──
  const [boardComposing,setBoardComposing]   = useState(false);
  const [boardDraftCat,setBoardDraftCat]     = useState("育児相談");
  const [boardDraftText,setBoardDraftText]   = useState("");
  const [boardCommentText,setBoardCommentText] = useState("");

  // ── プロフィール編集 ──
  const [editProf,setEditProf]   = useState(false);
  const [profDraft,setProfDraft] = useState(null);
  const [childMode,setChildMode] = useState(null);   // null / "new" / "edit"
  const [childDraft,setChildDraft] = useState(null);

  // ── 遊び場 ──
  const [spotArea,setSpotArea]           = useState("すべて");
  const [spotType,setSpotType]           = useState("すべて");
  const [spotReviewText,setSpotReviewText] = useState("");
  const [editingSpot,setEditingSpot]     = useState(null);

  // ── フィードバック ──
  const [feedbackText,setFeedbackText] = useState("");
  const [feedbackSent,setFeedbackSent] = useState(false);

  // ── ログインフォーム ──
  const [loginId,setLoginId]         = useState("");
  const [loginPw,setLoginPw]         = useState("");
  const [loginError,setLoginError]   = useState("");
  const [loginAttempts,setLoginAttempts] = useState(0);

  // ── サインアップフォーム ──
  const [signupName,setSignupName]     = useState("");
  const [signupId,setSignupId]         = useState("");
  const [signupPw,setSignupPw]         = useState("");
  const [signupArea,setSignupArea]     = useState("県央");
  const [signupAvatar,setSignupAvatar] = useState("🌸");
  const [signupError,setSignupError]   = useState("");
  const [showTerms,setShowTerms]       = useState(false);
  const [showPrivacy,setShowPrivacy]   = useState(false);
  const [agreedTerms,setAgreedTerms]   = useState(false);
  const [agreedPrivacy,setAgreedPrivacy] = useState(false);

  // ── パスワード変更 ──
  const [showChangePw,setShowChangePw] = useState(false);
  const [newPw,setNewPw]               = useState("");
  const [newPwConfirm,setNewPwConfirm] = useState("");
  const [pwError,setPwError]           = useState("");
  const [pwSuccess,setPwSuccess]       = useState(false);

  // ── 派生値 ──
  const isAdmin = profile?.userId === ADMIN_ID;
  const allKnownUsers = [...users,...posts.map(p=>({userId:p.userId,user:p.user,avatar:p.avatar,area:p.area,bio:""}))].filter((u,i,arr)=>arr.findIndex(x=>x.userId===u.userId)===i);
  const followingList = allKnownUsers.filter(u=>following.includes(u.userId));
  const followerList  = allKnownUsers.filter(u=>followerIds.includes(u.userId));


// ════════════════════════════════════════
// バッジ計算
// ════════════════════════════════════════

  // HOMEバッジ：フォロー中ユーザー（公式含む）の最終閲覧以降の新着投稿数
  const timelineBadge = posts.filter(p =>
    (following.includes(p.userId) || p.userId === OFFICIAL_ID) &&
    p.userId !== profile?.userId &&
    p.scope !== "wall" &&
    p._ts > lastSeenTimeline
  ).length;

  // 掲示板バッジ：最終閲覧以降に新しいコメントがついたスレッド数
  const boardBadge = boards.reduce((acc, b) => {
    const hasNew = b.comments.some(c => c._ts && c._ts > lastSeenBoard);
    return acc + (hasNew ? 1 : 0);
  }, 0);

  // 通知バッジ：通知タブを開くまでの未読通知数
  const notifBadge = seenNotif ? 0 : notifications.length;


// ════════════════════════════════════════
// 初期化・データ取得
// ════════════════════════════════════════

  // 通知のリアルタイム受信（ログイン後、自分宛ての INSERT をリッスン）
  useEffect(() => {
    if (!profile?.userId) return;
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${profile.userId}`,
      }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [profile?.userId]);

  // アプリ起動時：セッション復元 + 全データ取得
  const initSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const saved = localStorage.getItem("tecco_user");
    if (session && saved) {
      const savedProfile = JSON.parse(saved);
      setProfile(savedProfile);
      const {data:userData} = await supabase.from("users").select("pinned_ids").eq("user_id", savedProfile.userId).single();
      if (userData?.pinned_ids) setPinnedIds(JSON.parse(userData.pinned_ids));
      setScreen("main");
    } else {
      localStorage.removeItem("tecco_user");
    }
  };

  const fetchAll = async () => {
    // 投稿＋いいね数
    const {data:postsData} = await supabase.from("posts").select("*").order("created_at",{ascending:false});
    const {data:likesCount} = await supabase.from("likes").select("post_id, type");
    if (postsData) {
      setPosts(postsData.map(p=>({
        id:p.id, user:p.user, userId:p.user_id, area:p.area, avatar:p.avatar,
        childAges:JSON.parse(p.child_ages||"[]"),
        content:p.content,
        time:new Date(p.created_at).toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}),
        _ts:new Date(p.created_at).getTime(),
        likes: likesCount ? likesCount.filter(l=>l.post_id===p.id&&l.type==="like").length : 0,
        dislikes: likesCount ? likesCount.filter(l=>l.post_id===p.id&&l.type==="dislike").length : 0,
        scope:p.scope||"all", tags:JSON.parse(p.tags||"[]"), comments:[],
        imageUrl:p.image_url||null,
      })));
    }
    // 投稿へのコメント
    const {data:commentsData} = await supabase.from("comments").select("*").order("created_at",{ascending:true});
    if (commentsData) {
      setPosts(p=>p.map(post=>({
        ...post,
        comments: commentsData.filter(c=>c.post_id===post.id).map(c=>({
          id:c.id, user:c.user, userId:c.user_id, avatar:c.avatar,
          text:c.text, time:new Date(c.created_at).toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}),
        }))
      })));
    }
    // 掲示板＋コメント
    const {data:boardsData} = await supabase.from("boards").select("*").order("created_at",{ascending:false});
    if (boardsData) {
      setBoards(boardsData.map(b=>({
        id:b.id, category:b.category, content:b.content,
        time:new Date(b.created_at).toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}), comments:[],
      })));
      const {data:boardCommentsData} = await supabase.from("board_comments").select("*").order("created_at",{ascending:true});
      if (boardCommentsData) {
        setBoards(p=>p.map(board=>({
          ...board,
          comments: boardCommentsData
            .filter(c=>c.board_id===board.id)
            .map(c=>({
              id:c.id, text:c.text,
              time:new Date(c.created_at).toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}),
            }))
        })));
      }
    }
    // 遊び場スポット
    const {data:spotsData} = await supabase.from("spots").select("*").order("created_at",{ascending:true});
    if (spotsData) {
      setSpots(spotsData.map(sp=>({
        id:sp.id, name:sp.name, area:sp.area, type:sp.type,
        address:sp.address, memo:sp.memo, mapUrl:sp.map_url, reviews:[],
      })));
    }
    // フィードバック
    const {data:feedbacksData} = await supabase.from("feedbacks").select("*").order("created_at",{ascending:false});
    if (feedbacksData) {
      setFeedbacks(feedbacksData.map(f=>({
        id:f.id, text:f.text,
        time:new Date(f.created_at).toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}),
        checked:f.is_checked||false,
      })));
    }
    // ユーザー一覧＋凍結状態
    const {data:usersData} = await supabase.from("users").select("*");
    if (usersData) {
      setUsers(usersData.map(u=>({
        userId:u.user_id, user:u.name, name:u.name,
        avatar:u.avatar, area:u.area, bio:u.bio||"",
      })));
      setFrozenIds(new Set(usersData.filter(u=>u.is_frozen).map(u=>u.user_id)));
    }
    // ログイン中ユーザーのフォロー・いいね・通知・ブロック
    const savedUser = localStorage.getItem("tecco_user");
    if (savedUser) {
      const {userId} = JSON.parse(savedUser);
      if (!userId) return;
      const {data:followsData} = await supabase.from("follows").select("following_id").eq("follower_id",userId);
      if (followsData) setFollowing(followsData.map(f=>f.following_id));
      const {data:followersData} = await supabase.from("follows").select("follower_id").eq("following_id",userId);
      if (followersData) setFollowerIds(followersData.map(f=>f.follower_id));
      const {data:likesData} = await supabase.from("likes").select("*").eq("user_id",userId);
      if (likesData) {
        setLikedIds(new Set(likesData.filter(l=>l.type==="like").map(l=>l.post_id)));
        setDislikedIds(new Set(likesData.filter(l=>l.type==="dislike").map(l=>l.post_id)));
      }
      const {data:notifsData} = await supabase.from("notifications").select("*").eq("user_id",userId).order("created_at",{ascending:false});
      if (notifsData) setNotifications(notifsData);
      const {data:blocksData} = await supabase.from("blocks").select("blocked_id").eq("blocker_id",userId);
      if (blocksData) setBlockedIds(blocksData.map(b=>b.blocked_id));
    }
  };

  useEffect(() => {
    initSession();
    fetchAll();
  }, []);


// ════════════════════════════════════════
// 認証（ログイン・サインアップ・ログアウト・退会）
// ════════════════════════════════════════

  // ログイン：usersテーブル確認 → Supabase Auth認証
  // authに存在しない旧ユーザーは自動でsignUpしてauth_idを紐付ける
  const handleLogin = async () => {
    setLoginError("");
    if (!loginId.trim()||!loginPw.trim()){setLoginError("IDとパスワードを入力してください");return;}
    if (loginId===ADMIN_ID&&loginPw==="admin"){
      setProfile({name:"管理者",userId:ADMIN_ID,area:"県央",avatar:"⚙️",bio:"tecco運営アカウント",children:[]});
      setTab("timeline");setScreen("main");return;
    }
    const {data,error} = await supabase.from("users").select("*").eq("user_id",loginId).single();
    if (error||!data){setLoginError("このIDは登録されていません");return;}
    if (data.is_frozen){setLoginError("このアカウントは凍結されています");return;}
    const fakeEmail = `${loginId}@tecco.app`;
    const {error:authError} = await supabase.auth.signInWithPassword({email:fakeEmail,password:loginPw});
    if (authError) {
      if (data.password === loginPw) {
        // authに存在しない旧ユーザーを再登録
        const {data:signUpData, error:signUpError} = await supabase.auth.signUp({email:fakeEmail,password:loginPw});
        if (signUpError){setLoginError("ログインに失敗しました");return;}
        await supabase.from("users").update({auth_id:signUpData.user.id}).eq("user_id",loginId);
        setLoginAttempts(0);
      } else {
        setLoginError("パスワードが違います");
        setLoginAttempts(p=>p+1);
        return;
      }
    }
    setLoginAttempts(0);
    setProfile({name:data.name,userId:data.user_id,area:data.area,avatar:data.avatar,bio:data.bio||"",children:JSON.parse(data.children||"[]")});
    const savedPins = data.pinned_ids ? JSON.parse(data.pinned_ids) : [];
    setPinnedIds(savedPins);
    localStorage.setItem("tecco_user", JSON.stringify({name:data.name,userId:data.user_id,area:data.area,avatar:data.avatar,bio:data.bio||"",children:JSON.parse(data.children||"[]")}));
    setTab("timeline");setScreen("main");
  };

  // サインアップ：重複チェック → auth登録 → usersテーブル登録
  const handleSignup = async () => {
    setSignupError("");
    if (!signupName.trim()||!signupId.trim()||!signupPw.trim()){setSignupError("すべての項目を入力してください");return;}
    if (signupId===ADMIN_ID){setSignupError("このIDは使用できません");return;}
    if (signupPw.length<6){setSignupError("パスワードは6文字以上にしてください");return;}
    const {data:existing} = await supabase.from("users").select("user_id").eq("user_id",signupId).single();
    if (existing){setSignupError("このIDはすでに使われています");return;}
    const fakeEmail = `${signupId}@tecco.app`;
    const {data:authData, error:authError} = await supabase.auth.signUp({email:fakeEmail,password:signupPw});
    if (authError){setSignupError("登録に失敗しました: " + authError.message);return;}
    const {error} = await supabase.from("users").insert({
      user_id:signupId, name:signupName, area:signupArea,
      avatar:signupAvatar, bio:"", auth_id:authData.user.id
    });
    if (error){setSignupError("登録に失敗しました");return;}
    setProfile({name:signupName,userId:signupId,area:signupArea,avatar:signupAvatar,bio:"",children:[]});
    localStorage.setItem("tecco_user", JSON.stringify({name:signupName,userId:signupId,area:signupArea,avatar:signupAvatar,bio:"",children:[]}));
    // 新規登録時は公式アカウントを自動フォロー
    await supabase.from("follows").insert({follower_id:signupId, following_id:OFFICIAL_ID});
    setFollowing([OFFICIAL_ID]);
    setTab("timeline");setScreen("main");
  };

  // ログアウト：stateをすべてリセット
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("tecco_user");
    setProfile(null);setFollowing([]);
    setLikedIds(new Set());setDislikedIds(new Set());
    setTagSearch(null);setViewUser(null);setTab("timeline");
    setLoginId("");setLoginPw("");setScreen("login");
  };

  // 退会：自分の投稿・コメント・フォロー・いいねをすべて削除してからログアウト
  const handleDeleteAccount = async () => {
    if (!window.confirm("本当に退会しますか？\nこの操作は取り消せません。")) return;
    await supabase.from("posts").delete().eq("user_id", profile.userId);
    await supabase.from("comments").delete().eq("user_id", profile.userId);
    await supabase.from("follows").delete().eq("follower_id", profile.userId);
    await supabase.from("follows").delete().eq("following_id", profile.userId);
    await supabase.from("likes").delete().eq("user_id", profile.userId);
    await supabase.from("users").delete().eq("user_id", profile.userId);
    await supabase.auth.signOut();
    localStorage.removeItem("tecco_user");
    setProfile(null);setFollowing([]);
    setLikedIds(new Set());setDislikedIds(new Set());
    setTab("timeline");setScreen("login");
  };


// ════════════════════════════════════════
// 投稿・コメント
// ════════════════════════════════════════

  // いいね切り替え（同時に「よくないね」があれば解除する）
  const toggleLike = async id => {
    const isLiked = likedIds.has(id);
    const post = posts.find(x=>x.id===id);
    if (!post) return;
    if (isLiked) {
      await supabase.from("likes").delete().eq("post_id",id).eq("user_id",profile.userId).eq("type","like");
      setLikedIds(p=>{const n=new Set(p);n.delete(id);return n;});
      setPosts(p=>p.map(x=>x.id!==id?x:{...x,likes:post.likes-1}));
    } else {
      await supabase.from("likes").insert({post_id:id,user_id:profile.userId,type:"like"});
      if (post.userId!==profile.userId) {
        await supabase.from("notifications").insert({
          user_id:post.userId, type:"like", from_user:profile.name,
          from_avatar:profile.avatar, post_id:id,
          message:`${profile.name}さんがあなたの投稿にいいねしました`,
        });
      }
      setLikedIds(p=>{const n=new Set(p);n.add(id);return n;});
      setPosts(p=>p.map(x=>x.id!==id?x:{...x,likes:post.likes+1}));
      if (dislikedIds.has(id)) {
        await supabase.from("likes").delete().eq("post_id",id).eq("user_id",profile.userId).eq("type","dislike");
        setDislikedIds(p=>{const n=new Set(p);n.delete(id);return n;});
        setPosts(p=>p.map(x=>x.id!==id?x:{...x,dislikes:post.dislikes-1}));
      }
    }
  };

  // よくないね切り替え（同時に「いいね」があれば解除する）
  const toggleDislike = async id => {
    const isDisliked = dislikedIds.has(id);
    const post = posts.find(x=>x.id===id);
    if (!post) return;
    if (isDisliked) {
      await supabase.from("likes").delete().eq("post_id",id).eq("user_id",profile.userId).eq("type","dislike");
      setDislikedIds(p=>{const n=new Set(p);n.delete(id);return n;});
      setPosts(p=>p.map(x=>x.id!==id?x:{...x,dislikes:post.dislikes-1}));
    } else {
      await supabase.from("likes").insert({post_id:id,user_id:profile.userId,type:"dislike"});
      setDislikedIds(p=>{const n=new Set(p);n.add(id);return n;});
      setPosts(p=>p.map(x=>x.id!==id?x:{...x,dislikes:post.dislikes+1}));
      if (likedIds.has(id)) {
        await supabase.from("likes").delete().eq("post_id",id).eq("user_id",profile.userId).eq("type","like");
        setLikedIds(p=>{const n=new Set(p);n.delete(id);return n;});
        setPosts(p=>p.map(x=>x.id!==id?x:{...x,likes:post.likes-1}));
      }
    }
  };

  // 新規投稿
  const submitPost = async () => {
  if (!draftText.trim()) return;
  let imageUrl = null;
  if (draftImage) {
    const ext = draftImage.name.split(".").pop();
    const fileName = `${profile.userId}_${Date.now()}.${ext}`;
    const {error:uploadError} = await supabase.storage
      .from("post-images")
      .upload(fileName, draftImage);
    if (uploadError) { alert("画像のアップロードに失敗しました"); return; }
    const {data:urlData} = supabase.storage.from("post-images").getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  const {data,error} = await supabase.from("posts").insert({
    user:profile.name, user_id:profile.userId, area:profile.area, avatar:profile.avatar,
    content:draftText, scope:draftScope,
    tags:JSON.stringify(draftTags),
    child_ages:JSON.stringify(profile.children.map(c=>c.age)),
    likes:0, dislikes:0,
    image_url: imageUrl,
  }).select().single();
  if (error){ return; }
  setPosts(p=>[{
    id:data.id, user:data.user, userId:data.user_id, area:data.area, avatar:data.avatar,
    childAges:JSON.parse(data.child_ages||"[]"),
    content:data.content, time:new Date().toLocaleString("ja-JP", {timeZone:"Asia/Tokyo"}),
    _ts:Date.now(),
    likes:0, dislikes:0, scope:data.scope,
    tags:JSON.parse(data.tags||"[]"), comments:[],
    imageUrl:data.image_url,
  }, ...p]);
  setDraftText("");setDraftScope("all");setDraftTags([]);setDraftTag("");
  setDraftImage(null);setComposing(false);
};

  // タグ追加（最大5個、# 記号は自動除去）
  const addTag = () => {
    const t=draftTag.trim().replace(/^#/,"");
    if (t&&!draftTags.includes(t)&&draftTags.length<5){setDraftTags(p=>[...p,t]);setDraftTag("");}
  };

  // 投稿削除
  const deletePost = async id => {
    await supabase.from("posts").delete().eq("id", id);
    setPosts(p=>p.filter(x=>x.id!==id));
  };

  // マイページへの固定（最大3件）。DB の pinned_ids カラムに保存
  const togglePin = async (postId) => {
    let newPins;
    if (pinnedIds.includes(postId)) {
      newPins = pinnedIds.filter(id=>id!==postId);
    } else {
      if (pinnedIds.length>=3) { alert("固定できるのは3つまでです"); return; }
      newPins = [...pinnedIds, postId];
    }
    const {error} = await supabase.from("users").update({pinned_ids:JSON.stringify(newPins)}).eq("user_id",profile.userId);
    if (error) { alert("エラー: " + error.message); return; }
    setPinnedIds(newPins);
  };

  // コメント削除
  const deleteComment = async (postId,cid) => {
    await supabase.from("comments").delete().eq("id", cid);
    setPosts(p=>p.map(x=>x.id!==postId?x:{...x,comments:x.comments.filter(c=>c.id!==cid)}));
  };

  // コメント投稿（投稿者本人に通知も送る）
  const submitComment = async postId => {
    if (!commentText.trim()) return;
    const {data,error} = await supabase.from("comments").insert({
      post_id:postId, user:profile.name, user_id:profile.userId, avatar:profile.avatar, text:commentText,
    }).select().single();
    if (error){ return; }
    const post = posts.find(x=>x.id===postId);
    if (post && post.userId !== profile.userId) {
      await supabase.from("notifications").insert({
        user_id:post.userId, type:"comment", from_user:profile.name,
        from_avatar:profile.avatar, post_id:postId,
        message:`${profile.name}さんがあなたの投稿にコメントしました`,
      });
    }
    setPosts(p=>p.map(x=>x.id!==postId?x:{...x,comments:[...x.comments,{
      id:data.id, user:data.user, userId:data.user_id, avatar:data.avatar, text:data.text,
      time:new Date().toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}),
    }]}));
    setCommentText("");
  };


// ════════════════════════════════════════
// 掲示板
// ════════════════════════════════════════

  // 掲示板へのコメント投稿（匿名・アカウント紐付けなし）
  const submitBoardComment = async boardId => {
    if (!boardCommentText.trim()) return;
    const {data,error} = await supabase.from("board_comments").insert({
      board_id:boardId, text:boardCommentText,
    }).select().single();
    if (error){
      // テーブルがない場合はローカルのみで追加
      setBoards(p=>p.map(b=>b.id!==boardId?b:{...b,comments:[...b.comments,{id:Date.now(),text:boardCommentText,time:new Date().toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"})}]}));
      setBoardCommentText("");
      return;
    }
    setBoards(p=>p.map(b=>b.id!==boardId?b:{...b,comments:[...b.comments,{id:data.id,text:data.text,time:new Date().toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"})}]}));
    setBoardCommentText("");
  };

  // 掲示板スレッド投稿（匿名）
  const submitBoard = async () => {
    if (!boardDraftText.trim()) return;
    const {data,error} = await supabase.from("boards").insert({
      category:boardDraftCat, content:boardDraftText,
    }).select().single();
    if (error){ return; }
    setBoards(p=>[{id:data.id,category:data.category,content:data.content,time:new Date().toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}),comments:[]}, ...p]);
    setBoardDraftText("");setBoardComposing(false);
  };

  // 掲示板スレッド削除（管理者のみ）
  const deleteBoard = id => setBoards(p=>p.filter(b=>b.id!==id));


// ════════════════════════════════════════
// 通報・凍結
// ════════════════════════════════════════

  // 通報（ローカルのreports配列に追加。現状DBには保存しない）
  const handleReport = (postId,userName) => {
    setReports(p=>[...p,{id:Date.now(),postId,userName,time:new Date().toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"}),checked:false}]);
    alert("通報しました。運営が確認します。");
  };

  // アカウント凍結（管理者のみ）
  const freezeUser = async uid => {
    await supabase.from("users").update({is_frozen:true}).eq("user_id",uid);
    setFrozenIds(p=>{const n=new Set(p);n.add(uid);return n;});
  };

  // アカウント凍結解除（管理者のみ）
  const unfreezeUser = async uid => {
    await supabase.from("users").update({is_frozen:false}).eq("user_id",uid);
    setFrozenIds(p=>{const n=new Set(p);n.delete(uid);return n;});
  };

  // フィードバック送信
  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    const { error } = await supabase.from("feedbacks").insert({text:feedbackText,user_id:profile.userId});
    if (error) { return; }
    setFeedbacks(p=>[...p,{id:Date.now(),text:feedbackText,time:new Date().toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"})}]);
    setFeedbackText(""); setFeedbackSent(true);
    setTimeout(()=>setFeedbackSent(false),3000);
  };


// ════════════════════════════════════════
// 遊び場スポット
// ════════════════════════════════════════

  // スポットへのクチコミ投稿（ローカルのみ。現状DBには保存しない）
  const submitSpotReview = spotId => {
    if (!spotReviewText.trim()) return;
    setSpots(p=>p.map(sp=>sp.id!==spotId?sp:{...sp,reviews:[...sp.reviews,{
      id:Date.now(), user:profile.name, avatar:profile.avatar,
      text:spotReviewText, time:new Date().toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"})
    }]}));
    setSpotReviewText("");
  };

  const openEditSpot = sp => setEditingSpot({...sp});

  // スポット保存（新規追加 or 既存編集）
  const saveSpot = async () => {
    if (!editingSpot.name.trim()) return;
    if (editingSpot.isNew) {
      const {isNew, reviews, ...spotData} = editingSpot;
      const {data, error} = await supabase.from("spots").insert({
        name:spotData.name, area:spotData.area, type:spotData.type,
        address:spotData.address, memo:spotData.memo, map_url:spotData.mapUrl,
      }).select().single();
      if (error){ return; }
      setSpots(p=>[...p,{...spotData,id:data.id,reviews:[]}]);
    } else {
      const {error} = await supabase.from("spots").update({
        name:editingSpot.name, area:editingSpot.area, type:editingSpot.type,
        address:editingSpot.address, memo:editingSpot.memo, map_url:editingSpot.mapUrl,
      }).eq("id",editingSpot.id);
      if (error){ return; }
      setSpots(p=>p.map(sp=>sp.id===editingSpot.id?editingSpot:sp));
    }
    setEditingSpot(null);
  };

  // スポット削除（管理者のみ）
  const deleteSpot = async id => {
    await supabase.from("spots").delete().eq("id", id);
    setSpots(p=>p.filter(sp=>sp.id!==id));
  };


// ════════════════════════════════════════
// プロフィール・子ども情報
// ════════════════════════════════════════

  // プロフィール編集モーダルを開く（編集用の下書きをセット）
  const openEditProf = () => {
    setProfDraft({...profile,children:profile.children.map(c=>({...c}))});
    setEditProf(true);
  };

  // プロフィール保存
  const saveProf = async () => {
    const { error } = await supabase.from("users")
      .update({name:profDraft.name, area:profDraft.area, avatar:profDraft.avatar, bio:profDraft.bio})
      .eq("user_id", profDraft.userId);
    if (error) { return; }
    setProfile(profDraft);
    localStorage.setItem("tecco_user", JSON.stringify(profDraft));
    setEditProf(false);
  };

  const openAddChild  = () => {setChildDraft({id:Date.now(),name:"",age:"0〜6ヶ月",gender:"女の子"});setChildMode("new");};
  const openEditChild = c => {setChildDraft({...c});setChildMode("edit");};

  // 子ども情報保存（新規追加 or 既存編集）
  const saveChild = async () => {
    if (!childDraft.name.trim()) return;
    const newChildren = childMode==="new"
      ? [...profile.children, childDraft]
      : profile.children.map(c=>c.id===childDraft.id?childDraft:c);
    const { error } = await supabase.from("users").update({children:JSON.stringify(newChildren)}).eq("user_id",profile.userId);
    if (error) { return; }
    setProfile(p=>({...p,children:newChildren}));
    localStorage.setItem("tecco_user", JSON.stringify({...profile,children:newChildren}));
    setChildMode(null);
  };

  // 子ども情報削除
  const deleteChild = async () => {
    const newChildren = profile.children.filter(c=>c.id!==childDraft.id);
    const { error } = await supabase.from("users").update({children:JSON.stringify(newChildren)}).eq("user_id",profile.userId);
    if (error) { return; }
    setProfile(p=>({...p,children:newChildren}));
    localStorage.setItem("tecco_user", JSON.stringify({...profile,children:newChildren}));
    setChildMode(null);
  };


// ════════════════════════════════════════
// フォロー・ブロック
// ════════════════════════════════════════

  // フォロー・解除の切り替え（フォロー時は相手に通知を送る）
  const toggleFollow = async targetUserId => {
    if (following.includes(targetUserId)) {
      await supabase.from("follows").delete().eq("follower_id",profile.userId).eq("following_id",targetUserId);
      setFollowing(p=>p.filter(id=>id!==targetUserId));
    } else {
      await supabase.from("follows").insert({follower_id:profile.userId, following_id:targetUserId});
      await supabase.from("notifications").insert({
        user_id:targetUserId, type:"follow", from_user:profile.name,
        from_avatar:profile.avatar, post_id:null,
        message:`${profile.name}さんがあなたをフォローしました`,
      });
      setNewFollowers(prev=>prev.includes(targetUserId)?prev:[...prev,targetUserId]);
      setSeenNotif(false);
      setFollowing(p=>[...p,targetUserId]);
    }
  };

  // ブロック・解除の切り替え（ブロック時はフォローも解除する）
  const toggleBlock = async userId => {
    if (blockedIds.includes(userId)) {
      await supabase.from("blocks").delete().eq("blocker_id",profile.userId).eq("blocked_id",userId);
      setBlockedIds(p=>p.filter(id=>id!==userId));
    } else {
      await supabase.from("blocks").insert({blocker_id:profile.userId, blocked_id:userId});
      setBlockedIds(p=>[...p,userId]);
      if (following.includes(userId)) await toggleFollow(userId);
    }
  };


// ════════════════════════════════════════
// 表示用データ加工
// ════════════════════════════════════════

  // PostCard に渡す props をまとめるヘルパー
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
    profileUserId:profile?.userId, onPin:togglePin,
    isPinned:pinnedIds.includes(post.id),
  });

  // 表示する投稿を絞り込む（凍結・ブロック・公開範囲・フィルター）
  const visiblePosts = posts.filter(p=>{
    if (frozenIds.has(p.userId)&&!isAdmin) return false;
    if (blockedIds.includes(p.userId)) return false;
    if (p.scope==="wall"&&p.userId!==profile?.userId) return false;
    if (p.scope==="followers"&&p.userId!==profile?.userId&&!following.includes(p.userId)) return false;
    if (tagSearch) return p.tags.includes(tagSearch);
    if (tab==="timeline"&&timelineFilter==="following"&&p.userId!==profile?.userId&&!following.includes(p.userId)) return false;
    if (tab==="area"&&filterArea!=="全域"&&p.area!==filterArea) return false;
    if (tab==="age"&&filterAge!=="全員"){
      const allowed=AGE_MAP[filterAge]||[];
      return (p.childAges||[]).some(age=>allowed.some(k=>age.includes(k)||k.includes(age)));
    }
    return true;
  });

  const myPosts       = posts.filter(p=>p.userId===profile?.userId);
  const filteredBoards = boardCat==="すべて"?boards:boards.filter(b=>b.category===boardCat);


// ════════════════════════════════════════
// 画面描画（ログイン・サインアップ）
// ════════════════════════════════════════

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
          {loginAttempts>=3 && (
            <div style={{background:"#FFF8E6",border:"1px solid #FFE49A",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#7A5C00",marginBottom:10,lineHeight:1.6}}>
              パスワードをお忘れですか？<br/>
              以下のメールアドレスまでご連絡ください🍀<br/>
              <strong>@gmail.com</strong>
            </div>
          )}
          <div style={{height:8}}/>
          <button style={s.authBtn} onClick={handleLogin}>ログインする</button>
          <button style={s.authBtnSub} onClick={()=>{setScreen("signup");setLoginError("");}}>新規登録</button>
        </div>
        <div style={s.authNote}>※岩手在住・出身のパパママ限定です</div>
      </div>
    </div>
  );

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
          <div style={s.checkRow} onClick={()=>setAgreedTerms(v=>!v)}>
            <div style={agreedTerms?s.checkBoxOn:s.checkBox}>
              {agreedTerms && <span style={{color:"#fff",fontSize:12,lineHeight:1}}>✓</span>}
            </div>
            <div style={s.checkLabel}>
              <span style={s.checkLink} onClick={e=>{e.stopPropagation();setShowTerms(true);}}>利用規約</span>
              に同意する
            </div>
          </div>
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
                ["第4条　投稿コンテンツ","投稿の著作権は投稿者本人に帰属します。投稿することで、本サービス内での表示・共有に必要な範囲での利用を許諾したものとみなします。運営は、禁止事項に違反する投稿を予告なく削除できるものとします。画像の投稿は１投稿につき１枚まで可能です。個人情報保護のため投稿者本人やその家族などすべての人物が含まれた画像の投稿は禁止します。また、氏名・自宅外観など個人が特定できる情報が映り込んだ画像の投稿も禁止します。著作権を侵害する画像の投稿も同様に禁止します。"],
                ["第5条　免責事項","本サービスはユーザー間のコミュニケーションを媒介するものであり、ユーザー間のトラブルに対して運営は責任を負いません。システム障害・メンテナンス等によるサービス停止について、運営は責任を負いません。投稿内容の正確性・信頼性について、運営は保証しません。"],
                ["第6条　アカウントの停止・パスワードリセット","本規約に違反した場合、予告なくアカウントを停止・削除することがあります。アカウントの削除はマイページ下部の「退会する」ボタンから行えます。退会すると投稿・コメント・フォロー情報などすべてのデータが削除され、復元できません。パスワードを忘れた場合は、tecco運営アカウント（@admin）へのコメントまたはフィードバック欄よりご連絡ください。本人確認の上、パスワードのリセット対応をいたします。"],
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
                ["第5条　情報の管理","パスワードはSupabase Authにより暗号化（ハッシュ化）して保存します。運営スタッフであってもパスワードを閲覧することはできません。パスワードを忘れた場合は、tecco運営アカウント（@admin）へのコメントまたはフィードバック欄よりご連絡ください。本人確認の上、パスワードのリセット対応をいたします。通信はSSL/TLSにより暗号化します。不正アクセス・漏洩防止のための適切な措置を講じます。"],
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


// ════════════════════════════════════════
// 画面描画（サブ画面：フォロー一覧・他ユーザー・スポット詳細）
// ════════════════════════════════════════

  // フォロー中一覧
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

  // フォロワー一覧
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

  // 他ユーザーページ
  if (viewUser) {
    const isFrozen    = frozenIds.has(viewUser.userId);
    const isFollowing = following.includes(viewUser.userId);
    const isBlocked   = blockedIds.includes(viewUser.userId);
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
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginTop:12}}>
              <button style={isFollowing?s.unfollowBtnLg:s.followBtn} onClick={()=>toggleFollow(viewUser.userId)}>
                {isFollowing?"フォロー中（解除）":"フォローする"}
              </button>
              <button style={{background:"none",border:`1.5px solid ${C.red}66`,color:C.red,borderRadius:20,padding:"7px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}
                onClick={()=>toggleBlock(viewUser.userId)}>
                {isBlocked?"ブロック解除":"ブロックする"}
              </button>
            </div>
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

  // 遊び場詳細
  if (viewSpot) {
    const spot = spots.find(s=>s.id===viewSpot);
    if (!spot) { setViewSpot(null); return null; } // スポットが削除された場合の安全策
    const submitReview = () => {
      if (!spotReviewText.trim()) return;
      setSpots(prev=>prev.map(s=>s.id===viewSpot?{...s,reviews:[...s.reviews,{
        id:Date.now(), user:profile.name, avatar:profile.avatar,
        text:spotReviewText, time:new Date().toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"})
      }]}:s));
      setSpotReviewText("");
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
            <input style={s.commentInput} placeholder="クチコミを書く…" value={spotReviewText}
              onChange={e=>setSpotReviewText(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submitReview()}/>
            <button style={s.commentSendBtn} onClick={submitReview}>投稿</button>
          </div>
        </div>
      </div>
    );
  }


// ════════════════════════════════════════
// 画面描画（メイン画面）
// ════════════════════════════════════════

  return (
    <div style={s.root}>

      {/* ヘッダー */}
      <header style={s.header}>
        <div style={s.headerInner}>
          {/* 左：通知ベル */}
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
            <button style={{background:"none",border:"none",color:C.white,fontSize:20,cursor:"pointer",padding:4}}
              onClick={()=>{setShowSearch(true);setSearchText("");}}>🔍</button>
          </div>
        </div>
      </header>

      {/* タグ検索中バナー */}
      {tagSearch && (
        <div style={s.tagBanner}>
          <span>🔍 #{tagSearch} の投稿</span>
          <button style={s.tagBannerBtn} onClick={()=>setTagSearch(null)}>✕ 解除</button>
        </div>
      )}

      {/* タブナビゲーション */}
      <nav style={s.tabNav}>
        {[
          {key:"timeline", label:"HOME",      badge:timelineBadge},
          {key:"area",     label:"地域",      badge:0},
          {key:"age",      label:"月齢",      badge:0},
          {key:"board",    label:"掲示板",    badge:boardBadge},
          {key:"spots",    label:"遊び場",    badge:0},
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

      {/* フィルターバー */}
      {tab==="timeline"&&!tagSearch&&(
        <div style={s.filterBar}>
          <div style={{display:"flex",gap:8}}>
            <button style={{...s.boardCatBtn,background:timelineFilter==="all"?C.coralPale:C.white,borderColor:timelineFilter==="all"?C.coral:C.border,color:timelineFilter==="all"?C.coral:C.textSub}}
              onClick={()=>setTimelineFilter("all")}>🌍 全員</button>
            <button style={{...s.boardCatBtn,background:timelineFilter==="following"?C.coralPale:C.white,borderColor:timelineFilter==="following"?C.coral:C.border,color:timelineFilter==="following"?C.coral:C.textSub}}
              onClick={()=>setTimelineFilter("following")}>👥 フォロー中</button>
          </div>
        </div>
      )}
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

      {/* メインコンテンツ */}
      <main style={s.main}>

        {/* ── タイムライン・地域・月齢タブ ── */}
        {(tab==="timeline"||tab==="area"||tab==="age"||tagSearch) && (
          <>
            {visiblePosts.length===0 && <div style={s.emptyMsg}>投稿がありません</div>}
            {visiblePosts.map(p=><PostCard key={p.id} {...pcp(p)}/>)}
          </>
        )}

        {/* ── 遊び場タブ ── */}
        {tab==="spots"&&!tagSearch && (
          <>
            <div style={{fontSize:13,color:C.textSub,marginBottom:8,lineHeight:1.6}}>
              🗺️ 岩手県内の支援センター・遊び場・勉強スペースの情報です。クチコミもぜひ書いてください！<br/>
              <span style={{fontSize:12,color:C.textMuted}}>📚 勉強スペースは中高生向けの自習・学習できる場所をまとめています。</span>
            </div>
            {isAdmin && (
              <button style={{...s.addChildBtn,marginBottom:12}}
                onClick={()=>setEditingSpot({id:Date.now(),name:"",type:"支援センター",area:"県央",address:"",memo:"",mapUrl:"",reviews:[],isNew:true})}>
                ＋ 遊び場・スポットを追加する
              </button>
            )}
            <div style={s.spotFilterBar}>
              {["すべて",...AREAS].map(a=>(
                <button key={a} style={{...s.spotFilterBtn,background:spotArea===a?C.coral:C.white,borderColor:spotArea===a?C.coral:C.border,color:spotArea===a?C.white:C.textSub}}
                  onClick={()=>setSpotArea(a)}>{a}</button>
              ))}
            </div>
            <div style={s.spotFilterBar}>
              {SPOT_TYPES.map(t=>(
                <button key={t} style={{...s.spotFilterBtn,background:spotType===t?C.purple:C.white,borderColor:spotType===t?C.purple:C.border,color:spotType===t?C.white:C.textSub}}
                  onClick={()=>setSpotType(t)}>{t}</button>
              ))}
            </div>
            {spots
              .filter(sp=>(spotArea==="すべて"||sp.area===spotArea)&&(spotType==="すべて"||sp.type===spotType))
              .map(sp=>{
                const isOpen = openSpotId===sp.id;
                return (
                  <div key={sp.id}
                    style={{...(isOpen?s.spotCardOpen:s.spotCard),cursor:"pointer"}}
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

        {/* ── 通知タブ ── */}
        {tab==="notif" && (
          <>
            <div style={s.secTitle}>🔔 通知</div>
            {notifications.length===0 && <div style={s.emptyMsg}>まだ通知はありません</div>}
            {notifications.map(n=>(
              <div key={n.id} style={{...s.userListItem,background:C.white,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`,cursor:"pointer"}}
                onClick={()=>{
                  const user = allKnownUsers.find(u=>u.user===n.from_user);
                  if (user) setViewUser(user);
                }}>
                <div style={{fontSize:22,marginRight:8,flexShrink:0}}>
                  {n.type==="like"?"❤️":n.type==="comment"?"💬":"👥"}
                </div>
                <div style={s.userListAvatar}>{n.from_avatar}</div>
                <div style={{flex:1,marginLeft:8}}>
                  <div style={{fontSize:13,color:C.text,fontWeight:600}}>{n.message}</div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:2}}>
                    {new Date(n.created_at).toLocaleString("ja-JP",{timeZone:"Asia/Tokyo"})}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── 掲示板タブ ── */}
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

        {/* ── マイページタブ ── */}
        {tab==="mypage"&&!tagSearch && (
          <>
            {/* プロフィールカード */}
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

            {/* 投稿数・フォロー統計 */}
            <div style={s.stats}>
              <div style={s.statItem}><div style={s.statNum}>{myPosts.length}</div><div style={s.statLabel}>投稿</div></div>
              <div style={s.statItem} onClick={()=>setShowFollowers(true)}><div style={s.statNum}>{followerList.length}</div><div style={s.statLabel}>フォロワー</div></div>
              <div style={s.statItem} onClick={()=>setShowFollowing(true)}><div style={s.statNum}>{following.length}</div><div style={s.statLabel}>フォロー中</div></div>
            </div>

            {/* 子ども情報 */}
            <div style={{...s.secTitle,marginTop:16}}>👶 子ども情報</div>
            {profile.children.map(c=>(
              <div key={c.id} style={s.childCard}>
                <span style={{fontSize:24}}>👶</span>
                <div style={{flex:1}}><div style={s.childName}>{c.name}</div><div style={s.childSub}>{c.age} / {c.gender}</div></div>
                <button style={s.editChildBtn} onClick={()=>openEditChild(c)}>編集</button>
              </div>
            ))}
            <button style={s.addChildBtn} onClick={openAddChild}>＋ 子どもを追加</button>

            {/* 自分の投稿（固定投稿を先頭に） */}
            <div style={s.secTitle}>📝 自分の投稿</div>
            {myPosts.length===0 && <div style={s.emptyMsg}>まだ投稿がありません</div>}
            {pinnedIds.length>0 && (
              <>
                <div style={{...s.secTitle,color:C.coral}}>📌 固定投稿</div>
                {myPosts.filter(p=>pinnedIds.includes(p.id)).map(p=>(
                  <PostCard key={p.id} {...pcp(p)}/>
                ))}
                <div style={{...s.secTitle,marginTop:12}}>その他の投稿</div>
              </>
            )}
            {myPosts.filter(p=>!pinnedIds.includes(p.id)).map(p=>(
              <PostCard key={p.id} {...pcp(p)}/>
            ))}

            {/* フィードバック */}
            <div style={{...s.secTitle,marginTop:20}}>💌 要望・フィードバック</div>
            <div style={s.reportSection}>
              <div style={s.reportTitle}>teccoへのご意見・改善要望</div>
              <textarea style={s.feedbackArea} rows={4} placeholder="機能のご要望、使いにくかった点など、なんでもお気軽にどうぞ"
                value={feedbackText} onChange={e=>setFeedbackText(e.target.value)}/>
              <button style={s.feedbackBtn} onClick={submitFeedback}>送信する</button>
              {feedbackSent && <div style={s.successMsg}>✅ 送信しました！ありがとうございます。</div>}
            </div>

            {/* 寄付 */}
            <div style={{...s.secTitle,marginTop:8}}>💝 teccoを応援する</div>
            <div style={s.donateSection}>
              <div style={s.donateTitle}>teccoを応援する</div>
              <div style={s.donateDesc}>teccoは岩手のパパママのために<br/>個人で運営しています。<br/>ご支援いただけると嬉しいです🍀</div>
              <button style={s.donateBtn} onClick={()=>alert("準備中です。ありがとうございます！💝")}>💝 寄付する</button>
            </div>

            {/* 管理者パネル */}
            {isAdmin && (
              <>
                <div style={{...s.secTitle,marginTop:8}}>⚙️ 管理者パネル</div>
                <div style={s.adminPanel}>
                  <div style={s.adminTitle}>ユーザー管理（{users.length}名登録）</div>
                  {users.map(u=>(
                    <div key={u.userId} style={s.adminUserRow}>
                      <button style={s.avatarBtn} onClick={()=>setViewUser(u)}>
                        <span style={{fontSize:20}}>{u.avatar}</span>
                      </button>
                      <div style={{flex:1,cursor:"pointer"}} onClick={()=>setViewUser(u)}>
                        <div style={{fontWeight:700,fontSize:13,color:C.text}}>{u.name}</div>
                        <div style={{fontSize:11,color:C.textMuted}}>@{u.userId}</div>
                      </div>
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
                  {reports.map(r=>{
                    const reportedPost = posts.find(p=>p.id===r.postId);
                    return (
                      <div key={r.id} style={{fontSize:13,padding:"8px 0",borderBottom:"1px solid #FFF3C4",opacity:r.checked?0.5:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <input type="checkbox" checked={r.checked||false}
                            onChange={()=>setReports(p=>p.map(x=>x.id===r.id?{...x,checked:!x.checked}:x))}/>
                          <span>🚩 <strong>{r.userName}</strong> の投稿 — {r.time}</span>
                          {r.checked && <span style={{fontSize:11,color:C.green,fontWeight:700}}>確認済み</span>}
                        </div>
                        {reportedPost && (
                          <div style={{marginTop:4,padding:"6px 10px",background:"#FFF8E6",borderRadius:8,fontSize:12,color:C.textSub}}>
                            「{reportedPost.content.slice(0,50)}{reportedPost.content.length>50?"…":""}」
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={s.adminPanel}>
                  <div style={s.adminTitle}>フィードバック（{feedbacks.length}件）</div>
                  {feedbacks.length===0 && <div style={{fontSize:13,color:C.textMuted}}>フィードバックはありません</div>}
                  {feedbacks.map(f=>(
                    <div key={f.id} style={{fontSize:13,padding:"8px 0",borderBottom:"1px solid #FFF3C4",lineHeight:1.5,opacity:f.checked?0.5:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <input type="checkbox" checked={f.checked||false}
                          onChange={async()=>{
                            const newChecked = !f.checked;
                            await supabase.from("feedbacks").update({is_checked:newChecked}).eq("id",f.id);
                            setFeedbacks(p=>p.map(x=>x.id===f.id?{...x,checked:newChecked}:x));
                          }}/>
                        <span>💌 {f.text}</span>
                        {f.checked && <span style={{fontSize:11,color:C.green,fontWeight:700}}>確認済み</span>}
                      </div>
                      <div style={{fontSize:11,color:C.textMuted,marginTop:2,marginLeft:24}}>{f.time}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* パスワード変更 */}
            <div style={{...s.reportSection,marginTop:8}}>
              <div style={{...s.reportTitle,marginBottom:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                🔑 パスワードを変更する
                <button style={{background:"none",border:"none",fontSize:13,color:C.coral,fontWeight:700,cursor:"pointer"}}
                  onClick={()=>{setShowChangePw(v=>!v);setPwError("");setPwSuccess(false);}}>
                  {showChangePw?"閉じる":"変更する"}
                </button>
              </div>
              {showChangePw && (
                <div style={{marginTop:14}}>
                  <div style={s.formLabel}>新しいパスワード（6文字以上）</div>
                  <input style={{...s.formInput,marginBottom:10}} type="password"
                    placeholder="新しいパスワード"
                    value={newPw} onChange={e=>{setNewPw(e.target.value);setPwError("");}}/>
                  <div style={s.formLabel}>確認用（もう一度）</div>
                  <input style={{...s.formInput,marginBottom:10}} type="password"
                    placeholder="もう一度入力"
                    value={newPwConfirm} onChange={e=>{setNewPwConfirm(e.target.value);setPwError("");}}/>
                  {pwError && <div style={s.authError}>{pwError}</div>}
                  {pwSuccess && <div style={s.successMsg}>✅ パスワードを変更しました！</div>}
                  <button style={{...s.feedbackBtn,marginTop:4}} onClick={async () => {
                    setPwError("");setPwSuccess(false);
                    if (newPw.length<6){setPwError("6文字以上で入力してください");return;}
                    if (newPw!==newPwConfirm){setPwError("パスワードが一致しません");return;}
                    const {error} = await supabase.auth.updateUser({password:newPw});
                    if (error){setPwError("変更に失敗しました。再ログインして試してください");return;}
                    setPwSuccess(true);
                    setNewPw("");setNewPwConfirm("");
                    setTimeout(()=>{setPwSuccess(false);setShowChangePw(false);},2000);
                  }}>変更する</button>
                </div>
              )}
            </div>

            {/* ログアウト・退会 */}
            <button style={s.logoutBtn} onClick={handleLogout}>ログアウトする</button>
            <div style={{height:8}}/>
            <button style={{...s.logoutBtn,color:C.red,borderColor:`${C.red}66`,marginTop:8}}
              onClick={handleDeleteAccount}>
              退会する
            </button>
          </>
        )}
      </main>

      {/* 投稿ボタン（遊び場タブ以外に表示） */}
      {tab!=="spots" && (
        <button style={s.fab} onClick={()=>tab==="board"?setBoardComposing(true):setComposing(true)}>
          ＋ 投稿する
        </button>
      )}

      {/* ── モーダル群 ── */}

      {/* ユーザー検索 */}
      {showSearch && (
        <Overlay onClose={()=>setShowSearch(false)}>
          <div style={s.modalHeader}>
            <button style={s.closeBtn} onClick={()=>setShowSearch(false)}>✕</button>
            <span style={s.modalTitle}>ユーザーを検索</span>
            <div style={{width:40}}/>
          </div>
          <div style={{padding:"12px 16px"}}>
            <input style={{...s.formInput,marginBottom:12}} autoFocus
              placeholder="名前またはIDで検索"
              value={searchText} onChange={e=>setSearchText(e.target.value)}/>
            {allKnownUsers
              .filter(u=>
                u.userId!==profile?.userId &&
                searchText.trim()!=="" &&
                (u.user.includes(searchText)||u.userId.includes(searchText))
              )
              .map(u=>(
                <div key={u.userId} style={{...s.userListItem,cursor:"pointer"}}
                  onClick={()=>{setShowSearch(false);setViewUser(u);}}>
                  <div style={s.userListAvatar}>{u.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={s.userListName}>{u.user}</div>
                    <div style={s.userListId}>@{u.userId}</div>
                  </div>
                </div>
              ))}
            {searchText.trim()!=="" && allKnownUsers.filter(u=>
              u.userId!==profile?.userId &&
              (u.user.includes(searchText)||u.userId.includes(searchText))
            ).length===0 && (
              <div style={s.emptyMsg}>見つかりませんでした</div>
            )}
          </div>
        </Overlay>
      )}

      {/* 投稿フォーム */}
      {composing && (
        <Overlay onClose={()=>setComposing(false)} scrollable>
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
            placeholder="いまどんな気持ち？☁️"
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
          <div style={s.divider}/>
         <div style={s.sectionPad}>
            <div style={s.subLabel}>🖼️ 画像を添付する（1枚のみ/人物は載せないでください）</div>
            <input type="file" accept="image/*"
            onChange={e=>setDraftImage(e.target.files[0]||null)}
            style={{fontSize:13,color:C.text}}/>
            {draftImage && (
            <div style={{marginTop:8}}>
            <img src={URL.createObjectURL(draftImage)} alt="preview"
            style={{width:"100%",borderRadius:10,maxHeight:200,objectFit:"cover"}}/>
            <button style={{background:"none",border:"none",color:C.red,fontSize:12,cursor:"pointer",marginTop:4}}
             onClick={()=>setDraftImage(null)}>✕ 画像を削除</button>
          </div>
          )}
          </div>
          <div style={s.charCount}>{draftText.length} / 280</div>
        </Overlay>
      )}

      {/* 掲示板投稿フォーム */}
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

      {/* プロフィール編集 */}
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
              value={profDraft.bio} onChange={e=>setProfDraft(p=>({...p,bio:e.target.value}))} placeholder="育児のこと、趣味、なんでもどうぞ"/>
          </div>
          <div style={{height:20}}/>
        </Overlay>
      )}

      {/* 子ども情報編集 */}
      {childMode&&childDraft && (
        <Overlay onClose={()=>setChildMode(null)}>
          <div style={s.modalHeader}>
            <button style={s.closeBtn} onClick={()=>setChildMode(null)}>✕</button>
            <span style={s.modalTitle}>{childMode==="new"?"子どもを追加":"子ども情報を編集"}</span>
            <button style={s.postBtn} onClick={saveChild}>保存</button>
          </div>
          <div style={s.sectionPad}>
            <div style={s.formLabel}>名前（ニックネームで）</div>
            <input style={s.formInput} value={childDraft.name} onChange={e=>setChildDraft(c=>({...c,name:e.target.value}))} placeholder="例：べびちゃん"/>
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
              {["支援センター","室内遊び場","公園","勉強スペース","その他"].map(t=>(
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
