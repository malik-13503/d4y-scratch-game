import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Prize Plugz <admin@prizeplugz.com>';

export interface EmailService {
  sendWelcomeEmail(userEmail: string, userName: string): Promise<void>;
  sendCardSetupConfirmation(userEmail: string, userName: string, cardLast4: string, cardBrand: string): Promise<void>;
  sendPaymentReceipt(userEmail: string, userName: string, amount: string, gameNumber: number, transactionId: string): Promise<void>;
  sendWinnerNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, prizeValue: string, prizeDescription: string): Promise<void>;
  sendGameCompletionNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, winnerName: string, prizeDescription: string): Promise<void>;
  sendGameWinnerAnnouncementToAllParticipants(gameName: string, winnerName: string, winningNumber: number, prizeDescription: string, participantEmails: Array<{email: string, name: string}>): Promise<void>;
  sendLowTokenWarning(userEmail: string, userName: string, balance: number): Promise<void>;
  sendGameClosingSoon(userEmail: string, userName: string, gameName: string, pctFull: number): Promise<void>;
  sendNewGameLive(userEmail: string, userName: string, gameName: string, prize: string): Promise<void>;
  sendReferralBonusEmail(userEmail: string, userName: string, referredName: string, tokensEarned: number): Promise<void>;
}

/* ─── Shared brand shell ─────────────────────────────────────────────────── */
function shell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0f0a1e;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0a1e;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

      <!-- HEADER -->
      <tr>
        <td style="background:linear-gradient(135deg,#4c1d95 0%,#7c3aed 40%,#db2777 80%,#f59e0b 100%);border-radius:16px 16px 0 0;padding:40px 32px 36px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.25);border-radius:14px;padding:10px 22px;margin-bottom:18px;">
            <span style="font-size:28px;letter-spacing:2px;font-weight:900;color:#ffffff;text-transform:uppercase;font-family:'Segoe UI',Arial,sans-serif;">🎯 PRIZE PLUGZ</span>
          </div>
          <br>
          <span style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.65);font-weight:600;">Real Games · Real Prizes · Real Winners</span>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="background:#1a1035;padding:0;">
          ${content}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#0d0820;border-radius:0 0 16px 16px;padding:28px 32px;text-align:center;border-top:1px solid rgba(124,58,237,0.25);">
          <p style="margin:0 0 8px;font-size:13px;color:#a78bfa;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Prize Plugz</p>
          <p style="margin:0 0 12px;font-size:12px;color:#6b7280;">Questions? Email us at <a href="mailto:admin@prizeplugz.com" style="color:#f59e0b;text-decoration:none;">admin@prizeplugz.com</a></p>
          <p style="margin:0;font-size:11px;color:#374151;">© 2025 Prize Plugz. All rights reserved.<br>
          <a href="https://prizeplugz.com/privacy" style="color:#6b7280;text-decoration:none;">Privacy Policy</a> &nbsp;·&nbsp;
          <a href="https://prizeplugz.com/terms" style="color:#6b7280;text-decoration:none;">Terms & Conditions</a> &nbsp;·&nbsp;
          <a href="https://prizeplugz.com/official-rules" style="color:#6b7280;text-decoration:none;">Official Rules</a></p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ─── Reusable pieces ────────────────────────────────────────────────────── */
function heroSection(emoji: string, headline: string, sub: string, gradFrom = '#7c3aed', gradTo = '#db2777'): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding:36px 32px 24px;text-align:center;">
        <div style="display:inline-block;width:72px;height:72px;line-height:72px;border-radius:50%;background:linear-gradient(135deg,${gradFrom},${gradTo});font-size:34px;text-align:center;margin-bottom:16px;">${emoji}</div>
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#f3f4f6;letter-spacing:-0.5px;">${headline}</h1>
        <p style="margin:0;font-size:15px;color:#9ca3af;line-height:1.5;">${sub}</p>
      </td>
    </tr>
  </table>`;
}

function infoCard(rows: Array<[string, string]>, accentColor = '#7c3aed'): string {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:11px 16px;font-size:13px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:40%;border-bottom:1px solid rgba(255,255,255,0.06);">${label}</td>
      <td style="padding:11px 16px;font-size:14px;color:#f3f4f6;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.06);">${value}</td>
    </tr>`).join('');
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:rgba(255,255,255,0.04);border:1px solid rgba(${accentColor === '#7c3aed' ? '124,58,237' : '245,158,11'},0.25);border-radius:12px;overflow:hidden;margin:0 0 20px;">
    ${rowsHtml}
  </table>`;
}

function ctaButton(label: string, href: string, gradFrom = '#f59e0b', gradTo = '#f97316'): string {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td style="background:linear-gradient(135deg,${gradFrom},${gradTo});border-radius:10px;padding:0;">
        <a href="${href}" style="display:inline-block;padding:15px 36px;font-size:15px;font-weight:900;color:#000000;text-decoration:none;letter-spacing:0.5px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

function alertBox(text: string, emoji: string, bg = 'rgba(245,158,11,0.1)', border = '#f59e0b'): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:${bg};border:1px solid ${border};border-radius:10px;margin:0 0 20px;">
    <tr>
      <td style="padding:16px 20px;font-size:14px;color:#e5e7eb;line-height:1.6;">
        <span style="font-size:18px;margin-right:8px;">${emoji}</span>${text}
      </td>
    </tr>
  </table>`;
}

function featureList(items: Array<[string, string]>): string {
  return items.map(([icon, text]) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px;">
    <tr>
      <td style="width:40px;vertical-align:top;padding-top:2px;font-size:20px;">${icon}</td>
      <td style="font-size:14px;color:#d1d5db;line-height:1.5;">${text}</td>
    </tr>
  </table>`).join('');
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="border-top:1px solid rgba(255,255,255,0.07);"></td></tr></table>`;
}

/* ─── Email service ──────────────────────────────────────────────────────── */
class ResendEmailService implements EmailService {
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: '🎉 Welcome to Prize Plugz — Your Free Tokens Are Inside!',
        html: this.getWelcomeEmailTemplate(userName),
      });
      console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendCardSetupConfirmation(userEmail: string, userName: string, cardLast4: string, cardBrand: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: '✅ Payment Card Added — You\'re Ready to Play!',
        html: this.getCardSetupTemplate(userName, cardLast4, cardBrand),
      });
      console.log(`Card setup confirmation sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send card setup confirmation:', error);
      throw error;
    }
  }

  async sendPaymentReceipt(userEmail: string, userName: string, amount: string, gameNumber: number, transactionId: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `🎯 Payment Confirmed — You Picked #${gameNumber}!`,
        html: this.getPaymentReceiptTemplate(userName, amount, gameNumber, transactionId),
      });
      console.log(`Payment success email sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send payment success email:', error);
      throw error;
    }
  }

  async sendWinnerNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, prizeValue: string, prizeDescription: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `🏆 YOU WON — ${gameName}! Claim Your Prize`,
        html: this.getWinnerNotificationTemplate(userName, gameName, winningNumber, prizeValue, prizeDescription),
        text: `Congratulations ${userName}! You won ${gameName} with number ${winningNumber}. Prize: ${prizeDescription} (Value: $${prizeValue}). Our team will contact you within 48 hours. Questions? admin@prizeplugz.com`,
      });
      console.log(`Winner notification sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send winner notification:', error);
      throw error;
    }
  }

  async sendGameCompletionNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, winnerName: string, prizeDescription: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `🎉 ${gameName} — Winner Announced!`,
        html: this.getGameCompletionTemplate(userName, gameName, winningNumber, winnerName, prizeDescription),
        text: `Hi ${userName}, ${gameName} has ended. Winner: ${winnerName}, Number: ${winningNumber}, Prize: ${prizeDescription}. Thanks for playing! Visit prizeplugz.com for more games.`,
      });
      console.log(`Game completion notification sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send game completion notification:', error);
      throw error;
    }
  }

  async sendGameWinnerAnnouncementToAllParticipants(gameName: string, winnerName: string, winningNumber: number, prizeDescription: string, participantEmails: Array<{email: string, name: string}>): Promise<void> {
    try {
      const emailPromises = participantEmails.map(participant =>
        resend.emails.send({
          from: FROM_EMAIL,
          to: participant.email,
          subject: `🎉 ${gameName} — Winner Announced!`,
          html: this.getWinnerAnnouncementTemplate(participant.name, gameName, winnerName, winningNumber, prizeDescription),
        })
      );
      await Promise.all(emailPromises);
      console.log(`Winner announcement emails sent to ${participantEmails.length} participants for game ${gameName}`);
    } catch (error) {
      console.error('Failed to send winner announcement emails:', error);
      throw error;
    }
  }

  /* ─── Templates ────────────────────────────────────────────────────────── */

  private getWelcomeEmailTemplate(userName: string): string {
    return shell(`
      ${heroSection('🎁', `Welcome, ${userName}!`, 'You\'re officially part of the Prize Plugz family. Let\'s get you winning!')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 32px 24px;">

          <!-- Token badge -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(249,115,22,0.15));border:1px solid rgba(245,158,11,0.4);border-radius:12px;margin:0 0 24px;">
            <tr>
              <td style="padding:20px 24px;text-align:center;">
                <p style="margin:0 0 4px;font-size:13px;color:#fbbf24;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🎉 Your Welcome Gift</p>
                <p style="margin:0;font-size:32px;font-weight:900;color:#f59e0b;">10 FREE Tokens</p>
                <p style="margin:4px 0 0;font-size:13px;color:#d97706;">already added to your account!</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
            Prize Plugz is where real prizes get won every day. Pick your lucky number on a live game wheel — when all numbers are claimed, one winner takes it all. 100% transparent. 100% real.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:rgba(255,255,255,0.04);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:4px;margin:0 0 24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 14px;font-size:13px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">How it works</p>
              ${featureList([
                ['🎰', 'Browse live games and pick your lucky number'],
                ['💰', 'Each number has a fixed token cost — no hidden fees'],
                ['🏆', 'When all numbers fill up, a winner is auto-selected instantly'],
                ['📧', 'Winners are notified by email and receive their prize within 48 hours'],
              ])}
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr><td style="text-align:center;">
              ${ctaButton('🎮  Start Playing Now', 'https://prizeplugz.com/games')}
            </td></tr>
          </table>

          ${alertBox('Prize Plugz is a skill-free sweepstakes platform. No purchase is necessary to enter or win. See our <a href="https://prizeplugz.com/official-rules" style="color:#fbbf24;">Official Rules</a> for details.', '📋', 'rgba(124,58,237,0.1)', 'rgba(124,58,237,0.4)')}

        </td></tr>
      </table>
    `);
  }

  private getCardSetupTemplate(userName: string, cardLast4: string, cardBrand: string): string {
    return shell(`
      ${heroSection('✅', 'Payment Method Added!', `Your ${cardBrand} card ending in ${cardLast4} is verified and ready to use.`, '#059669', '#10b981')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 32px 24px;">

          <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">Hi <strong style="color:#f3f4f6;">${userName}</strong>, your payment card has been securely verified. Here's a summary:</p>

          ${infoCard([
            ['Card Brand', cardBrand],
            ['Card Number', `•••• •••• •••• ${cardLast4}`],
            ['Status', '✅ Verified & Active'],
          ])}

          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:rgba(5,150,105,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;margin:0 0 24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:800;color:#34d399;text-transform:uppercase;letter-spacing:1px;">🔒 Your security, guaranteed</p>
              ${featureList([
                ['🛡️', 'Your full card number is never stored on our servers'],
                ['🔐', 'All payments are encrypted end-to-end'],
                ['💳', 'Your card is only charged when you choose to play a number'],
              ])}
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr><td style="text-align:center;">
              ${ctaButton('🎮  Browse Live Games', 'https://prizeplugz.com/games')}
            </td></tr>
          </table>

          ${alertBox('If you did not add this card, please contact us immediately at admin@prizeplugz.com so we can secure your account.', '⚠️', 'rgba(239,68,68,0.08)', 'rgba(239,68,68,0.35)')}

        </td></tr>
      </table>
    `);
  }

  private getPaymentReceiptTemplate(userName: string, amount: string, gameNumber: number, transactionId: string): string {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    return shell(`
      ${heroSection('🎯', `You Picked #${gameNumber}!`, 'Your payment is confirmed. Good luck — you\'re in the game!', '#2563eb', '#7c3aed')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 32px 24px;">

          <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">Hi <strong style="color:#f3f4f6;">${userName}</strong>, here's your official receipt. Keep this for your records.</p>

          ${infoCard([
            ['Date & Time', date],
            ['Number Claimed', `<span style="color:#a78bfa;font-size:18px;font-weight:900;">#${gameNumber}</span>`],
            ['Amount Charged', `<span style="color:#34d399;">$${amount}</span>`],
            ['Transaction ID', `<span style="font-family:monospace;font-size:12px;color:#9ca3af;">${transactionId}</span>`],
            ['Status', '<span style="color:#34d399;">✅ Completed</span>'],
          ])}

          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(219,39,119,0.12));border:1px solid rgba(124,58,237,0.3);border-radius:12px;margin:0 0 24px;">
            <tr><td style="padding:20px 24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#c084fc;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Your Lucky Number</p>
              <p style="margin:0;font-size:56px;font-weight:900;color:#f3f4f6;line-height:1;">#${gameNumber}</p>
              <p style="margin:6px 0 0;font-size:13px;color:#9ca3af;">Watch the game page to see it fill up!</p>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr><td style="text-align:center;">
              ${ctaButton('🎮  View Game Progress', 'https://prizeplugz.com/games')}
            </td></tr>
          </table>

          ${alertBox('Save this email as your receipt. If you have a question about this charge, reply with your Transaction ID and we\'ll help right away.', '📌')}

        </td></tr>
      </table>
    `);
  }

  private getWinnerNotificationTemplate(userName: string, gameName: string, winningNumber: number, prizeValue: string, prizeDescription: string): string {
    return shell(`
      <!-- Gold winner banner -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:linear-gradient(135deg,#78350f,#b45309,#d97706);padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:44px;line-height:1;">🏆</p>
            <p style="margin:8px 0 4px;font-size:28px;font-weight:900;color:#fef3c7;letter-spacing:-0.5px;">YOU WON!</p>
            <p style="margin:0;font-size:14px;color:#fde68a;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Congratulations, ${userName}!</p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:28px 32px 24px;">

          <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
            Your lucky number was selected as the winner of <strong style="color:#f3f4f6;">${gameName}</strong>. Here are your winning details:
          </p>

          <!-- Prize highlight -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(251,191,36,0.1));border:2px solid rgba(245,158,11,0.5);border-radius:14px;margin:0 0 20px;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#fbbf24;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Your Prize</p>
              <p style="margin:0 0 4px;font-size:22px;font-weight:900;color:#f3f4f6;">${prizeDescription}</p>
              <p style="margin:0;font-size:28px;font-weight:900;color:#f59e0b;">$${prizeValue} Value</p>
            </td></tr>
          </table>

          ${infoCard([
            ['Game', gameName],
            ['Winning Number', `<span style="color:#f59e0b;font-size:20px;font-weight:900;">#${winningNumber}</span>`],
            ['Prize', prizeDescription],
            ['Value', `<span style="color:#34d399;">$${prizeValue}</span>`],
          ], '#f59e0b')}

          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:rgba(255,255,255,0.04);border:1px solid rgba(124,58,237,0.2);border-radius:12px;margin:0 0 24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:800;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">⚡ Next Steps</p>
              ${featureList([
                ['📧', 'Our team will email you within 48 hours with claim instructions'],
                ['🪪', 'Have a valid photo ID ready for winner verification'],
                ['🎁', 'Your prize will be dispatched once verification is complete'],
              ])}
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr><td style="text-align:center;">
              ${ctaButton('🏆  View Your Dashboard', 'https://prizeplugz.com/dashboard')}
            </td></tr>
          </table>

          ${alertBox('If you have questions about claiming your prize, reply to this email or contact admin@prizeplugz.com with your name and winning game.', '💬', 'rgba(124,58,237,0.1)', 'rgba(124,58,237,0.4)')}

        </td></tr>
      </table>
    `);
  }

  private getWinnerAnnouncementTemplate(participantName: string, gameName: string, winnerName: string, winningNumber: number, prizeDescription: string): string {
    return shell(`
      ${heroSection('🎉', 'Winner Announced!', `The results are in for <strong style="color:#f3f4f6;">${gameName}</strong>`)}
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 32px 24px;">

          <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
            Hi <strong style="color:#f3f4f6;">${participantName}</strong>, thank you for playing <strong style="color:#f3f4f6;">${gameName}</strong>! All numbers have been claimed and a winner has been selected.
          </p>

          <!-- Winner spotlight -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(219,39,119,0.15));border:2px solid rgba(124,58,237,0.4);border-radius:14px;margin:0 0 20px;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 10px;font-size:36px;">🏆</p>
              <p style="margin:0 0 4px;font-size:13px;color:#c084fc;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Winner</p>
              <p style="margin:0 0 4px;font-size:24px;font-weight:900;color:#f3f4f6;">${winnerName}</p>
              <p style="margin:0;font-size:15px;color:#a78bfa;">Number <strong style="color:#f59e0b;font-size:20px;">#${winningNumber}</strong></p>
            </td></tr>
          </table>

          ${infoCard([
            ['Game', gameName],
            ['Winner', `<span style="color:#c084fc;font-weight:900;">${winnerName}</span>`],
            ['Winning Number', `<span style="color:#f59e0b;font-size:18px;font-weight:900;">#${winningNumber}</span>`],
            ['Prize', prizeDescription],
          ])}

          <p style="margin:0 0 24px;font-size:15px;color:#d1d5db;line-height:1.7;">
            Thanks for being part of the Prize Plugz community! New games go live all the time — head back and try your luck again.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr><td style="text-align:center;">
              ${ctaButton('🎮  Play More Games', 'https://prizeplugz.com/games')}
            </td></tr>
          </table>

          ${alertBox('Every game at Prize Plugz has a guaranteed winner. The more you play, the closer you get! 🍀', '✨', 'rgba(16,185,129,0.08)', 'rgba(16,185,129,0.3)')}

        </td></tr>
      </table>
    `);
  }

  async sendLowTokenWarning(userEmail: string, userName: string, balance: number): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: '⚠️ Low Tokens — Top Up & Keep Playing!',
        html: shell(`
          ${heroSection('⚡', 'Your tokens are running low!', `You have ${balance} token${balance === 1 ? '' : 's'} remaining.`, '#d97706', '#b45309')}
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:0 32px 24px;">
              <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
                Hi <strong style="color:#f3f4f6;">${userName}</strong>, you're almost out of tokens. Don't miss your chance to win — top up now and stay in the game!
              </p>
              ${alertBox(`You currently have <strong>${balance} token${balance === 1 ? '' : 's'}</strong>. Each spin costs tokens, so grab a pack and keep playing.`, '🪙', 'rgba(245,158,11,0.08)', 'rgba(245,158,11,0.4)')}
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr><td style="text-align:center;">
                  ${ctaButton('🛒  Buy More Tokens', 'https://prizeplugz.com/add-credits')}
                </td></tr>
              </table>
            </td></tr>
          </table>
        `),
      });
    } catch (error) { console.error('Failed to send low token warning:', error); }
  }

  async sendGameClosingSoon(userEmail: string, userName: string, gameName: string, pctFull: number): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `🔥 ${gameName} is ${pctFull}% Full — Last Chance!`,
        html: shell(`
          ${heroSection('🔥', 'Game Closing Soon!', `${gameName} is ${pctFull}% full.`, '#dc2626', '#b91c1c')}
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:0 32px 24px;">
              <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
                Hi <strong style="color:#f3f4f6;">${userName}</strong>, <strong style="color:#f97316;">${gameName}</strong> is ${pctFull}% full and closing fast! Grab your entries before it's too late.
              </p>
              ${alertBox('When the game fills up, a winner is automatically selected. The fewer spots left, the better your odds!', '🎯', 'rgba(239,68,68,0.08)', 'rgba(239,68,68,0.4)')}
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr><td style="text-align:center;">
                  ${ctaButton('⚡  Claim Your Spot Now', 'https://prizeplugz.com/games')}
                </td></tr>
              </table>
            </td></tr>
          </table>
        `),
      });
    } catch (error) { console.error('Failed to send game closing soon email:', error); }
  }

  async sendNewGameLive(userEmail: string, userName: string, gameName: string, prize: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `🎮 New Game Live: ${gameName} — Be First In!`,
        html: shell(`
          ${heroSection('🎮', 'New Game Just Launched!', `${gameName} is now live.`, '#7c3aed', '#4f46e5')}
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:0 32px 24px;">
              <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
                Hi <strong style="color:#f3f4f6;">${userName}</strong>, a brand new game just went live on Prize Plugz. Be one of the first to enter for the best odds!
              </p>
              ${infoCard([['Game', gameName], ['Prize', prize], ['Status', '<span style="color:#34d399;">🟢 Now Live</span>']])}
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr><td style="text-align:center;">
                  ${ctaButton('🎯  Enter Now', 'https://prizeplugz.com/games')}
                </td></tr>
              </table>
            </td></tr>
          </table>
        `),
      });
    } catch (error) { console.error('Failed to send new game live email:', error); }
  }

  async sendReferralBonusEmail(userEmail: string, userName: string, referredName: string, tokensEarned: number): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `🎉 ${referredName} joined — You earned ${tokensEarned} bonus tokens!`,
        html: shell(`
          ${heroSection('🎉', 'Referral Bonus Earned!', `${referredName} signed up with your link.`, '#059669', '#047857')}
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:0 32px 24px;">
              <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
                Hi <strong style="color:#f3f4f6;">${userName}</strong>, great news — <strong style="color:#34d399;">${referredName}</strong> just signed up using your referral link!
              </p>
              ${infoCard([['Referred Friend', referredName], ['Tokens Earned', `<span style="color:#f59e0b;font-size:18px;font-weight:900;">+${tokensEarned} tokens</span>`]], '#059669')}
              ${alertBox('Keep sharing your referral link — every friend who signs up earns you more bonus tokens!', '🔗', 'rgba(5,150,105,0.08)', 'rgba(5,150,105,0.4)')}
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr><td style="text-align:center;">
                  ${ctaButton('🎮  Use Your Tokens', 'https://prizeplugz.com/games')}
                </td></tr>
              </table>
            </td></tr>
          </table>
        `),
      });
    } catch (error) { console.error('Failed to send referral bonus email:', error); }
  }

  private getGameCompletionTemplate(userName: string, gameName: string, winningNumber: number, winnerName: string, prizeDescription: string): string {
    return shell(`
      ${heroSection('🎊', `${gameName} Complete!`, 'The final results have been confirmed.')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="padding:0 32px 24px;">

          <p style="margin:0 0 20px;font-size:15px;color:#d1d5db;line-height:1.7;">
            Hi <strong style="color:#f3f4f6;">${userName}</strong>, this game has officially ended. Here's a summary of the final results:
          </p>

          ${infoCard([
            ['Game', gameName],
            ['Selected Winner', `<span style="color:#c084fc;font-weight:900;">${winnerName}</span>`],
            ['Winning Number', `<span style="color:#f59e0b;font-size:18px;font-weight:900;">#${winningNumber}</span>`],
            ['Prize', prizeDescription],
            ['Status', '<span style="color:#34d399;">✅ Completed</span>'],
          ])}

          <p style="margin:0 0 24px;font-size:15px;color:#d1d5db;line-height:1.7;">
            Congratulations to <strong style="color:#c084fc;">${winnerName}</strong>! Thank you for participating — we hope to see you in the next game. There's always another chance to win.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr><td style="text-align:center;">
              ${ctaButton('🎮  Find Your Next Game', 'https://prizeplugz.com/games')}
            </td></tr>
          </table>

          ${alertBox('Every number has an equal chance of winning. New games go live daily — stay in the game and keep playing! 🎯', '🍀', 'rgba(16,185,129,0.08)', 'rgba(16,185,129,0.3)')}

        </td></tr>
      </table>
    `);
  }
}

export const emailService = new ResendEmailService();
