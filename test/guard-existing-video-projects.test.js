import assert from 'node:assert/strict';
import test from 'node:test';
import {
  recordedApprovals,
  unapprovedExistingProjects,
  videoProjectRoot
} from '../scripts/guard-existing-video-projects.js';

const yt = 'youtube/2026-KW41_05-10_bis_11-10/suezkanal-wie-ein-schiff-den-welthandel-ausbremste';
const reel = 'reels/2026-KW37_07-09_bis_13-09/montag/reel-01_warum-werden-finger-im-wasser-runzlig';

test('existing YouTube project and Reel folders are recognized', () => {
  assert.equal(videoProjectRoot(yt + '/01-voice-script/voice-script.txt'), yt);
  assert.equal(videoProjectRoot(reel + '/99-technik/video.json'), reel);
  assert.equal(videoProjectRoot('youtube/templates/video-template/99-technik/video.json'), null);
  assert.equal(videoProjectRoot('youtube/YOUTUBE_WORKFLOW.md'), null);
  assert.equal(videoProjectRoot('src/cli/render-youtube.js'), null);
});

test('a generic repo improvement cannot touch existing video projects', () => {
  const edits = [yt + '/01-voice-script/voice-script.txt', reel + '/README.md',
    'youtube/YOUTUBE_WORKFLOW.md'];
  assert.deepEqual(unapprovedExistingProjects(edits, () => true),
    [reel, yt].sort());
});

test('adding a genuinely new video project remains possible', () => {
  const edits = [yt + '/README.md', 'youtube/2026-KW42_12-10_bis_18-10/neues-video/README.md'];
  assert.deepEqual(unapprovedExistingProjects(edits, root => root === yt), [yt]);
  assert.deepEqual(unapprovedExistingProjects(
    ['youtube/2026-KW42_12-10_bis_18-10/neues-video/README.md'], () => false), []);
});

test('even new or renamed files inside an existing video are protected', () => {
  const edits = [yt + '/99-technik/new-quality-rule.json', yt + '/README-OLD.md'];
  assert.deepEqual(unapprovedExistingProjects(edits, root => root === yt), [yt]);
});

test('project-specific explicit user instruction permits only this project', () => {
  const body = 'EXPLICIT_VIDEO_EDIT_APPROVAL: ' + yt + '\n' +
    'USER_REQUEST_QUOTE: Bitte ändere das Skript von genau diesem Suezkanal-Video.';
  assert.deepEqual([...recordedApprovals(body)], [yt]);
  assert.deepEqual(unapprovedExistingProjects([yt + '/README.md', reel + '/README.md'],
    () => true, body), [reel]);
});

test('generic or undocumented approvals never bypass the guard', () => {
  const bodies = [
    'EXPLICIT_VIDEO_EDIT_APPROVAL: ' + yt,
    'EXPLICIT_VIDEO_EDIT_APPROVAL: youtube/*\nUSER_REQUEST_QUOTE: Mach mein Video bitte komplett neu.',
    'EXPLICIT_VIDEO_EDIT_APPROVAL: ' + yt + '\nUSER_REQUEST_QUOTE: Ja'
  ];
  for (const body of bodies) {
    assert.deepEqual(unapprovedExistingProjects([yt + '/README.md'], () => true, body), [yt]);
  }
});
