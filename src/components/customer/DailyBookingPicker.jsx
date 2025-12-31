import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export default function DailyBookingPicker({
  checkInDate,        // string "YYYY-MM-DD" hoặc ""
  setCheckInDate,     // setter string
  checkOutDate,       // string "YYYY-MM-DD" hoặc ""
  setCheckOutDate,    // setter string
}) {
  // state nội bộ cho DatePicker (Date objects)
  const [internalStart, setInternalStart] = useState(null);
  const [internalEnd, setInternalEnd] = useState(null);

  // khi props string thay đổi (ví dụ đổi tab), sync vào Date objects
  useEffect(() => {
    setInternalStart(checkInDate ? new Date(checkInDate) : null);
  }, [checkInDate]);

  useEffect(() => {
    setInternalEnd(checkOutDate ? new Date(checkOutDate) : null);
  }, [checkOutDate]);

  // helper: Date -> "YYYY-MM-DD"
  const toYMD = (d) => d.toISOString().split("T")[0];

  // cộng thêm 1 ngày cho endDate để inclusive
  const addOneDay = (d) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + 1);
    return copy;
  };

  return (
    <div className="w-full">
      <DatePicker
        selectsRange
        startDate={internalStart}
        endDate={internalEnd}
        onChange={(update) => {
          const [start, end] = update;
          // cập nhật nội bộ (Date) cho DatePicker
          setInternalStart(start || null);
          setInternalEnd(end || null);
          // cập nhật state bên ngoài (string) để render/submit
          setCheckInDate(start ? toYMD(start) : "");
          setCheckOutDate(end ? toYMD(addOneDay(end)) : ""); // inclusive
        }}
        dateFormat="dd/MM/yyyy"
        minDate={new Date()}
        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 1))}
        isClearable
        placeholderText="Khoảng ngày"
        className="w-full border rounded-lg px-4 py-3 font-semibold"
        wrapperClassName="w-full"
      />
    </div>
  );
}