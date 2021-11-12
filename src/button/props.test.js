/* @flow */

import { INTENT } from '@paypal/sdk-constants/src';
import { ZalgoPromise } from 'zalgo-promise';

import { getButtonProps } from './props';

describe('getButtonProps', () => {
    const brandedDefault = true;
    const getFacilitatorAccessToken = () => ZalgoPromise.resolve('ABCDEFG12345');
    beforeEach(() => {
        window.xprops = {};
    });

    it('should fail if createBillingAgreement & createOrder are both passed in', () => {
        window.xprops.createBillingAgreement = jest.fn();
        window.xprops.createOrder = jest.fn();
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if createBillingAgreement is passed in but not vault', () => {
        window.xprops.createBillingAgreement =  jest.fn();
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if createSubscription & createOrder are both passed in', () => {
        window.xprops.createSubscription = jest.fn();
        window.xprops.createOrder = jest.fn();
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if createSubscription but not vault', () => {
        window.xprops.createSubscription = jest.fn();
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if intent is tokenize but no createBillingAgreement', () => {
        window.xprops.intent = INTENT.TOKENIZE;
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if intent is tokenize but contains createOrder', () => {
        window.xprops.intent = INTENT.TOKENIZE;
        window.xprops.createBillingAgreement = jest.fn();
        window.xprops.createOrder = () => 'ok';
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if intent is tokenize but contains createSubscription', () => {
        window.xprops.intent = INTENT.TOKENIZE;
        window.xprops.createBillingAgreement = jest.fn();
        window.xprops.createSubscription = jest.fn();
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if intent is subscription but does not contain createSubscription', () => {
        window.xprops.intent = INTENT.SUBSCRIPTION;
        window.xprops.vault = true;
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if intent is subscription but contains createOrder', () => {
        window.xprops.intent = INTENT.SUBSCRIPTION;
        window.xprops.vault = true;
        window.xprops.createSubscription = jest.fn();
        window.xprops.createOrder = jest.fn();
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should fail if intent is subscription but contains createBillingAgreement', () => {
        window.xprops.intent = INTENT.SUBSCRIPTION;
        window.xprops.vault = true;
        window.xprops.createSubscription = jest.fn();
        window.xprops.createBillingAgreement = jest.fn();
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).toThrowError();
    });

    it('should not fail with correct values passed in', () => {
        window.xprops.intent = INTENT.SUBSCRIPTION;
        window.xprops.vault = true;
        window.xprops.createSubscription = jest.fn();
        expect(() => getButtonProps({ getFacilitatorAccessToken, brandedDefault })).not.toThrowError();
    });
});
