import { SMTPClient } from 'emailjs'
import { TokenType } from '@prisma/client'
import nodemailer from 'nodemailer';

const client = new SMTPClient({
	user: process.env.EMAIL_APP_USER,
	password: process.env.EMAIL_APP_PASSWORD,
	host: 'smtp.gmail.com',
	ssl: true,
})

export async function sendResetPasswordEmail(email: string, resetLink: string) {
  return new Promise((resolve, reject) => {
    client.send(
      {
        text: "i hope this works",
        from: process.env.EMAIL_APP_USER as string,
        to: email,
        subject: "Reset Password",
        attachment: 
           [{ data: `
              <h1>Password Reset</h1>
              <p>Click the link to reset your password:</p>
              <a href="${resetLink}">Reset Password</a>
              <p>This link will expire in 1 hour.</p>
            `, 
            alternative: true
        }],
      },
      (err, message) => {
        if (err) reject(err)
        else resolve(message)
      }
    )
  })
}