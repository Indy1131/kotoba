import {motion} from "framer-motion";
import ipaChart from "../assets/ipa.png";
import { useEffect, useState } from "react";

const sloganContainer = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.8, // children animate one after another
      },
    },
  };

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fancyHeading = {
    hidden: { opacity: 0, scale: 0.8, rotate: -30, color: "#a5b4fc" },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      color: "#2563eb", // blue-600
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        duration: 1.5,
      },
    },
  };

const ipaWidth = 400, ipaHeight = 300;
const circleSize = 32; // px

export default function About() {
    const [current, setCurrent] = useState(0);

    const vowelPositions = [
        { symbol: "i", x: 13, y: 13 },
        { symbol: "y", x: 27, y: 13 },
        { symbol: "ɨ", x: 41, y: 13 },
        { symbol: "ʉ", x: 55, y: 13 },
        { symbol: "ɯ", x: 69, y: 13 },
        { symbol: "u", x: 83, y: 13 },
        { symbol: "ɪ", x: 20, y: 22 },
        { symbol: "ʏ", x: 34, y: 22 },
        { symbol: "ʊ", x: 76, y: 22 },
        { symbol: "e", x: 18, y: 34 },
        { symbol: "ø", x: 32, y: 34 },
        { symbol: "ɘ", x: 46, y: 34 },
        { symbol: "ɵ", x: 60, y: 34 },
        { symbol: "ɤ", x: 74, y: 34 },
        { symbol: "o", x: 88, y: 34 },
        { symbol: "ə", x: 53, y: 43 },
        { symbol: "ɛ", x: 23, y: 54 },
        { symbol: "œ", x: 37, y: 54 },
        { symbol: "ɜ", x: 51, y: 54 },
        { symbol: "ɞ", x: 65, y: 54 },
        { symbol: "ʌ", x: 79, y: 54 },
        { symbol: "ɔ", x: 93, y: 54 },
        { symbol: "æ", x: 28, y: 68 },
        { symbol: "ɐ", x: 53, y: 68 },
        { symbol: "a", x: 33, y: 83 },
        { symbol: "ɶ", x: 47, y: 83 },
        { symbol: "ɑ", x: 61, y: 83 },
        { symbol: "ɒ", x: 75, y: 83 },
      ];

    useEffect(() => {
        const interval = setInterval(() => {
            let next;
            do {
                next = Math.floor(Math.random() * vowelPositions.length);
            } while (next === current);
            setCurrent(next);
        }, 1000);
        return () => clearInterval(interval);
    }, [current, vowelPositions.length]);

    const pos = vowelPositions[current];
    const left = `calc(${pos.x}% - ${circleSize / 2}px)`;
    const top = `calc(${pos.y}% - ${circleSize / 2}px)`;

    return (
        <motion.div
            variants={sloganContainer}
            initial="hidden"
            animate="visible"
            className="flex w-full h-full flex-col gap-6 items-center justify-center bg-white p-8 rounded-lg shadow-md"
        >
            <motion.h1
                className="text-4xl font-extrabold text-gray-800 mb-2"
                variants={fancyHeading}
            >
                Kotoba, your AI-powered language learning companion.
            </motion.h1>
            <motion.h2
                className="text-2xl font-extrabold text-gray-800 mb-2"
                variants={childVariants}
            >
                Speak it.
            </motion.h2>
            <motion.h3
                className="text-3xl font-extrabold text-gray-800 mb-2"
                variants={childVariants}
            >
                See it.
            </motion.h3>
            <motion.h4
                className="text-4xl font-extrabold text-gray-800 mb-2"
                variants={childVariants}
            >
                Perfect it.
            </motion.h4>

            <div style={{ position: "relative", width: ipaWidth, height: ipaHeight, marginBottom: 32 }}>
                <img
                    src={ipaChart}
                    alt="IPA Vowel Chart"
                    style={{ width: ipaWidth, height: ipaHeight, display: "block", borderRadius: 12 }}
                />
                <motion.div
                    animate = {{left, top}}
                    transition = {{type: "spring", stiffness: 120, damping: 15}}
                    style = {{
                        position: "absolute",
                        width: circleSize,
                        height: circleSize,
                        borderRadius: "50%",
                        background: "rgba(37,99,235,0.7)",
                        border: "3px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        pointerEvents: "none",
                    }}
                />
            </div>
        </motion.div>
    );
}