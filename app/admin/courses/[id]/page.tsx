"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Title,
  Text,
  Loader,
  Alert,
  Breadcrumbs,
  Anchor,
  Paper,
  Group,
  Button,
  Modal,
  TextInput,
  Textarea,
  Accordion,
  ActionIcon,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconPlus, IconPencil, IconTrash, IconBook } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { notifications } from "@mantine/notifications";

// --- Interfaces ---
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
  modules: Module[];
}

type ModuleFormData = Omit<Module, 'id' | 'lessons'>;
type LessonFormData = Omit<Lesson, 'id'>;

export default function CourseContentPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for modals
  const [moduleModalOpened, { open: openModuleModal, close: closeModuleModal }] = useDisclosure(false);
  const [lessonModalOpened, { open: openLessonModal, close: closeLessonModal }] = useDisclosure(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

  const moduleForm = useForm<ModuleFormData>({
    initialValues: { title: '' },
    validate: { title: (v) => (v.length < 3 ? 'Title must be at least 3 characters' : null) }
  });

  const lessonForm = useForm<LessonFormData>({
    initialValues: { title: '', videoUrl: '', content: '' },
    validate: { title: (v) => (v.length < 3 ? 'Title must be at least 3 characters' : null) }
  });

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/courses/${courseId}`); 
      if (!res.ok) throw new Error("Failed to fetch course data.");
      const data = await res.json();
      setCourse(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchCourse();
  }, [courseId, fetchCourse]);

  const handleApiCall = async (url: string, method: string, body: Record<string, unknown>, successMessage: string) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Failed to ${successMessage.toLowerCase()}`);
      }
      notifications.show({ title: "Success", message: successMessage, color: 'green' });
      fetchCourse(); // Refresh data
      return true;
    } catch (err) {
      if (err instanceof Error) {
        notifications.show({ title: "Error", message: err.message, color: 'red' });
      }
      return false;
    }
  };

  // --- Handlers for Modules ---
  const handleAddModuleClick = () => {
    setSelectedModule(null);
    moduleForm.reset();
    openModuleModal();
  };

  const handleEditModuleClick = (module: Module) => {
    setSelectedModule(module);
    moduleForm.setValues({ title: module.title });
    openModuleModal();
  };

  const handleModuleSubmit = async (values: ModuleFormData) => {
    const url = selectedModule
      ? `/api/admin/courses/${courseId}/modules/${selectedModule.id}`
      : `/api/admin/courses/${courseId}/modules`;
    const method = selectedModule ? 'PUT' : 'POST';
    const success = await handleApiCall(url, method, values, `Module ${selectedModule ? 'updated' : 'created'}`);
    if (success) closeModuleModal();
  };

  const handleModuleDelete = async (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module and all its lessons?')) {
        await handleApiCall(`/api/admin/courses/${courseId}/modules/${moduleId}`, 'DELETE', {}, 'Module deleted');
    }
  }
  
  // --- Handlers for Lessons ---
  const handleAddLessonClick = (moduleId: string) => {
    setSelectedLesson(null);
    setTargetModuleId(moduleId);
    lessonForm.reset();
    openLessonModal();
  };

  const handleEditLessonClick = (lesson: Lesson, moduleId: string) => {
    setSelectedLesson(lesson);
    setTargetModuleId(moduleId);
    lessonForm.setValues(lesson);
    openLessonModal();
  };

  const handleLessonSubmit = async (values: LessonFormData) => {
    if (!targetModuleId) return;
    const url = selectedLesson
      ? `/api/admin/courses/${courseId}/modules/${targetModuleId}/lessons/${selectedLesson.id}`
      : `/api/admin/courses/${courseId}/modules/${targetModuleId}/lessons`;
    const method = selectedLesson ? 'PUT' : 'POST';
    const success = await handleApiCall(url, method, values, `Lesson ${selectedLesson ? 'updated' : 'created'}`);
    if (success) closeLessonModal();
  };

  const handleLessonDelete = async (moduleId: string, lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
        await handleApiCall(`/api/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, 'DELETE', {}, 'Lesson deleted');
    }
  }

  const breadcrumbs = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Courses', href: '/admin/courses' },
    { title: course?.title || 'Loading...', href: `/admin/courses/${courseId}` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>{item.title}</Anchor>
  ));

  return (
    <Container fluid>
      <Breadcrumbs my="lg">{breadcrumbs}</Breadcrumbs>
      
      {loading && <Loader />}
      {error && <Alert color="red" title="Error" icon={<IconAlertCircle />}>{error}</Alert>}

      {course && (
        <>
          <Group justify="space-between">
            <div>
              <Title order={2}>{course.title}</Title>
              <Text c="dimmed">Manage modules and lessons for this course.</Text>
            </div>
            <Button leftSection={<IconPlus size={14} />} onClick={handleAddModuleClick}>Add Module</Button>
          </Group>

          <Accordion mt="xl" variant="separated" defaultValue={course.modules[0]?.id}>
            {course.modules.map(module => (
              <Accordion.Item key={module.id} value={module.id}>
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <Accordion.Control>
                        <Text fw={500}>{module.title}</Text>
                    </Accordion.Control>
                    <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="subtle" onClick={() => handleEditModuleClick(module)}><IconPencil size={16} /></ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => handleModuleDelete(module.id)}><IconTrash size={16} /></ActionIcon>
                    </Group>
                </Box>
                <Accordion.Panel>
                  {module.lessons.length === 0 ? (
                    <Text c="dimmed" ta="center" my="md">No lessons in this module yet.</Text>
                  ) : (
                    module.lessons.map(lesson => (
                      <Paper withBorder p="sm" my="xs" key={lesson.id}>
                        <Group justify="space-between">
                          <Group>
                            <IconBook size={18} />
                            <Text>{lesson.title}</Text>
                          </Group>
                          <Group gap="xs" wrap="nowrap">
                            <ActionIcon variant="subtle" onClick={() => handleEditLessonClick(lesson, module.id)}><IconPencil size={16} /></ActionIcon>
                            <ActionIcon variant="subtle" color="red" onClick={() => handleLessonDelete(module.id, lesson.id)}><IconTrash size={16} /></ActionIcon>
                          </Group>
                        </Group>
                      </Paper>
                    ))
                  )}
                  <Button variant="light" size="xs" mt="md" onClick={() => handleAddLessonClick(module.id)}>Add Lesson</Button>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </>
      )}

      {/* Module Modal */}
      <Modal opened={moduleModalOpened} onClose={closeModuleModal} title={selectedModule ? "Edit Module" : "Add Module"}>
        <form onSubmit={moduleForm.onSubmit(handleModuleSubmit)}>
          <TextInput label="Module Title" {...moduleForm.getInputProps('title')} required />
          <Button type="submit" mt="lg" fullWidth>{selectedModule ? "Save Changes" : "Create Module"}</Button>
        </form>
      </Modal>

      {/* Lesson Modal */}
      <Modal opened={lessonModalOpened} onClose={closeLessonModal} title={selectedLesson ? "Edit Lesson" : "Add Lesson"}>
        <form onSubmit={lessonForm.onSubmit(handleLessonSubmit)}>
          <TextInput label="Lesson Title" {...lessonForm.getInputProps('title')} required />
          <TextInput label="Video URL (Optional)" {...lessonForm.getInputProps('videoUrl')} mt="md" />
          <Textarea label="Content (Optional)" {...lessonForm.getInputProps('content')} mt="md" />
          <Button type="submit" mt="lg" fullWidth>{selectedLesson ? "Save Changes" : "Create Lesson"}</Button>
        </form>
      </Modal>
    </Container>
  );
}
