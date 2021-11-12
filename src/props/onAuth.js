/* @flow */

import { ZalgoPromise } from 'zalgo-promise/src';
import { stringifyError } from 'belter/src';

import { upgradeFacilitatorAccessToken } from '../api';
import { getLogger } from '../lib';
import { LSAT_UPGRADE_EXCLUDED_MERCHANTS } from '../constants';

import type { CreateOrder } from './createOrder';
import type { CreateSubscription } from './createSubscription';

export type XOnAuthDataType = {|
    accessToken : ?string
|};

export type OnAuth = (params : XOnAuthDataType) => ZalgoPromise<string | void>;

type GetOnAuthOptions = {|
    getFacilitatorAccessToken : () => ZalgoPromise<string>,
    createOrder : CreateOrder,
    createSubscription : ?CreateSubscription,
    clientID : string
|};

export function getOnAuth({ getFacilitatorAccessToken, createOrder, createSubscription, clientID } : GetOnAuthOptions) : OnAuth {
    const upgradeLSAT = LSAT_UPGRADE_EXCLUDED_MERCHANTS.indexOf(clientID) === -1;

    return ({ accessToken } : XOnAuthDataType) => {
        getLogger().info(`spb_onauth_access_token_${ accessToken ? 'present' : 'not_present' }`);

        return ZalgoPromise.try(() => {
            if (accessToken) {
                if (upgradeLSAT) {
                    return createOrder()
                        .then(orderID => {
                            if (createSubscription) {
                                return accessToken;
                            }

                            return upgradeFacilitatorAccessToken(getFacilitatorAccessToken, { buyerAccessToken: accessToken, orderID });
                        })
                        .then(() => {
                            getLogger().info(`upgrade_lsat_success`);
                            return accessToken;
                        })
                        .catch(err => {
                            getLogger().warn('upgrade_lsat_failure', { error: stringifyError(err) });
                            return accessToken;
                        });
                }
                return accessToken;
            }
        });
    };
}
