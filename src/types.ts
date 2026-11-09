export type UserProfile = {
  id: string;
  full_name: string;
  role: string;
};

export type ConstructionObject = {
  id: string;
  name: string;
  address: string;
  created_at: string;
};

export type ConstructionTask = {
  id: string;
  title: string;
  description: string;
  status: string;
};

export type TaskDetails = {
  id: string;
  title: string;
  description: string | null;
  object_id: string;
  executor_id: string | null;
  author_id: string;
  status: string;
  created_at: string;
  executorName: string | null;
  authorName: string;
};

export type TaskStatusHistoryEntry = {
  task_id: string;
  changed_by: string;
  changedByName: string;
  from_status: string | null;
  to_status: string;
  comment: string | null;
  created_at: string;
};
