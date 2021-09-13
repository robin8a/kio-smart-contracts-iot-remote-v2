import { CardanoCommadsInterface } from "./CardanoCommandsInterface";

// Modules
const cmd: any = require('node-cmd');
import { configure, getLogger } from "log4js";
const logger = getLogger();


export class CardanoCommads implements CardanoCommadsInterface {

    configureLogger() {
        configure({
            appenders: { cardano_commands: { type: "file", filename: "./logs/cardano_commands.log" } },
            categories: { default: { appenders: ["cardano_commands"], level: "error" } }
        });
    }
    
    
    keyGen(CARDANO_CLI: string, CARDANO_KEYS_PATH: string) {
        this.configureLogger()
        logger.level = "debug";

        try {
            
            const rawkeygen: any = cmd.runSync([
                CARDANO_CLI,
                "address", "key-gen",
                "--verification-key-file", CARDANO_KEYS_PATH+"payment.vkey",
                "--signing-key-file", CARDANO_KEYS_PATH+"payment.skey"
            ].join(" "));
            logger.level = "debug";
            logger.debug(rawkeygen);
            return rawkeygen
            
        } catch (error) {
            logger.level = "debug";
            logger.debug(error);
            return error
        }
        
    }
}