# Annotation Management Platform - Frontend

A modern React-based frontend application for managing annotation workflows, built with Vite and Tailwind CSS. This platform provides a comprehensive solution for managing annotators, datasets, and annotation tasks in machine learning projects.

## 📋 Main Repository

This is the frontend repository. The main project repository containing the complete system can be found at:
**[https://github.com/ELhadratiOth/Gestion-Des-Annotateurs](https://github.com/ELhadratiOth/Gestion-Des-Annotateurs)**

## 🚀 Features

### 👥 User Management

- **Multi-role authentication** (Super Admin, Admin, Annotator)
- User registration and login system
- Password reset functionality
- User profile management
- Blacklist management for spam prevention

### 📊 Dashboard & Analytics

- **Admin Dashboard**: Overview of annotators, datasets, and progress
- **Annotator Dashboard**: Personal task overview and statistics
- Real-time progress tracking
- Performance metrics and analytics

### 📄 Dataset Management

- Upload and manage datasets
- Text pair annotation for NLP tasks
- Support for various annotation labels (Entailment, Contradiction, Neutral, etc.)
- Dataset export functionality
- Progress tracking per dataset

### 🏷️ Annotation Workflow

- Interactive text pair annotation interface
- Label management system
- Task assignment and distribution
- Annotation progress monitoring
- Quality control features

### 🤖 Model Training & Testing

- Integrated model training capabilities
- Training parameter configuration (learning rate, epochs, batch size)
- Model testing and evaluation
- Training history and metrics visualization
- Performance reporting

### 📈 Project Management

- Project history tracking
- Team collaboration tools
- Task assignment and monitoring
- Progress visualization

## 🛠️ Technology Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React Context API
- **Graphs**: charts.js

## 📦 Installation

1. **Clone the repository**

   ```powershell
   git clone https://github.com/ELhadratiOth/gestiondesannotateurs-Front
   cd gestiondesannotateurs-Front
   ```

2. **Install dependencies**

   ```powershell
   npm install
   ```

3. **Start development server**

   ```powershell
   npm run dev
   ```

4. **Build for production**
   ```powershell
   npm run build
   ```


## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── pages/          # Page components
│   ├── layouts/        # Layout components
│   └── ui/             # Base UI components
├── context/            # React Context providers
├── lib/                # Utility libraries
├── utils/              # Helper functions
└── assets/             # Static assets
```

## 🎯 Key Components

- **Authentication**: Login, signup, and password reset
- **Dashboards**: Role-based dashboard interfaces
- **Annotation Interface**: Text pair annotation workflow
- **Dataset Management**: Upload, view, and export datasets
- **Model Training**: Configure and train ML models
- **User Management**: Admin tools for managing annotators

## 🚀 Getting Started

1. Ensure you have Node.js (v16+) installed
2. Clone and install dependencies as shown above
3. Configure your backend API endpoint
4. Start the development server
5. Navigate to `http://localhost:5173` in your browser


## 🔗 Related Repositories

- **Main Repository**: [Gestion-Des-Annotateurs](https://github.com/ELhadratiOth/Gestion-Des-Annotateurs)
- **Model Training Repository**: [Gestion-Des-Annotateurs-ML-Training](https://github.com/ELhadratiOth/Gestion-Annotators-ML-Service)