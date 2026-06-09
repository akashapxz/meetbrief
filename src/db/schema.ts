import { pgTable, serial, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the 'users' table linking to Firebase Auth IDs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID string
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'meetings' table holding analysis reports
export const meetings = pgTable('meetings', {
  id: text('id').primaryKey(), // Using ID matching client-side identifiers
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  duration: text('duration').notNull(),
  transcript: text('transcript').notNull(),
  summary: text('summary').notNull(),
  keyTopics: jsonb('key_topics').notNull(),
  decisions: jsonb('decisions').notNull(),
  actionItems: jsonb('action_items').notNull(),
  timeline: jsonb('timeline').notNull(),
  sentiment: jsonb('sentiment').notNull(),
  chatHistory: jsonb('chat_history'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations declarations
export const usersRelations = relations(users, ({ many }) => ({
  meetings: many(meetings),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  user: one(users, {
    fields: [meetings.userId],
    references: [users.id],
  }),
}));
