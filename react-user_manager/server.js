const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const multer = require('multer');
const upload = multer({dest:'./upload'});

const connection = mysql.createConnection({
   host: conf.host,
   user: conf.user,
   password: conf.password,
   port: conf.port,
   database: conf.database
});

connection.connect();

app.get('/api/customers', (req, res) => {
    connection.query(
        'select * from CUSTOMER where isDeleted = 0',
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

app.use('/image', express.static('./upload'));

app.post('/api/customers', upload.single('image'), (req, res) => {

    const sql = 'insert into CUSTOMER values (null, ?, ?, ?, ?, ?, now(), 0)';
    const image = '/image/' + req.file.filename;
    const name = req.body.name;
    const birthday = req.body.birthday;
    const gender = req.body.gender;
    const job = req.body.job;
    const params = [image, name, birthday, gender, job];

    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});

app.delete('/api/customers/:id', (req, res) => {
    const sql = 'update CUSTOMER set isDeleted = 1 where id = ?';
    const params = [req.params.id];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

