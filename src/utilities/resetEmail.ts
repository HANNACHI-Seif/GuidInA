import nodemailer from 'nodemailer'
import handlebars from 'handlebars';
import fs from 'fs/promises'


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your email here",
      pass: "your email app password here",
    },
  });

  async function sendResetPasswordEmail(
    email: string,
    username: string,
    resetLink: string
  ) {
    const template = await fs.readFile("./resetEmail.html", "utf-8");
    const compiledTemplate = handlebars.compile(template);
  
    const html = compiledTemplate({
      username,
      resetLink,
    });
  
    const mailOptions = {
      from: "enterprise email here",
      to: email,
      subject: "Reset password",
      html,
    };
  
    await transporter.sendMail(mailOptions);
  }


export default sendResetPasswordEmail
