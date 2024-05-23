require("dotenv").config();
let authToken = process.env.AUTH;
let accountSid = process.env.SID;
let phone = process.env.PHONE;
let DB = process.env.DBURL;

const mongoose = require('mongoose');
const { birthday } = require("./messages/birthday");
const Message = require("../Schema/messages");

const client = require('twilio')(accountSid, authToken);

// Connect to the database
mongoose.connect(DB)
    .then(() => {
        console.log("Connected to the database");
        main();
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });

async function send_message(body, to, reason) {
    try {
        const message = await client.messages.create({
            body: body,
            from: phone,
            to: `+91${to}`
        });

        const record = new Message({
            phone: to,
            sid: message.sid,
            message: body,
            time: new Date(),
            reason: reason
        });

        await record.save();
    } catch (error) {
        console.error("Error sending message:", error);
    }
}



async function dob() {
    try {
        const users = await birthday();

        for (let user of users) {
            let message = `Hi ${user.NAME}!

Wishing you a fantastic birthday filled with joy and happiness! 🎂✨ We hope your day is as special as you are.
            
Best wishes,
Titanfitnessstudio`;
            await send_message(message, user.PHONE, 'birthday wish');
        }
    } catch (error) {
        console.error("Error in dob function:", error);
    }
}

async function main() {
    await dob();
    mongoose.connection.close().then(() => {
        console.log("Database connection closed");
        process.exit(0); // Ensure the process exits
    });
}
