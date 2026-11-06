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
