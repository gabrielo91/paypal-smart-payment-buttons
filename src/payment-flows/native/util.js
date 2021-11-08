/* @flow */

import { type AppDetect } from '../types';

export const appDetected : ({| app : AppDetect |}) => boolean = (() => {
    let called = false;

    return function detectApp({ app }) : boolean {
        if (called) {
            return false;
        }

        called = true;
        return app ? true : false;
    };
})();
