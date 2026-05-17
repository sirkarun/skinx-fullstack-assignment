export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  postedAt: string;
  postedBy: string;
  tags: string[];
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type TagSummary = {
  name: string;
  postCount: number;
};
