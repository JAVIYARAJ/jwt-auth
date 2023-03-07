const mysql=require('mysql2');

const conn=mysql.createConnection({
    "user":"root",
    "host":"localhost",
    "password":"root",
    "port":3306,
    "database":"practice"
});

conn.connect(()=>{
    console.log("Database connect Successfully.")
})

module.exports=conn;