"use client";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import classes from "./AnimatedDivider.module.css";

interface DividerProp {
  size?: string;
}

export function AnimatedDivider({ size = "lg" }: DividerProp) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <div className={classes.wrapper}>
      <motion.div
        ref={ref}
        className={
          classes.line +
          `${
            size === "lg" ? " w-[80%]" : size === "md" ? " w-[50%]" : " w-[20%]"
          }`
        }
        initial="hidden"
        animate={controls}
        variants={{
          visible: { scaleX: 1 },
          hidden: { scaleX: 0 },
        }}
        transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
      />
    </div>
  );
}
