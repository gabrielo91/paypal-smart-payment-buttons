/* @flow */

import { clientErrorResponse, htmlResponse, allowFrame, defaultLogger, safeJSON, sdkMiddleware,
    isLocalOrTest, type ExpressMiddleware } from '../../lib';
import type { LoggerType, CacheType } from '../../types';

import { EVENT } from './constants';
import { getParams } from './params';
import { getSmartQRCodeClientScript } from './script';

// import { generateQRmodal } from '../../../src/qrcode/qrcard'
// import { svgToBase64 } from 'belter/src';

type QRcodeMiddlewareOptions = {|
    logger? : LoggerType,
    cache? : CacheType,
    cdn? : boolean
|};

export function getQRCodeMiddleware({ logger = defaultLogger, cache, cdn = !isLocalOrTest() } : QRcodeMiddlewareOptions = {}) : ExpressMiddleware {
    const useLocal = !cdn;

    return sdkMiddleware({ logger, cache }, {
        app: async ({ req, res, params, meta, logBuffer }) => {
            logger.info(req, EVENT.RENDER);


            const { cspNonce, qrPath, debug } = getParams(params, req, res);

            const client = await getSmartQRCodeClientScript({ debug, logBuffer, cache, useLocal });

            logger.info(req, `menu_client_version_${ client.version }`);
            logger.info(req, `qrcode_params`, { params: JSON.stringify(params) });
            if (!qrPath) {
                return clientErrorResponse(res, 'Please provide a qrPath query parameter');
            };

            const pageHTML = `
            <!DOCTYPE html>
            <head></head>
            <body data-nonce="${ cspNonce }" data-client-version="${ client.version }">
                ${ meta.getSDKLoader({ nonce: cspNonce }) }
                <script nonce="${ cspNonce }">${ client.script }</script>
                <script nonce="${ cspNonce }">
                    spb.renderQRCode(${ safeJSON({ 
                        cspNonce: cspNonce,
                        qrPath: qrPath
                    }) })
                </script>
            </body>
        `;

        allowFrame(res);
        return htmlResponse(res, pageHTML);
        }
    });
}