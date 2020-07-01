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

router.get('/', function (req, res) {
	var sql = "select * from user;";
	var query = connection.query(sql, function (err, rows) {
		if (err) {
			throw err;
		}
		console.log(rows[0].id);
		res.render('users', {
			users: rows
		});

	});
});

router.get('/signup', function (req, res, next) {
	if (req.session.passport !== undefined) {
		if (req.session.passport.user !== undefined) {
			//로그인 한 사용자
			res.redirect('/');
		} else {
			//로그아웃 한 사용자
			res.render('signup', {
				title: 'MyBoard',
				session: {}
			});
		}
	} else {
		//처음 방문한 사용자
		res.render('signup', {
			title: 'MyBoard',
			session: {}
		});
	}
});


router.post('/signup', function (req, res) {
	var id = req.body.id;
	var password = req.body.password;
	var hashpass = crypto.createHash("sha512").update(password).digest("hex");
	var name = req.body.name;
	var email = req.body.email;
	var address = req.body.address;
	var datas = [id, hashpass, name, email, address];
	var sql = "insert into user (id, password, name, email, address) values (?,?,?,?,?)";
	var query = connection.query(sql, datas, function (err, rows) {
		if (err) {
			throw err;
		}
		console.log("Data inserted!");
		res.redirect('/users');
	});
})


var cookieParser = require('cookie-parser');
router.get('/', function (req, res, next) {
	res.cookie('test', 'testCookie');
	res.render('index', {
		title: 'Express'
	});
});


passport.serializeUser(function (user, done) {
	done(null, user);
});

/*인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어옴.*/
passport.deserializeUser(function (user, done) {
	done(null, user);
});

passport.use(new LocalStrategy({
	usernameField: 'id',
	passwordField: 'password',
	session: true,
	passReqToCallback: true
}, function (req, id, password, done) {
	connection.query('select * from `user` where `id` = ?', id, function (err, result) {
		if (err) {
			console.log('err :' + err);
			return done(false, null);
		} else {
			if (result.length === 0) {
				console.log('해당 유저가 없습니다');
				return done(false, null);
			} else {
				var hashpass = crypto.createHash("sha512").update(password).digest("hex");
				if (hashpass != result[0].password) {
					console.log('패스워드가 일치하지 않습니다');
					return done(false, null);
				} else {
					console.log('로그인 성공');
					return done(null, {
						id: result[0].id,
						name: result[0].name,
						no: result[0].no,
						test: 'test'
					});
				}
			}
		}
	})
}));

/* GET users listing. */
router.get('/', function (req, res) {
	var sql = "select * from user;";
	var query = connection.query(sql, function (err, rows) {
		if (err) {
			throw err;
		}
		if (req.session.passport !== undefined) {
			if (req.session.passport.user !== undefined) {
				//로그인 한 사용자
				res.render('users', {
					title: 'MyBoard',
					session: req.session.passport,
					users: rows
				});
			} else {
				res.redirect('/');
			}
		} else {
			res.redirect('/');
		}
	});
});

router.get('/login', function (req, res, next) {
	if (req.session.passport !== undefined) {
		if (req.session.passport.user !== undefined) {
			//로그인 한 사용자
			res.redirect('/');
		} else {
			res.render('login', {
				title: 'MyBoard',
				session: {}
			});
		}
	} else {
		res.render('login', {
			title: 'MyBoard',
			session: {}
		});
	}
});

router.get('/signup', function (req, res, next) {
	if (req.session.passport !== undefined) {
		if (req.session.passport.user !== undefined) {
			//로그인 한 사용자
			res.redirect('/');
		} else {
			res.render('signup', {
				title: 'MyBoard',
				session: {}
			});
		}
	} else {
		res.render('signup', {
			title: 'MyBoard',
			session: {}
		});
	}
});

router.post('/login', passport.authenticate('local', {
		failureRedirect: '/users/login',
		failureFlash: true
	}), // 인증실패시 401 리턴, {} -> 인증 스트레티지
	function (req, res) {
		res.redirect('/');
	}
);

router.get('/logout', function (req, res) {
	if (req.session.passport !== undefined) {
		if (req.session.passport.user !== undefined) {
			//로그인 한 사용자
			req.logout();
			console.log(req.session);
			res.redirect('/');
		} else {
			//로그아웃 사용자
			res.redirect('/');
		}
	} else {
		res.redirect('/');
	}
});


router.get('/kakao',
	passport.authenticate('kakao-login')
);

router.get('/oauth/kakao/callback',
	passport.authenticate('kakao-login', {
		successRedirect: '/',
		failureRedirect: '/users/login'
	})
);

passport.use('kakao-login', new KakaoStrategy({
		clientID: '6e371d2ad6eb08cc10bcd8ab14537729',
		clientSecret: 'UPcqq6acQRmwXP92quwZ7pVlLz30ireL',
		callbackURL: 'http://localhost:3000/users/oauth/kakao/callback'
	},
	function (accessToken, refreshToken, profile, done) {
		// 코드 작성
		console.log('Kakao login info');
		console.log(profile);
		var sql = "select * from user where id = ?";
		connection.query(sql, profile.id, function (err, result) {
			if (err) {
				return done(err);
			}
			var id = profile.id;
			var password = "kakao";
			var hashpass = crypto.createHash("sha512").update(password).digest("hex");
			var name = profile.username;
			var email = "kakao";
			var address = "kakao";
			var datas = [id, hashpass, name, email, address];
			if (result.length == 0) {
				//신규 유저 -> 회원가입 & 세션 저장
				var sql = "insert into user (id, password, name, email, address) values (?,?,?,?,?)";
				connection.query(sql, datas, function (err, result) {
					if (err) {
						return done(err);
					}
					return done(null, {
						id: id,
						name: name,
						no: result.insertId
					});
				});
			} else {
				//기존 가입 유저 -> 세션 저장
				console.log("기존 유저");
				return done(null, {
					id: result[0].id,
					name: result[0].name,
					no: result[0].no
				});
			}
		})
	}
));

// /* GET users listing. */
// // router.get('/', function (req, res, next) {
// //   var name = req.query.name;
// //   var num = req.query.number;
// //   // res.render('users', {name:name,number:num});
// //   res.render('users');

// // });

// var users = [{
//     id: 1,
//     name: '사람1'
//   },
//   {
//     id: 2,
//     name: '사람2'
//   },
//   {
//     id: 3,
//     name: '사람3'
//   },
//   {
//     id: 4,
//     name: '사람4'
//   },
//   {
//     id: 5,
//     name: '사람5'
//   },
//   {
//     id: 6,
//     name: '사람6'
//   },
// ]
// router.get('/', function(req, res) {
//   res.json(users)
// });
// router.get('/:id', function (req, res) {
//   var id = parseInt(req.params.id, 10);
//   if (!id)
//     return res.status(400).json({
//       error: 'Incorrect id'
//     });
//   var user = users.filter(user => user.id === id)[0]
//   if (!user)
//     return res.status(404).json({
//       error: 'Unknown user'
//     });
//   return res.json(user);
// });
// router.delete('/:id', function (req, res) {
//   var id = parseInt(req.params.id, 10);
//   if (!id)
//     return res.status(400).json({
//       error: 'Incorrect id'
//     });
//   var userIdx = users.findIndex(user => user.id === id);
//   if (!userIdx===-1)
//     return res.status(404).json({
//       error: 'Unknown user'
//     });
//     users.splice(userIdx,1);
//   return res.json(user);
// });
module.exports = router;
