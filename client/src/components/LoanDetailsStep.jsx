import StepHeader from './StepHeader'

function LoanDetailsStep({ errors, form, onBlur, onChange, onSubmit }) {
  return (
    <section>
      <StepHeader title="Loan Details" stepLabel="Step 01" />
      <div className="stack-lg">
        <div>
          <select value={form.loanType} onBlur={() => onBlur('loanType')} onChange={(event) => onChange('loanType', event.target.value)} className={`input-premium ${errors.loanType ? 'input-error' : ''}`}>
            <option value="">Select Loan Type</option>
            <option value="Personal">Personal Loan</option>
            <option value="Business">Business Loan</option>
          </select>
          {errors.loanType ? <p className="field-error">{errors.loanType}</p> : null}
        </div>

        <div>
          <div className="amount-row">
            <label className="label-premium">Amount (ZMW)</label>
            <span>ZMW {form.amount}</span>
          </div>
          <input
            type="range"
            min="5000"
            max="45000"
            step="500"
            value={form.amount}
            onBlur={() => onBlur('amount')}
            onChange={(event) => onChange('amount', Number(event.target.value))}
            className="slider"
          />
          {errors.amount ? <p className="field-error">{errors.amount}</p> : null}
        </div>

        <div>
          <select value={form.term} onBlur={() => onBlur('term')} onChange={(event) => onChange('term', event.target.value)} className={`input-premium ${errors.term ? 'input-error' : ''}`}>
            <option value="">Select Loan Term</option>
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
          </select>
          {errors.term ? <p className="field-error">{errors.term}</p> : null}
        </div>

        <div>
          <textarea
            value={form.purpose}
            onBlur={() => onBlur('purpose')}
            onChange={(event) => onChange('purpose', event.target.value)}
            className={`input-premium textarea-premium ${errors.purpose ? 'input-error' : ''}`}
            placeholder="Purpose of loan"
          />
          {errors.purpose ? <p className="field-error">{errors.purpose}</p> : null}
        </div>

        <button type="button" onClick={onSubmit} className="btn-premium">
          Continue →
        </button>
      </div>
    </section>
  )
}

export default LoanDetailsStep