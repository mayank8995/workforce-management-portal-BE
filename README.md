# Workforce Management Portal

A production-style **Workforce Management Portal** built to demonstrate scalable frontend architecture, reusable UI components, server-state management, data-heavy interfaces, and real-world application patterns.

The project focuses on building an workforce management dashboard similar to applications used for managing employees, projects, users, analytics, and other business data.

## 🚀 Features

* 📊 Dashboard with analytics and key metrics
* 👥 Employee/User management
* 🔍 Dynamic search and filtering
* 📄 Server-side pagination
* ☑️ Row selection and bulk actions
* 📤 Bulk data export
* 📋 Reusable data table
* 🎨 Reusable UI components
* ⚡ API data fetching and caching
* 🔄 Loading, error and empty states
* 🧩 Dynamic column configuration
* 📱 Responsive UI
* 🚨 Global error handling
* 🔐 Route-based application structure
* Role-based access control
* Production database integration
* Audit logs

## 🛠️ Tech Stack

* **React**
* **TypeScript**
* **React Router**
* **TanStack Query / React Query**
* **Tailwind CSS**
* **Node.js**
* **Express.js**
* **REST APIs**
* **mongodb**

## 🏗️ Architecture

The application follows a modular frontend architecture:

```text
UI
 ↓
Reusable Components
 ↓
Feature Modules
 ↓
API / Query Layer
 ↓
Backend API
 ↓
Database
```

The goal is to keep UI components independent from API implementation and make commonly used functionality reusable across different screens.

## 🧠 Important Engineering Decisions

### Reusable Data Table

The table is designed around configuration rather than hardcoded columns.

```js
const columns = [
  {
    key: "name",
    header: "Name",
  },
  {
    key: "department",
    header: "Department",
  },
  {
    key: "status",
    header: "Status",
    render: (value) => <StatusBadge value={value} />,
  },
];
```

This allows the same table component to support different datasets and custom cell rendering.

### Server-Side Pagination

Pagination is handled through the API instead of loading the entire dataset into the browser.

```text
User changes page
      ↓
Query parameters change
      ↓
API request
      ↓
Server returns required page
      ↓
Table updates
```

This approach scales better for large datasets.

### Server State Management

API data is managed separately from local UI state.

```text
Server State
    ↓
TanStack Query
    ↓
Caching / Refetching / Loading / Error
    ↓
Components
```

This avoids unnecessary API calls and keeps multiple components synchronized with the same server data.

## ⚡ UX Considerations

The application handles common real-world states:

* Loading → Skeleton UI
* API error → Error UI
* Empty response → Empty state
* Slow network → Loading indicators
* Pagination → Preserve relevant UI state
* Large datasets → Server-side pagination

## 📊 Dashboard

The dashboard provides an overview of important business metrics such as:

* Total employees
* Active employees
* Projects
* Top performers
* Performance metrics

## 🔮 Future Improvements
* Advanced analytics
* Real-time notifications
* Virtualized tables for very large datasets
* Automated testing
* CI/CD pipeline

## 🎯 Why I Built This

This project is focused on solving problems commonly encountered while building real-world frontend applications:

* How to design reusable components
* How to manage server state
* How to build scalable data tables
* How to handle large datasets
* How to synchronize data across components
* How to design loading/error/empty states
* How to structure a growing React application

## 📌 Status

🚧 **Actively under development**

New features and improvements are continuously being added as the application evolves toward a production-grade workforce management platform.

## 👨‍💻 Author

**Mayank Gupta**

---
## Workforce Management Portal backend

Workforce management portal backend
Front-end: https://github.com/mayank8995/workforce-management-portal

⭐ If you find this project useful, consider giving it a star.
