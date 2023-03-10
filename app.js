const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailTranspoter = require('./config/email_config.js');

const conn = require('./database/dbconnect')
const app = express();

const ejs = require('ejs');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');


app.use(bodyparser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')
require('dotenv').config();


app.get('/register', (req, res) => {
    res.render('register_page')
})

app.get('/login', (reqm, res) => {
    res.render('login_page');
})



app.post('/register', async (req, res) => {
    const user = req.body;
    if (!user.email || !user.password) {
        return res.status(400).send('username and password is not valid');
    }

    //validation
    const hash = await bcrypt.hash(user.password, 10);
    const insertQuery = await queryExecurter(`insert into practice.JWT_PRACTICE(name,email,password) values('${user.name}','${user.email}','${hash}')`);

    const token = crypto.randomBytes(32).toString('hex');

    const activationUrl = `https://example.com/activate-account/${token}`;

    let emailContent =
        `
                <h1> welcome ${user.name} </h1>
                <h4>
                please verify your account
                </h4>
                <a href="http://localhost:3000/actiivateUser/?userId=${insertQuery.insertId}">${activationUrl}</a>
                `

    let mailOptions = {
        from: 'javiyaraj4@gmail.com',
        to: user.email,
        subject: 'Authentication mail',
        html: emailContent,
    };

    emailTranspoter.sendMail(mailOptions, (err, info) => {
        if (err) {
            res.status(400).send({ "status": "failed", "message": err });
        } else {
            res.render('activate_page',{activated:false,activationUrl:activationUrl,userID:insertQuery.insertId});
        }
    })

    
});

app.post('/login', async (req, res) => {
    const email = req.body.email;

    const result = await queryExecurter(`SELECT * FROM practice.JWT_PRACTICE where JWT_PRACTICE.email='${email}' and isActivated=1`);
    const user = result[0];

    if (user != null) {
        const isPasswordCurrect = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordCurrect) {
            const token = await jwt.sign({ user }, process.env.JWT_SECRET);
            res.cookie('token', token);
            res.redirect('/home')
        }
    } else {
        res.status(400).send({ "status": "failed", "message": "user not exists." });
    }


});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
})

app.post('/changeEmail', async (req, res) => {
    const { name, email, userId } = req.body;
    if (name != null && email != null && userId != null) {
        const update_query = `UPDATE practice.JWT_PRACTICE SET name = '${name}', email = '${email}' WHERE id = ${parseInt(userId)}`;
        const result = await queryExecurter(update_query);
        res.redirect('/home');
    } else {
        res.status(400).send({ "status": "failed", "message": "please enter all values" });
    }

});

app.get('/actiivateUser', async (req, res) => {
    const userID = req.query.userId;
    const update_query = `UPDATE practice.JWT_PRACTICE SET isActivated = '1' WHERE (id = ${parseInt(userID)});`
    const result = await queryExecurter(update_query);
    res.render('activate_page', { activated: true });
})

app.get('/checkUser', async (req, res) => {
    const email = req.query.email;

    const result = await queryExecurter(`SELECT * FROM practice.JWT_PRACTICE where email='${email}'`);

    if (result.length > 0) {
        res.json({ status: false });
    } else {
        res.json({ status: true });
    }
})

const queryExecurter = (query) => {
    return new Promise((resolve, reject) => {
        conn.query(query, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    })
}

app.get('/profile', async (req, res) => {
    const token = await req.cookies['token'];
    if (!token) {
        res.redirect('/login');
    }
    else {
        const isvalid = await jwt.verify(token, process.env.JWT_SECRET);
        const userId = isvalid.user.id;
        const result = await queryExecurter(`SELECT * FROM practice.JWT_PRACTICE where JWT_PRACTICE.id='${userId}'`)
        const user = result[0];
        res.render('profile', { user: user });
    }
})


app.get('/home', async (req, res) => {
    const token = await req.cookies['token'];
    if (!token) {
        res.redirect('/login');
    }
    else {
        const isvalid = await jwt.verify(token, process.env.JWT_SECRET);
        const userId = isvalid.user.id;
        const result = await queryExecurter(`SELECT * FROM practice.JWT_PRACTICE where JWT_PRACTICE.id='${userId}'`)
        const user = result[0];
        res.render('dashboard', { user: user });
    }
})

app.listen(3000, () => {
    console.log('server is running.');
})