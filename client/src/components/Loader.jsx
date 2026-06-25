import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-indigo-200/80 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
