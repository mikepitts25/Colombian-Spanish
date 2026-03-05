# 📋 App Ideas Tracker - Notion Setup Guide

## Step 1: Create Your Notion Account
1. Go to https://notion.so
2. Sign up (free personal plan)
3. Download mobile apps (iOS/Android) for on-the-go ideas

---

## Step 2: Import the CSV

### Method A: Full Import (Recommended)
1. In Notion, click **+ New Page**
2. Name it "🚀 App Ideas & Features"
3. Type `/database` and select **"Table"**
4. Click the database title → **"..." menu** → **"Merge with CSV"**
5. Upload `app-ideas-notion-import.csv`
6. Notion will auto-detect column types

### Method B: Manual (If import fails)
1. Create new database: `/database` → **Table**
2. Add these columns exactly:
   - **Name** (Title)
   - **App** (Select: SpiceSync / Colombian Spanish / New App)
   - **Status** (Select: Idea → To Do → Doing → Done)
   - **Priority** (Select: 🔥 High / Medium / Low)
   - **Type** (Select: Feature / Bug / Content / UI/UX / etc)
   - **Notes** (Text)
   - **Tags** (Multi-select)
   - **Date Added** (Date)
   - **Effort** (Select: Small / Medium / Large)
   - **Impact** (Select: Critical / High / Medium / Low)
3. Copy/paste data from CSV

---

## Step 3: Create Views

### View 1: Kanban Board (By Status)
1. Click **"+ New"** next to views
2. Select **Board**
3. Group by: **Status**
4. Card preview: Show **Name + Priority + App**

### View 2: By App
1. Click **"+ New"**
2. Select **Table**
3. Filter: **App** = "SpiceSync" (save as "SpiceSync Only")
4. Repeat for Colombian Spanish

### View 3: Priority View
1. Click **"+ New"**
2. Select **Table**
3. Sort: **Priority** → 🔥 High first
4. Filter: **Status** is not "Done"

### View 4: Ready for Gatsby
1. Click **"+ New"**
2. Select **Table**
3. Filter: **Status** = "To Do" AND **Priority** = "🔥 High"
4. This is your "feed to Gatsby" view

---

## Step 4: Share With Your Wife

1. Click **Share** (top right)
2. Click **"Add people"**
3. Enter her email
4. Set to **"Can edit"**
5. She'll get an invite email

---

## Step 5: Share View-Only With Me

When you want me to work on something:

1. Go to your **"Ready for Gatsby"** view
2. Click **Share**
3. Click **"Copy link"**
4. Set to **"Can view"** (not edit)
5. Send me the link

I can see exactly what to build in priority order.

---

## 🎯 How to Use Daily

### Adding New Ideas
1. Open Notion mobile app
2. Tap **+** on your database
3. Fill: Name, App, Status = "Idea", Priority
4. Add any notes/screenshots

### Weekly Review (You + Wife)
1. Open Kanban view
2. Drag ideas from "Idea" → "To Do" (approved)
3. Set priorities
4. Tag with effort level

### When Ready to Build
1. Move card to **"To Do"** + set **🔥 High priority**
2. Share view-only link with me
3. I build it, mark **"Done"**

---

## 📱 Mobile Quick Add

**On the go:**
1. Open Notion app
2. Tap **+** in bottom right
3. Select your database
4. Dictate or type idea
5. Set App and Priority

---

## 🏷️ Tag Suggestions

**Types:**
- Feature (new functionality)
- Bug (something broken)
- Content (cards, decks, translations)
- UI/UX (visual improvements)
- Monetization (paywall, IAP)
- Gamification (badges, streaks)
- Launch Blocker (must fix to ship)
- Visual Asset (icons, screenshots)

**Apps:**
- SpiceSync
- Colombian Spanish
- New App (for future ideas)

---

## 💡 Pro Tips

1. **Use @mentions** in Notes: "Ask @wife about this color"
2. **Add screenshots**: Drag images into Notes field
3. **Set reminders**: Click Date → Add reminder
4. **Use templates**: Save time on similar tasks
5. **Comments**: Discuss ideas without editing

---

## 🔗 Quick Links

- **Notion Web:** https://notion.so
- **Download Apps:** https://notion.so/product
- **Help Center:** https://notion.so/help

---

## Example Workflow

**You (at coffee shop):**
> "We should add a streak counter to Colombian Spanish"
→ Open Notion app → Add idea → Tag as "Gamification"

**You + Wife (weekly review):**
> "That streak idea is good, let's do it"
→ Drag to "To Do" → Set 🔥 High priority

**Me (when you share link):**
> See "Add streak counter" in "Ready for Gatsby" view
→ Build it → Mark Done

---

Ready to import! The CSV has 20 sample items to get you started. 🚀
