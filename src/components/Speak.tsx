import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import usFlag from "../assets/us_flag.svg";
import ukFlag from "../assets/uk_flag.svg";

interface SpeakProps {
    startAnimation?: boolean;
}

export default function Speak({ startAnimation = false }: SpeakProps) {
    const [text, setText] = useState("");
    const fullText = "Choose your preconfigured style. Input your text. And say it out loud!";
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedAccent, setSelectedAccent] = useState("American");
    const [hasChangedAccent, setHasChangedAccent] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (startAnimation && currentIndex < fullText.length) {
            const timeout = setTimeout(() => {
                setText(fullText.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, 10); // Speed of typing

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, fullText, startAnimation]);

    // Auto-open dropdown after typing animation
    useEffect(() => {
        if (startAnimation && currentIndex === fullText.length) {
            const timeout = setTimeout(() => {
                setIsDropdownOpen(true);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, fullText.length, startAnimation]);

    // Change accent to British and collapse dropdown
    useEffect(() => {
        if (startAnimation && isDropdownOpen && !hasChangedAccent) {
            const timeout = setTimeout(() => {
                setSelectedAccent("British");
                setHasChangedAccent(true);
                
                // Collapse dropdown after accent change
                const collapseTimeout = setTimeout(() => {
                    setIsDropdownOpen(false);
                    
                    // Start recording after dropdown collapses
                    const recordingTimeout = setTimeout(() => {
                        setIsRecording(true);
                    }, 100);
                    
                    return () => clearTimeout(recordingTimeout);
                }, 500);
                
                return () => clearTimeout(collapseTimeout);
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [isDropdownOpen, hasChangedAccent, startAnimation]);

    // Handle transition from recording to playing
    useEffect(() => {
        if (startAnimation && isRecording) {
            // Stop recording after wave animation completes (20 bars * 0.1s delay + 1s duration = 3s)
            const recordingTimeout = setTimeout(() => {
                setIsRecording(false);
                setIsPlaying(true);
            }, 3000);
            
            return () => clearTimeout(recordingTimeout);
        }
    }, [isRecording, startAnimation]);

    const resetAnimations = () => {
        setText("");
        setCurrentIndex(0);
        setIsDropdownOpen(false);
        setSelectedAccent("American");
        setHasChangedAccent(false);
        setIsRecording(false);
        setIsPlaying(false);
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-blue-800/20 to-purple-800/20 rounded-lg p-6 border border-blue-500/30 font-['Helvetica'] relative">
            {/* Replay Button */}
            <button
                onClick={resetAnimations}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 z-10"
                title="Replay Animation"
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-4">Speak it</h3>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
                <div className="text-white font-mono text-lg min-h-[2rem] flex items-center">
                    <span className="w-full">
                        {text}
                        <span className="animate-pulse">|</span>
                    </span>
                </div>
            </div>
            
            <div className="relative">
                <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-white font-['Helvetica'] flex items-center justify-between">
                    <span>{selectedAccent} </span>
                    <motion.svg
                        className="w-5 h-5"
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                </div>
                
                <motion.div
                    initial={false}
                    animate={{
                        opacity: isDropdownOpen ? 1 : 0,
                        height: isDropdownOpen ? "auto" : 0,
                        scaleY: isDropdownOpen ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
                >
                    <div className="py-1">
                        <div className={`w-full px-3 py-2 text-left text-white ${
                            selectedAccent === "American" ? "bg-white/20" : ""
                        }`}>
                            <img src={usFlag} alt="American flag" className="inline-block w-5 h-5 mr-2 align-middle" style={{ verticalAlign: "middle" }} />
                            American
                        </div>
                        <div className={`w-full px-3 py-2 text-left text-white ${
                            selectedAccent === "British" ? "bg-white/20" : ""
                        }`}>
                            <img src={ukFlag} alt="American flag" className="inline-block w-5 h-5 mr-2 align-middle" style={{ verticalAlign: "middle" }} />
                            British
                        </div>
                    </div>
                </motion.div>
                
                {(isRecording || isPlaying) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-['Helvetica'] text-sm">
                                {isRecording ? "Recording..." : "Ready to play"}
                            </span>
                            <div className="flex gap-2">
                                <button className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isRecording ? 'bg-red-500' : 'bg-green-500'
                                }`}>
                                    {isRecording ? (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 6h12v12H6z"/>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {isRecording && (
                            <div className="flex items-center justify-center gap-1 h-8">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-blue-400 rounded-full"
                                        animate={{
                                            height: [4, 20, 4],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: 1,
                                            delay: i * 0.1,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}