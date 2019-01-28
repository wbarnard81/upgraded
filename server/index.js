const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');

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

app.get('/', (req, res) => {
    res.render('contact')
})

app.post('/send', (req, res) => {
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

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = await nodemailer.createTestAccount();
      
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "mail.easyup.co.za",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
              user: 'admin@easyup.co.za', // generated ethereal user admin@easyup.co.za
              pass: 'tvS1@xsO}S*~' // generated ethereal password tvS1@xsO}S*~
            }
          });
      
        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Upgraded Request" <admin@easyup.co.za>', // sender address
            to: "admin@easyup.co.za", // list of receivers
            subject: "Upgrade request", // Subject line
            text: "Hello world?", // plain text body
            html: output // html body
          };
      
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)
      
        console.log("Message sent: %s", info.messageId);
        res.render('contact', {msg: "Email has been sent"});
        
      }
      
      main().catch(console.error);
      
      

})

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server started on ${port}`))