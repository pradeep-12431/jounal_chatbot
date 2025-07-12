import React from "react";
import axios from "../api"; // Import your configured axios instance

const RazorpayButton = ({ userId, plan }) => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "[https://checkout.razorpay.com/v1/checkout.js](https://checkout.razorpay.com/v1/checkout.js)";
      script.onload = () => {
        // ⭐ IMPORTANT: Add a small delay to ensure window.Razorpay is fully initialized ⭐
        setTimeout(() => {
          resolve(true);
        }, 100); // Wait for 100ms
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      console.error("Razorpay SDK failed to load.");
      // IMPORTANT: Replace alert with a custom modal/message box in a real app
      alert("Razorpay SDK failed to load. Please try again.");
      return;
    }

    // ⭐ Check if window.Razorpay is available after loading ⭐
    if (typeof window.Razorpay === 'undefined') {
      console.error("window.Razorpay is not defined after script load. Timing issue?");
      alert("Payment system not ready. Please try again in a moment.");
      return;
    }

    try {
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
            // e.g., window.location.reload() or call a prop function to update parent state
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