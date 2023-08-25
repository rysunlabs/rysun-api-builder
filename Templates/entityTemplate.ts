import { fieldTemplate } from "./fieldTemplate.js"

export const entityTemplate = (filename: string, fields: any) => {

    const importTemplates = (value: any) => {
        let template = ``

        for (let i in value) {
            if (value[i]['kind'] === "enum") {
                template += `import { ${filename}_${i} } from '@prisma/client';\n`
            }
        }
        return template
    }
    let template = ``

    const fieldsData = fieldTemplate(filename, fields)

    // main template for entity file.
    template += `import { Field, ObjectType } from '@nestjs/graphql';
${importTemplates(fields)}
@ObjectType({ isAbstract: true })
export class ${filename.charAt(0).toUpperCase() + filename.slice(1)}{
${fieldsData}}
        `

    return template

}