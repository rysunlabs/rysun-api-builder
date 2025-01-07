import fs from "fs";
import { exec, execSync } from "child_process";
import { moduleTemplate } from "./Templates/moduleTemplate.js";
import { controllerTemplate } from "./Templates/controllerTemplate.js";
import { serviceTemplate } from "./Templates/serviceTemplate.js";
import { createDtoTemplate } from "./Templates/createDtoTemplate.js";
import { updateDtoTemplate } from "./Templates/updateDtoTemplate.js";
import { filterDtoTemplate } from "./Templates/filterDtoTemplate.js";
import { appModuleTemplate } from "./Templates/appModuleTemplate.js";
import { mainTemplate } from "./Templates/maintemplate.js";
import { prismaTemplate } from "./Templates/prismaTemplate.js";
import { resolverTemplate } from "./Templates/resolverTemplate.js";
import { entityTemplate } from "./Templates/entityTemplate.js";
import path from "path";
import { DataType, DbAnswers } from "./types/index.js";
// import { Prisma, PrismaClient } from "@prisma/client"

export const dbConnect = async (dbInfo: DbAnswers) => {
  // this function create all files with all structure according to database tables
  const createAllFiles = (name: string, fields: any) => {
    let isUnique: boolean = true;
    for (let i in fields) {
      if (fields[i]["isPrimary"] && !fields[i]["allowNull"]) {
        isUnique = true;
        break;
      } else {
        isUnique = false;
        break;
      }
    }

    if (isUnique) {
      const createDtoResponse = createDtoTemplate(
        name,
        fields,
        dbInfo.apiType,
        dbInfo.dbDriver
      );
      const moduleResponse = moduleTemplate(name, fields, dbInfo.apiType);
      const controllerResponse = controllerTemplate(name, fields);
      const serviceResponse = serviceTemplate(
        name,
        fields,
        dbInfo.apiType,
        dbInfo.dbDriver
      );
      const updateDtoResponse = updateDtoTemplate(name, fields, dbInfo.apiType);
      const filterDtoResponse = filterDtoTemplate(name, dbInfo.apiType);
      const resolverResponse = resolverTemplate(name, fields);

      if (dbInfo.apiType === "RestAPI") {
        fs.mkdirSync(`./src/${name}`, { recursive: true });
        fs.mkdirSync(`./src/${name}/dto`, { recursive: true });
        fs.writeFileSync(
          `./src/${name}/dto/create-${name}.dto.ts`,
          createDtoResponse
        );
        fs.writeFileSync(
          `./src/${name}/dto/update-${name}.dto.ts`,
          updateDtoResponse
        );
        fs.writeFileSync(
          `./src/${name}/dto/filter-${name}.dto.ts`,
          filterDtoResponse
        );
        fs.writeFileSync(`./src/${name}/${name}.module.ts`, moduleResponse);
        fs.writeFileSync(
          `./src/${name}/${name}.controller.ts`,
          controllerResponse
        );
        fs.writeFileSync(`./src/${name}/${name}.service.ts`, serviceResponse);
      } else if (dbInfo.apiType === "GraphQL") {
        const entityResponse = entityTemplate(name, fields);
        fs.mkdirSync(`./src/${name}`, { recursive: true });
        fs.mkdirSync(`./src/${name}/entities`, { recursive: true });
        fs.writeFileSync(
          `./src/${name}/entities/${name}.entity.ts`,
          entityResponse
        );
        fs.mkdirSync(`./src/${name}/dto`, { recursive: true });
        fs.writeFileSync(
          `./src/${name}/dto/create-${name}.input.ts`,
          createDtoResponse
        );
        fs.writeFileSync(
          `./src/${name}/dto/update-${name}.input.ts`,
          updateDtoResponse
        );
        fs.writeFileSync(
          `./src/${name}/dto/filter-${name}.input.ts`,
          filterDtoResponse
        );
        fs.writeFileSync(`./src/${name}/${name}.module.ts`, moduleResponse);
        fs.writeFileSync(`./src/${name}/${name}.resolver.ts`, resolverResponse);
        fs.writeFileSync(`./src/${name}/${name}.service.ts`, serviceResponse);
      }
    }
  };

  const generate = async (
    isDiffrence: boolean,
    diffData?: any,
    actualData?: any
  ) => {
    // @ts-ignore
    const { PrismaClient } = await import("@prisma/client");
    // @ts-ignore
    const prisma: any = await import("@prisma/client");
    const prismaClient = new PrismaClient();
    const modelNames = prisma.Prisma.ModelName;

  process.stdout.write("\x1b[36mGenerating API endpoints...\x1b[0m ");


    let dataObj: any = {};
    for (let i in modelNames) {
      if (actualData) {
        for (let a of actualData) {
          if (a.includes(`${i} {`)) {
            dataObj[i] = a;
          }
        }
      }
    }
    let diffModelList = [];
    for (let i in dataObj) {
      for (let a of diffData) {
        if (dataObj[i].includes(a)) {
          diffModelList.push(i);
        }
      }
    }

    // this function checks the datatypes for the fields
    const checkTypes = (value: any) => {
      // Check if value is not a string
      if (typeof value !== "string") {
        return value;
      }

      const lowerValue = value.toLowerCase();

      // Numeric types
      if (
        lowerValue.includes("int") ||
        lowerValue.includes("float") ||
        lowerValue.includes("decimal") ||
        lowerValue.includes("bigint") ||
        lowerValue.includes("smallint") ||
        lowerValue.includes("tinyint") ||
        lowerValue.includes("double") ||
        lowerValue.includes("real") ||
        lowerValue.includes("numeric") ||
        lowerValue.includes("serial") ||
        lowerValue.includes("bigserial") ||
        lowerValue.includes("money") ||
        lowerValue.includes("smallmoney")
      ) {
        return "number";
      }
      // Date/Time types
      else if (
        lowerValue.includes("date") ||
        lowerValue.includes("timestamp") ||
        lowerValue.includes("time") ||
        lowerValue.includes("datetime") ||
        lowerValue.includes("datetime2") ||
        lowerValue.includes("datetimeoffset") ||
        lowerValue.includes("timestamptz") ||
        lowerValue.includes("smalldatetime") ||
        lowerValue.includes("interval")
      ) {
        return "Date";
      }
      // Boolean types
      else if (
        lowerValue.includes("boolean") ||
        lowerValue.includes("tinyint") ||
        lowerValue.includes("bit")
      ) {
        return "boolean";
      }
      // Character types
      else if (
        lowerValue.includes("varchar") ||
        lowerValue.includes("character") ||
        lowerValue.includes("text") ||
        lowerValue.includes("uuid") ||
        lowerValue.includes("nchar") ||
        lowerValue.includes("nvarchar") ||
        lowerValue.includes("ntext") ||
        lowerValue.includes("time without time zone") ||
        lowerValue.includes("character varying") ||
        lowerValue.includes("string") ||
        lowerValue.includes("char")
      ) {
        return "string";
      }
      // JSON type
      else if (lowerValue.includes("json")) {
        return "object";
      }
      // XML type
      else if (lowerValue.includes("xml")) {
        return "object";
      }
      // Unique Identifier
      else if (lowerValue.includes("uniqueidentifier")) {
        return "string";
      } else {
        return value;
      }
    };

    let models: any = {};
    let tName: any;
    const isPostgresql = dbInfo.dbDriver === "postgresql";
    const isMssql = dbInfo.dbDriver === "mssql";
    for (tName of Object.values(modelNames)) {
      const data: any = await prismaClient.$queryRawUnsafe(
        isPostgresql
          ? `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = '${tName}';`
          : isMssql
            ? `SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type, IS_NULLABLE as is_nullable, COLUMN_DEFAULT as column_default 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${tName}';`
            : `SHOW COLUMNS from ${tName}`
      );

      // get primary keys for postgresql
      // let primaryKeys: {attname?: string}[] | undefined = undefined;
      let primaryKeys: { attname?: string; COLUMN_NAME?: string }[] = [];
      if (isPostgresql) {
        primaryKeys =
          (await prismaClient.$queryRawUnsafe(`SELECT               
                pg_attribute.attname, 
                format_type(pg_attribute.atttypid, pg_attribute.atttypmod) 
              FROM pg_index, pg_class, pg_attribute, pg_namespace 
              WHERE 
                pg_class.oid = '${tName}'::regclass AND 
                indrelid = pg_class.oid AND 
                nspname = 'public' AND 
                pg_class.relnamespace = pg_namespace.oid AND 
                pg_attribute.attrelid = pg_class.oid AND 
                pg_attribute.attnum = any(pg_index.indkey)
               AND indisprimary`)) || [];
      } else if (isMssql) {
        primaryKeys =
          (await prismaClient.$queryRawUnsafe(`
                    SELECT COLUMN_NAME as attname
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1 
                    AND TABLE_NAME = '${tName}';`)) || [];
      }
      const fields: any = {};
      const hasPrimaryKeys = primaryKeys && primaryKeys.length > 0;
      for (let i in data) {
        // here all fields object create where all the necessary value are stores
        if (isPostgresql || isMssql) {
          data[i]["Type"] = data[i]["data_type"];
        }
        data[i]["Type"] = checkTypes(data[i]["Type"]);

        if (data[i]["Type"].includes(isPostgresql ? "USER-DEFINED" : "enum")) {
          data[i]["Type"] = "string";
          data[i]["kind"] = "enum";
        }
        data[i]["Null"] =
          data[i][isPostgresql || isMssql ? "is_nullable" : "Null"] === "YES";
        if (data[i]["Null"] === "NO") {
          data[i]["Null"] = false;
        }
        const isPrimary = hasPrimaryKeys
          ? primaryKeys.some((item) =>
            isPostgresql
              ? item?.attname && item.attname.includes(data[i]["column_name"])
              : isMssql
                ? item?.COLUMN_NAME &&
                item.COLUMN_NAME === data[i]["column_name"]
                : data[i]["Key"] === "PRI"
          )
          : data[i]["Key"] === "PRI";

        fields[data[i][isPostgresql || isMssql ? "column_name" : "Field"]] = {
          type: data[i]["Type"],
          kind: data[i]["kind"],
          isPrimary: isPrimary,
          default:
            data[i][isPostgresql || isMssql ? "column_default" : "Default"],
          allowNull: data[i]["Null"],
        };
      }
      if (isDiffrence) {
        for (let i of diffModelList) {
          if (tName === i) {
            models[tName] = `${tName.charAt(0).toUpperCase() + tName.slice(1)}`;
            createAllFiles(tName, fields);
          }
        }

        if (!fs.existsSync(`./src/${tName}`)) {
          models[tName] = `${tName.charAt(0).toUpperCase() + tName.slice(1)}`;
          createAllFiles(tName, fields);
        }
      } else {
        if (!fs.existsSync(`./src/${tName}`)) {
          models[tName] = `${tName.charAt(0).toUpperCase() + tName.slice(1)}`;
          createAllFiles(tName, fields);
        }
      }
    }

    const appModuleResponse = appModuleTemplate(models);
    fs.writeFileSync(`./src/app.module.ts`, appModuleResponse);

    if (dbInfo.apiType === "RestAPI") {
      const mainResponse = mainTemplate();
      fs.writeFileSync(`./src/main.ts`, mainResponse);
    }
  process.stdout.write("\r\x1b[32mAPI endpoints generated successfully\x1b[0m           \n");
  };

  const dbUrl = generateDbConnectionString(dbInfo);
  const envFilePath = ".env";

  // Function to write or update .env file
  const writeOrUpdateEnvFile = (filePath: string, dbUrl: string) => {
    if (fs.existsSync(filePath)) {
      const envContent = fs.readFileSync(filePath, "utf8");
      const lines = envContent.split("\n");

      const existingDbUrlLine = lines.find((line) =>
        line.startsWith("DATABASE_URL")
      );

      if (existingDbUrlLine) {
        const existingDbUrl = existingDbUrlLine
          .split("=")[1]
          ?.replace(/"/g, "")
          .trim();
        if (existingDbUrl === dbUrl) {
          return;
        }
      }

      const updatedEnvContent = lines
        .filter((line) => !line.startsWith("DATABASE_URL"))
        .concat(`DATABASE_URL="${dbUrl}"`)
        .join("\n");

      fs.writeFileSync(filePath, updatedEnvContent);
  process.stdout.write("\x1b[32m.env file updated\x1b[0m           \n");
    } else {
      // .env file does not exist, create it
      fs.writeFileSync(filePath, `DATABASE_URL="${dbUrl}"\n`);
      process.stdout.write("\x1b[32m.env file created\x1b[0m           \n");
    }
  };

  writeOrUpdateEnvFile(envFilePath, dbUrl);

  //run prisma commands
  const runPrismaCommand = (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      exec(command, { shell: true as any }, (error, stdout, stderr) => {
        // Casting shell to 'any'
        if (error) {
          reject(error);
        } else if (stderr) {
          reject(new Error(stderr));
        } else {
          // console.log('Current working directory:', process.cwd());
          resolve(stdout);
        }
      });
    });
  };

  let spinnerInterval
  // Check if schema.prisma exists
  if (!fs.existsSync("./prisma/schema.prisma")) {
    process.stdout.write("\x1b[36mInitializing Prisma...\x1b[0m ");
    execSync("npx prisma init");
    process.stdout.write("\r\x1b[32mPrisma Initialized\x1b[0m                  \n");

  }

  const prismaResponse = prismaTemplate(dbInfo);
  fs.writeFileSync(`./prisma/schema.prisma`, prismaResponse);

  process.stdout.write("\x1b[36mPulling database schema...\x1b[0m ");
  execSync("npx prisma db pull");
  process.stdout.write("\r\x1b[32mSchema pulled successfully\x1b[0m             \n");

  process.stdout.write("\x1b[36mGenerating Prisma client... \x1b[0m ");
  await runPrismaCommand("npx prisma generate");
  process.stdout.write("\r\x1b[32mClient generated successfully\x1b[0m           \n");

  if (fs.existsSync("schema.back.prisma")) {
    // get the difference between schema.prisma and schema.back.prisma file if schema.back.prisma is exist.
    exec(
      "fc schema.back.prisma ./prisma/schema.prisma",
      (err, stdout, stderr) => {
        const value = stdout.split(`*****\r\n\r\n*****`);
        const diffData: any = [];
        for (let i in value) {
          diffData.push(
            value[i]
              .split(`***** ./PRISMA/SCHEMA.PRISMA\r\n`)[1]
              ?.split("*****")[0]
          );
        }
        let actualData = [];
        fs.readFile("./prisma/schema.prisma", "utf8", (err, data) => {
          actualData = data.split("enum")[0].split("model");
          actualData.shift();
          const newDiffData = [];
          for (let i of diffData) {
            const replacedData = i?.replaceAll("\r\n", "\n");
            newDiffData.push(replacedData?.replaceAll("model ", ""));
          }
          const isDiff = diffData ? true : false;
          generate(isDiff, newDiffData, actualData);
          fs.copyFile("./prisma/schema.prisma", "schema.back.prisma", () => { });
        });
      }
    );
  } else {
    generate(false);
    fs.copyFile("./prisma/schema.prisma", "schema.back.prisma", () => { });
  }
  if (!fs.existsSync("./src")) {
    fs.mkdirSync("./src", { recursive: true });
  }
};

function generateDbConnectionString(answers: any) {
  const { dbDriver, dbUser, dbPassword, dbHost, dbPort, dbName } = answers;
  if (dbDriver === "mysql") {
    return `mysql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
  } else if (dbDriver === "postgresql") {
    return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
  } else {
    return `sqlserver://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
  }
}
