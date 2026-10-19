/* Robot: talabchan va hissiyotli ustoz */
(function(){
const ri=a=>a[Math.floor(Math.random()*a.length)];
const att={};
window.RM={
 ok(c){const n=att[c]||0;att[c]=0;
  if(n==0)return ri(["Birinchi urinishdayoq?! Mana shunday ishlash kerak! 🤩⭐","Ajoyib!!! Ko'zlarimga ishonmayapman! Shu darajani doim talab qilaman! 💛"])+" ";
  if(n<3)return ri(["Mana! Men senga ishongan edim 💛 Shu g'ayratni tashlama!","Bo'ldi-ku! Demak, yana bir oz diqqat — va hammasi joyida."])+" ";
  return "Nihoyat!.. Qanchalik qiynalding, lekin taslim bo'lmading — buni juda qadrlayman 🥹 Keyingisida tezroq, kelishdikmi? 😤💛 "},
 mood(c){const n=att[c]||0;return n>=3?'dizzy':n==2?'sad':'grumpy'},
 bad(c,o,h){const n=att[c]=(att[c]||0)+1;
  if(n==1)return `Yo'q, bu emas! Kutilgan natija: "${o}". ${h} Qayta urin, men kutaman! 🧐`;
  if(n==2)return `Yana xato?! Topshiriqni diqqat bilan o'qi! Kutilgan: "${o}". ${h} 😤`;
  return `Jiddiyroq bo'laylik! ${n} marta urinding. Kutilgan: "${o}". ${h} Sen buni eplaysan, bilaman! 😢💪`},
 err(c,e){const n=att[c]=(att[c]||0)+1;
  return n<3?`Xato chiqdi: ${e} Kodni o'zing tuzat — men senga ishonaman! 🧐`:`Yana xato: ${e} Sekinroq, har qatorni o'qib chiq. Shoshilma, lekin taslim ham bo'lma! 😢`},
 quiz(){return ri(["Yo'q! Diqqat bilan o'qi, shoshilma! 😤","Noto'g'ri... Dars matniga qaytib, yana o'ylab ko'r! 🧐","Hmm, bu emas. Men sendan ko'proq kutgandim! 😢"])},
 demo(c){const n=att[c]||0;return n>=2?'':"Voy-voy, hademay yordam so'raysanmi?! 😤 Avval o'zing kamida 2 marta urinib ko'r. Men faqat urinib ko'rganlarga yordam beraman!"}
};
try{NUD.length=0;NUD.push(
"Nega to'xtading?! Topshiriq kutyapti! 😤",
"Men shu yerda kutib turibman... Bitta qator bo'lsa ham yoz! 🥺",
"Bugungi darsni tugatmasdan ketma, eshityapsanmi?! 😠",
"Sen buni eplaysan! Lekin urinib ko'rmasang, bilmaysan! 💪",
"Har kuni bir oz — shunda dasturchi bo'lasan. Boshla! ⭐",
"Meni yolg'iz qoldirma... Kod yozaylik, iltimos! 😢",
"Vaqtni boy berma! Klaviaturaga qo'lingni qo'y! ⌨️😤",
"Qani, bitta topshiriq! Men sendan ko'p narsa kutaman! 🤖💛"
)}catch(e){}
try{const gap=Date.now()-PREV_ACTIVE;if(PREV_ACTIVE&&gap>20*36e5&&S&&Object.keys(S.c||{}).length){const d=Math.max(1,Math.round(gap/864e5));
 setTimeout(()=>say(`${d} kun qayerda eding?! Men seni sog'indim, lekin xafaman ham 😢 Bugun kamida 2 ta dars qilamiz — va'da ber!`,'cry',10000),10500)}}catch(e){}
})();
