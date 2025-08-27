import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Hit The Road Jackpot <onboarding@resend.dev>';

export interface EmailService {
  sendWelcomeEmail(userEmail: string, userName: string): Promise<void>;
  sendCardSetupConfirmation(userEmail: string, userName: string, cardLast4: string, cardBrand: string): Promise<void>;
  sendPaymentReceipt(userEmail: string, userName: string, amount: string, gameNumber: number, transactionId: string): Promise<void>;
  sendWinnerNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, prizeValue: string, prizeDescription: string): Promise<void>;
  sendGameCompletionNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, winnerName: string, prizeDescription: string): Promise<void>;
  sendGameWinnerAnnouncementToAllParticipants(gameName: string, winnerName: string, winningNumber: number, prizeDescription: string, participantEmails: Array<{email: string, name: string}>): Promise<void>;
}

class ResendEmailService implements EmailService {
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: '🎉 Welcome to Hit The Road Jackpot - Start Your Gaming Adventure!',
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
        subject: '✅ Payment Card Successfully Added - Ready to Play!',
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
        subject: '🎯 Payment Successful - Your Lucky Number Awaits!',
        html: this.getPaymentReceiptTemplate(userName, amount, gameNumber, transactionId),
      });
      console.log(`Payment success email sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send payment success email:', error);
      throw error;
    }
  }

  private getWelcomeEmailTemplate(userName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Hit the Road Jackpot</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .content { padding: 40px 30px; }
    .welcome-message { font-size: 18px; color: #334155; margin-bottom: 25px; line-height: 1.6; }
    .features { background-color: #f1f5f9; padding: 25px; border-radius: 12px; margin: 25px 0; }
    .feature { display: flex; align-items: center; margin-bottom: 15px; }
    .feature-icon { width: 24px; height: 24px; margin-right: 15px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background-color: #1e293b; color: white; padding: 30px; text-align: center; font-size: 14px; }
    .security-notice { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Hit The Road Jackpot</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Welcome to the Ultimate Gaming Experience!</p>
    </div>
    
    <div class="content">
      <div class="welcome-message">
        <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${userName}! 🎉</h2>
        <p>Congratulations on joining Hit The Road Jackpot! You're now part of an exclusive community where excitement meets opportunity.</p>
      </div>
      
      <div class="features">
        <h3 style="color: #1e293b; margin-top: 0;">What You Can Do Now:</h3>
        <div class="feature">
          <span style="font-size: 20px;">🎰</span>
          <span style="margin-left: 15px;">Play exciting wheel-spinning games with real prizes</span>
        </div>
        <div class="feature">
          <span style="font-size: 20px;">💳</span>
          <span style="margin-left: 15px;">Secure payment processing with instant transactions</span>
        </div>
        <div class="feature">
          <span style="font-size: 20px;">🏆</span>
          <span style="margin-left: 15px;">Win amazing prizes and track your achievements</span>
        </div>
        <div class="feature">
          <span style="font-size: 20px;">📱</span>
          <span style="margin-left: 15px;">Play anywhere with our mobile-optimized platform</span>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hittheroadjackpot.com" class="cta-button">Start Playing Now!</a>
      </div>
      
      <div class="security-notice">
        <p style="margin: 0; color: #92400e;"><strong>Security First:</strong> Your account is protected with industry-standard encryption. All transactions are processed securely through Square's payment system.</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Hit The Road Jackpot Team</strong></p>
      <p>Questions? Reply to this email or contact us at admin@hittheroadjackpot.com</p>
      <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">This email was sent because you created an account with Hit The Road Jackpot.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getCardSetupTemplate(userName: string, cardLast4: string, cardBrand: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Method Confirmed</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .content { padding: 40px 30px; }
    .confirmation-box { background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; }
    .card-info { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { background-color: #1e293b; color: white; padding: 30px; text-align: center; font-size: 14px; }
    .security-badge { display: inline-flex; align-items: center; background-color: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💳 Hit The Road Jackpot</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Payment Method Successfully Added!</p>
    </div>
    
    <div class="content">
      <div class="confirmation-box">
        <h2 style="color: #059669; margin-top: 0;">✅ Success!</h2>
        <p style="color: #374151; font-size: 16px; margin-bottom: 0;">Hi ${userName}, your payment method has been successfully added and verified.</p>
      </div>
      
      <div class="card-info">
        <h3 style="color: #1e293b; margin-top: 0;">Payment Method Details:</h3>
        <p><strong>Card Type:</strong> ${cardBrand}</p>
        <p><strong>Card Number:</strong> •••• •••• •••• ${cardLast4}</p>
        <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Verified & Active</span></p>
      </div>
      
      <div class="security-badge" style="display: block; text-align: center;">
        <span>🔒 Secured by Square Payment Processing</span>
      </div>
      
      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
        <p style="color: #374151; margin-bottom: 0;">You're all set to start playing! Your card will be charged only when you choose to play a number on the wheel. All transactions are instant and secure.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hittheroadjackpot.com/games" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Playing Now!</a>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Hit The Road Jackpot Team</strong></p>
      <p>Need help? Contact us at admin@hittheroadjackpot.com</p>
      <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">Your payment information is encrypted and secure. We never store your full card details.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getPaymentReceiptTemplate(userName: string, amount: string, gameNumber: number, transactionId: string): string {
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .content { padding: 40px 30px; }
    .receipt-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; }
    .transaction-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .transaction-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; }
    .footer { background-color: #1e293b; color: white; padding: 30px; text-align: center; font-size: 14px; }
    .game-info { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Hit The Road Jackpot</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Game Spin Receipt - Thank You for Playing!</p>
    </div>
    
    <div class="content">
      <h2 style="color: #1e293b;">Hi ${userName},</h2>
      <p style="color: #374151; font-size: 16px;">Your payment has been successfully processed. Here are your transaction details:</p>
      
      <div class="receipt-box">
        <h3 style="color: #1e293b; margin-top: 0;">Transaction Receipt</h3>
        <div class="transaction-row">
          <span>Date & Time:</span>
          <span>${date}</span>
        </div>
        <div class="transaction-row">
          <span>Game Number Played:</span>
          <span style="font-weight: bold; color: #6366f1;">#${gameNumber}</span>
        </div>
        <div class="transaction-row">
          <span>Amount Charged:</span>
          <span style="font-weight: bold; color: #059669;">$${amount}</span>
        </div>
        <div class="transaction-row">
          <span>Transaction ID:</span>
          <span style="font-family: monospace; font-size: 14px;">${transactionId}</span>
        </div>
        <div class="transaction-row">
          <span>Status:</span>
          <span style="color: #059669; font-weight: bold;">✅ Completed</span>
        </div>
      </div>
      
      <div class="game-info">
        <h3 style="color: #92400e; margin-top: 0;">🎮 Game Results</h3>
        <p style="color: #78350f; margin-bottom: 0;">You successfully claimed number <strong>${gameNumber}</strong>! Check your dashboard to see if you've won any prizes. Good luck!</p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #0369a1; margin-top: 0;">Keep Playing!</h3>
        <p style="color: #374151; margin-bottom: 15px;">Want to try your luck again? There are more numbers available to play.</p>
        <div style="text-align: center;">
          <a href="https://hittheroadjackpot.com/games" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Play More Games</a>
        </div>
      </div>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Important:</strong> Keep this email as your receipt. If you have any questions about this transaction, please contact us with the transaction ID above.</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Hit The Road Jackpot Team</strong></p>
      <p>Questions about this transaction? Contact us at admin@hittheroadjackpot.com</p>
      <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">This is an automated receipt. All payments are processed securely through Square.</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendWinnerNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, prizeValue: string, prizeDescription: string): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `Account notification - ${gameName}`,
        html: this.getWinnerNotificationTemplate(userName, gameName, winningNumber, prizeValue, prizeDescription),
        text: `Dear ${userName}, This notification confirms an account update for ${gameName}. Number ${winningNumber} has been selected. Item details: ${prizeDescription} (Value: $${prizeValue}). Our team will contact you within 48 hours. Please have identification ready. For questions contact admin@hittheroadjackpot.com`,
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
        subject: `${gameName} - Status update`,
        html: this.getGameCompletionTemplate(userName, gameName, winningNumber, winnerName, prizeDescription),
        text: `Hello ${userName}, This confirms ${gameName} has completed. Selected participant: ${winnerName}, Number: ${winningNumber}, Prize: ${prizeDescription}. Thank you for your participation. Questions? Contact admin@hittheroadjackpot.com`,
      });
      console.log(`Game completion notification sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send game completion notification:', error);
      throw error;
    }
  }

  private getWinnerNotificationTemplate(userName: string, gameName: string, winningNumber: number, prizeValue: string, prizeDescription: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Update</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #ffffff; color: #333333;">
  <table style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #dddddd;">
    <tr>
      <td style="background-color: #4a5568; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: normal;">Hit The Road Jackpot</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
          Dear ${userName},
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
          This is to notify you of an account update. Your participation in ${gameName} has resulted in selection of number ${winningNumber}.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">Game:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">${gameName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">Number:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">${winningNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">Item:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">${prizeDescription}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">Value:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">$${prizeValue}</td>
          </tr>
        </table>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 20px 0;">
          Next steps:
        </p>
        <ul style="color: #333333; line-height: 1.5; padding-left: 20px; margin: 0 0 20px 0;">
          <li>Our team will contact you within 48 hours</li>
          <li>Please have identification ready for verification</li>
          <li>Monitor your email for further instructions</li>
        </ul>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 20px 0;">
          You can view your account details at: https://hittheroadjackpot.com/dashboard
        </p>
        
        <p style="color: #666666; font-size: 14px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
          This is an automated message from Hit The Road Jackpot. Please keep this email for your records.<br>
          For assistance, contact: admin@hittheroadjackpot.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendGameWinnerAnnouncementToAllParticipants(gameName: string, winnerName: string, winningNumber: number, prizeDescription: string, participantEmails: Array<{email: string, name: string}>): Promise<void> {
    try {
      const emailPromises = participantEmails.map(participant =>
        resend.emails.send({
          from: FROM_EMAIL,
          to: participant.email,
          subject: `🎉 Winner Announced - ${gameName} Results`,
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

  private getWinnerAnnouncementTemplate(participantName: string, gameName: string, winnerName: string, winningNumber: number, prizeDescription: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Winner Announcement</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8fafc; color: #333333;">
  <table style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🎉 Winner Announcement</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">The results are in!</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <p style="color: #333333; font-size: 18px; line-height: 1.5; margin: 0 0 20px 0;">
          Hello ${participantName},
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 25px 0;">
          Thank you for participating in <strong>${gameName}</strong>! The winner has been selected and we're excited to share the results with all participants.
        </p>
        
        <div style="background-color: #f1f5f9; border-left: 4px solid #6366f1; padding: 25px; margin: 25px 0; border-radius: 8px;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">🏆 Winner Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Game:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${gameName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Winner:</td>
              <td style="padding: 8px 0; color: #6366f1; font-weight: bold;">${winnerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Winning Number:</td>
              <td style="padding: 8px 0; color: #dc2626; font-weight: bold; font-size: 18px;">#${winningNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Prize:</td>
              <td style="padding: 8px 0; color: #059669; font-weight: bold;">${prizeDescription}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 25px 0;">
          Congratulations to our winner! Thank you for being part of the Hit the Road Jackpot community.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://hittheroadjackpot.com/games" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Play More Games</a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          This is an automated message from Hit The Road Jackpot.<br>
          For questions, contact: admin@hittheroadjackpot.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private getGameCompletionTemplate(userName: string, gameName: string, winningNumber: number, winnerName: string, prizeDescription: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Update</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #ffffff; color: #333333;">
  <table style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #dddddd;">
    <tr>
      <td style="background-color: #4a5568; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: normal;">Hit The Road Jackpot</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
          Dear ${userName},
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
          This message confirms that ${gameName} has been completed. The final results are now available.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">Game:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">${gameName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">Selected Participant:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">${winnerName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">Number:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">${winningNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">Item:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">${prizeDescription}</td>
          </tr>
        </table>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 20px 0;">
          Thank you for your participation in this activity.
        </p>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.5; margin: 20px 0;">
          You can view available activities at: https://hittheroadjackpot.com/games
        </p>
        
        <p style="color: #666666; font-size: 14px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
          This is an automated message from Hit The Road Jackpot.<br>
          For assistance, contact: admin@hittheroadjackpot.com
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}

export const emailService = new ResendEmailService();