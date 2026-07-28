# COMPLETE_SYSTEM_AUDIT.md � My Life OS

> A 360-degree technical audit covering every file, every function, every risk, every strength, every dependency, and every recommendation for the system.

---

## 1. Full File Inventory

### Source Files (`src/`)

| File | Lines | Purpose | Key Exports |
|---|---|---|---|
| `main.tsx` | ~20 | React entry, SW registration | � |
| `App.tsx` | ~800+ | Root state + orchestration | `default App` |
| `types.ts` | ~200 | All TypeScript interfaces + constants | All types, BRAIN_TYPES, LIFE_DIMENSIONS |
| `index.css` | ~100 | Tailwind import + global CSS vars | � |
| `lib/db.ts` | ~400 | RoomDatabase static class | `RoomDatabase`, `DEFAULT_PRESET_TAGS`, `PresetMood` |
| `lib/aiRouter.ts` | ~300 | AIRouter static class | `AIRouter` |
| `lib/aiService.ts` | ~400 | AI use-case functions | 10+ named exports |
| `lib/textUtils.ts` | 23 | Thai word counting | `countWords` |
| `components/Header.tsx` | 85 | App header bar | `Header` |
| `components/BottomNav.tsx` | 68 | Tab navigation | `BottomNav`, `NavTab` |
| `components/FloatingAIButton.tsx` | 109 | FAB + quick actions | `FloatingAIButton` |
| `components/NotificationBell.tsx` | 214 | Reminder bell + dropdown | `NotificationBell` |
| `components/GlobalSearchModal.tsx` | 263 | Cross-domain search | `GlobalSearchModal` |
| `components/BrainCardModal.tsx` | 356 | Brain Card CRUD form | `BrainCardModal` |
| `components/ManageAPIModal.tsx` | 368 | AI provider config | `ManageAPIModal` |
| `components/ManageTagsModal.tsx` | 230 | Preset tag CRUD | `ManageTagsModal` |
| `components/ManageMoodsModal.tsx` | ~180 | Preset mood CRUD | `ManageMoodsModal` |
| `components/AISuggestPopup.tsx` | 135 | AI Brain Card suggestion toast | `AISuggestPopup` |
| `components/ReminderJournalModal.tsx` | 155 | Reminder ? Journal conversion | `ReminderJournalModal` |
| `views/HomeView.tsx` | ~350 | Home dashboard | `HomeView` |
| `views/JourneyView.tsx` | 180 | Life roadmap | `JourneyView` |
| `views/AICoachView.tsx` | ~600 | AI coaching hub | `AICoachView` |
| `views/JournalView.tsx` | ~500 | Journal management | `JournalView` |
| `views/ProgressView.tsx` | 225 | RPG stats + progress | `ProgressView` |
| `views/LifeBrainView.tsx` | ~450 | Brain Card manager | `LifeBrainView` |
| `views/GoalsModal.tsx` | 172 | Goal CRUD | `GoalsModal` |
| `views/HabitsModal.tsx` | 155 | Habit CRUD + toggle | `HabitsModal` |
| `views/ChecklistModal.tsx` | 146 | Checklist CRUD | `ChecklistModal` |
| `views/VisionBoardModal.tsx` | 126 | Vision Board CRUD | `VisionBoardModal` |
| `views/AffirmationsModal.tsx` | 111 | Affirmations + player | `AffirmationsModal` |
| `views/TimelineModal.tsx` | 67 | Timeline event viewer | `TimelineModal` |
| `views/DailyCheckinModal.tsx` | 297 | 5-step check-in wizard | `DailyCheckinModal` |
| `views/SettingsModal.tsx` | 191 | App settings + backup | `SettingsModal` |

**Total source files:** 33 TypeScript/TSX files  
**Estimated total lines:** ~7,500 lines

---

## 2. Complete Function Reference

### `lib/db.ts` � RoomDatabase

| Method | Returns | Purpose |
|---|---|---|
| `private static get<T>(key, fallback)` | `T` | Generic localStorage read with fallback |
| `private static set<T>(key, value)` | `void` | Generic localStorage write |
| `static getSettings()` | `UserSettings` | Read user settings |
| `static saveSettings(s)` | `void` | Write user settings |
| `static getCharacter()` | `CharacterStatus` | Read RPG stats |
| `static saveCharacter(c)` | `void` | Write RPG stats |
| `static getJourney()` | `LifeJourneyPhase[]` | Read life journey phases |
| `static saveJourney(j)` | `void` | Write life journey phases |
| `static getMissions()` | `TodayMission[]` | Read today's missions |
| `static saveMissions(m)` | `void` | Write today's missions |
| `static getJournals()` | `JournalEntry[]` | Read all journal entries |
| `static saveJournals(j)` | `void` | Write all journal entries |
| `static getGoals()` | `GoalItem[]` | Read all goals |
| `static saveGoals(g)` | `void` | Write all goals |
| `static getHabits()` | `HabitItem[]` | Read all habits |
| `static saveHabits(h)` | `void` | Write all habits |
| `static getChecklist()` | `ChecklistItem[]` | Read checklist items |
| `static saveChecklist(c)` | `void` | Write checklist items |
| `static getVision()` | `VisionCategoryItem[]` | Read vision board items |
| `static saveVision(v)` | `void` | Write vision board items |
| `static getAffirmations()` | `AffirmationItem[]` | Read affirmations |
| `static saveAffirmations(a)` | `void` | Write affirmations |
| `static getMessages()` | `AIChatMessage[]` | Read AI chat history |
| `static saveMessages(m)` | `void` | Write AI chat history |
| `static getTimeline()` | `TimelineEvent[]` | Read life timeline events |
| `static saveTimeline(t)` | `void` | Write life timeline events |
| `static getCheckins()` | `DailyCheckin[]` | Read daily check-ins |
| `static saveCheckins(c)` | `void` | Write daily check-ins |
| `static getPresetTags()` | `string[]` | Read preset journal tags |
| `static savePresetTags(t)` | `void` | Write preset journal tags |
| `static getPresetMoods()` | `PresetMood[]` | Read preset mood emojis |
| `static savePresetMoods(m)` | `void` | Write preset mood emojis |
| `static getBrainCards()` | `BrainCard[]` | Read Brain Card collection |
| `static saveBrainCards(c)` | `void` | Write Brain Card collection |
| `static getReminders()` | `ReminderItem[]` | Read quick reminders |
| `static saveReminders(r)` | `void` | Write quick reminders |
| `static getPendingTasks()` | `PendingAITask[]` | Read AI task queue |
| `static savePendingTasks(t)` | `void` | Write AI task queue |
| `static getStorageSize()` | `string` | Calculate localStorage usage in KB |
| `static clearAllData()` | `void` | Delete all mylifeos_* keys |
| `static exportBackupZip()` | `Promise<Blob>` | Create ZIP backup of all data |
| `static importBackupZip(file)` | `Promise<boolean>` | Restore from ZIP backup file |
| `static runMigrations()` | `void` | Apply v2 + v3 data migrations |

### `lib/aiRouter.ts` � AIRouter

| Method | Returns | Purpose |
|---|---|---|
| `static call(messages, providers, brainCards?, userMessage?)` | `Promise<string>` | Main AI dispatch with failover |
| `private static callGemini(messages, provider)` | `Promise<string>` | Call Google Gemini API |
| `private static callGroq(messages, provider)` | `Promise<string>` | Call Groq API |
| `private static callOpenRouter(messages, provider)` | `Promise<string>` | Call OpenRouter API |
| `static detectDimension(text)` | `LifeDimension[]` | Keyword-based dimension detection |
| `static buildBrainContext(message, cards, dimensions)` | `string` | Format Brain Cards as AI context |
| `static testConnection(provider)` | `Promise<{success, message}>` | Validate API key with test call |

### `lib/aiService.ts` � Service Functions

| Function | Returns | Purpose |
|---|---|---|
| `getProviders(settings)` (private) | `APIProvider[]` | Filter and sort enabled providers |
| `chat(messages, input, settings, brainCards?)` | `Promise<string>` | General AI conversation |
| `reflect(period, journals, checkins, settings)` | `Promise<string>` | Self-reflection analysis |
| `guide(topic, goals, habits, settings)` | `Promise<string>` | Life guidance advice |
| `analyzeToday(journals, checkin, goals, habits, settings)` | `Promise<string>` | Daily comprehensive analysis |
| `morningRitual(settings, goals, habits)` | `Promise<string>` | Morning motivation message |
| `cbtReflection(situation, thoughts, settings)` | `Promise<string>` | CBT thought challenging |
| `stoicCoach(situation, settings)` | `Promise<string>` | Stoic philosophy coaching |
| `journalPrompt(dimension, journals, settings)` | `Promise<string>` | Generate journal questions |
| `summarizeDailyCheckin(checkin, settings)` | `Promise<string>` | Summarize check-in answers |
| `suggestBrainCard(message, settings, existing)` | `Promise<Partial<BrainCard> or null>` | Extract Brain Card from message |
| `testProviderConnection(provider)` | `Promise<{success, message}>` | Test API key validity |

### `lib/textUtils.ts`

| Function | Returns | Purpose |
|---|---|---|
| `countWords(text)` | `number` | Count Thai+English words accurately |

---

## 3. Dependency Audit

### Production Dependencies

| Package | Version | Used In | Risk |
|---|---|---|---|
| `react` | ^19.0.1 | All components | LOW � stable |
| `react-dom` | ^19.0.1 | main.tsx | LOW |
| `typescript` | ~5.8.2 | Compile-time only | LOW |
| `@google/genai` | ^2.4.0 | aiRouter.ts | MEDIUM � API breaking changes possible |
| `jszip` | ^3.10.1 | db.ts backup | LOW � stable |
| `lucide-react` | ^0.546.0 | All components | LOW � icons only |
| `motion` | ^12.23.24 | Components (if used) | LOW |
| `express` | ^4.21.2 | server.ts | LOW |

### Dev Dependencies

| Package | Version | Purpose | Risk |
|---|---|---|---|
| `vite` | ^6.2.3 | Build tool | LOW |
| `@vitejs/plugin-react` | ^4.4.1 | React JSX transform | LOW |
| `@tailwindcss/vite` | ^4.1.14 | CSS processing | LOW |
| `tailwindcss` | ^4.1.14 | CSS framework | LOW |
| `tsx` | ^4.19.3 | Run server.ts in dev | LOW |
| `esbuild` | ^0.25.2 | Bundle server.ts for prod | LOW |
| `@capacitor/core` | ^6.0.0 | Native bridge | MEDIUM � major version |
| `@capacitor/android` | ^6.0.0 | Android build | MEDIUM |
| `@capacitor/cli` | ^6.0.0 | CLI tools | LOW |

### External API Dependencies

| Service | URL | Dependency |
|---|---|---|
| Google Gemini | `https://generativelanguage.googleapis.com` | User's API key |
| Groq | `https://api.groq.com` | User's API key |
| OpenRouter | `https://openrouter.ai/api` | User's API key |
| Unsplash | `https://images.unsplash.com` | Default Vision Board images |

---

## 4. Security Audit

### Critical Findings

| Finding | Severity | Location | Detail |
|---|---|---|---|
| API keys stored in localStorage | HIGH | `db.ts`, `UserSettings` | API keys for Gemini/Groq/OpenRouter are stored in plain text in localStorage. Accessible by any JS on the page. |
| No input sanitization before AI calls | MEDIUM | `aiService.ts` | User text is sent directly to AI providers without sanitization. Prompt injection is theoretically possible. |
| External image URLs (Vision Board) | LOW | `VisionBoardModal.tsx` | Unsplash and user-provided URLs rendered directly in `<img>`. No CSP restriction on image-src. |
| localStorage size not enforced | LOW | `db.ts` | No size guard before writes. Could silently fail on 5MB limit. |
| API keys visible in localStorage | HIGH | Browser DevTools | Any user with DevTools access can read API keys. |

### Existing Mitigations

- API keys shown with `type="password"` in ManageAPIModal (UI only � still in localStorage)
- `show/hide` toggle for API key display in UI
- `confirm()` dialogs before destructive operations (Reset Data, Import Backup)
- Try/catch on all localStorage operations
- AI context limited to user's own data (no cross-user data sharing)

### Recommendations

1. **Encrypt API keys** at rest using `CryptoSubtle` with device-derived key
2. **Add Content Security Policy** headers in `server.ts`
3. **Input length limits** on all textarea inputs to prevent oversized API calls
4. **Sanitize** journal content before injecting into AI prompts (remove markdown injection patterns)

---

## 5. Performance Audit

### localStorage Write Frequency

Every user interaction that changes data causes an immediate synchronous localStorage write. This includes:
- Every character typed in habit toggle ? full array re-serialized
- Every modal open/close that triggers state changes

**Impact:** For small datasets (typical personal use), this is imperceptible. For very large journal collections (500+ entries), each write re-serializes the entire array.

**Recommendation:** Add 500ms debounce to `saveJournals()` and `saveMessages()`.

### Re-render Analysis

All state is in `App.tsx`. Every state change triggers re-render of `App` and **all** child components (unless React.memo applied). Views are only rendered when their tab is active (`currentTab === "view"`), so inactive views don't re-render. However, the modal components (GoalsModal, HabitsModal, etc.) are always mounted even when `isOpen = false`.

**Impact:** Low for current app size. Would benefit from lazy mounting (`isOpen && <Modal />`) for infrequently used modals.

### Bundle Size Considerations

| Module | Impact |
|---|---|
| `@google/genai` | Large SDK � only used in aiRouter.ts |
| `jszip` | Medium � only used in backup/restore |
| `lucide-react` | Tree-shaken � only imported icons bundled |
| `motion` | Medium � if full package imported |

**Recommendation:** Dynamic import `jszip` and `@google/genai` only when needed.

---

## 6. Data Integrity Audit

### Potential Data Loss Scenarios

| Scenario | Risk | Mitigation |
|---|---|---|
| Browser clears localStorage | HIGH | ZIP backup/restore feature |
| Storage quota exceeded | HIGH | Silent write failure (no error to user) |
| Migration bug | MEDIUM | Migration flags prevent double-run |
| JSON parse failure | LOW | try/catch returns fallback default |
| User clears site data | HIGH | No mitigation � by design |

### Data Consistency Issues

1. **Orphaned linkedJournalIds:** If a journal is deleted, `BrainCard.linkedJournalIds` still references it. No cleanup on journal deletion.

2. **Orphaned linkedBrainCardIds:** If a Brain Card is deleted, `JournalEntry.linkedBrainCardIds` still references it. No cleanup.

3. **Habit streak accuracy:** `currentStreak` is incremented/decremented manually on toggle. It does NOT recalculate from `completedDates` � a missed day doesn't automatically reset the streak. The streak is only accurate if the user toggles consistently.

4. **Goal completedAt missing:** `GoalItem` has no `completedAt` timestamp field. Timeline events are created when progress hits 100%, but the goal object itself doesn't record when completion happened.

5. **Check-in uniqueness:** Multiple check-ins per day are possible (no date uniqueness enforcement). The `HomeView` checks `checkins.some(c => c.date === today)` to show the status, but doesn't prevent a second check-in from being saved.

### Recommendations

- Add orphan cleanup on journal/card delete
- Add `completedAt: number` to `GoalItem`
- Add per-day check-in deduplication guard
- Validate `currentStreak` against `completedDates` on app load

---

## 7. UX/Accessibility Audit

### Positive Patterns

- All buttons have `title` attributes for tooltip
- Color is not the only indicator (icons used alongside color)
- Focus styles on interactive inputs
- `autoFocus` on edit inputs and search inputs
- Empty states with guidance text for all lists
- Thai language throughout reduces cognitive load for target users
- Loading indicators (`animate-spin`, `disabled` states) during AI calls

### Issues Found

| Issue | Component | Severity |
|---|---|---|
| No keyboard navigation for custom dropdowns | BrainCardModal | MEDIUM |
| No ESC key to close most modals | GoalsModal, HabitsModal | MEDIUM |
| No aria-label on icon-only buttons | Header search, settings | LOW |
| No `role="dialog"` on modals | All modals | LOW |
| No `aria-live` for AI response output | AICoachView | MEDIUM |
| Color contrast of `#869883` on `#131913` | Multiple components | LOW |
| FloatingAIButton not keyboard reachable | FloatingAIButton | MEDIUM |

---

## 8. Feature Completeness Audit

### Fully Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Daily Journal | ? Complete | Create, read, delete, filter, tag, mood |
| Daily Check-in | ? Complete | 5-step wizard + AI summary |
| Goals Tracker | ? Complete | CRUD + milestones + progress |
| Habit Tracker | ? Complete | Daily toggle + streak + completionRate |
| Life Brain (Brain Cards) | ? Complete | CRUD + search + dimension/type filter + journal linking |
| AI Coach (chat) | ? Complete | Multi-mode + Brain Card context |
| AI Daily Analysis | ? Complete | Synthesizes journals + checkin + goals + habits |
| Multi-Provider AI | ? Complete | Gemini/Groq/OpenRouter + failover |
| Vision Board | ? Complete | Image card grid + CRUD |
| RPG Character Stats | ? Complete | 10 stats + auto-increment + progress bars |
| Life Journey Roadmap | ? Complete | 5-phase timeline display |
| Reminders (Quick Notes) | ? Complete | CRUD + ? Journal conversion |
| Backup/Restore | ? Complete | ZIP export/import |
| Global Search | ? Complete | Multi-domain search + filters |
| Preset Tags/Moods | ? Complete | Customizable per user |
| PWA Installation | ? Complete | Service Worker + manifest |
| Android Build (Capacitor) | ? Complete | Build scripts configured |
| Timeline | ? Complete | Auto-generated + viewer |
| Affirmations | ? Partial | UI complete; audio not real (no Web Audio API) |
| Checklist | ? Complete | CRUD + toggle |

### Partially Implemented / Missing Features

| Feature | Status | Gap |
|---|---|---|
| Affirmations Audio | ?? UI Only | Play/Pause button exists but no Web Audio API implementation |
| ManageMoodsModal | ?? Referenced | `ManageMoodsModal` imported in JournalView but implementation may be incomplete |
| Habit streak auto-reset | ? Missing | Missed days don't automatically reduce streak |
| Check-in deduplication | ? Missing | Can save multiple check-ins per day |
| Orphan cleanup | ? Missing | Deleted journal/card IDs remain in linked arrays |
| Notification scheduling | ? Missing | No push notifications despite reminder feature |
| Offline AI fallback | ? Missing | No cached AI responses for offline use |
| Data export to CSV/PDF | ? Missing | Only ZIP backup format |
| Journal search (in JournalView) | ?? Partial | GlobalSearch works; in-view filter may be limited |

---

## 9. Code Quality Audit

### Strengths

| Pattern | Detail |
|---|---|
| Single source of truth for types | All types in `types.ts` � no type duplication |
| Consistent CRUD pattern | All modals follow the same add/toggle/delete local state ? callback pattern |
| Clear separation of concerns | lib/ = pure logic, views/ = UI, components/ = reusable UI |
| Defensive defaults | Every `RoomDatabase.get*()` returns a safe default |
| Error boundary at AI layer | All AI errors handled gracefully with Thai fallback strings |
| No circular imports | Clean dependency tree (lib ? types, views ? lib, App ? views) |

### Areas for Improvement

| Issue | Detail | Recommendation |
|---|---|---|
| App.tsx size | ~800+ lines managing 17+ state slices and 20+ handlers | Split into custom hooks: `useJournals()`, `useHabits()`, `useGoals()`, etc. |
| Prop drilling depth | Views receive 10-15 props each | Consider React Context for frequently-needed state (settings, brainCards) |
| No unit tests | Zero test files found | Add Vitest + React Testing Library for service layer functions |
| Hardcoded colors | All colors are arbitrary Tailwind values (`#131913` etc.) | Move to CSS variables in `index.css` |
| `any` types in aiRouter | `icon: any` in RPG_STATS_CONFIG | Replace with `React.ComponentType<{ className?: string }>` |
| Missing error types | AI errors caught as `any` | Type error catches with `unknown` + type guards |
| No loading state for backups | Import shows no progress indicator | Add spinner during ZIP import/export |
| `dimension` optional in some types | `GoalItem.dimension?`, `HabitItem.dimension?` | Make required and set defaults |

---

## 10. Architecture Strengths

| Strength | Detail |
|---|---|
| Zero-dependency backend | App works entirely offline with no server |
| Multi-provider AI resilience | Failover ensures AI continues even if one provider is down |
| ZIP backup portability | Data is human-readable JSON inside ZIP � no proprietary format |
| PWA + Capacitor dual target | Same codebase for web and Android without native code |
| Thai-first design | All UI copy, AI prompts, and error messages are Thai |
| Extensible AI system | Adding a new provider or mode is a single function + case addition |
| localStorage isolation | Each user's data is entirely local � no cross-user data leakage |
| Brain Card ? AI context pipeline | Unique feature: user's own knowledge enriches AI responses |

---

## 11. Scaling Limits

| Limit | Threshold | Impact |
|---|---|---|
| localStorage | ~5MB | Hard limit � app may silently fail to save after heavy use |
| Journal entries | ~1,000 | Array serialization cost becomes noticeable |
| Brain Cards | ~500 | AI context injection sends top 5 � scales fine |
| Chat history | Unbounded | `messages[]` grows forever � no cleanup implemented |
| AI prompt tokens | ~1024 output | Truncation on long responses possible |
| Habit completedDates | ~365 strings/habit | Manageable; grows ~1 string/day per habit |

**Critical Limit:** Chat messages (`messages[]`) are never truncated or paginated. After 100+ messages, AI calls will include very long conversation history, potentially hitting provider token limits.

**Recommendation:** Implement message sliding window � keep only last 20 messages for AI context, display full history in UI.

---

## 12. Migration Safety Audit

### v2 Migration (flag: `mylifeos_migrated_v2`)
- **Operation:** Wipes all v1 localStorage keys
- **Risk:** Data loss if migration runs when user has v1 data they want to keep
- **Mitigation:** One-time flag ensures it never runs twice
- **Rollback:** None � v1 keys are permanently deleted

### v3 Migration (flag: `mylifeos_migrated_v3`)
- **Operation:** Migrates `aiApiKey` ? `apiProviders[0]`, converts string[] reminders
- **Risk:** Low � additive migration that creates new structure from old
- **Mitigation:** Reads old field first, only writes if non-empty
- **Rollback:** None � but original key is preserved in settings

### Future Migration Guidance

When adding a new storage key:
1. Add the key constant to db.ts
2. Add get/save methods
3. Use `_v1` or `_v2` version suffix
4. If changing schema of existing data, add a new migration in `runMigrations()`
5. Test migration with realistic data before shipping

---

## 13. Summary Metrics

| Metric | Value |
|---|---|
| Total source files | 33 files |
| Total estimated lines | ~7,500 |
| Data domains | 17 distinct storage collections |
| AI providers supported | 3 (Gemini, Groq, OpenRouter) |
| AI service functions | 12 |
| React components | 11 (components/) |
| React views | 14 (views/) + 8 modal views |
| Navigation tabs | 5 |
| Character stats | 10 (RPG system) |
| Life dimensions | 12 |
| Brain Card types | 10 |
| Journal modes | 6 |
| localStorage keys | 18 production + 2 migration flags |
| Known bugs | 4 (orphan IDs, habit streak, check-in dupe, no audio) |
| Security issues | 2 HIGH (API key storage, plain text localStorage) |
| Missing features | 7 (listed in section 8) |
| Test coverage | 0% (no test files) |

---

## Part 1 — Complete Function Index

### db.ts — RoomDatabase (Static Class, 35 Methods)

| Function / Method | File | Called By | Calls | Inputs | Outputs | Dependencies | Side Effects | Complexity |
|---|---|---|---|---|---|---|---|---|
| `get<T>(key, fallback)` | db.ts private | All public getXxx | `localStorage.getItem`, `JSON.parse` | `key:string`, `fallback:T` | `T` | JSON, localStorage | None. Pure read. | Low. 1 try/catch. |
| `set<T>(key, value)` | db.ts private | All public saveXxx | `localStorage.setItem`, `JSON.stringify` | `key:string`, `value:T` | `void` | JSON, localStorage | Synchronous write to disk. 5MB limit. | Low. 1 try/catch (silent). |
| `getSettings()` | db.ts | App.tsx, SettingsModal, all service `getProviders` | `get` | `void` | `UserSettings` | DEFAULT_SETTINGS | None | Low |
| `saveSettings(s)` | db.ts | SettingsModal, App handlers | `set` | `s:UserSettings` | `void` | JSON | `mylifeos_settings_v2` key | Low |
| `getCharacter()` | db.ts | App.tsx, ProgressView, HomeView | `get` | `void` | `CharacterStatus` | DEFAULT_CHARACTER | None | Low |
| `saveCharacter(c)` | db.ts | `updateCharacter` helper | `set` | `c:CharacterStatus` | `void` | JSON | `mylifeos_character_v2` key | Low |
| `getJourney()` | db.ts | JourneyView | `get` | `void` | `LifeJourneyPhase[]` | DEFAULT_JOURNEY | None | Low |
| `saveJourney(j)` | db.ts | JourneyView save action | `set` | `LifeJourneyPhase[]` | `void` | JSON | Write `mylifeos_journey_v2` | Low |
| `getMissions()` | db.ts | HomeView | `get` | `void` | `TodayMission[]` | `[]` default | None | Low |
| `saveMissions(m)` | db.ts | HomeView | `set` | `TodayMission[]` | `void` | JSON | — | Low |
| `getJournals()` | db.ts | JournalView, App, all AI, search, reminders | `get` | `void` | `JournalEntry[]` | `[]` default | None | Medium — re-serializes entire N-journal array every call. |
| `saveJournals(j)` | db.ts | handleAddJournal, handleUpdateJournal, handleDeleteJournal, importBackupZip | `set` | `JournalEntry[]` | `void` | JSON | O(n) stringify. Largest key. | Medium |
| `getGoals()` | db.ts | GoalsModal, GlobalSearch, ProgressView | `get` | `void` | `GoalItem[]` | `[]` | None | Low |
| `saveGoals(g)` | db.ts | handleSaveGoals, GoalsModal save, importBackupZip | `set` | `GoalItem[]` | `void` | JSON | — | Low |
| `getHabits()` | db.ts | HabitsModal, NotificationBell, GlobalSearch | `get` | `void` | `HabitItem[]` | `[]` | None | Low |
| `saveHabits(h)` | db.ts | HabitsModal → handleSaveHabitsWithEvidence → importBackupZip | `set` | `HabitItem[]` | `void` | JSON | — | Low |
| `getChecklist()` | db.ts | ChecklistModal | `get` | `void` | `ChecklistItem[]` | `[]` | None | Low |
| `saveChecklist(c)` | db.ts | ChecklistModal save | `set` | `ChecklistItem[]` | `void` | JSON | — | Low |
| `getVision()` | db.ts | VisionBoardModal | `get` | `void` | `VisionCategoryItem[]` | `[]` | None | Low |
| `saveVision(v)` | db.ts | VisionBoardModal save | `set` | `VisionCategoryItem[]` | `void` | JSON | — | Low |
| `getAffirmations()` | db.ts | AffirmationsModal | `get` | `void` | `AffirmationItem[]` | `[]` | None | Low |
| `saveAffirmations(a)` | db.ts | AffirmationsModal save | `set` | `AffirmationItem[]` | `void` | JSON | — | Low |
| `getMessages()` | db.ts | AICoachView, Settings backup | `get` | `void` | `AIChatMessage[]` | `[]` | None | Low-Medium — unbounded. |
| `saveMessages(m)` | db.ts | AICoachView send, clear session, importBackupZip | `set` | `AIChatMessage[]` | `void` | JSON | — | Low-Medium |
| `getTimeline()` | db.ts | TimelineModal, HomeView, ProgressView | `get` | `void` | `TimelineEvent[]` | `[]` | None | Low |
| `saveTimeline(t)` | db.ts | appendTimeline helper, importBackupZip | `set` | `TimelineEvent[]` | `void` | JSON | — | Low |
| `getCheckins()` | db.ts | DailyCheckinModal, HomeView, reflect, analyze | `get` | `void` | `DailyCheckin[]` | `[]` | None | Low |
| `saveCheckins(c)` | db.ts | handleSaveCheckin, importBackupZip | `set` | `DailyCheckin[]` | `void` | JSON | — | Low |
| `getPresetTags()` | db.ts | JournalView, ManageTagsModal | `get` | `void` | `string[]` | DEFAULT_PRESET_TAGS | None | Low |
| `savePresetTags(t)` | db.ts | ManageTagsModal save | `set` | `string[]` | `void` | JSON | — | Low |
| `getPresetMoods()` | db.ts | JournalView, ManageMoodsModal, ReminderJournalModal | `get` | `void` | `PresetMood[]` | DEFAULT 8 moods | None | Low |
| `savePresetMoods(m)` | db.ts | ManageMoodsModal save | `set` | `PresetMood[]` | `void` | JSON | — | Low |
| `getStorageSize()` | db.ts | SettingsModal display | Iter `localStorage` keys | `void` | `string` e.g. "142.3 KB" | `localStorage.length` | None | Medium — O(|keys|) |
| `clearAllData()` | db.ts | SettingsModal danger zone btn | Iter + `removeItem` | `void` | `void` | localStorage prefix scan | **DESTRUCTIVE.** All keys deleted. Then `window.location.reload()` in caller. | Medium. |
| `exportBackupZip()` | db.ts | SettingsModal export btn | JSZip class, all 25 getXxx | `void` | `Promise<Blob>` | JSZip, JSON, all getters | None. Pure read side-effect-free internally. | Medium-High. 25 JSON.stringify passes. |
| `importBackupZip(file)` | db.ts | SettingsModal import file input | JSZip.loadAsync, JSON.parse, all saveXxx | `file:File` | `Promise<boolean>` | JSZip, FileReader API, all savers | OVERWRITES ALL storage keys (destructive write per matched backup table). Triggers caller reload. | High — 25 JSON parse + 25 writes. |
| `runMigrations()` | db.ts | App.tsx mount useEffect[] | `get` + `set` for migrations + flag reads | `void` | `void` | localStorage flags, DEFAULT arrays | All migration side effects. Writes data + migration flags. | High — 4-pass, data-transformation heavy. |

---

### aiRouter.ts — AIRouter Static Class (7 Methods)

| Function | File | Called By | Calls | Inputs | Outputs | Dependencies | Side Effects | Complexity |
|---|---|---|---|---|---|---|---|---|
| `callGemini(messages, p)` | aiRouter private | `AIRouter.call` case Gemini | `GoogleGenAI` SDK `models.generateContent` | `messages[]`, `provider:APIProvider` | `Promise<string>` | `@google/genai`, JSON | Network call. 3rd-party. | Low-Medium — role format conversion. |
| `callGroq(messages, p)` | aiRouter private | `AIRouter.call` case Groq | `fetch` POST OpenAI-compatible | `messages[]`, `p:APIProvider` | `Promise<string>` | fetch API | Network call. | Low. |
| `callOpenRouter(messages, p)` | aiRouter private | `AIRouter.call` case OpenRouter | `fetch` POST + 4-internal free model fallback loop | `messages[]`, `p:APIProvider` | `Promise<string>` | fetch API, OPENROUTER_FREE_MODELS list | Network call × up to 4. HTTP-Referer + X-Title headers. | Medium — fallback loop. |
| `detectDimension(text)` | aiRouter public | `AIRouter.call`, generateGreeting | DIMENSION_KEYWORDS map | `text:string` | `LifeDimension[]` (sorted top by score) | keyword scoring | None. Pure compute. | Medium — 12 dim loops over keyword arrays. |
| `buildBrainContext(msg, cards, dims)` | aiRouter public | `AIRouter.call` | BrainCard filter, score, sort | `msg:string`, `cards:BrainCard[]`, `dims:LifeDimension[]` | `string` (may be empty) | Array methods | None. Pure compute. | Medium — multi-score filter. |
| `testConnection(provider)` | aiRouter public | ManageAPIModal btn onClick, testProviderConnection | `callXxx(provider)` w/ test "CONNECTED" prompt | `provider:APIProvider` | `Promise<{success:bool, message:string}>` | Substring search "CONNECTED" | Network call. | Low. |
| `call(messages, providers, brainCards?, userMessage?)` | aiRouter public — SINGLE CHOKE POINT | EVERYTHING AI | Sort providers, detectDimension, buildBrainContext, for-loop provider calls + catch | `messages[]`, `providers[]`, optional cards + userMsg | `Promise<string>` | All 3 callXxx + helpers | Multiple network calls possible. Writes to console.error. | HIGH — orchestration. |

---

### aiService.ts — Service Facade (12 Exported Fns)

| Function | File | Called By | Calls | Inputs | Outputs | Deps | Side Effects | Complexity |
|---|---|---|---|---|---|---|---|---|
| `getProviders(settings)` | aiService private | Every service fn below | Array filter + sort | `settings:UserSettings` | `APIProvider[]` | Array ops | None | Low |
| `chat(messages, userInput, settings, brainCards?)` | aiService | AICoachView.send | MODE_PROMPTS system, AIRouter.call | `messages:AIChatMessage[]`, `userInput:string`, settings, optional brainCards | `Promise<string>` | MODE_PROMPTS, AIRouter.call | API call (token cost). | Medium — message format conversion. |
| `reflect(period, journals, checkins, settings)` | aiService | Settings/AICoach legacy reflection | Date filtering by period, AIRouter.call w/ reflection persona | `period:"today"|"week"|"month"`, journals[], checkins[], settings | `Promise<string>` | Date math | None. Just API call + filter. | Medium — period boundary calc. |
| `guide(topic, goals, habits, settings)` | aiService | AICoach/legacy guide | Goals top-5 + Habits top-5 format | `topic:string`, goals[], habits[], settings | `Promise<string>` | — | — | Medium |
| `analyzeToday(journals, checkin, goals, habits, settings)` | aiService | HomeView, legacy | Journals date===today filter, checkin latest, goals status, habits today | journals[], checkins[], goals[], habits[], settings | `Promise<string>` | 4-section format | — | Medium |
| `morningRitual(settings, goals, habits)` | aiService | HomeView mount greeting fallback | Goals + habits list in prompt | settings, goals, habits | `Promise<string>` | — | — | Low-Medium |
| `cbtReflection(situation, thoughts, settings)` | aiService | AICoach CBT Therapist mode | Situation + thoughts into structured prompt | strings + settings | `Promise<string>` | CBT framework persona | — | Low-Medium |
| `stoicCoach(situation, settings)` | aiService | Stoic persona mode | Stoic philosophy system prompt | situation + settings | `Promise<string>` | Stoic principles | — | Low-Medium |
| `journalPrompt(dimension, journals, settings)` | aiService | JournalView "AI prompt me" button | Last 3 journals + dimension filter | dimension, journals[], settings | `Promise<string>` | — | — | Low-Medium |
| `summarizeDailyCheckin(checkin, settings)` | aiService | DailyCheckinModal.submit → App | 5-answer object → Thai 2-3 sentence | checkin:DailyCheckin, settings | `Promise<string>` | summarize persona | Used to populate checkin.aiSummary stored field. | Low-Medium |
| `suggestBrainCard(message, settings, existing)` | aiService | AICoachView after every chat turn → onSuggestBrainCard | JSON regex parser, existing titles dedup | AI msg text, settings, existing BrainCard[] titles | `Promise<Partial<BrainCard> \| null>` | Title dedup check | Opens AISuggestPopup UI. | Medium — regex JSON extraction. |
| `suggestJournalBrainPlacement(entry, types, dims, tags, ruleCandidates)` | aiService | App.handleAddJournal microtask | Build 3 Maps name→id, JSON spec system prompt, AIRouter.call, 3-regex parser, validation lookup | entry, types[], dims[], tags[], ruleCandidates[] | `Promise<{candidateTagIds[],confidence,missingNodeProposals,usedFallback}>` | JSON parse + allTags Map lookup | If missingNodeProposals non-empty → caller pushes to pendingAITasks[] queue. | HIGH. 4 stages: prompt construction, API call, regex parse, post-parse validation + fallback chain. |
| `testProviderConnection(provider)` | aiService | ManageAPIModal, Settings | Thin wrapper over AIRouter.testConnection | provider:APIProvider | `Promise<{success,message}>` | AIRouter.testConnection | Network call. | Low |

---

### brainTreeService.ts & growth.ts (12 Fns)

| Function | File | Called By | Calls | Inputs | Outputs | Deps | Side Effects | Complexity |
|---|---|---|---|---|---|---|---|---|
| `computeGrowth(rawScore, constant=100)` | growth.ts | recalcAndPersistTagGrowth, ProgressView UI display | `Math.sqrt`, `Math.round` | `rawScore:number`, `constant` | `{level, progressPct}` | Math, 2 while-loop edge guards | None. **Pure function.** | Medium — quadratic formula + clamp + edge loops. |
| `progressToStatus(progressPct)` | growth.ts | BrainViewer badges, Journey display | STATUS_META lookup table | `progressPct:number 0-100` | `{key,label,emoji,color}` | STATUS_META 4 items | None | Low |
| `seedDefaultTemplateIfEmpty()` | brainTreeService | App.tsx post-runMigrations | getBrainTypes(), 3 saveXxx tables | `void` | `Promise<bool>` (true=seeded) | DEFAULT_TEMPLATE constant 9/20/100 | Creates ~129 rows of types/dims/tags + writes meta templateVersion | Medium |
| `aggregateTagScores(evidence, opts)` | brainTreeService | recalcAndPersistTagGrowth | Map accumulator, Math ops | `evidence:BrainEvidence[]`, opts enableDecay default false, threshold 30 | `Map<tagId, rawScore>` | 86400000 MS_PER_DAY const | None. Pure function. | HIGH — Dominant hot path. O(|E| × |tagIds per E|). |
| `buildFullTree()` | brainTreeService | BrainViewer render, search | Nested joins type→dim→tag→(evidence filter) | `void` (reads 5 tables) | `FullTreeViewModel[]` nested | All 5 storage getters | None. Compute + read only. | Medium-High nested grouping. |
| `recalcAndPersistTagGrowth()` | brainTreeService | App mount, createXxxEvidence, deleteEvidence, goal progress, importBackupZip | aggregateTagScores, computeGrowth, progressToStatus, get/set snapshots + dirty flag abs diff > 0.01 | `void` | `Promise<number>` (count changed tags, -1=err) | growth.ts fns | saveBrainGrowthSnapshots() write CONDITIONAL only if dirty. Update brain_meta lastRecalcAt. | HIGH. Orchestrates entire tree recalc. |
| `createJournalEvidence(journal, tagIds)` | brainTreeService | handleAddJournal, suggest popup accept | Upsert by sourceId="journal-{id}", saveEvidence, recalc | `journal:JournalEntry`, tagIds[] | `Promise<BrainEvidence \| null>` | Evidence Upsert helper, getEvidence | saveBrainEvidence write + recalc call. | Low-Medium |
| `createHabitEvidence(habit, dateISO, tagIds)` | brainTreeService | handleSaveHabitsWithEvidence | Upsert by sourceId="habit-{id}-{date}" | habit item, date string, tagIds[] | `Promise<... \| null>` | dedup check saveEvidence → recalc | saveBrainEvidence, counter denorm bump on each tag | Low-Medium |
| `createGoalEvidence(goal, tagIds, progressPct)` | brainTreeService | handleSaveGoalsWithEvidence (delta progress via priorGoalsRef) | Upsert in place by sourceId="goal-{id}" | Goal, tagIds, progressPct number | `Promise<... \| null>` | Weight=10 × (progressPct/100). Scale update live. | Write Evidence + recalc | Medium — progress scaling weight, not constant 10. |
| `createReminderEvidence(reminder, tagIds)` | brainTreeService | handleCompleteReminder → handleReminderConfirm → evidence | Weight=3, sourceId="reminder-{id}" | ReminderItem, tagIds[] | `Promise<... \| null>` | — | Write evidence + recalc. reminder then deleted from reminder list. | Low |
| `createCheckinEvidence(checkin, tagIds, keywords)` | brainTreeService | handleSaveCheckin | weight=1, keywordMatches for dimension scoring auto-place | Checkin, tagIds, keywords[] | `Promise<... \| null>` | findPlacementCandidatesByKeyword fallback if tagIds empty | Write evidence + recalc. | Low-Medium |
| `findPlacementCandidatesByKeyword(text, topK=5)` | brainTreeService | App.handleAddJournal rule-pass, checkin auto-place, evidence fallback when tagIds empty | Unicode tokenize /\p{L}+/gu regex, overlap count set ops, overlap≥2 or exact alias filter | `text:string`, topK=5 | `PlacementCandidate[]` | getTypes/Dims/Tags full scan. 3 Map joins for name/id. | None. Pure compute (read-only getters called once; cached per session ideally). | MEDIUM — 3 level lookup, regex tokenize, set intersections. |

---

### App.tsx — State Hub & Cross-Domain Orchestration Handlers (~28 Handlers)

| Function | File | Called By | Calls | Inputs | Outputs | Deps | Side Effects | Complexity |
|---|---|---|---|---|---|---|---|---|
| `useEffect[] mount` bootstrap | App.tsx L? lines | React Root on App mount | runMigrations → seedDefaultTemplateIfEmpty → recalcAndPersistTagGrowth → priorHabitsRef.current = habits (init prior refs) | `[]` deps | `void` | All state init lazy loaders | 4 migrations + seed + final growth calc. | VERY HIGH — most important boot sequence. Must be idempotent, flag-protected. |
| `updateCharacter(patch: Partial<CharacterStatus>)` helper | App.tsx | handleAddJournal, handleSaveCheckin, handleSaveHabits, Goals, BrainCard, Vision, Affirmation ops | Math.min(100, cur+inc) clamp each field | `patch:Partial<{10 stats +int}>` | `void` | `setCharacter`, `saveCharacter`, prev state functional update | saveCharacter write + setCharacter setState re-render. | Low — 10 field clamp loop. |
| `appendTimeline(event: Partial<TimelineEvent>)` | App.tsx helper | 4 handlers (Journal, Checkin, Goal complete, BrainCard new) | Build full TimelineEvent from partial + date | Partial event | `void` | `setTimeline`, `saveTimeline` | Prepend. saveTimeline write. | Low |
| `handleAddJournal(entry)` | App.tsx | JournalView save btn, ReminderJournalModal confirm | setJournals→save→updateCharacter→appendTimeline→Promise.resolve().then(AI placement chain) | entry | void | findPlacementCandidatesByKeyword, aiService.suggestJournalBrainPlacement, createJournalEvidence, MIN/AUTO_CONFIDENCE gates, AISuggestPopup open | 4 writes sync + 1 dangling promise microtask chain AI. AI error swallowed. | VERY HIGH — orchestrates save-first, analyze-later + AI fallback chain with 2 confidence gates. |
| `handleDeleteJournal(id)` | App.tsx | JournalView trash btn + ConfirmDialog OK | journals.filter, saveJournals | id | void | — | saveJournals write. **BUG (orphan refs):** Does NOT remove journal.id from BrainCard.linkedJournalIds[] → dangling. | Low (but BURRIED BUG). |
| `handleUpdateJournal(updated)` | App.tsx | JournalView inline edit save | .map setJournals, saveJournals | updated | void | — | saveJournals write. | Low |
| `handleSaveCheckin(checkin)` | App.tsx | DailyCheckinModal submit | summarizeDailyCheckin → checkin.aiSummary = result → setCheckins prepend → save → updateCharacter(+3 self awareness, +2 wisdom) → appendTimeline → createCheckinEvidence( checkin, [], keywordFallback ) | checkin:DailyCheckin w/o aiSummary yet | void | summarizeDailyCheckin (await), createCheckinEvidence, recalc | saveCheckins, saveCharacter, saveTimeline, saveEvidence writes. Loading spinner during summarizeDailyCheckin await. | HIGH — async await, user waits on AI call (blocking UX — has loading overlay). |
| `handleSaveHabitsWithEvidence(updated)` | App.tsx | HabitsModal save handler | priorHabitsRef.current comparison Map → todayISO check for nowDone vs wasDone delta → IF new today → createHabitEvidence + updateCharacter(+2 health, +1 discipline) → IF undone today → deleteEvidence("habit-"+id+"-"+today) + deleteEvidence writes + saveHabits | updated:HabitItem[] entire array | void | priorHabitsRef (useRef), Map<string, HabitItem> comparison, createHabitEvidence / deleteEvidence helper | saveHabits + conditional evidence writes. Ref updated at END: priorHabitsRef.current = updated (critical for correctness NEXT render). | HIGH — priorRef delta detection pattern; Map + loop; undo evidence also supported. |
| `handleSaveGoalsWithEvidence(updated)` | App.tsx | GoalsModal save, Milestone toggle (inside GoalsModal) | priorGoalsRef: Map compare prev.progressPercent vs new. If delta change >2% → createGoalEvidence (weight scaled 10×pct/100) sourceId="goal-"+id upsert in place; updateCharacter(+3 discipline, +2 confidence, +1 courage) if newly hits 100% complete. appendTimeline badge "🎯 Goal Achieved". | updated:GoalItem[] entire array | void | priorGoalsRef, Map comparison, Math.round, completed milestone count | saveGoals, conditional saveEvidence, optional timeline event, optional character bump, recalc growth. | HIGH — similar delta pattern, milestone→progress→100%→timeline→stat cascade. |
| `handleSaveBrainCard(card)` | App.tsx | BrainCardModal save, AISuggestPopup.accept | BrainCard create/edit upsert; setCards → saveCards → updateCharacter +3 wisdom +2 creativity → appendTimeline | card | void | — | saveBrainCards write. | Low |
| `handleDeleteBrainCard(id)` | App.tsx | LifeBrainView delete | cards.filter, saveCards | id | void | — | **BUG:** Orphan link: does NOT clear card.id from all JournalEntry.linkedBrainCardIds[] (reverse link). | Low + BUG. |
| `handleAddReminder(text)` | App.tsx | NotificationBell add form (onEnter), HomeView reminder quick add | new reminder → prepend → saveReminders | text | void | — | saveReminders write. | Low |
| `handleCompleteReminder(item)` | App.tsx | NotificationBell checkbox, HomeView checkbox | setPopupReminder = item → opens ReminderJournalModal | item | void | Modal state opens | Opens modal. | Low |
| `handleReminderConfirm(journalEntryFromModal)` | App.tsx | ReminderJournalModal submit btn | handleAddJournal(entry) → handleDeleteReminder(popupReminder.id) → setPopupReminder=null | journal entry | void | 2 handlers | Cascade write. Reminder deleted, Journal created (with its full character + AI chain!). | MEDIUM — calls 2 other handlers; duplicates reminder logic. |
| `handleSaveSettings(settings)` | App.tsx | SettingsModal save | setSettings → saveSettings | settings | void | — | saveSettings write. | Low |
| `handleAISuggestConfirm(partial)` | App.tsx | AISuggestPopup accept button | Merge partial → full BrainCard w/ createdAt → handleSaveBrainCard(card) → setSuggestedCard = null | partial card | void | handleSaveBrainCard | saveBrainCards write, character bumps, timeline event. | Low (delegates). |
| `handleQuickAction(actionType:string)` | App.tsx | FloatingAIButton 8 quick actions | String switch case "newJournal" → setTab + opens; "newCheckin" → opens checkin modal; etc. | actionType string | void | All modal open setXxx(true) state flags, setTab | Modal / tab state changes only. | Low (switch only). |

---

### Hooks: useAutoResizeTextarea, useKeyboardOpen, useKeyboardScrollFix (3 hooks)

| Hook | File | Called By | Pattern | Inputs | Outputs | Deps | Side Effects | Complexity |
|---|---|---|---|---|---|---|---|---|
| `useAutoResizeTextarea({minRows, maxRows})` | hooks/ useAutoResizeTextarea.ts | JournalView title+content, ReminderJournalModal content, AICoachView input, ManageAPIModal, DailyCheckinModal 5 textareas — 8+ usages total | useLayoutEffect + refHeightCache Map + overflow hidden/scroll switch | minRows=3, maxRows=9 | `[ref: RefObject<HTMLTextAreaElement>, adjust: ()=>void]` tuple | scrollHeight, lineHeight default 1.5, getComputedStyle | After each keystroke adjusts element style.height. Pushes content/layout above. | Medium. useLayoutEffect, cache, clamp px min/max. |
| `useKeyboardOpen()` | hooks/ useKeyboardOpen.ts | BottomNav (hide when open) | visualViewport event resize listener + height<innerHeight-150 threshold | void | `isOpen:bool`, `keyboardHeight:number` | visualViewport API (mobile); fallback 0 if undefined | Attaches global resize listener. Cleanup on unmount. | Low. 1 listener. |
| `useKeyboardScrollFix()` | hooks/ useKeyboardScrollFix.ts | App.tsx root level (applied globally once) | 3 global listeners: resize/scroll/focusin. Double rAF + 150ms timeout fallback. element.scrollIntoView({block:'center'}) above keyboard visual. | void | void (no return; global side-effect only) | visualViewport, requestAnimationFrame×2, setTimeout 150ms | On every input focus, scrolls page so caret not hidden under soft keyboard. Mobile-only heuristic. | Medium. 3 listeners + debounce. |

---

## Part 2 — Architecture Review

### 2.1 Folder Structure

**Score: 7/10 — Flat but pragmatic. Clean separation: components vs views vs lib vs hooks.**

```
src/
├─ types.ts             ✅ Central types ✓
├─ App.tsx              ⚠️ Root hub — 755 lines, too much in one file
├─ main.tsx             ✅ Thin entry ✓
├─ index.css            ✅ Tailwind + vars ✓
├─ components/          ✅ 12 shared comps ✓
│  ├─ Header/BottomNav/NotificationBell/GlobalSearchModal
│  ├─ BrainCardModal/ManageAPIModal/ManageTagsModal/ManageMoodsModal
│  ├─ AISuggestPopup/ReminderJournalModal
│  ├─ BottomSheet/ConfirmDialog/DateTimePicker
├─ views/               ✅ 16 views+modals ✓
│  ├─ HomeView/JournalView/JourneyView/AICoachView/ProgressView/LifeBrainView
│  └─ SettingsModal + 9 feature modals (Goals/Habits/Checklist/Vision/...)
├─ hooks/               ✅ 3 custom hooks (auto-resize, keyboard open, scroll-fix) ✓
└─ lib/                 ✅ Service layer ✓
   ├─ db.ts                    RoomDatabase static
   ├─ aiRouter.ts              AIRouter static + 3 provider wrappers
   ├─ aiService.ts             12 use-case facade fns
   ├─ textUtils.ts             countWords Intl.Segmenter
   └─ brainTree/               ✅ Brain Tree Engine V1 modular subfolder ✓
      ├─ brainTreeService.ts
      └─ growth.ts
```

**Positives:** Modular lib subfolder brainTree/. Components are well-separated.

**Negatives:**
- All 16 modal view files sit flat in views/ — no "views/modals/" subfolder grouping
- Root App.tsx is oversized single state hub
- No "pages/" vs "components/" convention distinction; tabs are "views" and modals also "views"

---

### 2.2 Components

**Score: 7/10 — Well-factored shared components, prop drilling due to no Context.**

- All 12 shared components are clean single-purpose TSX files.
- DateTimePicker, GlobalSearch, BottomSheet, ConfirmDialog are generic enough to reuse in other apps.
- NotificationBell embeds 292 lines of reminder logic — borderline oversized component with internal state.
- **Prop drilling pain:** 14 modal flags + 8 tab setters + 37 state items cascade down from App.tsx. Every modal/view component receives 3-6 callback props from App.

---

### 2.3 State Management

**Score: 5/10 — App.tsx useState 37 items pattern; no Store, no Context, no reducer.**

- 37 `useState` declarations categorized: 24 core data, 5 brain tree state, 1 nav, 7 ephemeral, 14 modal flags
- Dual write setState + RoomDatabase.saveXxx() done synchronously at every call site
- Two `useRef` items (priorHabitsRef / priorGoalsRef) for delta evidence detection
- **No batching:** 14 modal open/close actions each set individual state; could be one state object + reducer
- **No selector pattern:** One setState invalidates entire App re-render → children with memo() none applied

**Why 5?** Pattern works for <10K LOC app; scales badly past current size.

---

### 2.4 Storage

**Score: 6/10 — localStorage-only with excellent migration safety.**

- RoomDatabase static class, 29 storage keys, generic get/set wrapper, 1-try/catch
- 4-step versioned migration system with flags (v2/v3/v4/v4b) — idempotent, production-ready
- **HIGH risk:** localStorage 5MB hard limit, no size enforcement, silent write failures
- No transaction support: if 2 of 3 writes fail mid-operation (out of quota crash), inconsistent state possible
- No IndexedDB for large objects (evidence, journals, chat history)

---

### 2.5 AI System

**Score: 8/10 — Best-thought-out subsystem in this whole app.**

- 3 layers: Consumer → aiService Facade → AIRouter Dispatcher → Providers
- Priority failover + OpenRouter internal free model fallback
- Confidence threshold gate (0.55/0.65) with UI popup for borderline cases
- Save-first-analyze-later pattern (journal) — saves UX
- Keyword fallback rule layer before AI → saves tokens
- **2 Gaps:** (1) Temperature/maxTokens not configurable per-call — currently hardcoded 0.7/1024 in provider wrappers. (2) No AbortSignal timeout, no cache, no retry/backoff, no rate limit. 0 retries replaced by failover is smart decision but lacks timeout.

---

### 2.6 Navigation

**Score: 8/10 — Native-feeling mobile-first conditional routing.**

- 5-tab setCurrentTab conditional render routing + 14 modal flags = no react-router
- Perfect for Capacitor/TWA hybrid where you want native-like bottom nav feel
- Search callback navigation (onSelectJournal → switch tab → scroll): works
- Missing: Deep linking, browser history back support, URL bookmarkability for tabs/modals (currently impossible without router)

---

### 2.7 UX System

**Score: 9/10 — Exceptional UX quality for this app size.**

- Permanent Dark Mode — correct use case for productivity app; consistent color palette 9 vars
- useAutoResizeTextarea (8+ inputs): no scrollbar jump
- 3 keyboard hooks + visualViewport API: 100dvh safe-area aware; fixes keyboard overlay problem perfectly
- ConfirmDialog dangerous action confirm: correct
- Loading/success/empty states: all pages have explicit
- Mermaid flowcharts in this doc show the attention to 8-step flow

**Only flaw:** Reminder dropdown code duplicated identically in HomeView (190 lines) and NotificationBell (292 lines). Both contain same add/delete/edit reminder logic.

---

### 2.8 Performance

**Score: 6/10 — Fine now but some ticking timebombs.**

- localStorage synchronous writes (O(n) JSON.stringify) on every user action — becomes perceptible at 1000+ journals
- 37 useState with no batching → App renders multiple times per action
- No React.memo applied anywhere
- Chat history (messages[]) infinite growth: never truncated, grows token cost, grows saveMessages write size linearly without bound
- Dirty flag in recalcAndPersistTagGrowth: **excellent pattern** — no write if Δ<0.01. Evidence of engineering care.
- AI context injection: only top 5 cards, 80-char excerpts, top 3 journals. Good token budgeting.

---

### 2.9 Scalability

**Score: 4/10 — localStorage-only caps at ~1K journals; single App hub caps LOC growth.**

- 1000 journals × 500 chars each ≈ 500KB JSON alone. Add 15 tables → localStorage 5MB limit approaches ~year of heavy use.
- 37 useState in App.tsx: once LOC crosses ~1500, becomes unmaintainable.
- AI subsystem: already modular (aiRouter.ts / aiService.ts). Easy to add providers/services. 10/10.
- Brain tree: 100 tags × 50 evidence = 5,000 rows still fine. Once evidence 50K → aggregateTagScores will need virtualization/Web Worker.

---

### 2.10 Maintainability

**Score: 6/10 — Good doc coverage is now there; test coverage 0% is the giant anchor.**

- 0 tests (unit/e2e). runMigrations especially untested is RISK.
- Strong TypeScript typing across the app (40+ interfaces). TypeScript catches many bugs pre-ship. 👍
- Static classes RoomDatabase and AIRouter are easy to reason about — no instance state.
- Duplicate reminder logic (HomeView 190 lines + NotificationBell 292 lines): future bug when you fix one, forget the other.

---

### 2.11 Security

**Score: 3/10 — HIGH severity issues that CANNOT ship to production as-is.**

- API keys plain text in localStorage. DevTools Application tab → any user can read them. XSS on same origin = game over.
- No CSP headers in server.ts.
- No input length limits / prompt injection guards before AI calls.
- `<img src>` from user-provided VisionBoard URLs. No CSP img-src restriction.
- ConfirmDialog before destructive (Clear All Data / Import backup). Good.

---

## Part 3 — Code Smells

### 3.1 Duplicate Logic — Top Offenders

| # | What | Location A | Location B | Lines | Impact |
|---|---|---|---|---|---|
| 🔴 **SMELL #1** | Reminder list + add/edit/complete logic (form input, enter handler, edit inline, complete checkbox, list render, divider-y groups, max-height) | `NotificationBell.tsx` L110–L292 (~182 lines) | `HomeView.tsx` L200–L393 (~193 lines almost identical) | **375 lines duplicated** | **HIGH.** Edit reminder in Bell, forget to update HomeView → divergent bug. Already subtle differences. |
| 🟠 SMELL #2 | Brain Card detail + linkedJournalIds sync (2-way Journal ↔ Card link propagation add/remove) | LifeBrainView onClick expand | BrainCardModal journal search + checkbox save form | 80 lines 2-ways | MEDIUM. Bugs possible when unlink A→B but forget B→A reverse. |
| 🟡 SMELL #3 | Modal frame pattern (w-full h-screen fixed, backdrop blur, z-50, Esc close, drag to dismiss bottom sheet) | 14 modal TSX files all have same wrapper markup | Same in every file | 20-30 lines per × 14 = 350 lines | MEDIUM. Shared `<ModalContainer>` wrapper missing. 14 files to change padding in future. |
| 🟡 SMELL #4 | 14 confirm dialog open/close pattern + setShowConfirm → onConfirm → setState per call site | App.tsx + 6 modals | 6 files | ~10 lines × 6 = 60 | LOW. useConfirm hook would eliminate. |

### 3.2 Oversized Components / Files

| File | Lines | Why Smelly | Recommendation |
|---|---|---|---|
| App.tsx | 755 | 37 useState × 28 handlers = state god object. | Split into AppState.tsx (state container) + AppHandlers.ts (hooks) + AppNavigation.tsx (render). Keep App.tsx <250 lines. |
| ManageAPIModal.tsx | 482 | 3 PROVIDER_DEFAULTS + DnD state + 4 views + test-connection results + eye toggle + model select | Extract ProviderCard.tsx per-provider sub-component. Add useProviderDnD hook. |
| LifeBrainView.tsx | 519 | 3-tier filter + expand state + 2-way link sync + grid layout + 2 color maps | Extract BrainCardList.tsx, BrainFilterBar.tsx, BrainCardDetail.tsx. |
| JournalView.tsx | 457 | 12-dim chips required validation + mood bank + 80 emotion + preset tags grid + 4 date bucket group + edit modal inline | Extract JournalForm.tsx, JournalDateBuckets.tsx. |
| NotificationBell.tsx | 292 | Bell icon button + dropdown + reminder form + list | Extract ReminderListWithForm.tsx shared component. |
| DailyCheckinModal.tsx | 308 | 5-step wizard + live word counter + sparkles spinner + summarizeDailyCheckin await | Extract CheckinStep.tsx generic, useWordCounter hook. |

### 3.3 Oversized Functions

| Function | Lines | Why |
|---|---|---|
| App.tsx handleAddJournal + microtask AI chain | ~90 lines inline | Split into: `saveJournalSync(entry)` and `queueJournalPlacement(entry)` |
| brainTreeService recalcAndPersistTagGrowth | ~70 lines | Pure scores compute + persistence could be two fns |
| aiService suggestJournalBrainPlacement | ~85 lines | Split: buildPlacementPrompt, parsePlacementResponse(json) |
| db.ts runMigrations (v2+v3+v4 chain) | ~75 lines | Each migration = own function |
| App.tsx useEffect[] mount bootstrap | ~50 lines | useAppBootstrap hook |

### 3.4 Tight Coupling

| Pair | Issue |
|---|---|
| **App.tsx → every modal prop** | 14 modal components each receive 5-7 props (data + setter + onSave callbacks). Change handler signature → touch 14 files. |
| **AICoachView → aiService 7 fns directly** | No interface between UI and AI layer. |
| **brainTreeService.ts → RoomDatabase directly** | Calls all getBrainXxx() saveXxx() inside service body — can't unit test service with in-memory DB. Pass Repository interface instead. |
| **All views → localStorage via RoomDatabase** | If you switch to IndexedDB later, need to touch 8 views and all services. |

### 3.5 Dead Code

| Item | File | Evidence |
|---|---|---|
| (Legacy clean) Small Talk / Reflection system removed — see summary. ✅ **Already cleaned in previous session.** | — | — |
| (Legacy) Floating AI Button component — removed ✅ | — | — |
| `aiApiKey`, `aiProvider` legacy fields in UserSettings | types.ts | Present only for migration v3. Never read by app code after migration. Could be deleted after v3 ships 6 months. |
| `UserSettings.theme` reserved field | types.ts | Always undefined. No light mode. |
| `PendingAITask[]` queue type + storage key | db.ts getPendingTasks | Type exists, storage getter/setter exist, Queue NEVER pushed to or drained. Empty. (Future feature scaffolding.) |
| Legacy v1 `BRAIN_CARDS_KEY = "mylifeos_brain_cards_v1"` | db.ts | After migration v4 runs, no code reads it anymore; preserved so migration v4 can re-read it. Safe to delete after 1 year sunset. |
| `brainTreeService.ts` Decay Engine code (enableDecay opts) | growth/aggregateTagScores | Default false. Feature exists but UI toggle to enable it missing. Feature debt hiding as dead-path. |

### 3.6 Possible Bugs (Detected Via Static Audit)

| # | Bug | Probability | Impact | Trigger |
|---|---|---|---|---|
| 1 | Orphan Journal Entry ↔ BrainCard cross links | **Certain** once you start deleting | Data integrity inconsistency | Delete journal → card.linkedJournalIds retains ghost id. Delete card → journal.linkedBrainCardIds retains. No bidirectional cleanup. |
| 2 | Habit `currentStreak` does NOT recalculate on load. | Very High — 1 missed day = streak still showing forever. | Wrong stats if user forgets to toggle checkbox daily then remembers. CompletedDates is ground truth. | User goes on vacation for 3 days, doesn't open app. `currentStreak` still says "14". Should be 0. Should recompute streak from completedDates[] array on App.tsx mount boot. |
| 3 | Goal.progressPercent rounding 99.9% → 100% milestone completion trigger with 2 milestones each at 50.0001%? | Medium | False "Complete goal achieved" timeline event spam. | Edge case float rounding. |
| 4 | localStorage write failure silent. No UI error feedback. | Medium-High | User thinks data saved → actually localStorage full 5MB → data lost. Browser quota exceeded. | Heavy users after ~1 year. |
| 5 | Multiple Daily Check-ins per day. HomeView shows the latest, but Stats average the duplicates. | Medium | Inflated character XP. | User taps "Save" twice by mistake in DailyCheckinModal; no deduplication. |
| 6 | No AbortSignal on AI calls. User starts AI analyze → immediately clicks tab → request still pending. | Medium | Tokens still spent. | Multiple rapid tab changes = multiple duplicate in-flight AI requests. |
| 7 | Shift+Enter in AICoachView sends message (should be newline) bug? | Low (code correctly checks `!e.shiftKey && key === 'Enter'`) | — | Verified code correctly. ✅ Not a bug. |

### 3.7 Performance Issues & Memory Leaks

| Issue | Where |
|---|---|
| **Unbounded `messages[]` growth — 0 cleanup.** | AICoachView saves every chat msg forever. 1000 messages = 1MB localStorage. 10K messages = 10MB. Exceeds 5MB. |
| **No React.memo anywhere.** | 37 useState = every state change renders entire component tree. BottomNav re-renders when user types in JournalView textarea even though it's unaffected. |
| **Lazy mount missing on 14 modals.** | `{isGoalsModalOpen && <GoalsModal ... />}` pattern not used. All 14 modals mount full tree always — Goals, Habits, Checklist, Vision, Affirmation, Timeline, DailyCheckin, BrainCard, ManageAPI, ManageTags, ManageMoods, AISuggestPopup, GlobalSearchModal, ReminderJournalModal — all 14 rendered always. Only display:hidden. Memory overhead. |
| **useKeyboardScrollFix 3 global listeners — 150ms setTimeout on every focusin event globally.** | 150ms timer race; no Abort for cleanup if user blurs before timeout fires. Leak unlikely but possible. |

---

## Part 4 — Technical Debt

| ID | Debt Item | Impact | Severity | Suggested Fix |
|---|---|---|---|---|
| TD-1 | API keys plain localStorage | Security breach. XSS = all keys stolen. | 🔴 CRITICAL | Encrypt keys at rest using Web Crypto API (AES-GCM). Derive key from device fingerprint + optional PIN. Or move to Capacitor Secure Storage plugin on native. |
| TD-2 | Zero tests + migrations untested | Any migration update = data loss risk. No CI gate. | 🔴 CRITICAL | Add Vitest + 3 tests per migration (empty DB / old v1 DB / mixed DB). Add runMigrations dry-run mode. |
| TD-3 | localStorage 5MB ceiling + silent write fail | Catastrophic data loss when full. User never warned. | 🟠 HIGH | 1. Add size check before every write → toast warning + offer export backup when >4.2MB (85% full). 2. Migrate journals/evidence/chat → IndexedDB now (Dexie.js wrapper). |
| TD-4 | App.tsx state god object 755 lines / 37 useState | Maintainability crash-landing. Merge conflicts. | 🟠 HIGH | Split 3 ways: (1) useAppData hook for storage state. (2) useAppModals for 14 booleans object + reducer. (3) useAppHandlers — returns object of handler fns. |
| TD-5 | Duplicate Reminder code HomeView vs NotificationBell 375 lines dual impl | Bug divergence | 🟠 HIGH | Extract `<ReminderPanel reminders onAdd onEdit onComplete onDelete />` shared component 200 lines; import into both. Delete duplicate. |
| TD-6 | No AbortSignal timeout on fetch calls | Hung network forever if mobile drops carrier mid-call. | 🟠 HIGH | Wrap all 3 provider wrapper calls in `Promise.race([fetch, timeoutPromise(30s)])` with AbortController.abort(). |
| TD-7 | Temp/per-call temperature & maxTokens not configurable (hardcoded 0.7/1024 in provider wrappers) | AI quality inconsistency (classification tasks need 0.2 temp, not 0.7). | 🟡 MEDIUM | Add optional `CallOptions?: {temperature?, maxTokens?}` parameter to AIRouter.call() → propagates into provider wrappers. |
| TD-8 | 14 modals: no shared ModalContainer wrapper → 14 copies of identical padding/z/backdrop markup | Styling changes = touching 14 files. | 🟡 MEDIUM | `<ModalContainer isOpen onClose title? header? footer?> + children.` Add ESC, focus trap, role=dialog built-in. |
| TD-9 | Orphan bidirectional link cleanup missing | Integrity bugs in link counts. | 🟡 MEDIUM | In handleDeleteJournal: for each card in cards where id in linkedBrainCardIds: remove from linkedJournalIds → save cards. Same reverse direction in handleDeleteBrainCard. |
| TD-10 | Habit streak not recomputed from completedDates on mount | False streaks forever. | 🟡 MEDIUM | Add `recomputeHabitStreaks(habits): HabitItem[]` pure function; call on boot in useEffect[] once. |
| TD-11 | Check-in uniqueness per day unguarded | Inflated stats | 🟡 MEDIUM | Before handleSaveCheckin write: if checkins already has today ISO → show confirm "You already checked in today. Overwrite previous?". Default Cancel. |
| TD-12 | 14 modals mounted even when closed = memory | Render bloat. | 🟢 LOW | Change {isX && <XModal open=... props />} conditional mount everywhere. |
| TD-13 | No AI response cache | Same journal twice saved = 2× API token spend, 2× identical call. | 🟢 LOW | Add Cache Key sha256(message) + IndexedDB cache table. TTLs per task. |
| TD-14 | Chat messages[] sliding window never applied to history | Token + storage blow-up. | 🟢 LOW | Keep full history in UI, but only last 20 messages in AI context. |

---

## Part 5 — Refactor Roadmap (Priority Order)

### 🔴 CRITICAL — Do BEFORE Next Public Release (1-2 Days Work)

| # | What | Why | Expected Benefit | Possible Risk |
|---|---|---|---|---|
| 1 | Storage limit warn + error UI | Data loss risk unnotified | User data safety. 0% silent corruption | Wrong toast on legitimate small write. Low. |
| 2 | Habit streak recompute on boot | Wrong stats display displayed for 2+ years now → app loses credibility | User trust in habit data | Complex consecutive-day algorithm edge cases (timezone handling, leap year, calendar rollover). |
| 3 | Orphan link cleanup handlers delete bidirectional | Integrity bugs fixed now before compound data grows | Data trust | Accidental card link removal — test. |
| 4 | Add 30s timeout AbortSignal wrap 3 providers | App freezes on network — user closes tab never to return | UX robustness | Timeout aggressive on slow 2G → 45s safer. |

### 🟠 HIGH — 1 Sprint (1 Week)

| # | What | Why | Benefit | Risk |
|---|---|---|---|---|
| 5 | Extract ReminderPanel shared component, delete 375 duplicate lines | Home/Bell divergent bug prevention + halved maintenance cost | -500 LOC | UI regressions in bell dropdown or home layout if wrapper CSS is wrong. Snap tests after. |
| 6 | Split App.tsx into useAppData + useAppModals reducer + useAppHandlers hooks | Merge conflicts. Code review pain. | App.tsx down to ~220 lines (render only) | State order change causes infinite loops. Move carefully; one hook at a time. |
| 7 | Journals + Evidence + Chat → IndexedDB via Dexie.js | Storage ceiling lifted. Queries become O(1) index not O(n) full scan. | 10× storage capacity + 5× search performance. | Migration v5 from localStorage → IndexedDB. Untested migration = data loss. Dry run. |
| 8 | Add temperature/maxTokens per-call options in AIRouter | Fix AI output quality on classification tasks (0.3 vs 0.7 matters) | Higher brain placement accuracy. | Service layer signatures change — update 12 call sites. |
| 9 | Add Encrypted API key storage (TD-1) | High security before public. | Ship to app stores with confidence. | User forgets PIN → can't recover keys. UX recovery flow needed. |

### 🟡 MEDIUM — 2 Sprints (2 Weeks)

| # | What | Why | Benefit | Risk |
|---|---|---|---|---|
| 10 | Shared ModalContainer 1→14 replacement | Single source for styling + aria + ESC close | A11y + maintainability. ~300 LOC removed. | Modal padding differences — regression. |
| 11 | Add Vitest: 1× computeGrowth, 1× runMigrations v2-v4, 1× aggregateTagScores, 1× countWords Thai | Migrations untested = data bomb waiting. + regression safety net. | CI gate now possible. Future refactors safe. | Engineering discipline; learn curve if team hasn't used Vitest + happy-dom. |
| 12 | Conditional mount 14 modals | Memory. Faster initial paint. | ~50% less first render work. | Modal open animation glitch if timing off. |
| 13 | Per-day checkin dedupe gate + confirm | Prevent double count stats | Character stat integrity. | User expects to be able to edit earlier check-in. Need Save vs Update modal flow. |
| 14 | React.memo BottomNav / Header / NotificationBell container | Reduce unnecessary renders during typing | Perceived typing smoothness. | False-neg memo cache bugs if props change unexpectedly. |

### 🟢 LOW — Ongoing Backlog Items (Backlog)

| # | What | Why | Benefit | Risk |
|---|---|---|---|---|
| 15 | AI response cache (sha256 key + TTL per task) | Save 30% API tokens long-term | Lower spend | Cache invalidation if content changes. |
| 16 | Chat sliding window only last 20 msgs in AI context, full history UI | Token savings + prevent context overload | Accuracy up, cost down | Older chat history loses context. |
| 17 | AI call rate limiter / provider status marking | Don't retry dead provider every call for 5 min | 5× latency saved when provider down | Status stale wrong. Session-only mark safe. |
| 18 | Bundle split: dynamic import JSZip + @google/genai only on first use | Smaller initial JS bundle 30% reduction | Faster LCP on slow networks. | Stutter when loading first backup export / first Gemini call. |

---

## Part 6 — Future Improvements

### 6.1 UX Improvements

- **Pull-to-refresh / re-read from storage** (PWA: user might have 2 tabs open — tabs don't sync storage events yet). Add window.storage listener to re-hydrate App.tsx state when another tab writes.
- **Keyboard shortcuts (Ctrl/Cmd+N = new journal, Ctrl/Cmd+K = search, Ctrl/Cmd+S = save everywhere, Esc = close modal already done).**
- **Undo toast** for last 30 seconds: "Deleted 1 journal. UNDO?" snackbar before finalizing.
- **Drag-and-drop reorder for goals/habits/checklist** (currently only AI providers have native DnD).

### 6.2 UI Improvements

- **Light Mode toggle:** Currently Permanent Dark Mode only. Some users want light mode in sunlight.
- **Color accent picker:** Brand green #4E7345 fixed. Users love personalization.
- **Habit heatmap (GitHub style green squares):** 365-day grid visualization.
- **Brain tree 3D SVG visualization:** Current grid is flat. True tree visualization with size scaled by level. Nodes draggable.

### 6.3 AI Improvements

- Per-call temperature/maxTokens (TD-7).
- Streaming output in chat (SSE or chunk SDK) — UX feels instant.
- Retry-After header parsing on 429.
- AI rate-limit wait animation.
- Confidence visualization to user: "AI auto-categorized this with 78% confidence (edit)" link.
- Missing node proposal UI: dedicated BrainManager UI to approve/reject suggested tags from pendingAITasks queue.

### 6.4 Architecture Improvements

- App.tsx split + Context store or Zustand/Jotai minimal.
- Repository Pattern — brainTree service accepts interface Storage { getEvidence, saveEvidence } not concrete RoomDatabase. Enable in-memory tests.
- Event Emitter / Pub-Sub for cross-component state: `events.on('journal.saved', handler)` — decouple handlers.
- Clean Architecture folder: domain/ (interfaces + pure logic) / application/ (use-cases) / infra/ (storage impls) / presentation/ (React).

### 6.5 Security

- Encrypt API keys + sensitive storage (TD-1).
- CSP header + HSTS in server.ts.
- Input length hard limits: journal content max 20K chars.
- HTML sanitize user-provided image URLs in VisionBoard — reject non http/https data URIs.
- SubtleCrypto hash of localStorage data periodically — detect tampering.

### 6.6 Performance

- Debounce 500ms on saveJournals, saveMessages, saveBrainEvidence writes.
- Virtualization for journals list 1000+ rows: `@tanstack/react-virtual`.
- Web Worker: offload aggregateTagScores + computeGrowth to worker thread.
- Code split dynamic imports: JSZip, @google/genai, motion, lucide-react icons (tree-shaken but still).

### 6.7 Scalability

- Backend sync layer (Supabase or custom Node). Multi-device conflict-free sync (CRDT Yjs for journals).
- Multiple life profiles: e.g., "Personal" vs "Work" — each has own tree.
- Team Life OS: shared goals / vision boards / accountability partners.

### 6.8 Offline

Already works! PWA via sw.js. No backend needed. Only AI requires online.
- Future: local LLM via WebGPU/WebAssembly (llama.cpp WASM). Fully offline AI possible on Android 8GB+ RAM in 2025.
- Queue AI requests when offline → flush on reconnect via PendingAITask drain queue.

### 6.9 Android (Capacitor)

- Capacitor config already exists (capacitor.config.ts com.mylifeos.app). Android build: `npm run cap:sync` + Android Studio.
- Secure shared preferences for API keys (TD-1): use `@capacitor/preferences` plugin, not localStorage.
- Splash Screen + Adaptive Icon. Push Notifications for habit reminders (Firebase FCM).
- Android biometric unlock (App open → prompt fingerprint / face).
- Background habit reminder alarm via AlarmManager / WorkManager (local notifications schedule — JS alarms are suspended while app is in background).

### 6.10 Maintainability

- Vitest 70% coverage target. Storybook for all shared components. ESLint strict + Prettier enforced. Pre-commit hooks. CI/CD GitHub Actions: tsc --noEmit → build → test. Auto-deploy to Vercel on main PR merge. Conventional commits + CHANGELOG auto-gen.

---

## Part 7 — Architecture Score Card (1–10)

### 🏗️ Architecture — 7/10

+ Flat-but-logical: components/views/lib/hooks clean separation. Brain Tree modular subfolder.
+ Clean 3-layer AI: service→router→providers. Failover pattern is production-grade.
± No Router lib = excellent hybrid UX = but zero deep-linking.
− Single App.tsx state god object = largest architecture flaw. −3 points.

### 🧹 Code Quality — 7/10

+ Strong TypeScript coverage: 40+ interfaces, no any-types in production logic.
+ No dead code: previous session cleaned Small Talk, Reflection, Floating Button.
+ Consistent naming conventions getXxx/saveXxx + handle prefix for actions.
− 375 lines reminder duplication. −1.
− 7 modals >250 lines oversized.
− No linter/formatter explicitly enforced.

### 🛠️ Maintainability — 5/10

+ Doc coverage now 5 files = **excellent**. New engineer can ship feature in 2 days with docs.
+ Static classes / pure fns easy to reason about (growth.ts, computeGrowth pure).
− ZERO test coverage. −3 points. Critical migrations, pure formulas untested.
− App.tsx 755 LOC, merge-conflict magnet.

### 📈 Scalability — 4/10

+ AI Subsystem: most scalable part; 10 mins to add provider.
− Storage: localStorage 5MB limit = hard cap ~12 months heavy use.
+ Brain tree: 100 tags × 1000 evidence aggregateTagScores = 2000 ops — totally fine.
− 37 useState monolith: past ~1200 LOC → onboarding takes 2x longer.

### ⚡ Performance — 6/10

+ Dirty flag growth recalc (Δ<0.01 skip write): nice optimization. 👍
+ Keyword fallback before AI: saves latency + tokens.
− No React.memo. No conditional modal mount. Messages[] unbounded growth.
− localStorage sync O(n) stringify per save — fine at 100 entries, sluggish at 1000.

### 🎨 UX — 9/10 (Highest Score in Card)

+ Permanent Dark Mode, consistent color tokens, 9 vars.
+ Mobile UX excellence: visualViewport keyboard detection, 3 hooks, 100dvh + safe area.
+ Textarea auto-resize — 8+ inputs all feel great.
+ Save-first-analyze-later journal = write friction zero. 💯

### 🤖 AI Design — 8/10 (Second Best)

+ **3-layer (service/router/provider) architecture.** Priority failover, OpenRouter internal 4-model chain — robust.
+ **Confidence thresholds 0.55 UI popup / 0.65 auto-apply** — brilliant. User sovereignty + convenience balance.
+ Keyword algorithm cheap pre-screen before AI to skip call. Saves 💰 tokens.
− Temperature/max tokens hardcode: −1.
− No timeout, no cache, no rate limit: −1.

### 🔐 Security — 3/10 (Lowest Score)

− API keys plain-text localStorage = DevTools read. XSS exposed. Breaks OWASP A02 Cryptographic Failures. −4.
− No CSP, no input length limits. Unsandboxed user img tags. −2.
+ confirm() before destructive action. try/catch everywhere. +1 each = net +2.
− Overall: MUST fix before public Android release / production users.

---

### Final Weighted Average Composite Score

**(7×2 + 7×1 + 5×1.5 + 4×1 + 6×1 + 9×2 + 8×1.5 + 3×2) / (2+1+1.5+1+1+2+1.5+2) = 123 / 12 ≈ 6.7/10**

**Interpretation:** Solid B-. Production-ready for personal / early-access beta with critical fixes (TD-1 through TD-4 applied). Not yet "Google-grade" enterprise but exceptional for a personal OS app with likely 1-2 engineer(s). Strongest dimensions: UX (9/10) and AI design (8/10) — exactly where this app differentiates. Weakest: Security (3/10) and Scalability (4/10) — fixable with 2-3 focused sprints.
