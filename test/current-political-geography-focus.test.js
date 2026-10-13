import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { evaluateYoutubeTopicFocus } from '../src/core/youtube-topic-focus.js';

const read = (p) => readFile(new URL(`../${p}`, import.meta.url), 'utf8');
const policy = async () => JSON.parse(await read('config/youtube-channel-policy.json'));

test('Politik steht im Zentrum; neue Videos über Begriffe, Ideologien und Geografie sind freigegeben', async () => {
  const focus = (await policy()).channelFocus;
  assert.deepEqual(focus.primaryTopics, [
    'Politik und Staatssysteme',
    'Politische Begriffe, Institutionen und politische Bildung',
    'Ideologien und Gesellschaftssysteme',
    'internationale Beziehungen und Geopolitik',
    'Länder, Geografie, Grenzen und Territorien'
  ]);
  assert.match(focus.primaryPriority, /Politik ist Kern/);
  assert.equal(focus.evergreenPoliticalEducationAllowedWithoutCurrentNewsTrigger,true);
  assert.equal(focus.historicalOriginsAllowed,true);
  for (const topicCategory of focus.primaryTopics) {
    for(const createdAt of ['2026-10-12','2026-10-13','2027-05-01']) {
      assert.equal(evaluateYoutubeTopicFocus({createdAt,topicCategory},focus).valid,true);
    }
  }
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-13',topicCategory:'Geschichte'},focus).valid,false);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'',topicCategory:'Geschichte'},focus).valid,false);
});

test('historische Altprojekte bleiben gültig; ausdrückliche Einzelaufträge möglich', async () => {
  const focus = (await policy()).channelFocus;
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-08',topicCategory:'Geschichte'},focus).valid,true);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-09-27',topicCategory:'Ideologien und Gesellschaftssysteme'},focus).valid,true);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-13',topicCategory:'Geschichte',explicitUserRequestedOutsideFocus:true},focus).valid,true);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-13',topicCategory:'Medizin'},focus).valid,false);
  assert.equal(evaluateYoutubeTopicFocus({createdAt:'2026-10-13',topicCategory:'Ideologien und Gesellschaftssysteme'},focus).valid,true);
});

test('Agenten und Workflows erlauben Begriffsursprünge und Evergreen-Bildung statt News-Zwang',async()=>{
  const [youtube,reel,agents,doc,history,workflow] = await Promise.all([
    read('youtube/YOUTUBE_WORKFLOW.md'),read('REEL_THEMENFOKUS.md'),
    read('AGENTS.md'),read('youtube/TOPIC_SELECTION_POLICY.md'),
    read('THEMEN_HISTORIE.md'),read('CURRENT_WORKFLOW.md')
  ]);
  assert.match(youtube,/Politik erklären und politische Bildung/);
  assert.match(youtube,/Ursprung und Geschichte sind ausdrücklich zulässig/);
  assert.match(youtube,/keine.*Zwang/i);
  assert.match(reel,/Geschichte ist nicht verboten/);
  assert.match(agents,/politische Begriffe, ihren Ursprung/);
  assert.match(workflow,/Politik ist das A und O/);
  assert.match(doc,/Evergreen-Bildungsvideos brauchen keine News/);
  assert.match(doc,/Ideologien und Gesellschaftssysteme/);
  assert.match(doc,/keine.*Geschichtschronik/i);
  assert.match(doc,/unabhängige nachvollziehbare Quellen/);
  assert.match(doc,/Viralität/);
  assert.match(history,/Alte Projekte bleiben als Archiv/);
});
