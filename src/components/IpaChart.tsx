import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface IpaChartProps {
    startAnimation?: boolean;
}

const ipaWidth = 400, ipaHeight = 300;
const circleSize = 32; // px

export default function IpaChart({ startAnimation = false }: IpaChartProps) {
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
        let interval: number;
        let stopTimer: number;
        
        if (startAnimation) {
            interval = setInterval(() => {
                let next;
                do {
                    next = Math.floor(Math.random() * vowelPositions.length);
                } while (next === current); // make sure that the next vowel is always different!
                setCurrent(next);
            }, 1000);
            
            // Stop the animation after 2 seconds
            stopTimer = setTimeout(() => {
                if (interval) {
                    clearInterval(interval);
                }
            }, 2000);
        }
        
        return () => {
            if (interval) {
                clearInterval(interval);
            }
            if (stopTimer) {
                clearTimeout(stopTimer);
            }
        };
    }, [startAnimation, vowelPositions.length]);

    const pos = vowelPositions[current];
    const left = `calc(${pos.x}% - ${circleSize / 2}px)`;
    const top = `calc(${pos.y}% - ${circleSize / 2}px)`;

    return (
        <div style={{ 
            position: "relative", 
            width: "100%", 
            height: ipaHeight, 
            marginBottom: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            {/* IPA Chart Background */}
            <div 
                style={{
                    width: ipaWidth,
                    height: ipaHeight,
                    background: "bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4",
                    borderRadius: 12,
                    position: "relative",
                }}
            >
                {/* Grid Lines */}
                <svg width={ipaWidth} height={ipaHeight} style={{ position: "absolute", top: 0, left: 0 }}>
                    {/* Vertical lines for frontness */}
                    <line x1="200" y1="0" x2="200" y2={ipaHeight} stroke="#ffffff20" strokeWidth="1" />
                    <line x1="100" y1="0" x2="100" y2={ipaHeight} stroke="#ffffff15" strokeWidth="1" />
                    <line x1="300" y1="0" x2="300" y2={ipaHeight} stroke="#ffffff15" strokeWidth="1" />
                    
                    {/* Horizontal lines for height */}
                    <line x1="0" y1="75" x2={ipaWidth} y2="75" stroke="#ffffff20" strokeWidth="1" />
                    <line x1="0" y1="150" x2={ipaWidth} y2="150" stroke="#ffffff20" strokeWidth="1" />
                    <line x1="0" y1="225" x2={ipaWidth} y2="225" stroke="#ffffff20" strokeWidth="1" />
                    
                    {/* Lines connecting phonemes of the same height */}
                    {/* Close vowels (y=39) */}
                    <line x1="52" y1="39" x2="108" y2="39" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="108" y1="39" x2="164" y2="39" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="164" y1="39" x2="220" y2="39" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="220" y1="39" x2="276" y2="39" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="276" y1="39" x2="332" y2="39" stroke="#ffffff30" strokeWidth="2" />
                    
                    {/* Near-close vowels (y=66) */}
                    <line x1="80" y1="66" x2="136" y2="66" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="136" y1="66" x2="304" y2="66" stroke="#ffffff30" strokeWidth="2" />
                    
                    {/* Close-mid vowels (y=102) */}
                    <line x1="72" y1="102" x2="128" y2="102" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="128" y1="102" x2="184" y2="102" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="184" y1="102" x2="240" y2="102" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="240" y1="102" x2="296" y2="102" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="296" y1="102" x2="352" y2="102" stroke="#ffffff30" strokeWidth="2" />
                    
                    {/* Mid vowel (y=129) - single point, no line needed */}
                    
                    {/* Open-mid vowels (y=162) */}
                    <line x1="92" y1="162" x2="148" y2="162" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="148" y1="162" x2="204" y2="162" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="204" y1="162" x2="260" y2="162" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="260" y1="162" x2="316" y2="162" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="316" y1="162" x2="372" y2="162" stroke="#ffffff30" strokeWidth="2" />
                    
                    {/* Near-open vowels (y=204) */}
                    <line x1="112" y1="204" x2="212" y2="204" stroke="#ffffff30" strokeWidth="2" />
                    
                    {/* Open vowels (y=249) */}
                    <line x1="132" y1="249" x2="188" y2="249" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="188" y1="249" x2="244" y2="249" stroke="#ffffff30" strokeWidth="2" />
                    <line x1="244" y1="249" x2="300" y2="249" stroke="#ffffff30" strokeWidth="2" />
                </svg>

                {/* Vowel Phonemes */}
                {vowelPositions.map((vowel, index) => (
                    <div
                        key={vowel.symbol}
                        style={{
                            position: "absolute",
                            left: `${vowel.x}%`,
                            top: `${vowel.y}%`,
                            transform: "translate(-50%, -50%)",
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#ffffff",
                            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                            zIndex: 1
                        }}
                    >
                        {vowel.symbol}
                    </div>
                ))}

                {/* Labels */}
                <div style={{ position: "absolute", top: "5%", left: "5%", color: "#ffffff80", fontSize: "12px" }}>
                    Close
                </div>
                <div style={{ position: "absolute", top: "25%", left: "5%", color: "#ffffff80", fontSize: "12px" }}>
                    Close-mid
                </div>
                <div style={{ position: "absolute", top: "45%", left: "5%", color: "#ffffff80", fontSize: "12px" }}>
                    Mid
                </div>
                <div style={{ position: "absolute", top: "65%", left: "5%", color: "#ffffff80", fontSize: "12px" }}>
                    Open-mid
                </div>
                <div style={{ position: "absolute", top: "85%", left: "5%", color: "#ffffff80", fontSize: "12px" }}>
                    Open
                </div>

                {/* Animated Highlight Circle */}
                <motion.div
                    animate={{ 
                        left: `${pos.x}%`,
                        top: `${pos.y}%`
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    style={{
                        position: "absolute",
                        width: circleSize,
                        height: circleSize,
                        borderRadius: "50%",
                        background: "rgba(128,128,128,0.5)",
                        backdropFilter: "blur(8px)",
                        border: "3px solid #ffffff",
                        boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
                        pointerEvents: "none",
                        zIndex: 2,
                        transform: "translate(-50%, -50%)"
                    }}
                />
            </div>
        </div>
    );
} 