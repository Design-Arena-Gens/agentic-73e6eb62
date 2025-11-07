import MatchesBoard from '@/components/MatchesBoard';

export default function Page() {
  return (
    <>
      <div className="header">
        <div className="container">
          <div className="row">
            <div className="h1">Cricket Scores Board</div>
            <a className="refresh" href="/">Refresh</a>
          </div>
        </div>
      </div>
      <div className="container">
        <MatchesBoard />
      </div>
      <footer>
        Data sourced from public cricket websites. Unofficial, for personal use.
      </footer>
    </>
  );
}
