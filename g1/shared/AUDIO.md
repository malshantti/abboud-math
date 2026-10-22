# صوت الصف الأول (G1 audio API)

All G1 narration is **pre-recorded** (edge-tts, Arabic `ar-SA-HamedNeural`, English `en-GB-SoniaNeural`, rate −5%, mono 48 kbps). No music, no instruments, no browser speech synthesis.

## Files
- `g1/shared/audio.js` — player + `window.G1_AUDIO` (loaded by every G1 `index.html`, before `early.js`).
- `g1/shared/audio/<hash>.mp3` — clips. File name = `cyrb53(voice + "|" + spokenText)`, so editing a text makes a new file. Clips are shared by all subjects (deduplicated).
- `g1/<subject>/audio-index.js` — **generated**; maps `G1_AUDIO.key(displayText, lang)` → clip hash. Only clips that exist are listed, so a button never appears without a recording.
- `g1/<subject>/voice/say.json` — optional `{ "display text": "نَصٌّ مُشَكَّلٌ تَشْكِيلًا تَامًّا" }`. The spoken text must be **fully voweled** Arabic so pronunciation is correct. `voice/unvoweled.txt` is regenerated with every Arabic text that still has no harakat — keep it empty.
- `g1/shared/voice/build.cjs` + `tts.py` — collector and generator.

## Build
```
node g1/shared/voice/build.cjs arabic english   # generate missing clips + rewrite audio-index.js
node g1/shared/voice/build.cjs --dry arabic     # counts only
```
Commit the new `g1/shared/audio/*.mp3` and `g1/<subject>/audio-index.js`. Delete orphan clips only if no subject index references them (`node tests/g1-audio.cjs` checks references).

## What gets voiced automatically (engine `early.js`)
Collected from `G1_COURSE` (units + foundations): `step.text`, `task.prompt`, `task.explain`, every `choice.label` (or `choice.say` if a choice shows a picture/number but should speak another text), plus fixed engine phrases (`G1_AUDIO.ENGINE`). Language is detected (Arabic letters → `ar`, Latin only → `en`); force with `lang:'en'|'ar'` on a step/task/choice or `{text,lang}`.
The engine renders a big speaker button beside the prompt/step text and on every choice, **autoplays** the prompt/step when it opens, plays “أَحْسَنْتَ” + explanation on success, and shows a stop toggle (`الصَّوْتُ يَعْمَلُ / مُتَوَقِّفٌ`) remembered in `localStorage['g1_audio_auto']`.

## Letters, syllables, words in your own scenes
Add the strings to a `speak` array anywhere in the lesson/task/scene object so the builder records them:
```js
{ type:'letters', value:'بَ', speak:['بَ', {text:'cat', lang:'en'}] }
```
Then render the button in your art/scene code:
```js
G1_AUDIO.button('بَ')                       // '' if not recorded yet
G1_AUDIO.button('cat', { lang:'en', size:'lg', label:'Listen' })
G1_AUDIO.play('بَ'); G1_AUDIO.play([{text:'cat',lang:'en'}, 'قِطَّةٌ']); G1_AUDIO.stop();
G1_AUDIO.autoplay('…')                      // respects the remembered stop toggle
G1_AUDIO.has(text, lang)
```
Buttons are `<button class="g1-say" data-say="…">` with an SVG icon (no emoji); clicks are handled globally. Never put a `g1-say` button inside another button — place it beside (see `.g1-choice-wrap`).
For a letter **name** vs letter **sound**, use different display strings or `choice.say`.

## Caching
Clips are not precached; the service worker caches each clip on first play (`g1audio-clips`), names are content hashes so they never go stale. Bump `?v=` and the subject `sw.js` `V` when `audio-index.js` changes.
