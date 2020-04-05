const fs = require('fs');
const mysql = require('mysql');
const SQLBuilder = require('json-sql-builder2');
const csvtojson = require('csvtojson');
let config = require('./config.json');
let sql;
let errorMessage;
if (config['targetFolder'] == undefined) config['targetFolder'] = "./files"; 
if (config['dumpFolder'] == undefined) config['dumpFolder'] = "./processed"; 
if (config['logsFolder'] == undefined) config['logsFolder'] = "./logs"; 
if (config['deleteAfterProcess'] == undefined) config['deleteAfterProcess'] = false;
console.log(config);
// return; 
fs.readdir(config['targetFolder'], (err, files) => {
    if(err){
        errorMessage =  '\n' + '[' + getLocalTime() + ']' + "[Error] Error occured while attempting to read the target folder.\n\n" + String(err);
        console.log(errorMessage);
        fs.appendFile(config['logsFolder'] + "/log-" + getDate() + ".txt",errorMessage,function(err){
            if(err) throw err;
            return;
        });
        return;
    }
   for(let i = 0;i < files.length;i++){
       let file = files[i];
        console.log("Processed file : " + file);
        if (file.substr(-4).toLocaleLowerCase() == '.csv'){
            let con = mysql.createConnection({
                "host": config["host"],
                "user": config["user"],
                "password": config["password"],
                "database": config["database"]
            });
        
              console.log('FILE CALLED');
            con.on('error',function(){});
            con.connect(function (err) {
                if (err) {
                    errorMessage = '\n' + '[' + getLocalTime() + ']' + "[Error] connecting to the database. Please check your database settings.\nError code{\n" + String(err) + '\n}';
                    console.log(errorMessage);
                    fs.appendFile(config['logsFolder'] + "/log-" + getDate() + ".txt", errorMessage,function(err){
                        if(err) throw err;
                        return;
                    })
                    return;
                }

                csvtojson().fromFile(config['targetFolder']+'/'+file).then(function (source) {
                    // console.log("line " + 39);
                    // console.log(source);
                    sql = new SQLBuilder('MySQL');
                    
                    if(config['mapColumns'] == true){
                        source = constructSource(source,config['columnsMap']);
                        
                        console.log(source);
                        if(source == false){
                            errorMessage = '\n' + '[' + getLocalTime() + ']' + "[" + file + "]" + "[Error] No matching columns in the processed file.";
                            console.log(errorMessage);
                            fs.appendFile(config['logsFolder'] + "/log-" + getDate() + ".txt", errorMessage, function (err) {
                                if (err) throw err;
                                return;
                            });
                            con.end();
                            return;
                        }
                    }
                    
                    myQuery = sql.$insert({
                        $table: config["tablename"],
                        $documents: source
                    });
            
                    
                    con.query(myQuery.sql, myQuery.values, function (err, result) {
                        if (err) {
                            // console.log("line " + 47);
                            errorMessage =  '\n' + '[' + getLocalTime() + ']' + "[" + file + "]" + "[Error] executing the query. Please check the database settings and the provided CSV file.\nError code :{\n" + String(err) + '\n}\n';
                            console.log(errorMessage);
                            fs.appendFile(config['logsFolder'] + "/log-" + getDate() + ".txt",errorMessage, function (err) {
                                if (err) throw err;
                                return;
                            });
                            error = true;
                            // console.log('arr');
                            con.end();
                            return;
                        }
                        con.end();
                        // console.log("line " + 53);
                        fs.appendFile(config['logsFolder']+"/log-" + getDate()+".txt", '\n' +'['+getLocalTime()+']'+ "["+file+"]"+"[Succes] executing the query. "+ result.affectedRows +" rows affected.", function (err) {
                            if (err) throw err;
                            return;
                        });
                        // console.log("line " + 58);
                        if (config['deleteAfterProcess'] == false)
                        fs.copyFile(config['targetFolder'] + '/' + file, config['dumpFolder'] + '/' + file,function(err){
                            if (err) {
                                errorMessage =  '\n' + '[' + getLocalTime() + ']' + "[" + file + "]" + "[Error] Coouldn't copy the target file to the dump folder.\nError code : {\n" + String(err) + '\n}';
                                console.log(errorMessage);
                                fs.appendFile(config['logsFolder'] + "/log-" + getDate() + ".txt",errorMessage, function (err) {
                                    if (err) throw err;
                                    return;
                                });

                                return;
                            }
                            // console.log("line " + 68);
                            fs.unlink(config['targetFolder'] + '/' + file, function (err) {
                                if (err) {
                                    // console.log("line " + 71);
                                    errorMessage =  '\n' + '[' + getLocalTime() + ']' + "[" + file + "]" + "[Error] Coouldn't delete the target file.\nError code : {\n" + String(err) + '\n}';
                                    console.log(errorMessage);
                                    fs.appendFile(config['logsFolder'] + "/log-" + getDate() + ".txt",errorMessage, function (err) {
                                        if (err) throw err;
                                        return;
                                    });
                            // console.log("line 77");
                                    return;
                                }        
                            });
                            // console.log("Line 81") 
                        });
                        else {
                            fs.unlink(config['targetFolder'] + '/' + file, function (err) {
                                if (err) {
                                    // console.log("line " + 71);
                                    errorMessage = '\n' + '[' + getLocalTime() + ']' + "[" + file + "]" + "[Error] Coouldn't delete the target file.\nError code : {\n" + String(err) + '\n}';
                                    console.log(errorMessage);
                                    fs.appendFile(config['logsFolder'] + "/log-" + getDate() + ".txt", errorMessage, function (err) {
                                        if (err) throw err;
                                        return;
                                    });
                                    // console.log("line 77");
                                    return;
                                }
                                
                            });
                        }
                        // console.log("Line 83")
                        // con. 
                        
                    });
                    // console.log("Line 85")
                    // console.log("Line 89")
                    
                    // console.log('wat');
                });
                // console.log("Line 88") 
                
            });
            
            
        }
        else {
            // console.log("Line 90");
            fs.appendFile(config['logsFolder'] + "/log-" + getDate() + ".txt", '\n' + '[' + getLocalTime() + ']' + "[" + file + "]" + "[Error] Not a CSV file.\n", function (err) {
                if (err) throw err;
                return;
            });
        }
        // console.log("Line 95");
    
    }
    // console.log("Line 101");
    // console.log("Success");
});








function constructSource(source, columns) {
    let result = [];
    source.forEach(element => {
        let obj = {};

        for (const key in columns) {
            if(element.hasOwnProperty(columns[key])){

                if (columns[key] == "null" || columns[key] == null) continue;
                obj[key] = element[columns[key]];
            }
            else continue;
        }
    
        result.push(obj);
    });
    if(getObjectLength(result[0]) == 0) return false;
    console.log(result);
    return result;
}
function getObjectLength(obj){
    let count = 0;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
         count++;
            
        }
    }
    return count;
}
function getDate(){
    return new Date().toISOString().substr(0, 10);
}
function getLocalTime(){
    return new Date().toLocaleTimeString();
}