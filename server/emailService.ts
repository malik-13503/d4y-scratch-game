import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Hit The Road Jackpot <admin@hittheroadjackpot.com>';

export interface EmailService {
  sendWelcomeEmail(userEmail: string, userName: string): Promise<void>;
  sendCardSetupConfirmation(userEmail: string, userName: string, cardLast4: string, cardBrand: string): Promise<void>;
  sendPaymentReceipt(userEmail: string, userName: string, amount: string, gameNumber: number, transactionId: string): Promise<void>;
  sendWinnerNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, prizeValue: string, prizeDescription: string): Promise<void>;
  sendGameCompletionNotification(userEmail: string, userName: string, gameName: string, winningNumber: number, winnerName: string, prizeDescription: string): Promise<void>;
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
        subject: '🎯 Game Spin Receipt - Your Lucky Number Awaits!',
        html: this.getPaymentReceiptTemplate(userName, amount, gameNumber, transactionId),
      });
      console.log(`Payment receipt sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send payment receipt:', error);
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
        subject: '🎉 CONGRATULATIONS! You Won the Jackpot! 🎉',
        html: this.getWinnerNotificationTemplate(userName, gameName, winningNumber, prizeValue, prizeDescription),
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
        subject: `🎮 Game Complete: ${gameName} - Winner Announced!`,
        html: this.getGameCompletionTemplate(userName, gameName, winningNumber, winnerName, prizeDescription),
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎉 WINNER! You Won the Jackpot!</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); padding: 40px 20px; text-align: center; position: relative; overflow: hidden; }
    .header::before { content: '🎉'; position: absolute; top: -10px; left: 20px; font-size: 60px; opacity: 0.3; animation: bounce 2s infinite; }
    .header::after { content: '🎉'; position: absolute; top: -10px; right: 20px; font-size: 60px; opacity: 0.3; animation: bounce 2s infinite 0.5s; }
    .header h1 { color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .winner-banner { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 40px 30px; }
    .prize-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 15px; padding: 30px; margin: 25px 0; text-align: center; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3); }
    .winning-number { background: #dc2626; color: white; padding: 15px 30px; border-radius: 50px; font-size: 28px; font-weight: bold; display: inline-block; margin: 15px 0; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3); }
    .cta-button { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
    .footer { background-color: #1e293b; color: white; padding: 30px; text-align: center; font-size: 14px; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 CONGRATULATIONS! 🏆</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">You Are Our Grand Prize Winner!</p>
    </div>
    
    <div class="winner-banner">
      ✨ WINNER WINNER ✨
    </div>
    
    <div class="content">
      <h2 style="color: #1e293b; text-align: center; font-size: 28px;">🎉 ${userName}, You WON! 🎉</h2>
      
      <div class="prize-box">
        <h3 style="color: #92400e; margin-top: 0; font-size: 24px;">Your Winning Prize:</h3>
        <p style="color: #78350f; font-size: 20px; font-weight: bold; margin: 15px 0;">${prizeDescription}</p>
        <div style="font-size: 36px; color: #059669; font-weight: bold; margin: 20px 0;">Prize Value: $${prizeValue}</div>
        
        <div class="winning-number">
          Lucky Number: #${winningNumber}
        </div>
        
        <p style="color: #78350f; margin: 20px 0;">Game: <strong>${gameName}</strong></p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <h3 style="color: #1e40af; margin-top: 0;">🎊 What Happens Next?</h3>
        <ul style="color: #374151; padding-left: 20px;">
          <li>Our team will contact you within 24-48 hours to arrange prize delivery</li>
          <li>Please check your email regularly for prize claim instructions</li>
          <li>Have your ID ready for prize verification</li>
          <li>Enjoy your amazing prize!</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hittheroadjackpot.com/dashboard" class="cta-button">View Your Win Dashboard</a>
      </div>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Important:</strong> Keep this email as proof of your win. Our team will reference this when arranging your prize delivery.</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>🎮 Hit The Road Jackpot Team</strong></p>
      <p>Congratulations on your incredible win! We can't wait to get your prize to you.</p>
      <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">This win has been verified and logged in our system. Prize claim instructions will follow shortly.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getGameCompletionTemplate(userName: string, gameName: string, winningNumber: number, winnerName: string, prizeDescription: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Complete - Winner Announced</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .content { padding: 40px 30px; }
    .winner-announcement { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .winning-details { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .cta-button { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0; }
    .footer { background-color: #1e293b; color: white; padding: 30px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 Game Complete!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${gameName} - Winner Has Been Selected</p>
    </div>
    
    <div class="content">
      <h2 style="color: #1e293b;">Hi ${userName},</h2>
      <p style="color: #374151; font-size: 16px;">The game <strong>${gameName}</strong> has completed with all numbers sold! Here are the final results:</p>
      
      <div class="winner-announcement">
        <h3 style="color: #92400e; margin-top: 0;">🏆 Winner Announced!</h3>
        <p style="color: #78350f; font-size: 18px; margin: 15px 0;"><strong>${winnerName}</strong> won with lucky number <strong>#${winningNumber}</strong>!</p>
        <p style="color: #78350f; margin: 10px 0;">Prize: <strong>${prizeDescription}</strong></p>
      </div>
      
      <div class="winning-details">
        <h3 style="color: #1e293b; margin-top: 0;">🎯 Game Summary</h3>
        <p style="color: #374151; margin-bottom: 10px;"><strong>Game:</strong> ${gameName}</p>
        <p style="color: #374151; margin-bottom: 10px;"><strong>Winning Number:</strong> #${winningNumber}</p>
        <p style="color: #374151; margin-bottom: 10px;"><strong>Winner:</strong> ${winnerName}</p>
        <p style="color: #374151; margin-bottom: 0;"><strong>Status:</strong> <span style="color: #059669;">Game Complete ✅</span></p>
      </div>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #0369a1; margin-top: 0;">🚀 Ready for the Next Game?</h3>
        <p style="color: #374151; margin-bottom: 15px;">Thank you for participating! Check out our other exciting games and try your luck again.</p>
        <div style="text-align: center;">
          <a href="https://hittheroadjackpot.com/games" class="cta-button">Play More Games</a>
        </div>
      </div>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Didn't win this time?</strong> Don't worry! We have more exciting games with amazing prizes. Your next win could be just one spin away!</p>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Hit The Road Jackpot Team</strong></p>
      <p>Thank you for playing with us. More exciting games are waiting for you!</p>
      <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">This game has been completed and the winner has been notified. Good luck in future games!</p>
    </div>
  </div>
</body>
</html>`;
  }
}

export const emailService = new ResendEmailService();