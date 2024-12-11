import React from "react"

import Box from "@mui/material/Box"
import Slider from "@mui/material/Slider"

function RatingSlide({ setValue }) {
  return (
    <Box sx={{ width: "11vw", margin: 0 }}>
      <Slider
        defaultValue={5}
        min={0.0}
        max={10}
        step={0.1}
        aria-label="Default"
        onChange={(e) => setValue(e.target.value)}
        style={{ color: "#105f17", padding: 0 }}
      />
    </Box>
  )
}

export default RatingSlide
