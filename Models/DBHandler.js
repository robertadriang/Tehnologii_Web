
function test(){
    
    console.log("Alo")
    const mysql = require('mysql');
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'user',
      password: 'password',
      database: 'database name',
      socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
    });
    connection.connect((err) => {
      if (err) throw err;
      console.log('Connected!');
    });

    return "merge";
}

module.exports = {
    test: test
}