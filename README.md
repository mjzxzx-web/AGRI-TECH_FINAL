# Agri-Tech Platform

A MERN stack agricultural management platform for farmers and administrators.

---

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)

---

## Installation

### 1. Backend

```bash
cd backend
npm ci
```

Copy `.env.example` to `.env` and fill in your values:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
```

Start the backend server:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

---

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm ci
npm start
```

Frontend runs on `http://localhost:3000`

---

## First Time Setup

1. Open `http://localhost:3000/register`
2. Fill in your details and set **Account Type** to **Admin**
3. The very first admin is approved automatically — log in right away
4. All farmer accounts and any additional admin accounts need approval from an existing admin before they can log in

---

## Admin Features

After logging in as admin you land on the **Analytics** dashboard. From the sidebar:

| Page | What you can do |
|---|---|
| **Analytics** | Overview of users, farms, crops, orders, revenue and monthly charts |
| **Users** | Approve, ban, unban or delete farmer and admin accounts |
| **Products** | Add, edit and delete marketplace products |
| **Orders** | View all orders and update their status |
| **Bookings** | View all expert consultation bookings and update status |
| **Crops** | View and manage all crops across all farms |
| **Experts** | Manage the list of available agricultural experts |
| **Support** | View and respond to support tickets submitted by farmers |
| **Maintenance** | View system logs and run maintenance tasks (e.g. clear old alerts) |

---

## Farmer Features

After logging in as a farmer you land on the **Dashboard**. From the sidebar:

| Page | What you can do |
|---|---|
| **Dashboard** | Overview of your farm activity, alerts and recent orders |
| **Farm Setup** | Create and manage your farm profile |
| **Crop Management** | Add crops, track growth stages and mark harvests |
| **Harvest History** | View all past harvested crops |
| **Weather** | Check current weather for your farm location |
| **Pest Alerts** | View pest and disease alerts sent by admins |
| **Marketplace** | Browse and purchase agricultural products |
| **My Orders** | Track your order history and statuses |
| **Bookings** | Book consultations with agricultural experts |
| **Expert Consultation** | Browse available experts and their specializations |
| **Forum** | Post questions and discuss topics with other farmers |
| **Support** | Submit a support ticket to the admin team |
| **Profile** | Update your name, email, password or delete your account |

---

## Account Roles

| Role | Access | Approval required |
|---|---|---|
| **Admin** | Full system management | No (first admin) / Yes (subsequent admins) |
| **Farmer** | Farm tools, marketplace, forum | Yes — admin must approve before first login |
