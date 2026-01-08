# Beginner's Guide to Deploying on Plesk

Since you are new to Plesk and Debian, don't worry! Plesk is designed precisely so you **don't** have to be a Linux expert. Think of it as a "Windows Desktop" for your server.

## Step 0: Log in to Plesk
1. Open your browser and go to: `https://YOUR_VPS_IP:8443`
2. Log in with the username/password Strato sent you.

---

## Step 1: Create the Database (The GUI Way)
1. Go to **Databases** (sidebar) -> **Add Database**.
2. **Database name**: `veiling_db`
3. **Database server**: Select PostgreSQL (if available) or MySQL. (If Postgres isn't installed, you might need to use Docker for it - see below).
4. **Create a user**: `veiling_user` with a strong password.
5. **Write these down!** You'll need them for the "Connection String".

---

## Step 2: Add your "Magic Domain"
1. Go to **Websites & Domains** -> **Add Domain**.
2. **Domain name**: Use your sslip domain: `1-2-3-4.sslip.io` (Replace 1-2-3-4 with your actual IP digits, separated by dashes).
3. **SSL/TLS Support**: Check the box for "Let's Encrypt". 
4. Click **Add Domain**. It will take a minute.
5. Once it's created, click on **SSL/TLS Certificates** and make sure it's "Secured".

---

## Step 3: Run the Backend (Docker)
1. In the sidebar, click **Docker**. (If you don't see it, ask Strato to enable the Docker extension).
2. Search for `mcr.microsoft.com/dotnet/aspnet:9.0-alpine` (or better yet, your own image if you pushed it to Docker Hub).
3. **Settings to change**:
   - **Automatic Start**: Enable.
   - **Environment Variables**: Add these (Click "Add Variable"):
     - `ASPNETCORE_URLS`: `http://+:8080`
     - `ConnectionStrings__DefaultConnection`: `Host=localhost;Database=veiling_db;Username=veiling_user;Password=your_password`
     - `Jwt__Key`: `A_VERY_LONG_RANDOM_STRING_12345!`
   - **Port Mapping**: Map container port `8080` to host port `5000`.

---

## Step 4: Link the Domain to Docker (Docker Proxy)
1. Go back to **Websites & Domains** -> **[your sslip domain]**.
2. Look for **Docker Proxy** or **Apache/Nginx Settings**.
3. You want to point all traffic from the domain to `http://localhost:5000`.
4. In **Additional Nginx Directives**, paste this:
```nginx
location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

---

## Step 5: Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and link your GitHub repo.
2. Select the `frontend` folder.
3. Add an Environment Variable: 
   - `NEXT_PUBLIC_BACKEND_LINK`: `https://1-2-3-4.sslip.io`
4. Deploy!

### Why this is cool:
Even though you don't have a domain, Vercel gives you a free `.vercel.app` address, and Plesk gives you a free `.sslip.io` address. Both have SSL, so they can talk to each other!
