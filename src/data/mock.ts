export const personalInfo = {
  name: "Kah Wei Loo",
  shortName: "RyanL",
  title: "Software Engineer",
  tagline: "Stay curious. The rest follows.",
  description:
    "I build software — from backend systems to AI-powered products. I like learning how things work, and I believe good software is built with intention — not just making it work, but making it work well for the people who use it. Outside of code, you'll probably find me hunting for good food or somewhere far from home with a camera.",
  email: "kahwei.loo.dev@gmail.com",
  location: "Kuala Lumpur, Malaysia",
  headshot: "https://cdn.itskw.dev/public/photos/headshot.JPG",
  resume: "https://cdn.itskw.dev/public/Loo-Kah-Wei-Resume.pdf",
  social: {
    github: "https://github.com/kahwei-loo",
    linkedin: "https://linkedin.com/in/kah-wei-loo-3b86103b1",
    twitter: "https://x.com/KahWeiLoo_",
  },
};

export const skills = [
  {
    category: "AI & LLM",
    items: [
      { name: "OpenAI / Anthropic API" },
      { name: "LiteLLM" },
      { name: "RAG Pipelines" },
      { name: "pgvector / BM25 / RRF" },
      { name: "Prompt Engineering" },
      { name: "Function Calling" },
      { name: "n8n" },
      { name: "Hugging Face" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Python / FastAPI" },
      { name: "PHP / Laravel" },
      { name: "Node.js" },
      { name: "PostgreSQL" },
      { name: "MySQL" },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "React" },
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "Tailwind CSS" },
      { name: "jQuery" },
      { name: "Three.js / GSAP" },
    ],
  },
  {
    category: "Tools & Infra",
    items: [
      { name: "Docker" },
      { name: "Git" },
      { name: "Redis" },
      { name: "Postman" },
    ],
  },
];

interface ProjectScreenshot {
  src: string;
  alt: string;
  caption?: string;
}

interface ProjectCaseStudy {
  problem: string;
  solution: string;
  highlights: string[];
  screenshots: ProjectScreenshot[];
  role?: string;
}

export interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  image: string;
  color: string;
  link?: string;
  github?: string;
  caseStudy?: ProjectCaseStudy;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Doctify",
    subtitle: "AI-powered document intelligence",
    description:
      "A document intelligence SaaS platform with a 4-layer RAG pipeline, NL-to-SQL analytics, and a multi-provider AI gateway (OpenAI, Anthropic, Google) built on LiteLLM. Users can query documents in natural language, run analytics via plain-text SQL generation, and embed an AI chat widget on any site.",
    tech: ["React", "FastAPI", "LiteLLM", "pgvector", "PostgreSQL", "Redis", "Celery", "Docker"],
    image: "/projects/doctify.jpg",
    color: "#2997FF",
    github: "https://github.com/kahwei-loo/doctify",
    caseStudy: {
      problem:
        "Enterprises process large volumes of unstructured documents manually, leading to slow turnaround, human errors, and difficulty extracting actionable insights from contracts, invoices, and reports.",
      solution:
        "A full-stack SaaS platform with a LiteLLM-powered multi-provider AI gateway and 4-layer RAG pipeline. An intent classifier routes queries to either the RAG pipeline (document Q&A) or an NL-to-SQL analytics engine — all within the same conversational interface.",
      highlights: [
        "LiteLLM multi-provider gateway with per-purpose model routing and automatic failover (OpenAI → Anthropic → Google)",
        "Intent classifier using function calling to route queries between RAG and NL-to-SQL analytics pipelines",
        "Hybrid retrieval combining pgvector semantic search, BM25 keyword matching, and Reciprocal Rank Fusion",
        "Cohere reranking with groundedness scoring to detect and flag hallucinated claims",
        "Semantic cache layer for near-duplicate query deduplication, reducing LLM API costs",
        "SSE token streaming + WebSocket document processing progress for real-time conversational UI",
        "Embeddable public AI chat widget bindable to any knowledge base",
      ],
      screenshots: [
        { src: "/projects/doctify/dashboard.png", alt: "Doctify dashboard with analytics and activity feed" },
        { src: "/projects/doctify/documents.png", alt: "Document management with project organization" },
        { src: "/projects/doctify/chat.png", alt: "RAG-powered chat assistant for document Q&A" },
      ],
      role: "Full-stack Developer",
    },
  },
  {
    id: 2,
    title: "DeepLens",
    subtitle: "Multi-agent entity research",
    description:
      "A web-first entity research platform powered by LangGraph. An adaptive LLM supervisor routes between specialized agents for multi-angle web search, sentiment analysis, and structured report generation — producing comprehensive markdown reports with citations and charts.",
    tech: ["LangGraph", "Python", "OpenAI", "Tavily", "Streamlit", "pandas"],
    image: "/projects/deeplens/initial.png",
    color: "#7C3AED",
    github: "https://github.com/kahwei-loo/deeplens",
    caseStudy: {
      problem:
        "Researching public entities — artists, brands, executives — requires manually sifting through dozens of fragmented sources with no structure, no sentiment synthesis, and no consistent depth. The result is surface-level research that misses nuance.",
      solution:
        "A multi-agent system with an LLM-based adaptive supervisor that makes context-dependent routing decisions — not a fixed pipeline. Specialized agents handle multi-angle web research, LLM sentiment analysis, and structured report writing with matplotlib charts.",
      highlights: [
        "Adaptive supervisor using structured LLM output — routes non-linearly based on information completeness, not a fixed pipeline",
        "Multi-angle search: LLM generates 2–5 queries (overview, news, opinion, controversy) per session, inspired by Perplexity",
        "Deep URL extraction via Tavily — full article content, not just snippets, inspired by Manus",
        "Entity-aware research strategy adapts dynamically for artists, public figures, companies, and topics",
        "Optional YouTube enrichment (video metrics + comments) — gracefully skipped when API key is absent",
        "LLM-based batch sentiment analysis across web articles and YouTube comments with pandas statistics",
        "74 passing tests across all agent modules (supervisor, research, analysis, report)",
      ],
      screenshots: [
        { src: "/projects/deeplens/report.png", alt: "Research Report output for Elon Musk with executive summary and agent trace" },
        { src: "/projects/deeplens/data-panels.png", alt: "Raw data panels showing web articles, YouTube videos, and sentiment analysis" },
        { src: "/projects/deeplens/initial.png", alt: "DeepLens initial UI with sidebar settings and demo shortcuts" },
        { src: "/projects/deeplens/query.png", alt: "Query pre-filled and ready to start research" },
      ],
      role: "Full-stack Developer",
    },
  },
  {
    id: 3,
    title: "Aurora Keyboard",
    subtitle: "Interactive 3D keyboard configurator",
    description:
      "An e-commerce site with an interactive 3D keyboard customizer. Users can preview keycap and switch colors in real-time, explore different keyboard layouts (60% ANSI, 87% TKL), and complete purchases via Stripe checkout.",
    tech: ["Next.js", "Three.js", "React Three Fiber", "Prismic", "Stripe"],
    image: "/projects/aurora.jpg",
    color: "#8B7355",
    github: "https://github.com/kahwei-loo/aurora",
    caseStudy: {
      problem:
        "Traditional keyboard e-commerce relies on static product images that fail to convey the tactile feel, customization options, and premium quality of mechanical keyboards.",
      solution:
        "An Awwwards-level 3D interactive product page where every keyboard is generated procedurally at runtime, allowing real-time color customization, switch exploration, and cinematic scroll-driven camera choreography.",
      highlights: [
        "Procedural 3D keyboard geometry built entirely at runtime with zero model downloads",
        "Cinematic scroll-driven 3D camera choreography synced with GSAP ScrollTrigger",
        "Per-key RGB ripple lighting effects with Web Audio API sound feedback on interaction",
        "GLTF switch exploded-view animation for educational component exploration",
        "Zustand cross-route state management persisting configurator choices through checkout",
        "Full Stripe checkout integration with dynamic price calculation",
      ],
      screenshots: [
        { src: "/projects/aurora/hero.jpg", alt: "Aurora Keyboard hero section with 3D keyboard" },
        { src: "/projects/aurora/switches.jpg", alt: "Exploded switch view animation" },
        { src: "/projects/aurora/studio.jpg", alt: "Real-time keyboard color configurator" },
      ],
      role: "Full-stack Developer",
    },
  },
  {
    id: 4,
    title: "This Portfolio",
    subtitle: "Animated personal showcase",
    description:
      "The site you're looking at right now. Built with Next.js 16, featuring liquid text hover effects, a 3D keyboard visualization, GSAP-powered scroll animations, and Lenis smooth scrolling.",
    tech: ["Next.js", "Three.js", "GSAP", "Tailwind CSS", "TypeScript"],
    image: "/projects/portfolio.jpg",
    color: "#C9A96E",
    github: "https://github.com/kahwei-loo/my-portfolio",
    caseStudy: {
      problem:
        "Generic template portfolios blend into the crowd and fail to demonstrate the craft and technical depth that differentiate a developer.",
      solution:
        "A custom-built portfolio featuring an interactive 3D keyboard visualization, cinematic GSAP-powered animations, and liquid text effects that showcase both design sensibility and engineering skill.",
      highlights: [
        "Interactive 3D keyboard rendering skills as physical keycaps using React Three Fiber",
        "GSAP-powered cinematic scroll animations with ScrollTrigger horizontal pin sections",
        "Liquid text hover effects with elastic easing and neighbor ripple propagation",
        "Custom cursor with magnetic button interactions and contextual state changes",
        "Lenis smooth scroll integration synced with GSAP ticker for buttery 60fps scrolling",
      ],
      screenshots: [],
      role: "Design & Development",
    },
  },
];

export const experiences = [
  {
    id: 0,
    role: "Independent AI & Full-Stack Development",
    company: "Self-Directed",
    location: "Kuala Lumpur, Malaysia",
    period: "2025 - Present",
    categoryLabel: "Independent",
    description:
      "After leaving Xeersoft, pursued an intensive period of self-directed learning and project development — completing a comprehensive AI engineering curriculum and building production-grade projects to transition into full-stack and AI development.",
    highlights: [
      "Completed AI engineering curriculum (L1-L4): Prompt Engineering, RAG, Agents, Fine-tuning",
      "Built Doctify — a document intelligence platform with multi-provider AI gateway and RAG pipeline",
      "Self-taught React, Next.js, Docker, and Three.js to expand into full-stack development",
    ],
  },
  {
    id: 1,
    role: "Software Developer",
    company: "Xeersoft Sdn Bhd",
    location: "Kuala Lumpur, Malaysia",
    period: "Mar 2023 - Mar 2025",
    description:
      "Developed and maintained backend features for SME accounting and inventory systems, supporting reporting, taxation, and daily operational workflows.",
    highlights: [
      "Developed LHDN e-Invoice API integration with tax validation and submission, serving 100+ SME clients",
      "Built and maintained 15+ API endpoints bridging inventory and accounting systems with real-time data sync",
      "Diagnosed and resolved critical production bugs in tax calculation logic and MySQL concurrency deadlocks",
    ],
  },
];

export const education = [
  {
    id: 2,
    degree: "Bachelor of Engineering in Software Engineering",
    school: "Xiamen University Malaysia (XMUM)",
    location: "Sepang, Malaysia",
    period: "2019 - 2023",
    description:
      "Graduated with a solid foundation in software engineering principles, algorithms, and modern development practices.",
    highlights: [
      "Studied software architecture, algorithms, and design patterns",
      "Capstone: campus cafeteria pre-ordering and restaurant management system",
    ],
  },
];

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];
