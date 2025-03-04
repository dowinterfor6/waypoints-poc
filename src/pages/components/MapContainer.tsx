import React, { FC, useEffect, useRef } from "react";
import { Coordinate } from "@/types";
import { uniqueId } from "lodash";
import { getRoutePolyline } from "@/utils/mapsApi";
import polyline from "@mapbox/polyline";

type Props = {
  googleLibrary: typeof google;
  mapsApi: google.maps.MapsLibrary;
  markerApi: google.maps.MarkerLibrary;
  waypoints: Array<Coordinate> | null;
};

const setRoutePolyline = async (
  googleLibrary: typeof google,
  waypoints: Array<Coordinate>,
  map: google.maps.Map
) => {
  try {
    const routePolylineResponse = await getRoutePolyline(waypoints);

    if (!routePolylineResponse) {
      throw new Error("Failed to get routePolylineResponse");
    }

    const decodedPolyline = polyline.decode(routePolylineResponse);

    const formattedDecodedPolyline = decodedPolyline.map(
      ([lat, lng]) => new googleLibrary.maps.LatLng(Number(lat), Number(lng))
    );

    const routePolyline = new googleLibrary.maps.Polyline({
      path: formattedDecodedPolyline,
      geodesic: true,
      strokeColor: "#4381dd",
      strokeOpacity: 0.8,
      strokeWeight: 6,
    });

    routePolyline.setMap(map);
  } catch (error) {
    console.error(error);
  }
};

const MapContainer: FC<Props> = ({
  googleLibrary,
  mapsApi,
  markerApi,
  waypoints,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapsApi.Map(mapContainerRef.current, {
        zoom: 11.2,
        center: { lat: 22.302711, lng: 114.177216 },
        mapTypeId: "roadmap",
        disableDefaultUI: true,
        mapId: uniqueId(),
      });

      if (waypoints && waypoints.length > 0) {
        const markerBounds = new googleLibrary.maps.LatLngBounds();

        waypoints.forEach(([lat, lng], idx) => {
          const pinTextGlyph = new markerApi.PinElement({
            glyph: `${idx + 1}`,
            glyphColor: "white",
          });

          const position = new googleLibrary.maps.LatLng(
            Number(lat),
            Number(lng)
          );

          new markerApi.AdvancedMarkerElement({
            map,
            position,
            content: pinTextGlyph.element,
          });

          markerBounds.extend(position);
        });

        map.fitBounds(markerBounds);

        setRoutePolyline(googleLibrary, waypoints, map);
      }
    }
  }, [
    googleLibrary,
    waypoints,
    mapsApi.Map,
    markerApi.AdvancedMarkerElement,
    markerApi.PinElement,
  ]);

  return (
    <div
      className="map-container"
      ref={mapContainerRef}
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default MapContainer;
