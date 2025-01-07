#!/usr/bin/env node
import inquirer, { Answers as InquirerAnswers } from "inquirer";
import { DbAnswers, DefaultValues } from "./types/index.js";
import { dbConnect } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

// Function to parse DATABASE_URL and return connection details
function parseDatabaseUrl(dbUrl: string): DefaultValues {
    const regex = /^(?<driver>\w+):\/\/(?<user>[^:]+):(?<password>[^@]+)@(?<host>[^:]+):(?<port>\d+)\/(?<dbname>[\w-]+)/;
    const match = dbUrl.match(regex);
    if (match) {
        return {
            dbDriver: match.groups!.driver,
            dbName: match.groups!.dbname,
            dbPort: match.groups!.port,
            dbUser: match.groups!.user,
            dbPassword: match.groups!.password,
            dbHost: match.groups!.host,
        };
    }
    return {};
}

// Get the database URL from .env
const databaseUrl = process.env.DATABASE_URL;

// Parse the database URL to get defaults
const defaultValues: DefaultValues = databaseUrl ? parseDatabaseUrl(databaseUrl) : {};

// Mapping for default ports
const defaultPorts: { [key: string]: string } = {
    mysql: '3306',
    postgresql: '5432',
    mssql: '1433'
};

// choices
const choices = [
    { name: 'MySQL', value: 'mysql' },
    { name: 'PostgreSQL', value: 'postgresql' },
    { name: 'MSSQL', value: 'mssql' }
];

// using inquirer we can get the db info from user through command line
inquirer
    .prompt<DbAnswers>([
        {
            type: 'list',
            name: 'dbDriver',
            message: 'Database Driver:',
            choices: choices,
            default: choices.find(choice => choice.value === defaultValues.dbDriver)?.value || 'mysql',
        },
        {
            name: 'dbName',
            message: 'Database name:',
            default: defaultValues.dbName || 'test',
        },
        {
            name: 'dbPort',
            message: 'Database port:',
            default: (answers: any) => defaultValues.dbPort || defaultPorts[answers.dbDriver],
            validate: (input: string) => {
                const port = parseInt(input, 10);
                return (port > 0 && port < 65536) || 'Please enter a valid port number';
            }
        },
        {
            name: 'dbUser',
            message: 'Database user:',
            default: defaultValues.dbUser || 'root',
        },
        {
            name: 'dbPassword',
            message: 'Database password:',
            default: defaultValues.dbPassword || '',
        },
        {
            name: 'dbHost',
            message: 'Database Host:',
            default: defaultValues.dbHost || 'localhost',
        },
        {
            type: "list",
            name: 'apiType',
            message: "What do you want to use?",
            choices: ['RestAPI', 'GraphQL'],
        }
    ])
    .then((answers: DbAnswers) => {
        dbConnect(answers);
    });
