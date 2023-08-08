export const updateDtoTemplate = (name: string, fields: any, apiType: string) => {
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

  let primaryType: string
  let primaryName: string

  // get the primary key and its type
  for (let i in fields) {
    primaryName = i
    primaryType = fields[i]["type"]
    break;

  }

  // this function check that any fields is exist in table or not.
  const checkRequiredFields = (requireCount: number) => {
    let requireTemplate = ``
    if (requireCount > 0) {
      requireTemplate += `import { Field, InputType } from '@nestjs/graphql';
  
@InputType()
`
    }
    else {
      requireTemplate = ""
    }
    return requireTemplate
  }

  // this function returns the fields with types.
  const checkForFields = (requireCount: number) => {
    let requireTemplate = ``
    if (requireCount > 0) {
      requireTemplate += `\t@Field()
\t${primaryName}: ${primaryType}
`
    }
    else {
      requireTemplate = ""
    }
    return requireTemplate
  }

  let template = ``

  if (apiType === "RestAPI") {
    // updateDTO template for RestAPI
    template += `import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from "@nestjs/swagger";
import { Create${copyClassName}Dto } from './create-${name}.dto';
  
export class Update${copyClassName}Dto extends PartialType(Create${copyClassName}Dto) {\n`

  }
  else if (apiType === "GraphQL") {
    // updateDTO template for GraphQL
    template += `import { PartialType } from '@nestjs/mapped-types';
import { Create${copyClassName}Input } from './create-${name}.input';
${checkRequiredFields(count)}
export class Update${copyClassName}Input extends PartialType(Create${copyClassName}Input) {
${checkForFields(count)}
`
  }
  template += `}`


  return template
}