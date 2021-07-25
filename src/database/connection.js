const DatabaseConfig = require('../config/config.json').Database;

const { createConnection } = require('mysql2/promise');
const { readFileSync } = require('fs')

module.exports.ConnectToDatabase = async function()
{
    let con;

    try 
    {
        con = await createConnection(DatabaseConfig);

        console.log("Connected to Database!");

        this.CreateNewTable(con);
    } 
    
    catch (error) 
    { 
        con = null;

        console.error(`Failed to Connect to Database! ${error}`); 
    }

    return con;
}

module.exports.CreateNewTable = async function(con)
{  
    try 
    {     
        let SQLQuery = await readFileSync(__dirname + '/db.sql').toString();

        con.execute(SQLQuery);
    } 
    
    catch (error) { console.error("Failed To Verify/Create New Table! " + error); }
}