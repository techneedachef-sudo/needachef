"use client";
import { Container, Title, Text, Button, Skeleton } from "@mantine/core";
import classes from "./Promo.module.css";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Promo() {
  const { data, error } = useSWR('/api/content', fetcher);
  const isLoading = !data && !error;
  const content = data?.homepage?.promo;

  return (
    <div className={classes.wrapper}>
      <Container size="lg" py="xl">
        <div className={classes.inner}>
          <div className={classes.content}>
            {isLoading ? (
                <Skeleton height={40} width="70%" mx="auto" />
            ) : (
                <Title className={classes.title}>{content?.title || "Launch Your Food Brand"}</Title>
            )}
            
            {isLoading ? (
                <>
                    <Skeleton height={12} mt="md" />
                    <Skeleton height={12} mt="sm" />
                    <Skeleton height={12} mt="sm" width="80%" mx="auto" />
                </>
            ) : (
                <Text mt="md">
                    {content?.text || "From product development to branding and marketing, we provide the expertise to turn your culinary ideas into a successful business. Let us help you tell your story and captivate your audience."}
                </Text>
            )}
            
            <Button
              variant="gradient"
              gradient={{ from: "orange", to: "red" }}
              size="lg"
              className={classes.button}
              mt="xl"
            >
              Learn More
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
