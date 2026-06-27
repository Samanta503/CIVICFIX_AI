https://civicfix-ai-hujm.vercel.app
🚀 Introducing CivicFix AI — An AI-Assisted Citizen Complaint & Civic Workflow Management Platform 🏙️🤖

Alhamdulillah, I’m excited to share **CivicFix AI**, a full-stack civic complaint management system built to help citizens report city problems and help authorities manage, assign, monitor, and resolve complaints more efficiently.

🏛️ **What is CivicFix AI?**

CivicFix AI is a modern web-based platform where citizens can submit civic issues such as road damage, garbage dumping, water leakage, broken streetlights, drainage problems, and public safety concerns. The system then helps admins, departments, and officers manage the full complaint lifecycle through role-based dashboards, SLA tracking, notifications, feedback, and AI-assisted analysis.

✨ **Features at a Glance:**

👤 **Role-Based Authentication**
• Secure login and registration
• Separate dashboards for Citizen, Officer, Department Admin, and Super Admin
• Role-based protected routes and access control
• Demo accounts for testing each role

📢 **Citizen Complaint Submission**
• Citizens can submit complaints with title, description, category, department, zone, priority, address, and media
• Complaint tracking with complaint number
• Public complaint visibility
• Citizen dashboard for personal complaint history
• Feedback system after complaint resolution

🛠️ **Admin Complaint Management**
• Super Admin can monitor all complaints city-wide
• Advanced filtering by status, priority, department, zone, and date
• Complaint details with full workflow history
• Department and category management
• User and officer management

🏢 **Department & Officer Workflow**
• Department Admin can view department-specific complaints
• Assign complaints to officers
• Officers can view assigned complaints
• Officers can update complaint status
• Full status history tracking

⏰ **SLA & Escalation System**
• SLA rules based on complaint category and priority
• Overdue complaint detection
• SLA alert dashboard
• Manual escalation system
• Escalation resolution tracking

🔔 **Notification System**
• User-specific notifications
• Latest notifications API
• Unread notification count
• Mark notification as read
• Admin notification management

⭐ **Citizen Feedback & Analytics**
• Citizens can submit feedback for resolved complaints
• Admin can monitor feedback analytics
• Average rating and low-rating complaint insights
• Helps improve service quality

🤖 **AI-Assisted Complaint Classifier**
• Predicts complaint category
• Predicts responsible department
• Predicts complaint priority
• Generates confidence score
• Saves AI prediction history
• Admin can review AI predictions

🔁 **AI Duplicate Complaint Detection**
• Detects possible duplicate complaints
• Uses text, category, and location-based similarity
• Suggests matched complaints with similarity score
• Admin can confirm, reject, or ignore duplicate suggestions
• Citizen can see duplicate complaint notice when confirmed

🖼️ **AI Image Analysis**
• Analyzes uploaded complaint media
• Detects possible issue type from complaint context and image metadata
• Estimates visual severity
• Flags critical image findings
• Admin can review image analysis results

📊 **AI Insights & Hotspot Map**
• City-wide complaint overview
• High-risk and overdue complaint insights
• Zone-wise hotspot detection
• Complaint location visualization
• AI alerts and recommendations
• Department, category, priority, and SLA summaries

📈 **AI Logs & Confidence Monitoring**
• Tracks AI classifier, duplicate detection, and image analysis logs
• Shows low, medium, and high-confidence AI outputs
• AI feature health monitoring
• Review queue for pending AI results
• Model summary and AI activity logs
• Foundation for future MLOps monitoring

🚀 **Deployment Readiness System**
• Checks APP_KEY, APP_DEBUG, APP_URL, database, storage, cache, queue, mail, and AI tables
• Shows deployment readiness score
• Production command checklist
• Helps verify whether the system is ready for deployment

🌐 **Deployment Architecture**
• Frontend deployed on Vercel
• Laravel backend deployed on Render
• MySQL database deployed on Railway
• Production API connected with live frontend
• Seeded production database with roles, departments, zones, categories, and SLA rules

🛠️ **Built With:**
Next.js • TypeScript • Tailwind CSS • Laravel • MySQL • Railway • Render • Vercel • REST API • Laravel Sanctum • Role-Based Access Control • Docker • AI-Assisted Rule-Based Logic

🔮 **Future ML/DL Implementation Plan**

The current AI system is rule-based and analytics-driven, but it has been designed to become fully ML/DL-ready. The next phase will introduce a separate Python FastAPI AI service connected with Laravel.

Planned ML/DL upgrades:

🧠 **ML Complaint Classification**
• Train a TF-IDF + Logistic Regression model first
• Predict complaint category, department, and priority
• Later upgrade to Bangla/English transformer-based models

🔁 **ML Duplicate Detection**
• Use sentence embeddings and cosine similarity
• Compare complaint text, category, and location
• Store complaint embeddings for faster duplicate search
• Later upgrade with vector database support

🖼️ **Deep Learning Image Analysis**
• Train image classifier for road damage, garbage, waterlogging, broken streetlight, fallen tree, and other issues
• Use transfer learning with CNN-based models
• Later upgrade to object detection models for potholes, garbage, and damaged infrastructure

⏰ **SLA Breach Prediction**
• Predict whether a complaint may become overdue
• Use features like category, priority, department, zone, officer workload, and resolution history
• Help admins take action before SLA violation happens

📊 **MLOps & Model Monitoring**
• Track model version
• Track prediction confidence
• Track fallback usage
• Track admin corrections
• Monitor accuracy, low-confidence rate, and rejection rate
• Improve model performance using real production data

🎯 **Goal of CivicFix AI**

The goal of CivicFix AI is to make civic complaint reporting and resolution smarter, faster, more transparent, and more accountable by combining workflow automation, role-based management, analytics, and future-ready AI/ML capabilities.

🔗 Live Frontend: https://civicfix-ai-hujm.vercel.app
🔗 Backend API: https://civicfix-ai-backend.onrender.com

This project is now deployed and working successfully, and the next milestone is upgrading the current AI-assisted system into a real ML/DL-powered civic intelligence platform.
