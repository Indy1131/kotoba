import {motion} from "framer-motion";
import { useState, useEffect } from "react";
import Speak from "../components/Speak";
import See from "../components/See";
import Perfect from "../components/Perfect";
const sloganContainer = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.8, // increased delay between children
      },
    },
  };

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fancyHeading = {
    hidden: { opacity: 0, scale: 0.8, rotate: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        duration: 1.5,
      },
    },
  };

export default function About() {
    const [speakAnimationStarted, setSpeakAnimationStarted] = useState(false);
    const [seeAnimationStarted, setSeeAnimationStarted] = useState(false);
    const [perfectAnimationStarted, setPerfectAnimationStarted] = useState(false);
    const [showColumns, setShowColumns] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false);

    useEffect(() => {
        // Remove the automatic timer-based animations
        // We'll trigger them manually when the button is pressed
    }, []);

    const handleButtonClick = () => {
        setButtonClicked(true);
        
        // Start animations at different times
        setTimeout(() => {
            setSpeakAnimationStarted(true); // Start immediately
        }, 500); // Short delay for smooth transition
        
        setTimeout(() => {
            setSeeAnimationStarted(true); // Start after 5 seconds
        }, 5500); // 500ms + 5000ms delay
        
        setTimeout(() => {
            setPerfectAnimationStarted(true); // Start after 8 seconds
        }, 8500); // 500ms + 8000ms delay
    };
    
    return (
        <div className="relative w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <motion.div
            variants={sloganContainer}
            initial="hidden"
            animate="visible"
            className="flex w-full h-full flex-col gap-6 p-8 rounded-lg"
        >
            <motion.div
                className="flex flex-col items-center justify-center pt-8"
                variants={fancyHeading}
            >
                <motion.h1
                    className="text-6xl font-extrabold flex items-center justify-center"
                    variants={fancyHeading}
                >
                    <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse">K</span>
                    <span className="bg-gradient-to-r from-red-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(244,114,182,0.6)] animate-pulse" style={{animationDelay: '0.1s'}}>o</span>
                    <span className="bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(167,139,250,0.6)] animate-pulse" style={{animationDelay: '0.2s'}}>t</span>
                    <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(103,232,249,0.6)] animate-pulse" style={{animationDelay: '0.3s'}}>o</span>
                    <span className="bg-gradient-to-r from-teal-300 via-green-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" style={{animationDelay: '0.4s'}}>b</span>
                    <span className="bg-gradient-to-r from-emerald-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse" style={{animationDelay: '0.5s'}}>a</span>
                </motion.h1>
                <motion.h2
                    className="text-4xl font-extrabold text-white mt-4"
                    variants={childVariants}
                    transition={{ delay: 0.8 }}
                >
                    your AI-powered language learning companion.
                </motion.h2>
                
                {/* Arrow Button - disappears when clicked */}
                {!buttonClicked && (
                    <motion.button
                        onClick={handleButtonClick}
                        className="mt-8 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                        variants={childVariants}
                        transition={{ delay: 1.2 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <motion.svg
                            className="w-8 h-8 text-white group-hover:text-yellow-300 transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </motion.svg>
                    </motion.button>
                )}
            </motion.div>
            
            {/* Columns section - expands when button is clicked */}
            <motion.div 
                className="flex w-full h-full gap-8 mt-8"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={buttonClicked ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 50 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <div className="flex-1">
                  <Speak startAnimation={speakAnimationStarted} />
                </div>
                <div className="flex-1">
                  <See startAnimation={seeAnimationStarted} />
                </div>
                <div className="flex-1">
                  <Perfect startAnimation={perfectAnimationStarted} />
                </div>
            </motion.div>
        </motion.div>
    </div>
    );
}