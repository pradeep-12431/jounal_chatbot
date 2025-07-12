import React from "react";
import axios from "../api"; // ⭐ FIX: Import your configured axios instance

const RazorpayButton = ({ userId, plan }) => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "[https://checkout.razorpay.com/v1/checkout.js](https://checkout.razorpay.com/v1/checkout.js)";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      // Using a custom message box instead of alert()
      // You'd need to implement a simple modal/div for this
      console.error("Razorpay SDK failed to load.");
      // IMPORTANT: Replace alert with a custom modal/message box in a real app
      alert("Razorpay SDK failed to load. Please try again.");
      return;
    }

    try {
      // ⭐ FIX: Use the configured axios instance for create-order ⭐
      const orderResponse = await axios.post("/subscribe/create-order", {
        plan,
        userId,
      });

      // Correctly destructure orderId and amount directly from data
      const { orderId, amount } = orderResponse.data;

      const options = {
        // ⭐ IMPORTANT: Use environment variable for Razorpay Key ID ⭐
        // This should be REACT_APP_RAZORPAY_KEY_ID from your Netlify env variables
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "Mental Health Journal",
        description: `${plan} Subscription`,
        order_id: orderId,
        handler: async function (response) {
          // On successful payment, notify backend to activate subscription
          try {
            // ⭐ FIX: Use the configured axios instance for verify ⭐
            await axios.post("/subscribe/verify", {
              ...response,
              userId,
              plan,
            });
            // IMPORTANT: Replace alert with a custom modal/message box in a real app
            console.log("Payment successful and subscription activated!");
            alert("✅ Payment successful and subscription activated!");
            // You might want to refetch subscription status here
            // e.g., window.location.reload() or call a prop function to update parent state
          } catch (verifyErr) {
            console.error("Error verifying payment:", verifyErr);
            // IMPORTANT: Replace alert with a custom modal/message box in a real app
            alert("❌ Payment verification failed.");
          }
        },
        prefill: {
          // ⭐ Consider dynamically prefilling user email from localStorage/context ⭐
          email: "user@example.com", // You might want to dynamically get the user's email here
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Failed to create Razorpay order:", err);
      // IMPORTANT: Replace alert with a custom modal/message box in a real app
      alert("❌ Failed to create payment order. Please try again.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
    >
      Subscribe for {plan}
    </button>
  );
};

export default RazorpayButton;