import { describe, expect, spyOn, test } from "bun:test";
import { postMockApi } from "./api";

describe("api", () => {
  // I used this to do TDD to make sure I get the right API response shape
  test.skip("post /route returns a token on success, or error message on error", async () => {
    const res = await postMockApi("asdf", "asdf2");

    try {
      // Test success state
      expect(res).toEqual({ status: "SUCCESS", token: expect.any(String) });
    } catch (_) {
      // Test error state
      expect(res).toEqual({
        status: "ERROR",
        errorMessage: expect.any(String),
      });
    }
  });

  test("post /route returns a token on success", async () => {
    spyOn(global, "fetch").mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "validToken" }),
      } as Response)
    );

    const res = await postMockApi("asdf", "asdf2");

    expect(res).toEqual({ status: "SUCCESS", token: "validToken" });
  });

  describe("error states", () => {
    test("post /route returns an error message on rejected error state", async () => {
      spyOn(global, "fetch").mockImplementationOnce(() =>
        Promise.reject({} as unknown as Response)
      );

      const res = await postMockApi("asdf", "asdf2");

      expect(res).toEqual({
        status: "ERROR",
        errorMessage: expect.any(String),
      });
    });

    test("post /route returns an error message on resolved error state", async () => {
      spyOn(global, "fetch").mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          url: "https://sg-mock-api.lalamove.com/route",
          status: 500,
          statusText: "Internal Server Error",
          headers: {
            date: "Fri, 28 Feb 2025 09:40:24 GMT",
            "content-type": "text/plain; charset=utf-8",
            "content-length": "21",
            connection: "keep-alive",
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,HEAD,PUT,POST,DELETE",
            "waf-ray-id": "f93077ddea5932ec987f45fb6f383242",
            "x-kong-upstream-latency": "1",
            "x-kong-proxy-latency": "0",
            server: "WAF-Gateway/0.37",
            "x-apisix-upstream-status": "500",
          },
          redirected: false,
          bodyUsed: false,
        } as unknown as Response)
      );

      const res = await postMockApi("asdf", "asdf2");

      expect(res).toEqual({
        status: "ERROR",
        errorMessage: expect.any(String),
      });
    });

    test("post /route returns an error message on resolved error state that doesn't contain the token", async () => {
      spyOn(global, "fetch").mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ notTheToken: "asdf" }),
        } as unknown as Response)
      );

      const res = await postMockApi("asdf", "asdf2");

      expect(res).toEqual({
        status: "ERROR",
        errorMessage: expect.any(String),
      });
    });
  });
});
