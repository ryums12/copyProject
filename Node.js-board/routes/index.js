var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '1234',
	database: 'note'
});

connection.connect();
/* GET home page. */
router.get('/', function (req, res, next) {
	console.log(JSON.stringify(req.session));
	var sql = "SELECT b_no,b_title, user.name AS NAME, DATE_FORMAT((b_time),'%Y-%m-%d') AS b_time FROM board LEFT JOIN user ON board.b_writer = user.NO ORDER BY b_no DESC";
	connection.query(sql, function (err, result) {
		if (err) {
			return done(err);
		}
		console.log(result);
		if (req.session.passport !== undefined) {
			if (req.session.passport.user !== undefined) {
				//로그인 사용자
				console.log("ㅡㅡㅡㅡ");
				console.log(req.session);
				console.log("ㅡㅡㅡㅡ");
				res.render('index', {
					title: 'Nodejs',
					session: req.session.passport,
					notes: result
				});
			} else {
				//로그아웃 사용자
				res.render('index', {
					title: 'Nodejs',
					session: {},
					notes: result
				});
			}
		} else {
			//처음 방분한 사용자
			res.render('index', {
				title: 'Nodejs',
				session: {},
				notes: result
			});
		}
	});

});


module.exports = router;
