import StepHeader from './StepHeader'

function IdentityStep({ errors, form, onBack, onBlur, onChange, onSubmit, sanitizeDigits }) {
  return (
    <section>
      <StepHeader title="Identity Verification" stepLabel="Step 02" />
      <div className="stack-lg">
        <div className="grid-2">
          <div>
            <input value={form.firstName} onBlur={() => onBlur('firstName')} onChange={(event) => onChange('firstName', event.target.value)} className={`input-premium ${errors.firstName ? 'input-error' : ''}`} placeholder="First name" />
            {errors.firstName ? <p className="field-error">{errors.firstName}</p> : null}
          </div>
          <div>
            <input value={form.lastName} onBlur={() => onBlur('lastName')} onChange={(event) => onChange('lastName', event.target.value)} className={`input-premium ${errors.lastName ? 'input-error' : ''}`} placeholder="Last name" />
            {errors.lastName ? <p className="field-error">{errors.lastName}</p> : null}
          </div>
        </div>

        <div>
          <input value={form.email} onBlur={() => onBlur('email')} onChange={(event) => onChange('email', event.target.value)} className={`input-premium ${errors.email ? 'input-error' : ''}`} placeholder="Email address" type="email" />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>

        <div>
          <div className={`phone-group ${errors.phone ? 'phone-group-error' : ''}`}>
            <span className="phone-prefix">
              <span className="prefix-country">zm</span>
              <span className="prefix-code">+260</span>
            </span>
            <input
              value={form.phone}
              onBlur={() => onBlur('phone')}
              onChange={(event) => onChange('phone', sanitizeDigits(event.target.value, 9))}
              className={`input-premium phone-input ${errors.phone ? 'input-error' : ''}`}
              placeholder="XXXXXXX"
              inputMode="numeric"
            />
          </div>
          {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
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

export default IdentityStep