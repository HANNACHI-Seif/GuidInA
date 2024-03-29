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

async function sendConfirmationEmail(
email: string,
username: string,
confirmation_link: string
) {
const template = await fs.readFile("./confirmation_email.html", "utf-8");
const compiledTemplate = handlebars.compile(template);

const html = compiledTemplate({
    username,
    confirmation_link,
});

const mailOptions = {
    from: "enterprise email here",
    to: email,
    subject: "email confirmation",
    html,
};

await transporter.sendMail(mailOptions);
}

export default sendConfirmationEmail