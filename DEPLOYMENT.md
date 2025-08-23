# 🚀 Deployment Guide

This guide will walk you through deploying your Engineering Telegram Bot to GitHub and Render.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Telegram bot token from [@BotFather](https://t.me/botfather)

## 🔧 Step 1: Get Your Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. **Copy the token** - it looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Keep this token safe - you'll need it for deployment

## 📁 Step 2: Prepare Your Local Files

### Files you should have:
- ✅ `engineering_bot.js` - Main bot
- ✅ `config.js` - Configuration
- ✅ `package.json` - Dependencies
- ✅ `README.md` - Documentation
- ✅ `.gitignore` - Git ignore file
- ✅ `start.js` - Startup script (optional)

### Files you can delete (they're old):
- ❌ `index.js` (old bot)
- ❌ `server.js` (old server)
- ❌ `ING` (not needed)
- ❌ `requirements.txt` (for Python, not needed)

## 🌐 Step 3: GitHub Setup

### 3.1 Create a new GitHub repository

1. Go to [GitHub.com](https://github.com)
2. Click the "+" button → "New repository"
3. Name it: `engineering-telegram-bot`
4. Make it **Public** (Render needs this)
5. **Don't** initialize with README (you already have one)
6. Click "Create repository"

### 3.2 Upload your files to GitHub

**Option A: Using GitHub Desktop (Easiest for beginners)**
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in
3. Clone your repository
4. Copy all your files to the repository folder
5. Commit and push

**Option B: Using Git commands**
```bash
# In your project folder
git init
git add .
git commit -m "Initial commit: Engineering Telegram Bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/engineering-telegram-bot.git
git push -u origin main
```

**Option C: Using GitHub web interface**
1. Go to your repository on GitHub
2. Click "uploading an existing file"
3. Drag and drop all your files
4. Commit the changes

## ☁️ Step 4: Deploy to Render

### 4.1 Create Render account
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email

### 4.2 Create a new Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select your `engineering-telegram-bot` repository

### 4.3 Configure the service
- **Name**: `engineering-telegram-bot`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### 4.4 Add Environment Variables
Click "Environment" tab and add:
- **Key**: `BOT_TOKEN`
- **Value**: Your bot token from Step 1

### 4.5 Update config.js for Render
You need to modify your `config.js` to use environment variables:

```javascript
// In config.js, change this line:
token: 'YOUR_BOT_TOKEN_HERE',

// To this:
token: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
```

### 4.6 Deploy
1. Click "Create Web Service"
2. Wait for deployment (usually 2-3 minutes)
3. Your bot will be live at: `https://your-app-name.onrender.com`

## 🧪 Step 5: Test Your Bot

1. Open Telegram
2. Find your bot (the username you created with BotFather)
3. Send `/ing` command
4. Test the navigation flow
5. If it works, you're done! 🎉

## 🔄 Step 6: Making Updates

### To update your bot:
1. Make changes to your local files
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```
3. Render will automatically redeploy

### To update bot token:
1. Go to Render dashboard
2. Click your service
3. Go to "Environment" tab
4. Update the `BOT_TOKEN` value
5. Click "Save Changes"
6. Service will restart automatically

## 🛠️ Troubleshooting

### Bot not responding?
1. Check Render logs (click your service → "Logs")
2. Verify bot token is correct
3. Make sure bot is not blocked

### Deployment fails?
1. Check if all files are in GitHub
2. Verify `package.json` is correct
3. Check Render logs for errors

### Bot works locally but not on Render?
1. Make sure you're using environment variables
2. Check if all dependencies are in `package.json`
3. Verify the start command is correct

## 📞 Support

If you get stuck:
1. Check the logs in Render dashboard
2. Make sure all files are properly uploaded to GitHub
3. Verify your bot token is correct
4. Check that your bot isn't blocked in Telegram

## 🎯 Next Steps

Once deployed, you can:
1. Add actual resource links (see `example_resources.js`)
2. Customize the modules and semesters
3. Add more features like user analytics
4. Set up monitoring and alerts

---

**Remember**: Never share your bot token publicly! Always use environment variables for sensitive data.
