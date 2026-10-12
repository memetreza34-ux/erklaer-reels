import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { evaluateYoutubeTopicFocus } from '../src/core/youtube-topic-focus.js';

const read = (p) => readFile(new URL(`../${p}`, import.meta.url), 'utf8');
const policy = async () => JSON.parse(await read('config/youtube-channel-policy.json'));

test('neue YouTube-Videos erlauben Politik, Geografie und Geopolitik, nicht Geschichte', async () => {
  const focus = (await policy()).channelFocus;
  assert.deepEqual(focus.primaryTopics, [
    'Politik und Staatssysteme',
    'Länder, Geografie, Grenzen und Territorien',
    'internationale Beziehungen und Geopolitik'
  ]);
  for (const topicCategory of focus.primaryTopics) {
    assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-12',topicCategory},focus).valid,true);
  }
  const blocked = evaluateYoutubeTopicFocus({createdAt:'2026-10-12',topicCategory:'Geschichte'},focus);
  assert.equal(blocked.valid,false);
  assert.match(blocked.error,/Geschichtsvideos/);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-13',topicCategory:'Ideologien und Gesellschaftssysteme'},focus).valid,false);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'',topicCategory:'Geschichte'},focus).valid,false);
});

test('historische Altprojekte bleiben kompatibel; ausdrücklicher Einzelauftrag darf abweichen', async () => {
  const focus = (await policy()).channelFocus;
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-08',topicCategory:'Geschichte'},focus).valid,true);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-09-27',topicCategory:'Ideologien und Gesellschaftssysteme'},focus).valid,true);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-12',topicCategory:'Geschichte',explicitUserRequestedOutsideFocus:true},focus).valid,true);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-12',topicCategory:'Medizin'},focus).valid,false);
});

test('zentrale Repo-Workflowregeln verpflichten auf aktuelle Fakten und schützen alte Videos', async () => {
  const [youtube,reel,agents,doc,history] = await Promise.all([
    read('youtube/YOUTUBE_WORKFLOW.md'),read('REEL_THEMENFOKUS.md'),
    read('AGENTS.md'),read('youtube/TOPIC_SELECTION_POLICY.md'),read('THEMEN_HISTORIE.md')
  ]);
  assert.match(youtube,/keine.*Geschicht/i);
  assert.match(youtube,/TOPIC_SELECTION_POLICY/);
  assert.match(agents,/keine eigenständigen Geschichtsvideos/i);
  assert.match(reel,/Kein eigenständiges Geschichtsvideo/i);
  assert.match(doc,/Aktualität zuerst/);
  assert.match(doc,/Viralität/);
  assert.match(doc,/unabhängige Quellen/);
  assert.match(history,/Alte Projekte bleiben ausschließlich als Archiv/);
});
