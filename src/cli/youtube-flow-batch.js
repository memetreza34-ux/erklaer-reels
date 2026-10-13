#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { waveRange, commitFlowBatch, auditFlowImages, imageStatus, FLOW_BATCH_SIZE } from '../core/youtube-flow-batches.js';

const get = name => { const i=process.argv.indexOf(name); return i<0?undefined:process.argv[i+1]; };

async function main(){
  const dir=get('--dir');
  if(!dir)throw new Error('Nutzung: npm run flow:youtube-batch -- --dir "youtube/<woche>/<projekt>" --batch 1 --manifest "/Pfad/zu/batch-01.json" | --audit | --status');
  const projectDir=path.resolve(dir), meta=JSON.parse(await readFile(path.join(projectDir,'99-technik/video.json'),'utf8'));
  if(Number(meta.flowBatchPolicyVersion)!==1||Number(meta.flowBatchPolicy?.size)!==FLOW_BATCH_SIZE)
    throw new Error('Fünfergruppen-Workflow ist nur für NEUE Projekte mit flowBatchPolicyVersion 1 freigegeben. Alte Projekte nicht automatisch migrieren.');
  const count=Number(meta.plannedImageCount);
  if(!Number.isInteger(count)||count<1)throw new Error('plannedImageCount fehlt.');
  if(process.argv.includes('--audit')){
    const audit=await auditFlowImages(projectDir,count);
    if(!audit.ok)throw new Error('FINALER HARD FAIL: '+[...audit.missing,...audit.errors].join('; '));
    console.log('FINAL AUDIT BESTANDEN: '+count+' Szenenbilder Bild 01.png bis '+String(count).padStart(2,'0')+'.png, genau ein Ordner und separates Cover.');
    return;
  }
  if(process.argv.includes('--status')){
    const all=await auditFlowImages(projectDir,count);
    if(all.ok){console.log('ALLE '+count+' BILDER VOLLSTÄNDIG UND RICHTIG BENANNT.');return;}
    const orderedMissing=all.missing;
    const firstMissing=orderedMissing.length?Number(orderedMissing[0].match(/\d+/)[0]):null;
    const batch=firstMissing?Math.ceil(firstMissing/FLOW_BATCH_SIZE):null;
    console.log('Fehlende Nummern: '+(orderedMissing.join(', ')||'keine'));
    if(all.errors.length)console.log('BLOCKER: '+all.errors.join('; '));
    if(batch){const r=waveRange(batch,count);console.log('Nächste/unvollständige Gruppe: '+batch+' (Bilder '+r.start+' bis '+r.end+').');}
    process.exitCode=1;return;
  }
  const batch=Number(get('--batch')),manifestArg=get('--manifest');
  if(!Number.isInteger(batch)||batch<1||!manifestArg)throw new Error('Bitte --batch N und --manifest /Pfad/batch-N.json angeben.');
  const manifestPath=path.resolve(manifestArg);
  const result=await commitFlowBatch({projectDir,batch,manifestPath,count});
  console.log('BATCH '+batch+' BESTANDEN: alle Bilder '+result.start+'–'+result.end+' korrekt zugeordnet, kopiert und geprüft.');
  if(result.next===null){
    const audit=await auditFlowImages(projectDir,count);
    if(!audit.ok)throw new Error('Abschließende Prüfung FEHLGESCHLAGEN: '+[...audit.missing,...audit.errors].join('; '));
    console.log('ALLE '+count+' BILDER BESTANDEN; kompletter Bilderordner freigegeben.');
  } else {
    const next=waveRange(result.next,count);
    console.log('JETZT erst die nächste Gruppe starten: '+next.start+'–'+next.end+'.');
  }
}
main().catch(e=>{console.error('GOOGLE FLOW 5ER-GRUPPE: GESPERRT — '+e.message);process.exitCode=1;});
