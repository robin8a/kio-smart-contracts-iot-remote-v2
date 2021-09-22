import { UtilInterface } from "./UtilInterface";

// File System
import * as fs from 'fs';

// Modules
import { configure, getLogger } from "log4js";
const logger = getLogger();


export class Util implements UtilInterface {

    isOnMessagesUUID(pUUID: string)  {
        return new Promise<boolean>((resolve) => {
            configure({
                appenders: { cardano_commands: { type: "file", filename: "./logs/cardano_commands.log" } },
                categories: { default: { appenders: ["cardano_commands"], level: "error" } }
            });
        
            logger.level = "debug";
            logger.debug('#####')
            logger.debug('# isOnMessagesUUID')
            
            fs.readFile('./data/messages_uuid.log', 'utf8', function (err, data) {
                debugger
                if (err) throw err;
                if(data.includes(pUUID)){
                    logger.debug('## ID found it: ', pUUID)
                    resolve(true)
                } else {
                    logger.debug('## ID NOT found it: ', pUUID)
                    resolve(false)
                }
            });
        
            logger.debug('#####')
        });
    }

}