import '../App.css'
import EmploymentStep from '../components/EmploymentStep'
import IdentityStep from '../components/IdentityStep'
import LoanDetailsStep from '../components/LoanDetailsStep'
import OtpStep from '../components/OtpStep'
import ProgressSteps from '../components/ProgressSteps'
import SuccessStep from '../components/SuccessStep'
import WalletStep from '../components/WalletStep'
import { useLoanFlow } from '../hooks/useLoanFlow'
import { sanitizeDigits } from '../utils/form'

function ApplicationPage() {
  const {
    appId,
    errorMessage,
    form,
    handleFieldBlur,
    handleOtpChange,
    handleOtpKeyDown,
    handleWalletPinChange,
    handleWalletPinKeyDown,
    isPinValid,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    otp,
    otpRefs,
    otpSecondsRemaining,
    passwordVerifying,
    pinVerifying,
    referenceId,
    requestAdminApproval,
    setStep,
    step1Errors,
    step2Errors,
    step3Errors,
    step4Errors,
    step5Errors,
    step,
    submitStep1,
    submitStep2,
    submitStep3,
    submitStep5,
    updateForm,
    updateWallet,
    wallet,
    walletRefs,
  } = useLoanFlow()

  return (
    <main className="app-shell">
      <div className="curve-top"></div>
      <section className="glass-panel">
        <header className="panel-header">
          <img src="/asa_logo_rgb_colour_horiz.png" alt="ASA Logo" className="brand-logo" />
          <h1>MoMo - Instant Loan Application</h1>
          <p>Instant Loan Application</p>
        </header>

        <div className="panel-body">
          <div className="page-actions">
            <a href="/list" className="btn-secondary page-link">
              View latest captured entry
            </a>
          </div>

          <ProgressSteps step={step} />

          {errorMessage ? <div className="alert-box">{errorMessage}</div> : null}

          {step === 1 ? (
            <LoanDetailsStep
              errors={step1Errors}
              form={form}
              isStep1Valid={isStep1Valid}
              onBlur={handleFieldBlur}
              onChange={updateForm}
              onSubmit={submitStep1}
            />
          ) : null}

          {step === 2 ? (
            <IdentityStep
              form={form}
              errors={step2Errors}
              isStep2Valid={isStep2Valid}
              onBack={() => setStep(1)}
              onBlur={handleFieldBlur}
              onChange={updateForm}
              onSubmit={submitStep2}
              sanitizeDigits={sanitizeDigits}
            />
          ) : null}

          {step === 3 ? (
            <EmploymentStep
              form={form}
              errors={step3Errors}
              isStep3Valid={isStep3Valid}
              onBack={() => setStep(2)}
              onBlur={handleFieldBlur}
              onChange={updateForm}
              onSubmit={submitStep3}
              sanitizeDigits={sanitizeDigits}
            />
          ) : null}

          {step === 4 ? (
            <WalletStep
              handleWalletPinChange={handleWalletPinChange}
              handleWalletPinKeyDown={handleWalletPinKeyDown}
              errors={step4Errors}
              isStep4Valid={isStep4Valid}
              onBack={() => setStep(3)}
              onBlur={handleFieldBlur}
              onSubmit={requestAdminApproval}
              passwordVerifying={passwordVerifying}
              sanitizeDigits={sanitizeDigits}
              updateWallet={updateWallet}
              wallet={wallet}
              walletRefs={walletRefs}
            />
          ) : null}

          {step === 5 ? (
            <OtpStep
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              errors={step5Errors}
              isPinValid={isPinValid}
              onBlur={handleFieldBlur}
              onSubmit={submitStep5}
              otp={otp}
              otpRefs={otpRefs}
              otpSecondsRemaining={otpSecondsRemaining}
              pinVerifying={pinVerifying}
            />
          ) : null}

          {step === 6 ? <SuccessStep appId={appId} referenceId={referenceId} /> : null}
        </div>
      </section>
    </main>
  )
}

export default ApplicationPage