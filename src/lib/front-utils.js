"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeRequests = exports.getBodyEditor = void 0;
const model_1 = require("./model");
;
function createRandomUUID() {
    const seqlen = 8;
    const seqcount = 3;
    let res = "";
    for (let i = 0; i < seqcount; i++) {
        let charCodes = [];
        for (let j = 0; j < seqlen; j++) {
            const val = Math.round(Math.random() * 16);
            if (val < 10) {
                charCodes.push(48 + val);
            }
            else {
                charCodes.push(97 - 10 + val);
            }
        }
        if (i === 0) {
            res = String.fromCharCode(...charCodes);
        }
        else {
            res += "-" + String.fromCharCode(...charCodes);
        }
    }
    return res;
}
function fluencyBuilderBodyEdit(bodyString, time) {
    const body = JSON.parse(bodyString);
    const durationMs = time.getMilliseconds();
    const messages = body.variables.messages;
    for (let message of messages) {
        message.durationMs = durationMs;
        message.activityAttemptId = createRandomUUID();
        message.activityStepAttemptId = createRandomUUID();
    }
    return JSON.stringify(body);
}
function foundationsBodyEdit(bodyString, time) {
    const body = new DOMParser().parseFromString(bodyString, "text/xml");
    const rootTag = body.documentElement.tagName;
    body.documentElement.getElementsByTagName("delta_time")[0].innerHTML = time.valueOf().toString();
    body.documentElement.getElementsByTagName("updated_at")[0].innerHTML = Date.now().toString();
    return `<${rootTag}>${body.documentElement.innerHTML}</${rootTag}>`;
}
function getBodyEditor(config) {
    if (config.name === model_1.FluencyBuilderConfig.name)
        return fluencyBuilderBodyEdit;
    else if (config.name === model_1.FoundationsConfig.name)
        return foundationsBodyEdit;
    return null;
}
exports.getBodyEditor = getBodyEditor;
function getTimeRequests(config, time, baseRequest) {
    const bodyEditor = getBodyEditor(config);
    if (bodyEditor === null)
        return null;
    if (config.maxTime === undefined) {
        const body = bodyEditor(baseRequest.body, time);
        return [Object.assign(Object.assign({}, baseRequest), { body })];
    }
    else {
        let remainingTime = time;
        let res = [];
        for (; remainingTime.valueOf() - config.maxTime.valueOf() > 0; remainingTime = new Date(remainingTime.valueOf() - config.maxTime.valueOf())) {
            const body = bodyEditor(baseRequest.body, config.maxTime);
            res.push(Object.assign(Object.assign({}, baseRequest), { body }));
        }
        const body = bodyEditor(baseRequest.body, remainingTime);
        res.push(Object.assign(Object.assign({}, baseRequest), { body }));
        return res;
    }
}
exports.getTimeRequests = getTimeRequests;
