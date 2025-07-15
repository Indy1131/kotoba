import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Speak from "../components/Speak";
import See from "../components/See";
import Perfect from "../components/Perfect";
import iconImage from "../assets/icon.png";
import Chip from "../components/Chip";

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
    <div className="relative w-full select-none overflow-scroll bg-gradient-to-br pointer-events-none">
      <motion.div
        variants={sloganContainer}
        initial="hidden"
        animate="visible"
        className="flex items-center w-full h-full flex-col gap-6 px-8 rounded-lg"
      >
        <div className="flex flex-col w-[min(calc(100%-64px),1000px)] gap-2 bg-light border-1 border-light-outline p-2 rounded-2xl">
          <div className="w-full overflow-hidden flex-1 bg-light py-2 text-xs rounded-xl border-1 border-light-outline">
            <div className="inline-flex items-center scroll-marquee whitespace-nowrap">
              {[
                [1, 2].map(() => (
                  <>
                    <Chip text="English" icon="uk.svg" className="mr-2" />
                    <Chip
                      text="Standard American"
                      accent="orange"
                      icon="usa.svg"
                      className="mr-2"
                    />
                    <Chip
                      text="London"
                      accent="orange"
                      icon="uk.svg"
                      className="mr-2"
                    />
                    <Chip text="Cantonese" icon="hk.svg" className="mr-2" />
                    <Chip text="Mandarin" icon="ch.svg" className="mr-2" />
                    <Chip text="Italian" icon="italy.svg" className="mr-2" />
                    <Chip text="French" icon="fr.svg" className="mr-2" />
                    <Chip
                      text="French Canadian"
                      accent="orange"
                      icon="cn.svg"
                      className="mr-2"
                    />
                    <Chip text="Korean" icon="kn.svg" className="mr-2" />
                    <Chip text="Japanese" icon="jp.svg" className="mr-2" />
                  </>
                )),
              ]}
            </div>
          </div>
        </div>
        <motion.div
          className="flex flex-col items-center justify-center"
          variants={fancyHeading}
        >
          <div className=" p-2 rounded-xl">
            <motion.h1
              className="text-6xl rounded-xl font-extrabold flex items-center justify-center"
              variants={fancyHeading}
            >
              <div className="relative flex items-center">
                {" "}
                <img
                  src={iconImage}
                  alt="Kotoba Icon"
                  className="absolute left-[-90px] h-10 mr-3 object-contain"
                />
                Kotoba
              </div>
            </motion.h1>
            <motion.h2
              className="text-4xl font-medium text-primary mt-4 bg-gradient-to-t from-midlight to-highlight py-2 px-5 border-3 rounded-full"
              variants={childVariants}
              transition={{ delay: 0.8 }}
            >
              Your AI-powered language learning companion.
            </motion.h2>
          </div>

          {/* Arrow Button - disappears when clicked */}
          {!buttonClicked && (
            <motion.button
              onClick={handleButtonClick}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              variants={childVariants}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                className="cursor-pointer relative w-10 h-10 group pointer-events-auto border-3 border-primary rounded-full"
                animate={{ y: [0, 5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="pointer-events-none group-hover:opacity-0 top-0 w-full h-full bg-gradient-to-t from-midlight to-highlight absolute rounded-full duration-300" />
                <motion.svg
                  className="relative z-10 pointer-events-none w-full h-full group-hover:text-white group-hover:bg-primary text-primary border-primary rounded-full p-1 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </motion.svg>
              </motion.div>
            </motion.button>
          )}
        </motion.div>

        {/* Columns section - expands when button is clicked */}
        <motion.div
          className="pointer-events-auto mb-5 flex items-stretch w-[min(calc(100%-64px),1200px)] h-full gap-2 mt-8 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={
            buttonClicked
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.8, y: 50 }
          }
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
