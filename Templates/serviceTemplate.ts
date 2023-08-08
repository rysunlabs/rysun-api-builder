export const serviceTemplate = (name, fields, apiType) => {
    const fileName = name.charAt(0).toUpperCase() + name.slice(1)
    let copyClassName = fileName

    name = name.charAt(0).toLowerCase() + name.slice(1)

    let primaryType: string
    let primaryName: string

    // get the primary key and its type
    for (let i in fields) {
        primaryName = i
        primaryType = fields[i]["type"]
        break;

    }

    if (fileName.split("-")[1] === "copy") {
        copyClassName = `${fileName.split("-")[0]}Copy`
    }

    let reference = []
    for (let i in fields) {
        if (fields[i]['reference']) {
            reference.push(fields[i]['reference'])
        }
    }
    reference = [... new Set(reference)]
    const importTemplates = (type) => {
        let template = ``
        if (type === "GraphQL") {
            template += `import { Create${copyClassName}Input } from './dto/create-${name}.input';
import { Update${copyClassName}Input } from './dto/update-${name}.input';
import { Filter${copyClassName}Input } from './dto/filter-${name}.input';\n`
        }
        else if (type === "RestAPI") {
            template += `import { Create${copyClassName}Dto } from './dto/create-${name}.dto';
import { Update${copyClassName}Dto } from './dto/update-${name}.dto';
import { Filter${copyClassName}Dto } from './dto/filter-${name}.dto';\n`
        }

        return template
    }

    let count = 0
    for (let i in fields) {
        if (fields[i]["allowNull"] && fields[i]["default"]?.name !== "autoincrement") {
            count += 1
        }

    }

    // check that required field is exist or not if exist then add the 'create' and 'update' methods with code in template.
    const checkCreate = (requireCount) => {
        let createTemplate = ``
        if (requireCount > 0) {
            createTemplate += `\n\tasync create(create${copyClassName}${checkGraphQL}: Create${copyClassName}${checkGraphQL}) {
        try {
            const ${name}Details = await prisma.${name}.create({
                data:{ ...create${copyClassName}${checkGraphQL} }
            });

            if (!${name}Details) {
                return { status: 204, message: "No data found",  data: ${name}Details }
            }
        
            return { status: 201, message: "created successfully",  data: ${name}Details }
        } 
        catch (err) {
            return { status: 403, message: err.message, data: [] }
        }
    }  
`
        }
        else {
            createTemplate = ""
        }
        return createTemplate
    }
    const checkUpdate = (requireCount) => {
        let updateTemplate = ``
        if (requireCount > 0) {
            updateTemplate += `\n\tasync update(${primaryName}: ${primaryType}, update${copyClassName}${checkGraphQL}: Update${copyClassName}${checkGraphQL}) {
        try{
            const updated${copyClassName} = await prisma.${name}.update({ 
                where: { ${primaryName}: ${primaryType === "number" ? "+" : ""}${primaryName} },
                data: { ...update${copyClassName}${checkGraphQL} },
            }) 

            return { status: 200, message: "data updated successfully",  data: updated${copyClassName} }
        }
        catch (err){
            return { status: 403, message: err.message, data: [] }
        }
    }
`
        }
        else {
            updateTemplate = ""
        }
        return updateTemplate
    }

    const checkGraphQL = apiType === "GraphQL" ? "Input" : apiType === "RestAPI" ? "Dto" : ""

    let template = ``

    //main template structure for services file.
    template += `import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
${importTemplates(apiType)}

const prisma = new PrismaClient();

@Injectable()
export class ${copyClassName}Service {
${checkCreate(count)}
    async findAll(filter${copyClassName}${checkGraphQL}: Filter${copyClassName}${checkGraphQL}) {
        try{
            const limit = filter${copyClassName}${checkGraphQL}.limit ? filter${copyClassName}${checkGraphQL}.limit :  10
            const page = filter${copyClassName}${checkGraphQL}.page ? filter${copyClassName}${checkGraphQL}.page :   1
      
            const offset = (page - 1) * limit;
    
            let order = {}
      
            if(filter${copyClassName}${checkGraphQL}.sortName && filter${copyClassName}${checkGraphQL}.sortOrder){
              order[filter${copyClassName}${checkGraphQL}.sortName] = filter${copyClassName}${checkGraphQL}.sortOrder
            }

            const whereclause = {}
            if (filter${copyClassName}${checkGraphQL}.columnName && filter${copyClassName}${checkGraphQL}.search) {

                whereclause[filter${copyClassName}${checkGraphQL}.columnName] = { contains: filter${copyClassName}${checkGraphQL}.search }
            }
      
            const ${name}Details = await prisma.${name}.findMany({
                where: whereclause,
                skip: offset,
                take: +limit,
                orderBy: order
            });

            if (!${name}Details || ${name}Details.length === 0) {
                return { status: 204, message: "No data found",  data: ${name}Details }
            }
            return { status: 200, message: "data found",  data: ${name}Details }
        }
        catch (err){
            return { status: 403, message: err.message, data: [] }
        }
    }

    async findOne(${primaryName}: ${primaryType}) {
        try {
            const ${name}Details = await prisma.${name}.findUnique({
              where: {
                ${primaryName}: ${primaryType === "number" ? "+" : ""}${primaryName},
              },
            });

            if (!${name}Details) {
                return { status: 204, message: "No data found",  data: ${name}Details }
            }
            return { status: 200, message: "data found",  data: ${name}Details }
          } 
        catch (err) {
            return { status: 403, message: err.message, data: [] }
        }
    }
${checkUpdate(count)}
    async remove(${primaryName}: ${primaryType}) {
        try{
            const deleted${copyClassName} = await prisma.${name}.delete({ where: { ${primaryName}: ${primaryName} } });
            
            return { status: 200, message: "data deleted successfully",  data: deleted${copyClassName} }
        }
        catch (err){
            return { status: 403, message: err.message, data: [] }
        }
    }
}
`
    return template
}