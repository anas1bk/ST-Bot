# 📢 Feedback Channel Setup Guide

## 🎯 **How to Set Up Feedback Channel**

### **Step 1: Create a Telegram Channel**
1. Open Telegram
2. Click the menu (☰) → "New Channel"
3. Give it a name like "Bot Feedback"
4. Make it **Public** or **Private** (your choice)
5. Add your bot as an **Admin** to the channel

### **Step 2: Get Channel Username/ID**

**For Public Channels:**
- Channel username: `@your_channel_name`
- Example: `@bot_feedback_channel`

**For Private Channels:**
- Channel ID: `-1001234567890`
- To get this, forward a message from your channel to @userinfobot

### **Step 3: Update Configuration**

**Option A: Update config.js directly**
```javascript
// In config.js, change this line:
feedbackChannel: process.env.FEEDBACK_CHANNEL || '@your_channel_name',
```

**Option B: Use Environment Variable (Recommended)**
```bash
# In your hosting service (Render, etc.)
FEEDBACK_CHANNEL=@your_channel_name
```

### **Step 4: Test the Setup**
1. Deploy the updated bot
2. Send `/feedback` to your bot
3. Write a test message
4. Check if it appears in your channel

## 🔧 **Channel Permissions**

Make sure your bot has these permissions in the channel:
- ✅ **Send Messages**
- ✅ **Post Messages** (if public)

## 📝 **Example Channel Names**

```
@bot_feedback_channel
@engineering_bot_feedback
@student_feedback
@bot_suggestions
```

## 🚨 **Troubleshooting**

**If feedback doesn't work:**
1. Check if bot is admin in the channel
2. Verify channel username/ID is correct
3. Check bot permissions
4. The bot will fallback to sending to you directly

## 🎉 **Benefits**

- ✅ **Organized feedback** in one place
- ✅ **Easy to manage** multiple feedback messages
- ✅ **Team access** if you have collaborators
- ✅ **Fallback system** if channel fails

---

**💡 Tip: You can also create a private channel and add team members to manage feedback together!**
