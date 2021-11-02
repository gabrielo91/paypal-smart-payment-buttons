/* @flow */

import { cleanup, once, stringifyErrorMessage } from 'belter/src';
import { ZalgoPromise } from 'zalgo-promise/src';
import { FUNDING, FPTI_KEY } from '@paypal/sdk-constants/src';

import { getLogger, getPostRobot } from '../../lib';
import { FPTI_CUSTOM_KEY, FPTI_TRANSITION } from '../../constants';
import {  isAppInstalled } from '../lib';

import { MESSAGE } from './constants';

type SetupNativeFallbackOptions = {|
    parentDomain : string
|};

type NativeFallback = {|
    destroy : () => ZalgoPromise<void>
|};

export function setupNativeFallback({ parentDomain = window.location.origin } : SetupNativeFallbackOptions) : NativeFallback {
    if (!window.opener) {
        throw new Error(`Expected window to have opener`);
    }

    const clean = cleanup();
    const destroy = () => clean.all();

    const postRobot = getPostRobot();

    const sendToParent = (event, payload = {}) => {
        return postRobot.send(window.opener, event, payload, { domain: parentDomain })
            .then(({ data }) => data);
    };

    const { env, fundingSource } = window.xprops;

    const appInstalledPromise = once(isAppInstalled({ fundingSource, env })
        .catch(err => {
            getLogger().info('native_popup_android_app_installed_error')
                .track({
                    [FPTI_KEY.TRANSITION]:      FPTI_TRANSITION.NATIVE_POPUP_ANDROID_APP_ERROR,
                    [FPTI_CUSTOM_KEY.ERR_DESC]: `Error: ${ stringifyErrorMessage(err) }`
                }).flush();
            
            return ZalgoPromise.resolve(null);
        }));

    appInstalledPromise.then(app => {
        if (fundingSource === FUNDING.VENMO && app.version && app.id) {
            getLogger().info('native_fallback_retry_venmo_app_switch')
                .track({
                    [FPTI_KEY.TRANSITION]:      FPTI_TRANSITION.NATIVE_FALLBACK_RETRY_VENMO_APP_SWITCH
                }).flush();
            location.replace(window.document.referrer);
        } else {
            sendToParent(MESSAGE.DETECT_WEB_SWITCH);
        }
    });

    return {
        destroy
    };
}
