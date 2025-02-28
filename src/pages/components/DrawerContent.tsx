import { Clear } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC, useState } from "react";

const DrawerContent: FC = () => {
  const [totals, setTotals] = useState<{
    distance: number | null;
    time: number | null;
  }>({ distance: null, time: null });

  const [errors, setErrors] = useState<Array<string>>([]);

  const onClearStartingLocation = () => {
    console.log("clear");
  };

  const onClearDropoffLocation = () => {
    console.log("clear 2");
  };

  return (
    <Stack spacing={6} sx={{ padding: 6, marginTop: 4 }}>
      <TextField
        label="Starting Location"
        variant="outlined"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onClearStartingLocation}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        label="Drop-off Point"
        variant="outlined"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onClearDropoffLocation}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Box
        component="section"
        sx={{
          height: 100,
          justifyContent: "flex-end",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack>
          <Stack>
            {Number.isFinite(totals.distance) &&
              Number.isFinite(totals.time) && (
                <>
                  <Typography variant="body1">Total Distance: {}</Typography>
                  <Typography variant="body1">Total Time: {}</Typography>
                </>
              )}
          </Stack>
          <Box>
            {!!errors.length && <Typography variant="body1">Errors</Typography>}
          </Box>
        </Stack>
      </Box>
      <Box component="section">
        <Stack
          direction="row"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button variant="contained">Submit</Button>
          <Button variant="contained">Reset</Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export { DrawerContent };
