const fs = require('fs');
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.MySQL_HOST,
  user: process.env.MySQL_USER,
  password: process.env.MySQL_PASSWORD,
  database: process.env.MySQL_DATABASE,
});
connection.connect();

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
  console.log(queryString);
  connection.query(queryString, (error, results, fields) => {
    if(error) console.log(error);
  });
}

process.exit();
