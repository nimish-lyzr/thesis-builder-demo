#!/usr/bin/env python3
"""Generate web/screens.css and the view sections of web/index.html from the
Design-canvas artboards in design-canvas/.

The artboards are authored in the Design canvas as `.dc.html` — self-contained
pages with a `<helmet>` stylesheet, `{{holes}}`, `<sc-if>` and `<sc-for>`. This
turns each one into a plain `<section>` the demo's own renderer can drive:

  {{path}} in text        -> <span data-bind="path">
  {{path}} as a whole attr-> data-attr-<name>="path"
  {{path}} inside style=  -> data-style-tpl="… [[path]] …"   (see below)
  <sc-if value="{{c}}">   -> <div class="cond" data-cond="c" hidden>
  <sc-for list="{{x}}">   -> <div class="rep" data-list="x" data-as="…">
  href="Other.dc.html"    -> href="#slug" data-go="slug"

Style holes are rewritten to [[path]] ON PURPOSE. If they stayed as {{path}},
the text pass below would inject a <span> INSIDE the style attribute and
silently destroy the markup — the company table rendered as raw CSS before this
was fixed. Each artboard's stylesheet is scoped under its own `#v-<id>` so
fifteen stylesheets can share one document without colliding.

Run from the repo root:  python3 tools/build_web.py
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'design-canvas'
WEB = ROOT / 'web'

ORDER = [('start','Start'),('onboarding','Main'),('team','Team'),('question','Thesis'),
         ('globe','Globe'),('market','Market'),('whitespace','Whitespace'),
         ('companies','Companies'),('company','Company'),('thesis','ThesisDoc'),
         ('collaborate','Collaborate'),('fastforward','FastForward'),('signal','Signal'),
         ('evolution','Evolution'),('globelive','GlobeLive')]
SLUG = {board: slug for slug, board in ORDER}


def esc(v):
    return v.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')


def scope_css(css, vid):
    """Prefix every rule with #v-<id>; copy @keyframes and @media through whole."""
    out, i = [], 0
    while i < len(css):
        at, brace = css.find('@', i), css.find('{', i)
        if brace == -1:
            out.append(css[i:])
            break
        if at != -1 and at < brace:
            depth, k = 0, css.find('{', at)
            while k < len(css):
                if css[k] == '{':
                    depth += 1
                elif css[k] == '}':
                    depth -= 1
                    if depth == 0:
                        break
                k += 1
            out.append(css[i:k + 1])
            i = k + 1
            continue
        sel, end = css[i:brace].strip(), css.find('}', brace)
        parts = ['#v-' + vid if one.strip() in ('body', 'html', ':root')
                 else '#v-' + vid + ' ' + one.strip()
                 for one in sel.split(',') if one.strip()]
        out.append(', '.join(parts) + css[brace:end + 1])
        i = end + 1
    return ''.join(out)


def strip_dc(markup):
    markup = re.sub(r'<sc-if value="\{\{([\w.]+)\}\}"[^>]*>',
                    lambda m: '<div class="cond" data-cond="%s" hidden>' % m.group(1), markup)
    markup = markup.replace('</sc-if>', '</div>')
    markup = re.sub(r'<sc-for list="\{\{(\w+)\}\}" as="(\w+)"[^>]*>',
                    lambda m: '<div class="rep" data-list="%s" data-as="%s">' % (m.group(1), m.group(2)), markup)
    markup = markup.replace('</sc-for>', '</div>')

    def style_tpl(m):
        tpl = m.group(1)
        if '{{' not in tpl:
            return m.group(0)
        static = re.sub(r'[^;{]*\{\{[\w.]+\}\}[^;]*;?', '', tpl).strip()
        return 'style="%s" data-style-tpl="%s"' % (static, esc(re.sub(r'\{\{([\w.]+)\}\}', r'[[\1]]', tpl)))

    markup = re.sub(r'style="([^"]*)"', style_tpl, markup)
    markup = re.sub(r'\s(?:hint-placeholder-(?:val|count))="\{\{[\w.]+\}\}"', '', markup)
    markup = re.sub(r'(\w[\w-]*)="\{\{([\w.]+)\}\}"',
                    lambda m: 'data-attr-%s="%s"' % (m.group(1).lower(), m.group(2)), markup)
    markup = re.sub(r'\{\{([\w.]+)\}\}', lambda m: '<span data-bind="%s"></span>' % m.group(1), markup)
    if '{{' in markup:
        sys.exit('unconverted template hole remains')
    if re.search(r'="[^"]*<span', markup):
        sys.exit('a <span> landed inside an attribute value')
    return markup


# Screens that carried the full app sidebar in the canvas build. The web build
# has one persistent shell, so the inlined copy comes out.
SHELL_SCREENS = {'market', 'whitespace', 'companies', 'company', 'thesis',
                 'collaborate', 'signal', 'evolution'}
# Screens that drew their own brand bar across the top; the shell header
# replaces it.
BARRED_SCREENS = {'start', 'team', 'question', 'globe', 'fastforward', 'globelive'}

SIDEBAR_OPEN = '<div style="width: 240px; flex-shrink: 0; box-sizing: border-box; background: #f6f6f6; border-right: 1px solid #e5e5e5; display: flex; flex-direction: column;">'
MAIN_OPEN = '<div style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column;">'


def unchrome(body, vid):
    """Fluid root, and no chrome the shell already provides."""
    # the artboard frame becomes a fluid page that fills the canvas
    body = re.sub(r'(<div style=")(?:position: relative; )?width: 1440px; height: 900px; box-sizing: border-box;',
                  r'\1position: relative; width: 100%; min-height: 100%; box-sizing: border-box;', body, count=1)
    if vid in SHELL_SCREENS:
        a = body.find(SIDEBAR_OPEN)
        b = body.find(MAIN_OPEN)
        if a == -1 or b == -1 or b < a:
            sys.exit('sidebar block not found in ' + vid)
        body = body[:a] + body[b:]
    if vid in BARRED_SCREENS:
        m = re.search(r'\n  <div style="height: (?:54|60)px; flex-shrink: 0;.*?\n  </div>\n', body, flags=re.S)
        if not m:
            sys.exit('brand bar not found in ' + vid)
        body = body[:m.start()] + '\n' + body[m.end():]
    return body


def main():
    css_all, sections = [], []
    for vid, board in ORDER:
        src = (SRC / (board + '.dc.html')).read_text()
        css_all.append('/* ===== %s ===== */\n' % vid
                       + scope_css(re.search(r'<style>(.*?)</style>', src, re.S).group(1), vid))
        body = re.search(r'<x-dc>(.*?)</x-dc>', src, re.S).group(1)
        body = re.sub(r'<helmet>.*?</helmet>', '', body, flags=re.S).strip()
        body = unchrome(body, vid)
        # the canvas build has a per-artboard narration chip; the web build has
        # one transport bar instead
        body = re.sub(r'\n  <div style="position: absolute; right: 22px; bottom: 20px;.*?\n  </div>\n',
                      '\n', body, flags=re.S)
        body = strip_dc(body)
        body = re.sub(r'href="(\w+)\.dc\.html"',
                      lambda m: 'href="#%s" data-go="%s"' % (SLUG.get(m.group(1), 'start'),
                                                             SLUG.get(m.group(1), 'start')), body)
        sections.append('<section class="view" id="v-%s" hidden>\n%s\n</section>' % (vid, body))

    (WEB / 'screens.css').write_text('\n\n'.join(css_all))

    page = (WEB / 'index.html').read_text()
    a = page.index('<!-- views:start -->') + len('<!-- views:start -->')
    b = page.index('<!-- views:end -->')
    (WEB / 'index.html').write_text(page[:a] + '\n' + '\n'.join(sections) + '\n' + page[b:])
    steps_dir = WEB / 'audio' / 'steps'
    steps_dir.mkdir(parents=True, exist_ok=True)
    recorded = sorted(f.name for f in steps_dir.glob('*.mp3'))
    (WEB / 'audio' / 'steps.json').write_text(json.dumps(recorded))
    print('wrote web/screens.css, %d views into web/index.html, %d per-step recordings in the manifest'
          % (len(sections), len(recorded)))


if __name__ == '__main__':
    main()
