import { getCompanyInfo, wrapEmailHtml } from "./baseLayout.js";

export async function renderStaffPasswordResetEmail(user, resetLink) {
  const company = await getCompanyInfo();
  const name = user.first_name || user.name || "Staff Member";

  const contentHtml = `
    <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #0f172a; font-weight: 700;">Password Reset Request 🔐</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Hello <strong>${name}</strong>, a request was received to reset your staff credentials for the ${company.name} Administrative Portal.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #475569;">
      This link is valid for <strong>1 hour</strong> and can only be used once. If you did not initiate this request, please notify your system administrator immediately.
    </div>

    <center>
      <a href="${resetLink}" class="btn">Reset Staff Password</a>
    </center>

    <p style="margin: 20px 0 0 0; font-size: 12px; color: #94a3b8; word-break: break-all;">
      If the button does not work, copy and paste this URL into your browser:<br />
      <a href="${resetLink}" style="color: #15a9e3;">${resetLink}</a>
    </p>
  `;

  const html = wrapEmailHtml({
    title: `Staff Password Reset - ${company.name}`,
    preheader: `Click to reset your password for the ${company.name} Management Portal.`,
    contentHtml,
    company,
  });

  const text = `
Staff Password Reset Request
Hello ${name},
Reset link: ${resetLink}
This link expires in 1 hour.
  `.trim();

  return { html, text, subject: `Staff Password Reset - ${company.name}` };
}

export async function renderCustomerPasswordResetEmail(customer, resetLink) {
  const company = await getCompanyInfo();
  const name = customer.customer_name || customer.name || "Customer";

  const contentHtml = `
    <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #0f172a; font-weight: 700;">Reset Your Password 🔑</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
      Hello <strong>${name}</strong>, we received a request to reset your ${company.name} customer account password.
    </p>

    <center>
      <a href="${resetLink}" class="btn">Choose New Password</a>
    </center>

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b;">
      If you did not request a password reset, you can safely ignore this email. Your current password remains secure.
    </p>
  `;

  const html = wrapEmailHtml({
    title: `Reset Your Password - ${company.name}`,
    preheader: `Reset your ${company.name} password.`,
    contentHtml,
    company,
  });

  const text = `
Reset Your Password
Hello ${name},
Click here to reset your password: ${resetLink}
  `.trim();

  return { html, text, subject: `Reset Your Password - ${company.name}` };
}

const passwordReset = {
  renderStaffPasswordResetEmail,
  renderCustomerPasswordResetEmail,
};

export default passwordReset;
