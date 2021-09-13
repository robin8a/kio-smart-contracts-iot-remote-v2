"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardanoCommads = void 0;
// import * as fs from 'fs';
// Please add this dependency using npm install node-cmd but there is no @type definition for it
var cmd = require('node-cmd');
// Path to the cardano-cli binary or use the global one
// const CARDANO_CLI_PATH: string = "cardano-cli";
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
    CardanoCommads.prototype.keyGen = function (CARDANO_CLI, CARDANO_KEYS_PATH) {
        var rawkeygen = cmd.runSync([
            CARDANO_CLI,
            "address", "key-gen",
            "--verification-key-file", CARDANO_KEYS_PATH + "payment.vkey",
            "--signing-key-file", CARDANO_KEYS_PATH + "payment.skey"
        ].join(" "));
        return rawkeygen;
    };
    return CardanoCommads;
}());
exports.CardanoCommads = CardanoCommads;
