import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateEditorialBrief, validateVisualStoryPlan } from '../src/core/youtube-editorial-story.js';

const GOOD={
 schemaVersion:1,
 viewerPromise:'Der Zuschauer versteht, wie politische Entscheidungen zu konkreten Folgen für Haushalte und Unternehmen führen.',
 specificHook:'Eine Tankstelle verändert ihren Preis, obwohl der auslösende politische Konflikt weit entfernt liegt.',
 narrativePayoff:'Am Ende wird klar, warum Transportwege, Raffinerien und politische Entscheidungen zusammenhängen, statt nur geografische Karten zu wiederholen.',
 causeEffectChains:[
  {cause:'Eine konkrete politische Entscheidung verändert die Transportsicherheit von Öltankern.',mechanism:'Versicherung und Transport können teurer werden, wenn eine sichere Passage unsicher ist.',effect:'Eine Raffinerie muss zusätzliche Transportkosten und mögliche Lieferverzögerungen einkalkulieren.',concreteExample:'Eine Tankstelle illustriert eine mögliche spätere Preiswirkung, nicht die exakte aktuelle Preissteigerung.',source:'https://www.iea.org/about/oil-security-and-emergency-response/strait-of-hormuz'},
  {cause:'Ein Staat entscheidet über die politische Kontrolle einer wichtigen internationalen Route.',mechanism:'Die Entscheidung verändert den Weg und die Dauer für Handelsschiffe und weitere Zulieferer.',effect:'Ein Unternehmen kann Lieferungen später erhalten, auch wenn die Route nicht vollständig gesperrt ist.',concreteExample:'Ein Lieferwagen an einem Lager veranschaulicht die Logistikfolge ohne einen erfundenen echten Lieferausfall.',source:'Fachbuch: Beispiel politikwissenschaftliche Literatur, Kapitel 2'}
 ],
 visualVarietyPlan:{
  visualEnvironments:['geografische Karte einer Meerenge','Tankstelle im Straßenalltag','Hafenlager und Lieferwagen im Industriegebiet'],
  connectionToStory:'Die Karte erklärt die Ursache, die Tankstelle eine mögliche Verbraucherfolge und das Lager den Logistikmechanismus.'
 }
};
function prompt(roles=Array.from({length:12},(_,i)=>['topic','mechanism','consequence','everyday-example'][i%4]),envs=Array.from({length:12},(_,i)=>['Hafen am Meer','Tankstelle im Wohnviertel','Transportlager in der Stadt'][i%3])){
 return roles.map((role,i)=>[
   'BILD '+String(i+1).padStart(2,'0')+' · C · 5.5 s',
   'Visual Purpose: Der gesprochene Abschnitt erklärt einen konkreten überprüfbaren politischen Mechanismus.',
   'Topic Anchor: Diese Szene illustriert den im Text nachvollziehbaren Zusammenhang zwischen Handel und Preisen.',
   'Visual Form: full-scene',
   'Visual Role: '+role,
   'Why This Visual: '+(role==='analogy'?'Als symbolischer Vergleich zeigt die Szene einen Kapazitätsengpass, nicht ein tatsächlich passiertes Ereignis.':'Die Szene verdeutlicht die gesprochene reale Wirkung auf den Zuschauer anhand einer konkreten Folge.'),
   'Visual Environment: '+envs[i],
   'On-screen Text: '+(i===3?'TEURER TRANSPORT':'NONE'),
   'Prompt: Draw an independent educational illustration.',
   ''
 ].join('\n')).join('\n');
}

test('faktenbasiertes Editorial-Briefing und abwechslungsreicher Bildplan sind freigegeben',()=>{
 assert.deepEqual(validateEditorialBrief(GOOD).errors,[]);
 let x=validateVisualStoryPlan(prompt(),12);
 assert.equal(x.passed,true,JSON.stringify(x.errors));
 assert.equal(x.metrics.roles.length,4);
 assert.equal(x.metrics.environments.length,3);
});

test('vage oder fingierte Ursache-Folge-Beschreibung und fehlender konkreter Payoff blockieren',()=>{
 const bad=structuredClone(GOOD);
 bad.specificHook='[INSERT HERE]';
 bad.causeEffectChains[0].source='https://example.org/replace-with-real-source';
 bad.causeEffectChains[1]=structuredClone(bad.causeEffectChains[0]);
 bad.visualVarietyPlan.visualEnvironments=['[Karte der Region]','[Bedeutende Gegend]','[Andere Region]'];
 const out=validateEditorialBrief(bad);
 assert.equal(out.passed,false);
 assert.match(out.errors.join('\n'),/specificHook/);
 assert.match(out.errors.join('\n'),/Quelle/);
 assert.match(out.errors.join('\n'),/duplizierte/);
 assert.match(out.errors.join('\n'),/Bildumgebungen/);
});

test('jeder Frame braucht erkennbaren Sprecherbezug und geplanten Bildwechsel',()=>{
 let bad=prompt(Array(12).fill('topic'),Array(12).fill('Identische Meerenge'));
 let r=validateVisualStoryPlan(bad,12);
 assert.equal(r.passed,false);
 assert.match(r.errors.join('; '),/zu wenig unterschiedliche Bildfunktionen/);
 assert.match(r.errors.join('; '),/weniger als drei erkennbare Bildumgebungen/);
 assert.ok(r.warnings.some(x=>x.includes('fünf gleiche')));
 bad=prompt();
 bad=bad.replace('Visual Role: topic','Visual Role: nonsense');
 bad=bad.replace('Why This Visual: Die Szene verdeutlicht die gesprochene reale Wirkung auf den Zuschauer anhand einer konkreten Folge.','Why This Visual: TBD');
 r=validateVisualStoryPlan(bad,12);
 assert.match(r.errors.join('; '),/Visual Role ungültig/);
 assert.match(r.errors.join('; '),/Why This Visual/);
});

test('sinnvolle Analogie ohne direkten Ortsbezug erlaubt, ohne erklärende Brücke blockiert',()=>{
 const roles=Array.from({length:12},(_,i)=>['topic','mechanism','analogy','consequence'][i%4]);
 const p=prompt(roles);
 const result=validateVisualStoryPlan(p,12);
 assert.equal(result.passed,true,JSON.stringify(result.errors));
 const bad=p.replace('Als symbolischer Vergleich zeigt','Eine zufällige Szene zeigt');
 const blocked=validateVisualStoryPlan(bad,12);
 assert.equal(blocked.passed,false);
 assert.match(blocked.errors.join('; '),/Analogie/);
});

test('kurze Label und Zitate zugelassen, Textwände und fehlende Nummern blockiert',()=>{
 let a=prompt().replace('On-screen Text: NONE','On-screen Text: QUOTE: Dieses etwas längere echte Zitat muss die Redaktion belegen');
 assert.equal(validateVisualStoryPlan(a,12).passed,true);
 a=prompt().replace('On-screen Text: NONE','On-screen Text: Das ist ein sehr langer ganzer Satz mit vielen unnötigen Wörtern');
 assert.match(validateVisualStoryPlan(a,12).errors.join('; '),/maximal sechs Wörter/);
 a=prompt().replace('BILD 06 ·','BILD 99 ·');
 assert.match(validateVisualStoryPlan(a,12).errors.join('; '),/Bild 6 muss genau einen/);
});

test('nur neue YouTube-Template-Projekte aktivieren Story-Upgrade, ältere ohne Feld bleiben unverändert',async()=>{
 const meta=JSON.parse(await readFile('youtube/templates/video-template/99-technik/video.json','utf8'));
 const conf=JSON.parse(await readFile('config/youtube-channel-policy.json','utf8'));
 const sample=JSON.parse(await readFile('youtube/templates/video-template/99-technik/EDITORIAL_BRIEF.json','utf8'));
 const master=await readFile('youtube/templates/video-template/00-bildprompts/google-flow-prompt.txt','utf8');
 const validator=await readFile('src/cli/validate-youtube-phase1-policy.js','utf8');
 const guide=await readFile('youtube/EDITORIAL_STORY_VISUAL_V2.md','utf8');
 assert.equal(meta.editorialStoryUpgradeVersion,1);
 assert.equal(conf.editorialStoryUpgradeVersion,1);
 assert.equal(sample.schemaVersion,1);
 assert.equal(validateEditorialBrief(sample).passed,false,'unfilled placeholders are rejected');
 assert.match(master,/EDITORIAL STORY & VISUAL BRIDGES V2 — HARD LOCK/);
 assert.match(master,/Visual Role:/);
 assert.match(master,/Why This Visual:/);
 assert.match(master,/Visual Environment:/);
 assert.match(master,/On-screen Text:/);
 assert.match(master,/THUMBNAIL.png/);
 assert.match(master,/FIVE-IMAGE BATCH HARD LOCK/);
 assert.match(validator,/Number\(meta.editorialStoryUpgradeVersion\) === 1/);
 assert.match(guide,/Nicht den Ort wiederholen/);
 assert.match(guide,/Tankstelle/);
});
