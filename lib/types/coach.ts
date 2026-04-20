export type CoachMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string; // ISO string
};
