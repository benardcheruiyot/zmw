import { loanSteps } from '../data/loanFlow'

function ProgressSteps({ step }) {
  return (
    <div className="progress-row" aria-label="Application steps">
      {loanSteps.map((item) => (
        <div
          key={item}
          className={`progress-step ${step === item ? 'active' : ''} ${step > item ? 'completed' : ''}`}
        >
          <div className="progress-dot">{step > item ? '✓' : item}</div>
        </div>
      ))}
    </div>
  )
}

export default ProgressSteps