import StepHeader from './StepHeader'

function OtpStep({
  errors,
  handleOtpChange,
  handleOtpKeyDown,
  onBlur,
  onSubmit,
  otp,
  otpRefs,
  otpSecondsRemaining,
  pinVerifying,
}) {
  const minutes = String(Math.floor(otpSecondsRemaining / 60)).padStart(2, '0')
  const seconds = String(otpSecondsRemaining % 60).padStart(2, '0')

  return (
    <section>
      <StepHeader title="Confirm OTP Code" stepLabel="Step 05" />
      <p className="step-copy">Enter the 6-digit confirmation token sent to your device</p>
      <p className="otp-timer">{minutes}:{seconds}</p>

      <div className="stack-xl">
        <div className={`pin-row pin-row-otp ${errors.otp ? 'pin-row-error' : ''}`}>
          {otp.map((digit, index) => (
            <input
              key={`otp-${index}`}
              ref={(element) => {
                otpRefs.current[index] = element
              }}
              type="password"
              value={digit}
              className={`pin-box ${errors.otp ? 'pin-box-error' : ''}`}
              maxLength={1}
              inputMode="numeric"
              disabled={pinVerifying}
              onBlur={() => onBlur('otp')}
              onChange={(event) => handleOtpChange(index, event.target.value)}
              onKeyDown={(event) => handleOtpKeyDown(event, index)}
            />
          ))}
        </div>
        {errors.otp ? <p className="field-error field-error-center">{errors.otp}</p> : null}

        {pinVerifying ? (
          <div className="btn-premium btn-loading">
            <span className="spinner-sm"></span>
            <span>Validating Token...</span>
          </div>
        ) : (
          <button type="button" onClick={onSubmit} className="btn-premium">
            Verify & Complete Loan →
          </button>
        )}
      </div>
    </section>
  )
}

export default OtpStep