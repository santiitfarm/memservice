# MEM Service 🏥💊

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.memservicebd.com)](https://www.memservicebd.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-blue)](https://nextjs.org)

## 📝 Project Description

MEM Service is a comprehensive medical and pharmacy platform designed specifically for Bangladesh. Our mission is to revolutionize healthcare access by connecting patients with medical professionals and providing an intuitive platform for pharmaceutical services.

## 🌟 Key Features

- 👨‍⚕️ **Online Doctor Consultations**
  Connect with licensed medical professionals remotely, reducing wait times and improving healthcare accessibility.

- 💊 **Pharmacy Product Catalog**
  Browse, search, and order medical and pharmaceutical products with ease and convenience.

- 🏥 **Medical Services Booking**
  Schedule appointments, consultations, and medical services seamlessly through our platform.

- 📱 **Responsive Design**
  Fully responsive interface that works flawlessly across mobile, tablet, and desktop devices.

- 🌐 **Multi-language Support**
  Available in both Bengali and English to cater to a diverse user base.

## 🛠️ Tech Stack

- **Frontend Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **Database:** MongoDB
- **Authentication:** NextAuth.js
- **State Management:** React Context API
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or Yarn
- MongoDB instance

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Soab42/memservice.git
   cd memservice
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables
   Create a `.env.local` file and add the following:

   ```
   API_URI=your_api_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Run the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🤝 Contributing

### Branching Strategy

We follow a structured branching model to maintain code quality and facilitate collaboration:

#### Main Branches

- `main`: Production-ready code
- `develop`: Integration branch for features

#### Branch Types

1. **Feature Branches**

   - Naming: `feature/descriptive-feature-name`
   - Examples:
     - `feature/user-authentication`
     - `feature/shopping-cart`
     - `feature/responsive-design`

2. **Fix Branches**

   - Naming: `fix/descriptive-fix-name`
   - Examples:
     - `fix/login-button-alignment`
     - `fix/database-connection-timeout`

3. **Hotfix Branches**

   - Naming: `hotfix/descriptive-hotfix-name`
   - Examples:
     - `hotfix/security-vulnerability-patch`
     - `hotfix/critical-performance-issue`

4. **Release Branches**
   - Naming: `release/version-number`
   - Examples:
     - `release/1.2.0`
     - `release/2.0.1`

### Contribution Process

1. **Prepare Your Environment**

   ```bash
   # Switch to develop branch and pull latest changes
   git checkout develop
   git pull origin develop

   # Create a new feature branch
   git checkout -b feature/your-feature-name
   ```

2. **Work on Your Feature**

   - Make small, focused commits
   - Write clear, descriptive commit messages
   - Ensure code follows project standards

   - **Create a Descriptive Branch**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-authentication
   ```

   - **Make Focused, Incremental Commits**

   ```bash
   # Work on your feature
   git add .
   git commit -m "feat(auth): add login form component"

   # Additional work
   git add .
   git commit -m "feat(auth): integrate NextAuth.js"
   ```

   - **Push Your Changes**

   ```bash
   git push -u origin feature/your-feature-name
   ```

3. **Create a Pull Request**

   **Open Pull Request on GitHub**

   - Base branch: `develop`
   - Compare branch: `feature/user-authentication`
   - Fill out the pull request template
   - Request reviews from team members

### Best Practices

- Keep branch names lowercase with hyphens
- Use descriptive names that indicate the branch's purpose
- Include issue/ticket numbers when applicable
- Delete branches after merging
- Regularly update feature branches from `develop`
- Always use Pull Requests for code review

## Git Workflow: Commits and Pull Requests

## 📝 Commit Message Best Practices

### Types of Commits

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

### Example Commit Messages

1. **Adding a New Feature**

   ```bash
   git commit -m "feat(authentication): implement user login functionality

   - Add login form component
   - Integrate NextAuth.js for authentication
   - Create protected routes for authenticated users

   Resolves #123"
   ```

2. **Fixing a Bug**

   ```bash
   git commit -m "fix(database): resolve connection timeout issue

   - Update MongoDB connection settings
   - Add more robust error handling
   - Implement connection retry mechanism

   Closes #456"
   ```

3. **Documentation Update**

   ```bash
   git commit -m "docs(readme): update contribution guidelines

   - Add detailed branching strategy
   - Include commit message best practices
   - Clarify pull request process"
   ```

## 🚀 Pull Request Workflow

### Pull Request Template

```markdown
## Description

[Provide a clear, concise description of the changes]

### Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

### How Has This Been Tested?

[Describe the tests that you ran to verify your changes]

### Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works

### Additional Context

[Add any other context about the pull request here]
```

This approach ensures clean, trackable, and collaborative development.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/Soab42/memservice](https://github.com/Soab42/memservice)

Website: [MEM Service](https://www.memservicebd.com)

---

**Developed with ❤️ for Healthcare in Bangladesh**
