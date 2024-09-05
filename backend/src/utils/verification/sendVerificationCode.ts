import nodemailer from "nodemailer"
import User from "../../interfaces/User"
import path from 'path'

console.log(process.env.APP_PASSWORD);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "ehabsmh3@gmail.com",
    pass: process.env.APP_PASSWORD,
  }
})

export default async function sendVerificationCode(newUser: any) {
  const info = await transporter.sendMail({
    from: "Fashionova 👕 <ehabsmh3@gmail.com>",
    to: newUser.email,
    subject: `Hello ${newUser.fullName}`,
    html: `
      <!DOCTYPE html>
        <html lang="en">
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
              }

              .c-email {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #dddddd;
                border-radius: 5px;
              }

              .c-email__header {
                background-color: #007bff;
                padding: 20px;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                text-align: center;
              }

              .c-email__header__title {
                font-size: 24px;
                margin: 0;
                color: #ffffff;
              }

              .c-email__content {
                padding: 20px;
              }

              .c-email__content__text {
                font-size: 16px;
                color: #333333;
                line-height: 1.5;
              }

              .c-email__code {
                font-size: 32px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
                color: #007bff;
                border: 2px dashed #007bff;
                padding: 10px;
                border-radius: 5px;
              }

              .text-italic {
                font-style: italic;
              }

              .opacity-30 {
                opacity: 0.7;
              }

              .text-title {
                font-size: 18px;
                font-weight: bold;
                color: #007bff;
              }

              .mb-0 {
                margin-bottom: 0;
              }

              .c-email__footer {
                background-color: #f4f4f4;
                padding: 10px;
                text-align: center;
                font-size: 12px;
                color: #999999;
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
              }
            </style>

          </head>
          <body>
            <div class="c-email">  
              <div class="c-email__header">
                <h1 class="c-email__header__title">Your Verification Code</h1>
              </div>
              <div class="c-email__content">
                <p class="c-email__content__text text-title">
                  Enter this verification code in field:
                </p>
              <div class="c-email__code">
                <span class="c-email__code__text">${newUser.verificationCode}</span>
              </div>
              <p class="c-email__content__text text-italic opacity-30 text-title mb-0">
                Verification code is valid only for 30 minutes
              </p>
              </div>
              <div class="c-email__footer"></div>
            </div>
          </body>
        </html>`
  })
}
