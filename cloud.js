import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, onSnapshot, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const info=document.getElementById('authInfo');
const loginBtn=document.getElementById('loginBtn');
const cloudState=document.getElementById('cloudState');
const logoutBtn=document.getElementById('logoutBtn');
const invalid=Object.values(firebaseConfig).some(v => !v || String(v).startsWith('PASTE_'));
if(invalid){info.textContent='관리자 설정이 아직 끝나지 않았습니다. firebase-config.js에 Firebase 프로젝트 정보를 입력하세요.'; cloudState.textContent='설정 필요';}
else {
  const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
  const provider=new GoogleAuthProvider();
  let unsubscribe=null, uid=null, initialized=false, saveTimer=null, saving=Promise.resolve(), pending=null, lastSaved='', dirty=false;
  const state=(msg,bad=false)=>{cloudState.textContent=msg;cloudState.className=bad?'warn':'good';};
  async function saveNow(){
    if(!uid || !initialized || !dirty)return;
    const id=uid, payload=pending;
    dirty=false;
    saving=saving.then(async()=>{
      state('저장 중…');
      await setDoc(doc(db,'users',id,'data','orders'),{orders:payload,updatedAt:serverTimestamp()});
      lastSaved=JSON.stringify(payload);state('✓ 클라우드 저장됨');
    }).catch(err=>{dirty=true;state('저장 오류 · 다시 시도하세요',true);console.error(err);});
    await saving;
  }
  window.saveCloudOrders=function(data){
    if(!uid||!initialized)return;
    pending=JSON.parse(JSON.stringify(data));dirty=true;state('저장 대기 중…');
    clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,350);
  };
  loginBtn.disabled=false;
  loginBtn.onclick=async()=>{try{info.textContent='Google 로그인 중…';await signInWithPopup(auth,provider);}catch(e){
    if(e.code==='auth/popup-blocked'){await signInWithRedirect(auth,provider);return;}
    info.textContent='로그인 실패: '+e.message;
  }};
  logoutBtn.onclick=async()=>{await saveNow();await signOut(auth);};
  getRedirectResult(auth).catch(e=>{info.textContent='로그인 오류: '+e.message;});
  onAuthStateChanged(auth,user=>{
    if(unsubscribe){unsubscribe();unsubscribe=null;}
    uid=user?.uid||null; initialized=false;dirty=false;clearTimeout(saveTimer);
    if(!user){window.clearCloudData();state('로그인 필요');info.textContent='Google 계정으로 로그인하여 저장된 주문을 불러오세요.';return;}
    info.textContent='주문 데이터를 불러오는 중…';state('불러오는 중…');
    unsubscribe=onSnapshot(doc(db,'users',user.uid,'data','orders'),snap=>{
      const remote=snap.exists()?snap.data().orders||[]:[];
      const serialized=JSON.stringify(remote);
      if(initialized && (dirty || serialized===lastSaved))return;
      lastSaved=serialized;initialized=true;
      window.setCloudData(remote,user.uid);
      state('✓ '+(user.email||'Google 계정')+' · 클라우드 연결됨');
    },err=>{state('읽기 오류',true);info.textContent='데이터를 불러오지 못했습니다: '+err.message;window.clearCloudData();});
  });
}
