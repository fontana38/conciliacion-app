import './SummaryCard.css'

export default function SummaryCard({ label, value, tone = 'ink', sublabel }) {
  return (
    <div className={`summary-card summary-card--${tone}`}>
      <p className="summary-card__label">{label}</p>
      <p className="summary-card__value num">{value}</p>
      {sublabel && <p className="summary-card__sublabel">{sublabel}</p>}
    </div>
  )
}
