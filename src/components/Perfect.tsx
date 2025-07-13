import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PerfectProps {
    startAnimation?: boolean;
}

export default function Perfect({ startAnimation = false }: PerfectProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [greenParts, setGreenParts] = useState([false, false]);

    useEffect(() => {
        if (startAnimation) {
            // Start recording after component mounts
            const timer = setTimeout(() => {
                setIsRecording(true);
            }, 500);

            // Stop recording after 1 second
            const stopTimer = setTimeout(() => {
                setIsRecording(false);
            }, 4000);

            return () => {
                clearTimeout(timer);
                clearTimeout(stopTimer);
            };
        }
    }, [startAnimation]);

    useEffect(() => {
        if (startAnimation && isRecording) {
            const firstTimer = setTimeout(() => {
                setGreenParts([true, false]);
            }, 1000);

            // Change second part to green after 400ms
            const secondTimer = setTimeout(() => {
                setGreenParts([true, true]);
            }, 2000);

            return () => {
                clearTimeout(firstTimer);
                clearTimeout(secondTimer);
            };
        }
        // Removed the else block that was resetting to red
    }, [isRecording, startAnimation]);

    return (
        <div className="flex-1 bg-gradient-to-br from-pink-800/20 to-red-800/20 rounded-lg p-6 border border-pink-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">Perfect it</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
                <div className="text-white font-mono text-lg">
                    <motion.div
                        animate={greenParts[0] && greenParts[1] ? { opacity: 0 } : { opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute"
                    >
                        Ch<span className="text-red-500 animate-pulse">oo /ʊ/ </span>se your pr<span className="text-red-500 animate-pulse">e /i/ </span>configured style.
                    </motion.div>
                    
                    <motion.div
                        animate={greenParts[0] && greenParts[1] ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="relative"
                    >
                        Ch<span className="text-green-400">oo</span>se your pr<span className="text-green-400">e</span>configured style.
                    </motion.div>
                </div>
            </div>
            
            <div className="flex justify-center">
                <motion.button
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording 
                            ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                            : 'bg-white/20 hover:bg-white/30'
                    }`}
                    animate={isRecording ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                            "0 0 0 0 rgba(239, 68, 68, 0.4)",
                            "0 0 0 10px rgba(239, 68, 68, 0)",
                            "0 0 0 0 rgba(239, 68, 68, 0)"
                        ]
                    } : {}}
                    transition={{
                        duration: 5,
                        repeat: isRecording ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                >
                    {isRecording ? (
                        <div className="flex space-x-1">
                            <motion.div
                                className="w-1 h-4 bg-white rounded-full"
                                animate={{
                                    height: [4, 12, 4]
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <motion.div
                                className="w-1 h-4 bg-white rounded-full"
                                animate={{
                                    height: [8, 16, 8]
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.1
                                }}
                            />
                            <motion.div
                                className="w-1 h-4 bg-white rounded-full"
                                animate={{
                                    height: [6, 14, 6]
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.2
                                }}
                            />
                        </div>
                    ) : (
                        <svg 
                            className="w-6 h-6 text-white" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                    )}
                </motion.button>
            </div>
        </div>
    )
}