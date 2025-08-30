"use client";
import { Carousel } from "@mantine/carousel";
import Autoplay from "embla-carousel-autoplay";
import "@mantine/carousel/styles.css";
import {
  useMantineTheme,
  rem,
  Paper,
  Text,
  Title,
  Container,
  Skeleton,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import classes from "./Testimonials.module.css";
import { useRef } from "react";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface CardProps {
  name: string;
  title: string;
  review: string;
}

function Card({ name, title, review }: CardProps) {
  return (
    <Paper shadow="md" p="xl" radius="md" className={classes.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        {[...Array(5)].map((_, i) => (
          <IconStarFilled
            key={i}
            style={{ width: rem(20), height: rem(20) }}
            color="var(--mantine-color-orange-5)"
          />
        ))}
      </div>
      <Text size="lg" ta="center" className={classes.review}>
        {review}
      </Text>
      <Text ta="center" fw={700} size="lg" mt="md">
        {name}
      </Text>
      <Text ta="center" c="dimmed" size="sm">
        {title}
      </Text>
    </Paper>
  );
}

export function Testimonials() {
  const theme = useMantineTheme();
  const autoplay = useRef(Autoplay({ delay: 5000 }));
  const { data, error } = useSWR('/api/content', fetcher);

  const isLoading = !data && !error;
  const testimonials = data?.testimonials || [];

  const slides = testimonials.map((item: CardProps) => (
    <Carousel.Slide key={item.name}>
      <Card {...item} />
    </Carousel.Slide>
  ));

  const loadingSlides = [...Array(3)].map((_, i) => (
    <Carousel.Slide key={i}>
      <Paper shadow="md" p="xl" radius="md" className={classes.card}>
        <Skeleton height={20} width="50%" mx="auto" radius="md" mb="lg" />
        <Skeleton height={12} radius="md" />
        <Skeleton height={12} radius="md" mt="sm" />
        <Skeleton height={12} radius="md" mt="sm" width="70%" />
        <Skeleton height={16} width="40%" mx="auto" radius="md" mt="lg" />
        <Skeleton height={12} width="30%" mx="auto" radius="md" mt="sm" />
      </Paper>
    </Carousel.Slide>
  ));

  return (
    <div className={classes.wrapper}>
      <Container size="lg" className="py-[2rem] md:py-[3.5rem]">
        <Title order={2} className={classes.title} ta="center" mb="xl">
          What Our Clients Say
        </Title>
        <Carousel
          slideSize={{ base: "100%", sm: "50%", md: "33.333333%" }}
          slideGap={{ base: 0, sm: "md" }}
          emblaOptions={{ loop: true, align: "start" }}
          plugins={[autoplay.current]}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
        >
          {isLoading ? loadingSlides : slides}
        </Carousel>
      </Container>
    </div>
  );
}
