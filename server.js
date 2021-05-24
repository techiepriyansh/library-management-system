const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
require('dotenv').config();

const { ObjectCipher, makeHash } = require('./cipher.js');

const app = express();
app.use(express.static(__dirname + "/client"));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());

const connection = mysql.createConnection({
  host: process.env.MySQL_HOST,
  user: process.env.MySQL_USER,
  password: process.env.MySQL_PASSWORD,
  database: process.env.MySQL_DATABASE,
});
connection.connect();

const listener = app.listen(process.env.PORT, () => {
  console.log("We are listening on " + listener.address().port);
});

// encryption init //

const algo = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY;
const cipher = new ObjectCipher(algo, secretKey);

// user stuff //

app.get('/', (req, res) => {
  res.redirect('/user/login/login.html');
});

app.post('/userLogin', (req, res) => {
  let {email, pass} = req.body;
  res.redirect('/');
});

app.post('/register', (req, res) => {
  let {name, email, pass} = req.body;
  pass = makeHash(pass);
  if (doesUserExist(name, email, pass)) {
    res.send({repeat: true});
    return;
  }
  addPendingUser(name, email, pass);
  res.send({success: true});
});


// admin stuff //

app.get('/admin', (req, res) => {
  res.redirect('/admin/login/login.html');
});

app.post('/adminLogin', (req, res) => {
  let {email, pass} = req.body;
  pass = makeHash(pass);
  let creds = {email, pass};
  handleAdmin(email, pass, (isAdmin) => {
    if (isAdmin) {
      res.cookie('accessToken', cipher.encrypt(creds));
      res.redirect('/admin/dashboard/dashboard.html');
    }
    else {
      res.send('access denied');
    }
  }); 
});

app.get('/books-data', (req, res) => {
  onAuthorizeAdmin(req.cookies.accessToken, (isAdmin) => {
    if (isAdmin) {
      connection.query(`select * from book;`, 
        (error, results, fields) => {
          if(error) {
            console.log(error);
            res.send({msg: 'error'});
          }
          else {
            let resData = [];
            for(let result of results) {
              let {id, title, author, publisher, info, pages, total, available} = result;
              resData.push({id, title, author, publisher, info, pages, total, available});
            }
            res.send({arr: resData});
          }
        }
      );
    }
    else {
      res.send({msg: 'error'});
    }
  });
});

app.post('/edit-book-data', (req, res) => {
  onAuthorizeAdmin(req.cookies.accessToken, (isAdmin) => {
    if (isAdmin) {
      let {id, title, author, publisher, pages, total, available} = req.body;
      connection.query(
        `
        update book
        
        set title = ${mysql.escape(title)}, 
        author = ${mysql.escape(author)},
        publisher = ${mysql.escape(publisher)},
        pages = ${mysql.escape(pages)},
        total = ${mysql.escape(total)},
        available = ${mysql.escape(available)}

        where id = ${mysql.escape(id)};
        `,
        (error, results, fields) => {
          if (error) {
            console.log(error);
            res.send({success: false});
          }
          else {
            res.send({success: true});
          }
        }
      )
    }
    else {
      res.send({msg: 'error'});
    }
  });
});

app.get('/authorize-admin', (req, res) => {
  onAuthorizeAdmin(req.cookies.accessToken, (isAdmin) => {
    res.send({authorized: isAdmin});
  });
});

app.get('/pending-requests', (req, res) => {
  onAuthorizeAdmin(req.cookies.accessToken, (isAdmin) => {
    if (isAdmin) {
      connection.query(`select * from user where active=false;`,
        (error, results, fields) => {
          if (error) {
            console.log(error);
            res.send({msg: 'error'});
          }
          else {
            let resData = [];
            for(let result of results) {
              let {email, name} = result;
              resData.push({email, name});
            }
            res.send({arr: resData});
          }

        }
      );
    }
    else {
      res.send({msg: 'access denied'});
    }
  });

});

app.post('/approve-registration-request', (req, res) => {
  onAuthorizeAdmin(req.cookies.accessToken, (isAdmin) => {
    if (isAdmin) {
      let {name, email} = req.body;
      name = mysql.escape(name);
      email = mysql.escape(email);
      connection.query(`update user set active=true where name=${name} and email=${email};`, 
        (error, results, fields) => {
          if (error) {
            res.send({success: false});
            console.log(error);
          }
          else {
            res.send({success: true});
          }
        }
      );
    }
    else {
      res.send({msg: 'access denied'});
    }
  });
});

app.post('/reject-registration-request', (req, res) => {
  onAuthorizeAdmin(req.cookies.accessToken, (isAdmin) => {
    if (isAdmin) {
      let {name, email} = req.body;
      name = mysql.escape(name);
      email = mysql.escape(email);
      connection.query(`delete from user where name=${name} and email=${email} and active=false;`, 
        (error, results, fields) => {
          if (error) {
            res.send({success: false});
            console.log(error);
          }
          else {
            res.send({success: true});
          }
        }
      );
    }
    else {
      res.send({msg: 'access denied'});
    }
  });
});

function onAuthorizeAdmin(token, callback) {
  if (!token) return callback(false);
  let {email, pass} = cipher.decrypt(token);
  handleAdmin(email, pass, callback);
}

function handleAdmin(email, pass, callback) {
  email = mysql.escape(email);
  pass = mysql.escape(pass);
  connection.query(`select * from admin where email=${email} and pass=${pass};`, 
    (error, results, fields) => {
      if (error) {
        console.log(error);
        callback(false);
      } 
      else {
        if (results.length > 0) {
          callback(true);

        }
        else {
          callback(false);
        }
      }
    }
  );
}

function doesUserExist(name, email, pass) {
  name = mysql.escape(name);
  email = mysql.escape(email);
  pass = mysql.escape(pass);
  connection.query(`select * from user where name=${name} and email=${email} and pass=${pass};`, 
    (error, results, fields) => {
      if (error){
        console.log(error);
        return true;
      }
      else {
        return results.length > 0;
      }
    }
  );
}

function addPendingUser(name, email, pass) {
  name = mysql.escape(name);
  email = mysql.escape(email);
  pass = mysql.escape(pass);

  connection.query(`insert into user (email, name, pass, active) values (${email},${name},${pass},false);`,
    (error, results, fields) => {
      if (error) {
        console.log(error);
        ok = false;
      }
    }
  );
}


