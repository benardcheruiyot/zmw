function SuccessStep({ appId, referenceId }) {
  return (
    <section className="success-state">
      <div className="success-mark">✓</div>
      <h2>Application Submitted!</h2>
      <p>
        Reference ID: <span>{referenceId}</span>
      </p>
      <small>Session {appId || 'connected'}</small>
    </section>
  )
}

export default SuccessStep