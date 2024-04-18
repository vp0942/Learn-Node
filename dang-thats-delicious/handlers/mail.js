const nodemailer = require('nodemailer'); // Nodemailer is a module for Node.js applications to allow easy as cake email sending
const pug = require('pug'); // Pug is a templating engine for Node.js
const juice = require('juice');  // Juice is a module that inlines CSS styles in HTML
const htmlToText = require('html-to-text'); // html-to-text is a module that converts HTML to plain text
const promisify = require('es6-promisify'); // es6-promisify is a module that converts callback-based functions to Promise-based functions

// We will use the createTransport method to create a transport object
// The transport object is responsible for sending emails
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// This is a function that generates the HTML content of the email
const generateHTML = (filename, options = {}) => {
  // We use the renderFile method to render the pug template
  // We pass the options
  // __dirname is a global variable that contains the path of the current module
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  // We use the juice method to inline the CSS styles in the HTML
  const inlined = juice(html);
  return inlined;
};

// This is a function that sends an email
// It is an async function because we are using async/await
exports.send = async (options) => {
  // We use the generateHTML function to generate the HTML content of the email
  const html = generateHTML(options.filename, options);
  // We use the html-to-text module to convert the HTML to plain text
  const text = htmlToText.fromString(html);
  // We use the sendMail method to send the email
  // We pass the options object
  // The options object contains the email details
  // The from, to, subject, html, and text properties
  // The from property is the email address of the sender
  // The to property is the email address of the recipient
  // The subject property is the subject of the email
  // The html property is the HTML content of the email
  // The text property is the plain text content of the email
  const mailOptions = {
    from: `Wes Bos <${process.env.MAIL_USER}>`,
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };
  // The sendMail method is a callback-based method
  // We use the promisify method to convert it to a Promise-based method
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};