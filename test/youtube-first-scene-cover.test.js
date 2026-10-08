import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const LEGACY = 'youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen';
const TEMPLATE = 'youtube/templates/video-template';
const SUEZ = 'youtube/2026-KW41_05-10_bis_11-10/suezkanal-wie-ein-schiff-den-welthandel-ausbremste';
const json = async path => JSON.parse(await readFile(path,'utf8'));

test('Cover Policy V2 trennt das eigenständige Cover von Bild 01', async()=>{
 const [global,template,mapping,prompt]=await Promise.all([
  json('config/youtube-channel-policy.json'),
  json(TEMPLATE+'/99-technik/video.json'),
  json(TEMPLATE+'/99-technik/BILD_AUDIO_ZUORDNUNG.json'),
  readFile(TEMPLATE+'/00-bildprompts/google-flow-prompt.txt','utf8')
 ]);
 assert.equal(global.coverPolicyVersion,2);
 assert.equal(global.coverPolicy.firstSceneIsCover,false);
 assert.equal(template.coverPolicyVersion,2);
 assert.equal(template.coverPolicy.firstSceneIsCover,false);
 assert.equal(template.coverPolicy.coverExcludedFromTimeline,true);
 assert.equal(template.coverPolicy.thumbnailFile,'03-export/THUMBNAIL.png');
 assert.equal(mapping.coverImageNumber,null);
 assert.equal(mapping.rules.firstSceneIsCover,false);
 assert.equal(mapping.rules.separateCoverRequired,true);
 assert.equal(mapping.videoFirstImageNumber,1);
 assert.match(prompt,/SEPARATE COVER — EXPORT ONLY HARD LOCK/);
 assert.match(prompt,/BILD 01 = NORMAL FIRST SCENE HARD LOCK/);
 assert.doesNotMatch(prompt,/Bild 01 is the cover AND the first video scene/i);
});

test('bestehendes Zeitzonen-Video behält legacy Cover Policy V1',async()=>{
 const [meta,map,prompt]=await Promise.all([
  json(LEGACY+'/99-technik/video.json'),
  json(LEGACY+'/99-technik/BILD_AUDIO_ZUORDNUNG.json'),
  readFile(LEGACY+'/00-bildprompts/google-flow-prompt.txt','utf8')
 ]);
 assert.equal(meta.coverPolicyVersion,1);
 assert.equal(meta.coverPolicy.firstSceneIsCover,true);
 assert.equal(map.coverImageNumber,1);
 assert.equal(map.thumbnailImageNumber,1);
 assert.match(prompt,/FIRST SCENE = COVER HARD LOCK/);
});

test('Suezkanal Bild 01 ist normale erste Szene ohne Coverheadline',async()=>{
 const [meta,mapping,shot,prompt]=await Promise.all([
  json(SUEZ+'/99-technik/video.json'),
  json(SUEZ+'/99-technik/BILD_AUDIO_ZUORDNUNG.json'),
  json(SUEZ+'/99-technik/SHOT_PLAN.json'),
  readFile(SUEZ+'/00-bildprompts/google-flow-prompt.txt','utf8')
 ]);
 assert.equal(meta.coverPolicyVersion,2);
 assert.equal(mapping.rules.coverExcludedFromTimeline,true);
 assert.equal(shot.shots[0].visibleGermanText,'');
 const beginning=prompt.split('\nBILD 02 ·')[0].split('\nBILD 01 ·').at(-1);
 assert.match(beginning,/No readable text on Bild 01/);
 assert.doesNotMatch(beginning,/Render only.*EIN SCHIFF/);
 assert.match(prompt,/03-export\/THUMBNAIL\.png/);
});

test('Cover V1 und V2 Phase-1-Gates bleiben parallel funktionsfähig',()=>{
 for(const dir of [LEGACY,SUEZ]){
  const run=spawnSync(process.execPath,['src/cli/validate-youtube-phase1.js','--dir',dir],{encoding:'utf8'});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
 }
});
