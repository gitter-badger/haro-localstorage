"use strict";

(function (global) {
	const Promise = global.Promise || require("es6-promise").Promise;
	const localStorage = global.localStorage || require("localStorage");

	function deferred () {
		let promise, resolver, rejecter;

		promise = new Promise(function (resolve, reject) {
			resolver = resolve;
			rejecter = reject;
		});

		return {resolve: resolver, reject: rejecter, promise: promise};
	}

	function local (store, op, key, data) {
		let defer = deferred(),
			record = key !== undefined,
			prefix = store.adapters.local || store.id,
			lkey = prefix + (record ? "_" + key : ""),
			result;

		if (op === "get") {
			result = localStorage.getItem(lkey);

			if (result !== null) {
				defer.resolve(JSON.parse(result));
			} else if (record) {
				defer.reject(new Error("Record not found in localStorage"));
			} else {
				defer.resolve([]);
			}
		}

		if (op === "remove") {
			localStorage.removeItem(lkey);
			defer.resolve(true);
		}

		if (op === "set") {
			try {
				localStorage.setItem(lkey, JSON.stringify(record ? data : store.toArray()));
				defer.resolve(true);
			} catch (e) {
				defer.reject(e);
			}
		}

		return defer.promise;
	}

	// Node, AMD & window supported
	if (typeof exports !== "undefined") {
		module.exports = local;
	} else if (typeof define === "function") {
		define(function () {
			return local;
		});
	} else {
		global.haroLocal = local;
	}
}(typeof global !== "undefined" ? global : window));
