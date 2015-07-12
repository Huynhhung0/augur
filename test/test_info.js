/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var Augur = require("../augur");
var constants = require("./constants");
var utilities = require("../utilities");
var log = console.log;

Augur = utilities.setup(Augur, process.argv.slice(2));

var branch_id = Augur.branches.dev;
var branch_number = "0";
var accounts = utilities.get_test_accounts(Augur, constants.max_test_accounts);
var test_account = accounts[0];
var markets = Augur.getMarkets(branch_id);
var market_id = markets[0];
var market_creator_1 = test_account;
var market_id2 = markets[1];
var market_creator_2 = test_account;
var event_id = Augur.getMarketEvents(market_id)[0];

// info.se
describe("info.se", function () {
    describe("getCreator(" + event_id + ") [event]", function () {
        it("sync", function () {
            var res = Augur.getCreator(event_id);
            assert.equal(res, test_account);
        });
        it("async", function (done) {
            Augur.getCreator(event_id, function (r) {
                assert.equal(r, test_account);
                done();
            });
        });
    });
    describe("getCreator(" + market_id + ") [market]", function () {
        it("sync", function () {
            var res = Augur.getCreator(market_id);
            assert.equal(res, test_account);
        });
        it("async", function (done) {
            Augur.getCreator(market_id, function (r) {
                assert.equal(r, test_account);
                done();
            });
        });
    });
    describe("getCreationFee(" + event_id + ") [event]", function () {
        var test = function (r) {
            assert(Number(r) > 0);
        };
        it("sync", function () {
            test(Augur.getCreationFee(event_id));
        });
        it("async", function (done) {
            Augur.getCreationFee(event_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getCreationFee(" + market_id + ") [market]", function () {
        var test = function (r) {
            assert(Number(r) >= 1000);
        };
        it("sync", function () {
            test(Augur.getCreationFee(market_id));
        });
        it("async", function (done) {
            Augur.getCreationFee(market_id, function (r) {
                test(r); done();
            });
        });
    });
    describe("getDescription(" + event_id + ")", function () {
        var test = function (r) {
            assert(r.length >= 13);
        };
        it("sync", function () {
            test(Augur.getDescription(event_id));
        });
        it("async", function (done) {
            Augur.getDescription(event_id, function (r) {
                test(r); done();
            });
        });
    });
});
