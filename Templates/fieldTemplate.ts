
// this function create the fields template.
const generateColumnTemplate = (filename: string, value: any, currentColumn: any) => {
    let template = ``

    if (value['kind'] === "enum") {
        if (!value['allowNull']) {
            template += `\t@Field(() => ${value['type'].charAt(0).toUpperCase() + value['type'].slice(1)}, { nullable: true })\n`
        } else {
            template += `\t@Field(() => ${value['type'].charAt(0).toUpperCase() + value['type'].slice(1)})\n`
        }
        template += `\t${currentColumn}: ${filename}_${currentColumn}\n\n`
    }
    else {
        if (!value['allowNull']) {
            template += `\t@Field({ nullable: true})\n`
        } else {
            template += `\t@Field()\n`
        }
        template += `\t${currentColumn}: ${value['type']}\n\n`
    }
    return template
}

export const fieldTemplate = (filename: string, field: any) => {
    let template = ``

    for (let i in field) {
        template += generateColumnTemplate(filename, field[i], i)
    }
    return template
}