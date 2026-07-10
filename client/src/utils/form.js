export function sanitizeDigits(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

export function sanitizeSingleDigit(value) {
  return value.replace(/\D/g, '').slice(-1)
}

export function isZambiaMobile(value) {
  return /^[0-9]{9}$/.test(value)
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function validateLoanStep(form) {
  const errors = {}

  if (!form.loanType) {
    errors.loanType = 'Select a loan type.'
  }

  if (!Number.isFinite(form.amount) || form.amount < 5000 || form.amount > 45000) {
    errors.amount = 'Choose an amount between ZMW 5,000 and ZMW 45,000.'
  }

  if (!form.term) {
    errors.term = 'Select a loan term.'
  }

  if (!form.purpose.trim()) {
    errors.purpose = 'Enter the purpose of the loan.'
  } else if (form.purpose.trim().length < 5) {
    errors.purpose = 'Purpose must be at least 5 characters.'
  }

  return errors
}

export function validateIdentityStep(form) {
  const errors = {}

  if (!form.firstName.trim()) {
    errors.firstName = 'Enter a first name.'
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.'
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Enter a last name.'
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters.'
  }

  if (!form.email.trim()) {
    errors.email = 'Enter an email address.'
  } else if (!isValidEmail(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!isZambiaMobile(form.phone)) {
    errors.phone = 'Enter a valid 9-digit phone number.'
  }

  return errors
}

export function validateEmploymentStep(form) {
  const errors = {}

  if (!form.employment) {
    errors.employment = 'Select an employment status.'
  }

  const income = Number(form.income)
  if (!form.income || Number.isNaN(income) || income <= 0) {
    errors.income = 'Enter a valid annual income.'
  }

  if (form.employer.trim() && form.employer.trim().length < 2) {
    errors.employer = 'Employer name must be at least 2 characters.'
  }

  return errors
}

export function validateWalletStep(wallet) {
  const errors = {}

  if (!isZambiaMobile(wallet.phone)) {
    errors.walletPhone = 'Enter a valid 9-digit wallet number.'
  }

  if (!/^\d{5}$/.test(wallet.pinValue.join(''))) {
    errors.walletPin = 'Enter a valid 5-digit MoMo PIN.'
  }

  return errors
}

export function validateOtpStep(otp, otpSecondsRemaining) {
  const errors = {}

  if (otpSecondsRemaining <= 0) {
    errors.otp = 'The code timer has run out. Restart verification.'
  } else if (otp.join('').length !== 6) {
    errors.otp = 'Enter the full 6-digit OTP code.'
  }

  return errors
}