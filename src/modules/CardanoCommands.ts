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

        try {
            
            const rawkeygen: any = cmd.runSync([
                CARDANO_CLI,
                "address", "key-gen",
                "--verification-key-file", CARDANO_KEYS_PATH+"payment.vkey",
                "--signing-key-file", CARDANO_KEYS_PATH+"payment.skey"
            ].join(" "));
            // logger.level = "debug";
            // logger.debug(rawkeygen);
            return rawkeygen

        } catch (error) {
            logger.level = "debug";
            logger.debug(error);
            return error
        }
        
    }

    queryTip(CARDANO_CLI: string, CARDANO_NETWORK_MAGIC: number) {
        debugger
        this.configureLogger()
        logger.level = "debug";
        logger.debug('# calling queryTip ...');
        try {
            debugger
            const rawQueryTipResult: any = cmd.runSync([
                CARDANO_CLI,
                "query", "tip", "--testnet-magic", CARDANO_NETWORK_MAGIC
            ].join(" "));
            
            logger.debug(rawQueryTipResult);
            return rawQueryTipResult
        } catch (error) {
            debugger
            logger.debug(error)
            return error
        }
    }
}