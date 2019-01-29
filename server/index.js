const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const request = require('request');
const flash = require('connect-flash');

const app = express();

// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', 'server/views')

//Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

//Connect-Flash middelware
app.use(flash());

app.get('/', (req, res) => {
    res.render('contact')
})

app.get('/send', (req, res) => {
    res.render('send')
})

app.post('/send', (req, res) => {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
    {
      return res.render('send', { messages: req.flash('Please select captcha first.') });//redirect('back', {msgClass: "error", error: "Please select captcha first."})
    }
    const secretKey = "6LdanDcUAAAAANmMBslXEGJ08du_D9odhpMkjdBY";
  
    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  
    request(verificationURL,function(error,response,body) {
      body = JSON.parse(body);
  
      if(body.success !== undefined && !body.success) {
        return res.render('send', { messages: req.flash("Failed captcha verification."})
      }
      const output = `
        <p>You have a new contact request</p>
        <h3>Contact Details</h3>
        <ul>
            <li>Name: ${req.body.name}</li>
            <li>Budget: ${req.body.company}</li>
            <li>Email: ${req.body.email}</li>
            <li>Phone: ${req.body.phone}</li>
            <li>Usage: ${req.body.usage}</li>
            <li>Location: ${req.body.location}</li>
        </ul>
        <h3>Message</h3>
        <p>${req.body.message}</p>
    `;

    async function main(){

        let account = await nodemailer.createTestAccount();
      
        let transporter = nodemailer.createTransport({
            host: "mail.easyup.co.za",
            port: 465,
            secure: true,
            auth: {
              user: 'admin@easyup.co.za',
              pass: 'tvS1@xsO}S*~'
            }
          });
      
        let mailOptions = {
            from: '"EasyUPgrade Contact Form" <admin@easyup.co.za>',
            to: "admin@easyup.co.za",
            subject: "Upgrade request",
            text: "Hello world?",
            html: output
          };
      
        let info = await transporter.sendMail(mailOptions)
      
        console.log("Message sent: %s", info.messageId);
        res.render('send', {msgClass: "success", msg: "Email has been sent"});
        
      }
      
      main().catch(console.error);
    });
  });

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server started on ${port}`))