const results=document.getElementById("results");
const names=()=>[...document.querySelectorAll(".name-input")].map((el,i)=>el.value.trim()||`Player ${i+1}`);
let audioEnabled=false,roundCount=0,gameOverAnnounced=false;
let gameAudioContext=null,availableVoices=[],winnerReminderTimer=null,highestSpeakTimer=null,lastSpokenHighest="";
let selectedVoiceLanguage="en-US";
const voicePhrases={
 "en-US":{enabled:"Voice and applause are enabled.",won:"Won",gameOver:"Game Over"},
 "bn-BD":{enabled:"ভয়েস এবং হাততালি চালু হয়েছে।",won:"জয়ী",gameOver:"খেলা শেষ"},
 "hi-IN":{enabled:"आवाज़ और तालियाँ चालू हैं।",won:"जीत गए",gameOver:"खेल समाप्त"},
 "ur-PK":{enabled:"آواز اور تالیاں فعال ہیں۔",won:"جیت گئے",gameOver:"کھیل ختم"},
 "es-ES":{enabled:"La voz y los aplausos están activados.",won:"ganó",gameOver:"Fin del juego"}
};

const UI={
 "en-US":{title:"🏆 Number Winner Game",subtitle:"Edit the names and enter the numbers",voice:"🔊 Voice",add:"➕ Add",winner:"📣 Winner",reset:"↻ Reset",rounds:"Total Rounds:",ready:"Ready to Play!",won:"Won The Game",enter:"Enter Number",voiceTitle:"Enable Voice and Clap",addTitle:"Add Next Row",winnerTitle:"Announce Latest Winner",resetTitle:"Reset Game",round:"Round",wins:"wins with",added:"added. Enter four numbers (1–4 digits).",resetMsg:"Game reset. Player names are unchanged.",confirm:"Clear all rounds and totals?",selected:"Voice language selected",voiceEnabled:"Voice enabled. Winner name will be announced every 15 minutes while this page stays open.",voiceUnsupported:"Voice is not supported by this browser. Try Safari or Chrome with sound enabled.",gameOver:"Game Over",and:"and",player:"Player"},
 "bn-BD":{title:"🏆 নাম্বার বিজয়ী খেলা",subtitle:"নাম পরিবর্তন করুন এবং সংখ্যা লিখুন",voice:"🔊 ভয়েস",add:"➕ যোগ",winner:"📣 বিজয়ী",reset:"↻ রিসেট",rounds:"মোট রাউন্ড:",ready:"খেলার জন্য প্রস্তুত!",won:"জয়ী",enter:"সংখ্যা লিখুন",voiceTitle:"ভয়েস ও হাততালি চালু করুন",addTitle:"নতুন রাউন্ড যোগ করুন",winnerTitle:"সর্বশেষ বিজয়ী ঘোষণা করুন",resetTitle:"খেলা রিসেট করুন",round:"রাউন্ড",wins:"জিতেছে",added:"যোগ হয়েছে। চারটি সংখ্যা লিখুন (১–৪ ডিজিট)।",resetMsg:"খেলা রিসেট হয়েছে। খেলোয়াড়দের নাম অপরিবর্তিত আছে।",confirm:"সব রাউন্ড ও মোট হিসাব মুছে ফেলবেন?",selected:"ভয়েসের ভাষা নির্বাচন করা হয়েছে",voiceEnabled:"ভয়েস চালু হয়েছে। পেজ খোলা থাকলে প্রতি ১৫ মিনিটে বিজয়ীর নাম ঘোষণা হবে।",voiceUnsupported:"এই ব্রাউজারে ভয়েস সমর্থিত নয়। শব্দ চালু রেখে Safari বা Chrome ব্যবহার করুন।",gameOver:"খেলা শেষ",and:"এবং",player:"খেলোয়াড়"},
 "hi-IN":{title:"🏆 नंबर विजेता खेल",subtitle:"नाम बदलें और नंबर दर्ज करें",voice:"🔊 आवाज़",add:"➕ जोड़ें",winner:"📣 विजेता",reset:"↻ रीसेट",rounds:"कुल राउंड:",ready:"खेलने के लिए तैयार!",won:"जीत गए",enter:"नंबर दर्ज करें",voiceTitle:"आवाज़ और तालियाँ चालू करें",addTitle:"अगला राउंड जोड़ें",winnerTitle:"नवीनतम विजेता की घोषणा करें",resetTitle:"गेम रीसेट करें",round:"राउंड",wins:"जीते",added:"जोड़ा गया। चार नंबर दर्ज करें (1–4 अंक)।",resetMsg:"गेम रीसेट हुआ। खिलाड़ियों के नाम नहीं बदले।",confirm:"सभी राउंड और कुल मिटाएँ?",selected:"आवाज़ की भाषा चुनी गई",voiceEnabled:"आवाज़ चालू है। पेज खुला रहने पर हर 15 मिनट में विजेता का नाम बताया जाएगा।",voiceUnsupported:"इस ब्राउज़र में आवाज़ समर्थित नहीं है। आवाज़ चालू करके Safari या Chrome आज़माएँ।",gameOver:"खेल समाप्त",and:"और",player:"खिलाड़ी"},
 "ur-PK":{title:"🏆 نمبر فاتح کھیل",subtitle:"نام تبدیل کریں اور نمبر درج کریں",voice:"🔊 آواز",add:"➕ شامل کریں",winner:"📣 فاتح",reset:"↻ ری سیٹ",rounds:"کل راؤنڈ:",ready:"کھیلنے کے لیے تیار!",won:"جیت گئے",enter:"نمبر درج کریں",voiceTitle:"آواز اور تالیاں فعال کریں",addTitle:"اگلا راؤنڈ شامل کریں",winnerTitle:"تازہ ترین فاتح کا اعلان کریں",resetTitle:"گیم ری سیٹ کریں",round:"راؤنڈ",wins:"جیتے",added:"شامل ہوگیا۔ چار نمبر درج کریں (1–4 ہندسے)۔",resetMsg:"گیم ری سیٹ ہوگیا۔ کھلاڑیوں کے نام تبدیل نہیں ہوئے۔",confirm:"تمام راؤنڈ اور ٹوٹل صاف کریں؟",selected:"آواز کی زبان منتخب ہوگئی",voiceEnabled:"آواز فعال ہے۔ صفحہ کھلا رہنے پر ہر 15 منٹ بعد فاتح کا نام بتایا جائے گا۔",voiceUnsupported:"اس براؤزر میں آواز دستیاب نہیں۔ آواز آن کرکے Safari یا Chrome آزمائیں۔",gameOver:"کھیل ختم",and:"اور",player:"کھلاڑی"},
 "es-ES":{title:"🏆 Juego del Número Ganador",subtitle:"Edita los nombres e introduce los números",voice:"🔊 Voz",add:"➕ Añadir",winner:"📣 Ganador",reset:"↻ Reiniciar",rounds:"Rondas totales:",ready:"¡Listo para jugar!",won:"Ganó",enter:"Introducir número",voiceTitle:"Activar voz y aplausos",addTitle:"Añadir siguiente ronda",winnerTitle:"Anunciar el último ganador",resetTitle:"Reiniciar juego",round:"Ronda",wins:"gana con",added:"añadida. Introduce cuatro números (1–4 dígitos).",resetMsg:"Juego reiniciado. Los nombres de los jugadores no han cambiado.",confirm:"¿Borrar todas las rondas y los totales?",selected:"Idioma de voz seleccionado",voiceEnabled:"Voz activada. El nombre del ganador se anunciará cada 15 minutos mientras esta página esté abierta.",voiceUnsupported:"Este navegador no admite voz. Prueba Safari o Chrome con el sonido activado.",gameOver:"Fin del juego",and:"y",player:"Jugador"}
};
function tr(key){return (UI[selectedVoiceLanguage]||UI["en-US"])[key]||UI["en-US"][key]||key;}
function applyLanguage(){
 document.querySelector("h1").textContent=tr("title");
 document.querySelector(".subtitle").textContent=tr("subtitle");
 document.getElementById("voiceBtn").textContent=tr("voice");
 document.getElementById("addBtn").textContent=tr("add");
 document.getElementById("announceBtn").textContent=tr("winner");
 document.getElementById("resetBtn").textContent=tr("reset");
 document.getElementById("voiceBtn").title=tr("voiceTitle");
 document.getElementById("addBtn").title=tr("addTitle");
 document.getElementById("announceBtn").title=tr("winnerTitle");
 document.getElementById("resetBtn").title=tr("resetTitle");
 document.getElementById("winnerNameInput").placeholder=tr("enter");
 document.querySelectorAll(".number-input").forEach(input=>input.placeholder=tr("enter"));
 document.querySelector(".round-info").firstChild.textContent=tr("rounds")+" ";
 document.querySelectorAll(".name-input").forEach((input,i)=>input.setAttribute("aria-label",`${tr("player")} ${i+1} name`));
 document.getElementById("announcement").textContent=tr("ready");
 updateWinnerMarquee();
}

const WINNER_REMINDER_MS=15*60*1000;
function currentWinnerName(){
 const field=document.getElementById("winnerNameInput");
 return (field?.value||"").trim()||"Winner";
}
function updateWinnerMarquee(){
 const name=currentWinnerName();
 document.getElementById("winnerMarqueeText").textContent=`${name} ${tr("won")}`;
}
function displayHighestTotal(value){
 const message=`Highest Total: ${Number(value).toLocaleString("en-US")}`;
 const announcement=document.getElementById("announcement");
 if(announcement){
  announcement.textContent=message;
  const trophy=document.createElement("span");
  trophy.className="winner-trophy-animation";
  trophy.setAttribute("aria-label","Winning trophy");
  trophy.textContent=" 🫴🏆";
  announcement.appendChild(trophy);
 }
}
function refreshVoices(){
 if("speechSynthesis" in window)availableVoices=speechSynthesis.getVoices()||[];
}
function getVoice(){
 const voices=availableVoices.length?availableVoices:(('speechSynthesis' in window)?speechSynthesis.getVoices():[]);
 const langPrefix=selectedVoiceLanguage.split("-")[0].toLowerCase();
 const matching=voices.filter(v=>v.lang&&v.lang.toLowerCase().startsWith(langPrefix));
 if(!matching.length)return null;
 // Prefer feminine voice names when the device exposes a clearly identified option.
 const femaleHints=/female|woman|samantha|karen|moira|tessa|victoria|zira|susan|ava|allison|google.*female/i;
 return matching.find(v=>femaleHints.test(v.name||''))||matching.find(v=>v.default)||matching[0]||null;
}
if("speechSynthesis" in window){
 refreshVoices();
 speechSynthesis.addEventListener?.("voiceschanged",refreshVoices);
}
function speakText(text,rate=.72,pitch=1.0){
 if(!audioEnabled||!("speechSynthesis" in window))return;
 try{
  speechSynthesis.cancel();
  const msg=new SpeechSynthesisUtterance(text);
  // Soft, calm and clearly articulated delivery; exact voice depends on device language voices.
  msg.lang=selectedVoiceLanguage;
  msg.rate=Math.min(Number(rate)||.72,.78);
  msg.pitch=Math.max(Number(pitch)||1.0,1.12);
  msg.volume=1;
  const voice=getVoice();if(voice)msg.voice=voice;
  speechSynthesis.speak(msg);
 }catch(error){console.warn("Speech playback failed:",error);}
}
async function enableAudio(){
 const status=document.getElementById("status")||{set textContent(value){}};
 if(!("speechSynthesis" in window)){
  status.textContent=tr("voiceUnsupported");
  return;
 }
 audioEnabled=true;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(AC){
   if(!gameAudioContext)gameAudioContext=new AC();
   if(gameAudioContext.state==="suspended")await gameAudioContext.resume();
  }
 }catch(error){console.warn("Audio could not be unlocked:",error);}
 refreshVoices();
 if(winnerReminderTimer)clearInterval(winnerReminderTimer);
 winnerReminderTimer=null;
 status.textContent=tr("voiceEnabled");
}
function announceWinnerReminder(){
 // Periodic winner reminders are disabled.
}
function speakWinner(name,number){
 // Highest-number / round-winner detection is visual only: no clap or spoken number.
 return;
}
function rowInputs(row){return [...row.querySelectorAll(".number-input")];}
const SAVE_KEY="jabjalNumberWinnerGame_v2";
const DB_NAME="JABJALNumberWinnerDB",DB_STORE="gameState";
function captureGame(){
 return {
  names:[...document.querySelectorAll(".name-input")].map(input=>input.value),
  rows:[...results.querySelectorAll("tr")].map(row=>rowInputs(row).map(input=>input.value)),
  winnerName:document.getElementById("winnerNameInput")?.value||"",
  language:selectedVoiceLanguage,
  savedAt:Date.now()
 };
}
function openGameDB(){
 return new Promise((resolve,reject)=>{
  if(!("indexedDB" in window)){reject(new Error("IndexedDB unavailable"));return;}
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(DB_STORE))request.result.createObjectStore(DB_STORE);};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
}
async function saveToIndexedDB(state){
 const db=await openGameDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(DB_STORE,"readwrite");
  tx.objectStore(DB_STORE).put(state,SAVE_KEY);
  tx.oncomplete=()=>{db.close();resolve();};
  tx.onerror=()=>{db.close();reject(tx.error);};
 });
}
async function readFromIndexedDB(){
 const db=await openGameDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(DB_STORE,"readonly"),request=tx.objectStore(DB_STORE).get(SAVE_KEY);
  request.onsuccess=()=>resolve(request.result||null);
  request.onerror=()=>reject(request.error);
  tx.oncomplete=()=>db.close();
 });
}
function saveGame(){
 const state=captureGame();
 let localSaved=false;
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));localSaved=true;}
 catch(error){console.warn("Local storage unavailable:",error);}
 saveToIndexedDB(state).then(()=>{
  const status=document.getElementById("status")||{set textContent(value){}};
  if(status&&status.textContent.startsWith("Auto-save is unavailable"))status.textContent="Auto-save enabled.";
 }).catch(error=>{
  console.warn("IndexedDB save unavailable:",error);
  if(!localSaved){
   const status=document.getElementById("status")||{set textContent(value){}};
   if(status)status.textContent="Auto-save is blocked in this browser. Open the game from a normal website tab (https://), not private mode.";
  }
 });
}
function applySavedGame(state){
 if(!state||!Array.isArray(state.rows))return false;
 if(Array.isArray(state.names)){
  document.querySelectorAll(".name-input").forEach((input,i)=>{if(state.names[i]!==undefined)input.value=state.names[i];});
 }
 if(typeof state.winnerName==="string")document.getElementById("winnerNameInput").value=state.winnerName;
 if(UI[state.language])selectedVoiceLanguage=state.language;
 results.innerHTML="";roundCount=0;gameOverAnnounced=false;lastSpokenHighest="";if(highestSpeakTimer)clearTimeout(highestSpeakTimer);
 state.rows.forEach(values=>{
  addRow(false);
  const row=results.lastElementChild;
  rowInputs(row).forEach((input,i)=>{input.value=String(values?.[i]??"").replace(/\\D/g,"").slice(0,4);});
  evaluateRow(row,false);
 });
 if(!state.rows.length)addRow(false);
 updateTotals();
 document.getElementById("roundCount").textContent=roundCount;
 applyLanguage();
 refreshAll();
 updateWinnerMarquee();
 saveGame();
 return true;
}
function loadGame(){
 try{
  const raw=localStorage.getItem(SAVE_KEY);
  if(raw&&applySavedGame(JSON.parse(raw)))return true;
 }catch(error){console.warn("Could not restore from local storage:",error);}
 return false;
}
async function loadGameFromIndexedDB(){
 try{
  const state=await readFromIndexedDB();
  return applySavedGame(state);
 }catch(error){console.warn("Could not restore from IndexedDB:",error);return false;}
}

function showWinnerAnnouncement(message){
 const target=document.getElementById("announcement");
 if(!target)return;
 target.textContent=message;
 const trophy=document.createElement("span");
 trophy.className="winner-trophy-animation";
 trophy.setAttribute("aria-label","Winning trophy");
 trophy.textContent="🫴🏆";
 target.appendChild(trophy);
}

function checkGameOverVoice(){
 // Game Over depends ONLY on the Highest Total, not the combined total.
 const totals=[0,1,2,3].map(i=>{
  const value=Number((document.getElementById("total"+i)?.textContent||"0").replace(/,/g,""));
  return Number.isFinite(value)?value:0;
 });
 const highestTotal=Math.max(...totals);
 if(highestTotal>=1000&&!gameOverAnnounced){
  gameOverAnnounced=true;
  // Return the event to the caller so Game Over can be spoken after
  // Highest Total in the same utterance (speakText cancels prior speech).
  return true;
 }
 return false;
}
function scheduleHighestTotalVoiceAfterTyping(row){
 // Wait until all four fields in this round are filled, then wait for typing to stop.
 // Add button is not required for the spoken total.
 if(highestSpeakTimer)clearTimeout(highestSpeakTimer);
 const inputs=rowInputs(row);
 const complete=inputs.length===4&&inputs.every(input=>/^\d{1,4}$/.test(input.value.trim()));
 if(!complete||!audioEnabled)return;
 highestSpeakTimer=setTimeout(()=>{
  updateTotals();
  const gameOverNow=checkGameOverVoice();
  const totals=[0,1,2,3].map(i=>Number((document.getElementById("total"+i)?.textContent||"0").replace(/,/g,""))||0);
  const highest=Math.max(...totals);
  if(highest<=0)return;
  const value=String(highest);
  const highestChanged=value!==lastSpokenHighest;
  if(highestChanged){
   lastSpokenHighest=value;
   displayHighestTotal(highest);
  }
  // Speak both messages together so the second one is not cancelled.
  if(highestChanged||gameOverNow){
   const message=`Highest Total: ${Number(value).toLocaleString("en-US")}${gameOverNow?`. ${tr("gameOver")}`:""}`;
   speakText(message,.48,1.08);
  }
 },1500);
}
function updateTotals(){
 const totals=[0,0,0,0];
 [...results.querySelectorAll("tr")].forEach(row=>rowInputs(row).forEach((input,i)=>{
  if(/^\d{1,4}$/.test(input.value.trim()))totals[i]+=Number(input.value);
 }));
 totals.forEach((n,i)=>document.getElementById("total"+i).textContent=n.toLocaleString("en-US"));
 // The marquee winner is always the player(s) with the highest cumulative Total.
 syncWinnerNameFromLatestRow(totals);
}
function evaluateRow(row,announce=true){
 const inputs=rowInputs(row),values=inputs.map(x=>x.value.trim());
 row.querySelectorAll("td").forEach(td=>td.classList.remove("winner-cell"));
 row.querySelectorAll(".row-winner").forEach(el=>el.remove());
 if(!values.every(v=>/^\d{1,4}$/.test(v))){row.dataset.winnerSignature="";row.dataset.winnerIndex="";return;}
 const nums=values.map(Number),max=Math.max(...nums);
 const indexes=nums.map((n,i)=>n===max?i:-1).filter(i=>i>=0);
 indexes.forEach(i=>{
  const td=inputs[i].closest("td");td.classList.add("winner-cell");
 });
 const playerNames=names(),winnerName=indexes.map(i=>playerNames[i]).join(` ${tr("and")} `);
 const signature=values.join("|")+"|"+playerNames.join("|"),changed=row.dataset.winnerSignature!==signature;
 row.dataset.winnerIndex=indexes.join(",");row.dataset.winnerSignature=signature;
 // Keep the winner name box and marquee synced to the actual highest scorer in the latest completed round.
 if(row===results.querySelector("tr:last-child"))syncWinnerNameFromLatestRow();
 // Per-round winner text and speech are intentionally disabled.
 // The only automatic result shown/spoken is the cumulative highest total after typing completes.

}
function refreshAll(){
 updateTotals();
 [...results.querySelectorAll("tr")].forEach(row=>evaluateRow(row,false));
 // Keep the result display reserved for the cumulative highest total.

}
function addNextRowAfterCompletedRound(){
 // Add only creates the next row. Voice is triggered automatically after typing finishes.
 addRow();
}
function addRow(focusFirst=true){
 roundCount++;
 const rowEl=document.createElement("tr");rowEl.dataset.round=String(roundCount);
 const hidden=document.createElement("td");hidden.className="round-cell";hidden.textContent="#"+roundCount;rowEl.appendChild(hidden);
 for(let i=0;i<4;i++){
  const td=document.createElement("td"),input=document.createElement("input");
  input.className="number-input";input.type="text";input.inputMode="numeric";input.autocomplete="off";input.maxLength=4;input.placeholder=tr("enter");
  input.setAttribute("aria-label",`${tr("round")} ${roundCount}, ${names()[i]} number`);
  input.addEventListener("input",()=>{
   input.value=input.value.replace(/\D/g,"").slice(0,4);
   updateTotals();evaluateRow(rowEl,true);scheduleHighestTotalVoiceAfterTyping(rowEl);saveGame();
  });
  td.appendChild(input);rowEl.appendChild(td);
 }
 results.appendChild(rowEl);
 document.getElementById("roundCount").textContent=roundCount;
 (document.getElementById("status")||{set textContent(value){}}).textContent=`${tr("round")} ${roundCount} ${tr("added")}`;
 if(focusFirst) rowEl.querySelector(".number-input").focus();
 saveGame();
}
function playCongratulationSound(){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return 850;
  if(!gameAudioContext)gameAudioContext=new AC();
  const ctx=gameAudioContext;
  if(ctx.state==="suspended")ctx.resume();
  const start=ctx.currentTime+0.03;
  // Original short celebratory three-note fanfare (not an applause sample).
  [[523.25,0],[659.25,.18],[783.99,.36],[1046.5,.56]].forEach(([frequency,offset])=>{
   const osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type="sine";osc.frequency.setValueAtTime(frequency,start+offset);
   gain.gain.setValueAtTime(.0001,start+offset);
   gain.gain.exponentialRampToValueAtTime(.22,start+offset+.025);
   gain.gain.exponentialRampToValueAtTime(.0001,start+offset+.32);
   osc.connect(gain);gain.connect(ctx.destination);
   osc.start(start+offset);osc.stop(start+offset+.34);
  });
  return 1050;
 }catch(error){console.warn("Congratulation sound failed:",error);return 0;}
}
function latestCompletedWinner(currentTotals){
 const totals=currentTotals||[0,1,2,3].map(i=>Number((document.getElementById("total"+i)?.textContent||"0").replace(/,/g,""))||0);
 const highest=Math.max(...totals);
 if(highest<=0)return null;
 const winnerIndexes=totals.map((value,index)=>value===highest?index:-1).filter(index=>index>=0);
 return {name:winnerIndexes.map(index=>names()[index]).join(", "),value:highest};
}
function syncWinnerNameFromLatestRow(currentTotals){
 const winner=latestCompletedWinner(currentTotals);
 if(!winner||!winner.name)return "";
 const field=document.getElementById("winnerNameInput");
 if(field&&field.value!==winner.name){field.value=winner.name;updateWinnerMarquee();saveGame();}
 return winner.name;
}
function announceLatest(){
 const winnerName=syncWinnerNameFromLatestRow();
 if(!winnerName){
  const status=document.getElementById("status");
  if(status)status.textContent="Enter all four numbers in a round before announcing the winner.";
  return;
 }
 audioEnabled=true;
 refreshVoices();
 const delay=playCongratulationSound();
 showWinnerAnnouncement(winnerName+" Won this game. Congratulations!");
 window.setTimeout(()=>speakText(winnerName+" Won this game. Congratulations!",.62,1.08),delay);
}
function clearIndexedDBSave(){
 return openGameDB().then(db=>new Promise((resolve,reject)=>{
  const tx=db.transaction(DB_STORE,"readwrite");
  tx.objectStore(DB_STORE).delete(SAVE_KEY);
  tx.oncomplete=()=>{db.close();resolve();};
  tx.onerror=()=>{db.close();reject(tx.error);};
 }));
}
function resetGame(){
 if(!confirm(tr("confirm")))return;
 results.innerHTML="";roundCount=0;gameOverAnnounced=false;lastSpokenHighest="";if(highestSpeakTimer)clearTimeout(highestSpeakTimer);
 try{localStorage.removeItem(SAVE_KEY);}catch(error){console.warn("Could not clear local save:",error);}
 clearIndexedDBSave().catch(error=>console.warn("Could not clear IndexedDB save:",error));
 document.getElementById("roundCount").textContent="0";
 document.getElementById("announcement").textContent=tr("ready");
 (document.getElementById("status")||{set textContent(value){}}).textContent=tr("resetMsg");
 updateTotals();
}

const languageButton=document.getElementById("languageButton");
const languageMenu=document.getElementById("languageMenu");
languageButton.addEventListener("click",()=>{
 const opening=languageMenu.hidden;
 languageMenu.hidden=!opening;
 languageButton.setAttribute("aria-expanded",String(opening));
});
languageMenu.querySelectorAll("button[data-lang]").forEach(option=>{
 option.addEventListener("click",()=>{
  selectedVoiceLanguage=option.dataset.lang;
  languageMenu.querySelectorAll("button").forEach(item=>item.classList.toggle("active",item===option));
  languageMenu.hidden=true;
  languageButton.setAttribute("aria-expanded","false");
  const languageNames={"en-US":"Eng","bn-BD":"Bang","hi-IN":"Hindi","ur-PK":"Urdu","es-ES":"Span"};
  const status=document.getElementById("status")||{set textContent(value){}};
  applyLanguage();
  saveGame();
  status.textContent=`${tr("selected")}: ${languageNames[selectedVoiceLanguage]}.`;
 });
});
document.addEventListener("click",event=>{
 if(!event.target.closest(".language-picker")){
  languageMenu.hidden=true;
  languageButton.setAttribute("aria-expanded","false");
 }
});


const nameSetupModal=document.getElementById("nameSetupModal");
const setupNameInputs=[0,1,2,3].map(i=>document.getElementById(`setupName${i}`));
function openNameSetup(){
 const currentNames=names();
 setupNameInputs.forEach((input,i)=>input.value=currentNames[i]);
 nameSetupModal.style.display="flex";
}
document.getElementById("savePlayerNames").addEventListener("click",()=>{
 const defaultNames=["Bappi","Nahid","Mijan","Montu"];
 const values=setupNameInputs.map((input,i)=>input.value.trim()||defaultNames[i]);
 document.querySelectorAll(".name-input").forEach((input,i)=>input.value=values[i]);
 saveGame();
 updateWinnerMarquee();
 nameSetupModal.style.display="none";
});

document.getElementById("cancelPlayerNames").addEventListener("click",()=>{
 // Close the setup popup without applying its temporary edits.
 // Player names remain editable directly in the game table.
 nameSetupModal.style.display="none";
});

// Name setup popup temporarily disabled; edit player names directly in the table.
document.getElementById("winnerNameInput").addEventListener("input",()=>{updateWinnerMarquee();saveGame();});
document.getElementById("footerYear").textContent=new Date().getFullYear();
applyLanguage();
updateWinnerMarquee();
document.getElementById("addBtn").addEventListener("click",addNextRowAfterCompletedRound);
document.getElementById("voiceBtn").addEventListener("click",enableAudio);
document.getElementById("announceBtn").addEventListener("click",announceLatest);
document.getElementById("resetBtn").addEventListener("click",resetGame);
document.querySelectorAll(".name-input").forEach(input=>input.addEventListener("input",()=>{
 document.querySelectorAll("#results tr").forEach(row=>rowInputs(row).forEach((x,i)=>x.setAttribute("aria-label",`Round ${row.dataset.round}, ${names()[i]} number`)));
 refreshAll();
 saveGame();
}));
if("speechSynthesis"in window)speechSynthesis.getVoices();
// Restore from local storage first, then IndexedDB for browsers where local storage is unavailable.
(async()=>{
 if(loadGame())return;
 if(await loadGameFromIndexedDB())return;
 addRow(false);
})();


// Keep the player-name header immediately below the sticky marquee/menu on all screen sizes.
(function setupStickyGameHeader(){
  const stickyTop = document.getElementById('stickyGameTop');
  if (!stickyTop) return;
  const updateStickyOffset = () => {
    const height = stickyTop.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--jabjal-sticky-header-offset', `${Math.ceil(height)}px`);
  };
  updateStickyOffset();
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(updateStickyOffset);
    observer.observe(stickyTop);
  }
  window.addEventListener('resize', updateStickyOffset, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(updateStickyOffset, 100), { passive: true });
})();
