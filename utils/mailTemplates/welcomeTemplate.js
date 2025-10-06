/**
 * Welcome email template
 * @param {Object} params
 * @param {string} params.recipientName
 * @param {string} params.appName
 * @returns {{ subject: string, html: string, text: string }}
 */
function welcomeTemplate({ recipientName, appName }) {
	const subject = `Welcome to ${appName}!`;
	const text = `Hi ${recipientName},\n\nWelcome to ${appName}! We're excited to have you on board.\n\nCheers,\n${appName} Team`;
	const html = `
		<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
			<h2>Welcome to ${appName}!</h2>
			<p>Hi <strong>${recipientName}</strong>,</p>
			<p>Welcome to ${appName}! We're excited to have you on board.</p>
			<p>Cheers,<br/>${appName} Team</p>
		</div>
	`;
	return { subject, html, text };
}

module.exports = welcomeTemplate;


