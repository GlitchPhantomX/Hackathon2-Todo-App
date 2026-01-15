"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full font-sans md:px-10"
      ref={containerRef}
      style={{ 
        background: 'linear-gradient(to bottom, var(--background), var(--secondary), var(--background))'
      }}
    >
      <div ref={ref} className="relative max-w-6xl mx-auto pb-20">
        {data.map((item, index) => (
          <motion.div
            key={index}
            className="flex justify-start pt-10 md:pt-8 md:gap-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              {/* Icon Circle with gradient */}
              <motion.div 
                className="h-12 absolute left-2 md:left-3 w-12 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))',
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                  animate={{
                    x: [-100, 100],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
                <div className="text-white relative z-10">
                  {item.icon}
                </div>
              </motion.div>
              
              {/* Title */}
              <h3 
                className="hidden md:block text-2xl md:pl-20 font-bold tracking-tight"
                style={{ 
                  color: 'var(--foreground)',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  fontWeight: 800,
                }}
              >
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              {/* Mobile Title */}
              <h3 
                className="md:hidden block text-2xl mb-4 text-left font-bold tracking-tight"
                style={{ 
                  color: 'var(--foreground)',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                  fontWeight: 800,
                }}
              >
                {item.title}
              </h3>
              
              {/* Content Card */}
              <motion.div
                className="rounded-2xl p-8 shadow-xl border backdrop-blur-sm relative overflow-hidden group"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {/* Gradient glow on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--purple-500), var(--violet-500))',
                    filter: 'blur(30px)',
                    zIndex: -1,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 0.1, scale: 1 }}
                />

                {/* Animated border on hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, var(--purple-500), var(--violet-500))`,
                    padding: '1px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                />

                <div className="relative z-10">
                  {item.content}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
        
        {/* Vertical Line */}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          {/* Background line */}
          <div 
            className="absolute inset-0 w-[2px]"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, var(--border) 10%, var(--border) 90%, transparent 100%)'
            }}
          />
          
          {/* Animated progress line */}
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full"
          >
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(to top, var(--purple-500) 0%, var(--violet-500) 50%, transparent 100%)'
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;