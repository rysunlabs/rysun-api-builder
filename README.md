# @rysun/api-builder

While actively working with databases, this efficient and time-saving package helps developers to auto-generate the CRUD endpoints for MySQL, Postgres, and SQL servers using Prisma. It also supports GraphQL and Swagger tools in API development.  

To generate CRUD endpoints in Swagger, the user has to select the RestAPI type.  

The api-builder runs on NodeJS, and it is only for NestJS projects.

## Installation & Usage

You can install the package in your project by entering this command on your terminal: 
```bash
npm install @rysun/api-builder
or
yarn add @rysun/api-builder
```

Run the following command in the terminal, to use the features of this node module in your project: 
```bash
npx generatePrismaAPI
```

You can download the package globally in your system with the following command: 
```bash
npm install -g @rysun/api-builder
or
yarn global add @rysun/api-builder
```

Use the capabilities of the api-builder node module globally in your projects by running the following command: 
```bash
generatePrismaAPI
```

After executing the command, fill in the required input about the database and API type:
```
Database Driver:
Database name:
Database port:
Database user:
Database password:
Database Host:
what you want to use?
1. RestAPI
2. GraphQL
```

user needs to enter that information to make auto generation possible.