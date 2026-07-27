# COMPLETE_SYSTEM_AUDIT.md — My Life OS

> A 360-degree technical audit covering every file, every function, every risk, every strength, every dependency, and every recommendation for the system.

---

## 1. Full File Inventory

### Source Files (`src/`)

| File | Lines | Purpose | Key Exports |
|---|---|---|---|
| `main.tsx` | ~20 | React entry, SW registration | — |
| `App.tsx` | ~800+ | Root state + orchestration | `default App` |
| `types.ts` | ~200 | All TypeScript interfaces + constants | All types, BRAIN_TYPES, LIFE_DIMENSIONS |
| `index.css` | ~100 | Tailwind import + global CSS vars | — |
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

### `lib/db.ts` — RoomDatabase

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

### `lib/aiRouter.ts` — AIRouter

| Method | Returns | Purpose |
|---|---|---|
| `static call(messages, providers, brainCards?, userMessage?)` | `Promise<string>` | Main AI dispatch with failover |
| `private static callGemini(messages, provider)` | `Promise<string>` | Call Google Gemini API |
| `private static callGroq(messages, provider)` | `Promise<string>` | Call Groq API |
| `private static callOpenRouter(messages, provider)` | `Promise<string>` | Call OpenRouter API |
| `static detectDimension(text)` | `LifeDimension[]` | Keyword-based dimension detection |
| `static buildBrainContext(message, cards, dimensions)` | `string` | Format Brain Cards as AI context |
| `static testConnection(provider)` | `Promise<{success, message}>` | Validate API key with test call |

### `lib/aiService.ts` — Service Functions

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
| `react` | ^19.0.1 | All components | LOW — stable |
| `react-dom` | ^19.0.1 | main.tsx | LOW |
| `typescript` | ~5.8.2 | Compile-time only | LOW |
| `@google/genai` | ^2.4.0 | aiRouter.ts | MEDIUM — API breaking changes possible |
| `jszip` | ^3.10.1 | db.ts backup | LOW — stable |
| `lucide-react` | ^0.546.0 | All components | LOW — icons only |
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
| `@capacitor/core` | ^6.0.0 | Native bridge | MEDIUM — major version |
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

- API keys shown with `type="password"` in ManageAPIModal (UI only — still in localStorage)
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
| `@google/genai` | Large SDK — only used in aiRouter.ts |
| `jszip` | Medium — only used in backup/restore |
| `lucide-react` | Tree-shaken — only imported icons bundled |
| `motion` | Medium — if full package imported |

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
| User clears site data | HIGH | No mitigation — by design |

### Data Consistency Issues

1. **Orphaned linkedJournalIds:** If a journal is deleted, `BrainCard.linkedJournalIds` still references it. No cleanup on journal deletion.

2. **Orphaned linkedBrainCardIds:** If a Brain Card is deleted, `JournalEntry.linkedBrainCardIds` still references it. No cleanup.

3. **Habit streak accuracy:** `currentStreak` is incremented/decremented manually on toggle. It does NOT recalculate from `completedDates` — a missed day doesn't automatically reset the streak. The streak is only accurate if the user toggles consistently.

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
| Single source of truth for types | All types in `types.ts` — no type duplication |
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
| ZIP backup portability | Data is human-readable JSON inside ZIP — no proprietary format |
| PWA + Capacitor dual target | Same codebase for web and Android without native code |
| Thai-first design | All UI copy, AI prompts, and error messages are Thai |
| Extensible AI system | Adding a new provider or mode is a single function + case addition |
| localStorage isolation | Each user's data is entirely local — no cross-user data leakage |
| Brain Card ? AI context pipeline | Unique feature: user's own knowledge enriches AI responses |

---

## 11. Scaling Limits

| Limit | Threshold | Impact |
|---|---|---|
| localStorage | ~5MB | Hard limit — app may silently fail to save after heavy use |
| Journal entries | ~1,000 | Array serialization cost becomes noticeable |
| Brain Cards | ~500 | AI context injection sends top 5 — scales fine |
| Chat history | Unbounded | `messages[]` grows forever — no cleanup implemented |
| AI prompt tokens | ~1024 output | Truncation on long responses possible |
| Habit completedDates | ~365 strings/habit | Manageable; grows ~1 string/day per habit |

**Critical Limit:** Chat messages (`messages[]`) are never truncated or paginated. After 100+ messages, AI calls will include very long conversation history, potentially hitting provider token limits.

**Recommendation:** Implement message sliding window — keep only last 20 messages for AI context, display full history in UI.

---

## 12. Migration Safety Audit

### v2 Migration (flag: `mylifeos_migrated_v2`)
- **Operation:** Wipes all v1 localStorage keys
- **Risk:** Data loss if migration runs when user has v1 data they want to keep
- **Mitigation:** One-time flag ensures it never runs twice
- **Rollback:** None — v1 keys are permanently deleted

### v3 Migration (flag: `mylifeos_migrated_v3`)
- **Operation:** Migrates `aiApiKey` ? `apiProviders[0]`, converts string[] reminders
- **Risk:** Low — additive migration that creates new structure from old
- **Mitigation:** Reads old field first, only writes if non-empty
- **Rollback:** None — but original key is preserved in settings

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
