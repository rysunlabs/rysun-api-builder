export const createDtoTemplate = (name, fields, apiType) => {
    const fileName = name.charAt(0).toUpperCase() + name.slice(1)
    let copyClassName = fileName
    if (fileName.split("-")[1] === "copy") {
        copyClassName = `${fileName.split("-")[0]}Copy`
    }

    let count = 0
    for (let i in fields) {
        if (fields[i]["allowNull"] && fields[i]["default"]?.name !== "autoincrement") {
            count += 1
        }

    }

    // create fields template according the api type eg. 'GraphQL' or 'RestAPI'.
    const fieldsTemplate = (element) => {
        let fieldTemplate = ``
        for (let i in element) {
            if (element[i]['allowNull'] && element[i]["default"]?.name !== "autoincrement") {
                if (apiType === "GraphQL") {
                    fieldTemplate += `\t@Field()\n`
                }
                else if (apiType === "RestAPI") {
                    fieldTemplate += `\t@ApiProperty({ required: true, type: ${element[i]['type'].charAt(0).toUpperCase() + element[i]['type'].slice(1)} })\n`
                }

                if (element[i]['kind'] === "enum") {
                    fieldTemplate += `\t${i}: ${name}_${i}\n\n`
                }
                else {
                    fieldTemplate += `\t${i}: ${element[i]['type']}\n\n`
                }
            }
        }
        return fieldTemplate
    }

    // check for ENUM type if it exist then add the Import in template
    const checkEnumImport = (element) => {
        let fieldTemplate = ``
        for (let i in element) {
            if (element[i]['allowNull'] && i !== 'id') {

                if (element[i]['kind'] === "enum") {
                    fieldTemplate += `import { ${name}_${i} } from "@prisma/client";\n`
                }
                else {
                    fieldTemplate += ""
                }
            }
        }
        return fieldTemplate
    }

    const fieldTemplate = fieldsTemplate(fields)

    const className = apiType === "RestAPI" ? `Create${copyClassName}Dto` : `Create${copyClassName}Input`

    //main template for createDTO file
    let template = ``
    if (apiType === "GraphQL" && count > 0) {
        template += checkEnumImport(fields)
        template += `import { Field, InputType } from '@nestjs/graphql';\n\n@InputType()\n`
    } else if (apiType === "RestAPI") {
        template += checkEnumImport(fields)
        template += `import { ApiProperty } from "@nestjs/swagger";\n\n`
    }
    template += `export class ${className} {
${fieldTemplate}}      
  `

    return template
}