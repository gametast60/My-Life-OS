# UI_UX_SYSTEM.md — My Life OS

> Complete UI/UX system documentation covering every component, view, design token, interaction pattern, and visual specification.

---

## 1. Design Philosophy

My Life OS follows a **Dark Olive Glassmorphism** aesthetic:
- Deep forest-green dark backgrounds with subtle green-tinted glass panels
- Monochrome hierarchy using opacity and weight, not color variation
- Micro-animations on every interaction (scale, fade-in, slide)
- RPG game-style stat display for life metrics
- Thai typography throughout with English labels where needed

---

## 2. Design Token System

### Color Palette (Hard-coded in Tailwind arbitrary values)

| Token | Hex | Usage |
|---|---|---|
| Background Base | `#0A0E0A` | Root page background, header backdrop |
| Surface 1 | `#131913` | Card backgrounds, modal backgrounds |
| Surface 2 | `#182018` | Input fields, inner card sections |
| Surface 3 | `#1F2B1F` | Borders, dividers, subtle backgrounds |
| Surface 4 | `#223022` | Habit/goal inner cards |
| Green Primary | `#4E7345` | CTAs, active states, progress bars |
| Green Secondary | `#3F5C3A` | Button backgrounds, active nav tabs |
| Green Accent | `#6B9361` | Icons, stat values, highlights |
| Green Bright | `#7A9B61` | Secondary stat color |
| Green Muted | `#273727` | Tag backgrounds, badge backgrounds |
| Green Border | `#354B35` | Badge borders |
| Text Primary | `#EBF1EA` | Main readable text |
| Text Secondary | `#869883` | Labels, captions, helper text |
| Text Muted | `#697A66` | Descriptions, placeholders |
| Text Dark | `#576656` | Disabled states, empty state text |
| Accent Brown | `#B07A60` | Finance and courage stat color |
| Error Red | `#B07070` | Form validation errors |
| Delete Red | `rose-400` (Tailwind) | Delete actions |
| Header BG | `#0A0E0A/90` | Header with 90% opacity |

### Spacing and Sizing

The system uses Tailwind v4 spacing units. Key patterns:
- Cards: `rounded-3xl p-5` or `rounded-3xl p-6`
- Inner cards: `rounded-2xl p-4`
- Inputs: `rounded-xl px-4 py-3`
- Buttons: `rounded-xl px-4 py-2.5` or `rounded-full`
- Tags: `rounded-lg px-2.5 py-1`
- Badges: `rounded-full px-2 py-0.5`

### Typography

All text uses browser default (system font). Key size hierarchy:
- Page title: `text-2xl sm:text-3xl font-bold tracking-tight`
- Section header: `text-base sm:text-lg font-bold`
- Card title: `text-sm font-bold` or `text-base font-bold`
- Label: `text-xs font-medium` or `text-xs font-bold uppercase tracking-wider`
- Body: `text-xs` or `text-sm`
- Monospace value: `font-mono font-bold`
- Caption: `text-[10px]` or `text-[11px]`

---

## 3. Layout Architecture

### Shell Structure

```
+-----------------------------------------+
¦ HEADER (fixed top, z-30)                ¦
¦ Logo | Search | Manage AI | Bell | Gear ¦
+-----------------------------------------¦
¦                                         ¦
¦ MAIN CONTENT AREA                       ¦
¦ (pt-16 pb-28, scrollable, max-w-7xl)   ¦
¦                                         ¦
¦ [Tab Content or LifeBrainView overlay]  ¦
¦                                         ¦
+-----------------------------------------¦
¦ BOTTOM NAV (fixed bottom, z-40)         ¦
¦ Home | Journey | Coach | Journal | Prog ¦
+-----------------------------------------¦
¦ FLOATING AI BUTTON (fixed, z-50)        ¦
¦ bottom-20 right-5                       ¦
+-----------------------------------------+
```

**Responsive breakpoints:**
- Mobile: single-column, bottom-3 floating nav, rounded-3xl pill
- Desktop (md+): centered floating nav, wider grid layouts

---

## 4. Navigation Components

### Header (`src/components/Header.tsx`)

**Layout:** Fixed `top-0 left-0 right-0 z-30`, `backdrop-blur-md`, `bg-[#0A0E0A]/90`

**Elements (left to right):**
1. **Logo badge** — `w-8 h-8` rounded-xl gradient green, text "OS"
2. **Search button** — Search icon, triggers `onOpenSearch`
3. **Manage AI button** — Key icon + "Manage AI" text, triggers `onOpenManageAPI`
4. **NotificationBell** — Bell icon + count badge, dropdown for reminders
5. **Settings button** — Settings icon, triggers `onOpenSettings`

**Props:**
```typescript
interface HeaderProps {
  settings: UserSettings
  reminders?: ReminderItem[]
  onAddReminder?: (text: string) => void
  onEditReminder?: (id: string, newText: string) => void
  onDeleteReminder?: (id: string) => void
  onCompleteReminder?: (item: ReminderItem) => void
  onClearAllReminders?: () => void
  onOpenSettings: () => void
  onOpenSearch: () => void
  onOpenAIQuick?: () => void
  onOpenManageAPI?: () => void
}
```

### BottomNav (`src/components/BottomNav.tsx`)

**Export:** Also exports `NavTab` type = `"home" | "journey" | "coach" | "journal" | "progress"`

**Mobile version:** Fixed `bottom-3 left-3 right-3`, `rounded-3xl`, `bg-[#131913]/95`, `backdrop-blur-2xl`

**Desktop version:** Fixed `bottom-6`, centered, horizontal pill, same glass treatment

**Tab definitions:**
| id | Thai Label | Icon |
|---|---|---|
| `home` | ??????? | LayoutDashboard |
| `journey` | ??????? | Map |
| `coach` | ???? | Bot |
| `journal` | ?????? | BookOpen |
| `progress` | ??????????? | TrendingUp |

**Active state:** `bg-[#3E5C3A] text-white font-semibold shadow-md` (mobile), `scale-105` (desktop)

### FloatingAIButton (`src/components/FloatingAIButton.tsx`)

**Position:** Fixed `bottom-20 md:bottom-24 right-5 md:right-8`, `z-50`

**Main button:** `w-14 h-14 rounded-full bg-[#3F5C3A]` with animated green ping badge

**Expanded menu (6 items):**
| Action | Label | Icon |
|---|---|---|
| `onOpenAICoach` | ?????? AI Coach | Bot |
| `"checkin"` | Daily Check-in | Sparkles |
| `"goal"` | ????????????? | Target |
| `"checklist"` | ??????????? | CheckSquare |
| `"vision"` | Vision Board | Eye |
| `"affirmation"` | ??????? (Affirmation) | Heart |

Menu uses `animate-in fade-in slide-in-from-bottom-5 duration-200`. Main button rotates 45deg when open (showing Plus ? X).

### NotificationBell (`src/components/NotificationBell.tsx`)

**Dropdown:** `fixed` on mobile (full-width), `absolute sm:w-96` on desktop. `animate-in fade-in slide-in-from-top-2 duration-200`.

**Features:**
- Quick-add input at top (Enter key triggers add)
- Per-item: inline edit (click text or Edit2 icon), check-off button (converts to journal), delete
- `onCompleteReminder(item)` triggers `ReminderJournalModal` (from App.tsx)
- Click outside closes via `useRef` + `mousedown` listener

---

## 5. View Specifications

### HomeView (`src/views/HomeView.tsx`)

**Purpose:** Daily dashboard and reminder quick-add

**Props:** `settings`, `reminders`, `checkins`, `onAddReminder`, `onEditReminder`, `onDeleteReminder`, `onCompleteReminder`, `onOpenCheckin`, `onOpenJournal`, `onOpenBrain`, `onNavigateTo`

**Sections:**

1. **Greeting Header** — Dynamic greeting based on `settings.userName`, time-based message (morning/afternoon/evening). Thai day name + date.

2. **Daily Check-in Status Card** — Full-width card. Shows if today has a check-in (`checkins.some(c => c.date === today)`). If yes, shows today's mood + AI summary. If no, shows "????? Check-in ??????" button.

3. **Quick Reminders Section** — Inline text input + Add button for new reminders. List renders reminder items with inline edit (click to edit, Enter/Escape to cancel), check-off (becomes journal), delete.

4. **Quick Navigation Grid** — Shortcut buttons to: ?????? (journal), Life Brain, ???????? (goals)

**Animations:** `animate-in fade-in duration-300`

### JourneyView (`src/views/JourneyView.tsx`)

**Purpose:** Life roadmap showing 5 development phases

**Props:** `journey: LifeJourneyPhase[]`, `settings: UserSettings`

**Layout:** `grid grid-cols-1 md:grid-cols-12 gap-6`

**Left sidebar (5 col):**
- AI Oracle Card — shows current phase title, subtitle, next milestone
- Phase Key Stats Card — progress bars for `phase.stats[]`

**Right main (7 col):**
- Timeline with vertical connector line (`before:` CSS pseudo-element)
- Per phase: circular node (Check/Flag/Lock icon), content box with progress bar for current phase
- Phase statuses: `completed` (green), `current` (active ring), `locked`/`upcoming` (muted)

### AICoachView (`src/views/AICoachView.tsx`)

**Purpose:** Central AI interaction hub

**Props:** `settings`, `brainCards`, `journals`, `checkins`, `goals`, `habits`, `messages`, `onSaveMessages`, `onSuggestBrainCard`, `onQuickAction`

**Sections:**

1. **AI Mode Selection Grid** — 8+ mode cards in a grid. Each mode has icon, title (Thai), description. Selected mode gets highlighted border.

   AI Modes available:
   | Mode | Thai Title | Description |
   |---|---|---|
   | `chat` | ??????????? | Free conversation |
   | `reflect` | ?????????? | Self-reflection |
   | `guide` | ??????????? | Life guidance |
   | `analyze` | ??????????????? | Daily analysis |
   | `morning` | Morning Ritual | Morning motivation |
   | `cbt` | CBT Therapy | Cognitive behavioral therapy |
   | `stoic` | Stoic Coach | Stoicism-based coaching |
   | `journal` | Journal Prompt | Writing prompts |

2. **Chat Popup** — Modal overlay with message history, input field, send button. Renders `AIChatMessage[]`. User messages right-aligned green, AI messages left-aligned dark.

3. **Today Analysis Panel** — Button triggers `analyzeToday()` which calls AI with all today's journals + checkin. Displays AI narrative response.

4. **Small Talk Section** — Pre-loaded motivational short message in Thai or English.

**Chat message structure:**
```typescript
interface AIChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  mode?: string
}
```

### JournalView (`src/views/JournalView.tsx`)

**Purpose:** Journal entry creation and browsing

**Props:** All state arrays (journals, goals, habits, brainCards, checkins, presetTags, presetMoods), all event handlers

**Sections:**

1. **Entry Form** — Title input, textarea (with word counter), dimension picker, mood picker (from presetMoods), tag selector (from presetTags). Save triggers `onAddJournal` which also bumps character wisdom stat.

2. **Journal Feed** — Chronological list of `JournalEntry` cards. Each card shows: date, mood, title, content excerpt, dimension badge, tags. Click to expand (inline edit mode).

3. **Journal Toolbar** — Filter by dimension, search, "Manage Tags" button, "Manage Moods" button.

**Journal entry form fields:**
```
title: string
content: string (main text)
dimension: LifeDimension
mood: MoodType (emoji from presetMoods)
emotion: string (mood label)
tags: string[] (from presetTags)
```

**JournalEntry type:**
```typescript
interface JournalEntry {
  id: string
  date: string
  timestamp: number
  title: string
  content: string
  mode: JournalMode
  mood: MoodType
  emotion: string
  tags: string[]
  favorite: boolean
  pinned: boolean
  dimension: LifeDimension
  linkedBrainCardIds: string[]
}
```

### ProgressView (`src/views/ProgressView.tsx`)

**Purpose:** Life RPG statistics and progress tracking

**Props:** `habits`, `goals`, `character`, `checkins`

**Sections:**

1. **Overview Cards (4 columns):**
   - ?????????????: habits with currentStreak > 0 count / total
   - ?????????????????: goals with progressPercent >= 100 / total
   - Check-in Total: `checkins.length` total
   - ?????? RPG Stat: average of all 10 character stats

2. **Life RPG Stats (10 character dimensions):**

   **Physical & Action group:**
   | Key | Thai Name | Color | Description |
   |---|---|---|---|
   | `discipline` | ????? | `#4E7345` | Mission completion rate |
   | `health` | ?????? | `#6B9361` | Habits & exercise |
   | `finance` | ??????? | `#B07A60` | Financial goals progress |
   | `confidence` | ?????????? | `#7A9B61` | Streak & achievements |
   | `energy` | ??????? | `#6B9361` | Daily vitality |

   **Mind & Spirit group:**
   | Key | Thai Name | Color | Description |
   |---|---|---|---|
   | `wisdom` | ????????? | `#6B9361` | Reflection & AI Lessons |
   | `creativity` | ????????????????? | `#7A9B61` | Vision Board & Ideas |
   | `courage` | ??????????? | `#B07A60` | High priority goals & challenges |
   | `social` | ???????????? | `#4E7345` | Relationship journals & goals |
   | `selfAwareness` | ?????????????????? | `#6B9361` | Check-in streak & CBT |

   Each stat renders as a labeled progress bar with colored fill. Decay note: "-1 ???? / 30 ????????????????" shown in section header.

3. **Habits Progress list** — Per habit: title, streak bar (currentStreak / 30 * 100%)

4. **Goals Progress list** — Per goal: title, progressPercent bar

### LifeBrainView (`src/views/LifeBrainView.tsx`)

**Purpose:** Knowledge management — Brain Card collection

**Props:** `brainCards`, `journals`, `onSave`, `onDelete`, `onClose`

**Layout:** Fullscreen overlay replacing tab content.

**Sections:**
1. **Filter Bar** — Search input, dimension dropdown, brain type dropdown
2. **Stats row** — Total cards, filtered count, dimension breakdown
3. **Card Grid** — Responsive grid of Brain Cards. Each card shows:
   - Brain type badge, dimension emoji + label
   - Title (bold), description (truncated)
   - Tags as inline chips
   - Linked journal count badge
   - Edit + Delete buttons on hover

4. **Card Detail Expand** — Click card opens full-screen detail panel showing all fields, linked journals list, created/updated timestamps

**BrainCard type:**
```typescript
interface BrainCard {
  id: string
  title: string
  description: string
  dimension: LifeDimension
  brainType: BrainType
  tags: string[]
  linkedJournalIds: string[]
  createdAt: number
  updatedAt: number
}
```

**Brain Types (BRAIN_TYPES constant):**
`"Goal" | "Belief" | "Lesson" | "Idea" | "Fear" | "Value" | "Habit" | "Memory" | "Vision" | "Principle"`

**Life Dimensions (LIFE_DIMENSIONS constant):**
12 dimensions: `goal`, `health`, `finance`, `mindset`, `relationship`, `career`, `learning`, `creativity`, `spiritual`, `family`, `social`, `environment`

Each has: `{ id, label, emoji }`

---

## 6. Modal Specifications

### DailyCheckinModal (`src/views/DailyCheckinModal.tsx`)

**Pattern:** 5-step wizard with progress bar

**Steps:**
1. **??????** — 5-button mood grid (??????????) + wins textarea
2. **???????** — Challenge textarea
3. **???????** — Learned textarea
4. **??????** — Gratitude textarea
5. **????????** — Tomorrow focus textarea

**Word counter:** Live `countWords()` display across all 5 answers. Turns green when >= 100 words.

**Submission:** Calls `summarizeDailyCheckin(checkinData, settings)` ? AI generates Thai summary ? saves `DailyCheckin` object with AI summary.

**Navigation:** Back/Next buttons, disabled submit until step 5.

### GoalsModal (`src/views/GoalsModal.tsx`)

**Pattern:** Inline CRUD list + add form bar

**Add form:** Title input + priority select + category select + Add button. Default deadline `2026-12-31`, default 2 milestones, default AI suggestion.

**Per goal card:**
- Title, category badge
- Progress bar (progressPercent %)
- Milestone list — click to toggle (recalculates progressPercent = completed/total * 100)
- AI Suggestion box (shows first suggestion if any)
- Delete button

### HabitsModal (`src/views/HabitsModal.tsx`)

**Pattern:** Inline CRUD list + add form bar

**Per habit card:**
- Daily toggle button (`w-10 h-10 rounded-xl`) — checks/unchecks today's date in `completedDates[]`
- Streak display (Flame icon + count)
- Streak logic: toggle adds/removes today from `completedDates`, increments/decrements `currentStreak`, updates `bestStreak`, recalculates `completionRate = completedDates.length / 30 * 100`

### BrainCardModal (`src/components/BrainCardModal.tsx`)

**Pattern:** Bottom-sheet on mobile (`rounded-t-3xl`), centered modal on desktop

**Fields:**
- Title (required, text input)
- Description (textarea, optional)
- Life Dimension (custom dropdown with LIFE_DIMENSIONS)
- Brain Type (custom dropdown with BRAIN_TYPES)
- Tags (chip input — Enter or comma to add, X to remove)
- Link Journal (collapsible section with search + checkbox list, max 20 journals)

**Validation:** Title, dimension, brainType required. Shows error messages under fields.

**ID generation:** `brain-${Date.now()}-${Math.random().toString(36).slice(2,7)}`

### ManageAPIModal (`src/components/ManageAPIModal.tsx`)

**Pattern:** Provider card list + add buttons

**Per provider card:**
- Priority badge (#1, #2, etc.), provider name
- Enable/disable checkbox toggle
- API Key input (password field with show/hide toggle)
- Model name input (OpenRouter uses select dropdown, others free text)
- Test Connection button ? calls `testProviderConnection(provider)` ? shows success/fail badge
- Delete button

**Add buttons:** Gemini (emerald), Groq (orange), OpenRouter (purple) — each creates new `APIProvider` with defaults

**Provider defaults:**
```
Gemini:     model="gemini-2.5-flash",     placeholder="AIzaSy..."
Groq:       model="llama-3.3-70b-versatile", placeholder="gsk_..."
OpenRouter: model="openrouter/free",       placeholder="sk-or-v1-..."
```

### SettingsModal (`src/views/SettingsModal.tsx`)

**Sections:**
1. **???????** — userName text input
2. **AI Providers** — Button that opens ManageAPIModal
3. **???????????** — Export Backup (ZIP) button + Import Backup (file input) button + storage size display
4. **Danger Zone** — Reset all local storage button

**Export logic:** `RoomDatabase.exportBackupZip()` ? JSZip blob ? `<a>` download trigger
**Import logic:** `RoomDatabase.importBackupZip(file)` ? prompt for confirmation ? reload app

### GlobalSearchModal (`src/components/GlobalSearchModal.tsx`)

**Pattern:** Full-screen overlay with search input and results

**Filters:**
- Dimension dropdown (LIFE_DIMENSIONS + "all")
- Brain Type dropdown (BRAIN_TYPES + "all")

**Result sections** (shown when query or filter active):
1. Life Brain (BrainCards) — title, brainType badge, description excerpt. Click ? `onSelectBrainCard(card)` + close
2. Journal — title, date, content excerpt. Click ? `onSelectJournal(entry)` + close
3. Goals — title, progressPercent. Click ? `onSelectGoal(goal)` + close
4. Habits — title, streak count (display only)

### VisionBoardModal (`src/views/VisionBoardModal.tsx`)

**Pattern:** Image card grid + add form

**Add form:** title input, imageUrl input (defaults to Unsplash photo if empty), category select

**Card display:** `h-40 rounded-xl overflow-hidden` image with `group-hover:scale-105` zoom, category badge overlay, title + notes below. Delete button top-right overlay.

### AffirmationsModal (`src/views/AffirmationsModal.tsx`)

**Pattern:** Audio player UI + affirmation list

**Player:** Volume2 icon with `animate-pulse`, current affirmation text displayed in quotes. Play/Pause toggle (UI only — no actual Web Audio API).

**List:** Click to select (sets currentIndex). AI generate button appends hardcoded Thai affirmation.

### AISuggestPopup (`src/components/AISuggestPopup.tsx`)

**Pattern:** Toast notification anchored `bottom-24 left-4 right-4 z-50`

**Content:** Brain icon header, card preview (title, description excerpt, dimension badge, brainType badge, first 2 tags). Two buttons: Dismiss / "??????? Life Brain"

**Auto-dismiss:** `setTimeout(onDismiss, 15000)` with animated shrinking progress bar via CSS `@keyframes shrink-x`

### ReminderJournalModal (`src/components/ReminderJournalModal.tsx`)

**Triggered by:** Completing a reminder (check-off button)

**Purpose:** Convert reminder text into a journal entry

**Fields:**
- Preview of reminder text
- Mood picker (from presetMoods)
- Tag chips (from presetTags)

**Output:** Creates `JournalEntry` with reminder text as content, selected mood and tags, dimension from `item.dimension || "mindset"`

---

## 7. Form Patterns

### Inline Edit Pattern (used in HomeView, NotificationBell)

1. Display text in normal mode
2. Click text or Edit icon ? switches to `<input autoFocus>`
3. Enter ? save, Escape ? cancel
4. Controlled by `editingId` state (null = not editing)

### Custom Dropdown Pattern (used in BrainCardModal)

1. Button shows current selection
2. Click button ? `isDimOpen = true` ? renders absolute dropdown div
3. Dropdown items click ? update selection + close
4. No outside-click dismiss (user must select an item)

### Tag Input Pattern (used in BrainCardModal, JournalView)

1. Text input ? Enter or comma key ? `addTag()`
2. `addTag()` strips `#` prefix, checks for duplicate, appends to array
3. Tags render as chips with X button to remove

---

## 8. Animation Inventory

| Pattern | Tailwind Class | Usage |
|---|---|---|
| Page fade-in | `animate-in fade-in duration-300` | Tab content views |
| Modal fade-in | `animate-in fade-in duration-200` | Modal overlays |
| Bottom slide | `animate-in slide-in-from-bottom-4 duration-300` | ReminderJournalModal, AISuggestPopup |
| Top slide | `animate-in slide-in-from-top-2 duration-200` | NotificationBell dropdown |
| Radial menu | `animate-in fade-in slide-in-from-bottom-5 duration-200` | FloatingAIButton expanded |
| Zoom in | `animate-in zoom-in-95 duration-200` | ManageTagsModal |
| Spin | `animate-spin` | AI loading indicators (Sparkles, RefreshCw icons) |
| Pulse | `animate-pulse` | AffirmationsModal volume icon |
| Hover scale | `hover:scale-105` | VisionBoard images, FloatingAIButton |
| Active scale | `active:scale-95` | Submit buttons |
| Progress bar | `transition-all duration-500` | RPG stat bars |
| Button transition | `transition-all duration-200` | Nav tabs, most buttons |
| Progress bar shrink | CSS `@keyframes shrink-x 15s linear` | AISuggestPopup auto-dismiss bar |

---

## 9. Responsive Behavior

| Element | Mobile | Desktop (md+) |
|---|---|---|
| BottomNav | Fixed pill bottom-3 | Floating centered bar |
| BrainCardModal | Bottom-sheet (rounded-t-3xl) | Centered modal |
| NotificationBell dropdown | Fixed full-width | Absolute right-aligned 384px |
| Header Manage AI | Key icon only | Key icon + "Manage AI" text |
| Layout grids | Single column | Multi-column (2, 4, 12 cols) |
| Journey Layout | Stacked | 5-col + 7-col grid |
| ProgressView RPG | Single column | Two-column (Physical vs Mind) |
| GoalsModal | Single column | Three-column add form |
| VisionBoard | Single column | Two-column grid |
| Overview cards | Single column | Four-column grid |
| FloatingAIButton | bottom-20 right-5 | bottom-24 right-8 |

---

## 10. Empty States

Each data list has a centered empty state:
- ProgressView habits: "??????????????????????" + guidance text
- ProgressView goals: "????????????????"
- ManageAPIModal: ShieldCheck icon + "?????????????? AI Provider"
- ManageTagsModal: "???????????? ???????????????????!"
- GlobalSearchModal: "???????????? ?????????????????????????????????????"
- NotificationBell: "?????????????????????? ?"

---

## 11. Z-Index Stacking Layer

| z-level | Elements |
|---|---|
| `z-30` | Header (fixed top) |
| `z-40` | BottomNav (fixed bottom) |
| `z-50` | All modals, FloatingAIButton, AISuggestPopup, GlobalSearchModal |

Modals use `fixed inset-0 z-50` with `bg-black/80 backdrop-blur-md` or similar.
