This app is created using NodeJS. it needs to have its configuration set before working with it.
You can create the config file using the electron version of this, linked here : https://github.com/aymanboubleh/ExcelToMySQL
to properly use the app, there is a config.json file that you have to configure yourself.
 }
 "database": "YourTableName in the database here",
    "host": "your host address here",
    "password": "your database password",
    "tablename": "the table name in your CSV file",
    "user": "your database username",
    "columnsMap": {
        "db_table_column1": "csv_file_column2",
        "db_table_column2": "csv_file_column5",
        "db_table_column3": "csv_file_column7",
        "db_table_column4": "csv_file_column1",
        "db_table_columnN": null  #this column will be ignored in the import 
    },
    "mapColumns": true  #this enables the column Mapping, which uses the columnsMap above
 "targetFolder":"./files", #this is where you have to put your CSV_files
 "dumpFolder":"./processed", #this is where the processed CSV_files from "targetFolder" directory while be put
 "logsFolder":"./logs", #this is logs folder
 
 }
 Important: your target folder,Logs folder and dump folder should be already created.
 for more Info: refere to this report:https://drive.google.com/open?id=1T9SddLQO6l5iPlY5VF_mdwDPA9du53sw
