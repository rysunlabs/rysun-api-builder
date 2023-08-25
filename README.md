# @rysun/api-builder

While actively working with databases, this efficient and time-saving package helps developers to auto-generate the CRUD endpoints for MySQL, Postgres, and SQL servers using Prisma. It also supports GraphQL and Swagger tools in API development.  

To generate CRUD endpoints in Swagger, the user has to select the RestAPI type.  

The api-builder runs on NodeJS, and it is only for NestJS projects.

## Installation & Usage

To install this package enter this command on your terminal:
```bash
npm install @rysun/api-builder
or
yarn add @rysun/api-builder
```

To use the functionality of this node module in your project you need to run the following command in terminal:
```bash
npx generatePrismaAPI
```

or else you can download this package globally in your system with this command:
```bash
npm install -g @rysun/api-builder
or
yarn global add @rysun/api-builder
```

To use the functionality of this node module Globally in your project you need to run the following command in terminal:
```bash
generatePrismaAPI
```

After run that command it will ask for some input regarding database and api type like:
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