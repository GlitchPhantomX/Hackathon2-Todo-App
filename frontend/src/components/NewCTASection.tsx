"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react";
import { AnimatedTooltipPreview } from "./AnimatedTooltipPreview";

const features = [
  { icon: Zap, text: "Start in under 60 seconds" },
  { icon: CheckCircle2, text: "No credit card required" },
  { icon: Clock, text: "14-day free trial" },
  { icon: TrendingUp, text: "Cancel anytime" },
];

export default function CTASection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "var(--purple-600)" }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "var(--violet-600)" }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-sm relative overflow-hidden group mb-6"
            style={{
              backgroundColor: "var(--secondary)",
              borderColor: "var(--border)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(to right, var(--purple-400), var(--violet-400))",
              }}
            />
            <Sparkles
              className="w-4 h-4 relative z-10"
              style={{ color: "var(--primary)" }}
            />
            <span
              className="text-sm font-semibold relative z-10"
              style={{ color: "var(--primary)" }}
            >
              Join 10,000+ productive teams
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight"
            style={{
              fontFamily:
                "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span style={{ color: "var(--foreground)" }}>Ready to </span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--purple-600), var(--violet-600), var(--purple-500))",
                backgroundSize: "200% 200%",
                animation: "gradient-shift 3s ease infinite",
              }}
            >
              10x
            </span>
            <span style={{ color: "var(--foreground)" }}>
              {" "}
              Your
              <br />
              Productivity?
            </span>
          </motion.h2>

          {/* Subheading */}
          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Stop juggling spreadsheets and sticky notes. Start managing tasks
            like a pro with AI-powered insights and seamless collaboration.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link href="/register">
              <motion.button
                className="group relative px-8 py-4 text-white rounded-xl font-bold text-lg overflow-hidden shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--purple-600), var(--violet-600))",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--violet-600), var(--purple-600))",
                  }}
                />
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  }}
                  animate={{
                    x: [-200, 200],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </motion.button>
            </Link>

            <Link href="/#features">
              <motion.button
                className="px-8 py-4 backdrop-blur-sm border-2 rounded-xl font-bold text-lg transition-all"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                Watch Demo
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full border"
                style={{
                  backgroundColor: "var(--secondary)",
                  borderColor: "var(--border)",
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <feature.icon
                  className="w-4 h-4"
                  style={{ color: "var(--primary)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Social Proof */}
          <motion.div
            className="flex items-center justify-center gap-8 pt-10 border-t"
            style={{ borderColor: "var(--border)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex -space-x-3">
              <AnimatedTooltipPreview />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <motion.svg
                    key={i}
                    className="w-4 h-4 fill-current"
                    style={{ color: "var(--primary)" }}
                    viewBox="0 0 20 20"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 + i * 0.05 }}
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </motion.svg>
                ))}
              </div>
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  4.9/5
                </span>{" "}
                from 2,000+ reviews
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-32 blur-3xl opacity-20"
        style={{
          background: "linear-gradient(to top, var(--purple-600), transparent)",
        }}
      />
    </section>
  );
}
