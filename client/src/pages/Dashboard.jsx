// Dashboard page — Phase 2 shell. KPI cards are placeholders; real data comes in Phases 12–14.
// Each card renders with a placeholder value "—" until its data source is wired up.

const KPI_CARDS = [
  { label: 'New Leads (7d)', subtitle: 'Leads created this week', source: 'Phase 14' },
  { label: 'Pipeline Value', subtitle: 'Sum of open deals', source: 'Phase 14' },
  { label: 'Conversion Rate', subtitle: 'Leads → Clients', source: 'Phase 14' },
  { label: 'Revenue (MTD)', subtitle: 'Stripe, this month', source: 'Phase 14' },
  { label: 'Ad Spend (MTD)', subtitle: 'Meta Ads, this month', source: 'Phase 12' },
  { label: 'ROAS', subtitle: 'Revenue / Ad Spend', source: 'Phase 14' },
  { label: 'Email Open Rate', subtitle: 'MailerLite, 30d avg', source: 'Phase 13' },
  { label: 'Email Click Rate', subtitle: 'MailerLite, 30d avg', source: 'Phase 13' },
  { label: 'Follow-ups Due Today', subtitle: 'Leads needing contact', source: 'Phase 14' },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">
          Real-time KPIs from your CRM, ads, and email campaigns.
        </p>
      </div>

      <section className="kpi-grid">
        {KPI_CARDS.map((card) => (
          <article className="kpi-card" key={card.label}>
            <div className="kpi-label">{card.label}</div>
            <div className="kpi-value">—</div>
            <div className="kpi-subtitle">{card.subtitle}</div>
            <div className="kpi-source">Wires up in {card.source}</div>
          </article>
        ))}
      </section>

      <section className="dashboard-note">
        <p>
          This is your dashboard shell. Cards show <code>—</code> until the
          data sources they depend on are integrated. Come back after each
          integration phase and the corresponding card will populate with
          live data.
        </p>
      </section>
    </div>
  );
}
