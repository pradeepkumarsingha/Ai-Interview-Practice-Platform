const mockQuestions = {
  python: {
    technical: [
      "What is the difference between list and tuple in Python?",
      "Explain decorators in Python.",
      "What are generators and how do they work?",
      "How does Python handle memory management?",
      "Explain shallow copy vs deep copy in Python.",
      "What is the Global Interpreter Lock and how can it affect performance?",
      "How do list comprehensions differ from generator expressions?",
      "Explain exception handling best practices in Python.",
      "What are context managers and when would you use them?",
      "How do you structure a production-ready Python project?"
    ],
    coding: [
      "Write a function to reverse a string without using built-in reverse methods.",
      "Find duplicate elements in an array and return them.",
      "Write a function to check if two strings are anagrams.",
      "Implement a frequency counter for words in a paragraph.",
      "Write a function to flatten a nested list.",
      "Find the second largest number in a list.",
      "Implement binary search in Python.",
      "Write a function to merge two sorted lists."
    ],
    behavioral: [
      "Tell me about a challenging Python project you solved.",
      "How do you debug complex Python code?",
      "Describe a time you improved the performance of a script.",
      "How do you ensure code readability in a Python team project?",
      "Tell me about a bug that taught you an important lesson."
    ]
  },

  java: {
    technical: [
      "Explain the four OOP principles in Java.",
      "What is the difference between HashMap and Hashtable?",
      "What is the JVM and how does garbage collection work?",
      "Explain method overloading vs method overriding.",
      "What is the difference between an interface and an abstract class?",
      "How does exception handling work in Java?",
      "Explain Java collections and when to use List, Set, and Map.",
      "What are threads and how do you handle concurrency in Java?",
      "Explain final, finally, and finalize.",
      "What is dependency injection and why is it useful?"
    ],
    coding: [
      "Reverse a string without using built-in reverse methods.",
      "Find the first non-repeating character in a string.",
      "Write a method to detect a palindrome.",
      "Implement a simple stack using arrays.",
      "Find duplicate values in an integer array.",
      "Write code to sort a list of objects by a field.",
      "Implement binary search in Java.",
      "Write a function to count vowels in a string."
    ],
    behavioral: [
      "Describe a challenging Java project you worked on.",
      "How do you handle code reviews and feedback?",
      "Tell me about a time you refactored legacy Java code.",
      "How do you debug a production issue in a Java application?",
      "Describe how you learned a new framework under time pressure."
    ]
  },

  frontend: {
    technical: [
      "Explain the Virtual DOM in React and how it improves performance.",
      "What are CSS Grid and Flexbox? When would you use each?",
      "Explain event delegation and how it works in browsers.",
      "What is the difference between controlled and uncontrolled components?",
      "How do React hooks work and what problems do they solve?",
      "Explain useEffect dependencies and common mistakes.",
      "How do you optimize rendering performance in React?",
      "What is accessibility and how do you make forms accessible?",
      "Explain client-side routing and lazy loading.",
      "How do you manage global state in a frontend application?"
    ],
    coding: [
      "Write a React hook to fetch data on component mount.",
      "Create a debounce function to handle API calls.",
      "Build a reusable input component with validation.",
      "Implement a responsive navigation menu.",
      "Create a paginated list component.",
      "Write a function to filter and sort search results.",
      "Implement a modal component with keyboard close support.",
      "Build a simple tab component."
    ],
    behavioral: [
      "Describe a responsive design project you built.",
      "How do you approach performance optimization?",
      "Tell me about a time you improved user experience based on feedback.",
      "How do you collaborate with designers?",
      "Describe a difficult browser compatibility issue you solved."
    ]
  },

  react: {
    technical: [
      "Explain the difference between props and state in React.",
      "What are React hooks and why were they introduced?",
      "How does reconciliation work in React?",
      "Explain useMemo and useCallback with examples.",
      "What causes unnecessary re-renders and how do you prevent them?",
      "How do error boundaries work?",
      "Explain React context and when not to use it.",
      "How do you test React components?",
      "What is code splitting in React?",
      "How do you handle forms in React?"
    ],
    coding: [
      "Create a reusable Button component with loading and disabled states.",
      "Build a todo list with add, delete, and complete actions.",
      "Write a custom hook for localStorage state.",
      "Create a search filter component.",
      "Implement infinite scroll for a list.",
      "Build a controlled form with validation errors.",
      "Create a reusable modal component.",
      "Write a component that fetches and displays API data."
    ],
    behavioral: [
      "Tell me about a React feature you built end-to-end.",
      "How do you debug state-related UI bugs?",
      "Describe a time you reduced component complexity.",
      "How do you balance reusable components with delivery speed?",
      "Tell me about a performance issue you fixed in React."
    ]
  },

  backend: {
    technical: [
      "Explain REST API principles and HTTP methods.",
      "What is the difference between SQL and NoSQL databases?",
      "How do you implement authentication and authorization?",
      "Explain stateless APIs and why they matter.",
      "How do you design pagination, filtering, and sorting in APIs?",
      "What are indexes and how do they affect database performance?",
      "Explain rate limiting and why it is important.",
      "How do you handle file uploads securely?",
      "What is caching and where would you use it?",
      "How do you structure error handling in backend services?"
    ],
    coding: [
      "Design a database schema for a social media platform.",
      "Write an API endpoint that handles pagination.",
      "Implement JWT authentication flow.",
      "Write a function to validate and sanitize user input.",
      "Create an endpoint to upload and retrieve files.",
      "Design a schema for interview sessions and feedback.",
      "Write middleware for role-based authorization.",
      "Implement a search endpoint with query filters."
    ],
    behavioral: [
      "Describe a backend system you designed from scratch.",
      "How do you handle database scaling?",
      "Tell me about a production incident you resolved.",
      "How do you communicate API contract changes to frontend developers?",
      "Describe how you balance security and development speed."
    ]
  },

  node: {
    technical: [
      "Explain the Node.js event loop.",
      "What is the difference between synchronous and asynchronous code in Node.js?",
      "How do streams work in Node.js?",
      "Explain middleware in Express.",
      "How do you handle errors in async Express routes?",
      "What is clustering in Node.js?",
      "How do you secure an Express API?",
      "Explain CommonJS vs ES modules.",
      "How do you manage environment variables?",
      "How do you debug memory leaks in Node.js?"
    ],
    coding: [
      "Create an Express route with validation and error handling.",
      "Write middleware that checks JWT authentication.",
      "Implement a file upload endpoint using multer.",
      "Create a REST endpoint for CRUD operations.",
      "Write a utility to retry failed async operations.",
      "Implement request rate limiting logic.",
      "Build an endpoint that aggregates data from MongoDB.",
      "Write a function to parse and normalize query parameters."
    ],
    behavioral: [
      "Describe a Node.js API you built.",
      "How do you handle unexpected production errors?",
      "Tell me about a time you improved backend response time.",
      "How do you document APIs for a team?",
      "Describe how you test backend services."
    ]
  },

  "machine learning": {
    technical: [
      "Explain supervised, unsupervised, and reinforcement learning.",
      "What is the difference between classification and regression?",
      "Explain bias, variance, and the bias-variance tradeoff.",
      "What is overfitting and how do you prevent it?",
      "How do train, validation, and test sets differ?",
      "Explain precision, recall, F1 score, and accuracy.",
      "What is cross-validation and why is it useful?",
      "How do you handle missing values in a dataset?",
      "What is feature engineering and why does it matter?",
      "Explain normalization vs standardization.",
      "How does logistic regression work?",
      "What is a decision tree and how can it overfit?",
      "Explain random forest and why it improves over a single tree.",
      "What is gradient descent?",
      "How do you choose an evaluation metric for an ML problem?"
    ],
    coding: [
      "Build a simple train-test split workflow for a classification model.",
      "Write code to normalize numerical columns in a dataset.",
      "Implement a confusion matrix calculation.",
      "Write pseudocode for training and evaluating a model.",
      "Create a function to handle missing numerical values with mean imputation.",
      "Write code to calculate accuracy from predictions and labels.",
      "Build a simple pipeline for preprocessing and model training.",
      "Write a function to detect outliers using the IQR method."
    ],
    behavioral: [
      "Describe a machine learning project you worked on end-to-end.",
      "How do you explain model results to non-technical stakeholders?",
      "Tell me about a time your model performed poorly and how you improved it.",
      "How do you decide whether ML is the right solution for a problem?",
      "Describe how you handle unclear or messy data requirements."
    ]
  },

  ml: {
    technical: [
      "Explain supervised, unsupervised, and reinforcement learning.",
      "What is overfitting and how do you prevent it?",
      "Explain precision, recall, F1 score, and accuracy.",
      "What is feature engineering and why does it matter?",
      "How does logistic regression work?",
      "Explain random forest and why it improves over a single tree.",
      "What is gradient descent?",
      "How do you choose an evaluation metric for an ML problem?"
    ],
    coding: [
      "Build a simple train-test split workflow for a classification model.",
      "Write code to normalize numerical columns in a dataset.",
      "Implement a confusion matrix calculation.",
      "Write code to calculate accuracy from predictions and labels."
    ],
    behavioral: [
      "Describe a machine learning project you worked on end-to-end.",
      "How do you explain model results to non-technical stakeholders?",
      "Tell me about a time your model performed poorly and how you improved it."
    ]
  },

  ai: {
    technical: [
      "What is artificial intelligence and how is it different from machine learning?",
      "Explain generative AI in simple terms.",
      "What are embeddings and why are they useful?",
      "How does prompt engineering affect model output?",
      "What are hallucinations in AI systems?",
      "How do you evaluate an AI-powered feature?",
      "What is retrieval augmented generation?",
      "How do you handle privacy and safety in AI applications?",
      "Explain the difference between training and inference.",
      "What are common risks when deploying AI systems?"
    ],
    coding: [
      "Design pseudocode for a chatbot that retrieves context before answering.",
      "Write a function to rank search results by similarity score.",
      "Create a basic prompt template for structured output.",
      "Build a simple validation layer for AI-generated JSON.",
      "Write logic to fall back when an AI service fails."
    ],
    behavioral: [
      "Describe an AI feature you would build for students.",
      "How do you explain AI limitations to users?",
      "Tell me about a time you used automation responsibly.",
      "How would you handle user trust in an AI product?"
    ]
  },

  "data science": {
    technical: [
      "Explain the bias-variance tradeoff.",
      "What is cross-validation and why is it important?",
      "How do you handle missing data in a dataset?",
      "What is exploratory data analysis?",
      "How do you detect and handle outliers?",
      "Explain correlation vs causation.",
      "What is data leakage?",
      "How do you choose charts for data storytelling?",
      "What is hypothesis testing?",
      "How do you validate data quality?"
    ],
    coding: [
      "Build a simple machine learning model using scikit-learn.",
      "Write code to normalize a pandas DataFrame.",
      "Write pandas code to group data and calculate averages.",
      "Create a function to remove duplicate rows.",
      "Write code to visualize a distribution.",
      "Split a dataset into train and test sets.",
      "Write code to calculate missing value percentages.",
      "Create a simple feature from a date column."
    ],
    behavioral: [
      "Describe a machine learning project you led end-to-end.",
      "How do you communicate insights to non-technical stakeholders?",
      "Tell me about a time data changed your initial assumption.",
      "How do you prioritize analysis tasks under time pressure?",
      "Describe how you ensure your analysis is reproducible."
    ]
  },

  devops: {
    technical: [
      "Explain CI/CD pipelines and their benefits.",
      "What is containerization? How does Docker work?",
      "Explain Infrastructure as Code.",
      "What is Kubernetes and what problem does it solve?",
      "How do you monitor application health?",
      "Explain blue-green deployment.",
      "What is horizontal scaling?",
      "How do you manage secrets in production?",
      "What is a load balancer?",
      "How do you handle rollback after a failed deployment?"
    ],
    coding: [
      "Write a Dockerfile for a Node.js application.",
      "Create a basic Kubernetes deployment YAML.",
      "Write a CI pipeline that runs tests and builds an app.",
      "Create a script to check service health.",
      "Write environment-specific deployment configuration.",
      "Create a Docker Compose file for app and database."
    ],
    behavioral: [
      "Describe your experience managing production deployments.",
      "How do you handle system outages?",
      "Tell me about a time you improved deployment reliability.",
      "How do you communicate incidents to stakeholders?",
      "Describe how you balance speed and stability."
    ]
  },

  cloud: {
    technical: [
      "Explain the difference between IaaS, PaaS, and SaaS.",
      "Design a scalable cloud architecture for an e-commerce platform.",
      "How do you ensure security in cloud deployments?",
      "What is auto scaling?",
      "Explain object storage vs block storage.",
      "What are availability zones and regions?",
      "How do you reduce cloud costs?",
      "What is serverless computing?",
      "How do you design backup and disaster recovery?",
      "What is a CDN and why is it useful?"
    ],
    coding: [
      "Write Infrastructure as Code for cloud deployment.",
      "Configure cloud storage and database services.",
      "Create a serverless function for image processing.",
      "Write a script to upload files to cloud storage.",
      "Design a cloud deployment pipeline.",
      "Create environment variables for a cloud-hosted API."
    ],
    behavioral: [
      "Describe a cloud migration project you managed.",
      "How do you handle cloud cost optimization?",
      "Tell me about a time you improved cloud reliability.",
      "How do you explain cloud trade-offs to a team?",
      "Describe how you would plan a production migration."
    ]
  },

  qa: {
    technical: [
      "Explain the difference between manual and automated testing.",
      "What is test coverage and why does it matter?",
      "How do you prioritize which tests to automate?",
      "What are unit, integration, and end-to-end tests?",
      "Explain regression testing.",
      "How do you write effective bug reports?",
      "What is smoke testing?",
      "How do you test APIs?",
      "What is boundary value analysis?",
      "How do you handle flaky tests?"
    ],
    coding: [
      "Write a test case for login functionality.",
      "Create an automated test using Selenium or Cypress.",
      "Write API test cases for a CRUD endpoint.",
      "Create test data for form validation.",
      "Write pseudocode for testing pagination.",
      "Design tests for file upload functionality."
    ],
    behavioral: [
      "Describe a critical bug you discovered and how you reported it.",
      "How do you work with developers to resolve issues?",
      "Tell me about a time you prevented a production defect.",
      "How do you manage testing under tight deadlines?",
      "Describe how you handle disagreement about bug severity."
    ]
  },

  "full stack": {
    technical: [
      "Design a 3-tier architecture for a web application.",
      "Explain how you optimize both frontend and backend performance.",
      "How do you manage state across frontend and backend?",
      "Explain how authentication flows from frontend to backend.",
      "How do you design a database schema for a full stack app?",
      "What is CORS and how do you handle it?",
      "How do you secure API calls from the frontend?",
      "Explain server-side validation vs client-side validation.",
      "How do you deploy a full stack application?",
      "How do you debug an issue across frontend and backend?"
    ],
    coding: [
      "Build an API endpoint and its corresponding React component.",
      "Implement user authentication across the full stack.",
      "Create a form that submits data to an API with validation.",
      "Build a paginated table from backend data.",
      "Implement file upload from frontend to backend.",
      "Create role-based UI rendering from user permissions.",
      "Build a search feature with backend filtering.",
      "Design a full stack flow for live interview requests."
    ],
    behavioral: [
      "Describe a full stack project you built independently.",
      "How do you balance frontend and backend work?",
      "Tell me about a time you debugged a cross-layer issue.",
      "How do you decide whether logic belongs on frontend or backend?",
      "Describe how you plan a feature from UI to database."
    ]
  },

  mern: {
    technical: [
      "Explain the MERN stack and how each layer works.",
      "How does React communicate with an Express backend?",
      "What are Mongoose schemas and models?",
      "How do you structure routes and controllers in Express?",
      "How do you implement JWT authentication in MERN?",
      "How do you handle protected routes in React?",
      "Explain MongoDB indexing for a MERN app.",
      "How do you deploy a MERN application?"
    ],
    coding: [
      "Create a MERN CRUD flow for interview questions.",
      "Write an Express route and React form to create a resource.",
      "Implement login with JWT and localStorage.",
      "Build a paginated MongoDB query and display it in React.",
      "Create middleware for admin-only routes.",
      "Implement file upload with multer and React."
    ],
    behavioral: [
      "Describe a MERN project you built.",
      "How do you organize frontend and backend tasks?",
      "Tell me about a database modeling decision you made.",
      "How do you troubleshoot API integration bugs?"
    ]
  },

  general: {
    technical: [
      "What is REST API and how do you design one?",
      "Explain the difference between SQL and NoSQL databases.",
      "What is time complexity and space complexity?",
      "What is version control and why is Git useful?",
      "Explain authentication vs authorization.",
      "What is caching?",
      "How do you test software?",
      "What is deployment?",
      "Explain scalability in simple terms.",
      "How do you write maintainable code?"
    ],
    coding: [
      "Write a factorial function.",
      "Reverse an array without using extra space.",
      "Find the maximum element in an array.",
      "Check if a string is a palindrome.",
      "Count word frequency in a sentence.",
      "Merge two sorted arrays.",
      "Remove duplicates from a list.",
      "Find the missing number in a sequence."
    ],
    behavioral: [
      "Tell me about yourself and your career journey.",
      "How do you approach learning new technologies?",
      "Describe a time you worked in a team.",
      "Tell me about a challenge you overcame.",
      "How do you handle feedback?",
      "Why should we select you for this role?",
      "Where do you see yourself in the next few years?",
      "Describe a project you are proud of."
    ]
  }
};

export default mockQuestions;
