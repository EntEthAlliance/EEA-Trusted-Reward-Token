/**
 * Asserts an exception just before
 *
 * @param {object} error ErrorObject
 * @returns {void}
 */
export function assertJump(error) {
    assert.isAbove(error.message.search('invalid opcode'), -1, 'Invalid opcode error must be returned');
}

/**
 * @const BigNumber Pointer to web3.BigNumber
 */
const BigNumber = web3.utils.toBN;
export {BigNumber};

/**
 * Increase N days in testrpc
 *
 * @param {integer} days Number of days
 * @return {integer} Time
 */
export async function waitNDays(days) {
    const daysInSeconds = days * 24 * 60 * 60;

    const time = await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [daysInSeconds],
        id: 4447
    });

    return time.result;
}

/**
 * Defines a EmptyStackException
 *
 * @param {string} message Exception message
 * @returns {undefined}
 */
function EmptyStackException(message) {
    this.message    = message;
    this.name       = 'EmptyStackException';
}

/**
 * Get event from transaction
 *
 * @param {object} tx Transaction object
 * @param {string} event Event searching for
 * @returns {object} Event stack
 */
export function getEvents(tx, event = null) {
    const stack = [];

    tx.logs.forEach((item) => {
        if (event) {
            if (event === item.event) {
                stack.push(item.args);
            }
        } else {
            if (!stack[item.event]) {
                stack[item.event] = [];
            }
            stack[item.event].push(item.args);
        }
    });

    if (Object.keys(stack).length === 0) {
        throw new EmptyStackException('No Events fired');
    }

    return stack;
}

/**
 * Increases testrpc time by the passed duration in seconds
 *
 * @param {object} duration Duration
 * @returns {promise} promise
 */
export default function increaseTime(duration) {
    const now = Date.now();

    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc:    '2.0',
            method:     'evm_increaseTime',
            params:     [duration],
            id:         now
        }, (err1) => {
            if (err1) {
                return reject(err1);
            }

            web3.currentProvider.sendAsync({
                jsonrpc: '2.0',
                method: 'evm_mine',
                id: now + 1
            }, (err2, res) => {
                return err2 ? reject(err2) : resolve(res);
            });
        });
    });
}

/**
 * Beware that due to the need of calling two separate testrpc methods and rpc calls overhead
 * it's hard to increase time precisely to a target point so design your test to tolerate
 * small fluctuations from time to time.
 *
 * @param {integer} target Time in seconds
 * @returns {promise} increaseTime() Increase time
 */
export function increaseTimeTo(target) {
    const now = web3.eth.getBlock('latest').timestamp;

    if (target < now) {
        throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
    }

    return increaseTime(target - now);
}

export const duration = {
    seconds: (val) => {
        return val;
    },
    minutes: (val) => {
        return val * this.seconds(60);
    },
    hours: (val) => {
        return val * this.minutes(60);
    },
    days: (val) => {
        return val * this.hours(24);
    },
    weeks: (val) => {
        return val * this.days(7);
    },
    years: (val) => {
        return val * this.days(365);
    }
};
