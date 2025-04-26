import React from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { Box } from '@chakra-ui/react';

// You can find the JSON file at https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Define the props interface
interface USMapProps {
  data?: Record<string, number>; // State data mapping (e.g., { "CA": 42, "NY": 25 })
  width?: number;
  height?: number;
}

const USMap: React.FC<USMapProps> = ({
  data = {},
  width = 800,
  height = 400,
}) => {
  // Create a color scale for the states
  const colorScale = scaleQuantize<string>()
    .domain([0, Math.max(...Object.values(data))])
    .range([
      "#ffedea",
      "#ffcec5",
      "#ffad9f",
      "#ff8a75",
      "#ff5533",
      "#e2492d",
      "#be3d26",
      "#9a311f",
      "#782618"
    ]);

  return (
    <Box width={width} height={height}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 800 }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              const stateId = geo.properties.name;
              const value = data[stateId] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={data[stateId] ? colorScale(value) : "#EEE"}
                  stroke="#FFF"
                  strokeWidth={0.5}
                  style={{
                    default: {
                      outline: "none",
                    },
                    hover: {
                      fill: "#064789",
                      outline: "none",
                      cursor: "pointer"
                    },
                    pressed: {
                      outline: "none"
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </Box>
  );
};

export default USMap; 