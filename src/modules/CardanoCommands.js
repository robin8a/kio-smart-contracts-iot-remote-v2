"use strict";
exports.__esModule = true;
exports.CardanoCommads = void 0;
// import * as fs from 'fs';
// Please add this dependency using npm install node-cmd but there is no @type definition for it
var cmd = require('node-cmd');
// Path to the cardano-cli binary or use the global one
var CARDANO_CLI_PATH = "cardano-cli";
// The `testnet` identifier number
// const CARDANO_NETWORK_MAGIC: number = 1097911063;
// The directory where we store our payment keys
// assuming our current directory context is /home/user/receive-ada-sample/receive-ada-sample
// const CARDANO_KEYS_DIR: string = "keys";
// The total payment we expect in lovelace unit
// const TOTAL_EXPECTED_LOVELACE: number = 1000000;
var CardanoCommads = /** @class */ (function () {
    function CardanoCommads() {
    }
    CardanoCommads.prototype.keyGen = function () {
        var rawkeygen = cmd.runSync([
            CARDANO_CLI_PATH,
            "address", "key-gen",
            "--verificatiton -key-file", "/home/luisr/receive-ada-sample/keys/payment.vkey",
            "--signing-key-file", "/home/luisr/receive-ada-sample/keys/payment.skey"
        ].join(" "));
        debugger;
        return rawkeygen;
    };
    return CardanoCommads;
}());
exports.CardanoCommads = CardanoCommads;
