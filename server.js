const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const util = require('util');
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
const query = util.promisify(connection.query).bind(connection);

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

app.post('/userLogin', async (req, res) => {
  let {email, pass} = req.body;
  pass = makeHash(pass);
  let isVerified = await handleUser(email, pass);
  let results = await query(`select * from user where email=${mysql.escape(email)} and pass=${mysql.escape(pass)};`);
  let userObj = results[0];
  if (isVerified) {
    let {email, pass, id} = userObj;
    res.cookie('accessToken', cipher.encrypt({email, pass, id}));
    res.redirect('/user/home/home.html');
  }
  else {
    res.redirect('/');
  }
});

app.post('/register', async (req, res) => {
  let {name, email, pass} = req.body;
  pass = makeHash(pass);
  let userAlreadyExists = await doesUserExist(name, email, pass);
  if (userAlreadyExists) {
    res.send({repeat: true});
    return;
  }
  await addPendingUser(name, email, pass);
  res.send({success: true});
});

app.get('/user-book-library', async (req, res) => {
  let isVerified = await authorizeUser(req.cookies.accessToken);
  let userId = cipher.decrypt(req.cookies.accessToken).id;
  if (isVerified) {
    const results = await query(`select * from book;`)
    let resData = [];
    for(let result of results) {
      let {id, title, author, publisher, info, pages, available} = result;
      let inCurrentlyIssued = await query(`select * from currently_issued where book=${mysql.escape(id)} and bearer=${mysql.escape(userId)}`);
      if (inCurrentlyIssued.length > 0) continue;
      let inTransaction = await query(`select * from transaction where book=${mysql.escape(id)}`);
      let requested = inTransaction.length > 0;
      resData.push({id, title, author, publisher, info, pages, available, requested});
    }
    res.send({arr: resData});
  }
  else {
    res.send({msg: 'access denied'});
  } 
});

app.get('/user-books-data-their', async (req, res) => {
  let isVerified = await authorizeUser(req.cookies.accessToken);
  if (isVerified) {
    let userId = cipher.decrypt(req.cookies.accessToken).id;
    userId = mysql.escape(userId);
    let results = await query(`select * from currently_issued where bearer=${userId};`); 
    let resData = [];
    for(let result of results) {
      let bookId = mysql.escape(result.book);
      let timeIssued = result.time_issued;
      let bookData = await query(`select * from book where id=${bookId};`);
      let {id, title, author, publisher, info, pages, available} = bookData;
      resData.push({id, title, author, publisher, info, pages, available, timeIssued});
    }
    res.send({arr: resData});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

app.post('/request-checkout', async (req, res) => {
  let isVerified = await authorizeUser(req.cookies.accessToken);
  if (isVerified) {
    let requestee = cipher.decrypt(req.cookies.accessToken).id;
    let {book} = req.body;

    requestee = mysql.escape(requestee);
    book = mysql.escape(book);
    
    await query(`insert into transaction (book, requestee) values (${book}, ${requestee});`);
    res.send({success: true});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

app.get('/authorize-user', async (req, res) => {
  let isVerified = await authorizeUser(req.cookies.accessToken);
  res.send({authorized: isVerified});
});


async function authorizeUser(token) {
  if (!token) return false;

  let decryptedObj;
  try {
    decryptedObj = cipher.decrypt(token);
  } 
  catch (excp) {
    return false;
  }

  console.log(decryptedObj);
  let {email, pass} = decryptedObj;
  return handleUser(email, pass);
}

async function handleUser(email, pass) {
  email = mysql.escape(email);
  pass = mysql.escape(pass);

  const results = await query(`select * from user where email=${email} and pass=${pass};`);
  return results.length > 0;
}



// admin stuff //

app.get('/admin', (req, res) => {
  res.redirect('/admin/login/login.html');
});

app.post('/adminLogin', async (req, res) => {
  let {email, pass} = req.body;
  pass = makeHash(pass);
  let creds = {email, pass};
  let isAdmin = await handleAdmin(email, pass);
  if (isAdmin) {
    res.cookie('accessToken', cipher.encrypt(creds));
    res.redirect('/admin/dashboard/dashboard.html');
  }
  else {
    res.send('access denied');
  }
});

app.get('/books-data', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  if (isAdmin) {
    const results = await query(`select * from book;`)
    let resData = [];
    for(let result of results) {
      let {id, title, author, publisher, info, pages, total, available} = result;
      resData.push({id, title, author, publisher, info, pages, total, available});
    }
    res.send({arr: resData});
  }
  else {
    res.send({msg: 'access denied'});
  } 
});

app.post('/edit-book-data', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  if (isAdmin) {
    let {id, title, author, publisher, pages, total, available} = req.body;
    await query(
      `
      update book

      set title = ${mysql.escape(title)}, 
      author = ${mysql.escape(author)},
      publisher = ${mysql.escape(publisher)},
      pages = ${mysql.escape(pages)},
      total = ${mysql.escape(total)},
      available = ${mysql.escape(available)}

      where id = ${mysql.escape(id)};
      `
    );
    res.send({success: true});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

app.get('/authorize-admin', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  res.send({authorized: isAdmin});
});

app.get('/pending-requests', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  if (isAdmin) {
    const results = await query(`select * from user where active=false;`);
    let resData = [];
    for(let result of results) {
      let {email, name} = result;
      resData.push({email, name});
    }
    res.send({arr: resData});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

app.post('/approve-registration-request', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  if (isAdmin) {
    let {name, email} = req.body;
    name = mysql.escape(name);
    email = mysql.escape(email);
    await query(`update user set active=true where name=${name} and email=${email};`);
    res.send({success: true});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

app.post('/reject-registration-request', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  if (isAdmin) {
    let {name, email} = req.body;
    name = mysql.escape(name);
    email = mysql.escape(email);
    await query(`delete from user where name=${name} and email=${email} and active=false;`);
    res.send({success: true});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

app.get('/pending-checkouts', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  if (isAdmin) {
    const results = await query(`select * from transaction;`);
    let resData = [];
    for(let result of results) {
      let {book, requestee, id} = result;
      book = mysql.escape(book);
      requestee = mysql.escape(requestee);

      let userData = await query(`select * from user where id=${requestee};`);
      let bookData = await query(`select * from book where id=${book};`);

      userData = userData[0];
      bookData = bookData[0];

      let objData = {
        id: id,

        user: {
          name: userData.name,
          email: userData.email,
          id: userData.id,
        },

        book: {
          title: bookData.title,
          id: bookData.id,
        },
      }

      resData.push(objData);
    }
    res.send({arr: resData});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

app.post('/approve-checkout-request', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  if (isAdmin) {
    let {id, requestee, book} = req.body;

    id = mysql.escape(id);
    requestee = mysql.escape(requestee);
    book = mysql.escape(book);
    let timestamp = mysql.escape(Date.now());

    await query(`insert into currently_issued (bearer, book, time_issued) values (${requestee}, ${book}, ${timestamp});`)
    await query(`delete from transaction where id=${id};`);

    res.send({success: true});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

app.post('/reject-checkout-request', async (req, res) => {
  let isAdmin = await authorizeAdmin(req.cookies.accessToken);
  if (isAdmin) {
    let {id} = req.body;
    id = mysql.escape(id);
    await query(`delete from transaction where id=${id};`);
    res.send({success: true});
  }
  else {
    res.send({msg: 'access denied'});
  }
});

async function authorizeAdmin(token) {
  if (!token) return false;

  let decryptedObj;
  try {
    decryptedObj = cipher.decrypt(token);
  } 
  catch (excp) {
    return false;
  }

  let {email, pass} = decryptedObj;
  return handleAdmin(email, pass);
}

async function handleAdmin(email, pass) {
  email = mysql.escape(email);
  pass = mysql.escape(pass);

  const results = await query(`select * from admin where email=${email} and pass=${pass};`);
  return results.length > 0;
}


async function doesUserExist(name, email, pass) {
  name = mysql.escape(name);
  email = mysql.escape(email);
  pass = mysql.escape(pass);

  const results = await query(`select * from user where name=${name} and email=${email} and pass=${pass};`);
  return results.length > 0;
}

async function addPendingUser(name, email, pass) {
  name = mysql.escape(name);
  email = mysql.escape(email);
  pass = mysql.escape(pass);

  await query(`insert into user (email, name, pass, active) values (${email},${name},${pass},false);`);
}


