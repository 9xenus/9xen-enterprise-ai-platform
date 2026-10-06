# Node.js Environment Deployment & Hosting Guide (Node.js হোস্টিং গাইড)

এই নির্দেশিকায় 9xen ওয়েব অ্যাপ্লিকেশনটি যেকোনো লিনাক্স/উবুন্টু সার্ভার (Ubuntu / Debian VPS, DigitalOcean, Linode, AWS EC2) অথবা কাস্টম Node.js এনভায়রনমেন্টে হোস্ট করার সম্পূর্ণ পদ্ধতি তুলে ধরা হয়েছে।

---

## ১. সার্ভার প্রস্তুতি (Ubuntu / Debian Server Setup)

প্রথমে আপনার সার্ভারে SSH দিয়ে লগইন করে সিস্টেম প্যাকেজ ও প্রয়োজনীয় সফটওয়্যার ইনস্টল করুন:

```bash
# ১. সার্ভার প্যাকেজ আপডেট
sudo apt update && sudo apt upgrade -y

# ২. Node.js LTS (v20 বা v22) ইনস্টল
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# ৩. Node ও npm ভার্সন নিশ্চিতকরণ
node -v
npm -v

# ৪. প্রসেস ম্যানেজার PM2 ইনস্টল
sudo npm install -g pm2
```

---

## ২. প্রজেক্ট ফাইল ডাউনলোড বা ক্লোন

সার্ভারের `/var/www/` ফোল্ডারে প্রজেক্টটি সেটআপ করুন:

```bash
cd /var/www

# GitHub বা Git রিপোজিটরি থেকে ক্লোন করুন:
git clone <YOUR_GIT_REPOSITORY_URL> 9xen-app
cd 9xen-app

# সব প্যাকেজ/ডিপেন্ডেন্সি ইনস্টল করুন:
npm install
```

---

## ৩. এনভায়রনমেন্ট ভেরিয়েবল কনফিগারেশন (.env)

প্রজেক্ট রুট ডিরেক্টরিতে `.env` ফাইল তৈরি করুন:

```bash
nano .env
```

নিচের কনফিগারেশনটি দিন:

```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

*(সংরক্ষণ করতে `Ctrl + O` তারপর `Enter`, বের হতে `Ctrl + X` চাপুন)*

---

## ৪. প্রজেক্ট কম্পাইল ও বিল্ড (Production Build)

প্রোডাকশনের জন্য স্ট্যাটিক ফ্রন্টএন্ড এবং ব্যাকএন্ড এক্সপ্রেস সার্ভার বিল্ড করুন:

```bash
npm run build
```

**বিল্ডের ফলাফল:**
- ফ্রন্টএন্ড স্ট্যাটিক ফাইলগুলো `dist/` ফোল্ডারে প্রস্তুত হবে।
- ব্যাকএন্ড সার্ভার স্ক্রিপ্ট `dist/server.cjs` তৈরি হবে।

---

## ৫. PM2 দিয়ে সার্ভার ২৪/৭ ব্যাকগ্রাউন্ডে চালু রাখা

সার্ভার ক্র্যাশ বা রিবুট হলেও যেন আপনার অ্যাপটি সার্বক্ষণিক সচল থাকে:

```bash
# PM2 দিয়ে অ্যাপ রান করুন
pm2 start dist/server.cjs --name "9xen-app"

# সার্ভার রিস্টার্টে অটো-রান কনফিগারেশন
pm2 startup
pm2 save

# চলমান স্ট্যাটাস ও লগ দেখার কমান্ড:
pm2 status
pm2 logs 9xen-app
```

---

## ৬. Nginx রিভার্স প্রক্সি কনফিগারেশন (Domain Setup)

ওয়েবসাইটকে আপনার কাস্টম ডোমেনে প্রদর্শন করতে Nginx কনফিগারেশন ফাইল তৈরি করুন:

```bash
sudo nano /etc/nginx/sites-available/9xen-app
```

নিচের ব্লকটি পেস্ট করুন (আপনার ডোমেনের নাম দিয়ে `yourdomain.com` প্রতিস্থাপন করুন):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

কনফিগারেশন সক্রিয় করুন:

```bash
sudo ln -s /etc/nginx/sites-available/9xen-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ৭. ফ্রি SSL সার্টিফিকেট (HTTPS) সেটআপ

Let's Encrypt / Certbot দিয়ে ফ্রি SSL ইনস্টল করুন:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

সার্টিফিকেট রিনিউয়াল টেস্ট করতে:
```bash
sudo certbot renew --dry-run
```

---

## ৮. পরবর্তীতে কোড আপডেট করার নিয়ম (Deployment Updates)

ভবিষ্যতে প্রোজেক্টে নতুন পরিবর্তন পুশ করার পর সার্ভারে তা কার্যকর করতে:

```bash
cd /var/www/9xen-app
git pull origin main
npm install
npm run build
pm2 restart 9xen-app
```

---

## ৯. দরকারী কমান্ডস (Troubleshooting & Quick Commands)

| কমান্ড | কাজ |
|---|---|
| `pm2 status` | অ্যাপ চলছে কিনা তার স্ট্যাটাস দেখতে |
| `pm2 logs 9xen-app` | লাইভ ব্যাকএন্ড ও এরর লগ দেখতে |
| `pm2 restart 9xen-app` | অ্যাপটি পুনরায় চালু করতে |
| `sudo systemctl status nginx` | Nginx ওয়েব সার্ভারের অবস্থা দেখতে |
| `sudo nginx -t` | Nginx কনফিগারেশনে ভুল আছে কিনা পরীক্ষা করতে |
