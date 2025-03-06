import { getAutocompleteSuggestions } from "@/utils/mapsApi";
import { Clear } from "@mui/icons-material";
import { Autocomplete, TextField } from "@mui/material";
import { debounce } from "lodash";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

type Props = {
  label: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  isRequiredError: boolean;
  clearIsRequiredError: () => void;
};

const LocationInput: FC<Props> = ({
  label,
  value,
  setValue,
  isRequiredError,
  clearIsRequiredError,
}) => {
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Array<string>
  >([]);

  /**
   * @see https://github.com/facebook/react/issues/19240#issuecomment-652945246 for
   * why a useMemo is needed in conjunction with useCallback
   *
   * TLDR: The debounced function reference changes every rerender, therefore a
   * useCallback is needed to stop it from doing so. The eslint rule wasn't happy
   * about a non-inline function, so adding a useMemo to evaluate a (memoized)
   * version of the function fixes the issue.
   */
  const debouncedFetchAutocompleteSuggestions = useMemo(
    () =>
      debounce(async (value: string) => {
        if (value === "") {
          setAutocompleteSuggestions([]);
          return;
        }

        const autoCompleteSuggestions = await getAutocompleteSuggestions(value);

        setAutocompleteSuggestions(autoCompleteSuggestions ?? []);
      }, 400),
    [setAutocompleteSuggestions]
  );

  const usedCallbackDebouncedFetchAutocompleteSuggestions = useCallback(
    debouncedFetchAutocompleteSuggestions,
    [debouncedFetchAutocompleteSuggestions]
  );

  return (
    <Autocomplete
      freeSolo
      /**
       * This MUI component has in interesting quirk that it also filters on the
       * options at the same time the input is being changed. What this means is
       * that there's an interesting UX where the autocomplete suggestions fetch
       * is being debounced and waiting for the user to finish typing, but the
       * user input is already filtering the existing `options`.
       *
       * Since this is a feature of the MUI component, and not my API implementation
       * I won't address this minor UX issue.
       */
      options={autocompleteSuggestions}
      clearIcon={<Clear />}
      inputValue={value}
      onInputChange={(_, newValue) => {
        setValue(newValue);

        usedCallbackDebouncedFetchAutocompleteSuggestions(newValue);

        if (isRequiredError) {
          clearIsRequiredError();
        }
      }}
      renderInput={(params) => (
        <TextField
          data-testid="locationInputTextField"
          {...params}
          label={label}
          variant="outlined"
          required
          error={isRequiredError}
          helperText={isRequiredError ? `${label} can not be empty` : ""}
        />
      )}
    />
  );
};

export default LocationInput;
