import './Tabs.css'

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tabs__tab ${activeTab === tab.key ? 'tabs__tab--active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {typeof tab.count === 'number' && <span className="tabs__count num">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}
