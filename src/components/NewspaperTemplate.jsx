import React from 'react';

/* ─────────────────────────── helpers ─────────────────────────── */

function textLen(html = '') {
    return html.replace(/<[^>]+>/g, '').length;
}

function parseImages(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string') {
        try {
            const p = JSON.parse(raw);
            if (Array.isArray(p)) return p.filter(Boolean);
        } catch (_) {}
        return raw.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
}

/* ─────────────────────────── styles ─────────────────────────── */
const s = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@400;600;700;800;900&display=swap');

  .np-bg   { background:#e8e4dc; padding:2.5rem 1rem 5rem; min-height:100vh; }
  .np-page {
    background:#faf8f2;
    max-width:1600px;
    margin:0 auto;
    box-shadow:0 28px 70px rgba(0,0,0,.4),0 8px 24px rgba(0,0,0,.25);
    border:1px solid #c4c0b5;
    font-family:'Lora',Georgia,serif;
  }

  /* ── MASTHEAD ── */
  .np-mast { padding:1.5rem 2rem 0; border-bottom:5px double #111; }
  .np-mast-inner {
    display:flex; align-items:center; justify-content:space-between;
    gap:1rem; margin-bottom:0.6rem;
  }
  .np-emblem {
    border:2px solid #111; padding:5px 9px; text-align:center;
    background:#fff; box-shadow:2px 2px 0 rgba(0,0,0,.12);
    flex-shrink:0;
  }
  .np-emblem-lbl { font-family:'Outfit',sans-serif; font-size:.5rem; font-weight:800;
    text-transform:uppercase; letter-spacing:1px; color:#555;
    border-bottom:3px solid #111; padding-bottom:2px; margin-bottom:2px; }
  .np-emblem-yr  { font-family:'Cinzel',serif; font-size:1.3rem; font-weight:900; color:#000; line-height:1; }
  .np-emblem-tag { font-family:'Outfit',sans-serif; font-size:.5rem; font-weight:800;
    text-transform:uppercase; letter-spacing:1px; color:#555;
    border-top:3px solid #111; padding-top:2px; margin-top:2px; }

  .np-centre { text-align:center; flex:1; }
  .np-overline { font-family:'Outfit',sans-serif; font-size:.68rem; font-weight:800;
    letter-spacing:4px; text-transform:uppercase; color:#8b2020; margin-bottom:.2rem; }
  .np-mast-title {
    font-family:'Cinzel',serif; font-weight:900; line-height:.92;
    font-size:clamp(2.8rem,6vw,5.4rem); color:#060606;
    text-transform:uppercase; letter-spacing:-1px; margin:0; }
  .np-mast-sub {
    font-family:'Cinzel',serif; font-weight:400;
    font-size:clamp(.7rem,1.3vw,.92rem);
    letter-spacing:6px; text-transform:uppercase; color:#555; margin-top:.35rem; }

  .np-barcode { text-align:right; flex-shrink:0;
    font-family:'Outfit',sans-serif; font-size:.6rem; font-weight:800;
    text-transform:uppercase; color:#444; line-height:1.6; }

  /* meta bar */
  .np-meta {
    display:flex; justify-content:space-between; align-items:center;
    padding:5px 0; border-top:3px solid #111; border-bottom:3px solid #111;
    margin-top:.4rem;
    font-family:'Outfit',sans-serif; font-size:.67rem; font-weight:700;
    letter-spacing:1.5px; text-transform:uppercase; color:#333;
  }
  .np-meta .acc { color:#8b2020; font-family:'Cinzel',serif; font-weight:700; font-size:.78rem; letter-spacing:.5px; }

  /* ticker */
  .np-ticker {
    font-family:'Outfit',sans-serif; font-size:.62rem; font-weight:800;
    text-transform:uppercase; letter-spacing:2px; color:#666;
    text-align:center; padding:5px 2rem; border-bottom:3px double #111;
  }

  /* ── BODY / ROWS ── */
  .np-body-wrap { padding:0 2rem 2rem; }

  /* Each horizontal band that holds 2-3 articles side by side */
  .np-row {
    display:flex;
    border-bottom:4px solid #111;
  }
  .np-row:last-child { border-bottom:none; }

  /* each cell inside a row */
  .np-col {
    padding:1rem 1.1rem;
    overflow:hidden;
  }
  .np-col + .np-col { border-left:3px solid #111; }

  /* ── CATEGORY LABEL ── */
  .np-cat {
    font-family:'Outfit',sans-serif; font-size:.6rem; font-weight:800;
    text-transform:uppercase; letter-spacing:2.5px; color:#8b2020; margin-bottom:.25rem;
  }

  /* ── HEADLINES ── */
  .np-hxl {
    font-family:'Cinzel',serif; font-size:clamp(2.4rem,5vw,4rem);
    font-weight:900; line-height:.93; color:#000;
    text-transform:uppercase; margin:0 0 .4rem;
    letter-spacing:-1px;
    text-align:center;
    text-shadow: 1px 1px 0 rgba(0,0,0,0.08);
  }
  .np-hlg {
    font-family:'Cinzel',serif; font-size:clamp(1.5rem,2.8vw,2.4rem);
    font-weight:900; line-height:1; color:#000;
    text-transform:uppercase; margin:0 0 .35rem;
    text-align:center; }
  .np-hmd {
    font-family:'Cinzel',serif; font-size:clamp(1.1rem,2vw,1.7rem);
    font-weight:900; line-height:1.05; color:#000;
    text-transform:uppercase; margin:0 0 .3rem;
    text-align:center; }
  .np-hsm {
    font-family:'Cinzel',serif; font-size:clamp(0.95rem,1.5vw,1.25rem); font-weight:800;
    line-height:1.1; color:#000; text-transform:uppercase;
    margin:0 0 .2rem; border-bottom:2px solid #111; padding-bottom:4px;
    text-align:center; }

  .np-deck {
    font-family:'Lora',serif; font-style:italic; font-size:.85rem;
    color:#444; line-height:1.35; margin-bottom:.55rem; }

  /* rule under headline */
  .np-rule-thick { border:none; border-top:4px solid #111; margin:.4rem 0 .5rem; }
  .np-rule-thin  { border:none; border-top:2px solid #555; margin:.4rem 0; }

  /* ── BODY TEXT ── */
  .np-article {
    font-family:'Lora',serif; font-size:.83rem;
    line-height:1.6; color:#1e1e1e; text-align:justify;
  }
  .np-article p { margin-bottom:.55rem; text-indent:1.1rem; }
  .np-article p:first-of-type { text-indent:0; }
  .np-article p:first-of-type::first-letter {
    font-family:'Cinzel',serif; font-size:2.6rem; float:left;
    line-height:.82; padding:4px 7px 0 2px; font-weight:900; color:#8b2020;
  }
  .np-article strong { color:#000; font-weight:700; }
  .np-article blockquote {
    border-left:3px solid #8b2020; padding-left:10px;
    margin-left:0; font-style:italic; color:#444; }
  .np-article a { color:#8b2020; text-decoration:underline; }
  .np-article ul, .np-article ol { padding-left:1.2rem; margin-bottom:.5rem; }
  .np-article li { margin-bottom:.15rem; }

  /* multi-column body */
  .np-2col { column-count:2; column-gap:1.2rem; column-rule:1px solid #d4d0c8; }
  .np-3col { column-count:3; column-gap:1.2rem; column-rule:1px solid #d4d0c8; }

  @media(max-width:860px) {
    .np-2col, .np-3col { column-count:1; }
    .np-body-wrap { padding:0 1rem 2rem; }
    .np-mast { padding:1rem 1rem 0; }
    .np-row { flex-direction:column; }
    .np-col + .np-col { border-left:none; border-top:1px solid #c4c0b5; }
  }

  /* ── PHOTO ── */
  .np-img-wrap { border:1px solid #111; background:#ede9e0; padding:5px; margin-bottom:.65rem; }
  .np-img {
    width:100%; height:auto; display:block;
    object-fit:contain;
    filter:grayscale(30%) contrast(110%) brightness(1.02);
    border:1px solid #1a1a1a;
  }
  .np-caption {
    font-family:'Outfit',sans-serif; font-size:.6rem; font-style:italic;
    color:#555; text-align:center; margin-top:3px;
  }

  /* ── PULL QUOTE ── */
  .np-pull {
    border-top:2.5px solid #8b2020; border-bottom:2.5px solid #8b2020;
    padding:.7rem 1rem; margin:.7rem 0;
    font-family:'Lora',serif; font-size:.88rem;
    font-style:italic; font-weight:600; color:#111; text-align:center;
  }
`;

/* ────────────────────── enrich helper ────────────────────── */
function enrichItems(newsItems) {
    return newsItems.map(n => ({
        ...n,
        _images: parseImages(n.images),
        _len: textLen(n.content),
    }));
}

/* ────────────────────── single article cell ────────────────────── */

function ArticleCell({ item, isHero, colFlex }) {
    const { topic, sub_topic, content, _images } = item;
    const hasImg = _images.length > 0;

    // Headline size based on position
    const hClass = isHero
        ? 'np-hxl'
        : colFlex >= 7 ? 'np-hlg'
        : colFlex >= 5 ? 'np-hmd'
        : 'np-hsm';

    // Multi-column body only for wide cells
    const bodyClass = isHero
        ? 'np-article np-3col'
        : colFlex >= 7 ? 'np-article np-2col'
        : 'np-article';

    return (
        <>
            {sub_topic && <div className="np-cat">{sub_topic}</div>}
            <h2 className={hClass}>{topic}</h2>
            <hr className="np-rule-thick" />

            {hasImg && (
                <div className="np-img-wrap">
                    <img
                        src={_images[0]}
                        alt={topic}
                        className="np-img"
                    />
                    <div className="np-caption">{topic}</div>
                </div>
            )}

            <div
                className={bodyClass}
                dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Extra image thumbnails */}
            {_images.length > 1 && (
                <div style={{ display: 'flex', gap: '3px', marginTop: '.5rem', flexWrap: 'wrap' }}>
                    {_images.slice(1).map((src, j) => (
                        <img key={j} src={src} alt={`${topic} ${j + 2}`}
                            style={{ width: '52px', height: '38px', objectFit: 'cover', filter: 'grayscale(75%)', border: '1px solid #bbb' }}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

/* ────────────────────── main export ────────────────────── */

export default function NewspaperTemplate({ news, monthYear }) {
    if (!news || news.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', fontFamily: 'Lora, serif', color: '#555' }}>
                No news items available for this month.
            </div>
        );
    }

    const items = enrichItems(news);
    const hero  = items[0];
    const rest  = items.slice(1);

    // Distribute rest into LEFT and RIGHT vertical strips (alternating)
    // Left gets items at even indices (0,2,4…), Right gets odd indices (1,3,5…)
    const leftStrip  = rest.filter((_, i) => i % 2 === 0);
    const rightStrip = rest.filter((_, i) => i % 2 === 1);

    // Column flex widths
    const LEFT_FLEX  = 7;
    const RIGHT_FLEX = 5;

    const StripArticle = ({ item, colFlex, isLast }) => (
        <div style={{
            padding: '1rem 1.1rem',
            borderBottom: isLast ? 'none' : '4px solid #111',
        }}>
            <ArticleCell item={item} isHero={false} colFlex={colFlex} />
        </div>
    );

    return (
        <div className="np-bg">
            <style>{s}</style>
            <div className="np-page">

                {/* ── MASTHEAD ── */}
                <div className="np-mast">
                    <div className="np-mast-inner">
                        {/* Left emblem */}
                        <div className="np-emblem">
                            <div className="np-emblem-lbl">Estd</div>
                            <div className="np-emblem-yr">2024</div>
                            <div className="np-emblem-tag">TPVTC</div>
                        </div>

                        {/* Centre */}
                        <div className="np-centre">
                            <div className="np-overline">VTC Official Publication</div>
                            <h1 className="np-mast-title">Tamil Pasanga</h1>
                            <div className="np-mast-sub">Monthly Magazine</div>
                        </div>

                        {/* Right barcode */}
                        <div className="np-barcode">
                            <div>Issue #1104</div>
                            <div>Free Dispatch</div>
                            <div style={{ display: 'flex', height: '20px', width: '72px', background: '#222', padding: '1px', gap: '1.5px', marginTop: '4px' }}>
                                {[2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2].map((w, i) => (
                                    <div key={i} style={{ width: `${w * 3}px`, background: i % 2 === 0 ? '#fff' : '#222' }} />
                                ))}
                            </div>
                            <div style={{ fontSize: '.45rem', letterSpacing: '1px', marginTop: '2px' }}>9024 1026</div>
                        </div>
                    </div>

                    {/* Meta bar */}
                    <div className="np-meta">
                        <span>Est. 2024 &nbsp;|&nbsp; Founder — Powerful Gaming</span>
                        <span className="acc">Monthly Magazine — {monthYear || 'May 2026'}</span>
                        <span>Top Stories &bull; Convoy Logs &bull; Community</span>
                    </div>
                </div>

                {/* Ticker */}
                <div className="np-ticker">
                    Top Stories &bull; Exclusive Convoys &bull; Community Dispatch &bull; Member Spotlight &bull; Convoy Logs
                </div>

                <div className="np-body-wrap">
                    {/* ── HERO (full width) ── */}
                    <div style={{ borderBottom: '4px solid #111', padding: '1.2rem 1.1rem' }}>
                        <ArticleCell item={hero} isHero={true} colFlex={12} />
                    </div>

                    {/* ── TWO VERTICAL STRIPS ── */}
                    {rest.length > 0 && (
                        <div style={{ display: 'flex' }}>
                            {/* LEFT strip (wider) */}
                            <div style={{ flex: LEFT_FLEX, borderRight: '3px solid #111' }}>
                                {leftStrip.map((item, i) => (
                                    <StripArticle
                                        key={item.id ?? i}
                                        item={item}
                                        colFlex={LEFT_FLEX}
                                        isLast={i === leftStrip.length - 1}
                                    />
                                ))}
                            </div>

                            {/* RIGHT strip (narrower) */}
                            <div style={{ flex: RIGHT_FLEX }}>
                                {rightStrip.map((item, i) => (
                                    <StripArticle
                                        key={item.id ?? i}
                                        item={item}
                                        colFlex={RIGHT_FLEX}
                                        isLast={i === rightStrip.length - 1}
                                    />
                                ))}
                                {/* If left has more articles than right, show a filler note */}
                                {leftStrip.length > rightStrip.length && (
                                    <div style={{
                                        borderTop: rightStrip.length > 0 ? '4px solid #111' : 'none',
                                        padding: '1rem 1.1rem',
                                        fontFamily: "'Outfit', sans-serif",
                                        fontSize: '.68rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        color: '#888',
                                        textAlign: 'center',
                                    }}>
                                        &mdash; End of Edition &mdash;
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', fontFamily: 'Outfit, sans-serif', fontSize: '.6rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#999', padding: '1rem 2rem', borderTop: '1px solid #ccc' }}>
                    Tamil Pasanga VTC &bull; {monthYear || 'May 2026'} &bull; All Rights Reserved
                </div>
            </div>
        </div>
    );
}
