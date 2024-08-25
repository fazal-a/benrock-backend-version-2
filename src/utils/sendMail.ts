import sgMail from "@sendgrid/mail";
import * as process from "node:process";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
console.log("process.env.SENDGRID_API_KEY::", process.env.SENDGRID_API_KEY)
console.log("process.env.FROM_EMIAL::", process.env.FROM_EMIAL)

export const sendMail = async (email: string, subject: string, textMessage: string, htmlContent: string) => {
    try {
        const msg = {
            to: email,
            from: process.env.FROM_EMIAL || "",
            subject: subject,
            text: textMessage,
            html: htmlContent,
        }
        await sgMail.send(msg);

        console.log("Email sent successfully");
    } catch (err) {
        console.error("Error sending email:", err);
        throw err;
    }
};