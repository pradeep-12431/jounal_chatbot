import React from "react";
import RazorpayButton from "../components/RazorpayButton";

const Subscribe = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🪙 Subscription Plans</h1>
      <p className="mb-6 text-center">Select a plan and unlock full features!</p>
      <div className="text-center mb-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => alert("✅ Trial activated for 4 days! (you'll need to implement logic)")}
        >
          🎉 Try Free Trial (4 Days)
        </button>
      </div>

      <div className="flex flex-col gap-4">
      <RazorpayButton userId={user._id} plan="1month" />
        <RazorpayButton userId={user._id} plan="6months" />
        <RazorpayButton userId={user._id} plan="12months" />
      </div>
    </div>
  );
};

export default Subscribe;