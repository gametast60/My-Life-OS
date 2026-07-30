import { aiRoleRegistry } from "../registry";
import coachRole from "./coach";
import therapistRole from "./therapist";
import psychologistRole from "./psychologist";
import plannerRole from "./planner";
import languageTutorRole from "./languageTutor";
import tradingMentorRole from "./tradingMentor";
import teacherRole from "./teacher";
import nutritionRole from "./nutrition";
import customRole from "./custom";

export function registerAllRoles(): void {
  [
    coachRole,
    therapistRole,
    psychologistRole,
    plannerRole,
    languageTutorRole,
    tradingMentorRole,
    teacherRole,
    nutritionRole,
    customRole,
  ].forEach((r) => aiRoleRegistry.register(r));
}

export {
  coachRole,
  therapistRole,
  psychologistRole,
  plannerRole,
  languageTutorRole,
  tradingMentorRole,
  teacherRole,
  nutritionRole,
  customRole,
};
