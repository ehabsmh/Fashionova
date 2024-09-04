export let addCountryCode: (countryCode: string, phoneNo: string) => string
addCountryCode = function (countryCode, phoneNo) {
    if (!countryCode.startsWith('+')) {
        countryCode = '+' + countryCode;
    }

    return `${countryCode}${phoneNo}`;
}

// export addCountryCode;
