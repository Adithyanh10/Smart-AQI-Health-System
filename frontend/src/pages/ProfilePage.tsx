import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import type { AgeGroup, HealthCondition, UserProfile } from '../types'

const HEALTH_CONDITIONS: HealthCondition[] = ['Asthma', 'COPD', 'Heart Disease', 'Diabetes', 'Pregnancy']
const AGE_GROUPS: AgeGroup[] = ['Child', 'Adult', 'Senior']

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  city: '',
  health_conditions: [],
  notification_threshold: 100,
  favorites: [],
}

export function ProfilePage() {
  const { profile, setProfile, history, clearHistory } = useProfile()
  const navigate = useNavigate()

  const [form, setForm] = useState<UserProfile>(profile ?? DEFAULT_PROFILE)
  const [saved, setSaved] = useState(false)

  const handleConditionToggle = (cond: HealthCondition) => {
    setForm(prev => ({
      ...prev,
      health_conditions: prev.health_conditions.includes(cond)
        ? prev.health_conditions.filter(c => c !== cond)
        : [...prev.health_conditions, cond],
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    setForm(DEFAULT_PROFILE)
    setProfile(null)
  }

  const recentHistory = history.slice(0, 10)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #f1f5f9)' }}>
        Profile
      </h1>

      <form onSubmit={handleSave}>
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
            Personal Info
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label htmlFor="profile-name" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: 6 }}>
                Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                className="glass-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="profile-city" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: 6 }}>
                City
              </label>
              <input
                id="profile-city"
                type="text"
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                placeholder="Your city"
                className="glass-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Age group */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
              Age Group
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {AGE_GROUPS.map(ag => (
                <label key={ag} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary, #f1f5f9)' }}>
                  <input
                    type="radio"
                    name="age-group"
                    value={ag}
                    checked={(form as any).age_group === ag}
                    onChange={() => setForm(p => ({ ...p, age_group: ag } as any))}
                  />
                  {ag}
                </label>
              ))}
            </div>
          </div>

          {/* Health conditions */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
              Health Conditions
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {HEALTH_CONDITIONS.map(cond => (
                <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary, #f1f5f9)' }}>
                  <input
                    type="checkbox"
                    checked={form.health_conditions.includes(cond)}
                    onChange={() => handleConditionToggle(cond)}
                  />
                  {cond}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Notification threshold */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
            Notification Threshold
          </h2>
          <label htmlFor="threshold-slider" style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)' }}>
            Alert me when AQI exceeds: <strong style={{ color: 'var(--text-primary, #f1f5f9)' }}>{form.notification_threshold}</strong>
          </label>
          <input
            id="threshold-slider"
            type="range"
            min={50}
            max={300}
            step={5}
            value={form.notification_threshold}
            onChange={e => setForm(p => ({ ...p, notification_threshold: Number(e.target.value) }))}
            style={{ width: '100%', marginTop: 10, accentColor: '#6366f1' }}
            aria-label={`Notification threshold: ${form.notification_threshold}`}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary, #94a3b8)', marginTop: 4 }}>
            <span>50</span>
            <span>300</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            {saved ? '✓ Saved' : 'Save Profile'}
          </button>
          <button type="button" onClick={handleClear} className="btn-secondary">
            Clear
          </button>
        </div>
      </form>

      {/* Prediction history */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
            Prediction History
          </h2>
          {history.length > 0 && (
            <button type="button" onClick={clearHistory} className="btn-secondary" style={{ fontSize: 12, padding: '4px 12px' }}>
              Clear History
            </button>
          )}
        </div>

        {recentHistory.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-secondary, #94a3b8)', textAlign: 'center', padding: '16px 0' }}>
            No predictions yet. Run a prediction from the dashboard.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentHistory.map(entry => (
              <div key={entry.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.07)',
                flexWrap: 'wrap',
                gap: 8,
              }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary, #f1f5f9)' }}>
                    AQI {entry.aqi.toFixed(1)}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>
                    {entry.aqi_category}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-secondary, #94a3b8)' }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem('aqi_session')
            navigate('/login', { replace: true })
          }}
          style={{
            padding: '10px 32px',
            borderRadius: 8,
            border: '1px solid rgba(239,68,68,0.4)',
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  )
}
