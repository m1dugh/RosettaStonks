import { ProductConfig, FluencyBuilderConfig, FoundationsConfig } from './model';

export interface CustomRequest {
    url: string;
    body: string;
    headers: any;
};

function createRandomUUID() {
    const seqlen = 8
    const seqcount = 3
    let res: string = "";

    for (let i = 0; i < seqcount; i++) {
        let charCodes: number[] = []
        for(let j = 0; j < seqlen; j++) {
            const val = Math.round(Math.random() * 16)
            if (val < 10) {
                charCodes.push(48 + val)
            } else {
                charCodes.push(97 - 10 + val)
            }
        }
        if (i === 0) {
            res = String.fromCharCode(...charCodes)
        } else {
            res += "-" + String.fromCharCode(...charCodes)
        }
    }

    return res
}


function fluencyBuilderBodyEdit(bodyString: string, time: Date) {
    const body: any = JSON.parse(bodyString)
    const durationMs = time.getMilliseconds()

    const messages: any[] = body.variables.messages
    for (let message of messages) {
        message.durationMs = durationMs
        message.activityAttemptId = createRandomUUID()
        message.activityStepAttemptId = createRandomUUID()
    }

    return JSON.stringify(body)
}

function foundationsBodyEdit(bodyString: string, time: Date) {
    const body = new DOMParser().parseFromString(bodyString, "text/xml");
    const rootTag = body.documentElement.tagName

    body.documentElement.getElementsByTagName("delta_time")[0].innerHTML = time.valueOf().toString();
    body.documentElement.getElementsByTagName("updated_at")[0].innerHTML = Date.now().toString()

    return `<${rootTag}>${body.documentElement.innerHTML}</${rootTag}>`
}

export type BodyEditor = ((body: string, time: Date) => string) | null

export function getBodyEditor(config: ProductConfig): BodyEditor {
    if (config.name === FluencyBuilderConfig.name)
        return fluencyBuilderBodyEdit;
    else if (config.name === FoundationsConfig.name)
        return foundationsBodyEdit;

    return null
}

export function getTimeRequests(config: ProductConfig, time: Date, baseRequest: CustomRequest): CustomRequest[] | null {
    const bodyEditor = getBodyEditor(config)
    if (bodyEditor === null)
        return null;

    if (config.maxTime === undefined) {
        const body = bodyEditor(baseRequest.body, time)
        return [{
            ...baseRequest,
            body,
        }]
    } else {
        let remainingTime = time
        let res = []
        for (; remainingTime.valueOf() - config.maxTime.valueOf() > 0; remainingTime = new Date(remainingTime.valueOf() - config.maxTime.valueOf())) {
            const body = bodyEditor(baseRequest.body, config.maxTime)
            res.push({
                ...baseRequest,
                body,
            })
        }
        const body = bodyEditor(baseRequest.body, remainingTime)
        res.push({
            ...baseRequest,
            body,
        })

        return res
    }
}
