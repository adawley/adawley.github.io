var _ = require('lodash');
var S = require('./constants').SeriesKeyType;
var sKeys = Object.keys(S);

/**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // If the value is negative...
    if (value < 0) {
        return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}


function DataPoint(){
    var self = this,
        keys = sKeys;

    _.forEach(keys, function(key){
        key = key.toLowerCase();
        self[key] = function (val) { self[key] = val; return this; }
    });
}

var filters = {

    normalize: {
        alphavantage: {
            /*
                "2017-08-02": {
                    "1. open": "72.5500",
                    "2. high": "72.5600",
                    "3. low": "71.4400",
                    "4. close": "72.2600",
                    "5. adjusted close": "72.2600",
                    "6. volume": "26405096",
                    "7. dividend amount": "0.0000",
                    "8. split coefficient": "1.0000"
                },
            */
            timeSeries: function (data) {
                if (!data) return;

                var tsdata = data[Object.keys(data)[1]];

                return _.map(tsdata, function(val, key){
                    return new DataPoint()
                        .date(key)
                        .open(val['1. open'])
                        .high(val['2. high'])
                        .low(val['3. low'])
                        .close(val['4. close'])
                        .volume(val['5. volume'])
                });
            }
        }
    },

    url: {
        hostname: function (url) {
            return !url ? '' : _(url.split('/')).filter().value()[1];
        }
    },

    math: {
        round: function (value, exp) {
            return decimalAdjust('round', value, exp);
        },

        floor: function (value, exp) {
            return decimalAdjust('floor', value, exp);
        },

        ceil: function (value, exp) {
            return decimalAdjust('ceil', value, exp);
        },

        decimalAdjust: decimalAdjust
    }
};

module.exports = filters;
