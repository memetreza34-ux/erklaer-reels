import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { readFile, readdir, mkdir, copyFile, lstat } from 'node:fs/promises';
import path from 'node:path';

export const FLOW_BATCH_SIZE = 5;
export const imageName = n => 'Bild ' + String(n).padStart(2,'0') + '.png';

export function waveRange(batch, total, size = FLOW_BATCH_SIZE) {
  if (![batch,total,size].every(Number.isInteger) || batch < 1 || total < 1 || size < 1)
    throw new Error('Ungültige Batch-/Bildanzahl.');
  const start = (batch-1)*size+1;
  if(start>total) throw new Error('Batch existiert nicht: ' + batch);
  const end = Math.min(total,start+size-1);
  return { batch,start,end,numbers:Array.from({length:end-start+1},(_,i)=>start+i) };
}

export async function pngInfo(file) {
  const data=await readFile(file);
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  if(data.length<45 || !data.subarray(0,8).equals(sig) || data.toString('ascii',12,16)!=='IHDR')
    throw new Error('PNG-Kopfstruktur ungültig: ' + path.basename(file));
  const width=data.readUInt32BE(16),height=data.readUInt32BE(20);
  if(width<16 || height<16 || Math.abs(width/height-16/9)>0.045)
    throw new Error('Ungültiges 16:9-Bild: '+path.basename(file)+' ('+width+'x'+height+')');
  return {width,height,hash:createHash('sha256').update(data).digest('hex')};
}

export async function imageStatus(projectDir,count,{limit=count,checkCover=false}={}) {
  const finalDir=path.join(projectDir,'00-bildprompts/images');
  const expected=new Set(Array.from({length:limit},(_,i)=>imageName(i+1)));
  const errors=[],missing=[],hashes=new Map();
  let entries=[];
  try{entries=await readdir(finalDir,{withFileTypes:true});}
  catch(e){if(e.code!=='ENOENT')throw e;}
  for(const item of entries){
    if(item.name.startsWith('.'))continue;
    if(!item.isFile()||!expected.has(item.name))
      errors.push('Falscher Name, Duplikat oder unerlaubte Datei im finalen Ordner: '+item.name);
  }
  for(let n=1;n<=limit;n++){
    const name=imageName(n);
    try{
      const info=await pngInfo(path.join(finalDir,name));
      if(hashes.has(info.hash))errors.push(name+' ist binär identisch mit '+hashes.get(info.hash));
      else hashes.set(info.hash,name);
    }catch(e){if(e.code==='ENOENT')missing.push(name);else errors.push(e.message);}
  }
  if(checkCover){
    try{
      const info=await pngInfo(path.join(projectDir,'03-export/THUMBNAIL.png'));
      if(hashes.has(info.hash))errors.push('Cover ist identisch mit Videoszene '+hashes.get(info.hash));
    }catch(e){errors.push(e.code==='ENOENT'?'Cover fehlt: 03-export/THUMBNAIL.png':e.message);}
  }
  return {ok:missing.length===0&&errors.length===0,missing,errors,checked:limit,count};
}

export async function commitFlowBatch({projectDir,batch,manifestPath,count,size=FLOW_BATCH_SIZE}) {
  const range=waveRange(batch,count,size);
  // Cover MUSS vor der ersten normalen Szene bereits fertig erzeugt sein.
  try{await pngInfo(path.join(projectDir,'03-export/THUMBNAIL.png'));}
  catch(e){throw new Error('Zuerst das separate Cover erzeugen und prüfen: '+e.message);}
  if(range.start>1){
    const prior=await imageStatus(projectDir,count,{limit:range.start-1});
    if(!prior.ok)throw new Error('Vorherige Fünfergruppe unvollständig: '+[...prior.missing,...prior.errors].join('; '));
  }
  const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  const rows=manifest.images;
  if(!Array.isArray(rows)||rows.length!==range.numbers.length)
    throw new Error('Batch '+batch+' braucht genau '+range.numbers.length+' korrekt zugeordnete fertige Flow-Dateien; Fehlende zuerst ergänzen.');
  const seen=new Set(),usedSources=new Set(),prepared=[];
  const finalDir=path.resolve(projectDir,'00-bildprompts/images');
  for(const row of rows){
    if(!Number.isInteger(row.imageNumber)||!range.numbers.includes(row.imageNumber)||seen.has(row.imageNumber))
      throw new Error('Batch hat fehlende, doppelte oder unzulässige Bildnummern.');
    seen.add(row.imageNumber);
    if(typeof row.file!=='string'||!row.file.trim())throw new Error('Flow-Quelldatei fehlt für Bild '+row.imageNumber);
    const src=path.resolve(path.dirname(manifestPath),row.file);
    if(src===finalDir||src.startsWith(finalDir+path.sep))throw new Error('Quellbilder dürfen nicht im finalen Ordner liegen.');
    const stat=await lstat(src);
    if(!stat.isFile()||stat.isSymbolicLink())throw new Error('Nur reguläre Flow-Dateien als Eingabe.');
    if(usedSources.has(src))throw new Error('Eine Quelle kann nicht für mehrere Bilder stehen.');
    usedSources.add(src);
    const info=await pngInfo(src);
    prepared.push({n:row.imageNumber,src,info});
  }
  if(seen.size!==range.numbers.length)throw new Error('Nicht alle Nummern dieser Fünfergruppe sind belegt.');
  if(new Set(prepared.map(x=>x.info.hash)).size!==prepared.length)throw new Error('Identische Dateien innerhalb der Fünfergruppe.');
  await mkdir(finalDir,{recursive:true});
  const partial=await imageStatus(projectDir,count,{limit:range.end});
  if(partial.errors.length)throw new Error('Finalordner enthält falsch benannte oder defekte Bilder: '+partial.errors.join('; '));
  // Erst nach Vollständigkeitsprüfung aller fünf Quellen die gesamte Gruppe kopieren.
  // Keine Überschreibung bereits vorhandener Bilder. Quell-Originale behalten.
  for(const item of prepared.sort((a,b)=>a.n-b.n)){
    const dest=path.join(finalDir,imageName(item.n));
    try{
      const existing=await pngInfo(dest);
      if(existing.hash!==item.info.hash)throw new Error(imageName(item.n)+' vorhanden mit anderem Inhalt. Kein Überschreiben.');
    }catch(e){
      if(e.code!=='ENOENT')throw e;
      await copyFile(item.src,dest,constants.COPYFILE_EXCL);
    }
  }
  const verified=await imageStatus(projectDir,count,{limit:range.end,checkCover:true});
  if(!verified.ok)throw new Error('Batch nicht freigegeben: '+[...verified.missing,...verified.errors].join('; '));
  return {...range,verified:true,next:range.end===count?null:batch+1};
}

export async function auditFlowImages(projectDir,count) {
  return imageStatus(projectDir,count,{checkCover:true});
}
