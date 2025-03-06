// Setup: https://bun.sh/guides/test/testing-library, this works but causes eslint
// errors even though it's the official documentation. Adding the eslint-disable
/* eslint-disable @typescript-eslint/no-empty-object-type */

import { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import "bun:test";

declare module "bun:test" {
  interface Matchers<T>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  interface AsymmetricMatchers extends TestingLibraryMatchers {}
}
