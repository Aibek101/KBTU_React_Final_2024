import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [sortState, setSortState] = useState("");
  const [filterState, setFilterState] = useState("");

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("Not done");

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  }

  function deleteTask(index) {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((_, i) => i !== index);
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  }

  function editTask() {
    const updatedTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
    };

    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task, index) =>
        index === taskToEdit ? updatedTask : task
      );
      saveTasks(updatedTasks);
      return updatedTasks;
    });

    setEditOpened(false);
    setTaskToEdit(null);
  }

  function loadTasks() {
    let loadedTasks = localStorage.getItem("tasks");
    let tasks = JSON.parse(loadedTasks);
    if (tasks) {
      setTasks(tasks);
    }
    saveTasks(tasks);
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const sortedTasks = tasks
    .filter((task) => {
      if (!filterState) return true;
      return task.state === filterState;
    })
    .sort((a, b) => {
      if (sortState === "doneFirst") {
        return a.state === "Done" ? -1 : 1;
      } else if (sortState === "doingFirst") {
        return a.state === "Doing right now" ? -1 : 1;
      } else if (sortState === "notDoneFirst") {
        return a.state === "Not done" ? -1 : 1;
      }
      return 0;
    });

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={"New Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              ref={taskState}
              label={"State"}
              data={[
                { value: "Done", label: "Done" },
                { value: "Not done", label: "Not done" },
                { value: "Doing right now", label: "Doing right now" },
              ]}
              defaultValue={"Not done"}
              mt={"md"}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createTask();
                }}
              >
                Create Task
              </Button>
            </Group>
          </Modal>

          {taskToEdit !== null && (
            <Modal
              opened={editOpened}
              size={"md"}
              title={"Edit Task"}
              withCloseButton={false}
              onClose={() => {
                setEditOpened(false);
                setTaskToEdit(null);
              }}
              centered
            >
              <TextInput
                mt={"md"}
                ref={taskTitle}
                defaultValue={tasks[taskToEdit].title}
                placeholder={"Task Title"}
                required
                label={"Title"}
              />
              <TextInput
                ref={taskSummary}
                mt={"md"}
                defaultValue={tasks[taskToEdit].summary}
                placeholder={"Task Summary"}
                label={"Summary"}
              />
              <Select
                ref={taskState}
                label={"State"}
                data={[
                  { value: "Done", label: "Done" },
                  { value: "Not done", label: "Not done" },
                  { value: "Doing right now", label: "Doing right now" },
                ]}
                defaultValue={tasks[taskToEdit].state}
                mt={"md"}
              />
              <Group mt={"md"} position={"apart"}>
                <Button
                  onClick={() => {
                    setEditOpened(false);
                    setTaskToEdit(null);
                  }}
                  variant={"subtle"}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    editTask();
                  }}
                >
                  Save Changes
                </Button>
              </Group>
            </Modal>
          )}

          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>

            <Group mt={10}>
              <Button onClick={() => setSortState("doneFirst")}>
                Show 'Done' first
              </Button>
              <Button onClick={() => setSortState("doingFirst")}>
                Show 'Doing' first
              </Button>
              <Button onClick={() => setSortState("notDoneFirst")}>
                Show 'Not done' first
              </Button>
            </Group>

            <Group mt={10}>
              <Button onClick={() => setFilterState("Done")}>
                Show only 'Done'
              </Button>
              <Button onClick={() => setFilterState("Not done")}>
                Show only 'Not done'
              </Button>
              <Button onClick={() => setFilterState("Doing right now")}>
                Show only 'Doing'
              </Button>
              <Button onClick={() => setFilterState("")}>Show all</Button>
            </Group>

            {sortedTasks.length > 0 ? (
              sortedTasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => {
                          setTaskToEdit(index);
                          setEditOpened(true);
                        }}
                        color={"yellow"}
                        variant={"transparent"}
                      >
                        <Edit />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => {
                          deleteTask(index);
                        }}
                        color={"red"}
                        variant={"transparent"}
                      >
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary was provided for this task"}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"sm"}>
                    State: {task.state}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}

            <Button
              onClick={() => {
                setOpened(true);
              }}
              fullWidth
              mt={"md"}
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}