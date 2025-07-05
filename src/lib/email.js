const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

dotenv.config()

const app = express()
const port = process.env.API_PORT || 4000

app.use(bodyParser.json())

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

app.use((req, res, next) => {
  res.set(corsHeaders)
  if (req.method === 'OPTIONS') {
    return res.send('ok')
  }
  next()
})


app.post('/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body


    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const TO_EMAIL = process.env.TO_EMAIL

    const emailContent = {
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [TO_EMAIL],
      reply_to: email,
      subject: `Portfolio Contact: ${subject}`,
      html: `<div style="...">${message.replace(/\n/g, '<br>')}</div>`,
      text: `New message from ${name}:\n\n${message}`,
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Resend API error:', errorData)
      return res.status(500).json({ error: 'Failed to send email' })
    }

    const result = await emailResponse.json()

    const confirmationEmail = {
      from: 'Alban MARY <noreply@albanmary.com>',
      to: [email],
      subject: 'Thank you for contacting me!',
      html: `<div style="...">Thank you for your message, ${name}.</div>`,
      text: `Hi ${name},\n\nThank you for contacting me.\n\n- Alban`,
    }

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmationEmail),
      })
    } catch (e) {
      console.warn('Failed to send confirmation email:', e)
    }

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      id: result.id,
    })
  } catch (error) {
    console.error('Error in send-email handler:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

