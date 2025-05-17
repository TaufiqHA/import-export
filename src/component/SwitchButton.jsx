import React from "react";

const SwitchToggle = ({ onTurnOn, onTurnOff, isOn }) => {

  const handleToggle = () => {
    isOn ? onTurnOff() : onTurnOn();
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
        isOn ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${
          isOn ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

export default SwitchToggle;
