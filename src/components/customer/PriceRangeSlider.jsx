import { Range } from "react-range";
import { useState } from "react";

const MIN = 20000;
const MAX = 10000000;

export default function PriceRangeSlider() {
  const [values, setValues] = useState([MIN, MAX]);

  const handleInputChange = (index, value) => {
    const newValues = [...values];
    const parsed = parseInt(value.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) {
      newValues[index] = Math.min(Math.max(parsed, MIN), MAX);
      if (newValues[0] <= newValues[1]) setValues(newValues);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">Khoảng giá</h3>

      {/* Slider */}
      <Range
        step={10000}
        min={MIN}
        max={MAX}
        values={values}
        onChange={setValues}
        renderTrack={({ props, children }) => {
          const [min, max] = values;
          const percentMin = ((min - MIN) / (MAX - MIN)) * 100;
          const percentMax = ((max - MIN) / (MAX - MIN)) * 100;

          return (
            <div
              {...props}
              className="h-2 bg-gray-300 rounded relative"
              style={{ ...props.style }}
            >
              <div
                className="absolute h-2 bg-blue-500 rounded"
                style={{
                  left: `${percentMin}%`,
                  width: `${percentMax - percentMin}%`,
                }}
              />
              {children}
            </div>
          );
        }}
        renderThumb={({ props }) => (
          <div
            {...props}
            className="w-4 h-4 bg-blue-500 rounded-full shadow cursor-pointer"
          />
        )}
      />

      {/* Input giá */}
      <div className="flex justify-between gap-4 text-sm text-gray-600">
        <div className="flex flex-col w-1/2">
          <label className="mb-1 font-medium">Giá tối thiểu</label>
          <input
            type="text"
            value={values[0].toLocaleString()}
            onChange={(e) => handleInputChange(0, e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex flex-col w-1/2">
          <label className="mb-1 font-medium">Giá tối đa</label>
          <input
            type="text"
            value={values[1].toLocaleString()}
            onChange={(e) => handleInputChange(1, e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
    </div>
  );
}