export const prismaTemplate = (dbInfo: any) => {
    let template = `generator client {
    provider = "prisma-client-js"
    previewFeatures = ["fullTextSearch", "fullTextIndex"]
}`

    const driverName = dbInfo.dbDriver === "mysql" ? "mysql" : dbInfo.dbDriver === "postgresql" ? "postgresql" : dbInfo.dbDriver === "SQL server" ? "sqlserver" : ""

    if (dbInfo.dbPassword.includes("@")) {
        dbInfo.dbPassword = dbInfo.dbPassword.replace("@", "%40")
    }

    // template for prisma.schema file for 'mysql' or 'postgresql'.
    if (driverName === "mysql" || driverName === "postgresql") {
        template += `

datasource db {
    provider = "${driverName}"
    url      = "${driverName}://${dbInfo.dbUser}:${dbInfo.dbPassword}@${dbInfo.dbHost}/${dbInfo.dbName}"
}`
    }
    // template for prisma.schema file for 'sqlserver'.
    else if (driverName === "sqlserver") {
        dbInfo.dbHost.replace(`"\"`, `\\`)
        template += `
        
datasource db {
    provider = "${driverName}"
    url      = "${driverName}://${dbInfo.dbHost};initialCatalog=sample;database=${dbInfo.dbName};user=${dbInfo.dbUser};password=${dbInfo.dbPassword};trustServerCertificate=true;"
}`
    }

    return template
}