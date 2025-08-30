"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Button,
  Badge,
  Breadcrumbs,
  Anchor,
  TextInput,
  Select,
  Loader,
  Center,
  Skeleton,
} from "@mantine/core";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import useSWR from 'swr';

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  image?: string;
  description: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

  const { data: contentData, error: contentError } = useSWR('/api/content', fetcher);
  const isContentLoading = !contentData && !contentError;
  const content = contentData?.coursesPage;

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/course-categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('query', debouncedSearch);
      if (category) params.append('category', category);

      try {
        const res = await fetch(`/api/courses?${params.toString()}`);
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [debouncedSearch, category]);

  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: "Online Courses", href: "/courses" },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <>
      <Header />
      <main>
        <Container size="lg" py="xl">
          <Breadcrumbs my="lg">{breadcrumbItems}</Breadcrumbs>
          
          {isContentLoading ? <Skeleton height={40} width="70%" /> : (
            <Title order={1} style={{ marginBottom: "2rem" }}>
              {content?.title || "Online Hospitality Courses"}
            </Title>
          )}

          {isContentLoading ? <Skeleton height={12} width="90%" /> : (
            <Text c="dimmed" mb="xl">
              {content?.intro || "Access free professional courses from top institutions. Pay only if you wish to receive a certificate upon completion."}
            </Text>
          )}

          <Grid gutter="md" mb="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                placeholder="Search for courses..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                placeholder="Filter by category"
                data={categories}
                value={category}
                onChange={(value) => setCategory(value || '')}
                clearable
              />
            </Grid.Col>
          </Grid>

          {loading ? (
            <Center h={200}><Loader /></Center>
          ) : courses.length > 0 ? (
            <Grid gutter="xl">
              {courses.map((course) => (
                <Grid.Col key={course.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Card.Section>
                      <Image
                        src={course.image || "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2070&auto=format&fit=crop"}
                        height={180}
                        width={400}
                        alt={course.title}
                        style={{ objectFit: 'cover' }}
                      />
                    </Card.Section>
                    <Badge color="orange" variant="light" mt="md">{course.category}</Badge>
                    <Title order={4} mt="sm">{course.title}</Title>
                    <Text size="sm" c="dimmed" mt="xs" lineClamp={3}>{course.description}</Text>
                    <Text size="sm" fw={500} mt="md">Duration: {course.duration}</Text>
                    <Button component={Link} href={`/courses/${course.id}`} variant="filled" color="orange" fullWidth mt="md">
                      Start Learning
                    </Button>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Center h={200}>
              <Text>No courses found matching your criteria.</Text>
            </Center>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default CoursesPage;
