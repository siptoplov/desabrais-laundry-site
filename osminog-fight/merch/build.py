"""
Мерч ОСЬМИНОГ: векторные принты (текст в кривых) и макеты изделий (flats).
Единица измерения везде — миллиметры: 1 unit = 1 мм, размер M.
Запуск из папки osminog-fight:
  pip install fonttools brotli uharfbuzz
  python merch/build.py          # пишет merch/print и merch/mock
  node merch/png.mjs merch       # PNG 300 dpi в merch/png (нужен playwright)
"""
import io, math, re, sys
from pathlib import Path

import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

SITE = Path(__file__).resolve().parents[1]
FONTS = SITE / 'src/fonts'
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent
(OUT / 'print').mkdir(parents=True, exist_ok=True)
(OUT / 'mock').mkdir(parents=True, exist_ok=True)

RED = '#FF2B3A'


def num(v):
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


# ---------- логотип из исходников сайта ----------
src = (SITE / 'src/components/brand/logoPaths.ts').read_text()
def _arr(name):
    block = re.search(name + r' = \[(.*?)\];', src, re.S).group(1)
    return re.findall(r'"([^"]+)"', block)
FRAME = _arr('logoFrame')
TENT = _arr('logoTentacles')
HEAD = re.search(r'logoHead = "([^"]+)"', src).group(1)
COLLAR = re.search(r'logoCollar = "([^"]+)"', src).group(1)
EYES = [(174, 162, 32), (226, 162, -32)]


def logo(size, ink, eye=RED, frame=True):
    """Знак (октагон-ринг + осьминог) размером size×size мм, левый верхний угол в (0,0)."""
    k = size / 400
    out = [f'<g transform="scale({num(k)})">']
    if frame:
        out.append(f'<g fill="none" stroke="{ink}" stroke-width="20" stroke-linejoin="miter">')
        out += [f'<path d="{d}"/>' for d in FRAME]
        out.append('</g>')
    out.append(f'<g fill="{ink}">')
    out += [f'<path d="{d}"/>' for d in TENT]
    out += [f'<path d="{COLLAR}"/>', f'<path d="{HEAD}"/>', '</g>']
    out += [f'<ellipse cx="{x}" cy="{y}" rx="15" ry="7" transform="rotate({r} {x} {y})" fill="{eye}"/>' for x, y, r in EYES]
    out.append('</g>')
    return ''.join(out)


# ---------- текст в кривых (Sofia Sans Extra Condensed, OFL) ----------
_fonts = {}
def font(style, wght, script):
    key = (style, wght, script)
    if key not in _fonts:
        f = TTFont(FONTS / f'sofia-sans-extra-condensed-{script}-wght-{style}.woff2')
        inst = instantiateVariableFont(f, {'wght': wght}, inplace=False)
        inst.flavor = None
        buf = io.BytesIO(); inst.save(buf)
        _fonts[key] = dict(gs=inst.getGlyphSet(), order=inst.getGlyphOrder(),
                           hb=hb.Font(hb.Face(buf.getvalue())), upm=inst['head'].unitsPerEm)
    return _fonts[key]


def _runs(s):
    runs = []
    for ch in s:
        sc = 'cyrillic' if 0x400 <= ord(ch) <= 0x4FF or ch == '№' else 'latin'
        if runs and runs[-1][0] == sc:
            runs[-1][1] += ch
        else:
            runs.append([sc, ch])
    return runs


class Text:
    """Строка в кривых. d — путь с базовой линией в y=0; bbox — реальные границы глифов."""
    def __init__(self, s, size, italic=True, wght=900, track=0.0):
        style = 'italic' if italic else 'normal'
        cmds, x = [], 0.0
        bp = None
        xmin = ymin = math.inf; xmax = ymax = -math.inf
        for sc, run in _runs(s):
            F = font(style, wght, sc)
            k = size / F['upm']
            buf = hb.Buffer(); buf.add_str(run); buf.guess_segment_properties()
            hb.shape(F['hb'], buf, {'kern': True, 'liga': True})
            for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
                name = F['order'][info.codepoint]
                gx = x + pos.x_offset * k
                pen = SVGPathPen(F['gs'], ntos=num)
                F['gs'][name].draw(TransformPen(pen, (k, 0, 0, -k, gx, -pos.y_offset * k)))
                c = pen.getCommands()
                if c:
                    cmds.append(c)
                    b = BoundsPen(F['gs'])
                    F['gs'][name].draw(TransformPen(b, (k, 0, 0, -k, gx, -pos.y_offset * k)))
                    if b.bounds:
                        xmin = min(xmin, b.bounds[0]); ymin = min(ymin, b.bounds[1])
                        xmax = max(xmax, b.bounds[2]); ymax = max(ymax, b.bounds[3])
                x += pos.x_advance * k + track * size
        self.d = ' '.join(cmds)
        self.adv = x - track * size
        self.bbox = (xmin, ymin, xmax, ymax)
        self.w = xmax - xmin
        self.h = ymax - ymin

    def place(self, left, top, fill):
        """Ставит строку так, чтобы её реальная рамка начиналась в (left, top)."""
        tx, ty = left - self.bbox[0], top - self.bbox[1]
        return f'<path transform="translate({num(tx)} {num(ty)})" fill="{fill}" d="{self.d}"/>'


def fit(s, width, **kw):
    t = Text(s, 100, **kw)
    return Text(s, 100 * width / t.w, **kw)


def cap(s, cap_mm, **kw):
    """Размер по высоте прописной (cap height 0.655 em у Sofia Sans)."""
    return Text(s, cap_mm / 0.655, **kw)


# ---------- принты ----------
def p_znak(c, size=90):
    return size, size, logo(size, c['ink'])


def p_spina(c):
    W = 280
    parts = [f'<g transform="translate({(W - 200) / 2} 0)">{logo(200, c["ink"])}</g>']
    wm = fit('ОСЬМИНОГ', W)
    y = 200 + 16
    parts.append(wm.place(0, y, c['ink']))
    y += wm.h + 10
    parts.append(f'<rect x="0" y="{num(y)}" width="{W}" height="3.5" fill="{RED}"/>')
    y += 3.5 + 8
    a = cap('BELARUSIAN FIGHT LEAGUE', 8, italic=False, wght=800, track=0.16)
    b = cap('МИНСК · С 2009', 8, italic=False, wght=800, track=0.16)
    assert a.w + b.w + 12 < W, (a.w, b.w)
    parts.append(a.place(0, y, c['ink']))
    parts.append(b.place(W - b.w, y, RED))
    y += max(a.h, b.h)
    return W, y, ''.join(parts)


def octagon(cx, cy, r, lit_new, lit_old, ink, thin=0.6, thick=3.4):
    """Мини-октагон: 8 сторон по часовой от верхней. Новые стороны — красным, пройденные — краской."""
    out = []
    pts = [(cx + r * math.cos(math.radians(-112.5 + 45 * i)), cy + r * math.sin(math.radians(-112.5 + 45 * i))) for i in range(9)]
    for i in range(8):
        (x1, y1), (x2, y2) = pts[i], pts[i + 1]
        if i in lit_new:
            col, w = RED, thick
        elif i in lit_old:
            col, w = ink, thick
        else:
            col, w = ink, thin
        out.append(f'<line x1="{num(x1)}" y1="{num(y1)}" x2="{num(x2)}" y2="{num(y2)}" stroke="{col}" stroke-width="{w}" stroke-linecap="butt"/>')
    return ''.join(out)


def p_vosem(c):
    W = 230
    parts, y = [], 0
    for word, col in (('ВОСЕМЬ', c['ink']), ('УДАРОВ.', c['ink']), ('ОДНА ПОБЕДА.', RED)):
        t = fit(word, W)
        parts.append(t.place(0, y, col))
        y += t.h + 7
    y += 7
    rows = [('01 · 02', 'КУЛАКИ'), ('03 · 04', 'ЛОКТИ'), ('05 · 06', 'КОЛЕНИ'), ('07 · 08', 'НОГИ')]
    rh = 21
    parts.append(f'<rect x="0" y="{num(y)}" width="{W}" height="0.8" fill="{c["ink"]}"/>')
    for i, (n, label) in enumerate(rows):
        top = y + i * rh
        tn = cap(n, 7, italic=False, wght=800, track=0.06)
        tl = cap(label, 7, italic=False, wght=800, track=0.18)
        mid = top + rh / 2
        parts.append(tn.place(0, mid - tn.h / 2, RED))
        parts.append(tl.place(52, mid - tl.h / 2, c['ink']))
        parts.append(octagon(W - 11, mid, 9, {2 * i, 2 * i + 1}, set(range(2 * i)), c['ink']))
        parts.append(f'<rect x="0" y="{num(top + rh)}" width="{W}" height="0.8" fill="{c["ink"]}"/>')
    y += 4 * rh + 10
    f = cap('OSMINOG FIGHT · BELARUSIAN FIGHT LEAGUE · С 2009', 4.2, italic=False, wght=700, track=0.2)
    if f.w > W:
        f = fit('OSMINOG FIGHT · BELARUSIAN FIGHT LEAGUE · С 2009', W, italic=False, wght=700, track=0.2)
    parts.append(f.place((W - f.w) / 2, y, c['ink']))
    y += f.h
    return W, y, ''.join(parts)


def p_sheya(c):
    """Печать под воротником сзади: знак + название."""
    a = cap('OSMINOG FIGHT', 5.2, italic=False, wght=800, track=0.14)
    b = cap('МИНСК · С 2009', 3.6, italic=False, wght=700, track=0.2)
    L = 20
    tw = max(a.w, b.w)
    W = L + 5 + tw
    H = L
    parts = [logo(L, c['ink'])]
    gap = 3.2
    th = a.h + gap + b.h
    ty = (H - th) / 2
    parts.append(a.place(L + 5, ty, c['ink']))
    parts.append(b.place(L + 5, ty + a.h + gap, RED))
    return W, H, ''.join(parts)


def p_rukav(c):
    W = 55
    t = fit('ОСЬМИНОГ', W)
    s = cap('С 2009', 4, italic=False, wght=800, track=0.3)
    parts = [t.place(0, 0, c['ink']), s.place((W - s.w) / 2, t.h + 3.5, RED)]
    return W, t.h + 3.5 + s.h, ''.join(parts)


def p_poyas(c):
    W = 300
    t = fit('ОСЬМИНОГ', W)
    return W, t.h, t.place(0, 0, c['ink'])


def p_lampas(c):
    t = cap('OSMINOG FIGHT', 13, italic=False, wght=800, track=0.2)
    return t.w, t.h, t.place(0, 0, c['ink'])


ON_BLACK = dict(ink='#F4F5F2', name='on-black')
ON_WHITE = dict(ink='#101114', name='on-white')
PRINTS = {
    '01-znak': p_znak, '02-spina': p_spina, '03-vosem-udarov': p_vosem, '04-sheya': p_sheya,
    '05-rukav': p_rukav, '06-poyas': p_poyas, '07-lampas': p_lampas,
}
sizes = {}
for key, fn in PRINTS.items():
    for c in (ON_BLACK, ON_WHITE):
        w, h, body = fn(c)
        sizes[key] = (w, h)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{num(w)}mm" height="{num(h)}mm" '
               f'viewBox="0 0 {num(w)} {num(h)}">{body}</svg>')
        (OUT / 'print' / f'{key}_{c["name"]}.svg').write_text(svg)
for k, (w, h) in sizes.items():
    print(f'print {k}: {w:.0f} x {h:.0f} mm')


# ---------- изделия (flats) ----------
GARMENT = {
    'black': dict(fill='#1A1B1F', inside='#0C0D10', rib='#222328', seam='#3A3D44', stitch='#5A5E66', edge='#000000', shade='#000000', shade_op=0.45, light='#FFFFFF', light_op=0.05, button='#2A2C31', print=ON_BLACK, flap='#101114'),
    'white': dict(fill='#F5F5F2', inside='#D9DADC', rib='#ECECE9', seam='#C9CBCF', stitch='#A9ADB3', edge='#8E939A', shade='#3A4250', shade_op=0.16, light='#FFFFFF', light_op=0.0, button='#E4E4E1', print=ON_WHITE, flap='#DDDEDF'),
}


class Flat:
    def __init__(self, g, outline):
        self.g, self.outline = g, outline
        self.parts = []
        self.defs = []

    def body(self):
        g = self.g
        self.defs.append(
            f'<linearGradient id="sh" x1="0" y1="0" x2="1" y2="0">'
            f'<stop offset="0" stop-color="{g["shade"]}" stop-opacity="{g["shade_op"]}"/>'
            f'<stop offset=".2" stop-color="{g["shade"]}" stop-opacity="0"/>'
            f'<stop offset=".8" stop-color="{g["shade"]}" stop-opacity="0"/>'
            f'<stop offset="1" stop-color="{g["shade"]}" stop-opacity="{g["shade_op"]}"/></linearGradient>'
            f'<linearGradient id="lt" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{g["light"]}" stop-opacity="{g["light_op"] * 2}"/>'
            f'<stop offset=".5" stop-color="{g["light"]}" stop-opacity="0"/></linearGradient>'
            f'<clipPath id="cl"><path d="{self.outline}"/></clipPath>')
        self.parts.append(f'<path d="{self.outline}" fill="{g["fill"]}"/>')

    def shade(self):
        self.parts.append(f'<path d="{self.outline}" fill="url(#sh)"/><path d="{self.outline}" fill="url(#lt)"/>')

    def edge(self):
        self.parts.append(f'<path d="{self.outline}" fill="none" stroke="{self.g["edge"]}" stroke-width="2" stroke-linejoin="round"/>')

    def seam(self, d, w=1.6):
        self.parts.append(f'<path d="{d}" fill="none" stroke="{self.g["seam"]}" stroke-width="{w}" stroke-linecap="round"/>')

    def stitch(self, d):
        self.parts.append(f'<path d="{d}" fill="none" stroke="{self.g["stitch"]}" stroke-width="1" stroke-dasharray="4 3"/>')

    def fill(self, d, key, stroke=True):
        s = f' stroke="{self.g["seam"]}" stroke-width="1.4"' if stroke else ''
        col = self.g[key] if key in self.g else key
        self.parts.append(f'<path d="{d}" fill="{col}"{s}/>')

    def band(self, d, w, key):
        """Окантовка по краю изделия: широкая обводка, обрезанная по силуэту, и строчка по её краю."""
        self.parts.append(f'<g clip-path="url(#cl)"><path d="{d}" fill="none" stroke="{self.g["stitch"]}" stroke-width="{2 * w + 2}"/>'
                          f'<path d="{d}" fill="none" stroke="{self.g[key]}" stroke-width="{2 * w}"/></g>')

    def fold(self, d):
        self.parts.append(f'<path d="{d}" fill="none" stroke="{self.g["shade"]}" stroke-opacity="{self.g["shade_op"] * 0.5}" stroke-width="3" stroke-linecap="round"/>')

    def put(self, svg_body, x, y, scale=1.0, rotate=0.0, cx=0.0, cy=0.0):
        r = f' rotate({num(rotate)} {num(cx)} {num(cy)})' if rotate else ''
        self.parts.append(f'<g transform="translate({num(x)} {num(y)}){r} scale({num(scale)})">{svg_body}</g>')

    def svg(self, x0, y0, w, h):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{num(x0)} {num(y0)} {num(w)} {num(h)}" '
                f'width="{num(w)}" height="{num(h)}"><defs>{"".join(self.defs)}</defs>{"".join(self.parts)}</svg>')


def mirror(pts):
    return pts + [(-x, y) for x, y in reversed(pts)]


# Футболка «Знак»
def tee(color, side):
    g = GARMENT[color]
    neck = 'C -92,52 -58,86 0,86 C 58,86 92,52 95,0' if side == 'front' else 'Q 0,44 95,0'
    outline = (f'M -95,0 {neck} L 235,38 Q 322,112 385,225 L 318,282 L 268,248 L 272,725 Q 0,737 -272,725 '
               f'L -268,248 L -318,282 L -385,225 Q -322,112 -235,38 Z')
    f = Flat(g, outline)
    f.body()
    for s in (1, -1):
        f.seam(f'M {235*s},38 Q {252*s},150 {268*s},248')
        f.stitch(f'M {373*s},212 L {306*s},269')
        f.fold(f'M {262*s},262 Q {222*s},300 {200*s},330')
    f.stitch('M -271,703 Q 0,715 271,703')
    if side == 'front':
        f.fill('M -95,0 Q 0,44 95,0 C 92,52 58,86 0,86 C -58,86 -92,52 -95,0 Z', 'inside', stroke=False)
        f.fill('M -95,0 Q 0,44 95,0 L 86,9 Q 0,60 -86,9 Z', 'rib', stroke=False)
        f.fill('M -95,0 C -92,52 -58,86 0,86 C 58,86 92,52 95,0 L 112,5 C 110,66 70,102 0,102 C -70,102 -110,66 -112,5 Z', 'rib')
        f.stitch('M -110,8 C -108,66 -68,99 0,99 C 68,99 108,66 110,8')
        w, h, body = p_znak(g['print'])
        f.put(body, 115 - w / 2, 118)
    else:
        f.fill('M -95,0 Q 0,44 95,0 L 109,5 Q 0,70 -109,5 Z', 'rib')
        f.stitch('M -107,8 Q 0,68 107,8')
        w, h, body = p_spina(g['print'])
        f.put(body, -w / 2, 95)
    f.shade(); f.edge()
    return f.svg(-405, -30, 810, 790)


# Поло «Секундант»
def polo(color, side):
    g = GARMENT[color]
    hem = 'Q 0,708' if side == 'front' else 'Q 0,742'
    hy = 698 if side == 'front' else 730
    outline = (f'M -85,0 Q 0,40 85,0 L 232,36 Q 312,104 362,205 L 305,258 L 262,232 L 266,{hy} {hem} -266,{hy} '
               f'L -262,232 L -305,258 L -362,205 Q -312,104 -232,36 Z')
    f = Flat(g, outline)
    if side == 'front':
        f.parts.append(f'<path d="M -266,660 L -266,730 Q 0,742 266,730 L 266,660 Z" fill="{g["inside"]}" stroke="{g["edge"]}" stroke-width="2"/>')
    f.body()
    for s in (1, -1):
        f.seam(f'M {232*s},36 Q {248*s},140 {262*s},232')
        # манжета-резинка с красной полосой
        f.fill(f'M {362*s},205 L {305*s},258 L {290.4*s},241.5 L {347.4*s},188.5 Z', 'rib')
        f.parts.append(f'<path d="M {354.7*s},196.8 L {297.7*s},249.8" stroke="{RED}" stroke-width="2.6"/>')
        f.seam(f'M {266*s},{hy - 44} L {266*s},{hy}', 2.2)
        f.fold(f'M {258*s},246 Q {222*s},290 {204*s},318')
    f.stitch(f'M -265,{hy - 20} {"Q 0,688" if side == "front" else "Q 0,722"} 265,{hy - 20}')
    if side == 'front':
        f.fill('M -84,8 Q 0,-10 84,8 C 62,14 40,40 18,66 L -18,66 C -40,40 -62,14 -84,8 Z', 'inside', stroke=False)
        f.fill('M -18,58 L 18,58 L 18,216 L -18,216 Z', 'fill')
        f.stitch('M -12,62 L -12,210 L 12,210 L 12,62')
        for by in (98, 140, 182):
            f.parts.append(f'<circle cx="0" cy="{by}" r="5.6" fill="{g["button"]}" stroke="{g["seam"]}" stroke-width="1.2"/>'
                           f'<circle cx="-1.6" cy="{by}" r=".9" fill="{g["seam"]}"/><circle cx="1.6" cy="{by}" r=".9" fill="{g["seam"]}"/>')
        f.fill('M -88,-2 Q 0,-30 88,-2 L 84,10 Q 0,-12 -84,10 Z', 'rib')
        for s in (1, -1):
            f.fill(f'M {-88*s},-2 C {-100*s},40 {-96*s},82 {-88*s},114 L {-16*s},68 C {-40*s},42 {-62*s},16 {-88*s},-2 Z', 'rib')
            f.parts.append(f'<path d="M {-86.5*s},107 L {-21*s},65.5" stroke="{RED}" stroke-width="2.4"/>')
        w, h, body = p_znak(g['print'], 70)
        f.put(body, 120 - w / 2, 120)
        w, h, body = p_rukav(g['print'])
        ang = math.degrees(math.atan2(53, 57))
        cx, cy = -297, 186
        f.put(body, cx - w / 2, cy - h / 2, 1, ang, w / 2, h / 2)
    else:
        f.fill('M -88,-2 Q 0,-16 88,-2 L 96,34 Q 0,40 -96,34 Z', 'rib')
        f.parts.append(f'<path d="M 93,29 Q 0,35 -93,29" fill="none" stroke="{RED}" stroke-width="2.4"/>')
        f.stitch('M -90,4 Q 0,-8 90,4')
        w, h, body = p_sheya(g['print'])
        f.put(body, -w / 2, 62)
    f.shade(); f.edge()
    return f.svg(-385, -45, 770, 805)


# Майка «Восемь ударов»
def tank(color, side):
    g = GARMENT[color]
    neck = 'C -78,80 -50,120 0,120 C 50,120 78,80 80,0' if side == 'front' else 'Q 0,70 80,0'
    arm = 'C 160,140 200,250 258,268'
    arm_l = 'C -200,250 -160,140 -150,6'
    outline = f'M -80,0 {neck} L 150,6 {arm} L 264,725 Q 0,737 -264,725 L -258,268 {arm_l} Z'
    f = Flat(g, outline)
    f.body()
    if side == 'front':
        f.fill('M -80,0 Q 0,70 80,0 C 78,80 50,120 0,120 C -50,120 -78,80 -80,0 Z', 'inside', stroke=False)
    f.band(f'M -80,0 {neck}', 11, 'rib')
    f.band(f'M 150,6 {arm}', 11, 'rib')
    f.band(f'M -258,268 {arm_l}', 11, 'rib')
    f.stitch('M -263,703 Q 0,715 263,703')
    for s in (1, -1):
        f.fold(f'M {244*s},300 Q {214*s},340 {198*s},372')
    if side == 'front':
        w, h, body = p_vosem(g['print'])
        f.put(body, -w / 2, 170)
    else:
        w, h, body = p_sheya(g['print'])
        f.put(body, -w / 2, 70)
    f.shade(); f.edge()
    return f.svg(-300, -30, 600, 790)


# Шорты «Октагон» (тайские)
def shorts(color, side):
    g = GARMENT[color]
    outline = ('M -190,0 L 190,0 L 190,100 L 258,300 L 292,428 Q 160,440 22,424 L 0,332 L -22,424 '
               'Q -160,440 -292,428 L -258,300 L -190,100 Z')
    f = Flat(g, outline)
    f.body()
    f.fill('M -190,0 L 190,0 L 190,100 L -190,100 Z', 'fill')
    f.stitch('M -186,7 L 186,7'); f.stitch('M -186,93 L 186,93')
    f.seam('M 0,100 L 0,332')
    for s in (1, -1):
        f.fill(f'M {258*s},300 L {292*s},428 L {252*s},426 Z', 'flap', stroke=False)
        f.parts.append(f'<path d="M {292*s},428 L {258*s},300 L {252*s},426" fill="none" stroke="{RED}" stroke-width="3" stroke-linejoin="round"/>')
        f.stitch(f'M {24*s},410 Q {150*s},424 {248*s},413')
        f.fold(f'M {60*s},140 Q {80*s},230 {70*s},330')
    f.parts.append(f'<rect x="-190" y="98.6" width="380" height="2.8" fill="{RED}"/>')
    if side == 'front':
        w, h, body = p_poyas(g['print'])
        f.put(body, -w / 2, 50 - h / 2)
        w, h, body = p_znak(g['print'], 150)
        f.put(body, 50, 158)
        w, h, body = p_lampas(g['print'])
        ux, uy = 68 / 211.1, -200 / 211.1
        nx, ny = -uy, ux
        sx, sy = -258 + 22 * ux + 30 * nx, 300 + 22 * uy + 30 * ny
        ang = math.degrees(math.atan2(uy, ux))
        # базовая линия надписи идёт вдоль бокового шва, буквы растут к шву
        f.parts.append(f'<g transform="translate({num(sx)} {num(sy)}) rotate({num(ang)}) translate(0 {num(-h)})">{body}</g>')
    else:
        w, h, body = p_znak(g['print'], 70)
        f.put(body, -w / 2, 15)
    f.shade(); f.edge()
    return f.svg(-320, -30, 640, 490)


for fn, name in ((tee, 'tee'), (polo, 'polo'), (tank, 'tank'), (shorts, 'shorts')):
    for color in ('black', 'white'):
        for side in ('front', 'back'):
            (OUT / 'mock' / f'{name}-{color}-{side}.svg').write_text(fn(color, side))
print('mock ok')
