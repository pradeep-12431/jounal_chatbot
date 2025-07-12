import React, { useState, useEffect, useRef } from 'react';
import axios from '../api'; // Assuming you have an axios instance configured
import '../styles/Chatbot.css';

// Accept onClose prop
const Chatbot = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState('loading');
    const messagesEndRef = useRef(null);

    const userId = localStorage.getItem('userId');

    // Function to scroll to the bottom of the messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch subscription status on component mount
    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
            if (!userId) {
                setSubscriptionStatus('inactive');
                return;
            }
            try {
                const res = await axios.get(`/subscribe/status/${userId}`);
                setSubscriptionStatus(res.data.status || 'inactive');
            } catch (err) {
                console.error("Failed to fetch subscription status for chatbot:", err);
                setSubscriptionStatus('inactive');
            }
        };
        fetchSubscriptionStatus();
    }, [userId]);

    // Scroll to bottom whenever messages update
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        const userMessage = { sender: 'user', text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('/chat', { message: input });
            const botMessage = { sender: 'bot', text: response.data.reply };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'bot', text: 'Sorry, I could not get a response. Please try again later.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (subscriptionStatus === 'loading') {
        return (
            // Apply the new wrapper for loading state too for consistent styling
            <div className="chatbot-container-wrapper">
                <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md">
                    <p className="text-gray-700">Loading chatbot...</p>
                </div>
            </div>
        );
    }

    if (subscriptionStatus === 'inactive') {
        return (
            // Apply the new wrapper for inactive state too
            <div className="chatbot-container-wrapper">
                <div className="chatbot-card p-8 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Chatbot Access Denied</h2>
                    <p className="text-gray-700 mb-6">
                        You need an active or trial subscription to use the chatbot.
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    >
                        Go to Journal (Upgrade)
                    </button>
                </div>
            </div>
        );
    }

    // If subscriptionStatus is 'active' or 'trial', render the chatbot
    return (
        <div className="chatbot-container-wrapper"> {/* New wrapper class */}
            <div className="chatbot-card"> {/* Main chat card */}
                {/* Chat Header */}
                <div className="chatbot-header">
                    <h1 className="chatbot-title">Mental Wellness Chatbot</h1> {/* Used new class */}
                    <button
                        onClick={onClose}
                        // Removed previous inline Tailwind classes as CSS handles it
                    >
                        Back to Journal
                    </button>
                </div>

                {/* Chat Messages Area */}
                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chatbot-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`} // Used new class
                        >
                            {msg.text}
                        </div>
                    ))}
                    {loading && (
                        // Corrected: Removed the JS comment from within JSX element
                        <div className="chatbot-bubble typing">Typing...</div>
                    )}
                    <div ref={messagesEndRef} /> {/* Scroll target */}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="chatbot-input-area"> {/* Used new class */}
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="chatbot-input" // Used new class
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="chatbot-send-button" // Used new class
                        disabled={loading}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;