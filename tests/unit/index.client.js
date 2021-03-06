var expect = require('chai').expect;
var jsdom = require('jsdom');
var I13nNode = require('react-i13n/dist/libs/I13nNode');
var gaPlugin;
'use strict';

describe('ga plugin client', function () {
    beforeEach(function (done) {
        jsdom.env('<html><head><script src="foo"/></head><body></body></html>', [], function (err, window) {
            global.window = window;
            global.document = window.document;
            global.navigator = window.navigator;
            global.location = window.location;
            global.ga = function () {};

            ReactI13nGoogleAnalytics = require('../../index.client');
            done();
        });
    });

    it('ga will be created once we create a plugin instance with default tracker ', function (done) {
        var mockTrackingId = 'foo';
        global.ga = function (actionName, config){
            expect(actionName).to.eql('create');
            expect({
                trackingId: mockTrackingId,
                cookieDomain: 'auto',
                name: undefined,
                userId: undefined
            }).to.eql(config);
            done();
        };
        var reactI13nGoogleAnalytics = new ReactI13nGoogleAnalytics(mockTrackingId);
    });

    it('ga will be created once we create a plugin instance with customized tracker', function (done) {

        var mockTrackingId = 'foo';
        var tracker = 'myTracker';
        var mockConfig = {
            trackingId: mockTrackingId,
            cookieDomain: 'auto',
            name: tracker,
            userId: undefined
        };
        global.ga = function (actionName, config){
            expect(actionName).to.eql('create');
            expect(config).to.eql(mockConfig);
            done();
        };
        var reactI13nGoogleAnalytics = new ReactI13nGoogleAnalytics({
            trackingId: mockTrackingId,
            name: tracker
        });
    });


    it('ga will fire pageview beacon for pageview handler correctly for default values', function (done) {
        var reactI13nGoogleAnalytics = new ReactI13nGoogleAnalytics('foo');
        function beaconCallback () {
            done();
        }
        global.ga = function (actionSend, actionName, options) {
            expect(actionSend).to.eql('send');
            expect(actionName).to.eql('pageview');
            expect(options).to.eql(
                {
                    hitCallback: beaconCallback,
                    location: '/foo'
                }
            );
            options.hitCallback && options.hitCallback();
        };
        reactI13nGoogleAnalytics.getPlugin().eventHandlers.pageview({
            location: '/foo'
        }, beaconCallback);
    });

    it('ga will fire pageview beacon for pageview handler with default tracker', function (done) {
        var reactI13nGoogleAnalytics = new ReactI13nGoogleAnalytics('foo');
        global.ga = function (actionSend, actionName, options) {
            expect(actionSend).to.eql('send');
            expect(actionName).to.eql('pageview');
            expect(options.location).to.eql('http://www.mywebsite.com/foo');
            expect(options.page).to.eql('/foo');
            expect(options.title).to.eql('Foo');
            options.hitCallback && options.hitCallback();
        };
        reactI13nGoogleAnalytics.getPlugin().eventHandlers.pageview({
            location: 'http://www.mywebsite.com/foo',
            url: '/foo',
            title: 'Foo'
        }, function beaconCallback () {
            done();
        });
    });

    it('ga will fire pageview beacon for pageview handler with customized tracker', function (done) {
        var reactI13nGoogleAnalytics = new ReactI13nGoogleAnalytics('foo');
        var tracker = 'myTracker';
        global.ga = function (actionSend, actionName, options) {
            expect(actionSend).to.eql(tracker + '.send');
            expect(actionName).to.eql('pageview');
            expect(options.location).to.eql('http://www.mywebsite.com/foo');
            expect(options.page).to.eql('/foo');
            expect(options.title).to.eql('Foo');
            options.hitCallback && options.hitCallback();
        };
        reactI13nGoogleAnalytics.getPlugin().eventHandlers.pageview({
            tracker: tracker,
            location: 'http://www.mywebsite.com/foo',
            url: '/foo',
            title: 'Foo'
        }, function beaconCallback () {
            done();
        });
    });


    it('ga will fire event beacon for click handler', function (done) {
        var reactI13nGoogleAnalytics = new ReactI13nGoogleAnalytics('foo');
        var tracker = 'myTracker';
        var i13nNode = new I13nNode(null, {tracker: tracker, category: 'foo', action: 'bar', label: 'baz', value: 1});
        global.ga = function (actionSend, actionName, category, action, label, value, options) {
            expect(actionSend).to.eql(tracker + '.send');
            expect(actionName).to.eql('event');
            expect(category).to.eql('foo');
            expect(action).to.eql('bar');
            expect(label).to.eql('baz');
            expect(value).to.eql(1);
            options.hitCallback && options.hitCallback();
        };
        reactI13nGoogleAnalytics.getPlugin().eventHandlers.click({
            i13nNode: i13nNode
        }, function beaconCallback () {
            done();
        });
    });

    it('ga will fire click for command handler with default tracker', function (done) {
        var reactI13nGoogleAnalytics = new ReactI13nGoogleAnalytics('foo');
        global.ga = function (actionSend, actionName, category, action) {
            expect(actionSend).to.eql('send');
            expect(actionName).to.eql('event');
            expect(category).to.eql('Outbound Link');
            expect(action).to.eql('click');
        };
        reactI13nGoogleAnalytics.getPlugin().eventHandlers.command({
            commandName: 'send',
            arguments: [
                'event',
                'Outbound Link',
                'click'
            ]
        }, function beaconCallback () {
            done();
        });
    });

    it('ga will fire click for command handler with customized tracker', function (done) {
        var reactI13nGoogleAnalytics = new ReactI13nGoogleAnalytics('foo');
        var tracker = 'myTracker';
        global.ga = function (actionSend, actionName, category, action) {
            expect(actionSend).to.eql(tracker + '.send');
            expect(actionName).to.eql('event');
            expect(category).to.eql('Outbound Link');
            expect(action).to.eql('click');
        };
        reactI13nGoogleAnalytics.getPlugin().eventHandlers.command({
            tracker: tracker,
            commandName: 'send',
            arguments: [
                'event',
                'Outbound Link',
                'click'
            ]
        }, function beaconCallback () {
            done();
        });
    });

});
