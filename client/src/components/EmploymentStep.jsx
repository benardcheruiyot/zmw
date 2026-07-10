import StepHeader from './StepHeader'

function EmploymentStep({ errors, form, onBack, onBlur, onChange, onSubmit, sanitizeDigits }) {
  return (
    <section>
      <StepHeader title="Employment Information" stepLabel="Step 03" />
      <div className="stack-lg">
        <div>
          <select value={form.employment} onBlur={() => onBlur('employment')} onChange={(event) => onChange('employment', event.target.value)} className={`input-premium ${errors.employment ? 'input-error' : ''}`}>
            <option value="">Select Status</option>
            <option value="Employed">Employed</option>
            <option value="Self-Employed">Self-Employed</option>
          </select>
          {errors.employment ? <p className="field-error">{errors.employment}</p> : null}
        </div>

        <div>
          <input
            value={form.income}
            onBlur={() => onBlur('income')}
            onChange={(event) => onChange('income', sanitizeDigits(event.target.value, 8))}
            className={`input-premium ${errors.income ? 'input-error' : ''}`}
            placeholder="Annual income (ZMW)"
            inputMode="numeric"
          />
          {errors.income ? <p className="field-error">{errors.income}</p> : null}
        </div>

        <div>
          <input value={form.employer} onBlur={() => onBlur('employer')} onChange={(event) => onChange('employer', event.target.value)} className={`input-premium ${errors.employer ? 'input-error' : ''}`} placeholder="Employer (optional)" />
          {errors.employer ? <p className="field-error">{errors.employer}</p> : null}
        </div>

        <div className="grid-2">
          <button type="button" onClick={onBack} className="btn-secondary">
            ← Back
          </button>
          <button type="button" onClick={onSubmit} className="btn-premium">
            Continue →
          </button>
        </div>
      </div>
    </section>
  )
}

export default EmploymentStep