import { useEffect, useRef, useState, useCallback } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import Logo from '/logo.png'; // Adjust the path as necessary
const TrueFocus = ({
  sentence = 'Label Studio',
  manualMode = false,
  blurAmount = 3,
  borderColor = '#00ffff',
  animationDuration = 0.6,
  pauseBetweenAnimations = 2,
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const intervalRef = useRef(null);

  // Improved focus rectangle calculation
  const updateFocusRect = useCallback(
    index => {
      if (index === null || index === -1 || index >= words.length) return;
      if (!wordRefs.current[index] || !containerRef.current) return;

      // Use requestAnimationFrame for better accuracy
      requestAnimationFrame(() => {
        const container = containerRef.current;
        const activeElement = wordRefs.current[index];

        if (!container || !activeElement) return;

        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        // Calculate relative position with better precision
        const x = activeRect.left - containerRect.left;
        const y = activeRect.top - containerRect.top;

        setFocusRect({
          x: x,
          y: y,
          width: activeRect.width,
          height: activeRect.height,
        });
      });
    },
    [words.length],
  );

  // Auto-animation logic
  useEffect(() => {
    if (!manualMode && !isHovering) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [
    manualMode,
    isHovering,
    animationDuration,
    pauseBetweenAnimations,
    words.length,
  ]);

  // Update focus rectangle when current index changes
  useEffect(() => {
    updateFocusRect(currentIndex);
  }, [currentIndex, updateFocusRect]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updateFocusRect(currentIndex);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, updateFocusRect]);
  const handleMouseEnter = index => {
    setIsHovering(true);
    setCurrentIndex(index);
  };

  const handleContainerMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      className="relative flex gap-1 md:gap-2 justify-start items-center flex-wrap"
      ref={containerRef}
      onMouseLeave={handleContainerMouseLeave}
      style={{ minHeight: '2rem' }}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={el => (wordRefs.current[index] = el)}
            className="relative text-base md:text-lg lg:text-xl font-bold cursor-pointer text-foreground select-none whitespace-nowrap"
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
              opacity: isActive ? 1 : 0.7,
            }}
            onMouseEnter={() => handleMouseEnter(index)}
          >
            {word}
          </span>
        );
      })}

      {/* Focus indicator */}
      <motion.div
        className="absolute pointer-events-none "
        animate={{
          x: focusRect.x - 6,
          y: focusRect.y - 0,
          width: focusRect.width + 14,
          height: focusRect.height + 12,
          opacity: currentIndex >= 0 && focusRect.width > 0 ? 1 : 0,
        }}
        transition={{
          duration: animationDuration,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          borderRadius: '6px',
        }}
      >
        {' '}
        {/* Corner brackets */}
        <span
          className="absolute w-3 h-3 border-2 top-0 left-0 border-r-0 border-b-0"
          style={{
            borderColor: borderColor,
            filter: `drop-shadow(0 0 6px ${borderColor})`,
          }}
        />
        <span
          className="absolute w-3 h-3 border-2 top-0 right-0 border-l-0 border-b-0"
          style={{
            borderColor: borderColor,
            filter: `drop-shadow(0 0 6px ${borderColor})`,
          }}
        />
        <span
          className="absolute w-3 h-3 border-2 bottom-0 left-0 border-r-0 border-t-0"
          style={{
            borderColor: borderColor,
            filter: `drop-shadow(0 0 6px ${borderColor})`,
          }}
        />
        <span
          className="absolute w-3 h-3 border-2 bottom-0 right-0 border-l-0 border-t-0"
          style={{
            borderColor: borderColor,
            filter: `drop-shadow(0 0 6px ${borderColor})`,
          }}
        />
      </motion.div>
    </div>
  );
};

export const AnimatedTitle = ({
  className = '',
  sentence = 'Label Studio',
  manualMode = false,
  ...props
}) => {
  return (
    <div className={`flex items-center gap-2 font-semibold ${className}`}>
      <img src={Logo} width={43} />
      <div className="hidden md:inline-block min-w-0">
        <TrueFocus
          sentence={sentence}
          manualMode={manualMode}
          pauseBetweenAnimations={2.5}
          animationDuration={0.6}
          blurAmount={2}
          {...props}
        />
      </div>
      {/* Mobile fallback - simple text */}
      <span className="md:hidden text-lg font-bold text-foreground">
        Annotation Manager
      </span>
    </div>
  );
};
