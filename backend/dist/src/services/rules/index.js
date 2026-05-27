"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RULES = void 0;
const seatOverprovisionRule_1 = require("./seatOverprovisionRule");
const toolOverlapRule_1 = require("./toolOverlapRule");
const enterpriseInflationRule_1 = require("./enterpriseInflationRule");
const lowVolumeApiRule_1 = require("./lowVolumeApiRule");
const inactiveSeatsRule_1 = require("./inactiveSeatsRule");
exports.RULES = [
    seatOverprovisionRule_1.seatOverprovisionRule,
    toolOverlapRule_1.toolOverlapRule,
    enterpriseInflationRule_1.enterpriseInflationRule,
    lowVolumeApiRule_1.lowVolumeApiRule,
    inactiveSeatsRule_1.inactiveSeatsRule
];
