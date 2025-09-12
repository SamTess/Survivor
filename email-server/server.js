const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html, ...otherParams } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        error: 'Missing required fields: to and subject are required'
      });
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      text: text || '',
      html: html || ''
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      params: otherParams
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'email-server' });
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
});
