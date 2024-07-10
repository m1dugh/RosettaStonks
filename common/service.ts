import {CURRENT_PRODUCT, FOUNDATIONS_ID, FLUENCY_BUILDER_ID} from "./env";

export interface Service {

    /**
     * Adds time in seconds
     * @param timeSeconds, The time in seconds to add
     * @returns true if it worked, false otherwise
     */
    addTime(timeSeconds: number): Promise<boolean>;

    /**
     * Validates the current course
     * @returns true if it worked, false otherwise
     */
    validateCurrentCourse(): Promise<boolean>;
}

class FoundationsService implements Service {
    async validateCurrentCourse(): Promise<boolean> {
        throw new Error("Not implemented")
    }

    async addTime(timeSeconds: number): Promise<boolean> {
        throw new Error("Not implemented")
    }
}

class FluencyBuilderService implements Service {
    async validateCurrentCourse(): Promise<boolean> {
        throw new Error("Not implemented")
    }

    async addTime(timeSeconds: number): Promise<boolean> {
        throw new Error("Not implemented")
    }
}

export default class ServiceFactory {

    /**
     * Returns the service based on
     * the data of the local storage to
     * determine the current product
     */
    static getService(): Service | null
    {
        const product = localStorage.getItem(CURRENT_PRODUCT)
        if (product === FOUNDATIONS_ID)
            return new FoundationsService()
        else if (product === FLUENCY_BUILDER_ID)
            return new FluencyBuilderService()
        else
            return null
    }
}
