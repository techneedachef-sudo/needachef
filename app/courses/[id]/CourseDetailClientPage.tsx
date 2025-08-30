"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Breadcrumbs,
  Anchor,
  Alert,
  AspectRatio,
  Grid,
  NavLink,
  Progress,
  Box,
  Loader,
  Center,
} from "@mantine/core";
import { IconCertificate, IconAlertCircle, IconCircleCheck, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useParams, useSearchParams } from "next/navigation";
import { useLearning } from "@/components/learning/LearningContext";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from 'swr';

interface Lesson {
    id: string;
    title: string;
    videoUrl?: string;
    content?: string;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    modules: Module[];
}

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) {
        throw new Error('Course not found');
    }
    return res.json();
});

export default function CourseDetailClientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { state: learningState, dispatch: dispatchLearning } = useLearning();

  const courseId = params.id as string;
  const { data: course, error, isLoading } = useSWR<Course>(courseId ? `/api/courses/${courseId}` : null, fetcher);
  
  const currentLessonId = searchParams.get('lesson') || (course?.modules?.[0]?.lessons?.[0]?.id);
  const currentLesson = course?.modules?.flatMap(module => module.lessons)?.find(l => l.id === currentLessonId);

  const courseProgress = learningState.progress[courseId];
  const completedLessons = courseProgress?.completedLessons || new Set();
  const totalLessons = course?.modules?.flatMap(module => module.lessons)?.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;

  // Enroll user automatically if they visit the page
  useEffect(() => {
    if (user && courseId) {
      dispatchLearning({ type: 'START_COURSE', payload: { courseId } });
    }
  }, [user, courseId, dispatchLearning]);
  
  // Set the last viewed lesson
  useEffect(() => {
      if (user && courseId && currentLessonId) {
          dispatchLearning({ type: 'SET_LAST_VIEWED', payload: { courseId, lessonId: currentLessonId }})
      }
  }, [user, courseId, currentLessonId, dispatchLearning]);

  if (isLoading) {
      return (
          <>
            <Header />
            <Center h={400}><Loader /></Center>
            <Footer />
          </>
      )
  }

  if (error || !course) {
    return (
      <>
        <Header />
        <Container>
          <Alert icon={<IconAlertCircle size="1rem" />} title="Not Found" color="red" mt="lg">
            The course you are looking for does not exist.
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  const handleToggleLesson = (lessonId: string) => {
    dispatchLearning({ type: 'TOGGLE_LESSON_COMPLETION', payload: { courseId, lessonId } });
    
    // Find the current lesson and its module
    let currentModuleIndex = -1;
    let currentLessonIndex = -1;

    for (let i = 0; i < (course?.modules?.length || 0); i++) {
        currentLessonIndex = course!.modules[i].lessons.findIndex(l => l.id === lessonId);
        if (currentLessonIndex !== -1) {
            currentModuleIndex = i;
            break;
        }
    }

    if (currentModuleIndex !== -1 && currentLessonIndex !== -1) {
        // Check for next lesson in the current module
        if (currentLessonIndex < course!.modules[currentModuleIndex].lessons.length - 1) {
            const nextLesson = course!.modules[currentModuleIndex].lessons[currentLessonIndex + 1];
            router.push(`/courses/${courseId}?lesson=${nextLesson.id}`);
        } else if (currentModuleIndex < course!.modules.length - 1) {
            // Check for next module's first lesson
            const nextModule = course!.modules[currentModuleIndex + 1];
            if (nextModule.lessons.length > 0) {
                const nextLesson = nextModule.lessons[0];
                router.push(`/courses/${courseId}?lesson=${nextLesson.id}`);
            }
        }
    }
  };

  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: "Online Courses", href: "/courses" },
    { title: course.title, href: `/courses/${courseId}` },
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
          
          <Title order={1} mb="md">{course.title}</Title>
          <Text c="dimmed" mb="xl">{course.description}</Text>

          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <AspectRatio ratio={16 / 9}>
                {currentLesson?.videoUrl ? (
                  <iframe
                    id="course-video-player"
                    src={`${currentLesson.videoUrl}?enablejsapi=1`}
                    title="Course Video Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <Center style={{ height: '100%', backgroundColor: 'var(--mantine-color-gray-2)' }}>
                    <Text size="lg" c="dimmed">No Video Available</Text>
                  </Center>
                )}
              </AspectRatio>
              <Paper withBorder p="md" mt="md" radius="md">
                <Title order={4}>
                    {currentLesson?.title || 'Lesson'}
                </Title>
                <Button 
                    mt="md" 
                    onClick={() => handleToggleLesson(currentLessonId!)}
                    leftSection={completedLessons.has(currentLessonId!) ? <IconCircleCheck size={18} /> : <IconPlayerPlay size={18} />}
                >
                  {completedLessons.has(currentLessonId!) ? 'Mark as Incomplete' : 'Mark as Complete'}
                </Button>
              </Paper>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper withBorder p="md" radius="md">
                <Title order={4} mb="md">Course Progress</Title>
                <Progress value={progressPercentage} size="lg" radius="xl" />
                <Text size="sm" c="dimmed" mt="xs">{completedLessons.size} / {totalLessons} lessons completed</Text>
                <Box mt="md">
                    {course?.modules?.map(module => (
                        <Box key={module.id} mb="sm">
                            <Text fw={700} mb="xs">{module.title}</Text>
                            {module.lessons.map(lesson => (
                                <NavLink
                                    key={lesson.id}
                                    href={`/courses/${course.id}?lesson=${lesson.id}`}
                                    label={lesson.title}
                                    component={Link}
                                    active={lesson.id === currentLessonId}
                                    leftSection={completedLessons.has(lesson.id) ? <IconCircleCheck size={16} color="green" /> : <IconPlayerPlay size={16} />}
                                />
                            ))}
                        </Box>
                    ))}
                </Box>
              </Paper>
              <Paper withBorder p="xl" mt="xl" radius="md">
                <Title order={3}>Get Your Certificate</Title>
                <Text mt="sm">
                  Complete all lessons to unlock your certificate.
                </Text>
                <Button
                  disabled={progressPercentage < 100}
                  leftSection={<IconCertificate size={18} />}
                  variant="filled"
                  color="orange"
                  size="lg"
                  mt="xl"
                >
                  {progressPercentage < 100 ? `Complete course to unlock` : `Purchase Certificate - ${(course.price / 100).toFixed(2)}`}
                </Button>
              </Paper>
            </Grid.Col>
          </Grid>

        </Container>
      </main>
      <Footer />
    </>
  );
}
