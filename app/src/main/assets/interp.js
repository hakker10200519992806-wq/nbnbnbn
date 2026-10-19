/* CppUz simulyator: C++ ning o'quv qismini JS ga o'giradi (massiv, vector, cin, switch, do-while, string...) */
const DT=new Set();
function isD(e){return /\d\.|\.\d|sqrt|pow|static_cast<(?:double|float)>/.test(e)||(e.match(/[A-Za-z_]\w*/g)||[]).some(w=>DT.has(w))}
function skipB(s,i,dir){const a=s[i],p={')':'(',']':'[','(':')','[':']'}[a];let d=0;for(;i>=0&&i<s.length;i+=dir){if(s[i]==a)d++;else if(s[i]==p&&--d==0)return i+dir}return i}
function lhs(s,a){let l=a;for(;;){if(s[l]==')'||s[l]==']'){const par=s[l]==')';l=skipB(s,l,-1);while(l>=0&&(par?/[\w.<>]/:/[\w.]/).test(s[l]))l--}else while(l>=0&&/[\w.]/.test(s[l]))l--;if(l>=0&&s[l]==']')continue;break}return l+1}
function rhs(s,b){let r=b;if(s[r]=='(')r=skipB(s,r,1);else{if(s[r]=='-')r++;while(/[\w.]/.test(s[r]||''))r++}while(s[r]=='('||s[r]=='[')r=skipB(s,r,1);return r}
function fixDiv(s){let q=0;for(let i=0;i<s.length;i++){const c=s[i];if(c=='"'&&s[i-1]!='\\')q=!q;if(q||c!='/'||s[i+1]=='=')continue;
 let a=i-1;while(s[a]==' ')a--;const l=lhs(s,a);let b=i+1;while(s[b]==' ')b++;const r=rhs(s,b);
 const A=s.slice(l,a+1),B=fixDiv(s.slice(b,r)),rep=`__dv(${A},${B},${!isD(A)&&!isD(B)})`;s=s.slice(0,l)+rep+s.slice(r);i=l+rep.length-1}
 return s}
const TYSRC='(?:(?:unsigned\\s+)?(?:long\\s+long|long|int|short)|double|float|string|bool|char)';
const R=(re)=>new RegExp(re.source.replace(/TYPE/g,TYSRC),re.flags);
function runCpp(code,inp){
 const cl=code.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
 if(/\b(cout|cin)\b/.test(cl)&&!/#include\s*<iostream>/.test(cl))return{e:"cout va cin uchun #include <iostream> kerak."};
 if(/\b(sqrt|pow|fabs|floor|ceil)\s*\(/.test(cl)&&!/<cmath>/.test(cl))return{e:"sqrt, pow kabi funksiyalar uchun #include <cmath> kerak."};
 if(!/int\s+main\s*\(/.test(cl))return{e:"main() funksiyasi topilmadi."};
 const ls=cl.split('\n');
 for(let i=0;i<ls.length;i++){const l=ls[i].trim();
  if((/^(cout|cin|return)\b/.test(l)||/^(int|double|string|bool|float|char)\s+\w+\s*(=|,|$)/.test(l))&&!/;$/.test(l)&&!/\{$/.test(l))return{e:`${i+1}-qatorda nuqtali vergul (;) yo'q.`}}
 DT.clear();for(const mm of cl.matchAll(/\b(?:double|float)\s+([^;{()]*)/g))mm[1].split(',').forEach(p=>{const w=p.trim().match(/^\w+/);if(w)DT.add(w[0])});
 for(const mm of cl.matchAll(/vector<\s*(?:double|float)\s*>\s*&?\s*(\w+)/g))DT.add(mm[1]);
 const STR=new Set([...cl.matchAll(/\bstring\s*&?\s*(\w+)/g)].map(x=>x[1])),CH=new Set([...cl.matchAll(/\bchar\s*&?\s*(\w+)/g)].map(x=>x[1]));
 let j=cl.replace(/\bconst\s+/g,'')
 .replace(/\(\s*double\s*\)\s*(\w+)/g,'static_cast<double>($1)').replace(/\(\s*int\s*\)\s*(\w+|'\\?.')/g,'static_cast<int>($1)').replace(/\(\s*char\s*\)\s*(\w+(?:\([^()]*\))?)/g,'static_cast<char>($1)')
 .replace(/static_cast<int>\(\s*([^()]*)\)/g,'static_cast<int>($1)')
 .replace(/(\b\w+(?:\[[^\]]*\])*)\s*([-+])\s*'(\\?.)'/g,"(__ti($1)$2__ti('$3'))")
 .replace(/(\b[A-Za-z_]\w*(?:\[[^\]]*\])*)\s*\/=\s*([^;)]+)/g,'$1 = $1 / ($2)');
 j=fixDiv(j).replace(/#include.*$/gm,'').replace(/using\s+namespace\s+std\s*;/,'')
 .replace(/^\s*(?:int|double|void|string|bool|float|char|long\s+long)\s+\w+\s*\([^)]*\)\s*;\s*$/gm,'')
 .replace(/^\s*(?:int|double|void|string|bool|float|char|long\s+long|vector<\w+>)\s+(\w+)\s*\(([^)]*)\)\s*\{/gm,(m,n,p)=>`function ${n}(${p.replace(/\b(?:vector<\w+>|long\s+long|int|double|string|bool|float|char|auto)\b\s*&?\s*/g,'').replace(/\[\s*\w*\s*\]/g,'')}){`)
 .replace(/\bcout\s*<<([^;]*);/g,(m,r)=>`__o(${r.replace(/<<(?=(?:[^"]*"[^"]*")*[^"]*$)/g,',')});`)
 .replace(/getline\(\s*cin\s*,\s*(\w+)\s*\)/g,'$1=__gl()')
 .replace(/\bcin\s*>>\s*([^;]+);/g,(m,r)=>r.split('>>').map(v=>{v=v.trim();const b=v.replace(/\[.*$/,'');return `${v}=__i(${STR.has(b)?1:CH.has(b)?2:0});`}).join(''))
 .replace(/\bfor\s*\(\s*(?:int|double|string|char|auto|bool|float|long\s+long)\s*&?\s*(\w+)\s*:\s*([^)]+)\)/g,'for(let $1 of $2)')
 .replace(R(/\bTYPE\s+(\w+)\s*\[[^\]]*\]\s*\[[^\]]*\]\s*=\s*\{(\s*\{[\s\S]*?\}\s*)\}\s*;/g),(m,n,b)=>`let ${n}=[${b.replace(/\{/g,'[').replace(/\}/g,']')}];`)
 .replace(R(/\bTYPE\s+(\w+)\s*\[[^\]]*\]\s*=\s*\{([^}]*)\}\s*;/g),'let $1=[$2];')
 .replace(R(/\bTYPE\s+(\w+)\s*\[([^\]]+)\]\s*\[([^\]]+)\]\s*;/g),'let $1=Array.from({length:$2},()=>new Array($3).fill(0));')
 .replace(R(/\bTYPE\s+(\w+)\s*\[([^\]]+)\]\s*;/g),'let $1=new Array($2).fill(0);')
 .replace(/\bvector<[^>]*>\s+(\w+)\s*=\s*\{([^}]*)\}\s*;/g,'let $1=[$2];')
 .replace(/\bvector<[^>]*>\s+(\w+)\s*\(\s*([^,)]+?)\s*(?:,\s*([^)]+))?\)\s*;/g,(m,n,c,v)=>`let ${n}=new Array(${c}).fill(${v||0});`)
 .replace(/\bvector<[^>]*>\s+(\w+)\s*;/g,'let $1=[];')
 .replace(/\.push_back\(/g,'.push(').replace(/\.pop_back\(\)/g,'.pop()').replace(/(\b\w+(?:\[[^\]]*\])*)\.empty\(\)/g,'($1.length==0)')
 .replace(/(\w+)\.back\(\)/g,'$1[$1.length-1]').replace(/(\w+)\.front\(\)/g,'$1[0]').replace(/\.at\(([^()]*)\)/g,'[$1]')
 .replace(/\.find\(/g,'.indexOf(').replace(/string::npos/g,'-1')
 .replace(/\bsort\s*\(\s*(\w+)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g,'$1=__sort($1)').replace(/\bsort\s*\(\s*(\w+)\s*,\s*\1\s*\+\s*([^)]+)\)/g,'$1=__sort($1,$2)')
 .replace(/\breverse\s*\(\s*(\w+)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g,'$1=__rev($1)')
 .replace(/\bswap\s*\(\s*(\w+(?:\[[^\]]*\])*)\s*,\s*(\w+(?:\[[^\]]*\])*)\s*\)/g,'[$1,$2]=[$2,$1]')
 .replace(/\b(?:(?:unsigned\s+)?(?:long\s+long|long|int|short)|double|float|string|bool|char|auto)\s+(?=\w+\s*(?:=|;|,))/g,'let ')
 .replace(/\bfor\s*\(((?:[^;()]|\([^()]*\))*);((?:[^;()]|\([^()]*\))*);((?:[^()]|\([^()]*\))*)\)/g,(m,a,b,c)=>`for(${a};(${b.trim()||'true'})&&__g();${c})`)
 .replace(/\bwhile\s*\(((?:[^()]|\([^()]*\))*)\)/g,'while(($1)&&__g())')
 .replace(/\.(?:length|size)\(\)/g,'.length').replace(/static_cast<int>\(/g,'__ti(').replace(/static_cast<char>\(/g,'__tc(').replace(/static_cast<\w+>/g,'');
 let out='',n=0,fx=false,pr=6,raw=String(inp||''),ip=0;
 const f=v=>{if(v&&v.f===1){fx=true;return''}if(v&&v.p!==undefined){pr=v.p;return''}
  return typeof v=='boolean'?(v?1:0):typeof v=='number'&&(fx||!Number.isInteger(v))?(fx?v.toFixed(pr):+v.toPrecision(pr)):v};
 const cc=c=>typeof c=='string'?(c.length?c.charCodeAt(0):0):c,ti=x=>typeof x=='string'?cc(x):Math.trunc(x),tc=x=>typeof x=='string'?x:String.fromCharCode(x);
 const up=c=>{const k=cc(c);return k>=97&&k<=122?k-32:k},lo=c=>{const k=cc(c);return k>=65&&k<=90?k+32:k};
 const nm=c=>{const k=cc(c);return k>=48&&k<=57},lw=c=>{const k=cc(c);return k>=97&&k<=122},uw=c=>{const k=cc(c);return k>=65&&k<=90};
 const cmp=(x,y)=>typeof x=='string'?(x<y?-1:x>y?1:0):x-y;
 const sortF=(a,m)=>{if(typeof a=='string')return[...a].sort().join('');const k=m===undefined?a.length:+m,p=a.slice(0,k).sort(cmp);for(let i=0;i<k;i++)a[i]=p[i];return a};
 const revF=a=>typeof a=='string'?[...a].reverse().join(''):a.reverse();
 const rdI=k=>{while(ip<raw.length&&/\s/.test(raw[ip]))ip++;let s=ip;while(ip<raw.length&&!/\s/.test(raw[ip]))ip++;let t=raw.slice(s,ip);if(k==2&&t.length>1){ip=s+1;t=t[0]}if(k==1||k==2)return t;const v=parseFloat(t);return isNaN(v)?0:v};
 const rdL=()=>{if(raw[ip]=='\n')ip++;let s=ip;while(ip<raw.length&&raw[ip]!='\n')ip++;const t=raw.slice(s,ip);ip++;return t.replace(/\r$/,'')};
 try{new Function('__o','__g','__dv','endl','sqrt','pow','abs','round','floor','ceil','fabs','min','max','to_string','__i','__gl','__ti','__tc','__sort','__rev','toupper','tolower','isdigit','isalpha','isupper','islower','isalnum','isspace','stoi','stod','fixed','setprecision','fmod','log','sin','cos',
 '{'+j+';return main();}')(
 (...a)=>{out+=a.map(f).join('');if(out.length>2e5)throw new Error('LOOP')},()=>{if(++n>5e5)throw new Error('LOOP');return true},(a,b,i)=>{if(i){if(b===0)throw new Error('DIV0');return Math.trunc(a/b)}return a/b},'\n',
 Math.sqrt,Math.pow,Math.abs,Math.round,Math.floor,Math.ceil,Math.abs,Math.min,Math.max,String,rdI,rdL,ti,tc,sortF,revF,up,lo,nm,c=>lw(c)||uw(c),uw,lw,c=>nm(c)||lw(c)||uw(c),c=>/\s/.test(tc(cc(c))),
 s=>parseInt(s),s=>parseFloat(s),{f:1},p=>({p}),(a,b)=>a%b,Math.log,Math.sin,Math.cos)}
 catch(x){if(x.message=='LOOP')return{e:"Cheksiz tsikl aniqlandi!",loop:1};
  if(x.message=='DIV0')return{e:"Nolga bo'lish mumkin emas!"};
  if(x.name=='ReferenceError')return{e:`'${x.message.split(' ')[0]}' e'lon qilinmagan.`};
  if(x.name=='RangeError')return{e:"Massiv o'lchami yoki rekursiya chuqurligi noto'g'ri (stack overflow)."};
  return{e:"Sintaksis xato: qavs, qo'shtirnoq yoki ; ni tekshiring."}}
 return{o:out};
}
