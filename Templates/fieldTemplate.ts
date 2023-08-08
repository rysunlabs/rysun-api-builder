
// this function create the fields template.
const generateColumnTemplate = (filename, value, currentcolumn) => {
    let template = ``

    if (value['kind'] === "enum") {
        if (!value['allowNull']) {
            template += `\t@Field(() => ${value['type'].charAt(0).toUpperCase() + value['type'].slice(1)}, { nullable: true })\n`
        } else {
            template += `\t@Field(() => ${value['type'].charAt(0).toUpperCase() + value['type'].slice(1)})\n`
        }
        template += `\t${currentcolumn}: ${filename}_${currentcolumn}\n\n`
    }
    else {
        if (!value['allowNull']) {
            template += `\t@Field({ nullable: true})\n`
        } else {
            template += `\t@Field()\n`
        }
        template += `\t${currentcolumn}: ${value['type']}\n\n`
    }
    return template
}

export const fieldTemplate = (filename, field) => {
    let template = ``

    for (let i in field) {
        template += generateColumnTemplate(filename, field[i], i)
    }
    return template
}