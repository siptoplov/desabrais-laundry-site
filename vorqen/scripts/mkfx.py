"""Bake the cheap light-effect layers from the highlight masks.

The site never animates a CSS mask (a masked layer is re-composited as an
off-screen surface every frame). Instead the moving light is baked here:

- fx/<name>-flow-{0,1,2}.webp: the water highlights multiplied by soft
  glint bands, each phase shifted a third of a period downstream. Cross-
  fading the three in a loop reads as light running along the river, using
  nothing but opacity on the compositor.
- rays.webp: the dawn rays behind the rising emblem, with the radial falloff
  baked in, so the scene only rotates and fades a plain image.

Usage: python3 scripts/mkfx.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "media"
FLOW = {
    # name: (period in mask px, tilt in degrees from horizontal bands)
    "mountain-v": (34, 4),
    "valley": (38, 4),
}


def flow(name: str, period: float, tilt: float) -> None:
    src = Image.open(ROOT / "fx" / f"{name}.webp").convert("RGBA")
    a = np.asarray(src).astype(np.float32)[..., 3] / 255.0
    h, w = a.shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.deg2rad(tilt)
    u = y * np.cos(t) + x * np.sin(t)
    for k in range(3):
        phase = 2 * np.pi * (u / period - k / 3)
        band = 0.5 + 0.5 * np.cos(phase)  # raised cosine: blends into motion
        band = band**2.2  # tighter glints, still soft enough to interpolate
        out = np.clip(a * (0.08 + 0.92 * band) * 1.15, 0, 1)
        rgba = np.zeros((h, w, 4), np.uint8)
        rgba[..., :3] = 255
        rgba[..., 3] = (out * 255).round().astype(np.uint8)
        Image.fromarray(rgba, "RGBA").save(ROOT / "fx" / f"{name}-flow-{k}.webp", "WEBP", quality=82, method=6)


def rays(size: int = 1024) -> None:
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    c = (size - 1) / 2
    dx, dy = x - c, y - c
    r = np.hypot(dx, dy) / c
    ang = (np.degrees(np.arctan2(dx, -dy)) + 360) % 9  # one ray every 9°
    ray = np.clip(1 - np.abs(ang - 0.75) / 0.9, 0, 1)  # ~1.5° wide, soft edge
    falloff = np.interp(r, [0, 0.08, 0.35, 0.7, 1], [1, 1, 0.5, 0, 0])
    alpha = ray * falloff * 0.5
    rgba = np.zeros((size, size, 4), np.uint8)
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = 232, 240, 255
    rgba[..., 3] = (np.clip(alpha, 0, 1) * 255).round().astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(ROOT / "rays.webp", "WEBP", quality=80, method=6)


if __name__ == "__main__":
    for n, (p, tl) in FLOW.items():
        flow(n, p, tl)
    rays()
    print("done")
