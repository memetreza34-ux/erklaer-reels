import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { validateYoutubeScriptQuality } from '../src/core/youtube-script-quality.js';

const dir = 'youtube/2026-KW42_12-10_bis_18-10/strasse-von-hormus-aktuelle-krise-und-globale-folgen';
const json = async p => JSON.parse(await readFile(p, 'utf8'));

test('aktuelles Hormus-Video ist ein neues Politik-/Geografie-Projekt mit 64 konkreten Bildmomenten', async () => {
  const [meta,shots,map,script,prompt,policy,research] = await Promise.all([
    json(dir+'/99-technik/video.json'),
    json(dir+'/99-technik/SHOT_PLAN.json'),
    json(dir+'/99-technik/BILD_AUDIO_ZUORDNUNG.json'),
    readFile(dir+'/01-voice-script/voice-script.txt','utf8'),
    readFile(dir+'/00-bildprompts/google-flow-prompt.txt','utf8'),
    json('config/youtube-channel-policy.json'),
    readFile(dir+'/99-technik/RECHERCHE_QUELLEN.md','utf8')
  ]);
  assert.equal(meta.schemaVersion,13);
  assert.equal(meta.createdAt,'2026-10-12');
  assert.equal(meta.topicCategory,'internationale Beziehungen und Geopolitik');
  assert.equal(meta.topicEditor.decision,'APPROVED_NEW');
  assert.equal(meta.plannedImageCount,64);
  assert.equal(shots.shots.length,64);
  assert.equal(map.images.length,64);
  assert.equal(meta.coverPolicyVersion,2);
  assert.equal(meta.coverPolicy.firstSceneIsCover,false);
  assert.equal(meta.coverPolicy.thumbnailFile,'03-export/THUMBNAIL.png');
  assert.equal(meta.renderPolicy.endHoldSeconds,1.3);
  assert.equal(meta.imagesReady,false);
  assert.equal(meta.audioReady,false);
  assert.equal(meta.renderReady,false);
  for(let i=0;i<64;i++){
    const s=shots.shots[i],m=map.images[i],nn=String(i+1).padStart(2,'0');
    assert.equal(s.imageNumber,i+1);
    assert.equal(m.imageNumber,i+1);
    assert.ok(script.includes(s.narration),'missing spoken line '+nn);
    assert.ok(script.includes(m.startAnchor),'missing audio anchor '+nn);
    assert.ok(prompt.includes('BILD '+nn+' ·'),'missing image '+nn);
    assert.match(s.sceneDescription,/[A-Za-z]{12}/);
    assert.ok(s.visualForm);
    assert.ok(s.sceneDescription.length>=55);
  }
  assert.match(prompt,/SEPARATE COVER — EXPORT ONLY HARD LOCK/);
  assert.match(prompt,/COVER = 3 CANDIDATES HARD LOCK/);
  assert.match(prompt,/FINAL IMAGE FOLDER HARD LOCK/);
  assert.match(prompt,/COUNT|Count|count|Zahl|Dateinamen/);
  assert.match(prompt,/Topic Anchor:/);
  assert.match(prompt,/Visual Form:/);
  assert.match(research,/12\.10\.2026/);
  assert.match(research,/2025/);
  assert.match(research,/Reuters/);
  assert.match(research,/https:\/\/www\.iea\.org/);
  assert.match(research,/https:\/\/www\.imo\.org/);
  const quality=validateYoutubeScriptQuality(script,policy.scriptQualityPolicy,{topic:meta.topic,title:meta.title});
  assert.equal(quality.passed,true,quality.errors.join('; '));
  assert.ok(quality.metrics.wordCount>=900);
});

test('echter Phase-1-Validator besteht für Hormus-Projekt',()=>{
 const p=spawnSync(process.execPath,['src/cli/validate-youtube-phase1.js','--dir',dir],{encoding:'utf8'});
 assert.equal(p.status,0,(p.stdout||'')+'\n'+(p.stderr||''));
});
