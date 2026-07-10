function StepHeader({ title, stepLabel }) {
  return (
    <div className="step-header">
      <h2>{title}</h2>
      <span>{stepLabel}</span>
    </div>
  )
}

export default StepHeader