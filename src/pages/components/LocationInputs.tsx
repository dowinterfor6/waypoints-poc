import { getAutocompleteSuggestions } from "@/utils/mapsApi";
import { Clear } from "@mui/icons-material";
import { Autocomplete, TextField } from "@mui/material";
import { debounce } from "lodash";
import React, { Dispatch, FC, SetStateAction, useState } from "react";

type Props = {
  label: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
};

const LocationInput: FC<Props> = ({ label, value, setValue }) => {
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    Array<string>
  >([]);

  const fetchAutocompleteSuggestions = async (value: string) => {
    if (value === "") {
      return [];
    }

    const autoCompleteSuggestions = await getAutocompleteSuggestions(value);

    if (!!autoCompleteSuggestions) {
      setAutocompleteSuggestions(autoCompleteSuggestions);
    }
  };

  const debouncedFetchAutocompleteSuggestions = debounce(
    (value) => fetchAutocompleteSuggestions(value),
    400
  );

  return (
    <Autocomplete
      freeSolo
      options={autocompleteSuggestions}
      clearIcon={<Clear />}
      inputValue={value}
      onInputChange={(_, value) => {
        setValue(value);
        debouncedFetchAutocompleteSuggestions(value);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
    />
  );
};

export { LocationInput };
