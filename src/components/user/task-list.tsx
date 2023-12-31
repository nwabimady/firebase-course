import { getApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { FC, useEffect, useState } from "react";
import { TaskEntity } from "../../types/firestore-types";
import { useUserContext } from "../../user-provider";

export const TaskList: FC = () => {
  const [tasks, setTasks] = useState<TaskEntity[]>([]);
  const dbInstance = getFirestore(getApp());
  const [user] = useUserContext();
  const q = query(
    collection(dbInstance, "tasks"),
    where("userId", "==", user?.uid)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: TaskEntity[] = [];
      snapshot.docs.forEach((doc) => {
        result.push({ ...(doc.data() as TaskEntity), uid: doc.id });
      });
      setTasks(result);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const onDeleteTask = async (taskId: string) => {
    await deleteDoc(doc(dbInstance, "tasks", taskId));
  };

  return (
    <div>
      {Boolean(tasks.length) ? (
        <ul>
          {tasks.map((task) => {
            return (
              <li key={task.uid}>
                {task.title}

                <button
                  className="coolButton"
                  onClick={() => onDeleteTask(task.uid)}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No tasks available</p>
      )}
    </div>
  );
};
