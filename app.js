const $=s=>document.querySelector(s);
const homeScreen=$("#homeScreen"),gameScreen=$("#gameScreen"),world=$("#world"),player=$("#player");
const levels=[
  {
    title:"Colors",thai:"สี",scene:"Color Garden",theme:"theme-colors",
    words:[
      {w:"red",th:"สีแดง",e:"🔴",x:18,y:28},
      {w:"blue",th:"สีน้ำเงิน",e:"🔵",x:72,y:25},
      {w:"yellow",th:"สีเหลือง",e:"🟡",x:28,y:68},
      {w:"green",th:"สีเขียว",e:"🟢",x:65,y:68},
      {w:"pink",th:"สีชมพู",e:"🩷",x:48,y:46}
    ]
  },
  {
    title:"Classroom Objects",thai:"สิ่งของในห้องเรียน",scene:"Happy Classroom",theme:"theme-classroom",
    words:[
      {w:"book",th:"หนังสือ",e:"📘",x:18,y:28},
      {w:"pencil",th:"ดินสอ",e:"✏️",x:72,y:28},
      {w:"chair",th:"เก้าอี้",e:"🪑",x:25,y:68},
      {w:"bag",th:"กระเป๋า",e:"🎒",x:67,y:67},
      {w:"ruler",th:"ไม้บรรทัด",e:"📏",x:48,y:47}
    ]
  },
  {
    title:"Kitchen",thai:"ห้องครัว",scene:"Kitchen Quest",theme:"theme-kitchen",
    words:[
      {w:"spoon",th:"ช้อน",e:"🥄",x:18,y:28},
      {w:"fork",th:"ส้อม",e:"🍴",x:72,y:26},
      {w:"plate",th:"จาน",e:"🍽️",x:25,y:69},
      {w:"cup",th:"ถ้วย",e:"☕",x:67,y:68},
      {w:"pan",th:"กระทะ",e:"🍳",x:48,y:47}
    ]
  },
  {
    title:"Places in School",thai:"สถานที่ในโรงเรียน",scene:"School Explorer",theme:"theme-school",
    words:[
      {w:"classroom",th:"ห้องเรียน",e:"🏫",x:18,y:27},
      {w:"library",th:"ห้องสมุด",e:"📚",x:72,y:27},
      {w:"canteen",th:"โรงอาหาร",e:"🍽️",x:25,y:68},
      {w:"playground",th:"สนามเด็กเล่น",e:"🛝",x:67,y:68},
      {w:"computer room",th:"ห้องคอมพิวเตอร์",e:"🖥️",x:48,y:47}
    ]
  },
  {
    title:"Places in the City",thai:"สถานที่ในเมือง",scene:"City Mission",theme:"theme-city",
    words:[
      {w:"hospital",th:"โรงพยาบาล",e:"🏥",x:18,y:27},
      {w:"bank",th:"ธนาคาร",e:"🏦",x:72,y:27},
      {w:"market",th:"ตลาด",e:"🛒",x:25,y:68},
      {w:"park",th:"สวนสาธารณะ",e:"🌳",x:67,y:68},
      {w:"police station",th:"สถานีตำรวจ",e:"🚓",x:48,y:47}
    ]
  }
];

let levelIndex=0,px=50,py=82,collected=[],targetIndex=0,nearby=null,objectEls=[];
const step=3.2;

$("#startBtn").onclick=()=>startAdventure(0);
$("#homeBtn").onclick=goHome;
$("#howBtn").onclick=()=>$("#howDialog").showModal();
$("#closeHowBtn").onclick=()=>$("#howDialog").close();
$("#repeatMissionBtn").onclick=speakMission;
$("#actionBtn").onclick=doAction;
$("#restartLevelBtn").onclick=()=>loadLevel(levelIndex);
$("#listenWordBtn").onclick=()=>speakCommand(currentTarget());
$("#collectWordBtn").onclick=collectCurrent;
$("#nextLevelBtn").onclick=()=>{$("#levelDialog").close();loadLevel(levelIndex+1);};
$("#playAgainBtn").onclick=()=>{$("#finishDialog").close();startAdventure(0);};
$("#finishHomeBtn").onclick=()=>{$("#finishDialog").close();goHome();};

document.querySelectorAll("[data-dir]").forEach(btn=>{
  const fn=()=>movePlayer(btn.dataset.dir);
  btn.addEventListener("click",fn);
  btn.addEventListener("touchstart",e=>{e.preventDefault();fn();},{passive:false});
});
document.addEventListener("keydown",e=>{
  const map={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
  if(map[e.key]){e.preventDefault();movePlayer(map[e.key]);}
  if(e.key===" "||e.key==="Enter")doAction();
});

function startAdventure(start){homeScreen.classList.remove("active");gameScreen.classList.add("active");loadLevel(start);}
function goHome(){gameScreen.classList.remove("active");homeScreen.classList.add("active");}
function loadLevel(index){
  levelIndex=index;px=50;py=82;collected=[];targetIndex=0;nearby=null;
  const lv=levels[levelIndex];
  world.className=`world ${lv.theme}`;
  $("#levelTitle").textContent=`Level ${levelIndex+1}: ${lv.title}`;
  $("#missionText").textContent=`${lv.thai} • Collect all 5 words.`;
  $("#levelNo").textContent=levelIndex+1;
  $("#sceneLabel").textContent=lv.scene;
  $("#goalGate").classList.add("locked");$("#gateText").textContent="LOCKED";
  objectEls.forEach(el=>el.remove());objectEls=[];
  lv.words.forEach((item,i)=>{
    const el=document.createElement("button");
    el.className="object-item";
    el.dataset.index=i;
    el.style.left=item.x+"%";el.style.top=item.y+"%";
    el.innerHTML=`<span class="emoji">${item.e}</span><span class="label">${item.w}</span>`;
    el.onclick=()=>{nearby=el;openWordDialog();};
    world.appendChild(el);objectEls.push(el);
  });
  updatePlayer();renderBag();updateProgress();setTarget(0);
  $("#message").textContent="Listen and find the correct word.";
  setTimeout(speakMission,450);
}
function currentTarget(){return levels[levelIndex].words[targetIndex];}
function setTarget(i){
  targetIndex=i;
  if(i<5){
    const t=currentTarget();
    $("#currentMission").textContent=`Pick up ${t.w}.`;
    $("#currentMissionThai").textContent=`เก็บ${t.th}`;
  }else{
    $("#currentMission").textContent="Go to the golden gate.";
    $("#currentMissionThai").textContent="ไปที่ประตูทอง";
  }
}
function speakMission(){
  if(targetIndex<5)speakCommand(currentTarget());
  else speak("Go to the golden gate.");
}
function speakCommand(item){speak(`Pick up ${item.w}.`);}
function movePlayer(dir){
  if(dir==="up")py-=step;if(dir==="down")py+=step;if(dir==="left")px-=step;if(dir==="right")px+=step;
  px=Math.max(3,Math.min(97,px));py=Math.max(6,Math.min(94,py));updatePlayer();checkNearby();checkGate();
}
function updatePlayer(){player.style.left=px+"%";player.style.top=py+"%";}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function checkNearby(){
  nearby=null;let best=999;
  objectEls.forEach(el=>{
    if(el.classList.contains("collected"))return;
    const item=levels[levelIndex].words[Number(el.dataset.index)];
    const d=distance({x:px,y:py},{x:item.x,y:item.y});
    if(d<best){best=d;nearby=el;}
  });
  if(best<9){
    const item=levels[levelIndex].words[Number(nearby.dataset.index)];
    $("#message").textContent=`Press PICK UP: ${item.w}`;
  }else{
    nearby=null;
    $("#message").textContent=targetIndex<5?"Listen carefully and find the correct word.":"Go to the golden gate!";
  }
}
function doAction(){
  if(!nearby){$("#message").textContent="Move closer to the word.";playTone(220,.12);return;}
  const idx=Number(nearby.dataset.index);
  if(idx!==targetIndex){
    const wanted=currentTarget();
    $("#message").textContent=`Not this one. Find ${wanted.w}.`;
    speak(`Not this one. Pick up ${wanted.w}.`);
    playWrong();
    return;
  }
  openWordDialog();
}
function openWordDialog(){
  const item=levels[levelIndex].words[Number(nearby.dataset.index)];
  $("#dialogEmoji").textContent=item.e;$("#dialogWord").textContent=item.w;$("#dialogThai").textContent=item.th;
  $("#dialogCommand").textContent=`Pick up ${item.w}.`;
  $("#wordDialog").showModal();speakCommand(item);
}
function collectCurrent(){
  const idx=Number(nearby.dataset.index),item=levels[levelIndex].words[idx];
  if(idx!==targetIndex)return;
  nearByCollectEffect(item);
  nearby.classList.add("collected");
  collected.push(item);$("#wordDialog").close();nearby=null;
  renderBag();updateProgress();
  targetIndex++;
  if(targetIndex<5){
    setTarget(targetIndex);
    $("#message").textContent=`Great! Next: ${currentTarget().w}`;
    setTimeout(speakMission,550);
  }else{
    $("#goalGate").classList.remove("locked");$("#gateText").textContent="OPEN";
    setTarget(5);$("#message").textContent="All words collected! Go to the gate.";
    speak("Excellent! All words collected. Go to the golden gate.");
    playLevelUp();
  }
}
function nearByCollectEffect(item){
  speak(`Great! ${item.w}.`);
  playCollect();
  navigator.vibrate?.([60,40,90]);
}
function renderBag(){
  const bag=$("#wordBag");bag.innerHTML="";
  collected.forEach(item=>{
    const chip=document.createElement("div");chip.className="word-chip";
    chip.innerHTML=`<span style="font-size:26px">${item.e}</span><div><b>${item.w}</b><small>${item.th}</small></div>`;
    chip.onclick=()=>speak(item.w);bag.appendChild(chip);
  });
}
function updateProgress(){
  $("#stars").textContent=collected.length;$("#progressText").textContent=`${collected.length}/5`;
  $("#progressBar").style.width=`${collected.length*20}%`;
}
function checkGate(){
  if(targetIndex<5)return;
  if(distance({x:px,y:py},{x:91,y:50})<10){
    if(levelIndex<4){
      $("#levelCompleteTitle").textContent=`Level ${levelIndex+1} Complete!`;
      $("#levelCompleteText").textContent=`You collected all 5 ${levels[levelIndex].title.toLowerCase()} words.`;
      $("#levelDialog").showModal();speak("Level complete! Great job!");playWin();
    }else finishAdventure();
  }
}
function finishAdventure(){
  $("#finalSummary").innerHTML=levels.map((lv,i)=>`<div><b>Level ${i+1}: ${lv.title}</b><br><small>${lv.words.map(w=>w.w).join(", ")}</small></div>`).join("");
  $("#finishDialog").showModal();speak("Adventure complete! You collected all twenty five vocabulary words!");playWin();
}
function speak(text){
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang="en-US";u.rate=.8;u.pitch=1.06;speechSynthesis.speak(u);
}
function audioCtx(){window._ac=window._ac||new (window.AudioContext||window.webkitAudioContext)();return window._ac;}
function playTone(freq,duration,type="sine",gain=.12,delay=0){
  const ac=audioCtx(),o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.value=freq;g.gain.value=gain;o.connect(g);g.connect(ac.destination);
  o.start(ac.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+delay+duration);o.stop(ac.currentTime+delay+duration);
}
function playCollect(){playTone(520,.12,"sine",.14);playTone(760,.16,"sine",.13,.11);playTone(980,.2,"triangle",.12,.22);}
function playWrong(){playTone(210,.18,"sawtooth",.1);playTone(160,.22,"sawtooth",.08,.16);}
function playLevelUp(){[440,554,659,880].forEach((f,i)=>playTone(f,.23,"triangle",.1,i*.12));}
function playWin(){[523,659,784,1046].forEach((f,i)=>playTone(f,.3,"triangle",.11,i*.15));}
