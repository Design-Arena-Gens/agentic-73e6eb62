import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 0;

function parseState(status: string): 'live' | 'upcoming' | 'complete' | 'unknown' {
  const s = status.toLowerCase();
  if (s.includes('live') || s.includes('day') || s.includes('stumps') || s.includes('trail') || s.includes('lead') || s.includes('target')) return 'live';
  if (s.includes('start') || s.includes('to begin') || s.includes('scheduled') || s.includes('toss')) return 'upcoming';
  if (s.includes('won') || s.includes('match tied') || s.includes('abandoned') || s.includes('no result') || s.includes('draw')) return 'complete';
  return 'unknown';
}

export async function GET() {
  try {
    const resp = await fetch('https://www.cricbuzz.com/cricket-match/live-scores', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36',
        'accept-language': 'en-US,en;q=0.9',
      },
      // Important: server-side only
      cache: 'no-store',
    });

    if (!resp.ok) {
      return NextResponse.json({ matches: [], refreshedAt: new Date().toISOString(), error: 'upstream' }, { status: 200 });
    }

    const html = await resp.text();
    const $ = cheerio.load(html);

    const matches: any[] = [];

    $('.cb-col.cb-col-100.cb-lv-main').each((_, el) => {
      const block = $(el);
      const series = block.find('.cb-lv-grn-strip.text-bold').first().text().trim() || undefined;

      block.find('.cb-mtch-lst.cb-tms-itm').each((__, matchEl) => {
        const me = $(matchEl);
        const linkEl = me.find('a.cb-lv-scrs-cntr').first();
        const link = linkEl.attr('href') ? `https://www.cricbuzz.com${linkEl.attr('href')}` : undefined;

        const title = me.find('.cb-lv-scrs-col').first().text().trim();
        // Team rows
        const teamRows = me.find('.cb-hmscg-bat-txt, .cb-hmscg-bwl-txt');
        const teams: { name: string; score?: string; overs?: string }[] = [];
        teamRows.each((i, tr) => {
          const row = $(tr);
          const name = row.find('.text-bold').text().trim() || row.clone().children().remove().end().text().trim();
          const scoreText = row.find('.cb-hmscg-bat-txt + div').text().trim() || row.next().text().trim();
          const score = scoreText ? scoreText.replace(/\s+/g, ' ') : undefined;
          let overs: string | undefined = undefined;
          const oversMatch = score?.match(/\(([^)]+)\)/);
          if (oversMatch) overs = oversMatch[1];
          teams.push({ name, score, overs });
        });

        const statusText = me.find('.cb-text-live, .cb-text-complete, .cb-text-preview').first().text().trim() || me.find('.cb-lv-scrs-col').last().text().trim();
        const venue = me.find('.cb-dfp-icn + span').text().trim() || undefined;
        const id = link || title || Math.random().toString(36).slice(2);

        matches.push({
          id,
          series,
          matchTitle: title || 'Cricket Match',
          statusText,
          state: parseState(statusText),
          venue,
          teams,
          link,
        });
      });
    });

    // Fallback: If no matches parsed, provide message rather than error
    const payload = { matches, refreshedAt: new Date().toISOString() };
    return NextResponse.json(payload, { status: 200 });
  } catch (e) {
    return NextResponse.json({ matches: [], refreshedAt: new Date().toISOString(), error: 'exception' }, { status: 200 });
  }
}
