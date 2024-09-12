import { Answers as InquirerAnswers }  from "inquirer"

export type DataType = 'number' | 'Date' | 'boolean' | 'string' | 'unknown';

export interface DbAnswers extends InquirerAnswers {
    dbDriver: 'mysql' | 'postgresql' | 'mssql';
    dbName: string;
    dbPort: string;
    dbUser: string;
    dbPassword: string;
    dbHost: string;
    apiType: 'RestAPI' | 'GraphQL';
}