const BUREAUS = ['D&B', 'Equifax', 'Experian'];
const TARGET_PER_BUREAU = 3;

export default function VendorDistribution({ vendors }) {
  const byBureau = {};
  BUREAUS.forEach(b => { byBureau[b] = { total: 0, completed: 0 }; });
  vendors.forEach(v => {
    if (byBureau[v.bureau]) {
      byBureau[v.bureau].total++;
      if (v.completed) byBureau[v.bureau].completed++;
    }
  });

  return (
    <div className="cb-vendor-dist">
      <h3 className="cb-vendor-title">Trade Vendor Distribution</h3>
      {BUREAUS.map(bureau => {
        const data = byBureau[bureau];
        const pct = data.total > 0 ? Math.round((data.completed / TARGET_PER_BUREAU) * 100) : 0;
        return (
          <div key={bureau} className="cb-vendor-row">
            <div className="cb-vendor-row-header">
              <span className="cb-vendor-name">{bureau}</span>
              <span className="cb-vendor-pct">{pct}%</span>
            </div>
            <div className="cb-vendor-bar-bg">
              <div className="cb-vendor-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="cb-vendor-meta">
              <span>Completed</span>
              <span>{data.completed} of {TARGET_PER_BUREAU}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
