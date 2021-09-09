/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */

import { mqtt, auth, http, io, iot } from 'aws-iot-device-sdk-v2';
import { TextDecoder } from 'util';
import { ZipCodeValidator } from "./modules/ZipCodeValidator";

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
// const config = require('./config/config.json')
// const configCardanoCli = config['cardano_cli']
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
    return new Promise(async (resolve, reject) => {
        try {
            const decoder = new TextDecoder('utf8');
            const on_publish = async (topic: string, payload: ArrayBuffer, dup: boolean, qos: mqtt.QoS, retain: boolean) => {
                const json = decoder.decode(payload);
                console.log(`Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`);
                console.log(json);
                const message = JSON.parse(json);
                if (message.sequence == argv.count) {
                    resolve();
                }
            }

            await connection.subscribe(argv.topic, mqtt.QoS.AtLeastOnce, on_publish);

            for (let op_idx = 0; op_idx < argv.count; ++op_idx) {
                const publish = async () => {
                    const msg = {
                        message: argv.message,
                        sequence: op_idx + 1,
                    };
                    const json = JSON.stringify(msg);
                    connection.publish(argv.topic, json, mqtt.QoS.AtLeastOnce);
                }
                setTimeout(publish, op_idx * 1000);
            }
        }
        catch (error) {
            reject(error);
        }
    });
}

async function main(argv: Args) {
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

    

    // const dir = path.join(os.homedir(), configCardanoCli.cardano_node);
    // const shelleyPath = path.join(
    //     os.homedir(),
    //     configCardanoCli.cardano_node,
    //     configCardanoCli.testnet_shelley_genesis_json
    // );

    // const cardanocliJs = new CardanocliJs({
    // network: configCardanoCli.network,
    // dir: dir,
    // shelleyGenesisPath: shelleyPath,
    // socketPath: configCardanoCli.socketPath,
    // });

    // cardanocliJs.wallet('W0107').balance();

    let myValidator = new ZipCodeValidator();
    if (myValidator.isAcceptable('33140')) {
        console.log('Zipcode is valid')
    }
}
