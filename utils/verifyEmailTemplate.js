const VerificationEmail = (username, otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .otp {
        font-size: 20px;
        font-weight: bold;
        color: #ff5252;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class='container'>
    <div class="header">
    <h1>Hii ${username} please Varify Your Email Address</h1>
    </div>

    <div class="content">
    <P>Thank you for registering with Ecommerce App. please use the OTP below to
     verify your email address:</P>
    <div class="otp">${otp}</div>
    <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>

    <div class="footer">
    <p>&copy; 2025 Ecommerce App. All right reserved.</p>
    </div>
    </div>

  </body>
  </html>
  `;
};

export default VerificationEmail;
