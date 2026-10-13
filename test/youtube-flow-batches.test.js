import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import path from 'node:path';
import { commitFlowBatch, auditFlowImages, waveRange, imageName } from '../src/core/youtube-flow-batches.js';

function crc32(data) {
  let crc=0xffffffff;
  for(const byte of data){
    crc^=byte;
    for(let i=0;i<8;i++)crc=(crc>>>1) ^ ((crc&1)?0xedb88320:0);
  }
  return (crc^0xffffffff)>>>0;
}
function chunk(type, payload){
  const name=Buffer.from(type,'ascii'),len=Buffer.alloc(4),check=Buffer.alloc(4);
  len.writeUInt32BE(payload.length);
  check.writeUInt32BE(crc32(Buffer.concat([name,payload])));
  return Buffer.concat([len,name,payload,check]);
}
function png(seed){
  const w=160,h=90,header=Buffer.alloc(13);
  header.writeUInt32BE(w,0); header.writeUInt32BE(h,4); header[8]=8;header[9]=6;
  const rows=Buffer.alloc((w*4+1)*h);
  for(let y=0;y<h;y++){
    rows[y*(w*4+1)]=0;
    for(let x=0;x<w;x++){
      const offset=y*(w*4+1)+1+x*4;
      rows[offset]=(seed+x)%256;rows[offset+1]=(seed+y)%256;
      rows[offset+2]=seed;rows[offset+3]=255;
    }
  }
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
async function fixture(count){
  const root=await mkdtemp(path.join(tmpdir(),'youtube-flow5-'));
  const staging=path.join(root,'incoming'),dest=path.join(root,'00-bildprompts/images');
  await mkdir(staging,{recursive:true});await mkdir(path.join(root,'03-export'),{recursive:true});
  await mkdir(path.join(root,'99-technik'),{recursive:true});
  await writeFile(path.join(root,'03-export/THUMBNAIL.png'),png(200));
  await writeFile(path.join(root,'99-technik/video.json'),JSON.stringify({schemaVersion:13,coverPolicyVersion:2,plannedImageCount:count,flowBatchPolicyVersion:1,flowBatchPolicy:{size:5}}));
  return {root,staging,dest};
}
async function addImage(f,n){await writeFile(path.join(f.staging,'scene-'+n+'.png'),png(n));}
async function manifest(f,numbers){
  const file=path.join(f.staging,'batch-'+numbers[0]+'.json');
  await writeFile(file,JSON.stringify({images:numbers.map(n=>({imageNumber:n,file:'scene-'+n+'.png'}))}));
  return file;
}
const wave=(f,batch,count,manifestPath)=>commitFlowBatch({projectDir:f.root,batch,count,manifestPath});

test('five-image Flow gate: Cover first; missing image blocks; exact naming waits for all five', async()=>{
 const f=await fixture(12);
 try{
   assert.deepEqual(waveRange(3,12).numbers,[11,12]);
   await rm(path.join(f.root,'03-export/THUMBNAIL.png'));
   for(let i=1;i<=5;i++)await addImage(f,i);
   let m=await manifest(f,[1,2,3,4,5]);
   await assert.rejects(wave(f,1,12,m),/Cover/);
   await writeFile(path.join(f.root,'03-export/THUMBNAIL.png'),png(200));
   await rm(path.join(f.staging,'scene-3.png'));
   await assert.rejects(wave(f,1,12,m),/ENOENT|no such file/i);
   const before=await readdir(f.dest).catch(()=>[]);
   assert.deepEqual(before,[],'No partial final naming before whole batch completes');
   await addImage(f,3);
   const result=await wave(f,1,12,m);
   assert.equal(result.next,2);
   assert.deepEqual((await readdir(f.dest)).sort(),[1,2,3,4,5].map(imageName).sort());
   await assert.rejects(wave(f,3,12,m),/Vorherige Fünfergruppe/);
 }finally{await rm(f.root,{recursive:true,force:true});}
});

test('wrong numbers, duplicate images, extra filenames and absent last picture block subsequent/final audit',async()=>{
 const f=await fixture(12);
 try{
   for(let i=1;i<=12;i++)await addImage(f,i);
   let first=await manifest(f,[1,2,3,4,5]);await wave(f,1,12,first);
   let second=await manifest(f,[6,7,8,9,10]);
   const rows=JSON.parse(await readFile(second,'utf8'));
   rows.images[4].imageNumber=9;await writeFile(second,JSON.stringify(rows));
   await assert.rejects(wave(f,2,12,second),/doppelte|fehlende/i);
   let st=await auditFlowImages(f.root,12);
   assert.ok(st.missing.includes('Bild 06.png'));
   await writeFile(second,JSON.stringify({images:[6,7,8,9,10].map(n=>({imageNumber:n,file:'scene-'+n+'.png'}))}));
   await copyFile(path.join(f.staging,'scene-6.png'),path.join(f.staging,'scene-7.png'));
   await assert.rejects(wave(f,2,12,second),/Identische Dateien/i);
   await addImage(f,7);
   await wave(f,2,12,second);
   let third=await manifest(f,[11,12]);
   await wave(f,3,12,third);
   st=await auditFlowImages(f.root,12);
   assert.equal(st.ok,true,JSON.stringify(st));
   assert.deepEqual((await readdir(f.dest)).sort(),Array.from({length:12},(_,i)=>imageName(i+1)).sort());
   await writeFile(path.join(f.dest,'Bild 013.png'),png(14));
   st=await auditFlowImages(f.root,12);
   assert.equal(st.ok,false);assert.match(st.errors.join('; '),/Bild 013.png/);
   await rm(path.join(f.dest,'Bild 013.png'));
   await rm(path.join(f.dest,imageName(12)));
   st=await auditFlowImages(f.root,12);
   assert.deepEqual(st.missing,[imageName(12)]);
   assert.equal(st.ok,false);
 }finally{await rm(f.root,{recursive:true,force:true});}
});

test('batch waves reject malformed PNG and never overwrite existing mismatched numbered files',async()=>{
 const f=await fixture(5);
 try{
   for(let i=1;i<=5;i++)await addImage(f,i);
   const m=await manifest(f,[1,2,3,4,5]);
   await writeFile(path.join(f.staging,'scene-5.png'),Buffer.from('bad png'));
   await assert.rejects(wave(f,1,5,m),/PNG/);
   await addImage(f,5);
   await mkdir(f.dest,{recursive:true});
   await writeFile(path.join(f.dest,imageName(1)),png(99));
   await assert.rejects(wave(f,1,5,m),/anderem Inhalt/);
   assert.deepEqual(await readFile(path.join(f.dest,imageName(1))),png(99));
 }finally{await rm(f.root,{recursive:true,force:true});}
});

test('CLI and phase-2 validator both require full audited final flat folder for new projects',async()=>{
 const f=await fixture(5);
 try{
   for(let i=1;i<=5;i++)await addImage(f,i);
   const m=await manifest(f,[1,2,3,4,5]);
   const cmd=spawnSync(process.execPath,['src/cli/youtube-flow-batch.js','--dir',f.root,'--batch','1','--manifest',m],{encoding:'utf8'});
   assert.equal(cmd.status,0,cmd.stderr);
   assert.match(cmd.stdout,/ALLE 5 BILDER BESTANDEN/);
   const audit=spawnSync(process.execPath,['src/cli/youtube-flow-batch.js','--dir',f.root,'--audit'],{encoding:'utf8'});
   assert.equal(audit.status,0,audit.stderr);
   const gate=spawnSync(process.execPath,['src/cli/validate-youtube-phase2-assets.js','--dir',f.root],{encoding:'utf8'});
   assert.equal(gate.status,0,gate.stderr);
   await writeFile(path.join(f.dest,'Bild 99.png'),png(31));
   const bad=spawnSync(process.execPath,['src/cli/validate-youtube-phase2-assets.js','--dir',f.root],{encoding:'utf8'});
   assert.notEqual(bad.status,0);
   assert.match(bad.stderr,/Bild 99.png/);
 }finally{await rm(f.root,{recursive:true,force:true});}
});

test('future YouTube template and central policy require Flow wave markers; old videos remain unmodified',async()=>{
 const [p,t,flow,w,readme,agents]=await Promise.all([
  readFile('config/youtube-channel-policy.json','utf8'),
  readFile('youtube/templates/video-template/99-technik/video.json','utf8'),
  readFile('youtube/templates/video-template/00-bildprompts/google-flow-prompt.txt','utf8'),
  readFile('youtube/YOUTUBE_WORKFLOW.md','utf8'),
  readFile('youtube/README.md','utf8'),
  readFile('AGENTS.md','utf8')
 ]);
 const policy=JSON.parse(p),meta=JSON.parse(t);
 assert.equal(policy.flowBatchPolicy.size,5);
 assert.equal(meta.flowBatchPolicyVersion,1);
 assert.equal(meta.flowBatchPolicy.size,5);
 assert.equal(meta.assetGenerationPolicy.maxConcurrentGenerations,5);
 assert.match(flow,/FIVE-IMAGE BATCH HARD LOCK/);
 assert.match(flow,/FINAL COMPLETENESS AUDIT HARD LOCK/);
 assert.match(flow,/Do not report Phase 2 ready unless it passes/);
 assert.match(w,/genau fünf Bilder pro Durchlauf/);
 assert.match(readme,/Feste 5er-Gruppen/);
 assert.match(agents,/Fünfergruppe/);
});
