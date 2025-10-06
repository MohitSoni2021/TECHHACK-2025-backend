const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Creates and caches a transporter using ENV configuration
let cachedTransporter = null;
function getTransporter() {
	if (cachedTransporter) return cachedTransporter;

	const host = process.env.SMTP_HOST;
	const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
	const secure = process.env.SMTP_SECURE === 'true';
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!host || !user || !pass) {
		throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_PORT, SMTP_SECURE).');
	}

	cachedTransporter = nodemailer.createTransport({
		host,
		port,
		secure,
		auth: { user, pass },
	});

	return cachedTransporter;
}

/**
 * Send an email to a single recipient.
 * @param {Object} options
 * @param {string} options.to - Target recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.html] - HTML body
 * @param {string} [options.text] - Plain text body (recommended as fallback)
 * @param {string} [options.from] - Custom from; defaults to EMAIL_FROM or SMTP_USER
 * @returns {Promise<import('nodemailer').SentMessageInfo>}
 */
async function sendEmail({ to, subject, html, text, from }) {
	if (!to) throw new Error('Missing required parameter: to');
	if (!subject) throw new Error('Missing required parameter: subject');
	if (!html && !text) throw new Error('Provide at least one of html or text');

	const transporter = getTransporter();
	const defaultFrom = process.env.EMAIL_FROM || process.env.SMTP_USER;
	const mailFrom = from || defaultFrom;

	return transporter.sendMail({
		from: mailFrom,
		to,
		subject,
		text,
		html,
	});
}

module.exports = {
	sendEmail,
};


