"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCountryCode = void 0;
exports.addCountryCode = function (countryCode, phoneNo) {
    if (!countryCode.startsWith('+')) {
        countryCode = '+' + countryCode;
    }
    return `${countryCode}${phoneNo}`;
};
// export addCountryCode;
