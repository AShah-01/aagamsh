# Backend Setup & Deployment Guide

## Local Development Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Email

Create a `.env` file in the `backend` folder:

```
EMAIL_SERVICE=gmail
EMAIL_USER=aagamshah250506@gmail.com
EMAIL_PASSWORD=your_app_password_here
PORT=3000
NODE_ENV=development
```

**Getting Gmail App Password:**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already done
3. Find "App passwords" (search for it)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password and paste into `.env` as `EMAIL_PASSWORD`

### 3. Start Server Locally

```bash
npm start
```

Server will run on `http://localhost:3000`

### 4. Test Locally

- Open `index.html` in your browser
- Fill out the contact form and submit
- Check your email for the message

---

## Cloud Deployment

### Option 1: Vercel (Recommended - Free & Easy)

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
    - `EMAIL_SERVICE`: gmail
    - `EMAIL_USER`: aagamshah250506@gmail.com
    - `EMAIL_PASSWORD`: your_app_password
5. Deploy
6. Update `window.location.origin` in script.js to use your Vercel domain

### Option 2: Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. ```bash
   heroku login
   heroku create your-app-name
   heroku config:set EMAIL_PASSWORD=your_app_password
   git push heroku main
   ```

### Option 3: AWS, Azure, DigitalOcean

1. Deploy Node.js app to your server
2. Set environment variables on your hosting platform
3. Ensure port 3000 (or specified PORT) is open
4. Update frontend to point to your domain

### Option 4: cPanel/Shared Hosting

If your host supports Node.js:

1. Upload all files
2. Set environment variables in control panel
3. Configure startup script to run `npm start`

---

## Frontend Configuration for Production

When deployed to cloud, the frontend automatically detects:

- **Local**: Uses `http://localhost:3000/api/send-email`
- **Production**: Uses `https://yourdomain.com/api/send-email`

No code changes needed!

---

## Testing Email Setup

1. Fill out contact form with test data
2. Submit and check your inbox
3. Verify subject line includes " - Website"
4. Verify sender (Reply-To) is the contact form email
5. If email doesn't arrive, check spam folder

---

## Troubleshooting

### Email not sending

- Check `EMAIL_PASSWORD` is correct (Gmail App Password, not regular password)
- Verify 2FA is enabled on Gmail account
- Check that `EMAIL_USER` matches your Gmail address
- Look at server console for error messages

### CORS errors in frontend

- Ensure backend is running on correct port
- Check that frontend can reach backend URL

### Server won't start

- Make sure port 3000 is not in use: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)
- Check that `node_modules` is installed: `npm install`

---

## Production Checklist

- [ ] `.env` file created with correct credentials
- [ ] `node_modules` installed
- [ ] Backend tested locally
- [ ] Environment variables set on cloud platform
- [ ] Frontend tested on production domain
- [ ] Email subjects contain " - Website"
- [ ] Spam folder checked for test emails
