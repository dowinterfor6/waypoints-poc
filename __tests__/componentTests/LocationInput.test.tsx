import { describe, test, expect, mock, beforeAll } from "bun:test";
import { screen, render, waitFor } from "@testing-library/react";
import LocationInput from "@/pages/components/LocationInput";
import { noop } from "lodash";
import userEvent from "@testing-library/user-event";
import { getAutocompleteSuggestions } from "@/utils/mapsApi";
import { spyOn } from "bun:test";

describe("LocationInputs", () => {
  beforeAll(() => {
    mock.restore();
    mock.module("@/utils/mapsApi", () => ({
      getAutocompleteSuggestions: mock(noop),
    }));
    spyOn(global, "fetch").mockImplementation(async () => ({} as Response));
  });

  test("updates input field with user typed input", async () => {
    const user = userEvent.setup();

    const mockSetValue = mock((newVal) => newVal);

    render(
      <LocationInput
        label="test"
        value=""
        setValue={mockSetValue}
        isRequiredError={false}
        clearIsRequiredError={noop}
      />
    );

    const locationTextField = screen.getByTestId("locationInputTextField");
    const locationInput = locationTextField.querySelector("input");

    expect(locationInput).toBeTruthy();
    expect(locationInput).toBeInTheDocument();

    // .toBeTruthy isn't a type guard, this is to help TS
    if (!!locationInput) {
      const newInput = "asdf";

      await user.type(locationInput, newInput);

      expect(mockSetValue.mock.calls).toEqual(
        newInput.split("").map((v) => [v])
      );
    }
  });

  test("calls the autocomplete suggestions api on finish typing", async () => {
    const user = userEvent.setup();
    const mockSetValue = mock((newVal) => newVal);

    render(
      <LocationInput
        label="test"
        value=""
        setValue={mockSetValue}
        isRequiredError={false}
        clearIsRequiredError={noop}
      />
    );

    const locationTextField = screen.getByTestId("locationInputTextField");
    const locationInput = locationTextField.querySelector("input");

    expect(locationInput).toBeInTheDocument();

    // .toBeTruthy isn't a type guard, this is to help TS
    if (!!locationInput) {
      const newInput = "asdf";

      // Simulates user input, types out keys one by one
      await user.type(locationInput, newInput);

      await waitFor(
        () => expect(getAutocompleteSuggestions).toHaveBeenCalledTimes(1),
        { timeout: 450 }
      );
    }
  });

  test("displays an error when input is required but found to be empty", () => {
    const mockSetValue = mock((newVal) => newVal);

    render(
      <LocationInput
        label="test"
        value=""
        setValue={mockSetValue}
        isRequiredError={true}
        clearIsRequiredError={noop}
      />
    );

    const locationTextField = screen.getByTestId("locationInputTextField");
    const locationInput = locationTextField.querySelector("input");

    expect(locationInput).toBeInTheDocument();

    expect(screen.getByText("test can not be empty")).toBeInTheDocument();
  });
});
