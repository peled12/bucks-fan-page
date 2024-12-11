import React, { useState } from "react"

// generate options for minutes (0 to 59)
const minuteOptions = Array.from({ length: 60 }, (_, index) => index)

// generate options for hours (0 to 23)
const hourOptions = Array.from({ length: 24 }, (_, index) => index)

function DateSelection({
  currentDate,
  futureDate,
  setselectedDate,
  selectedHour,
  setselectedHour,
  selectedMinute,
  setselectedMinute,
  defaultDateTime,
}) {
  const [currentDateValue, setcurrentDateValue] = useState(
    defaultDateTime
      ? new Date(defaultDateTime).toLocaleString("default", {
          month: "short",
          day: "2-digit",
        })
      : ""
  )

  // generate options for dates (from current date to 60 days later)
  const [dateOptions] = useState(() => {
    const options = []
    for (
      let date = currentDate;
      date <= futureDate;
      date.setDate(date.getDate() + 1)
    )
      options.push(new Date(date))

    return options
  })

  // function to handle changes in minute selection
  function handleMinuteChange(e) {
    setselectedMinute(parseInt(e.target.value))
  }

  // function to handle changes in hour selection
  function handleHourChange(e) {
    setselectedHour(parseInt(e.target.value))
  }

  // function to handle changes in date selection
  function handleDateChange(e) {
    const newSelectedDate = new Date(e.target.value)
    newSelectedDate.setFullYear(currentDate.getFullYear())

    setcurrentDateValue(e.target.value)

    setselectedDate(newSelectedDate)
  }

  return (
    <div className="date-selection">
      <div>
        <p>Date</p>
        <select value={currentDateValue} onChange={handleDateChange}>
          {dateOptions.map((date) => (
            <option
              key={date.toISOString()}
              value={date.toLocaleString("default", {
                month: "short",
                day: "2-digit",
              })}
            >
              {date.toLocaleString("default", {
                month: "short",
                day: "2-digit",
              })}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p>Hour</p>
        <select value={selectedHour} onChange={handleHourChange}>
          {hourOptions.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p>Minute</p>
        <select value={selectedMinute} onChange={handleMinuteChange}>
          {minuteOptions.map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default DateSelection
