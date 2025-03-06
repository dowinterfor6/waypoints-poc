import { DrawerContext } from "@/pages/context/DrawerContext";
import { Box, Button, Stack } from "@mui/material";
import React, { FC, useContext } from "react";

const ButtonGroup: FC = () => {
  const { onSubmit, onReset, isLoading } = useContext(DrawerContext);

  return (
    <Box component="section">
      <Stack
        direction="row"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        {/* The UX on this is subjective, but for a simple experience disallowed
    actions while loading will just be disabled */}
        <Button
          variant="contained"
          onClick={onSubmit}
          loading={isLoading}
          data-testid="submitButton"
        >
          Submit
        </Button>
        <Button
          variant="contained"
          onClick={onReset}
          disabled={isLoading}
          data-testid="resetButton"
        >
          Reset
        </Button>
      </Stack>
    </Box>
  );
};

export default ButtonGroup;
