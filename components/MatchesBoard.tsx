"use client";
import useSWR from 'swr';
import { useMemo, useState } from 'react';

type TeamScore = { name: string; score?: string; overs?: string };

type MatchItem = {
  id: string;
  series?: string;
  matchTitle: string;
  statusText: string;
  state: 'live' | 'upcoming' | 'complete' | 'unknown';
  venue?: string;
  startTime?: string;
  teams: TeamScore[];
  link?: string;
};

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => {
  if (!r.ok) throw new Error('Failed to fetch');
  return r.json();
});

export default function MatchesBoard() {
  const { data, error, isLoading, mutate } = useSWR<{ matches: MatchItem[]; refreshedAt: string }>(
    '/api/scores',
    fetcher,
    { refreshInterval: 30_000, revalidateOnFocus: true }
  );

  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!data?.matches) return [] as MatchItem[];
    const term = q.trim().toLowerCase();
    if (!term) return data.matches;
    return data.matches.filter(m => (
      (m.matchTitle + ' ' + (m.series || '') + ' ' + (m.venue || '') + ' ' + m.teams.map(t => t.name).join(' ')).toLowerCase().includes(term)
    ));
  }, [data, q]);

  return (
    <div>
      <div className="searchBar">
        <input
          placeholder="Search by team, series, venue..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <button onClick={() => mutate()}>Refresh</button>
      </div>

      {isLoading && (
        <div className="row" style={{ gap: '.75rem' }}>
          <div className="spinner" /> <span>Loading live matches?</span>
        </div>
      )}

      {error && (
        <div className="error">Failed to load scores. Please try again.</div>
      )}

      <div className="meta subtle" style={{ marginBottom: '.5rem' }}>
        <span className="badge">Auto-refresh 30s</span>
        {data?.refreshedAt && <span>Updated {new Date(data.refreshedAt).toLocaleTimeString()}</span>}
      </div>

      <div className="grid">
        {filtered.map((m) => (
          <article className="card" key={m.id}>
            <div className="row">
              <div className="status">
                {m.state === 'live' && <span className="badge" style={{ borderColor: '#f97316', background: '#fff7ed' }}>Live</span>}
                {m.state === 'upcoming' && <span className="badge">Upcoming</span>}
                {m.state === 'complete' && <span className="badge">Result</span>}
              </div>
              {m.series && <div className="subtle">{m.series}</div>}
            </div>
            <h3 style={{ margin: '.5rem 0' }}>{m.matchTitle}</h3>

            <div>
              {m.teams.map((t, idx) => (
                <div className="team" key={idx}>
                  <strong>{t.name}</strong>
                  <span>{t.score || '-'}</span>
                  <span className="subtle">{t.overs ? `(${t.overs} ov)` : ''}</span>
                </div>
              ))}
            </div>

            <div className="meta">
              {m.statusText && <span className="subtle">{m.statusText}</span>}
              {m.venue && <span className="badge">{m.venue}</span>}
              {m.startTime && <span className="badge">{new Date(m.startTime).toLocaleString()}</span>}
            </div>

            {m.link && (
              <div style={{ marginTop: '.5rem' }}>
                <a href={m.link} target="_blank" rel="noreferrer">Details ?</a>
              </div>
            )}
          </article>
        ))}
      </div>

      {!isLoading && !error && filtered.length === 0 && (
        <div className="subtle">No matches found.</div>
      )}
    </div>
  );
}
