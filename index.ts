#!/usr/bin/env node
import inquirer, { Answers as InquirerAnswers }  from "inquirer"
import { DbAnswers } from "./types/index.js"
import { dbConnect } from "./db.js";


// using inquirer we can get the db info from user through command line
inquirer
    .prompt<DbAnswers>([
        {
            type: 'list',
            name: 'dbDriver',
            message: 'Database Driver:',
            choices: [
                { name: 'MySQL', value: 'mysql' },
                { name: 'PostgreSQL', value: 'postgresql' },
                { name: 'MSSQL', value: 'mssql' }
            ],
        },
        {
            name: 'dbName',
            message: 'Database name:',
            default: 'test'
        },
        {
            name: 'dbPort',
            message: 'Database port:',
            default: '3306',
            validate: (input: string) => {
                const port = parseInt(input, 10);
                return (port > 0 && port < 65536) || 'Please enter a valid port number';
            },
            when: (answers:any) => answers.dbDriver === 'mysql'
        },
        {
            name: 'dbPort',
            message: 'Database port:',
            default: '5432',
            validate: (input: string) => {
                const port = parseInt(input, 10);
                return (port > 0 && port < 65536) || 'Please enter a valid port number';
            },
            when: (answers:any) => answers.dbDriver === 'postgresql'
        },
        {
            name: 'dbPort',
            message: 'Database port:',
            default: '1433',
            validate: (input: string) => {
                const port = parseInt(input, 10);
                return (port > 0 && port < 65536) || 'Please enter a valid port number';
            },
            when: (answers:any) => answers.dbDriver === 'mssql'
        },
        {
            name: 'dbUser',
            message: 'Database user:',
            default: 'root'
        },
        {
            name: 'dbPassword',
            message: 'Database password:',
            default: ''
        },
        {
            name: 'dbHost',
            message: 'Database Host:',
            default: 'localhost'
        },
        {
            type: "list",
            name: 'apiType',
            message: "what you want to use?",
            choices: ['RestAPI', 'GraphQL'],
        }
    ])
    .then((answers: DbAnswers) => {
        dbConnect(answers)
    });

