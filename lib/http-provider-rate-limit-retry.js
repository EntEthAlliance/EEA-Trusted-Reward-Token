/*

    Derived from:
    https://github.com/ethereum/web3.js/blob/1.0.0-beta.37/packages/web3-providers-http/src/index.js

    Original copyright notice:
    --------------------------

    This file is part of web3.js.
    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/** @file httpprovider.js
 * @authors:
 *   Marek Kotewicz <marek@parity.io>
 *   Marian Oancea
 *   Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2015
 */

var {inspect} = require('util');

var retry = require('retry');
var errors = require('web3-core-helpers').errors;
var XHR2 = require('xhr2-cookies').XMLHttpRequest // jshint ignore: line
var http = require('http');
var https = require('https');

var DEBUG = process.env.DEBUG && true
function log() {
  if (DEBUG) {
    let logArgs = [new Date().toISOString()].concat(Array.prototype.slice.call(arguments));
    console.log.call(console, logArgs);
  }
}

/**
 * KaleidoHttpProvider should be used to send rpc calls over http
 */
var HTTPProviderRateLimitRetry = function HTTPProviderRateLimitRetry(host, options) {
    options = options || {};
    this.host = host || 'http://localhost:8545';
    if (this.host.substring(0,5) === "https"){
        this.httpsAgent = new https.Agent({ keepAlive: true });
    }else{
        this.httpAgent = new http.Agent({ keepAlive: true });
    }
    this.timeout = options.timeout || 0;
    this.headers = options.headers;
    this.connected = false;
};

HTTPProviderRateLimitRetry.prototype._prepareRequest = function(){
    var request = new XHR2();
    request.nodejsSet({
        httpsAgent:this.httpsAgent,
        httpAgent:this.httpAgent
    });

    request.open('POST', this.host, true);
    request.setRequestHeader('Content-Type','application/json');
    request.timeout = this.timeout && this.timeout !== 1 ? this.timeout : 0;
    request.withCredentials = true;

    if(this.headers) {
        this.headers.forEach(function(header) {
            request.setRequestHeader(header.name, header.value);
        });
    }

    return request;
};

HTTPProviderRateLimitRetry.prototype.send = function (payload, cb) {
  var operation = retry.operation();
  var self = this;
  operation.attempt(function(currentAttempt) {
    self.attemptSend(payload, function(err, result) {
      if (err && err.retryable && operation.retry(err)) {
        log("Backoff retry attempt " + currentAttempt);
        return;
      }
      cb(err ? operation.mainError() : null, result);
    });
  });
}

/**
 * Should be used to make async request
 *
 * @method send
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
HTTPProviderRateLimitRetry.prototype.attemptSend = function(payload, callback) {
    var _this = this;

    log("JSON/RPC --> " + inspect(payload));

    var request = this._prepareRequest();

    request.onreadystatechange = function() {
          log("JSON/RPC <-- [" + request.status + "] " + request.responseText);

          if (request.readyState === 4 && request.timeout !== 1) {
            var result = request.responseText;
            var error = null;

            try {
                result = JSON.parse(result);
            } catch(e) {
                log("JSON/RPC !-- Failed to parse '" + result + "': " + (e && e.stack || e));
                error = errors.InvalidResponse(request.responseText);
                error.retryable = true;
            }

            if (request.status === 429) {
              error = error || new Error("Rate Limit");
              error.retryable = true;
            }
            _this.connected = true;
            callback(error, result);
        }
    };

    request.ontimeout = function() {
      log("JSON/RPC <-- TIMEOUT");

      _this.connected = false;
        callback(errors.ConnectionTimeout(this.timeout));
    };

    try {
        request.send(JSON.stringify(payload));
    } catch(error) {
        log("JSON/RPC <-- SEND FAILED: " + (error && error.stack || error));
  
        this.connected = false;
        callback(errors.InvalidConnection(this.host));
    }
};

module.exports = HTTPProviderRateLimitRetry;