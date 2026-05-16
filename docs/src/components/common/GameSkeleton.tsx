const COLUMNS = ['Picture', 'Name', 'Gives', 'Element', 'Category', 'Locations', 'Humanoid'];
const SKELETON_ROWS = 1;

export default function GameSkeleton() {
  return (
    <>
      <div className="game-border-wrapper border">
        <div className="mode-indicator">
          <span className="skeleton-pulse" style={{ width: 64, height: 18, borderRadius: 10, display: 'inline-block' }} />
        </div>
        <div className="rowsContainer">
          <div className="headerContainer">
            <div className="columns">
              {COLUMNS.map(col => (
                <div key={col} className="column">
                  <div className="column-title skeleton-pulse" style={{ height: 14, borderRadius: 3 }} />
                </div>
              ))}
            </div>
          </div>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div key={i} className="rowGuessed">
              {COLUMNS.map((_, j) => (
                <div key={j} className="item skeleton-pulse" style={{ borderRadius: 2 }} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="center">
        <div className="skeleton-pulse skeleton-input" />
      </div>

      <div className="center">
        <div className="skeleton-pulse skeleton-btn" />
      </div>
    </>
  );
}
