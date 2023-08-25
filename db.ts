import fs from "fs"
import { exec, execSync } from "child_process"
import { moduleTemplate } from './Templates/moduleTemplate.js'
import { controllerTemplate } from './Templates/controllerTemplate.js'
import { serviceTemplate } from './Templates/serviceTemplate.js'
import { createDtoTemplate } from './Templates/createDtoTemplate.js'
import { updateDtoTemplate } from './Templates/updateDtoTemplate.js'
import { filterDtoTemplate } from './Templates/filterDtoTemplate.js'
import { appModuleTemplate } from './Templates/appModuleTemplate.js'
import { mainTemplate } from './Templates/maintemplate.js'
import { prismaTemplate } from "./Templates/prismaTemplate.js"
import { resolverTemplate } from "./Templates/resolverTemplate.js"
import { entityTemplate } from "./Templates/entityTemplate.js"

interface DatabaseInfo {
    dbName: string,
    dbPort: string,
    dbUser: string,
    dbPassword: string,
    dbHost: string,
    dbDriver: string,
    apiType: string
}

export const dbConnect = async (dbInfo: DatabaseInfo) => {

    // this function create all files with all structure according to database tables
    const createAllFiles = (name: string, fields: any) => {
        let isUnique: boolean = true
        for (let i in fields) {
            if (fields[i]["isPrimary"] && !fields[i]["allowNull"]) {
                isUnique = true
                break;
            }
            else {
                isUnique = false
                break;
            }
        }

        if (isUnique) {
            const createDtoResponse = createDtoTemplate(name, fields, dbInfo.apiType)
            const moduleResponse = moduleTemplate(name, fields, dbInfo.apiType)
            const controllerResponse = controllerTemplate(name, fields)
            const serviceResponse = serviceTemplate(name, fields, dbInfo.apiType)
            const updateDtoResponse = updateDtoTemplate(name, fields, dbInfo.apiType)
            const filterDtoResponse = filterDtoTemplate(name, dbInfo.apiType)
            const resolverResponse = resolverTemplate(name, fields)

            if (dbInfo.apiType === "RestAPI") {

                fs.mkdirSync(`./src/${name}`, { recursive: true })
                fs.mkdirSync(`./src/${name}/dto`, { recursive: true })
                fs.writeFileSync(`./src/${name}/dto/create-${name}.dto.ts`, createDtoResponse)
                fs.writeFileSync(`./src/${name}/dto/update-${name}.dto.ts`, updateDtoResponse)
                fs.writeFileSync(`./src/${name}/dto/filter-${name}.dto.ts`, filterDtoResponse)
                fs.writeFileSync(`./src/${name}/${name}.module.ts`, moduleResponse)
                fs.writeFileSync(`./src/${name}/${name}.controller.ts`, controllerResponse)
                fs.writeFileSync(`./src/${name}/${name}.service.ts`, serviceResponse)
            }
            else if (dbInfo.apiType === "GraphQL") {
                const entityResponse = entityTemplate(name, fields)
                fs.mkdirSync(`./src/${name}`, { recursive: true })
                fs.mkdirSync(`./src/${name}/entities`, { recursive: true })
                fs.writeFileSync(`./src/${name}/entities/${name}.entity.ts`, entityResponse)
                fs.mkdirSync(`./src/${name}/dto`, { recursive: true })
                fs.writeFileSync(`./src/${name}/dto/create-${name}.input.ts`, createDtoResponse)
                fs.writeFileSync(`./src/${name}/dto/update-${name}.input.ts`, updateDtoResponse)
                fs.writeFileSync(`./src/${name}/dto/filter-${name}.input.ts`, filterDtoResponse)
                fs.writeFileSync(`./src/${name}/${name}.module.ts`, moduleResponse)
                fs.writeFileSync(`./src/${name}/${name}.resolver.ts`, resolverResponse)
                fs.writeFileSync(`./src/${name}/${name}.service.ts`, serviceResponse)
            }
        }
    }

    const generate = async (isDiffrence: boolean, diffData?: any, actualData?: any) => {
        // @ts-ignore
        const { PrismaClient } = await import("@prisma/client")
        // @ts-ignore
        const prisma:any = await import("@prisma/client")
        const prismaClient = new PrismaClient()        
        const modelNames = prisma.Prisma.ModelName

        let dataObj: any = {}
        for (let i in modelNames) {
            if (actualData) {
                for (let a of actualData) {
                    if (a.includes(`${i} {`)) {
                        dataObj[i] = a
                    }
                }
            }
        }
        let diffModelList = []
        for (let i in dataObj) {
            for (let a of diffData) {
                if (dataObj[i].includes(a)) {
                    diffModelList.push(i)
                }
            }
        }

        // this function check the datatypes for the fields
        const checkTypes = (value: any) => {
            if (value.includes("Int") || value.includes("int") || value.includes("Float") || value.includes("Decimal")) {
                return 'number'
            }
            else if (value.includes("Date") || value.includes("timestamp") || value.includes("Time") || value.includes("datetime")) {
                return 'Date'
            }
            else if (value.includes("Boolean") || value.includes("tinyInt") || value.includes('tinyint')) {
                return 'boolean'
            }
            else if (value.includes('varchar') || value.includes('text') || value.includes('String') || value.includes('string')) {
                return 'string'
            }
            else {
                return value
            }
        }

        let models: any = {}
        let tName: any
        for (tName of Object.values(modelNames)) {
            const data: any = await prismaClient.$queryRawUnsafe(`SHOW COLUMNS from ${tName}`)
            const fields: any = {}
            for (let i in data) {
                // here all fields object create where all the necessary value are stores
                data[i]["Type"] = checkTypes(data[i]["Type"])
                
                if (data[i]["Type"].includes('enum')) {
                    data[i]["Type"] = "string"
                    data[i]['kind'] = "enum"
                }
                data[i]["Null"] = data[i]["Null"] === 'YES'
                if (data[i]["Null"] === 'NO') {
                    data[i]["Null"] = false
                }
                fields[data[i]["Field"]] = {
                    type: data[i]["Type"],
                    kind: data[i]["kind"],
                    isPrimary: data[i]["Key"] === 'PRI' ? true : false,
                    default: data[i]["Default"],
                    allowNull: data[i]["Null"],
                }


            }
            if (isDiffrence) {
                for (let i of diffModelList) {
                    if (tName === i) {
                        models[tName] = `${tName.charAt(0).toUpperCase() + tName.slice(1)}`
                        createAllFiles(tName, fields)
                    }
                }
                
                if (!fs.existsSync(`./src/${tName}`)) {
                    models[tName] = `${tName.charAt(0).toUpperCase() + tName.slice(1)}`
                    createAllFiles(tName, fields)
                }
            }
            else {
                if (!fs.existsSync(`./src/${tName}`)) {
                    models[tName] = `${tName.charAt(0).toUpperCase() + tName.slice(1)}`
                    createAllFiles(tName, fields)
                }
            }
        }

        const appModuleResponse = appModuleTemplate(models)
        fs.writeFileSync(`./src/app.module.ts`, appModuleResponse)

        if (dbInfo.apiType === "RestAPI") {
            const mainResponse = mainTemplate()
            fs.writeFileSync(`./src/main.ts`, mainResponse)
        }
    }

    //run prisma commands 
    if (!fs.existsSync('./prisma/schema.prisma')) {
        execSync("npx prisma init")
        const prismaResponse = prismaTemplate(dbInfo)
        fs.writeFileSync(`./prisma/schema.prisma`, prismaResponse)
        console.log("after init");

        execSync("npx prisma db pull")
        console.log("after db pull");

        execSync("npx prisma generate")
        console.log("after generate");

    }
    else {
        const prismaResponse = prismaTemplate(dbInfo)
        fs.writeFileSync(`./prisma/schema.prisma`, prismaResponse)

        execSync("npx prisma db pull")
        console.log("after db pull");

        execSync("npx prisma generate")
        console.log("after generate");

    }
    if (fs.existsSync('schema.back.prisma')) {
        // get the difference between schema.prisma and schema.back.prisma file if schema.back.prisma is exist.
        exec("fc schema.back.prisma ./prisma/schema.prisma", (err, stdout, stderr) => {
            const value = stdout.split(`*****\r\n\r\n*****`)
            const diffData: any = []
            for (let i in value) {
                diffData.push(value[i].split(`***** ./PRISMA/SCHEMA.PRISMA\r\n`)[1]?.split("*****")[0])
            }
            let actualData = []
            fs.readFile("./prisma/schema.prisma", "utf8", (err, data) => {
                actualData = data.split("enum")[0].split("model")
                actualData.shift()
                const newDiffData = []
                for (let i of diffData) {
                    const replacedData = i?.replaceAll("\r\n", "\n")
                    newDiffData.push(replacedData?.replaceAll("model ", ""))
                }
                const isDiff = diffData ? true : false
                generate(isDiff, newDiffData, actualData)
                fs.copyFile('./prisma/schema.prisma', 'schema.back.prisma', () => { })
            })
        })
    }
    else {
        generate(false)
        fs.copyFile('./prisma/schema.prisma', 'schema.back.prisma', () => { })
    }
    if (!fs.existsSync('./src')) {
        fs.mkdirSync('./src', { recursive: true });
    }
}