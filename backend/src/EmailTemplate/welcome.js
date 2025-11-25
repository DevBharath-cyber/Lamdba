import fs from "fs";
import handlebars from "handlebars";
import dotenv from 'dotenv';
dotenv.config();

const templatePath = "../EmailTemplate/welcome.html";

// Load template
const source = fs.readFileSync(templatePath,"utf8");

// Compile template
const template = handlebars.compile(source);

// Replace variables
const htmlContent = template({
  name: newUser.fname,
  verifyUrl: `${process.env.CLIENT_URL}verifyemail/${encodeURIComponent(newUser.email)}`
});



export default htmlContent;