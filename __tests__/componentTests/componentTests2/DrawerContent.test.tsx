import { describe, test, expect, mock, beforeAll } from "bun:test";
import { screen, render } from "@testing-library/react";
import DrawerContent from "@/pages/components/Drawer/DrawerContent";
import userEvent from "@testing-library/user-event";
import DrawerContextProvider, {
  ContextValue,
  defaultContextValue,
  DrawerContext,
} from "@/pages/context/DrawerContext";
import { noop } from "lodash";
import { getRouteToken } from "@/utils/api";
import { afterAll } from "bun:test";
import { spyOn } from "bun:test";

const renderWithContext = () =>
  render(
    <DrawerContextProvider
      setWaypoints={noop}
      isMobileViewport
      setIsMobileDrawerOpen={noop}
    >
      <DrawerContent />
    </DrawerContextProvider>
  );

describe("DrawerContent", () => {
  beforeAll(() => {
    mock.module("@/utils/api", () => ({
      getRouteToken: mock(async () => noop),
      getRoutePathByToken: mock(async () => noop),
    }));

    mock.module("@/utils/mapsApi", () => ({
      getAutocompleteSuggestions: mock(async () => noop),
    }));

    spyOn(global, "fetch").mockImplementation(async () => ({} as Response));
  });

  afterAll(() => {
    mock.restore();
  });

  test("calls on submit on valid input", async () => {
    const user = userEvent.setup();

    renderWithContext();

    const locationTextFields = screen.getAllByTestId<HTMLInputElement>(
      "locationInputTextField"
    );
    const locationInputs = locationTextFields
      .map((el) => el.querySelector("input"))
      .filter((el) => !!el);

    expect(locationInputs.length).toBe(2);
    expect(locationInputs[0]).toBeInTheDocument();
    expect(locationInputs[1]).toBeInTheDocument();

    await user.type(locationInputs[0], "start");
    await user.type(locationInputs[1], "end");

    const submitButton = screen.getByTestId("submitButton");

    expect(submitButton).toBeInTheDocument();

    await user.click(submitButton);

    expect(getRouteToken).toHaveBeenCalled();
  });

  test("shows a loading state when api calls are in flight", async () => {
    const values: ContextValue = {
      ...defaultContextValue,
      isLoading: true,
    };

    render(
      <DrawerContext.Provider value={values}>
        <DrawerContent />
      </DrawerContext.Provider>
    );

    const submitButton = screen.getByTestId("submitButton");

    expect(submitButton).toBeInTheDocument();

    const resetButton = screen.getByTestId("resetButton");

    expect(resetButton).toBeInTheDocument();

    expect(submitButton.classList.toString()).toInclude("MuiButton-loading");

    expect(resetButton.classList.toString()).toInclude("Mui-disabled");
  });

  test("resets all fields upon reset button click", async () => {
    const user = userEvent.setup();

    renderWithContext();

    const locationTextFields = screen.getAllByTestId<HTMLInputElement>(
      "locationInputTextField"
    );
    const locationInputs = locationTextFields
      .map((el) => el.querySelector("input"))
      .filter((el) => !!el);

    expect(locationInputs.length).toBe(2);
    expect(locationInputs[0]).toBeInTheDocument();
    expect(locationInputs[1]).toBeInTheDocument();

    await user.type(locationInputs[0], "start");
    await user.type(locationInputs[1], "end");

    const updatedLocationTextFields =
      await screen.findAllByTestId<HTMLInputElement>("locationInputTextField");
    const updatedLocationInputs = updatedLocationTextFields
      .map((el) => el.querySelector("input"))
      .filter((el) => !!el);

    expect(updatedLocationInputs.length).toBe(2);
    expect(updatedLocationInputs[0]).toBeInTheDocument();
    expect(updatedLocationInputs[1]).toBeInTheDocument();

    expect(updatedLocationInputs[0].value).toBe("start");
    expect(updatedLocationInputs[1].value).toBe("end");

    const resetButton = screen.getByTestId("resetButton");

    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);

    const clearedLocationTextFields =
      await screen.findAllByTestId<HTMLInputElement>("locationInputTextField");
    const clearedLocationInputs = clearedLocationTextFields
      .map((el) => el.querySelector("input"))
      .filter((el) => !!el);

    expect(clearedLocationInputs.length).toBe(2);
    expect(clearedLocationInputs[0]).toBeInTheDocument();
    expect(clearedLocationInputs[1]).toBeInTheDocument();

    expect(clearedLocationInputs[0].value).toBe("");
    expect(clearedLocationInputs[1].value).toBe("");
  });

  test("shows an appropriate error if any of the inputs are empty when submitting", async () => {
    const user = userEvent.setup();

    renderWithContext();

    const locationTextFields = screen.getAllByTestId<HTMLInputElement>(
      "locationInputTextField"
    );
    const locationInputs = locationTextFields
      .map((el) => el.querySelector("input"))
      .filter((el) => !!el);

    expect(locationInputs.length).toBe(2);
    expect(locationInputs[0]).toBeInTheDocument();
    expect(locationInputs[1]).toBeInTheDocument();

    await user.type(locationInputs[0], "start");

    const updatedLocationTextFields =
      await screen.findAllByTestId<HTMLInputElement>("locationInputTextField");
    const updatedLocationInputs = updatedLocationTextFields
      .map((el) => el.querySelector("input"))
      .filter((el) => !!el);

    expect(updatedLocationInputs.length).toBe(2);
    expect(updatedLocationInputs[0]).toBeInTheDocument();
    expect(updatedLocationInputs[1]).toBeInTheDocument();

    expect(updatedLocationInputs[0].value).toBe("start");
    expect(updatedLocationInputs[1].value).toBe("");

    const submitButton = screen.getByTestId("submitButton");

    expect(submitButton).toBeInTheDocument();

    await user.click(submitButton);

    const erroredLocationTextFields =
      await screen.findAllByTestId<HTMLInputElement>("locationInputTextField");
    const erroredLocationTextField = erroredLocationTextFields[1];

    expect(erroredLocationTextField).toBeInTheDocument();
    expect(erroredLocationTextField?.innerText).toContain("can not be empty");
  });
});
