import React from "react";
import axios from "../api"; // Import your configured axios instance

const RazorpayButton = ({ userId, plan }) => {
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true; // Add async attribute for better loading
      script.defer = true; // Add defer attribute

      script.onload = () => {
        console.log("Razorpay script loaded successfully.");
        // Give it a very small moment, but rely more on direct check
        setTimeout(() => {
          if (typeof window.Razorpay !== 'undefined') {
            resolve(true);
          } else {
            console.error("Razorpay script loaded, but window.Razorpay is still undefined.");
            reject(new Error("Razorpay object not found after script load."));
          }
        }, 50); // Small delay
      };

      script.onerror = (e) => {
        console.error("Razorpay script failed to load:", e);
        reject(new Error("Razorpay SDK failed to load."));
      };

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        console.error("Razorpay SDK failed to load completely.");
        alert("Razorpay SDK failed to load. Please try again.");
        return;
      }

      // Final check before using Razorpay
      if (typeof window.Razorpay === 'undefined') {
        console.error("window.Razorpay is still not defined after script load attempt.");
        alert("Payment system not ready. Please try again in a moment.");
        return;
      }

      // Call backend to create Razorpay order
      const orderResponse = await axios.post("/subscribe/create-order", {
        plan,
        userId,
      });

      const { orderId, amount } = orderResponse.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "Mental Health Journal",
        description: `${plan} Subscription`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await axios.post("/subscribe/verify", {
              ...response,
              userId,
              plan,
            });
            console.log("Payment successful and subscription activated!");
            alert("✅ Payment successful and subscription activated!");
            // You might want to refetch subscription status here
          } catch (verifyErr) {
            console.error("Error verifying payment:", verifyErr);
            alert("❌ Payment verification failed.");
          }
        },
        prefill: {
          email: "user@example.com", // Dynamically get the user's email here if available
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Failed to create Razorpay order:", err);
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