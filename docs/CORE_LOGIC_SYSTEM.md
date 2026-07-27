# CORE_LOGIC_SYSTEM.md — My Life OS

> Complete documentation of every business logic function, data model, type definition, database operation, and domain rule in the system.

---

## 1. Type System (`src/types.ts`)

`types.ts` is the **single source of truth** for all data shapes in the application. Every interface, union type, and constant used across the app originates here.

---

### 1.1 Core Domain Types

#### `UserSettings`
Central configuration object for the application user.

```typescript
interface UserSettings {
  userName: string                    // User's display name (shown in greeting)
  aiProvider: string                  // Legacy field (kept for migration)
  aiApiKey: string                    // Legacy field (migrated to apiProviders[0])
  preferredLanguage: "th" | "en"     // UI language preference
  apiProviders: APIProvider[]         // Multi-provider AI config list
  theme?: string                      // Reserved for future theme switching
}
```

Default (`DEFAULT_SETTINGS`):
```typescript
{
  userName: "??????????",
  aiProvider: "gemini",
  aiApiKey: "",
  preferredLanguage: "th",
  apiProviders: []
}
```

#### `APIProvider`
Represents one AI provider configuration, enabling the failover system.

```typescript
interface APIProvider {
  id: string                          // Unique ID (provider-{timestamp})
  name: "Gemini" | "Groq" | "OpenRouter"
  apiKey: string                      // Secret key (stored in localStorage)
  model: string                       // Model identifier string
  enabled: boolean                    // Toggle on/off without deleting
  priority: number                    // Call order (1 = highest priority)
}
```

#### `CharacterStatus`
The RPG stat system — 10 life dimensions as percentage values (0–100).

```typescript
interface CharacterStatus {
  // Physical & Action
  discipline: number                  // Mission completion rate
  health: number                      // Habits & exercise
  finance: number                     // Financial goal progress
  confidence: number                  // Streaks & achievements
  energy: number                      // Daily vitality
  // Mind & Spirit
  wisdom: number                      // Reflection & AI lessons
  creativity: number                  // Vision Board & ideas
  courage: number                     // High-priority goals & challenges
  social: number                      // Relationship journals & goals
  selfAwareness: number               // Check-in streak & CBT
}
```

Default: all fields = `0`.

#### `LifeJourneyPhase`
One of 5 life development phases shown in the Journey roadmap.

```typescript
interface LifeJourneyPhase {
  id: string
  phaseNumber: number                 // 1–5
  title: string                       // English title (e.g., "Foundation")
  titleTh: string                     // Thai title (e.g., "?????????")
  subtitle: string                    // Description paragraph
  status: "completed" | "current" | "upcoming" | "locked"
  progressPercent: number             // 0–100
  estimatedCompletion: string         // e.g., "2024–2025"
  nextMilestone?: string              // Next goal description
  stats?: { name: string; valuePercent: number }[]  // Phase-specific KPIs
}
```

Default journey (5 phases):
| Phase | Title | TitleTh |
|---|---|---|
| 1 | Foundation | ????????? |
| 2 | Growth | ?????? |
| 3 | Mastery | ????????? |
| 4 | Impact | ???????????? |
| 5 | Freedom | ??????? |

---

### 1.2 Journal & Content Types

#### `JournalEntry`

```typescript
interface JournalEntry {
  id: string                          // "j-{timestamp}"
  date: string                        // Thai formatted date string
  timestamp: number                   // Unix ms (for sorting)
  title: string
  content: string                     // Main journal text
  mode: JournalMode                   // Writing mode label
  mood: MoodType                      // Emoji string
  emotion: string                     // Mood label text
  tags: string[]                      // Array of tag strings
  favorite: boolean
  pinned: boolean
  dimension: LifeDimension            // Life category
  linkedBrainCardIds: string[]        // Cross-linked Brain Card IDs
}
```

`JournalMode` (union):
```typescript
type JournalMode =
  | "Normal Diary"
  | "Morning Pages"
  | "Gratitude"
  | "CBT Thought Record"
  | "Dream Journal"
  | "Stoic Reflection"
```

`MoodType` = `string` (any emoji — driven by `presetMoods`)

#### `DailyCheckin`
Result of a completed 5-step check-in session.

```typescript
interface DailyCheckin {
  id: string                          // "chk-{timestamp}"
  date: string                        // ISO date "YYYY-MM-DD"
  timestamp: number
  mood: MoodType
  answers: {
    wentWell: string                  // Step 1 wins answer
    challenge: string                 // Step 2 challenge answer
    learned: string                   // Step 3 lesson answer
    grateful: string                  // Step 4 gratitude answer
    tomorrow: string                  // Step 5 focus answer
  }
  aiSummary: string                   // AI-generated Thai summary
}
```

---

### 1.3 Goal & Habit Types

#### `GoalItem`

```typescript
interface GoalItem {
  id: string                          // "g-{timestamp}"
  title: string
  category: string                    // e.g., "Languages", "Health", "Finance"
  priority: "High" | "Medium" | "Low"
  progressPercent: number             // 0–100 (auto-calculated from milestones)
  deadline: string                    // ISO date string
  milestones: MilestoneItem[]
  vision: string                      // Why this goal matters
  aiSuggestions: string[]             // AI coaching tips for this goal
  completed: boolean                  // true when progressPercent === 100
  archived: boolean
  createdAt: string                   // ISO date string
  dimension?: LifeDimension
}

interface MilestoneItem {
  id: string                          // "m{n}"
  title: string
  completed: boolean
}
```

**Milestone ? Progress Calculation:**
```
progressPercent = Math.round((completedMilestones.length / totalMilestones.length) * 100)
completed = (progressPercent === 100)
```

#### `HabitItem`

```typescript
interface HabitItem {
  id: string                          // "h-{timestamp}"
  title: string
  category: string                    // "Health", "Learning", etc.
  repeatSchedule: string              // "??????", "?????????-?????", etc.
  reminderTime: string                // "HH:MM" string
  currentStreak: number               // Days in a row
  bestStreak: number                  // All-time best streak
  completedDates: string[]            // ISO date strings ["2024-01-01", ...]
  completionRate: number              // completedDates.length / 30 * 100
  dimension?: LifeDimension
}
```

**Daily Toggle Logic** (in `HabitsModal`):
```
isDone = completedDates.includes(todayStr)
if toggle:
  newDates = isDone ? filter out today : [...completedDates, today]
  newStreak = isDone ? max(0, streak-1) : streak+1
  bestStreak = max(bestStreak, newStreak)
  completionRate = min(100, round(newDates.length / 30 * 100))
```

---

### 1.4 Task & Organization Types

#### `ChecklistItem`

```typescript
interface ChecklistItem {
  id: string                          // "c-{timestamp}"
  title: string
  priority: "High" | "Medium" | "Low"
  deadline: string                    // Display string (e.g., "??????")
  completed: boolean
  category: string
}
```

#### `TodayMission`
Used on the Home view for daily featured missions.

```typescript
interface TodayMission {
  id: string
  title: string
  icon: string                        // Emoji icon
  priority: "High" | "Medium" | "Low"
  completed: boolean
  category: string
}
```

#### `ReminderItem`
In-memory quick notes with optional journal conversion.

```typescript
interface ReminderItem {
  id: string                          // "rem-{timestamp}"
  text: string
  createdAt: number
  dimension?: LifeDimension           // Used when converting to journal entry
}
```

---

### 1.5 Knowledge Types

#### `BrainCard`
The core unit of the Life Brain knowledge system.

```typescript
interface BrainCard {
  id: string                          // "brain-{timestamp}-{random5}"
  title: string
  description: string
  dimension: LifeDimension
  brainType: BrainType
  tags: string[]
  linkedJournalIds: string[]          // IDs of linked JournalEntry
  createdAt: number
  updatedAt: number
}
```

`BrainType` constant array (`BRAIN_TYPES`):
```typescript
const BRAIN_TYPES = [
  "Goal", "Belief", "Lesson", "Idea", "Fear",
  "Value", "Habit", "Memory", "Vision", "Principle"
]
```

`LifeDimension` union type:
```typescript
type LifeDimension =
  | "goal" | "health" | "finance" | "mindset"
  | "relationship" | "career" | "learning" | "creativity"
  | "spiritual" | "family" | "social" | "environment"
```

`LIFE_DIMENSIONS` constant array (12 items) — each has `{ id, label, emoji }`:
| id | label | emoji |
|---|---|---|
| goal | ???????? | ?? |
| health | ?????? | ?? |
| finance | ??????? | ?? |
| mindset | ????? & ??????? | ?? |
| relationship | ???????????? | ?? |
| career | ????? & ??? | ?? |
| learning | ??????????? | ?? |
| creativity | ????????????????? | ? |
| spiritual | ????????? | ?? |
| family | ???????? | ?? |
| social | ????? | ?? |
| environment | ??????????? | ?? |

---

### 1.6 Lifestyle Types

#### `VisionCategoryItem`

```typescript
interface VisionCategoryItem {
  id: string                          // "v-{timestamp}"
  category: "Dream House" | "Travel" | "Health" | "Career" | "Family" | "Finance" | string
  title: string
  imageUrl: string                    // External image URL (Unsplash default)
  notes: string
  progressPercent: number
}
```

#### `AffirmationItem`

```typescript
interface AffirmationItem {
  id: string                          // "a-{timestamp}"
  text: string                        // The affirmation statement
  category: "Morning" | "Evening" | "Power" | string
  favorite: boolean
}
```

#### `TimelineEvent`
Historical life events shown in the Timeline modal.

```typescript
interface TimelineEvent {
  id: string
  dateStr: string                     // Display date (e.g., "??.?. 2024")
  title: string
  description: string
  badge: string                       // Short label (e.g., "?? Achievement")
  imageUrl?: string                   // Optional image
  type: "journal" | "goal" | "habit" | "checkin" | "milestone" | "custom"
}
```

#### `AIChatMessage`

```typescript
interface AIChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  mode?: string                       // AI mode that generated this message
}
```

#### `PendingAITask`
Queued AI operations (for background processing pattern).

```typescript
interface PendingAITask {
  id: string
  type: "summarize_checkin" | "reflect_journal" | "suggest_card" | string
  payload: any
  createdAt: number
  status: "pending" | "processing" | "done" | "failed"
}
```

---

## 2. Database Layer (`src/lib/db.ts`)

### 2.1 Class: `RoomDatabase`

All methods are `static`. No instantiation required.

### 2.2 Storage Key Constants

```typescript
const SETTINGS_KEY = "mylifeos_settings_v2"
const CHARACTER_KEY = "mylifeos_character_v2"
const JOURNEY_KEY = "mylifeos_journey_v2"
const MISSIONS_KEY = "mylifeos_missions_v2"
const JOURNALS_KEY = "mylifeos_journals_v2"
const GOALS_KEY = "mylifeos_goals_v2"
const HABITS_KEY = "mylifeos_habits_v2"
const CHECKLIST_KEY = "mylifeos_checklist_v2"
const VISION_KEY = "mylifeos_vision_v2"
const AFFIRMATIONS_KEY = "mylifeos_affirmations_v2"
const MESSAGES_KEY = "mylifeos_messages_v2"
const TIMELINE_KEY = "mylifeos_timeline_v2"
const CHECKINS_KEY = "mylifeos_checkins_v2"
const PRESET_TAGS_KEY = "mylifeos_preset_tags_v2"
const PRESET_MOODS_KEY = "mylifeos_preset_moods_v2"
const BRAIN_CARDS_KEY = "mylifeos_brain_cards_v1"
const REMINDERS_KEY = "mylifeos_reminders_v1"
const PENDING_TASKS_KEY = "mylifeos_pending_tasks_v1"
```

### 2.3 Generic Read/Write Helpers (private)

```typescript
private static get<T>(key: string, fallback: T): T
// localStorage.getItem(key) ? JSON.parse ? return || fallback
// try/catch: any parse error returns fallback

private static set<T>(key: string, value: T): void
// localStorage.setItem(key, JSON.stringify(value))
// try/catch: silently swallows write errors (localStorage full)
```

### 2.4 Default Data Structures

#### `DEFAULT_SETTINGS`
```typescript
{
  userName: "??????????",
  aiProvider: "gemini",
  aiApiKey: "",
  preferredLanguage: "th",
  apiProviders: []
}
```

#### `DEFAULT_CHARACTER`
```typescript
{
  discipline: 0, health: 0, finance: 0, confidence: 0, energy: 0,
  wisdom: 0, creativity: 0, courage: 0, social: 0, selfAwareness: 0
}
```

#### `DEFAULT_JOURNEY` (5 phases)
Pre-populated with Thai-language journey phases from "?????????" to "???????". Phase 1 has status `"current"`, phases 2–5 have `"upcoming"`.

#### `DEFAULT_PRESET_TAGS` (exported constant)
```typescript
export const DEFAULT_PRESET_TAGS = [
  "??????????", "???????????", "??????", "????????????",
  "???????", "??????", "???", "????????", "?????????"
]
```

#### `PresetMood` type and defaults
```typescript
interface PresetMood {
  id: string
  emoji: string
  label: string
}
```
Default 8 moods: from ?? (??????????) to ?? (?????????)

### 2.5 All Public CRUD Methods

#### Settings

| Method | Signature | Description |
|---|---|---|
| `getSettings()` | `(): UserSettings` | Read settings or DEFAULT_SETTINGS |
| `saveSettings()` | `(s: UserSettings): void` | Write settings to localStorage |

#### Character / Stats

| Method | Signature | Description |
|---|---|---|
| `getCharacter()` | `(): CharacterStatus` | Read char or DEFAULT_CHARACTER |
| `saveCharacter()` | `(c: CharacterStatus): void` | Write char |

#### Journey

| Method | Signature | Description |
|---|---|---|
| `getJourney()` | `(): LifeJourneyPhase[]` | Read journey or DEFAULT_JOURNEY |
| `saveJourney()` | `(j: LifeJourneyPhase[]): void` | Write journey |

#### Missions (Today's featured tasks)

| Method | Description |
|---|---|
| `getMissions(): TodayMission[]` | Read missions or `[]` |
| `saveMissions(m: TodayMission[]): void` | Write missions |

#### Journals

| Method | Description |
|---|---|
| `getJournals(): JournalEntry[]` | Read journals or `[]` |
| `saveJournals(j: JournalEntry[]): void` | Write journals |

#### Goals

| Method | Description |
|---|---|
| `getGoals(): GoalItem[]` | Read goals or `[]` |
| `saveGoals(g: GoalItem[]): void` | Write goals |

#### Habits

| Method | Description |
|---|---|
| `getHabits(): HabitItem[]` | Read habits or `[]` |
| `saveHabits(h: HabitItem[]): void` | Write habits |

#### Checklist

| Method | Description |
|---|---|
| `getChecklist(): ChecklistItem[]` | Read checklist or `[]` |
| `saveChecklist(c: ChecklistItem[]): void` | Write checklist |

#### Vision Board

| Method | Description |
|---|---|
| `getVision(): VisionCategoryItem[]` | Read vision or `[]` |
| `saveVision(v: VisionCategoryItem[]): void` | Write vision |

#### Affirmations

| Method | Description |
|---|---|
| `getAffirmations(): AffirmationItem[]` | Read affirmations or `[]` |
| `saveAffirmations(a: AffirmationItem[]): void` | Write affirmations |

#### AI Chat Messages

| Method | Description |
|---|---|
| `getMessages(): AIChatMessage[]` | Read messages or `[]` |
| `saveMessages(m: AIChatMessage[]): void` | Write messages |

#### Timeline

| Method | Description |
|---|---|
| `getTimeline(): TimelineEvent[]` | Read timeline or `[]` |
| `saveTimeline(t: TimelineEvent[]): void` | Write timeline |

#### Daily Check-ins

| Method | Description |
|---|---|
| `getCheckins(): DailyCheckin[]` | Read checkins or `[]` |
| `saveCheckins(c: DailyCheckin[]): void` | Write checkins |

#### Preset Tags and Moods

| Method | Description |
|---|---|
| `getPresetTags(): string[]` | Read tags or DEFAULT_PRESET_TAGS |
| `savePresetTags(t: string[]): void` | Write tags |
| `getPresetMoods(): PresetMood[]` | Read moods or default 8 moods |
| `savePresetMoods(m: PresetMood[]): void` | Write moods |

#### Brain Cards

| Method | Description |
|---|---|
| `getBrainCards(): BrainCard[]` | Read cards or `[]` |
| `saveBrainCards(c: BrainCard[]): void` | Write cards |

#### Reminders

| Method | Description |
|---|---|
| `getReminders(): ReminderItem[]` | Read reminders or `[]` |
| `saveReminders(r: ReminderItem[]): void` | Write reminders |

#### Pending AI Tasks

| Method | Description |
|---|---|
| `getPendingTasks(): PendingAITask[]` | Read pending tasks or `[]` |
| `savePendingTasks(t: PendingAITask[]): void` | Write pending tasks |

### 2.6 Utility Methods

#### `getStorageSize(): string`
```
Calculates total localStorage usage in KB.
Formula: sum of (key.length + value.length) * 2 for all entries
Returns: formatted string like "142.3 KB"
```

#### `clearAllData(): void`
```
Removes all mylifeos_* keys from localStorage.
Iterates localStorage keys, filters by prefix "mylifeos_", removes each.
Used by: SettingsModal Danger Zone button
```

#### `exportBackupZip(): Promise<Blob>`
```
Creates a JSZip archive containing one JSON file per data domain.
Files: settings.json, character.json, journey.json, missions.json,
       journals.json, goals.json, habits.json, checklist.json,
       vision.json, affirmations.json, messages.json, timeline.json,
       checkins.json, preset_tags.json, preset_moods.json,
       brain_cards.json, reminders.json
Returns: Blob for browser download trigger
Used by: SettingsModal Export button
```

#### `importBackupZip(file: File): Promise<boolean>`
```
Reads a ZIP file using JSZip, parses each JSON file,
writes each dataset back to localStorage.
Returns: true on success, false on parse/read error
Used by: SettingsModal Import button
```

### 2.7 Migration System

#### `runMigrations(): void`
Called once in `App.tsx` `useEffect` on mount.

```
Migration v2 (flag: mylifeos_migrated_v2):
  - Removes all v1 storage keys
  - Sets flag ? never runs again

Migration v3 (flag: mylifeos_migrated_v3):
  - Reads legacy settings.aiApiKey
  - If non-empty, creates APIProvider object with Gemini + that key
  - Saves to settings.apiProviders
  - Reads legacy reminders (may have been stored as string[])
  - Converts to ReminderItem[] format if needed
  - Sets flag ? never runs again
```

---

## 3. Business Logic in App.tsx

`App.tsx` is where all the cross-domain business rules live — actions that touch multiple data domains simultaneously.

### 3.1 Character Stat Update Logic

Character stats are updated as side effects of user actions. Each action has defined stat increments:

| User Action | Stat Changes |
|---|---|
| Add journal entry | `wisdom += 2`, `selfAwareness += 1` |
| Complete daily check-in | `selfAwareness += 3`, `wisdom += 2` |
| Add goal | `courage += 2` |
| Complete goal milestone | `discipline += 3`, `confidence += 2` |
| Toggle habit (done) | `health += 2`, `discipline += 1` |
| Add brain card | `wisdom += 3`, `creativity += 2` |
| Add vision item | `creativity += 3` |
| Add affirmation | `confidence += 2` |
| Add checklist item | `discipline += 1` |
| Complete checklist item | `discipline += 2`, `energy += 1` |

**Stat cap:** All stats are capped at `Math.min(100, currentValue + increment)`.

### 3.2 Timeline Event Generation

When certain actions occur, `App.tsx` auto-generates a `TimelineEvent` and prepends it to the timeline:

| Trigger | Event Badge | Event Type |
|---|---|---|
| Add journal entry | `"?? Journal"` | `"journal"` |
| Complete daily check-in | `"? Check-in"` | `"checkin"` |
| Complete goal (100%) | `"?? Goal Achieved"` | `"goal"` |
| Add brain card | `"?? Brain Card"` | custom |

Timeline events are prepended (`[newEvent, ...existingTimeline]`).

### 3.3 Reminder ? Journal Conversion

When a user completes (checks off) a reminder in `NotificationBell` or `HomeView`:

1. App sets `popupReminder = item` (the `ReminderItem`)
2. `ReminderJournalModal` renders with the reminder text
3. User selects mood and tags, submits
4. `handleReminderConfirm(entry)` in App:
   - Calls `onAddJournal(entry)` (saves entry, updates wisdom stat, creates timeline event)
   - Calls `handleDeleteReminder(popupReminder.id)` (removes from reminders list)
   - Clears `popupReminder = null`

### 3.4 AI Suggest ? Brain Card Pipeline

When `AICoachView` calls `onSuggestBrainCard(partialCard)`:

1. App sets `suggestedCard = partialCard`
2. `AISuggestPopup` renders with 15-second auto-dismiss
3. If user confirms: `handleAISuggestConfirm(partial)` in App:
   - Merges `partial` into a full `BrainCard` with generated ID + timestamps
   - Calls `handleSaveBrainCard(card)` ? saves + bumps `wisdom += 3, creativity += 2`
   - Clears `suggestedCard = null`

### 3.5 Search Navigation

`GlobalSearchModal` callbacks:
- `onSelectJournal(entry)` ? closes search, switches to journal tab, scrolls to entry
- `onSelectGoal(goal)` ? closes search, opens GoalsModal
- `onSelectBrainCard(card)` ? closes search, opens LifeBrainView, auto-selects the card

---

## 4. Text Utilities (`src/lib/textUtils.ts`)

### `countWords(text: string): number`

**Purpose:** Accurately count words in Thai+English mixed text.

**Algorithm:**
```
1. Return 0 if text is empty/whitespace
2. Try Intl.Segmenter("th", { granularity: "word" }):
   a. Segment the text into word-like units
   b. Filter by segment.isWordLike === true
   c. Return count if > 0
3. Fallback: text.trim().split(/\s+/).filter(Boolean).length
```

**Used by:** `DailyCheckinModal` to show live word count during check-in. Green badge when >= 100 words ("AI ??????????????????????" encouragement).

---

## 5. Complete State Mutation Reference

Every function that mutates data in `App.tsx`:

### Journal Operations
```typescript
handleAddJournal(entry: JournalEntry)
  ? setJournals([entry, ...journals])
  ? RoomDatabase.saveJournals(updated)
  ? updateCharacter({ wisdom: +2, selfAwareness: +1 })
  ? appendTimeline({ type: "journal", badge: "?? Journal", ... })

handleDeleteJournal(id: string)
  ? setJournals(journals.filter(j => j.id !== id))
  ? RoomDatabase.saveJournals(updated)

handleUpdateJournal(updated: JournalEntry)
  ? setJournals(journals.map(j => j.id === updated.id ? updated : j))
  ? RoomDatabase.saveJournals(updated)
```

### Goal Operations
```typescript
handleSaveGoals(goals: GoalItem[])
  ? setGoals(goals)
  ? RoomDatabase.saveGoals(goals)
  ? [if any goal newly completed] updateCharacter({ discipline: +3, confidence: +2 })
  ? [if any goal newly completed] appendTimeline({ type: "goal", badge: "?? Goal Achieved" })
```

### Habit Operations
```typescript
handleSaveHabits(habits: HabitItem[])
  ? setHabits(habits)
  ? RoomDatabase.saveHabits(habits)
  ? [called after toggle] updateCharacter({ health: +2, discipline: +1 })
```

### Checklist Operations
```typescript
handleSaveChecklist(checklist: ChecklistItem[])
  ? setChecklist(checklist)
  ? RoomDatabase.saveChecklist(checklist)
  ? [if item newly completed] updateCharacter({ discipline: +2, energy: +1 })
```

### Check-in Operations
```typescript
handleSaveCheckin(checkin: DailyCheckin)
  ? setCheckins([checkin, ...checkins])
  ? RoomDatabase.saveCheckins(updated)
  ? updateCharacter({ selfAwareness: +3, wisdom: +2 })
  ? appendTimeline({ type: "checkin", badge: "? Check-in" })
```

### Brain Card Operations
```typescript
handleSaveBrainCard(card: BrainCard)
  ? if editing: setCards(cards.map(c => c.id === card.id ? card : c))
  ? if new: setCards([card, ...cards])
  ? RoomDatabase.saveBrainCards(updated)
  ? [if new] updateCharacter({ wisdom: +3, creativity: +2 })

handleDeleteBrainCard(id: string)
  ? setCards(cards.filter(c => c.id !== id))
  ? RoomDatabase.saveBrainCards(updated)
```

### Reminder Operations
```typescript
handleAddReminder(text: string)
  ? new ReminderItem { id: "rem-{Date.now()}", text, createdAt: Date.now() }
  ? setReminders([newItem, ...reminders])
  ? RoomDatabase.saveReminders(updated)

handleEditReminder(id: string, newText: string)
  ? setReminders(reminders.map(r => r.id === id ? {...r, text: newText} : r))
  ? RoomDatabase.saveReminders(updated)

handleDeleteReminder(id: string)
  ? setReminders(reminders.filter(r => r.id !== id))
  ? RoomDatabase.saveReminders(updated)

handleCompleteReminder(item: ReminderItem)
  ? setPopupReminder(item)  // triggers ReminderJournalModal
```

### Settings Operations
```typescript
handleSaveSettings(settings: UserSettings)
  ? setSettings(settings)
  ? RoomDatabase.saveSettings(settings)

handleReloadApp()
  ? window.location.reload()
```

### Message Operations
```typescript
handleSaveMessages(messages: AIChatMessage[])
  ? setMessages(messages)
  ? RoomDatabase.saveMessages(messages)
```

---

## 6. ID Generation Patterns

| Entity | Pattern | Example |
|---|---|---|
| JournalEntry | `"j-" + Date.now()` | `j-1706345600000` |
| GoalItem | `"g-" + Date.now()` | `g-1706345600000` |
| HabitItem | `"h-" + Date.now()` | `h-1706345600000` |
| ChecklistItem | `"c-" + Date.now()` | `c-1706345600000` |
| VisionCategoryItem | `"v-" + Date.now()` | `v-1706345600000` |
| AffirmationItem | `"a-" + Date.now()` | `a-1706345600000` |
| DailyCheckin | `"chk-" + Date.now()` | `chk-1706345600000` |
| BrainCard | `"brain-" + Date.now() + "-" + random(5)` | `brain-1706345600000-x7k2p` |
| ReminderItem | `"rem-" + Date.now()` | `rem-1706345600000` |
| AIChatMessage | timestamp-based | internal |
| APIProvider | `"provider-" + Date.now()` | `provider-1706345600000` |
| MilestoneItem | `"m1"`, `"m2"` (static defaults) | `m1` |
| TimelineEvent | timestamp-based string | internal |

---

## 7. Domain Validation Rules

| Field | Rule |
|---|---|
| BrainCard.title | Required (non-empty after trim) |
| BrainCard.dimension | Required (must be valid LifeDimension) |
| BrainCard.brainType | Required (must be in BRAIN_TYPES) |
| GoalItem.title | Required (non-empty after trim) |
| HabitItem.title | Required (non-empty after trim) |
| ChecklistItem.title | Required (non-empty after trim) |
| VisionCategoryItem.title | Required (non-empty after trim) |
| JournalEntry | No explicit required fields — all optional except id/date/timestamp |
| DailyCheckin | No required answer length — submits with empty answers |
| APIProvider.apiKey | Validated by test-connection call only |
| Tag input | Strips leading `#`, rejects duplicates, empty strings |
| Reminder text | Must be non-empty after trim to add |
