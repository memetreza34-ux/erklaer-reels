import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { validateYoutubeScriptQuality } from '../src/core/youtube-script-quality.js';

const dir="youtube/2026-KW41_05-10_bis_11-10/suezkanal-wie-ein-schiff-den-welthandel-ausbremste";
const load=async p=>JSON.parse(await readFile(p,'utf8'));

test('Suez-Video hat 67 vollständige Bildmomente und ein freigegebenes Langskript',async()=>{
 const meta=await load(dir+'/99-technik/video.json');
 const map=await load(dir+'/99-technik/BILD_AUDIO_ZUORDNUNG.json');
 const shots=await load(dir+'/99-technik/SHOT_PLAN.json');
 const policy=await load('config/youtube-channel-policy.json');
 const script=await readFile(dir+'/01-voice-script/voice-script.txt','utf8');
 const prompt=await readFile(dir+'/00-bildprompts/google-flow-prompt.txt','utf8');
 assert.equal(meta.schemaVersion,13);
 assert.equal(meta.scriptQualityPolicyVersion,1);
 assert.equal(meta.plannedImageCount,67);
 assert.equal(shots.shots.length,67);
 assert.equal(map.images.length,67);
 assert.equal(meta.topicEditor.decision,'APPROVED_NEW');
 assert.equal(meta.coverPolicyVersion,2);\n assert.equal(meta.coverPolicy.firstSceneIsCover,false);\n assert.equal(meta.coverPolicy.thumbnailFile,'03-export/THUMBNAIL.png');
 assert.equal(meta.renderPolicy.endHoldSeconds,1.3);
 for(const item of map.images){
  assert.ok(script.includes(item.startAnchor),'Anker fehlt: '+item.startAnchor);
  assert.ok(prompt.includes('BILD '+String(item.imageNumber).padStart(2,'0')+' ·'),'Bildprompt fehlt');
 }
 const result=validateYoutubeScriptQuality(script,policy.scriptQualityPolicy,{topic:meta.topic,title:meta.title});
 assert.equal(result.passed,true,result.errors.join('; '));
 assert.ok(result.metrics.wordCount>=900);
 assert.ok(!script.includes('Denkst du dir gerade vielleicht'));
});

test('Suez-Video besteht den echten Phase-1-Validator',()=>{
 const res=spawnSync(process.execPath,['src/cli/validate-youtube-phase1.js','--dir',dir],{encoding:'utf8'});
 assert.equal(res.status,0,(res.stdout||'')+'\n'+(res.stderr||''));
});
