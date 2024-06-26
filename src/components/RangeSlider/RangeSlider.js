import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

function valuetext(value) {
  return `${value}°C`;
}

const RangeSlider = ({ rangeValues }) => {
  const [value, setValue] = useState(rangeValues);

  useEffect(() => {
    setValue(rangeValues);
  }, [rangeValues]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const marks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
    (item) => ({ value: item, label: item ? `${item}k` : `${item}` }),
  );

  return (
    <Box sx={{ width: '100%' }}>
      {
          value && (
            <Slider
              getAriaLabel={() => 'Temperature range'}
              value={value}
              onChange={handleChange}
              valueLabelDisplay="auto"
              getAriaValueText={valuetext}
              marks={marks}
              step={5}
            />
          )
      }
    </Box>
  );
};

export default RangeSlider;
