export const createHtmlTemplate = (heading: string, message: string, token: number) => {
    return `
<html>
<head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            padding: 20px;
          }
          .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 20px auto;
          }
          h2 {
            color: #4A90E2;
          }
          p {
            color: #555;
          }
          .token {
            font-size: 24px;
            font-weight: bold;
            color: #4A90E2;
          }
          .footer {
            font-size: 12px;
            text-align: center;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${heading}</h2>
          <p>${message}</p>
          <p class="token">${token}</p>
          <p>This token is valid for only <strong>10 minutes</strong>. If you did not request this, please ignore this email and ensure your account is secure.</p>
          <p>Thank you!<br/>The Support Team</p>
          <div class="footer">
            <p>If you have any questions, reply to this email or contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
