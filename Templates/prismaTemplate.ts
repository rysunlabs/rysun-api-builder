export const prismaTemplate = (dbInfo: any) => {
    let template = `generator client {
    provider = "prisma-client-js"
    previewFeatures = ["fullTextSearch", "fullTextIndex"]
}`

    const driverName = dbInfo.dbDriver === "mysql" ? "mysql" : 
                       dbInfo.dbDriver === "postgresql" ? "postgresql" : 
                       dbInfo.dbDriver === "SQL server" ? "sqlserver" : ""

    // Encode '@' character for MySQL/PostgreSQL connection strings
    if (dbInfo.dbPassword.includes("@")) {
        dbInfo.dbPassword = dbInfo.dbPassword.replace("@", "%40");
    }

    // Template for MySQL and PostgreSQL
    if (driverName === "mysql" || driverName === "postgresql") {
        template += `

datasource db {
    provider = "${driverName}"
    url      = "${driverName}://${dbInfo.dbUser}:${dbInfo.dbPassword}@${dbInfo.dbHost}:${dbInfo.dbPort}/${dbInfo.dbName}"
}`
    }
    // Template for SQL Server with proper host format and encoding
    else if (driverName === "sqlserver") {
        dbInfo.dbHost = dbInfo.dbHost.replace(`\\`, `\\\\`);  // Correctly escape backslashes
        template += `
        
datasource db {
    provider = "${driverName}"
    url      = "${driverName}://sqlserver://${dbInfo.dbUser}:${dbInfo.dbPassword}@${dbInfo.dbHost}:${dbInfo.dbPort};database=${dbInfo.dbName};trustServerCertificate=true;"
}`
    }

    return template;
}
