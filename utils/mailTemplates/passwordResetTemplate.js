/**
 * Password reset email template
 * @param {Object} params
 * @param {string} params.recipientName
 * @param {string} params.resetLink
 * @param {string} params.appName
 * @returns {{ subject: string, html: string, text: string }}
 */
function passwordResetTemplate({ recipientName, resetLink, appName }) {
	const subject = `${appName} - Reset Your Password`;
	const text = `Hi ${recipientName},\n\nWe received a request to reset your ${appName} password.\nUse the link below to set a new password:\n${resetLink}\n\nIf you didn't request this, you can ignore this email.\n\nThanks,\n${appName} Team`;
	const html = `
		<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
			<h2>Reset your password</h2>
			<p>Hi <strong>${recipientName}</strong>,</p>
			<p>We received a request to reset your ${appName} password.</p>
			<p>
				<a href="${resetLink}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;">Set a new password</a>
			</p>
			<p>If you didn't request this, you can safely ignore this email.</p>
			<p>Thanks,<br/>${appName} Team</p>
		</div>
	`;
	return { subject, html, text };
}

module.exports = passwordResetTemplate;


