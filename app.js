const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

    res.render('login_page');

});


app.post('/login',async (req, res) => {
    const email = req.body.email;

    const result = await queryExecurter(`SELECT * FROM practice.JWT_PRACTICE where JWT_PRACTICE.email='${email}'`)
    const user=result[0];
    
    const isPasswordCurrect=await bcrypt.compare(req.body.password,user.password);
    
    if(isPasswordCurrect){
        const token=await jwt.sign({user},process.env.JWT_SECRET);
        res.cookie('token',token);
        res.redirect('/home')
    }
});

app.post('/logout',(req,res)=>{
    res.clearCookie('token');
    res.redirect('/login');
})

app.post('/changeEmail',async(req,res)=>{
    const {name,email,userId}=req.body;
    if(name!=null && email!=null && userId!=null){
        const update_query=`UPDATE practice.JWT_PRACTICE SET name = '${name}', email = '${email}' WHERE id = ${parseInt(userId)}`;
        const result=await queryExecurter(update_query);
        res.redirect('/home');
    }else{
        res.status(400).send({"status":"failed","message":"please enter all values"});
    }

});

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

app.get('/profile',async(req,res)=>{
    const token=await req.cookies['token'];
    if(!token){
        res.redirect('/login');
    }
    else{
        const isvalid=await jwt.verify(token,process.env.JWT_SECRET);
        res.render('profile',{user:isvalid.user});
    }
})


app.get('/home',async(req,res)=>{
    const token=await req.cookies['token'];
    if(!token){
        res.redirect('/login');
    }
    else{
        const isvalid=await jwt.verify(token,process.env.JWT_SECRET);
        const userId=isvalid.user.id;
        const result = await queryExecurter(`SELECT * FROM practice.JWT_PRACTICE where JWT_PRACTICE.id='${userId}'`)
        const user=result[0];
        res.render('dashboard',{user:user});
    }
})

app.listen(3000, () => {
    console.log('server is running.');
})