import { GoogleMapsApiContext } from "@/pages/context/GoogleMapsApiContext";
import { CircularProgress } from "@mui/material";
import React, { FC, useContext } from "react";
import Map from "./Map";

const MapContainer: FC = () => {
  const { isFullyInitialized } = useContext(GoogleMapsApiContext);

  return isFullyInitialized ? <Map /> : <CircularProgress size="50px" />;
};

export default MapContainer;
