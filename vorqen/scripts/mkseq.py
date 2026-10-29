import sys, glob, os, subprocess, shutil
from PIL import Image
name, step, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
tmp = f'tmp-{name}'
shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
subprocess.run(['ffmpeg','-v','error','-y','-i',f'v-{name}.mp4','-vf',f"select='not(mod(n\\,{step}))',hue=s=0",'-vsync','vfr',f'{tmp}/f%03d.png'],check=True)
fs = sorted(glob.glob(f'{tmp}/f*.png'))
# drop the last frame if it duplicates the first (seamless loop source)
total = {}
for w, q, sharp in ((1600, 72, True), (960, 70, False)):
    d = f'{out}/{name}/{w}'; os.makedirs(d, exist_ok=True)
    total[w] = 0
    for i, f in enumerate(fs):
        im = Image.open(f).convert('L')
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        if sharp:
            from PIL import ImageFilter
            im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=45, threshold=2))
        p = f'{d}/{i:03d}.webp'
        im.save(p, 'WEBP', quality=q, method=5)
        total[w] += os.path.getsize(p)
print(name, len(fs), 'frames', {k: f'{v//1024} KB' for k, v in total.items()})
shutil.rmtree(tmp)
