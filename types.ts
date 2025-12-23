
export type TransactionType = 'income' | 'expense';

export interface FinanceCategory {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  note: string;
}

export interface MeetingCategory {
  id: string;
  name: string;
  color: string;
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string; // ISO string
  completed: boolean;
  categoryIds: string[];
  description?: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  categoryIds: string[];
  completed: boolean;
  createdAt: string;
  dueDate?: string; // ISO string for auto-complete check
}
