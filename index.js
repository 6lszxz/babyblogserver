// express操作
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
const port = 3636;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// 数据库操作
// title content id createTime
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('blogs.db');

app.get('/test',(req,res)=>{
    res.send('111');
})

app.get('/getABlog', (req, res)=>{
    const sqlText = `SELECT * FROM blogs ORDER BY RANDOM() limit 1`
    let result;
    db.all(sqlText,(err, rows)=>{
        result = rows[0];
        res.send(JSON.stringify(result));
    });
})

app.post('/updateBlog',(req, res)=>{
    const blog = req.body;
    const getIsExistText = `SELECT * FROM blogs where id = ${blog.id}`
    let sqlText;
    db.all(getIsExistText,(err, rows)=>{
        if(rows.length===0){
            sqlText = `INSERT INTO blogs VALUES ("${blog.title}", "${blog.content}", "${blog.id}", "${blog.createTime}")`
        }else {
            sqlText = `UPDATE blogs SET content = "${blog.content}" WHERE id = "${blog.id}"`;
        }
        db.run(sqlText)
        res.send(`blog has been sent with ${sqlText}`);
    })
})

app.listen(port, () => {
    console.log(`Example app listening on localhost:${port}`)
})