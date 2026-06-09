export interface KeyTopic {
  title: string;
  description: string;
  duration: string;
}

export interface Decision {
  id: string;
  title: string;
  category: string;
  context: string;
}

export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
}

export interface TimelineEvent {
  timestamp: string;
  speaker: string;
  text: string;
  category?: string;
}

export interface SentimentAnalysis {
  overall: string;
  confidence: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  transcript: string;
  summary: string;
  keyTopics: KeyTopic[];
  decisions: Decision[];
  actionItems: ActionItem[];
  timeline: TimelineEvent[];
  sentiment: SentimentAnalysis;
  chatHistory?: { role: 'user' | 'model'; text: string }[] | null;
  createdAt?: string | Date;
}
