'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, HelpCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/lib/types';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hi! I\'m the FAQ Helper. I can help you with common questions about products, categories, and how to use this site. What would you like to know?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Simulate response
        setTimeout(() => {
            const botResponseText = generateResponse(userMsg.text);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 800);
    };

    const generateResponse = (text: string): string => {
        const lower = text.toLowerCase();

        // Greetings
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            return "Hello! How can I assist you today? You can ask about products, categories, shipping, or how our AI recommendations work.";
        }

        // Product categories
        if (lower.includes('electronics') || lower.includes('tech')) {
            return "Our Tech & Electronics category features top-rated gadgets like headphones, smart home devices, and more. Use the category filter to browse!";
        }
        if (lower.includes('kitchen')) {
            return "The Kitchen category includes popular items like the Instant Pot and Nespresso machines. These are hand-picked for quality and value!";
        }
        if (lower.includes('audio') || lower.includes('headphone') || lower.includes('speaker')) {
            return "Check out our Audio category for top-rated headphones like the Sony WH-1000XM5 and Echo Dot smart speakers.";
        }
        if (lower.includes('home')) {
            return "Our Home category features items like the Dyson V15 vacuum - highly rated for performance and build quality.";
        }

        // Phone/device questions
        if (lower.includes('phone') || lower.includes('iphone') || lower.includes('android')) {
            return "We focus on accessories and smart home devices. For phones, check out AirTags for tracking or Echo devices for smart home control!";
        }

        // How it works
        if (lower.includes('how') && (lower.includes('work') || lower.includes('ai') || lower.includes('recommend'))) {
            return "We analyze thousands of customer reviews to find the best products. Our system looks at ratings, value, and real user feedback to curate our recommendations.";
        }

        // Price/shipping
        if (lower.includes('price') || lower.includes('cost')) {
            return "Click 'Buy Now' on any product to see the current price on Amazon. Prices are updated in real-time!";
        }
        if (lower.includes('ship') || lower.includes('delivery')) {
            return "All purchases are made through Amazon, so you get their standard shipping options including Prime delivery if you're a member.";
        }

        // Wishlist
        if (lower.includes('wishlist') || lower.includes('save') || lower.includes('favorite')) {
            return "Click the heart icon on any product to add it to your wishlist. Your wishlist is saved locally and you can access it from the heart icon in the navbar.";
        }

        // Search
        if (lower.includes('search') || lower.includes('find')) {
            return "Use the search bar at the top to find products by name or description. You can also filter by category and sort by price or rating.";
        }

        // Help
        if (lower.includes('help') || lower.includes('support')) {
            return "I can help with: product categories, how AI picks work, wishlist features, search tips, and general questions. What would you like to know?";
        }

        // Thank you
        if (lower.includes('thank') || lower.includes('thanks')) {
            return "You're welcome! Let me know if you have any other questions. Happy shopping! 🛍️";
        }

        // Default response
        return "I'm a FAQ helper with limited responses. Try asking about: product categories (Tech, Kitchen, Audio), how our AI recommendations work, wishlist features, or searching for products.";
    };

    return (
        <>
            {/* FAB */}
            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition-colors border-2 border-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isOpen ? 'Close FAQ Helper' : 'Open FAQ Helper'}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <HelpCircle className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">FAQ Helper</h3>
                                <p className="text-xs text-amber-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    Quick Answers
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`p-2 rounded-full shrink-0 ${msg.sender === 'user' ? 'bg-white/10' : 'bg-amber-500/20'}`}>
                                        {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <HelpCircle className="w-4 h-4 text-amber-400" />}
                                    </div>
                                    <div
                                        className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.sender === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white/10 text-gray-200 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 placeholder:text-gray-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="p-2 bg-amber-500 text-white rounded-lg disabled:opacity-50 hover:bg-amber-600 transition-colors"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
