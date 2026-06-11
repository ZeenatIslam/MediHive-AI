import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconUsers,
  IconUrgent,
  IconStethoscope,
  IconCalendar,
  IconFileText,
  IconBed,
  IconChartBar,
  IconSettings,
  IconRobot,
  IconActivityHeartbeat,
} from '@tabler/icons-react'

const NAV = [
  {
    section: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: IconLayoutDashboard },
    ],
  },
  {
    section: 'Clinical',
    items: [
      { title: 'Patients', url: '/patients', icon: IconUsers },
      { title: 'Emergency', url: '/emergency', icon: IconUrgent, badge: true },
      { title: 'Doctors', url: '/doctors', icon: IconStethoscope },
      { title: 'Appointments', url: '/appointments', icon: IconCalendar },
    ],
  },
  {
    section: 'Management',
    items: [
      { title: 'Reports', url: '/reports', icon: IconFileText },
      { title: 'Bed Management', url: '/bedmanagement', icon: IconBed },
      { title: 'Analytics', url: '/analytics', icon: IconChartBar },
    ],
  },
  {
    section: 'System',
    items: [
      { title: 'Settings', url: '/settings', icon: IconSettings },
      { title: 'AI Assistant', url: '/assistant', icon: IconRobot },
    ],
  },
]

const AppSidebar = () => {
  const { pathname } = useLocation()

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-mark">
          <div className="logo-icon">
            <IconActivityHeartbeat size={18} />
          </div>
          <div>
            <div className="logo-text">MediHive AI</div>
            <div className="logo-sub">Hospital System</div>
          </div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map(({ section, items }) => (
          <React.Fragment key={section}>
            <div className="nav-section">{section}</div>
            {items.map(({ title, url, icon: Icon, badge }) => {
              const active = pathname === url || (url !== '/' && pathname.startsWith(url))
              return (
                <Link
                  key={url}
                  to={url}
                  className={`nav-item${active ? ' active' : ''}`}
                >
                  <Icon size={16} />
                  {title}
                  {badge && <span className="nav-badge">3</span>}
                </Link>
              )
            })}
          </React.Fragment>
        ))}
      </nav>

      <div className="nav-bottom">
        <div className="doctor-row" style={{ padding: 0 }}>
          <div className="doc-avatar" style={{ background: '#e8f1fc', color: '#1a6fd4' }}>AD</div>
          <div className="doc-info">
            <div className="doc-name">Admin</div>
            <div className="doc-dept">Administrator</div>
          </div>
          <div className="status-dot on" />
        </div>
      </div>
    </aside>
  )
}

export default AppSidebar
