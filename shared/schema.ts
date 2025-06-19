import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  prize: text("prize").notNull(),
  prizeValue: integer("prize_value").notNull(),
  totalNumbers: integer("total_numbers").notNull().default(125),
  numbersLeft: integer("numbers_left").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isFreePlay: boolean("is_free_play").notNull().default(false),
  emoji: text("emoji").notNull().default("🎮"),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  playerName: text("player_name").notNull(),
  selectedNumber: integer("selected_number"),
  isWinner: boolean("is_winner").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull(),
});

export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  winningNumber: integer("winning_number").notNull(),
  winnerId: integer("winner_id"),
  completedAt: timestamp("completed_at").notNull(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  numbersLeft: true,
  isActive: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  isWinner: true,
  joinedAt: true,
});

export const insertGameResultSchema = createInsertSchema(gameResults).omit({
  id: true,
  completedAt: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
export type GameResult = typeof gameResults.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
