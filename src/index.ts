/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */

import { mqtt, auth, http, io, iot } from 'aws-iot-device-sdk-v2';
import { TextDecoder } from 'util';
import { ZipCodeValidator } from "./modules/ZipCodeValidator";
import { CardanoCommads } from "./modules/CardanoCommands";
import { Util } from "./modules/Util";

// const { WalletServer } = require('cardano-wallet-js');
// let walletServer = WalletServer.init('http://localhost:8090/v2');

import { configure, getLogger } from "log4js";
const logger = getLogger();

// Logger
configure({
    appenders: { cheese: { type: "file", filename: "cheese.log" } },
    categories: { default: { appenders: ["cheese"], level: "error" } }
});


// AWS
// import * as AWS from 'aws-sdk';
// Piñata
// import * as Pinata from 'pinata-sdk';
// Cardano CLI 
// const CardanocliJs = require("./modules/index.js");

// import CardanocliJs from "CardanocliJs.js";

// import * as SomeModule from "./SomeModule";


// UUID
// import { v4 as uuidv4 } from 'uuid';
// Global variables from credential.json and config.json
// const credentials = require('./config/credentials.json')
// const credentialsAWS = credentials['aws_credentials']
// const credentialsPinata = credentials['pinata_credentials']
import config from './config/config.json';
const configCardanoCliV2 = config.cardano_cli_v2;



// const configAWSIoTDevice = config['aws_iot_device']
// const configLocalFiles = config['local_files']

// const os = require("os");
// const path = require("path");


type Args = { [index: string]: any };

const yargs = require('yargs');
yargs.command('*', false, (yargs: any) => {
    yargs
        .option('endpoint', {
            alias: 'e',
            description: "Your AWS IoT custom endpoint, not including a port. "  +
              "Ex: \"abcd123456wxyz-ats.iot.us-east-1.amazonaws.com\"",
            type: 'string',
            required: true
        })
        .option('ca_file', {
            alias: 'r',
            description: 'FILE: path to a Root CA certficate file in PEM format.',
            type: 'string',
            required: false
        })
        .option('cert', {
            alias: 'c',
            description: 'FILE: path to a PEM encoded certificate to use with mTLS',
            type: 'string',
            required: false
        })
        .option('key', {
            alias: 'k',
            description: 'FILE: Path to a PEM encoded private key that matches cert.',
            type: 'string',
            required: false
        })
        .option('client_id', {
            alias: 'C',
            description: 'Client ID for MQTT connection.',
            type: 'string',
            required: false
        })
        .option('topic', {
            alias: 't',
            description: 'STRING: Targeted topic',
            type: 'string',
            default: 'test/topic'
        })
        .option('count', {
            alias: 'n',
            default: 10,
            description: 'Number of messages to publish/receive before exiting. ' +
            'Specify 0 to run forever.',
            type: 'number',
            required: false
        })
        .option('use_websocket', {
            alias: 'W',
            default: false,
            description: 'To use a websocket instead of raw mqtt. If you ' +
            'specify this option you must specify a region for signing, you can also enable proxy mode.',
            type: 'boolean',
            required: false
        })
        .option('signing_region', {
            alias: 's',
            default: 'us-east-1',
            description: 'If you specify --use_websocket, this ' +
            'is the region that will be used for computing the Sigv4 signature',
            type: 'string',
            required: false
        })
        .option('proxy_host', {
            alias: 'H',
            description: 'Hostname for proxy to connect to. Note: if you use this feature, ' +
            'you will likely need to set --ca_file to the ca for your proxy.',
            type: 'string',
            required: false
        })
        .option('proxy_port', {
            alias: 'P',
            default: 8080,
            description: 'Port for proxy to connect to.',
            type: 'number',
            required: false
        })
        .option('message', {
            alias: 'M',
            description: 'Message to publish.',
            type: 'string',
            default: 'Hello world!'
        })
        .option('verbosity', {
            alias: 'v',
            description: 'BOOLEAN: Verbose output',
            type: 'string',
            default: 'none',
            choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'none']
        })
        .help()
        .alias('help', 'h')
        .showHelpOnFail(false)
}, main).parse();



async function execute_session(connection: mqtt.MqttClientConnection, argv: Args) {
    
    return new Promise<void>(async (resolve, reject) => {
        try {
            const decoder = new TextDecoder('utf8');
            
            configure({
                appenders: { cardano_commands: { type: "file", filename: "./logs/cardano_commands.log" } },
                categories: { default: { appenders: ["cardano_commands"], level: "error" } }
            });
            
            const on_publish = async (topic: string, payload: ArrayBuffer, dup: boolean, qos: mqtt.QoS, retain: boolean) => {
                const json = decoder.decode(payload);
                console.log(`# Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`);
                console.log(json);
                const message = JSON.parse(json);
                let cardanoCommands = new CardanoCommads()
                logger.level = "debug";
                
                if (message.Command_From_UI_Query_Tip !== undefined) {
                    logger.debug('## on_publish message Command_From_UI_Query_Tip');
                    let command_from_ui_query_tip_result = await cardanoCommands.queryTip(configCardanoCliV2.CARDANO_CLI, configCardanoCliV2.CARDANO_NETWORK_MAGIC)
                    logger.debug('## on_publish message Command_From_UI_Query_Tip command_from_ui_result: ', command_from_ui_query_tip_result);
                    try {
                        const publish = async () => {
                            const json = JSON.stringify(command_from_ui_query_tip_result);
                            debugger
                            connection.publish(argv.topic, json, mqtt.QoS.AtLeastOnce);
                        }
                        setTimeout(publish, 1000);
                        resolve();    
                    } catch (error) {
                        logger.debug('## error on_publish: ', error)
                    }
                }
            }

            await connection.subscribe(argv.topic, mqtt.QoS.AtLeastOnce, on_publish);

            // for (let op_idx = 0; op_idx < argv.count; ++op_idx) {
            //     const publish = async () => {
            //         const msg = {
            //             message: argv.message,
            //             sequence: op_idx + 1,
            //         };
            //         const json = JSON.stringify(msg);
            //         connection.publish(argv.topic, json, mqtt.QoS.AtLeastOnce);
            //     }
            //     setTimeout(publish, op_idx * 1000);
            // }
        }
        catch (error) {
            reject(error);
        }
    });
}

async function main(argv: Args) {

    let util = new Util()

    // Test
    let isOnMessagesUUIDResult = await util.isOnMessagesUUID('uuuu-iiii-dddd')
    if (isOnMessagesUUIDResult !== null) {
        if (isOnMessagesUUIDResult) {
            console.log('ID found it')
        } else {
            console.log('ID NOT found it')
        }
    }

    if (argv.verbosity != 'none') {
        const level : io.LogLevel = parseInt(io.LogLevel[argv.verbosity.toUpperCase()]);
        io.enable_logging(level);
    }

    const client_bootstrap = new io.ClientBootstrap();

    let config_builder = null;
    if(argv.use_websocket) {
        config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets({
            region: argv.signing_region,
            credentials_provider: auth.AwsCredentialsProvider.newDefault(client_bootstrap)
        });
    } else {
        config_builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(argv.cert, argv.key);
    }

    if (argv.proxy_host) {
        config_builder.with_http_proxy_options(new http.HttpProxyOptions(argv.proxy_host, argv.proxy_port));
    }

    if (argv.ca_file != null) {
        config_builder.with_certificate_authority_from_path(undefined, argv.ca_file);
    }

    config_builder.with_clean_session(false);
    config_builder.with_client_id(argv.client_id || "test-" + Math.floor(Math.random() * 100000000));
    config_builder.with_endpoint(argv.endpoint);

    // force node to wait 60 seconds before killing itself, promises do not keep node alive
    const timer = setTimeout(() => {}, 60 * 1000);

    const config = config_builder.build();
    const client = new mqtt.MqttClient(client_bootstrap);
    const connection = client.new_connection(config);

    await connection.connect()
    await execute_session(connection, argv)
    await connection.disconnect()

    // Allow node to die if the promise above resolved
    clearTimeout(timer);

    let myValidator = new ZipCodeValidator()
    if (myValidator.isAcceptable('33140')) {
        console.log('Zipcode is valid')
    }

    // try {
    //     let clock = await walletServer.getNetworkClock()    
    //     console.log('### walletServer.getNetworkClock(): Clock: ', clock)
    // } catch (error) {
    //     console.log('### walletServer.getNetworkClock(): error: ', error)
    // }
    
    // let cardanoCommands = new CardanoCommads()
    // console.log('### cardanoCommands.keyGen: ', cardanoCommands.keyGen(configCardanoCliV2.CARDANO_CLI,configCardanoCliV2.CARDANO_KEYS_PATH));
}


