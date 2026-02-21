import { expect } from "bun:test";
import type { MatcherResult } from "bun:test";

const statusCode= async (received: unknown, expected: number): Promise<MatcherResult> => {

    if (!(received instanceof Response)) {
        return {
            pass: false,
            message: () => `Expected a Response object, but received ${typeof received}`,
        };
    }
    
    const { status } = received;
    const pass = status === expected;


    if (pass) {
        return {
            pass,
            message: () => `Expected status ${expected}, but got ${received.status}`,
        };
    } else {
        const body =  await received.text();
        return {
            message: () => `expected ${status} to be ${expected}. Response: ${JSON.stringify({
                status: received.status,
                statusText: received.statusText,
                headers: { ...received.headers },
                body,
            })}`,
            pass: false,
        };
    }
};


expect.extend({
    statusCode,
});

declare module "bun:test" {
  interface Matchers<T> {
    statusCode(expected: number): Promise<T>;
  }
}