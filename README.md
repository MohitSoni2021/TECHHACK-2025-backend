# EMS (Event Management System)

## Environment Variables for Email
Create a `.env` file with the following keys to enable SMTP email:

```
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username_or_from_address
SMTP_PASS=your_smtp_password
EMAIL_FROM="Your App <no-reply@yourdomain.com>"
```

Set `SMTP_SECURE=true` when using port 465.

## Email Service Usage
Email sender is at `utils/emailService.js`. Templates are in `utils/mailTemplates`.

```js
const { sendEmail } = require('./utils/emailService');
const { welcomeTemplate, passwordResetTemplate, eventReminderTemplate } = require('./utils/mailTemplates');

async function sample() {
  const { subject, html, text } = welcomeTemplate({ recipientName: 'John', appName: 'TechHack' });
  await sendEmail({ to: 'john@example.com', subject, html, text });
}
```
