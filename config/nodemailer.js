import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail", // সরাসরি সার্ভিস উল্লেখ করা ভালো
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export default getTransporter;