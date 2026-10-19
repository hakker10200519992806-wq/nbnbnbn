/* Erkin kod muhiti: o'z kodingizni yozing, kirish (cin) bering va ishga tushiring */
(function(){
const KEY='cppuz_pg_code',KI='cppuz_pg_in';
const H='#include <iostream>\nusing namespace std;\n\nint main() {\n';
const E='\n    return 0;\n}';
const TPL={
 "Salom":H+'    cout << "Salom, dunyo!" << endl;'+E,
 "Kiritish (cin)":H+'    int a, b;\n    cin >> a >> b;\n    cout << "Yig\'indi: " << a + b << endl;'+E,
 "if / else":H+'    int n;\n    cin >> n;\n    if (n % 2 == 0) {\n        cout << "Juft" << endl;\n    } else {\n        cout << "Toq" << endl;\n    }'+E,
 "for jadvali":H+'    for (int i = 1; i <= 5; i++) {\n        for (int j = 1; j <= 5; j++) {\n            cout << i * j << " ";\n        }\n        cout << endl;\n    }'+E,
 "Massiv":H.replace('<iostream>','<iostream>')+'    int a[5] = {5, 3, 8, 1, 9};\n    int mx = a[0];\n    for (int i = 1; i < 5; i++) {\n        if (a[i] > mx) mx = a[i];\n    }\n    cout << "Eng katta: " << mx << endl;'+E
};
const st=document.createElement('style');
st.textContent='#pg{position:fixed;inset:0;z-index:9999;background:var(--bg,#0d1117);color:var(--tx,#e6edf3);display:none;flex-direction:column;gap:8px;padding:10px;overflow:auto}#pg.on{display:flex}#pg textarea{width:100%;box-sizing:border-box;background:var(--s2,#161b22);color:inherit;border:1px solid var(--s3,#30363d);border-radius:10px;padding:10px;font:14px/1.5 ui-monospace,Menlo,Consolas,monospace;tab-size:4;resize:vertical}#pgc{min-height:44vh}#pgi{min-height:54px}#pgo{background:#000;color:#39ff14;padding:10px;border-radius:10px;min-height:90px;white-space:pre-wrap;font:14px/1.5 ui-monospace,monospace;margin:0}#pgo.er{color:#ff6b6b}#pg .r{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#pg select{background:var(--s2,#161b22);color:inherit;border:1px solid var(--s3,#30363d);border-radius:8px;padding:6px}#pg h3{margin:0;flex:1}';
document.head.appendChild(st);
const d=document.createElement('div');d.id='pg';
d.innerHTML='<div class="r"><h3>🧪 Erkin kod muhiti</h3><select id="pgt"><option value="">Namuna tanlang…</option>'+Object.keys(TPL).map(k=>`<option>${k}</option>`).join('')+'</select><button class="bt p" id="pgr">▶ Ishga tushirish</button><button class="bt" id="pgx">✖ Yopish</button></div><textarea id="pgc" spellcheck="false" autocapitalize="off" autocorrect="off"></textarea><div>Kirish (cin uchun, bo\'sh joy yoki yangi qator bilan):</div><textarea id="pgi" spellcheck="false"></textarea><pre id="pgo">Natija shu yerda chiqadi…</pre>';
document.body.appendChild(d);
const c=d.querySelector('#pgc'),i=d.querySelector('#pgi'),o=d.querySelector('#pgo');
try{c.value=localStorage.getItem(KEY)||TPL["Salom"];i.value=localStorage.getItem(KI)||''}catch(e){c.value=TPL["Salom"]}
const save=()=>{try{localStorage.setItem(KEY,c.value);localStorage.setItem(KI,i.value)}catch(e){}};
function run(){save();const r=runCpp(c.value,i.value);if(r.e){o.className='er';o.textContent='Xato: '+r.e}else{o.className='';o.textContent=r.o||"(chiqish yo'q)"}}
d.querySelector('#pgr').onclick=run;
d.querySelector('#pgx').onclick=()=>{save();d.classList.remove('on')};
d.querySelector('#pgt').onchange=e=>{if(TPL[e.target.value]){c.value=TPL[e.target.value];save()}e.target.value=''};
c.addEventListener('keydown',e=>{if(e.key=='Tab'){e.preventDefault();const s=c.selectionStart;c.setRangeText('    ',s,c.selectionEnd,'end')}else if(e.key=='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}});
c.addEventListener('input',save);i.addEventListener('input',save);
const b=document.createElement('button');b.className='bt';b.id='pgb';b.textContent='🧪 Erkin muhit';b.title="O'z kodingizni yozing";
b.onclick=()=>d.classList.add('on');
const hd=document.querySelector('header');(hd||document.body).appendChild(b);
})();
