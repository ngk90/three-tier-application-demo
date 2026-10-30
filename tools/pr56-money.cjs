'use strict';

/**
 * Add a percentage tax to an amount in integer cents.
 * @param {number} cents amount in cents
 * @param {number} percent tax percentage (e.g. 10 for 10%)
 * @returns {number} total in integer cents
 */
function addTaxCents(cents, percent) {
  return Math.round(cents * (1 + percent / 100));
}

module.exports = { addTaxCents };
