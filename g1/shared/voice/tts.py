"""يولّد مقاطع الصف الأول بـ edge-tts. الإدخال: ملف JSON فيه [{"file","text","voice"}]. يتجاوز الملفات الموجودة (الاسم بصمة النص)."""
import json, asyncio, os, sys, subprocess
import edge_tts
async def one(sem, job, fails):
    f = job['file']
    if os.path.exists(f) and os.path.getsize(f) > 0: return
    os.makedirs(os.path.dirname(f), exist_ok=True)
    async with sem:
        for a in range(4):
            try:
                tmp = f + '.raw.mp3'
                await edge_tts.Communicate(job['text'], job['voice'], rate='-5%').save(tmp)
                subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp, '-af',
                    'loudnorm=I=-19:TP=-2,silenceremove=start_periods=1:start_threshold=-50dB',
                    '-ac', '1', '-ar', '24000', '-b:a', '48k', f], check=True)
                os.remove(tmp); return
            except Exception:
                await asyncio.sleep(2 + a * 3)
        fails.append(job['text'])
async def main():
    jobs = json.load(open(sys.argv[1])); sem = asyncio.Semaphore(6); fails = []
    await asyncio.gather(*(one(sem, j, fails) for j in jobs))
    for t in fails: print('FAIL', t, file=sys.stderr)
    sys.exit(1 if fails else 0)
asyncio.run(main())
