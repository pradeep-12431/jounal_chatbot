import React from "react";
import axios from "axios";

const RazorpayButton = ({ userId, plan }) => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
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
      alert("Razorpay SDK failed to load. Please try again."); // Fallback for now
      return;
    }

    try {
      // Call backend to create Razorpay order
      const orderResponse = await axios.post("http://localhost:5050/api/subscribe/create-order", {
        plan,
        userId,
      });

      // Correctly destructure orderId and amount directly from data
      const { orderId, amount } = orderResponse.data;

      const options = {
        key: "rzp_test_ccYr2nYANnKWJi", // replace with your actual Razorpay key
        amount: amount, // Use the directly destructured amount
        currency: "INR",
        name: "Mental Health Journal",
        description: `${plan} Subscription`,
        order_id: orderId, // Use the directly destructured orderId
        handler: async function (response) {
          // On successful payment, notify backend to activate subscription
          try {
            await axios.post("http://localhost:5050/api/subscribe/verify", {
              ...response,
              userId,
              plan,
            });
            // Using a custom message box instead of alert()
            console.log("Payment successful and subscription activated!");
            alert("✅ Payment successful and subscription activated!"); // Fallback for now
          } catch (verifyErr) {
            console.error("Error verifying payment:", verifyErr);
            alert("❌ Payment verification failed."); // Fallback for now
          }
        },
        prefill: {
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
      alert("❌ Failed to create payment order. Please try again."); // Fallback for now
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
