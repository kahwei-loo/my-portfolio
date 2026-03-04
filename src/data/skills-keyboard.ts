// Skills Keyboard Configuration
// Based on actual tech stack from real projects and work experience

export interface SkillKey {
  label: string;
  color: string;
  shortLabel?: string;
  description?: string;
  category?: string;
}

// Brand colors sourced from simple-icons hex values where available
export const skillsKeyboard: { [key: string]: SkillKey } = {
  // AI & LLM
  "OpenAI":      { label: "OpenAI",       color: "#10a37f", description: "OpenAI & Anthropic API for LLM inference and function calling",   category: "AI & LLM" },
  "Anthropic":   { label: "Anthropic",    color: "#CC785C", description: "Claude API — multi-provider AI gateway via LiteLLM",              category: "AI & LLM" },
  "n8n":         { label: "n8n",          color: "#EA4B71", description: "Low-code automation and AI workflow orchestration",               category: "AI & LLM" },
  "HuggingFace": { label: "Hugging Face", color: "#FFD21E", description: "Model hub, embeddings, and open-source LLM ecosystem",           category: "AI & LLM" },
  "LiteLLM":     { label: "LiteLLM",      color: "#6366F1", description: "Multi-provider AI gateway with per-purpose model routing",       category: "AI & LLM" },
  "RAG":         { label: "RAG",          color: "#0EA5E9", description: "Retrieval-Augmented Generation — pgvector + BM25 + RRF hybrid",  category: "AI & LLM" },

  // Frontend
  "JS":       { label: "JavaScript", shortLabel: "JS", color: "#F7DF1E", description: "Dynamic scripting language powering modern web interactivity", category: "Frontend" },
  "TS":       { label: "TypeScript", shortLabel: "TS", color: "#3178C6", description: "Typed superset of JavaScript for scalable application development", category: "Frontend" },
  "React":    { label: "React",                        color: "#61DAFB", description: "Component-based UI library for building interactive interfaces",   category: "Frontend" },
  "Next":     { label: "Next.js",                      color: "#eeeeee", description: "Full-stack React framework with SSR and static generation",        category: "Frontend" },
  "Tailwind": { label: "Tailwind CSS", shortLabel: "TW", color: "#06B6D4", description: "Utility-first CSS framework for rapid UI development",          category: "Frontend" },
  "Three":    { label: "Three.js",                     color: "#049ef4", description: "JavaScript 3D library for WebGL visualizations",                  category: "3D & Anim" },

  // Backend
  "Python":  { label: "Python",          color: "#3776AB", description: "Versatile language for backend services, scripting, and AI work",   category: "Backend" },
  "FastAPI": { label: "FastAPI",         color: "#009688", description: "High-performance Python framework for building modern APIs",         category: "Backend" },
  "PHP":     { label: "PHP",             color: "#777BB4", description: "Server-side scripting language widely used for web development",     category: "Backend" },
  "Laravel": { label: "Laravel",         color: "#FF2D20", description: "Elegant PHP framework for modern web application development",       category: "Backend" },
  "Node":    { label: "Node.js",         color: "#5FA04E", description: "JavaScript runtime for building fast server-side applications",      category: "Backend" },
  "GSAP":    { label: "GSAP",            color: "#0AE448", description: "Professional-grade animation library for smooth transitions",        category: "3D & Anim" },

  // DB & Tools
  "MySQL":    { label: "MySQL",      color: "#4479A1", description: "Widely-used open-source relational database management system",         category: "Database" },
  "Postgres": { label: "PostgreSQL", color: "#4169E1", description: "Advanced open-source relational database with strong reliability",      category: "Database" },
  "Redis":    { label: "Redis",      color: "#FF4438", description: "In-memory data store for caching, queues, and real-time data",          category: "Database" },
  "Git":      { label: "Git",        color: "#F05032", description: "Distributed version control for tracking code changes",                 category: "Tools" },
  "Docker":   { label: "Docker",     color: "#2496ED", description: "Containerization platform for consistent deployment environments",       category: "Tools" },
  "Postman":  { label: "Postman",    color: "#FF6C37", description: "API development and testing platform for building integrations",         category: "Tools" },
};

// Skills keyboard layout — 4×6 grid
// Row 1: AI & LLM (portfolio differentiator — goes first)
// Row 2: Frontend
// Row 3: Backend
// Row 4: DB & Tools
export const skillsLayout = [
  // Row 1 — AI & LLM
  [
    { key: "OpenAI",      width: 1, x: 0 },
    { key: "Anthropic",   width: 1, x: 1 },
    { key: "n8n",         width: 1, x: 2 },
    { key: "HuggingFace", width: 1, x: 3 },
    { key: "LiteLLM",     width: 1, x: 4 },
    { key: "RAG",         width: 1, x: 5 },
  ],
  // Row 2 — Frontend
  [
    { key: "JS",       width: 1, x: 0 },
    { key: "TS",       width: 1, x: 1 },
    { key: "React",    width: 1, x: 2 },
    { key: "Next",     width: 1, x: 3 },
    { key: "Tailwind", width: 1, x: 4 },
    { key: "Three",    width: 1, x: 5 },
  ],
  // Row 3 — Backend
  [
    { key: "Python",  width: 1, x: 0 },
    { key: "FastAPI", width: 1, x: 1 },
    { key: "PHP",     width: 1, x: 2 },
    { key: "Laravel", width: 1, x: 3 },
    { key: "Node",    width: 1, x: 4 },
    { key: "GSAP",    width: 1, x: 5 },
  ],
  // Row 4 — DB & Tools
  [
    { key: "MySQL",    width: 1, x: 0 },
    { key: "Postgres", width: 1, x: 1 },
    { key: "Redis",    width: 1, x: 2 },
    { key: "Git",      width: 1, x: 3 },
    { key: "Docker",   width: 1, x: 4 },
    { key: "Postman",  width: 1, x: 5 },
  ],
];
