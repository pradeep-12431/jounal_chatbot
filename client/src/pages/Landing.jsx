import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Landing = () => {
  useEffect(() => {
    console.log("📍 LANDING PATH:", window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-blue-800"
        >
          Your Mental Wellness Companion
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-700 mt-6 text-lg max-w-2xl mx-auto"
        >
          Log your emotions, get AI-driven support, and track your mental health daily.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded shadow hover:bg-blue-100"
          >
            Login
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-16"
        >
          <span className="text-gray-400 animate-bounce">⬇️</span>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            {
              title: "📝 Daily Journal",
              desc: "Track your mood and thoughts every day.",
            },
            {
              title: "🤖 AI Chat Support",
              desc: "Talk to our empathetic AI chatbot for mental clarity.",
            },
            {
              title: "📊 Mood Analytics",
              desc: "Visualize your emotions and progress over time.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-blue-50 p-6 rounded-lg shadow text-center"
            >
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8 text-blue-700">What Our Users Say</h2>
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="italic text-gray-600 text-lg"
          >
            "This app changed my life. The AI chatbot helped me through a rough patch like no one else could."
          </motion.blockquote>
          <p className="mt-4 text-blue-700 font-semibold">— A Happy User</p>
        </div>
      </section>

      {/* Pricing + CTA */}
      <section className="py-16 bg-white text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Simple Pricing</h2>
        <p className="text-gray-600 mb-6">Start with a free trial. Upgrade when you're ready.</p>
        <div className="flex justify-center gap-6 flex-wrap">
          {[
            { label: "Free Trial", price: "₹0", desc: "3-day full access" },
            { label: "1 Month", price: "₹199", desc: "Unlimited access for 30 days" },
            { label: "6 Months", price: "₹899", desc: "Save big with a half-year plan" },
          ].map((plan, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="border p-6 rounded-lg shadow w-64"
            >
              <h3 className="text-xl font-bold mb-2">{plan.label}</h3>
              <p className="text-2xl text-blue-600 font-semibold mb-2">{plan.price}</p>
              <p className="text-gray-500 mb-4">{plan.desc}</p>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Subscribe
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-4 mb-2">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
        © {new Date().getFullYear()} Mental Health Journal. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;