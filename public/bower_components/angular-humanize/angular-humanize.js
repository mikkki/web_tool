(function(window, angular, undefined) {
	"use strict";

	var module = angular.module("angular-humanize", []);

	/* WIP */
	module.filter("percent",function(){
		return function(item, precision, isInt) {
			var val = parseFloat(item),
				fixed = parseInt(precision) || 0,
				wholeNum = isInt || false;

			if (!wholeNum) {
				val *= 100;
			}

			val = val.toFixed(fixed);

			return val + "%";
		};
	});

	module.filter("apnumber", function(){
		return function(item) {
			var retValue = item,
				numberWords = ["zero","one","two","three","four","five","six","seven","eight","nine"];

			if (numberWords[item]) {
				retValue = numberWords[item];
			}

			return retValue;
		};
	});

	module.filter("ordinal", function(){
		return function(item, suffixOnly) {
			var val = parseFloat(item).toFixed(),
				valToEval = val.slice("-1"),
				suffixIdx = valToEval >= 3 ? 3 : valToEval,
				suffixArr = ["","st","nd","rd","th"];

			if (valToEval > 12 && valToEval < 20) {
				suffixIdx = 4;
			}

			return (suffixOnly == "suffixonly" ? "" : val) + suffixArr[suffixIdx];
		};
	});

	module.filter("currencyWord", function(){
		return function(item, precision, suffixFormat, suffixOnly) {
			var suffixFormats = {
					short: ["k","m","b","t"],
					long: ["thousand", "million", "billion", "trillion"]
				},
				_suffixFormat = suffixFormat == "long" ? suffixFormats.long : suffixFormats.short,
				_suffixOnly = suffixOnly == "suffixonly" ? true : false,
				suffix = "",
				displayValue = item;

			precision = precision || 1;

			switch (item > 999) {
				case item < 10000:
					suffix = _suffixFormat[0];
					break;
				case item < 100000:
					suffix = _suffixFormat[1];
					break;
				case item < 1000000:
					suffix = _suffixFormat[2];
					break;
				case item < 10000000:
					suffix = _suffixFormat[3];
					break;
			}

			if (suffix) {
				displayValue = displayValue.toFixed(precision);
			}

			return _suffixOnly ? suffix : "$" + displayValue + " " + suffix;
		};
	});

})(window, angular);
