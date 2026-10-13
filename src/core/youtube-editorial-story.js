// Editorial gate for NEW Weltlogik YouTube videos: concrete impact + purposeful visual variety.
// Automated structural checks complement, but never replace, human editorial/factual review.
const ROLES=new Set(['topic','mechanism','consequence','everyday-example','analogy','comparison','data','context']);
const vague=/^(?:todo|tbd|none|null|n\/a|platzhalter|beispiel|test|xxx|\[.*\]|\.{2,}|-)\s*$/i;

function meaningful(value,min=18) {
  return typeof value==='string' && value.trim().length>=min && !vague.test(value.trim()) && !/\[(?:insert|replace|hier|name|text|example)/i.test(value);
}
function phrase(value){return String(value??'').replace(/\s+/g,' ').trim()}

export function validateEditorialBrief(brief={}) {
  const errors=[];
  if(Number(brief.schemaVersion)!==1)errors.push('EDITORIAL_BRIEF: schemaVersion muss 1 sein.');
  for(const key of ['viewerPromise','specificHook','narrativePayoff']) {
    if(!meaningful(brief[key],35))errors.push('EDITORIAL_BRIEF: '+key+' muss eine konkrete, ausgearbeitete Aussage enthalten.');
  }
  if(!Array.isArray(brief.causeEffectChains)||brief.causeEffectChains.length<2) {
    errors.push('EDITORIAL_BRIEF: mindestens zwei nachprüfbare Ursache→Mechanismus→Folge-Ketten erforderlich.');
  }else{
    for(const [i,chain] of brief.causeEffectChains.entries()){
      for(const key of ['cause','mechanism','effect','concreteExample','source']){
        if(!meaningful(chain?.[key], key==='source'?10:25))
          errors.push('EDITORIAL_BRIEF: Folge '+(i+1)+' ohne konkrete '+key+'-Angabe.');
      }
      if(typeof chain?.source==='string'&&!/^(?:https?:\/\/\S+|Fachbuch:|Amtliche Quelle:)/i.test(chain.source.trim())){
        errors.push('EDITORIAL_BRIEF: Quelle in Folge '+(i+1)+' braucht einen nachprüfbaren Link oder nachvollziehbare Fachquellenangabe.');
      }
    }
  }
  const roles=brief.visualVarietyPlan;
  if(!roles||!Array.isArray(roles.visualEnvironments)||roles.visualEnvironments.length<3||
       new Set(roles.visualEnvironments.map(x=>phrase(x).toLowerCase())).size<3)
    errors.push('EDITORIAL_BRIEF: mindestens drei unterschiedliche sinnvolle Bildumgebungen/Maßstabsebenen planen.');
  if(!meaningful(roles?.connectionToStory,35))
    errors.push('EDITORIAL_BRIEF: erklären, warum die wechselnden Bilder die Geschichte verständlicher machen.');
  if(roles?.analogy && (!meaningful(roles.analogy.visual,18)||!meaningful(roles.analogy.explanationBridge,25)))
    errors.push('EDITORIAL_BRIEF: freiwillige Analogie braucht Motiv und eindeutige Brücke zur gesprochenen Aussage.');
  return {passed:errors.length===0,errors};
}

function imageBlocks(prompt) {
  const m=[...String(prompt).matchAll(/^BILD\s+(\d{2,})\s*·[^\n]*$/gim)];
  return m.map((item,i)=>({number:Number(item[1]),body:prompt.slice(item.index,i+1<m.length?m[i+1].index:prompt.length)}));
}
function field(body,label) {
  const pattern=new RegExp('^'+label+':\\s*(.*)$','im');
  return phrase(body.match(pattern)?.[1]);
}
export function validateVisualStoryPlan(prompt,plannedImageCount) {
  const errors=[],warnings=[];
  const blocks=imageBlocks(prompt), count=Number(plannedImageCount);
  if(!Number.isInteger(count)||count<1)return {passed:false,errors:['Ungültige Bildzahl.'],warnings,metrics:{}};
  const roles=[],environments=[];
  for(let n=1;n<=count;n++){
    const matching=blocks.filter(x=>x.number===n);
    if(matching.length!==1){errors.push('Visual Story: Bild '+n+' muss genau einen eigenen Szenenblock besitzen.');continue;}
    const block=matching[0].body;
    const role=field(block,'Visual Role').toLowerCase();
    const bridge=field(block,'Why This Visual');
    const environment=field(block,'Visual Environment');
    const overlay=field(block,'On-screen Text');
    if(!ROLES.has(role))errors.push('Bild '+n+': Visual Role ungültig/fehlend.');
    if(!meaningful(bridge,30))errors.push('Bild '+n+': Why This Visual muss den Satz- oder Folgenbezug erklären.');
    if(!meaningful(environment,9))errors.push('Bild '+n+': Visual Environment muss konkret sein.');
    if(!overlay)errors.push('Bild '+n+': On-screen Text muss ein bewusstes Label oder NONE enthalten.');
    if(role==='analogy'&&!/\b(?:vergleich|symbolisch|metapher|analogie|veranschaulich|beispiel|als ob|modell)\b/i.test(bridge))
      errors.push('Bild '+n+': eine Analogie muss in Why This Visual ausdrücklich als bildlicher Vergleich eingeordnet sein.');
    if(overlay && !/^(?:none|kein text|ohne text)$/i.test(overlay) && !/^QUOTE:\s*\S/i.test(overlay)) {
      const words=overlay.split(/\s+/).filter(Boolean);
      if(words.length>6)errors.push('Bild '+n+': Sichttext maximal sechs Wörter; längere wörtliche Zitate mit QUOTE: markieren.');
      if(/[.!?](?:\s|$)/.test(overlay))warnings.push('Bild '+n+': Sichttext sieht nach einem ganzen Satz aus — auf Stichwort kürzen.');
    }
    roles.push(role);environments.push(environment.toLowerCase());
  }
  if(blocks.length!==count)errors.push('Visual Story: mehr oder weniger Bildblöcke als geplant.');
  const uniqueRoles=new Set(roles),uniqueEnvironments=new Set(environments);
  if(count>=12 && uniqueRoles.size<3)errors.push('Visual Story: zu wenig unterschiedliche Bildfunktionen (weniger als drei).');
  if(count>=12 && uniqueEnvironments.size<3)errors.push('Visual Story: weniger als drei erkennbare Bildumgebungen/Maßstabsebenen.');
  if(count>=12 && !roles.some(x=>['consequence','everyday-example','analogy','comparison','data'].includes(x)))
    errors.push('Visual Story: es fehlen sichtbare Folgen, nachvollziehbare Beispiele, Vergleiche oder Daten.');
  for(let i=4;i<environments.length;i++){
    if(environments.slice(i-4,i+1).every(x=>x===environments[i])){
      warnings.push('Bilder '+(i-3)+'–'+(i+1)+': fünf gleiche Bildumgebungen nacheinander — gezielt auf Monotonie prüfen.');
    }
  }
  return {passed:errors.length===0,errors,warnings,metrics:{imageCount:count,roles:[...uniqueRoles],environments:[...uniqueEnvironments]}};
}
