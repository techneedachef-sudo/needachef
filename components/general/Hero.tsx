"use client";
import { Container, Text, Button, Group, Flex, Skeleton } from "@mantine/core";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import useSWR from 'swr';
import classes from "./Hero.module.css";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Hero() {
  const { data, error } = useSWR('/api/content', fetcher);

  const FADE_UP_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  const isLoading = !data && !error;
  const heroContent = data?.homepage?.hero;

  return (
    <Container size="lg">
      <div className={classes.root}>
        <Flex
          gap={{ base: 'xl', md: '5rem' }}
          justify="space-between"
          align="center"
          direction={{ base: 'column-reverse', md: 'row' }}
        >
          <motion.div
            className={classes.content}
            initial="hidden"
            animate="show"
            viewport={{ once: true }}
            variants={{
              show: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.h1
              className={classes.title}
              variants={FADE_UP_ANIMATION_VARIANTS}
            >
              {isLoading ? (
                <>
                  <Skeleton height={40} radius="md" />
                  <Skeleton height={40} radius="md" mt={10} width="70%" />
                </>
              ) : (
                <>
                  {heroContent?.title.split(',')[0] || "Exceptional Culinary Talent,"}{" "}
                  <Text
                    component="span"
                    inherit
                    variant="gradient"
                    gradient={{ from: "orange", to: "red" }}
                  >
                    {heroContent?.title.split(',')[1] || "On Demand."}
                  </Text>
                </>
              )}
            </motion.h1>

            <motion.div
              className={classes.description}
              variants={FADE_UP_ANIMATION_VARIANTS}
            >
              {isLoading ? (
                <>
                  <Skeleton height={12} radius="md" mt={20} />
                  <Skeleton height={12} radius="md" mt={10} />
                  <Skeleton height={12} radius="md" mt={10} width="80%" />
                </>
              ) : (
                heroContent?.subtitle || "From in-home private dining to large-scale corporate events, Needachef connects you with top-tier culinary professionals. Elevate your dining experience with the perfect chef, every time."
              )}
            </motion.div>

            <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
              <Group mt="xl">
                <Button component={Link} href="/booking" size="lg">
                  Book a Chef
                </Button>
                <Button
                  component={Link}
                  href="/chefs/apply"
                  size="lg"
                  variant="default"
                >
                  Join Our Team
                </Button>
              </Group>
            </motion.div>
          </motion.div>

          <motion.div
            className={classes.imageWrapper}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="https://media.istockphoto.com/id/544353724/photo/happy-young-entrepreneur.jpg?b=1&s=612x612&w=0&k=20&c=zz0CJOuEzoXrydWeeDcuv5CTQgxunmLZcTUaPar-Wbg="
              alt="Professional chef preparing a meal"
              width={400}
              height={400}
              className={classes.image}
              priority
            />
          </motion.div>
        </Flex>
      </div>
    </Container>
  );
}
