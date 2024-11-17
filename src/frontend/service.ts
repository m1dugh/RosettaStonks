import { FluencyBuilderTimeRequestKey, FoundationsCourseRequestKey, FoundationsTimeRequestKey } from "../lib/env.ts";
import { copyRequest, Request } from "../lib/request.ts";
import * as uuid from "jsr:@std/uuid"

export interface Service {
    addTime(time: Date): Promise<void>;
    validateLesson(): Promise<void>;
}

function getTabUrl(): Promise<URL> {
    return new Promise((resolve, reject) => {
        browser.tabs.query({
            active: true,
            currentWindow: true,
        }).then(([tab]: {url: string | undefined}[]) => {
            if (tab.url === undefined) {
                reject()
                return
            }

            const url = URL.parse(tab.url)
            if (url === null)
                reject()
            else
                resolve(url)

        }).catch(reject)
    })
}

export async function getService(): Promise<Service> {
    const url = await getTabUrl()

    if (url.hostname === "totale.rosettastone.com") {
        console.debug("Detected \"foundations\" product")
        return new FoundationsService()
    } else if (url.hostname === "learn.rosettastone.com") {
        console.debug("Detected \"fluency builder\" product")
        return new FluencyBuilderService()
    }

    console.debug("Failed to detect any product")
    throw new Error("Invalid product")
}

export class FluencyBuilderService implements Service {
    async addTime(time: Date): Promise<void> {
      const req = (await browser.storage.session.get(FluencyBuilderTimeRequestKey))[FluencyBuilderTimeRequestKey]
      if (req === undefined || req.body === null)
          throw Error("Could not add time")

      const body = JSON.parse(req.body)
      for (const msg of body.variables.messages) {
          msg.durationMs = time.getMilliseconds()
          msg.activityAttemptId = uuid.v1.generate()
          msg.activityStepAttemptId = uuid.v1.generate()
      }
      req.body = JSON.stringify(body)

      return await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body,
      }).then(() => {})
    }

    validateLesson(): Promise<void> {
        throw new Error("TODO: not implemented")
    }
}

export class FoundationsService implements Service {
    /**
        * The maximum time a request can have
        */
    private maxTime = 1000 * 60 * 8;

    private createTimeRequest(base: Request, timeMs: number): Request {
        const res = copyRequest(base)
        const body = new DOMParser().parseFromString(res.body, "text/xml")
        const rootTag = body.documentElement.tagName

        body.documentElement.getElementsByTagName("delta_time")[0].innerHTML = timeMs.toString();
        body.documentElement.getElementsByTagName("updated_at")[0].innerHTML = Date.now().toString()

        const editedBody = `<${rootTag}>${body.documentElement.innerHTML}</${rootTag}>`
        res.body = editedBody
        return res
    }

    private getTimeRequests(base: Request, time: Date): Request[] {
        let remaining = time.getTime()
        const result: Request[] = []
        while (remaining > this.maxTime) {
            result.push(this.createTimeRequest(base, this.maxTime))
            remaining -= this.maxTime
        }

        if (remaining > 0)
            result.push(this.createTimeRequest(base, remaining))

        return result
    }

    async addTime(time: Date): Promise<void> {
      const req: Request = (await browser.storage.session.get(FoundationsTimeRequestKey))[FoundationsTimeRequestKey]
      if (req === undefined)
          throw Error("Could not add time")

      const requests = this.getTimeRequests(req, time)

      console.debug("sending requests", requests)
      const promises = requests.map(req => fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body,
      }))

      return await Promise.all(promises).then(() => {})
    }

    private async generateValidateRequests(req: Request): Promise<Request[]> {
        const res = await fetch(req.url, {
            method: "GET",
            headers: req.headers,
        })

        const body = new DOMParser().parseFromString(await res.text(), "text/xml")
        const requests: Request[] = []

        const serializer = new XMLSerializer()

        for (const el of body.querySelectorAll("path_step_score")) {
            const challengeNumber = el.querySelector("number_of_challenges").innerHTML
            const correct = el.querySelector("score_correct")
            if (correct.innerHTML === challengeNumber)
                continue

            correct.innerHTML = challengeNumber

            const pathStep = el.querySelector("path_step_media_id").innerHTML
            if (!pathStep)
                continue

            const url = req.url + "&" + new URLSearchParams({
                _method: "put",
                path_step_media_id: pathStep,
            })

            const bodyString: string = serializer.serializeToString(el)
            requests.push({
                url,
                method: "POST",
                headers: req.headers,
                body: bodyString,
            })
        }

        return requests
    }

    async validateLesson(): Promise<void> {
      const req = (await browser.storage.session.get(FoundationsCourseRequestKey))[FoundationsCourseRequestKey]
      if (req === undefined)
          throw Error("Could not add time")

      const requests = await this.generateValidateRequests(req)

      await Promise.all(requests.map(({url, body, headers}) => fetch(url, {
          method: "POST",
          body,
          headers
      })))
    }
}
