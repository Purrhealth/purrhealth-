import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════
   PURRHEALTH — Complete Unified App v1.0
   Features: Profiles · Appointments · Weight curves
            · Vaccines · Document Scanner (AI)
   ═══════════════════════════════════════════════ */

// ── Palette ──────────────────────────────────────
const C = {
  bg:"#0D1117", s1:"#161B22", s2:"#1C2128", s3:"#21262D",
  border:"#30363D", teal:"#00C9A7", tealD:"#00C9A718",
  tealB:"#00C9A740", gold:"#F0A500", goldD:"#F0A50018",
  coral:"#FF6B6B", coralD:"#FF6B6B18", blue:"#4FC3F7",
  blueD:"#4FC3F718", purple:"#C77DFF", purpleD:"#C77DFF18",
  green:"#3FB950", greenD:"#3FB95018", text:"#E6EDF3",
  muted:"#8B949E", white:"#FFFFFF",
};

// ── Storage ──────────────────────────────────────
async function sGet(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}}
async function sSet(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch{}}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);

// ── Constants ─────────────────────────────────────
const EMOJIS=["🐱","🐈","🐈‍⬛","😸","😺","😻","🦁","🐯"];
const VACCINES=["Typhus (PanLeucoPénie)","Coryza","Leucose (FeLV)","Rage","Chlamydia","FIV/FeLV test"];
const APPT_TYPES=[
  {id:"consultation",label:"Consultation",icon:"🩺",color:C.teal},
  {id:"vaccination",label:"Vaccination",icon:"💉",color:C.blue},
  {id:"toilettage",label:"Toilettage",icon:"✂️",color:C.gold},
  {id:"urgence",label:"Urgence",icon:"🚨",color:C.coral},
  {id:"controle",label:"Contrôle",icon:"📋",color:C.purple},
  {id:"chirurgie",label:"Chirurgie",icon:"⚕️",color:C.coral},
];
const DOC_TYPES=[
  {id:"vaccine",label:"Vaccins",icon:"💉",color:C.blue},
  {id:"ordonnance",label:"Ordonnance",icon:"📋",color:C.coral},
  {id:"analyse",label:"Analyses",icon:"🔬",color:C.purple},
  {id:"facture",label:"Facture",icon:"🧾",color:C.gold},
  {id:"pedigree",label:"Pedigree",icon:"🧬",color:C.green},
  {id:"autre",label:"Autre",icon:"📄",color:C.muted},
];
const CAT_COLORS=[C.teal,C.gold,C.coral,C.blue,C.purple,C.green];

// ── Helpers ───────────────────────────────────────
function fmtDate(d){if(!d)return"—";return new Date(d+"T00:00:00").toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});}
function daysUntil(d){if(!d)return null;const t=new Date();t.setHours(0,0,0,0);return Math.round((new Date(d+"T00:00:00")-t)/86400000);}
function calcAge(b){if(!b)return"?";const m=(new Date()-new Date(b))/2629800000;return m<24?`${Math.round(m)} mois`:`${Math.floor(m/12)} ans`;}
function dtOf(id){return DOC_TYPES.find(d=>d.id===id)||DOC_TYPES[DOC_TYPES.length-1];}
function atOf(id){return APPT_TYPES.find(a=>a.id===id)||APPT_TYPES[0];}

// ── AI Scanner ────────────────────────────────────
async function aiScan(b64,mime,catName){
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",max_tokens:1000,
      messages:[{role:"user",content:[
        {type:"image",source:{type:"base64",media_type:mime,data:b64}},
        {type:"text",text:`Analyse ce document vétérinaire pour le chat "${catName}". Réponds UNIQUEMENT en JSON valide sans markdown:\n{"type":"vaccine|ordonnance|analyse|facture|pedigree|autre","title":"Titre court","date":"YYYY-MM-DD ou null","veterinaire":"nom ou null","clinique":"nom ou null","resume":"Résumé 2-3 phrases","informations":[{"label":"Clé","valeur":"Valeur"}],"alertes":[]}`}
      ]}]
    })
  });
  const data=await res.json();
  const raw=data.content?.find(b=>b.type==="text")?.text||"{}";
  try{return JSON.parse(raw.replace(/```json|```/g,"").trim());}
  catch{return{type:"autre",title:"Document scanné",date:null,veterinaire:null,clinique:null,resume:"Document analysé.",informations:[],alertes:[]};}
}

// ── Global CSS ────────────────────────────────────
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Jura:wght@300;400;500&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
body{margin:0;background:#0D1117;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#30363D;border-radius:4px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes scanLine{0%{top:8%}100%{top:88%}}
@keyframes glow{0%,100%{box-shadow:0 0 8px #00C9A740}50%{box-shadow:0 0 20px #00C9A780}}
.fadeUp{animation:fadeUp .35s ease both}
.pulse{animation:pulse 1.8s ease-in-out infinite}
.spin{animation:spin 1s linear infinite}
.scanAnim{position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#00C9A7,transparent);box-shadow:0 0 12px #00C9A7;animation:scanLine 1.5s ease-in-out infinite;}
input,select,textarea{color:#E6EDF3!important;}
input::placeholder{color:#8B949E!important;}
`;

// ── Shared style builders ─────────────────────────
const card=(extra={})=>({background:C.s1,border:`1px solid ${C.border}`,borderRadius:14,padding:14,...extra});
const btn=(col=C.teal,ghost=false,extra={})=>({background:ghost?"transparent":`${col}22`,border:`1px solid ${ghost?C.border:col+"55"}`,color:ghost?C.muted:col,borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Outfit,sans-serif",display:"inline-flex",alignItems:"center",gap:6,transition:"all .2s",...extra});
const badge=(col)=>({display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,color:col,background:col+"22",border:`1px solid ${col}44`});
const inp={width:"100%",background:C.s2,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",color:C.text,fontSize:14,fontFamily:"Outfit,sans-serif",outline:"none",boxSizing:"border-box"};
const lbl={fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".8px",marginBottom:5,display:"block"};
const sec={fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:8,marginTop:2};

// ══════════════════════════════════════════════════
//  MODAL WRAPPER
// ══════════════════════════════════════════════════
function Modal({children,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.s1,borderRadius:"20px 20px 0 0",padding:"24px 18px 36px",width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}} className="fadeUp">
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  WEIGHT CHART (multi-cat)
// ══════════════════════════════════════════════════
function WeightChart({cats,weights}){
  const allSeries=cats.map((cat,i)=>({
    cat,color:CAT_COLORS[i%CAT_COLORS.length],
    points:(weights[cat.id]||[]).sort((a,b)=>new Date(a.date)-new Date(b.date))
  })).filter(s=>s.points.length>0);

  if(allSeries.length===0)return(
    <div style={{textAlign:"center",padding:"24px",color:C.muted,fontSize:13}}>
      <div style={{fontSize:36,marginBottom:8}}>⚖️</div>
      Aucune donnée de poids enregistrée
    </div>
  );

  const allWeights=allSeries.flatMap(s=>s.points.map(p=>p.weight));
  const allDates=allSeries.flatMap(s=>s.points.map(p=>new Date(p.date)));
  const minW=Math.min(...allWeights)-.3;
  const maxW=Math.max(...allWeights)+.3;
  const minD=new Date(Math.min(...allDates));
  const maxD=new Date(Math.max(...allDates));
  const rangeD=maxD-minD||1;
  const W=320,H=140,PX=32,PY=16;
  const CW=W-PX*2,CH=H-PY*2;
  const px=d=>(PX+(new Date(d)-minD)/rangeD*CW);
  const py=w=>(PY+CH-(w-minW)/(maxW-minW)*CH);

  const yTicks=3;
  const yStep=(maxW-minW)/(yTicks-1);

  return(
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",overflow:"visible"}}>
        {/* Grid */}
        {Array.from({length:yTicks},(_,i)=>{
          const w=minW+i*yStep;
          const y=py(w);
          return(<g key={i}>
            <line x1={PX} y1={y} x2={W-PX} y2={y} stroke={C.border} strokeWidth=".5" strokeDasharray="3,3"/>
            <text x={PX-4} y={y+4} textAnchor="end" fill={C.muted} fontSize="8">{w.toFixed(1)}</text>
          </g>);
        })}
        {/* Lines per cat */}
        {allSeries.map(({cat,color,points})=>(
          <g key={cat.id}>
            {/* Line */}
            {points.map((p,i)=>{
              if(i===0)return null;
              const p0=points[i-1];
              return(<line key={i} x1={px(p0.date)} y1={py(p0.weight)} x2={px(p.date)} y2={py(p.weight)} stroke={color} strokeWidth="2" strokeLinecap="round"/>);
            })}
            {/* Dots */}
            {points.map((p,i)=>(
              <g key={i}>
                <circle cx={px(p.date)} cy={py(p.weight)} r="5" fill={C.bg} stroke={color} strokeWidth="2"/>
                <circle cx={px(p.date)} cy={py(p.weight)} r="2.5" fill={color}/>
              </g>
            ))}
          </g>
        ))}
        {/* X label */}
        <text x={PX} y={H-2} fill={C.muted} fontSize="8">{minD.toLocaleDateString("fr-FR",{month:"short",year:"2-digit"})}</text>
        {rangeD>0&&<text x={W-PX} y={H-2} textAnchor="end" fill={C.muted} fontSize="8">{maxD.toLocaleDateString("fr-FR",{month:"short",year:"2-digit"})}</text>}
      </svg>
      {/* Legend */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
        {allSeries.map(({cat,color,points})=>(
          <div key={cat.id} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:12,height:3,background:color,borderRadius:2}}/>
            <span style={{fontSize:11,color:C.muted}}>{cat.emoji} {cat.name}</span>
            <span style={{fontSize:11,color:color,fontWeight:700}}>{points[points.length-1].weight}kg</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  FORMS
// ══════════════════════════════════════════════════
function CatForm({cat,onSave,onCancel}){
  const[f,setF]=useState(cat||{name:"",breed:"",birthdate:"",emoji:"🐱",gender:"F",weight:"",microchip:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div>
      <h3 style={{margin:"0 0 18px",fontSize:17,fontWeight:900}}>{cat?"Modifier":"Nouveau chat"} 🐾</h3>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {EMOJIS.map(e=><button key={e} onClick={()=>set("emoji",e)} style={{fontSize:26,background:f.emoji===e?C.tealD:"transparent",border:`2px solid ${f.emoji===e?C.teal:C.border}`,borderRadius:10,padding:6,cursor:"pointer",transition:"all .15s"}}>{e}</button>)}
      </div>
      {[["name","Prénom *","text","ex: Seven"],["breed","Race","text","ex: Bengal"],["birthdate","Date de naissance","date",""],["weight","Poids (kg)","number","ex: 4.5"],["microchip","N° de puce","text","250269..."]].map(([k,l,t,p])=>(
        <div key={k} style={{marginBottom:12}}>
          <label style={lbl}>{l}</label>
          <input style={inp} type={t} placeholder={p} value={f[k]} step={t==="number"?.1:undefined} onChange={e=>set(k,e.target.value)}/>
        </div>
      ))}
      <div style={{marginBottom:12}}>
        <label style={lbl}>Sexe</label>
        <div style={{display:"flex",gap:8}}>
          {[["M","♂ Mâle"],["F","♀ Femelle"]].map(([v,l])=><button key={v} onClick={()=>set("gender",v)} style={{flex:1,padding:"9px",borderRadius:10,border:`2px solid ${f.gender===v?C.teal:C.border}`,background:f.gender===v?C.tealD:"transparent",color:f.gender===v?C.teal:C.muted,fontWeight:700,cursor:"pointer",fontFamily:"Outfit,sans-serif",fontSize:13,transition:"all .15s"}}>{l}</button>)}
        </div>
      </div>
      <div style={{marginBottom:18}}>
        <label style={lbl}>Notes médicales</label>
        <textarea style={{...inp,resize:"vertical",minHeight:65}} placeholder="Allergies, pathologies..." value={f.notes} onChange={e=>set("notes",e.target.value)}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button style={{...btn(C.muted,true),flex:1,justifyContent:"center"}} onClick={onCancel}>Annuler</button>
        <button style={{...btn(C.teal),flex:2,justifyContent:"center",padding:"12px"}} onClick={()=>f.name&&onSave(f)}>✓ Sauvegarder</button>
      </div>
    </div>
  );
}

function ApptForm({cats,prefCatId,onSave,onCancel}){
  const[f,setF]=useState({catId:prefCatId||cats[0]?.id||"",type:"consultation",date:"",time:"",vet:"",clinic:"",notes:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div>
      <h3 style={{margin:"0 0 18px",fontSize:17,fontWeight:900}}>Nouveau rendez-vous 📅</h3>
      {cats.length>1&&<div style={{marginBottom:12}}><label style={lbl}>Chat</label><select style={inp} value={f.catId} onChange={e=>set("catId",e.target.value)}>{cats.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>}
      <div style={{marginBottom:12}}>
        <label style={lbl}>Type</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {APPT_TYPES.map(({id,label,icon,color})=><button key={id} onClick={()=>set("type",id)} style={{padding:"6px 11px",borderRadius:18,border:`2px solid ${f.type===id?color:C.border}`,background:f.type===id?color+"22":"transparent",color:f.type===id?color:C.muted,fontWeight:700,cursor:"pointer",fontFamily:"Outfit,sans-serif",fontSize:12,transition:"all .15s"}}>{icon} {label}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{flex:2}}><label style={lbl}>Date *</label><input style={inp} type="date" value={f.date} onChange={e=>set("date",e.target.value)}/></div>
        <div style={{flex:1}}><label style={lbl}>Heure</label><input style={inp} type="time" value={f.time} onChange={e=>set("time",e.target.value)}/></div>
      </div>
      {[["vet","Vétérinaire","Dr. Martin"],["clinic","Clinique","Clinique du Parc"]].map(([k,l,p])=><div key={k} style={{marginBottom:12}}><label style={lbl}>{l}</label><input style={inp} type="text" placeholder={p} value={f[k]} onChange={e=>set(k,e.target.value)}/></div>)}
      <div style={{marginBottom:18}}><label style={lbl}>Notes</label><textarea style={{...inp,resize:"vertical",minHeight:55}} placeholder="Questions à poser..." value={f.notes} onChange={e=>set("notes",e.target.value)}/></div>
      <div style={{display:"flex",gap:8}}>
        <button style={{...btn(C.muted,true),flex:1,justifyContent:"center"}} onClick={onCancel}>Annuler</button>
        <button style={{...btn(C.teal),flex:2,justifyContent:"center",padding:"12px"}} onClick={()=>f.date&&f.catId&&onSave(f)}>✓ Confirmer</button>
      </div>
    </div>
  );
}

function WeightForm({catName,onSave,onCancel}){
  const[w,setW]=useState("");const[d,setD]=useState(new Date().toISOString().split("T")[0]);const[n,setN]=useState("");
  return(
    <div>
      <h3 style={{margin:"0 0 18px",fontSize:17,fontWeight:900}}>Peser {catName} ⚖️</h3>
      <div style={{marginBottom:12}}><label style={lbl}>Poids (kg) *</label><input style={inp} type="number" step=".01" placeholder="ex: 4.35" value={w} onChange={e=>setW(e.target.value)}/></div>
      <div style={{marginBottom:12}}><label style={lbl}>Date</label><input style={inp} type="date" value={d} onChange={e=>setD(e.target.value)}/></div>
      <div style={{marginBottom:18}}><label style={lbl}>Note</label><input style={inp} type="text" placeholder="Après stérilisation..." value={n} onChange={e=>setN(e.target.value)}/></div>
      <div style={{display:"flex",gap:8}}>
        <button style={{...btn(C.muted,true),flex:1,justifyContent:"center"}} onClick={onCancel}>Annuler</button>
        <button style={{...btn(C.teal),flex:2,justifyContent:"center",padding:"12px"}} onClick={()=>w&&onSave({weight:parseFloat(w),date:d,note:n})}>✓ Enregistrer</button>
      </div>
    </div>
  );
}

function VaccineForm({catName,onSave,onCancel}){
  const[f,setF]=useState({type:VACCINES[0],date:"",nextDate:"",vet:"",lot:""});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div>
      <h3 style={{margin:"0 0 18px",fontSize:17,fontWeight:900}}>Vaccin de {catName} 💉</h3>
      <div style={{marginBottom:12}}><label style={lbl}>Type de vaccin</label><select style={inp} value={f.type} onChange={e=>set("type",e.target.value)}>{VACCINES.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
      {[["date","Date du vaccin *","date"],["nextDate","Prochain rappel","date"],["vet","Vétérinaire","text"],["lot","N° de lot","text"]].map(([k,l,t])=><div key={k} style={{marginBottom:12}}><label style={lbl}>{l}</label><input style={inp} type={t} placeholder={t==="text"?l:""} value={f[k]} onChange={e=>set(k,e.target.value)}/></div>)}
      <div style={{display:"flex",gap:8,marginTop:6}}>
        <button style={{...btn(C.muted,true),flex:1,justifyContent:"center"}} onClick={onCancel}>Annuler</button>
        <button style={{...btn(C.teal),flex:2,justifyContent:"center",padding:"12px"}} onClick={()=>f.date&&onSave(f)}>✓ Enregistrer</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  SCANNER PAGE
// ══════════════════════════════════════════════════
function ScannerPage({cats,documents,saveDocs,selectedCat,onBack}){
  const[state,setState]=useState("idle");
  const[prevUrl,setPrevUrl]=useState(null);
  const[b64,setB64]=useState(null);
  const[mime,setMime]=useState(null);
  const[result,setResult]=useState(null);
  const[viewDoc,setViewDoc]=useState(null);
  const fileRef=useRef();const camRef=useRef();

  const handleFile=(file)=>{
    if(!file)return;
    const m=file.type||"image/jpeg";
    const r=new FileReader();
    r.onload=e=>{setPrevUrl(e.target.result);setB64(e.target.result.split(",")[1]);setMime(m);setState("preview");};
    r.readAsDataURL(file);
  };

  const startScan=async()=>{
    if(!b64||!selectedCat)return;
    setState("scanning");
    try{const res=await aiScan(b64,mime,selectedCat.name);setResult(res);setState("done");}
    catch{setState("error");}
  };

  const saveDoc=()=>{
    if(!result||!selectedCat)return;
    const doc={id:uid(),...result,imageUrl:prevUrl,savedAt:new Date().toISOString(),catId:selectedCat.id};
    const updated={...documents,[selectedCat.id]:[doc,...(documents[selectedCat.id]||[])]};
    saveDocs(updated);
    setState("idle");setPrevUrl(null);setResult(null);
  };

  const catDocs=(documents[selectedCat?.id]||[]);

  if(viewDoc)return(
    <div className="fadeUp" style={{padding:16}}>
      <button style={{...btn(C.muted,true),marginBottom:12}} onClick={()=>setViewDoc(null)}>← Retour</button>
      <div style={{...card({padding:0,overflow:"hidden",marginBottom:12})}}>
        <img src={viewDoc.imageUrl} alt="doc" style={{width:"100%",maxHeight:300,objectFit:"contain",background:"#000",display:"block"}}/>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
        <span style={badge(dtOf(viewDoc.type).color)}>{dtOf(viewDoc.type).icon} {dtOf(viewDoc.type).label}</span>
        {viewDoc.date&&<span style={badge(C.blue)}>📅 {viewDoc.date}</span>}
      </div>
      <div style={{fontWeight:900,fontSize:17,marginBottom:8}}>{viewDoc.title}</div>
      <div style={{...card({background:C.tealD,border:`1px solid ${C.tealB}`,marginBottom:10})}}>
        <div style={{fontSize:11,color:C.teal,fontWeight:700,marginBottom:4}}>🤖 RÉSUMÉ IA</div>
        <div style={{fontSize:13,lineHeight:1.6}}>{viewDoc.resume}</div>
      </div>
      {viewDoc.informations?.length>0&&<div style={{...card({marginBottom:10})}}>
        <div style={sec}>Informations extraites</div>
        {viewDoc.informations.map((info,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<viewDoc.informations.length-1?`1px solid ${C.border}`:"none"}}>
          <span style={{fontSize:12,color:C.muted}}>{info.label}</span>
          <span style={{fontSize:13,fontWeight:700}}>{info.valeur}</span>
        </div>)}
      </div>}
      {(viewDoc.veterinaire||viewDoc.clinique)&&<div style={{...card({display:"flex",gap:10,marginBottom:10})}}>
        {viewDoc.veterinaire&&<div style={{flex:1}}><div style={{fontSize:11,color:C.muted}}>👨‍⚕️ VÉT.</div><div style={{fontWeight:700,fontSize:13}}>{viewDoc.veterinaire}</div></div>}
        {viewDoc.clinique&&<div style={{flex:1}}><div style={{fontSize:11,color:C.muted}}>🏥 CLINIQUE</div><div style={{fontWeight:700,fontSize:13}}>{viewDoc.clinique}</div></div>}
      </div>}
      {viewDoc.alertes?.map((a,i)=><div key={i} style={{...card({background:C.coralD,border:`1px solid ${C.coral}44`,display:"flex",gap:8,marginBottom:8})}}>
        <span>⚠️</span><span style={{fontSize:13}}>{a}</span>
      </div>)}
      <div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:8}}>Sauvegardé le {new Date(viewDoc.savedAt).toLocaleDateString("fr-FR")}</div>
    </div>
  );

  return(
    <div style={{padding:16}}>
      {state!=="idle"&&<button style={{...btn(C.muted,true),marginBottom:12}} onClick={()=>{setState("idle");setPrevUrl(null);setResult(null);}}>← Retour</button>}

      {state==="idle"&&(
        <div className="fadeUp">
          <div style={{...card({textAlign:"center",padding:"28px 16px",border:`2px dashed ${C.tealB}`,marginBottom:12})}}>
            <div style={{fontSize:48,marginBottom:10}}>📄</div>
            <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>Scanner un document</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Carnet vaccins · Ordonnance · Analyse · Facture · Pedigree</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:260,margin:"0 auto"}}>
              <button style={{...btn(C.teal),justifyContent:"center",padding:"13px",fontSize:14}} onClick={()=>camRef.current?.click()}>📷 Prendre une photo</button>
              <button style={{...btn(C.blue),justifyContent:"center",padding:"13px",fontSize:14}} onClick={()=>fileRef.current?.click()}>🖼️ Choisir une image</button>
            </div>
            <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          </div>
          {catDocs.length>0&&(
            <>
              <p style={sec}>Dossier de {selectedCat?.name} ({catDocs.length})</p>
              {catDocs.map(doc=>(
                <div key={doc.id} style={{...card({display:"flex",gap:10,alignItems:"center",cursor:"pointer",borderLeft:`3px solid ${dtOf(doc.type).color}`,marginBottom:8})}} onClick={()=>setViewDoc(doc)}>
                  <img src={doc.imageUrl} alt="" style={{width:48,height:48,objectFit:"cover",borderRadius:8,flexShrink:0}}/>
                  <div style={{flex:1,overflow:"hidden"}}>
                    <div style={{display:"flex",gap:5,marginBottom:3}}><span style={badge(dtOf(doc.type).color)}>{dtOf(doc.type).icon} {dtOf(doc.type).label}</span></div>
                    <div style={{fontWeight:800,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{doc.title}</div>
                    <div style={{fontSize:11,color:C.muted}}>{doc.date||""}{doc.veterinaire?` · ${doc.veterinaire}`:""}</div>
                  </div>
                  <div style={{color:C.muted}}>›</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {state==="preview"&&prevUrl&&(
        <div className="fadeUp">
          <div style={{...card({padding:0,overflow:"hidden",marginBottom:12})}}>
            <img src={prevUrl} alt="doc" style={{width:"100%",maxHeight:340,objectFit:"contain",background:"#000",display:"block"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{...btn(C.coral,true),flex:1,justifyContent:"center"}} onClick={()=>{setState("idle");setPrevUrl(null);}}>✕ Recommencer</button>
            <button style={{...btn(C.teal),flex:2,justifyContent:"center",padding:"13px",fontSize:14,fontWeight:900}} onClick={startScan}>🤖 Analyser →</button>
          </div>
        </div>
      )}

      {state==="scanning"&&(
        <div className="fadeUp">
          <div style={{...card({padding:0,overflow:"hidden",position:"relative",marginBottom:12})}}>
            <img src={prevUrl} alt="" style={{width:"100%",maxHeight:280,objectFit:"contain",background:"#000",display:"block",opacity:.4}}/>
            <div className="scanAnim"/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
              <div style={{width:44,height:44,border:`3px solid ${C.tealB}`,borderTop:`3px solid ${C.teal}`,borderRadius:"50%"}} className="spin"/>
              <div style={{color:C.teal,fontWeight:700}}>Claude analyse votre document…</div>
            </div>
          </div>
        </div>
      )}

      {state==="done"&&result&&(
        <div className="fadeUp">
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <img src={prevUrl} alt="" style={{width:64,height:64,objectFit:"cover",borderRadius:10,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:5,marginBottom:4}}>
                <span style={badge(C.green)}>✓ Analysé</span>
                <span style={badge(dtOf(result.type).color)}>{dtOf(result.type).icon} {dtOf(result.type).label}</span>
              </div>
              <div style={{fontWeight:900,fontSize:15}}>{result.title}</div>
              {result.date&&<div style={{fontSize:12,color:C.muted}}>📅 {result.date}</div>}
            </div>
          </div>
          <div style={{...card({background:C.tealD,border:`1px solid ${C.tealB}`,marginBottom:10})}}>
            <div style={{fontSize:11,color:C.teal,fontWeight:700,marginBottom:4}}>🤖 RÉSUMÉ IA</div>
            <div style={{fontSize:13,lineHeight:1.6}}>{result.resume}</div>
          </div>
          {result.informations?.length>0&&<div style={{...card({marginBottom:10})}}>
            <div style={sec}>Informations extraites</div>
            {result.informations.map((info,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<result.informations.length-1?`1px solid ${C.border}`:"none"}}>
              <span style={{fontSize:12,color:C.muted}}>{info.label}</span>
              <span style={{fontSize:13,fontWeight:700}}>{info.valeur}</span>
            </div>)}
          </div>}
          {result.alertes?.map((a,i)=><div key={i} style={{...card({background:C.coralD,border:`1px solid ${C.coral}44`,display:"flex",gap:8,marginBottom:8})}}>
            <span>⚠️</span><span style={{fontSize:13}}>{a}</span>
          </div>)}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button style={{...btn(C.coral,true),flex:1,justifyContent:"center"}} onClick={()=>{setState("idle");setPrevUrl(null);setResult(null);}}>✕ Annuler</button>
            <button style={{...btn(C.teal),flex:2,justifyContent:"center",padding:"13px",fontSize:14,fontWeight:900}} onClick={saveDoc}>💾 Sauvegarder</button>
          </div>
        </div>
      )}

      {state==="error"&&(
        <div style={{...card({background:C.coralD,textAlign:"center",padding:24})}} className="fadeUp">
          <div style={{fontSize:36}}>⚠️</div>
          <div style={{fontWeight:800,color:C.coral,marginTop:8}}>Erreur d'analyse</div>
          <div style={{fontSize:13,color:C.muted,marginTop:4}}>Vérifiez que l'image est lisible et réessayez.</div>
          <button style={{...btn(C.teal),margin:"14px auto 0",display:"flex"}} onClick={()=>setState("preview")}>↩ Réessayer</button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
//  CAT DETAIL PAGE
// ══════════════════════════════════════════════════
function CatDetail({cat,cats,appointments,weights,vaccines,documents,onBack,onEdit,onDelete,onAddAppt,onAddWeight,onAddVaccine,saveDocs}){
  const[tab,setTab]=useState("sante");
  const catAppts=[...appointments.filter(a=>a.catId===cat.id)].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const upcoming=catAppts.filter(a=>!a.done&&daysUntil(a.date)>=0);
  const catW=(weights[cat.id]||[]).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const catV=vaccines[cat.id]||[];
  const catDocs=documents[cat.id]||[];
  const lastW=catW[0];

  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${C.bg} 0%,#1a2e2a 100%)`,padding:"16px 16px 20px",color:C.white}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.1)",border:"none",color:C.white,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontFamily:"Outfit,sans-serif",fontSize:13,fontWeight:700,marginBottom:12}}>← Retour</button>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:54}}>{cat.emoji}</div>
          <div>
            <div style={{fontSize:24,fontWeight:900}}>{cat.name}</div>
            <div style={{opacity:.7,fontSize:13}}>{cat.breed||"Race inconnue"} · {cat.gender==="M"?"♂ Mâle":"♀ Femelle"} · {calcAge(cat.birthdate)}</div>
            {cat.microchip&&<div style={{fontSize:11,opacity:.5,marginTop:2}}>💾 {cat.microchip}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          {[[lastW?`${lastW.weight}kg`:"—","Poids","⚖️"],[catV.length,"Vaccins","💉"],[upcoming.length,"RDV","📅"],[catDocs.length,"Docs","📄"]].map(([v,l,i])=>(
            <div key={l} style={{flex:1,background:"rgba(255,255,255,.09)",borderRadius:10,padding:"8px 4px",textAlign:"center"}}>
              <div style={{fontSize:13}}>{i}</div>
              <div style={{fontWeight:900,fontSize:16}}>{v}</div>
              <div style={{fontSize:10,opacity:.6}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
          <button style={{...btn(C.teal,false,{fontSize:12,padding:"7px 12px"})}} onClick={onAddAppt}>📅 RDV</button>
          <button style={{...btn(C.gold,false,{fontSize:12,padding:"7px 12px"})}} onClick={onAddWeight}>⚖️ Poids</button>
          <button style={{...btn(C.blue,false,{fontSize:12,padding:"7px 12px"})}} onClick={onAddVaccine}>💉 Vaccin</button>
          <button style={{...btn(C.muted,true,{fontSize:12,padding:"7px 12px"})}} onClick={onEdit}>✏️ Modifier</button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{display:"flex",background:C.s1,borderBottom:`1px solid ${C.border}`}}>
        {[["sante","🩺 Santé"],["poids","⚖️ Poids"],["docs","📄 Docs"]].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"11px 8px",border:"none",background:"none",color:tab===id?C.teal:C.muted,fontWeight:tab===id?700:500,fontSize:12,cursor:"pointer",borderBottom:`2px solid ${tab===id?C.teal:"transparent"}`,fontFamily:"Outfit,sans-serif",transition:"all .2s"}}>{l}</button>
        ))}
      </div>

      <div style={{padding:16}}>
        {tab==="sante"&&(
          <div className="fadeUp">
            {cat.notes&&<div style={{...card({background:C.tealD,border:`1px solid ${C.tealB}`,marginBottom:10})}}>
              <div style={{fontSize:11,color:C.teal,fontWeight:700,marginBottom:4}}>📋 NOTES</div>
              <div style={{fontSize:13,lineHeight:1.6}}>{cat.notes}</div>
            </div>}
            {upcoming.length>0&&<>
              <p style={sec}>Prochains RDV</p>
              {upcoming.map(a=>{
                const days=daysUntil(a.date);const at=atOf(a.type);
                return(<div key={a.id} style={{...card({borderLeft:`3px solid ${at.color}`,marginBottom:8})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><div style={{fontWeight:800}}>{at.icon} {at.label}</div>
                    <div style={{fontSize:12,color:C.muted}}>{fmtDate(a.date)}{a.time?` à ${a.time}`:""}{a.vet?` · ${a.vet}`:""}</div></div>
                    <span style={badge(days<=3?C.coral:C.teal)}>{days===0?"Auj.":`J-${days}`}</span>
                  </div>
                </div>);
              })}
            </>}
            {catV.length>0&&<>
              <p style={sec}>Vaccinations ({catV.length})</p>
              {catV.map((v,i)=>{
                const days=v.nextDate?daysUntil(v.nextDate):null;
                return(<div key={i} style={{...card({marginBottom:8})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><div style={{fontWeight:800,fontSize:13}}>💉 {v.type}</div>
                    <div style={{fontSize:12,color:C.muted}}>Le {fmtDate(v.date)}{v.vet?` · ${v.vet}`:""}</div></div>
                    {v.nextDate&&<div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,color:C.muted}}>Rappel</div>
                      <div style={{fontSize:12,fontWeight:700,color:days&&days<=30?C.gold:C.teal}}>{fmtDate(v.nextDate)}</div>
                    </div>}
                  </div>
                </div>);
              })}
            </>}
            <button onClick={()=>{if(window.confirm(`Supprimer ${cat.name} ?`))onDelete(cat.id);}} style={{...btn(C.coral,true,{width:"100%",justifyContent:"center",marginTop:8})}}>🗑 Supprimer ce profil</button>
          </div>
        )}

        {tab==="poids"&&(
          <div className="fadeUp">
            <div style={card({marginBottom:12})}>
              <p style={sec}>Courbe de poids</p>
              <WeightChart cats={[cat]} weights={weights}/>
            </div>
            <button style={{...btn(C.gold),width:"100%",justifyContent:"center",marginBottom:12}} onClick={onAddWeight}>+ Ajouter une pesée</button>
            {catW.map((w,i)=>(
              <div key={i} style={{...card({display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8})}}>
                <div><div style={{fontWeight:800,fontSize:16,color:C.gold}}>{w.weight} kg</div>{w.note&&<div style={{fontSize:12,color:C.muted}}>{w.note}</div>}</div>
                <div style={{fontSize:12,color:C.muted}}>{fmtDate(w.date)}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="docs"&&(
          <ScannerPage cats={[cat]} documents={documents} saveDocs={saveDocs} selectedCat={cat} onBack={()=>setTab("sante")}/>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════
export default function PurrHealth(){
  const[tab,setTab]=useState("home");
  const[cats,setCats]=useState([]);
  const[appointments,setAppointments]=useState([]);
  const[weights,setWeights]=useState({});
  const[vaccines,setVaccines]=useState({});
  const[documents,setDocuments]=useState({});
  const[loading,setLoading]=useState(true);
  const[modal,setModal]=useState(null);
  const[selectedCatId,setSelectedCatId]=useState(null);

  useEffect(()=>{
    (async()=>{
      const[c,a,w,v,d]=await Promise.all([sGet("ph:cats"),sGet("ph:appts"),sGet("ph:weights"),sGet("ph:vaccines"),sGet("ph:docs")]);
      if(c)setCats(c);if(a)setAppointments(a);if(w)setWeights(w);if(v)setVaccines(v);if(d)setDocuments(d);
      setLoading(false);
    })();
  },[]);

  const saveCats=useCallback(d=>{setCats(d);sSet("ph:cats",d);},[]);
  const saveAppts=useCallback(d=>{setAppointments(d);sSet("ph:appts",d);},[]);
  const saveWeights=useCallback(d=>{setWeights(d);sSet("ph:weights",d);},[]);
  const saveVaccines=useCallback(d=>{setVaccines(d);sSet("ph:vaccines",d);},[]);
  const saveDocs=useCallback(d=>{setDocuments(d);sSet("ph:docs",d);},[]);

  const addCat=f=>{const c={...f,id:uid()};saveCats([...cats,c]);setModal(null);};
  const editCat=f=>{saveCats(cats.map(c=>c.id===f.id?f:c));setModal(null);};
  const deleteCat=id=>{saveCats(cats.filter(c=>c.id!==id));setSelectedCatId(null);};
  const addAppt=f=>{saveAppts([...appointments,{...f,id:uid()}]);setModal(null);};
  const markDone=id=>saveAppts(appointments.map(a=>a.id===id?{...a,done:true}:a));
  const deleteAppt=id=>saveAppts(appointments.filter(a=>a.id!==id));
  const addWeight=(catId,d)=>{const u={...weights,[catId]:[...(weights[catId]||[]),d]};saveWeights(u);setModal(null);};
  const addVaccine=(catId,d)=>{const u={...vaccines,[catId]:[...(vaccines[catId]||[]),d]};saveVaccines(u);setModal(null);};

  const selectedCat=cats.find(c=>c.id===selectedCatId);
  const upcoming=[...appointments].filter(a=>!a.done&&daysUntil(a.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date));

  if(loading)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <style>{CSS}</style>
      <div style={{fontSize:54}} className="pulse">🐾</div>
      <div style={{color:C.teal,fontWeight:700,fontFamily:"Outfit,sans-serif"}}>PurrHealth</div>
    </div>
  );

  const NAV=[{id:"home",icon:"🏠",label:"Accueil"},{id:"cats",icon:"🐱",label:"Mes Chats"},{id:"appts",icon:"📅",label:"RDV"},{id:"stats",icon:"📊",label:"Stats"},{id:"scan",icon:"📷",label:"Scanner"}];

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"Outfit,sans-serif",paddingBottom:70}}>
      <style>{CSS}</style>

      {/* ── CAT DETAIL ── */}
      {selectedCat&&(
        <CatDetail cat={selectedCat} cats={cats} appointments={appointments} weights={weights} vaccines={vaccines} documents={documents}
          onBack={()=>setSelectedCatId(null)} onEdit={()=>setModal({type:"editCat",data:selectedCat})} onDelete={deleteCat}
          onAddAppt={()=>setModal({type:"addAppt",catId:selectedCat.id})}
          onAddWeight={()=>setModal({type:"addWeight",catId:selectedCat.id})}
          onAddVaccine={()=>setModal({type:"addVaccine",catId:selectedCat.id})}
          saveDocs={saveDocs}/>
      )}

      {/* ── MAIN VIEWS ── */}
      {!selectedCat&&<>
        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${C.bg},#1a2e2a)`,padding:"18px 16px 14px",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <h1 style={{margin:0,fontSize:22,fontWeight:900}}><span style={{color:C.teal}}>Purr</span>Health 🐾</h1>
              <p style={{margin:"2px 0 0",fontSize:11,color:C.muted,letterSpacing:"1px",textTransform:"uppercase"}}>Cat Health · Reimagined</p>
            </div>
            <button style={{...btn(C.teal),fontSize:13,padding:"8px 14px"}} onClick={()=>setModal({type:"addCat"})}>+ Chat</button>
          </div>
        </div>

        <div style={{padding:16}}>

          {/* ── HOME ── */}
          {tab==="home"&&(
            <div className="fadeUp">
              {/* Hero */}
              <div style={{background:`linear-gradient(135deg,#1a3a32,#1C2128)`,border:`1px solid ${C.tealB}`,borderRadius:18,padding:"18px",marginBottom:16,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",right:-10,top:-10,fontSize:80,opacity:.06}}>🐾</div>
                <div style={{display:"flex",gap:16}}>
                  {[[cats.length,"Chats","🐱"],[upcoming.length,"RDV à venir","📅"],[Object.values(weights).flat().length,"Pesées","⚖️"]].map(([v,l,i])=>(
                    <div key={l} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:16}}>{i}</div>
                      <div style={{fontSize:22,fontWeight:900,color:C.teal}}>{v}</div>
                      <div style={{fontSize:10,color:C.muted}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                {[["📷 Scanner","Analyser un document",C.teal,()=>{setTab("scan");}],["📅 Nouveau RDV","Ajouter un rendez-vous",C.blue,()=>setModal({type:"addAppt"})]].map(([t,s,c,fn])=>(
                  <button key={t} onClick={fn} style={{background:`${c}15`,border:`1px solid ${c}44`,borderRadius:14,padding:"14px 12px",cursor:"pointer",textAlign:"left",fontFamily:"Outfit,sans-serif"}}>
                    <div style={{fontWeight:800,fontSize:14,color:c}}>{t}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{s}</div>
                  </button>
                ))}
              </div>

              {/* Cats quick row */}
              {cats.length>0&&<>
                <p style={sec}>Mes chats</p>
                <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4,marginBottom:16}}>
                  {cats.map((c,i)=>(
                    <div key={c.id} onClick={()=>setSelectedCatId(c.id)} style={{minWidth:85,background:C.s1,border:`1px solid ${CAT_COLORS[i%CAT_COLORS.length]}44`,borderRadius:14,padding:"12px 8px",textAlign:"center",cursor:"pointer",flexShrink:0}}>
                      <div style={{fontSize:30}}>{c.emoji}</div>
                      <div style={{fontWeight:800,fontSize:12,marginTop:4}}>{c.name}</div>
                      <div style={{fontSize:10,color:C.muted}}>{c.breed||"—"}</div>
                    </div>
                  ))}
                </div>
              </>}

              {/* Upcoming */}
              <p style={sec}>Prochains rendez-vous</p>
              {upcoming.length===0?(
                <div style={{...card({textAlign:"center",padding:"20px"})}}>
                  <div style={{fontSize:32}}>📅</div>
                  <div style={{color:C.muted,fontSize:13,marginTop:6}}>Aucun RDV prévu</div>
                </div>
              ):upcoming.slice(0,4).map(a=>{
                const cat=cats.find(c=>c.id===a.catId);const days=daysUntil(a.date);const at=atOf(a.type);
                return(<div key={a.id} style={{...card({borderLeft:`3px solid ${at.color}`,marginBottom:8})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:14}}>{at.icon} {at.label}</div>
                      <div style={{fontSize:12,color:C.muted}}>{cat?.emoji} {cat?.name} · {fmtDate(a.date)}{a.time?` à ${a.time}`:""}</div>
                      {a.vet&&<div style={{fontSize:11,color:C.muted}}>👨‍⚕️ {a.vet}</div>}
                    </div>
                    <span style={badge(days===0?C.coral:days<=3?C.gold:C.teal)}>{days===0?"Auj.":days===1?"Demain":`J-${days}`}</span>
                  </div>
                </div>);
              })}
            </div>
          )}

          {/* ── CATS ── */}
          {tab==="cats"&&(
            <div className="fadeUp">
              <p style={sec}>Mes chats ({cats.length})</p>
              {cats.length===0?(
                <div style={{...card({textAlign:"center",padding:"32px"})}}>
                  <div style={{fontSize:52}}>🐱</div>
                  <div style={{fontWeight:800,fontSize:16,marginTop:10}}>Aucun chat enregistré</div>
                  <button style={{...btn(C.teal),margin:"16px auto 0",display:"flex"}} onClick={()=>setModal({type:"addCat"})}>+ Ajouter</button>
                </div>
              ):cats.map((c,i)=>{
                const na=appointments.filter(a=>a.catId===c.id&&!a.done&&daysUntil(a.date)>=0).sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
                const lw=(weights[c.id]||[]).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
                return(<div key={c.id} style={{...card({cursor:"pointer",borderLeft:`3px solid ${CAT_COLORS[i%CAT_COLORS.length]}`,marginBottom:10})}} onClick={()=>setSelectedCatId(c.id)}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:56,height:56,borderRadius:14,background:CAT_COLORS[i%CAT_COLORS.length]+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{c.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:900,fontSize:16}}>{c.name}</div>
                      <div style={{fontSize:12,color:C.muted}}>{c.breed||"Race inconnue"} · {c.gender==="M"?"♂":"♀"} · {calcAge(c.birthdate)}</div>
                      {lw&&<div style={{fontSize:11,color:C.gold}}>⚖️ {lw.weight} kg</div>}
                      {na&&<div style={{fontSize:11,color:C.teal,marginTop:2}}>📅 {fmtDate(na.date)}</div>}
                    </div>
                    <div style={{color:C.muted,fontSize:18}}>›</div>
                  </div>
                </div>);
              })}
              <button style={{...btn(C.teal),width:"100%",justifyContent:"center",marginTop:4}} onClick={()=>setModal({type:"addCat"})}>+ Ajouter un chat</button>
            </div>
          )}

          {/* ── APPOINTMENTS ── */}
          {tab==="appts"&&(
            <div className="fadeUp">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <p style={{...sec,margin:0}}>Rendez-vous</p>
                <button style={{...btn(C.teal,false,{fontSize:12,padding:"7px 12px"})}} onClick={()=>setModal({type:"addAppt"})}>+ Nouveau</button>
              </div>
              {upcoming.length===0?<div style={{...card({textAlign:"center",padding:24})}}>
                <div style={{fontSize:40}}>📅</div><div style={{color:C.muted,marginTop:8}}>Aucun RDV à venir</div>
              </div>:upcoming.map(a=>{
                const cat=cats.find(c=>c.id===a.catId);const days=daysUntil(a.date);const at=atOf(a.type);
                return(<div key={a.id} style={{...card({borderLeft:`3px solid ${at.color}`,marginBottom:10})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:15}}>{at.icon} {at.label}</div>
                      <div style={{fontSize:12,color:C.muted}}>{cat?.emoji} {cat?.name} · {fmtDate(a.date)}{a.time?` à ${a.time}`:""}</div>
                      {a.vet&&<div style={{fontSize:12,color:C.muted}}>👨‍⚕️ {a.vet}{a.clinic?` — ${a.clinic}`:""}</div>}
                      {a.notes&&<div style={{fontSize:12,color:C.muted,fontStyle:"italic",marginTop:2}}>"{a.notes}"</div>}
                    </div>
                    <span style={badge(days===0?C.coral:days<=3?C.gold:C.teal)}>{days===0?"Auj.":days===1?"Demain":`J-${days}`}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>markDone(a.id)} style={{...btn(C.green,false,{fontSize:11,padding:"5px 10px"})}}>✓ Fait</button>
                    <button onClick={()=>deleteAppt(a.id)} style={{...btn(C.coral,false,{fontSize:11,padding:"5px 10px"})}}>✕ Suppr.</button>
                  </div>
                </div>);
              })}
            </div>
          )}

          {/* ── STATS (multi-cat weight chart) ── */}
          {tab==="stats"&&(
            <div className="fadeUp">
              <p style={sec}>Courbes de poids</p>
              <div style={card({marginBottom:16})}>
                <WeightChart cats={cats} weights={weights}/>
              </div>
              <p style={sec}>Résumé par chat</p>
              {cats.map((c,i)=>{
                const cw=(weights[c.id]||[]).sort((a,b)=>new Date(a.date)-new Date(b.date));
                const first=cw[0];const last=cw[cw.length-1];
                const diff=first&&last?((last.weight-first.weight)>=0?`+${(last.weight-first.weight).toFixed(2)}`:(last.weight-first.weight).toFixed(2)):null;
                const col=CAT_COLORS[i%CAT_COLORS.length];
                return(<div key={c.id} style={{...card({borderLeft:`3px solid ${col}`,marginBottom:10})}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:28}}>{c.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:900}}>{c.name}</div>
                      {last?<div style={{fontSize:13,color:col,fontWeight:700}}>⚖️ {last.weight} kg{diff?<span style={{fontSize:11,color:parseFloat(diff)>=0?C.green:C.coral,marginLeft:6}}>({diff} kg)</span>:null}</div>
                      :<div style={{fontSize:12,color:C.muted}}>Pas encore de pesée</div>}
                    </div>
                    <button style={{...btn(C.gold,false,{fontSize:11,padding:"6px 10px"})}} onClick={()=>setModal({type:"addWeight",catId:c.id})}>+ Pesée</button>
                  </div>
                </div>);
              })}
            </div>
          )}

          {/* ── SCANNER ── */}
          {tab==="scan"&&cats.length===0&&(
            <div style={{textAlign:"center",padding:"32px 20px"}}>
              <div style={{fontSize:52}}>🐱</div>
              <div style={{fontWeight:800,fontSize:16,marginTop:10}}>Ajoutez d'abord un chat</div>
              <button style={{...btn(C.teal),margin:"16px auto 0",display:"flex"}} onClick={()=>{setModal({type:"addCat"});}}>+ Ajouter un chat</button>
            </div>
          )}
          {tab==="scan"&&cats.length>0&&(
            <div className="fadeUp">
              <p style={sec}>Chat concerné</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                {cats.map((c,i)=>{
                  const isSelected=modal?.scanCat===c.id||(cats.length===1);
                  return(<button key={c.id} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${CAT_COLORS[i%CAT_COLORS.length]}66`,background:CAT_COLORS[i%CAT_COLORS.length]+"15",color:CAT_COLORS[i%CAT_COLORS.length],fontWeight:700,cursor:"pointer",fontFamily:"Outfit,sans-serif",fontSize:13}} onClick={()=>setModal({type:"scanCat",catId:c.id})}>{c.emoji} {c.name}</button>);
                })}
              </div>
              {modal?.type==="scanCat"?
                <ScannerPage cats={cats} documents={documents} saveDocs={saveDocs} selectedCat={cats.find(c=>c.id===modal.catId)} onBack={()=>setModal(null)}/>
              :<ScannerPage cats={cats} documents={documents} saveDocs={saveDocs} selectedCat={cats[0]} onBack={()=>{}}/>}
            </div>
          )}

        </div>

        {/* ── FAB ── */}
        {(tab==="home"||tab==="cats")&&(
          <button style={{position:"fixed",bottom:82,right:18,width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${C.teal},#00a88c)`,border:"none",color:C.white,fontSize:22,cursor:"pointer",boxShadow:`0 6px 20px ${C.teal}55`,display:"flex",alignItems:"center",justifyContent:"center",zIndex:50}} onClick={()=>setModal({type:"addCat"})}>+</button>
        )}

        {/* ── BOTTOM NAV ── */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.s1,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0 12px",zIndex:100,boxShadow:`0 -4px 20px rgba(0,0,0,.2)`}}>
          {NAV.map(({id,icon,label})=>(
            <button key={id} onClick={()=>{setTab(id);setModal(null);}} style={{flex:1,padding:"6px 4px",border:"none",background:"none",color:tab===id?C.teal:C.muted,fontWeight:tab===id?700:500,fontSize:10,cursor:"pointer",borderTop:`2px solid ${tab===id?C.teal:"transparent"}`,fontFamily:"Outfit,sans-serif",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all .2s"}}>
              <span style={{fontSize:18}}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </>}

      {/* ── MODALS ── */}
      {modal?.type==="addCat"&&<Modal onClose={()=>setModal(null)}><CatForm onSave={addCat} onCancel={()=>setModal(null)}/></Modal>}
      {modal?.type==="editCat"&&<Modal onClose={()=>setModal(null)}><CatForm cat={modal.data} onSave={f=>editCat({...f,id:modal.data.id})} onCancel={()=>setModal(null)}/></Modal>}
      {modal?.type==="addAppt"&&<Modal onClose={()=>setModal(null)}><ApptForm cats={cats} prefCatId={modal.catId} onSave={addAppt} onCancel={()=>setModal(null)}/></Modal>}
      {modal?.type==="addWeight"&&<Modal onClose={()=>setModal(null)}><WeightForm catName={cats.find(c=>c.id===modal.catId)?.name||""} onSave={d=>addWeight(modal.catId,d)} onCancel={()=>setModal(null)}/></Modal>}
      {modal?.type==="addVaccine"&&<Modal onClose={()=>setModal(null)}><VaccineForm catName={cats.find(c=>c.id===modal.catId)?.name||""} onSave={d=>addVaccine(modal.catId,d)} onCancel={()=>setModal(null)}/></Modal>}
    </div>
  );
}
