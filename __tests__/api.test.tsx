import { describe, expect, spyOn, test, } from "bun:test";
import { Coordinate } from "@/types";
import {
  API_RESPONSE_STATUS,
  getRoutePathByToken,
  getRouteToken,
} from "@/utils/api";

describe("api", () => {
  describe("getRouteToken", () => {
    test("post /route returns a token on success", async () => {
      spyOn(global, "fetch").mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: "validToken" }),
        } as Response)
      );

      const res = await getRouteToken("asdf", "asdf2");

      expect(res).toEqual({
        status: API_RESPONSE_STATUS.SUCCESS,
        token: "validToken",
      });
    });

    describe("error states", () => {
      test("post /route returns an error message on rejected error state", async () => {
        spyOn(global, "fetch").mockImplementationOnce(() =>
          Promise.reject({} as Response)
        );

        const res = await getRouteToken("asdf", "asdf2");

        expect(res).toEqual({
          status: API_RESPONSE_STATUS.ERROR,
          errorMessage: expect.any(String),
        });
      });

      test("post /route returns an error message on resolved error state", async () => {
        spyOn(global, "fetch").mockImplementationOnce(() =>
          Promise.resolve({
            ok: false,
            url: "https://mock-api.com/route",
            status: 500,
            statusText: "Internal Server Error",
            redirected: false,
            bodyUsed: false,
          } as unknown as Response)
        );

        const res = await getRouteToken("asdf", "asdf2");

        expect(res).toEqual({
          status: API_RESPONSE_STATUS.ERROR,
          errorMessage: expect.any(String),
        });
      });

      test("post /route returns an error message on resolved error state that doesn't contain the token", async () => {
        spyOn(global, "fetch").mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ notTheToken: "asdf" }),
          } as Response)
        );

        const res = await getRouteToken("asdf", "asdf2");

        expect(res).toEqual({
          status: API_RESPONSE_STATUS.ERROR,
          errorMessage: expect.any(String),
        });
      });
    });
  });

  describe("getRoutePathByToken", () => {
    const resolvedData = {
      status: "success",
      path: [
        ["22.372081", "114.107877"],
        ["22.326442", "114.167811"],
        ["22.284419", "114.159510"],
      ] as Array<Coordinate>,
      total_distance: 20000,
      total_time: 1800,
    };

    test("get /route/:token returns path, total distance, and total time on success", async () => {
      spyOn(global, "fetch").mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(resolvedData),
        } as Response)
      );

      const res = await getRoutePathByToken("asdf");

      const {
        path,
        total_distance: totalDistance,
        total_time: totalTime,
      } = resolvedData;

      expect(res).toEqual({
        status: API_RESPONSE_STATUS.SUCCESS,
        path,
        totalDistance,
        totalTime,
      });
    });

    describe("'in progress' status retries", () => {
      test("get /route/:token retries until success on 'in progress' resolved status", async () => {
        spyOn(global, "fetch")
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "in progress" }),
            } as Response)
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "in progress" }),
            } as Response)
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "in progress" }),
            } as Response)
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve(resolvedData),
            } as Response)
          );

        const res = await getRoutePathByToken("asdf");

        const {
          path,
          total_distance: totalDistance,
          total_time: totalTime,
        } = resolvedData;

        expect(res).toEqual({
          status: API_RESPONSE_STATUS.SUCCESS,
          path,
          totalDistance,
          totalTime,
        });
      });

      test("get /route/:token retries until error on 'in progress' resolved status", async () => {
        spyOn(global, "fetch")
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "in progress" }),
            } as Response)
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "in progress" }),
            } as Response)
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ status: "in progress" }),
            } as Response)
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  status: "failure",
                  error: "Location not accessible by car",
                }),
            } as Response)
          );

        const res = await getRoutePathByToken("asdf");

        expect(res).toEqual({
          status: API_RESPONSE_STATUS.ERROR,
          errorMessage: expect.any(String),
        });
      });
    });

    describe("error states", () => {
      test("get /route/:token returns an error message on rejected error state", async () => {
        spyOn(global, "fetch").mockImplementationOnce(() => Promise.reject({}));

        const res = await getRoutePathByToken("asdf");

        expect(res).toEqual({
          status: API_RESPONSE_STATUS.ERROR,
          errorMessage: expect.any(String),
        });
      });

      test("get /route/:token returns an error message on resolved error state that has 'failure' status", async () => {
        spyOn(global, "fetch").mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                status: "failure",
                error: "Location not accessible by car",
              }),
          } as Response)
        );

        const res = await getRoutePathByToken("asdf");

        expect(res).toEqual({
          status: API_RESPONSE_STATUS.ERROR,
          errorMessage: expect.any(String),
        });
      });
    });
  });
});
