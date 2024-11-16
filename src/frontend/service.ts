import { CurrentProductKey, FoundationsKey, FoundationsTimeRequestKey } from "../lib/env.ts";
import { Request } from "../worker/request.ts";

export interface Service {
    addTime(time: Date): Promise<void>;
    validateLesson(): Promise<void>;
}

export async function getService(): Promise<Service> {
    const product = await browser.storage.session.get(CurrentProductKey)

    if (product === FoundationsKey || true)
        return new FoundationsService()

    throw new Error("Invalid product")
}

export class FoundationsService implements Service {
    /**
        * The maximum time a request can have
        */
    private maxTime = 1000 * 60 * 8;

    private createTimeRequest(base: Request, timeMs: number): Request {
        const body = new DOMParser().parseFromString(base.body, "text/xml")
        const rootTag = body.documentElement.tagName

        body.documentElement.getElementsByTagName("delta_time")[0].innerHTML = timeMs.toString();
        body.documentElement.getElementsByTagName("updated_at")[0].innerHTML = Date.now().toString()

        const editedBody = `<${rootTag}>${body.documentElement.innerHTML}</${rootTag}>`
        base.body = editedBody
        return base
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
      const req = (await browser.storage.session.get(FoundationsTimeRequestKey))[FoundationsTimeRequestKey]
      if (req === undefined)
          throw Error("Could not add time")

      console.log("found request", req)

      const requests = this.getTimeRequests(req, time)
      console.debug("sending requests", requests)
      const promises = requests.map(req => fetch(req.url, {
          method: req.method,
          headers: req.requestHeaders as HeadersInit,
          body: req.body,
      }))

      return await Promise.all(promises).then(() => {})
    }

    async validateLesson(): Promise<void> {
      
    }
}
