# 🚀 Deployment Guide - AQI Health System

This guide covers multiple deployment options for your Smart AQI Health Impact Analysis System.

---

## 📋 Prerequisites

- Docker & Docker Compose installed
- Domain name (optional, for production)
- Cloud account (AWS, Azure, DigitalOcean, etc.) or VPS

---

## 🎯 Deployment Options

### Option 1: Local Network Deployment (Easiest)

Perfect for testing or internal network use.

```bash
# 1. Navigate to project directory
cd smart-aqi-health-system

# 2. Build and start services
docker-compose up --build -d

# 3. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Access from other devices on your network:**
- Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Access from other devices: `http://YOUR_LOCAL_IP:5173`

---

### Option 2: Cloud VPS Deployment (Recommended)

Deploy to DigitalOcean, AWS EC2, Azure VM, Linode, etc.

#### Step 1: Provision a VPS
- **Minimum specs**: 2 CPU cores, 4GB RAM, 20GB storage
- **OS**: Ubuntu 22.04 LTS (recommended)

#### Step 2: Install Docker on VPS

```bash
# SSH into your VPS
ssh root@YOUR_SERVER_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

#### Step 3: Upload Project to VPS

**Option A: Using Git (Recommended)**
```bash
# On VPS
cd /opt
git clone https://github.com/YOUR_USERNAME/smart-aqi-health-system.git
cd smart-aqi-health-system
```

**Option B: Using SCP**
```bash
# On your local machine
scp -r smart-aqi-health-system root@YOUR_SERVER_IP:/opt/
```

#### Step 4: Configure for Production

```bash
# Edit docker-compose.yml
nano docker-compose.yml
```

Update the CORS_ORIGINS to include your domain:
```yaml
environment:
  - CORS_ORIGINS=http://YOUR_DOMAIN.com,https://YOUR_DOMAIN.com,http://YOUR_SERVER_IP:5173
```

#### Step 5: Deploy

```bash
# Build and start
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step 6: Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5173/tcp
sudo ufw allow 8000/tcp
sudo ufw enable
```

**Access your app:**
- Frontend: `http://YOUR_SERVER_IP:5173`
- Backend: `http://YOUR_SERVER_IP:8000`

---

### Option 3: Production with Domain & SSL (Professional)

Add a custom domain and HTTPS encryption.

#### Step 1: Point Domain to Server
- Go to your domain registrar (Namecheap, GoDaddy, etc.)
- Add an A record pointing to your server IP:
  ```
  Type: A
  Name: @
  Value: YOUR_SERVER_IP
  TTL: 3600
  ```

#### Step 2: Install Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/aqi-system
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket for real-time updates
    location /ws {
        proxy_pass http://localhost:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/aqi-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 3: Install SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com

# Follow prompts and choose redirect HTTP to HTTPS
```

Certbot will automatically:
- Obtain SSL certificate
- Configure Nginx for HTTPS
- Set up auto-renewal

**Access your app securely:**
- `https://YOUR_DOMAIN.com` ✅

---

### Option 4: Deploy to Cloud Platforms

#### A. **Heroku** (Easiest Cloud Platform)

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create apps
heroku create your-aqi-backend
heroku create your-aqi-frontend

# Deploy backend
cd backend
git init
heroku git:remote -a your-aqi-backend
git add .
git commit -m "Deploy backend"
git push heroku main

# Deploy frontend (similar process)
```

#### B. **AWS (EC2 + RDS)**

1. Launch EC2 instance (t3.medium recommended)
2. Follow VPS deployment steps above
3. Optional: Use RDS for database if you add one later
4. Use Elastic IP for static IP address
5. Configure Security Groups for ports 80, 443, 22

#### C. **DigitalOcean App Platform**

1. Connect your GitHub repository
2. Create new app from repo
3. Configure build settings:
   - Backend: Dockerfile in `/backend`
   - Frontend: Dockerfile in `/frontend`
4. Set environment variables
5. Deploy with one click

#### D. **Vercel (Frontend) + Railway (Backend)**

**Frontend on Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
```

**Backend on Railway:**
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Add environment variables
5. Deploy

---

## 🔧 Production Configuration Checklist

### Backend Environment Variables

Update `docker-compose.yml` or create `.env` file:

```env
# CORS - Add your production domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
API_KEY_HEADER=X-API-Key
SECRET_KEY=your-super-secret-key-change-this

# Performance
CACHE_TTL_SECONDS=300
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60

# Paths
DATASET_PATH=/app/dataset.csv
MODELS_DIR=/app/models
LOGS_DIR=/app/logs
```

### Frontend Configuration

Update `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://yourdomain.com/api/v1
VITE_WS_URL=wss://yourdomain.com/ws
```

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update and redeploy
git pull
docker-compose up --build -d
```

### Monitor Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check Docker resource usage
docker stats
```

### Backup Important Data

```bash
# Backup models and logs
docker run --rm -v aqi_models:/data -v $(pwd):/backup ubuntu tar czf /backup/models-backup.tar.gz /data
docker run --rm -v aqi_logs:/data -v $(pwd):/backup ubuntu tar czf /backup/logs-backup.tar.gz /data
```

---

## 🔒 Security Best Practices

1. **Change default credentials** in the app
2. **Use environment variables** for secrets (never commit them)
3. **Enable firewall** (ufw on Ubuntu)
4. **Keep system updated**: `sudo apt update && sudo apt upgrade`
5. **Use SSL/HTTPS** in production
6. **Regular backups** of models and data
7. **Monitor logs** for suspicious activity
8. **Rate limiting** is already configured in backend

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Check CORS settings:**
```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Add your frontend URL to CORS_ORIGINS
environment:
  - CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Port already in use

```bash
# Find process using port
sudo lsof -i :5173
sudo lsof -i :8000

# Kill process
sudo kill -9 PID
```

### Docker build fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### SSL certificate renewal fails

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

---

## 📱 Mobile Access

Your app is already responsive! Access from mobile browsers:
- `https://yourdomain.com` (if deployed with domain)
- `http://YOUR_SERVER_IP:5173` (if using IP)

---

## 💰 Cost Estimates

### Free Options
- **Heroku Free Tier**: $0 (limited hours)
- **Vercel + Railway Free**: $0 (with limits)
- **Oracle Cloud Free Tier**: $0 forever (1-2 VMs)

### Paid Options
- **DigitalOcean Droplet**: $6-12/month (2GB-4GB RAM)
- **AWS EC2 t3.small**: ~$15/month
- **Linode**: $10-20/month
- **Domain**: $10-15/year

---

## 🎉 Quick Deploy Commands

```bash
# Clone and deploy in one go
git clone YOUR_REPO_URL
cd smart-aqi-health-system
docker-compose up --build -d

# Check it's running
curl http://localhost:8000/api/v1/aqi/live
curl http://localhost:5173
```

---

## 📞 Need Help?

- Check logs: `docker-compose logs -f`
- API documentation: `http://YOUR_SERVER:8000/docs`
- Test backend health: `http://YOUR_SERVER:8000/api/v1/aqi/live`

---

**Your app is production-ready! Choose the deployment option that fits your needs and budget.** 🚀
