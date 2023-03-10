// express操作
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const {request} = require("express");

const app = express();
const port = 3636;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser('username'));
app.use(session({
    name: 'username',
    secret: 'keyboard cat',
    resave: false,
    cookie:{
        httpOnly: true,
        maxAge: 1000*30,
    },
    saveUninitialized: true,
}))
// const rawParser = bodyParser.raw();

const regexp = /"/gm;

// 数据库操作，表名字为blogs
// title content id createTime authorId
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('blogs.db');

function decodeUnicode(str) {
    return unescape(str.replace(/\\u/gi, '%u'))
 }

app.get('/test',(req,res)=>{
    res.send('111');
})

app.get('/getABlog', (req, res)=>{
    const sqlText = `SELECT * FROM blogs ORDER BY RANDOM() limit 1`;
    let result;
    db.all(sqlText,(err, rows)=>{
        result = rows[0];
        result.title = decodeUnicode(result.title);
        result.content = decodeUnicode(result.content);
        res.send(JSON.stringify(result));
    });
})

app.post('/getBlogByUsername',(req, res)=>{
    const data = req.body;
    const sqlText = `SELECT * FROM blogs WHERE authorId = "${data.username}"`
    db.all(sqlText,(err, rows)=>{
        const size = rows.length;
        for(let i= 0 ;i<size;i++){
            rows[i].title = decodeUnicode(rows[i].title);
            rows[i].content = decodeUnicode(rows[i].content);
        }
        res.send(JSON.stringify(rows));
    })
})

app.post('/updateBlog',(req, res)=>{
    const blog = req.body;
    const getIsExistText = `SELECT * FROM blogs where id = ${blog.id}`
    let sqlText;
    db.all(getIsExistText,(err, rows)=>{
        if(rows.length===0){
            sqlText = `INSERT INTO blogs VALUES ("${blog.title}", "${blog.content}", "${blog.id}", "${blog.createTime}","${blog.authorId}")`
        }else {
            sqlText = `UPDATE blogs SET content = "${blog.content}" ,title="${blog.title}" WHERE id = "${blog.id}"`;
        }
        db.run(sqlText)
        res.send(`blog has been sent with ${sqlText}`);
    })
})

app.post('/deleteBlog',(req, res)=>{
    const id = req.body.id;
    const sqlText = `DELETE FROM blogs WHERE id= "${id}"`;
    db.run(sqlText);
    res.send(`blog has been deleted successfully`);
})

// 用户数据Data，表名称为userdata
// 数据为 username password
app.post('/register',(req, res)=>{
    const data = req.body;
    const getIsExistText = `SELECT * FROM userdata where username = "${data.username}"`;
    db.all(getIsExistText,(err, rows)=>{
        if(err){
            console.log(err);
        }
        if(rows.length>0){
            res.send(`username ${data.username} has been registered`);
        }else {
            const sqlText = `INSERT INTO userdata VALUES ("${data.username}","${data.password}")`;
            db.run(sqlText);
            res.send(`user data created with ${sqlText}`);
        }
    })
})

app.post('/login',(req, res)=>{
    const data = req.body;
    let session;
    const getIsExistText = `SELECT * FROM userdata WHERE username ="${data.username}"`;
    db.all(getIsExistText,(err,rows)=>{
        if(rows.length===0){
            res.send('invalid userId')
        }else if(rows[0].password !== data.password){
            res.send('wrong password!')
        }else {
            session = req.session;
            session.username = data.username;
            res.send('login successfully')
        }
    })
})

app.get('/getSession',(req, res)=>{
    res.send(req.session.username);
})

app.listen(port, () => {
    console.log(`Example app listening on localhost:${port}`)
})