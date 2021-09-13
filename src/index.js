"use strict";
/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_iot_device_sdk_v2_1 = require("aws-iot-device-sdk-v2");
var util_1 = require("util");
var ZipCodeValidator_1 = require("./modules/ZipCodeValidator");
// import { CardanoCommads } from "./modules/CardanoCommands";
var WalletServer = require('cardano-wallet-js').WalletServer;
var walletServer = WalletServer.init('http://localhost:8090/v2');
var yargs = require('yargs');
yargs.command('*', false, function (yargs) {
    yargs
        .option('endpoint', {
        alias: 'e',
        description: "Your AWS IoT custom endpoint, not including a port. " +
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
        .showHelpOnFail(false);
}, main).parse();
function execute_session(connection, argv) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var decoder_1, on_publish, _loop_1, op_idx, error_1;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                decoder_1 = new util_1.TextDecoder('utf8');
                                on_publish = function (topic, payload, dup, qos, retain) { return __awaiter(_this, void 0, void 0, function () {
                                    var json, message;
                                    return __generator(this, function (_a) {
                                        json = decoder_1.decode(payload);
                                        console.log("Publish received. topic:\"" + topic + "\" dup:" + dup + " qos:" + qos + " retain:" + retain);
                                        console.log(json);
                                        message = JSON.parse(json);
                                        if (message.sequence == argv.count) {
                                            resolve();
                                        }
                                        return [2 /*return*/];
                                    });
                                }); };
                                return [4 /*yield*/, connection.subscribe(argv.topic, aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce, on_publish)];
                            case 1:
                                _a.sent();
                                _loop_1 = function (op_idx) {
                                    var publish = function () { return __awaiter(_this, void 0, void 0, function () {
                                        var msg, json;
                                        return __generator(this, function (_a) {
                                            msg = {
                                                message: argv.message,
                                                sequence: op_idx + 1,
                                            };
                                            json = JSON.stringify(msg);
                                            connection.publish(argv.topic, json, aws_iot_device_sdk_v2_1.mqtt.QoS.AtLeastOnce);
                                            return [2 /*return*/];
                                        });
                                    }); };
                                    setTimeout(publish, op_idx * 1000);
                                };
                                for (op_idx = 0; op_idx < argv.count; ++op_idx) {
                                    _loop_1(op_idx);
                                }
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                reject(error_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function main(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var level, client_bootstrap, config_builder, timer, config, client, connection, myValidator, clock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (argv.verbosity != 'none') {
                        level = parseInt(aws_iot_device_sdk_v2_1.io.LogLevel[argv.verbosity.toUpperCase()]);
                        aws_iot_device_sdk_v2_1.io.enable_logging(level);
                    }
                    client_bootstrap = new aws_iot_device_sdk_v2_1.io.ClientBootstrap();
                    config_builder = null;
                    if (argv.use_websocket) {
                        config_builder = aws_iot_device_sdk_v2_1.iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets({
                            region: argv.signing_region,
                            credentials_provider: aws_iot_device_sdk_v2_1.auth.AwsCredentialsProvider.newDefault(client_bootstrap)
                        });
                    }
                    else {
                        config_builder = aws_iot_device_sdk_v2_1.iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(argv.cert, argv.key);
                    }
                    if (argv.proxy_host) {
                        config_builder.with_http_proxy_options(new aws_iot_device_sdk_v2_1.http.HttpProxyOptions(argv.proxy_host, argv.proxy_port));
                    }
                    if (argv.ca_file != null) {
                        config_builder.with_certificate_authority_from_path(undefined, argv.ca_file);
                    }
                    config_builder.with_clean_session(false);
                    config_builder.with_client_id(argv.client_id || "test-" + Math.floor(Math.random() * 100000000));
                    config_builder.with_endpoint(argv.endpoint);
                    timer = setTimeout(function () { }, 60 * 1000);
                    config = config_builder.build();
                    client = new aws_iot_device_sdk_v2_1.mqtt.MqttClient(client_bootstrap);
                    connection = client.new_connection(config);
                    return [4 /*yield*/, connection.connect()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, execute_session(connection, argv)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, connection.disconnect()
                        // Allow node to die if the promise above resolved
                    ];
                case 3:
                    _a.sent();
                    // Allow node to die if the promise above resolved
                    clearTimeout(timer);
                    myValidator = new ZipCodeValidator_1.ZipCodeValidator();
                    if (myValidator.isAcceptable('33140')) {
                        console.log('Zipcode is valid');
                    }
                    return [4 /*yield*/, walletServer.getNetworkClock()];
                case 4:
                    clock = _a.sent();
                    console.log('Clock: ', clock);
                    return [2 /*return*/];
            }
        });
    });
}
