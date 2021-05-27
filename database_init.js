const fs = require('fs');
const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const { makeHash } = require('./cipher.js');

const connection = mysql.createConnection({
  host: process.env.MySQL_HOST,
  user: process.env.MySQL_USER,
  password: process.env.MySQL_PASSWORD,
  database: process.env.MySQL_DATABASE,
  multipleStatements: true,
});
connection.connect();
const query = util.promisify(connection.query).bind(connection);

async function createTables() {
  await query(`
    create table admin (
      email varchar(255) primary key,
      pass varchar(255)
    );

    create table book (
      id int auto_increment primary key,
      title varchar(255),
      author varchar(255),
      publisher varchar(255),
      info varchar(1023),
      pages int,
      total int,
      available int
    );

    create table checkin (
      id int auto_increment primary key,
      requestee int,
      book int,
      issue_id int
    );

    create table currently_issued (
      id int auto_increment primary key,
      bearer int,
      book int,
      time_issued bigint
    );

    create table history (
      id int auto_increment primary key,
      bearer int,
      book int,
      time_issued bigint,
      time_returned bigint
    );

    create table transaction (
      id int auto_increment primary key,
      requestee int,
      book int
    );

    create table user (
      id int auto_increment primary key,
      email varchar(255),
      name varchar(255),
      pass varchar(255),
      active tinyint(1)
    );
  `
  );
}

async function addAdmin(email, pass) {
  email = mysql.escape(email);
  pass = mysql.escape(makeHash(pass));
  await query(`insert into admin (email, pass) values (${email}, ${pass});`);
}

async function addSampleBooks() {
  let obj = JSON.parse(fs.readFileSync(__dirname + '/sample_data/books.json'), 'utf8');
  console.log(obj.books[0]);

  const maxBooks = 100;

  for(let book of obj.books) {
    let {title, author, publisher, description, pages} = book;
    title = mysql.escape(title);
    author = mysql.escape(author);
    publisher = mysql.escape(publisher);
    description = mysql.escape(description);
    let total = Math.floor(Math.random()*maxBooks)+1;
    let available = Math.floor(Math.random()*total);

    let queryString = `
      insert into book (title, author, publisher, info, pages, total, available) 
      values (${title}, ${author}, ${publisher}, ${description}, ${pages}, ${total}, ${available});
    `;
    await query(queryString);
  } 
}

async function init() {
  let adminEmail = "admin@lib.com";
  let adminPass = "admin";

  let args = process.argv.slice(2);
  if (args.length == 2) {
    adminEmail = args[0];
    adminPass = args[1];
  }

  await createTables();
  await addAdmin(adminEmail, adminPass);
  await addSampleBooks();
}

init()
  .then(() => { process.exit(); })
  .catch((err) => { console.log(err); process.exit(); });

