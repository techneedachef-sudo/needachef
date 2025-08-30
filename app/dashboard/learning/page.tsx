"use client";

import { Container, Title, Text, SimpleGrid, Card, Progress, Button, Center, Paper, Stack, Loader, Alert } from "@mantine/core";
import Link from "next/link";
import { useLearning } from "@/components/learning/LearningContext";
import { IconBook, IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Lesson {
    id: string;
    title: string;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    category: string;
    modules: Module[];
}

export default function MyLearningDashboardPage() {
  const { state } = useLearning();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/courses')
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch courses');
            }
            return res.json();
        })
        .then(data => {
            setCourses(data);
        })
        .catch(err => {
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        });
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Alert color="red" title="Error" icon={<IconAlertCircle />}>{error}</Alert>;
  }

  const enrolledCourses = Object.values(state.progress);

  return (
    <Container fluid>
      <Title order={2} mb="xl">My Learning</Title>
      {enrolledCourses.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Center>
            <Stack ta="center" align="center" gap="xs">
              <IconBook size={48} stroke={1.5} className="self-center"/>
              <Text size="xl" fw={500} mt="md">You haven't started any courses yet.</Text>
              <Text c="dimmed" mt="sm">You haven&apos;t enrolled in any courses yet.</Text>
              <Button component={Link} href="/courses" mt="xl">
                Browse Courses
              </Button>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {enrolledCourses.map(progress => {
            const course = courses.find(c => c.id === progress.courseId);
            if (!course) return null;

            const totalLessons = course.modules?.flatMap(module => module.lessons)?.length || 0;
            const completedLessons = progress.completedLessons.size;
            const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
            const resumeLink = progress.lastViewedLesson
              ? `/courses/${course.id}?lesson=${progress.lastViewedLesson}`
              : `/courses/${course.id}`;

            return (
              <Card key={course.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4}>{course.title}</Title>
                <Text size="sm" c="dimmed" mt="xs">{course.category}</Text>
                
                <Progress value={percentage} mt="md" size="lg" radius="xl" />
                <Text size="xs" c="dimmed" mt={4}>{completedLessons} / {totalLessons} lessons completed</Text>

                <Button component={Link} href={resumeLink} fullWidth mt="md">
                  {percentage === 100 ? "Review Course" : "Resume Course"}
                </Button>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
}
