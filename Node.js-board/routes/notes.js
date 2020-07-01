var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '1234',
	database: 'note'
});
connection.connect();

router.get('/', function (req, res, next) {
	if (req.session.passport !== undefined) {
		if (req.session.passport.user !== undefined) {
			//로그인 한 사용자
			res.render('write', {
				title: 'MyBoard',
				session: req.session.passport
			});
		} else {
			res.redirect('/');
		}
	} else {
		res.redirect('/');
	}
});


//글 조회
router.get('/:no', function (req, res, next) {
	var no = req.params.no;
	var sql = "SELECT b_no,b_writer, b_title, b_content,user.name AS name, DATE_FORMAT((b_time),'%Y-%m-%d') AS b_time FROM board  LEFT JOIN user ON board.b_writer = user.NO where b_no = ? ORDER BY b_no DESC";
	connection.query(sql, no, function (err, rows) {
		if (err) {
			throw err;
		}
		if (rows.length == 1) {
			if (req.session.passport !== undefined) {
				if (req.session.passport.user !== undefined) {
					res.render('detail', {
						title: 'Nodejs',
						session: req.session.passport,
						note: rows[0]
					});
				} else {
					res.render('detail', {
						title: 'Nodejs',
						session: {},
						note: rows[0]
					});
				}
			} else {
				res.render('detail', {
					title: 'Nodejs',
					session: {},
					note: rows[0]
				});
			}
		} else {
			console.log(err);
			res.redirect('/');
		}
	})
});


// 글 삽입
router.post('/', function (req, res, next) {
	var title = req.body.title;
	var content = req.body.content;
	var writer_no = req.user.no;

	var datas = [writer_no, title, content];

	var sql = "insert into board (b_writer, b_title, b_content) VALUES (?,?,?);"

	var query = connection.query(sql, datas, function (err, rows) {
		if (err) {
			throw err;
		}
		var id = rows.insertId;
		res.redirect('/notes/' + id);
	});
});



// 글 수정
router.get('/update/:no', function (req, res, next) {
	var no = req.params.no;
	var sql = "select * from board where b_no = ?";
	connection.query(sql, no, function (err, rows) {
		if (err) {
			throw err;
		}
		if (rows.length == 1) {
			if (req.session.passport !== undefined) {
				if (req.session.passport.user !== undefined) {
					//로그인 한 사용자
					res.render('update', {
						title: 'MyBoard',
						session: req.session.passport,
						note: JSON.stringify(rows[0])
					});
				} else {
					res.redirect('/');
				}
			} else {
				res.redirect('/');
			}
		} else {
			res.redirect('/');
		}
	});
});
// 글 수정 작업
router.post('/update/:no', function (req, res, next) {
	var note_no = req.params.no;
	var title = req.body.title;
	var content = req.body.content;
	var datas = [title, content, note_no];
	var sql = "update board set b_title = ?, b_content = ? where b_no = ?";
	var query = connection.query(sql, datas, function (err, rows) {
		if (err) {
			throw err;
		}
		var id = rows.insertId;
		res.redirect('/notes/' + id);
	});
});

// 글 삭제
router.post('/delete/:no', function(req, res, next) {
	var no = req.params.no;
    var sql = "delete from board where b_no = ?";
    var query = connection.query(sql, no, function (err, rows) {
        if (err) {
            throw err;
        }
        res.redirect('/');
    });
});

module.exports = router;
