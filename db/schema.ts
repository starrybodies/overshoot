import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  id: integer('id').primaryKey({autoIncrement:true}),
  email: text('email').notNull().unique(),
  consentText: text('consent_text').notNull(),
  sourcePath: text('source_path').notNull(),
  createdAt: text('created_at').notNull(),
});
