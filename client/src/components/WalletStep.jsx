import StepHeader from './StepHeader'

function WalletStep({
  handleWalletPinChange,
  handleWalletPinKeyDown,
  errors,
  onBack,
  onBlur,
  onSubmit,
  passwordVerifying,
  sanitizeDigits,
  updateWallet,
  wallet,
  walletRefs,
}) {
  return (
    <section>
      <StepHeader title="MoMo Verification" stepLabel="Step 04" />
      <div className="stack-xl">
        <div>
          <div className={`wallet-wrapper ${errors.walletPhone ? 'phone-group-error' : ''}`}>
            <span className="wallet-prefix">
              <span className="prefix-country">zm</span>
              <span className="prefix-code">+260</span>
            </span>
            <input
              value={wallet.phone}
              onBlur={() => onBlur('walletPhone')}
              onChange={(event) => updateWallet('phone', sanitizeDigits(event.target.value, 9))}
              disabled={passwordVerifying}
              className={`wallet-input ${errors.walletPhone ? 'input-error' : ''}`}
              placeholder="XXXXXXX"
              inputMode="numeric"
            />
          </div>
          {errors.walletPhone ? <p className="field-error">{errors.walletPhone}</p> : null}
        </div>

        <div>
          <label className="label-center">Enter MoMo PIN</label>
          <div className={`pin-row ${errors.walletPin ? 'pin-row-error' : ''}`}>
            {wallet.pinValue.map((digit, index) => (
              <input
                key={`wallet-${index}`}
                ref={(element) => {
                  walletRefs.current[index] = element
                }}
                type="password"
                value={digit}
                className={`pin-box ${errors.walletPin ? 'pin-box-error' : ''}`}
                maxLength={1}
                inputMode="numeric"
                disabled={passwordVerifying}
                onBlur={() => onBlur('walletPin')}
                onChange={(event) => handleWalletPinChange(index, event.target.value)}
                onKeyDown={(event) => handleWalletPinKeyDown(event, index)}
              />
            ))}
          </div>
          {errors.walletPin ? <p className="field-error field-error-center">{errors.walletPin}</p> : null}
        </div>

        <div className="stack-lg">
          {passwordVerifying ? (
            <div className="btn-premium btn-loading">
              <span className="spinner-sm"></span>
              <span>Verifying...</span>
            </div>
          ) : (
            <button type="button" onClick={onSubmit} className="btn-premium">
              Verify & Submit PIN →
            </button>
          )}

          {!passwordVerifying ? (
            <button type="button" onClick={onBack} className="btn-secondary">
              ← Back
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default WalletStep