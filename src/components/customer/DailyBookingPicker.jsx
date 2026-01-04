import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DailyBookingPicker({
  checkInDate,        // string "YYYY-MM-DD" hoặc ""
  setCheckInDate,     // setter string
  checkOutDate,       // string "YYYY-MM-DD" hoặc ""
  setCheckOutDate,    // setter string
  onChange,           // callback từ cha (ví dụ handlePickCheckIn)
}) {
  // state nội bộ cho DatePicker (Date objects)
  const [internalStart, setInternalStart] = useState(null);
  const [internalEnd, setInternalEnd] = useState(null);

  // khi props string thay đổi (ví dụ đổi tab), sync vào Date objects
  useEffect(() => {
    if (checkInDate && checkInDate.trim() !== "") {
      const d = new Date(checkInDate);
      setInternalStart(isNaN(d.getTime()) ? null : d);
    } else {
      setInternalStart(null);
    }
  }, [checkInDate]);

  useEffect(() => {
    if (checkOutDate && checkOutDate.trim() !== "") {
      const d = new Date(checkOutDate);
      setInternalEnd(isNaN(d.getTime()) ? null : d);
    } else {
      setInternalEnd(null);
    }
  }, [checkOutDate]);

  // helper: Date -> "YYYY-MM-DD" (local, không lệch ngày)
  const toYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="w-full flex gap-4">
  <DatePicker
    selected={internalStart}
    onChange={(date) => {
      setInternalStart(date || null);
      setCheckInDate(date ? toYMD(date) : "");
      if (typeof onChange === "function") {
        onChange(date, internalEnd);
      }
    }}
    dateFormat="dd/MM/yyyy"
    minDate={new Date()}
    placeholderText="Ngày nhận phòng"
    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-600"
  />

    <DatePicker
      selected={internalEnd}
      onChange={(date) => {
        setInternalEnd(date || null);
        setCheckOutDate(date ? toYMD(date) : "");
        if (typeof onChange === "function") {
          onChange(internalStart, date);
        }
      }}
      dateFormat="dd/MM/yyyy"
      minDate={
        internalStart
          ? new Date(internalStart.getTime() + 24 * 60 * 60 * 1000) // ngày nhận phòng + 1
          : new Date()
      }
      placeholderText="Ngày trả phòng"
      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-600"
    />
</div>
  );
}