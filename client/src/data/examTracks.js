const csirNetDeepDive = {
  overview: [
    "The CSIR-UGC National Eligibility Test (NET) is a national-level examination in India that assesses candidates for Junior Research Fellowship (JRF) and Lectureship / Assistant Professor eligibility.",
    "It is conducted for various science disciplines, including Mathematical Sciences, and serves as a gateway to research and academic careers.",
  ],
  whyChoose: [
    "Qualify for Ph.D. programs in top institutes such as IITs, IISc, and ISI.",
    "Receive a monthly fellowship up to Rs. 37,000 during research.",
    "Build a career in higher education as an Assistant Professor.",
    "Prepare for research organizations such as DRDO, ISRO, and BARC.",
    "Advance toward research and specialization in mathematical sciences.",
  ],
  examStructure: {
    duration: "3 Hours",
    notes: ["Negative marking applicable"],
    rows: [
      {
        section: "Part A",
        nature: "General Aptitude",
        attempt: "15 / 20",
        marks: "30",
      },
      {
        section: "Part B",
        nature: "Concept-based Mathematics",
        attempt: "25 / 40",
        marks: "75",
      },
      {
        section: "Part C",
        nature: "Advanced Analytical Problems",
        attempt: "20 / 60",
        marks: "95",
      },
      {
        section: "Total",
        nature: "",
        attempt: "",
        marks: "200 Marks",
      },
    ],
  },
  syllabusIntro:
    "The syllabus is structured into core mathematical units, as defined in the official CSIR document.",
  syllabusUnits: [
    {
      title: "Unit I: Analysis & Linear Algebra",
      groups: [
        {
          label: "Analysis",
          items: [
            "Set theory (finite, countable, uncountable sets)",
            "Real number system and completeness",
            "Sequences, series, and convergence concepts including limsup and liminf",
            "Theorems such as Bolzano-Weierstrass and Heine-Borel",
            "Continuity, differentiability, and mean value theorem",
            "Riemann and improper integrals",
            "Functions of several variables",
            "Metric spaces, compactness, and connectedness",
            "Lebesgue measure and integration basics",
          ],
        },
        {
          label: "Linear Algebra",
          items: [
            "Vector spaces, basis, and dimension",
            "Linear transformations and matrix theory",
            "Eigenvalues, eigenvectors, and Cayley-Hamilton theorem",
            "Canonical forms including Jordan form and diagonalization",
            "Inner product spaces and orthonormalization",
            "Quadratic forms and classification",
          ],
        },
      ],
    },
    {
      title: "Unit II: Complex Analysis, Algebra & Topology",
      groups: [
        {
          label: "Complex Analysis",
          items: [
            "Complex numbers and functions",
            "Analytic functions and Cauchy-Riemann equations",
            "Contour integration and major theorems",
            "Taylor and Laurent series",
            "Residue theory",
            "Conformal mappings and Mobius transformations",
          ],
        },
        {
          label: "Algebra",
          items: [
            "Number theory basics including divisibility and congruences",
            "Group theory including subgroups, homomorphisms, and Sylow theorems",
            "Ring theory including ideals and quotient rings",
            "Fields and Galois theory",
            "Polynomial rings and irreducibility",
          ],
        },
        {
          label: "Topology",
          items: [
            "Basis, subspace, and product topology",
            "Dense sets and separation axioms",
            "Compactness and connectedness",
          ],
        },
      ],
    },
    {
      title: "Unit III: Differential Equations & Applied Mathematics",
      groups: [
        {
          label: "Ordinary Differential Equations (ODEs)",
          items: [
            "Existence and uniqueness theorems",
            "Systems of ODEs",
            "Linear ODEs and boundary value problems",
            "Sturm-Liouville theory and Green's functions",
          ],
        },
        {
          label: "Partial Differential Equations (PDEs)",
          items: [
            "First-order PDE methods such as Lagrange and Charpit",
            "Classification of second-order PDEs",
            "Heat, wave, and Laplace equations",
          ],
        },
        {
          label: "Numerical Analysis",
          items: [
            "Root-finding methods including Newton-Raphson and iteration",
            "Linear systems and Gauss methods",
            "Interpolation techniques",
            "Numerical integration and ODE solvers",
          ],
        },
        {
          label: "Calculus of Variations",
          items: [
            "Functionals and Euler-Lagrange equations",
            "Optimization problems with constraints",
          ],
        },
        {
          label: "Integral Equations",
          items: [
            "Fredholm and Volterra equations",
            "Eigenvalue problems and kernels",
          ],
        },
        {
          label: "Classical Mechanics",
          items: [
            "Lagrangian and Hamiltonian formulations",
            "Motion of rigid bodies",
            "Oscillation theory",
          ],
        },
      ],
    },
    {
      title: "Unit IV: Probability & Statistics",
      groups: [
        {
          label: "Probability & Statistics",
          items: [
            "Probability theory and random variables",
            "Distributions and expectations",
            "Laws of large numbers and central limit theorem",
            "Markov chains and stochastic processes",
            "Estimation theory and hypothesis testing",
            "Regression and ANOVA",
            "Multivariate statistics",
            "Sampling techniques and design of experiments",
            "Linear programming and queuing models",
          ],
        },
      ],
    },
  ],
  whoShouldPrepare: [
    "M.Sc. or Integrated M.Sc. students in Mathematics or Applied Mathematics",
    "Aspirants targeting Ph.D. or research careers",
    "Candidates preparing for ISI or IIT fellowships",
    "Students aiming for government research roles",
  ],
  eligibility: {
    educationTitle: "Educational Qualification",
    education: [
      "M.Sc. or equivalent with 55% marks for the General category",
      "M.Sc. or equivalent with 50% marks for reserved categories",
    ],
    ageTitle: "Age Limit",
    age: [
      "JRF: Up to 28 years, with applicable relaxation",
      "Lectureship / Assistant Professor: No upper age limit",
    ],
  },
  importantNotes: [
    "Questions in the exam are distributed across units, with strong emphasis on Unit I (Analysis & Linear Algebra).",
    "Mathematics candidates are expected to focus primarily on Units I, II, and III, while Unit IV is more relevant for statistics-oriented candidates.",
  ],
};

export const examTracks = [
  {
    slug: "csir-net",
    title: "CSIR NET",
    description: "Subject-wise tests, full length practice, and result review for mathematics-focused competitive prep.",
    href: "/exam-tracks/csir-net",
    eyebrow: "Lectureship and JRF track",
    intro:
      "The CSIR-UGC National Eligibility Test (NET) for Mathematical Sciences is a national-level exam that opens the route to Junior Research Fellowship, Assistant Professor eligibility, and research-focused academic careers.",
    details: [
      "The exam serves as a major gateway for candidates who want to move into research, higher education, and advanced mathematics-based academic work.",
      "For Mathematical Sciences aspirants, strong conceptual preparation, disciplined revision, and consistent mock practice are central to doing well in the exam.",
    ],
    highlights: [
      "Subject-wise mathematics practice",
      "Full length timed mock tests",
      "Result analysis and revision support",
    ],
    resources: [
      "Mock tests for Mathematical Sciences MA",
      "Future PYQ collections for CSIR pattern practice",
      "Announcements for new mock releases",
    ],
    deepDive: csirNetDeepDive,
  },
  {
    slug: "gate-mathematics",
    title: "GATE Mathematics",
    description: "Timed problem-solving sets and structured revision for graduate-level entrance preparation.",
    href: "/exam-tracks/gate-mathematics",
    eyebrow: "Graduate entrance track",
    intro:
      "This track can support GATE Mathematics preparation through carefully timed problem sets, revision-oriented practice, and future paper-wise collections.",
    details: [
      "The goal here is to build strong problem-solving rhythm and reduce topic-level inconsistency before full exam simulation starts.",
      "As the platform grows, this track can hold topic-wise drills, mock tests, and exam-year collections in one place.",
    ],
    highlights: [
      "Timed mathematics drills",
      "Revision-based practice flow",
      "Expandable mock-test structure",
    ],
    resources: [
      "Practice sets for core mathematics areas",
      "Future GATE-style mock papers",
      "Announcements for newly added modules",
    ],
  },
  {
    slug: "odisha-assistant-professor",
    title: "Odisha Assistant Professor",
    description: "State-level preparation support with exam-oriented practice and focused mathematics coverage.",
    href: "/exam-tracks/odisha-assistant-professor",
    eyebrow: "State exam track",
    intro:
      "This track is designed for state-level assistant professor preparation with mathematics-focused practice that stays close to recruitment-style expectations.",
    details: [
      "It can later host targeted question sets, state-specific papers, and revision-friendly mock structures without mixing them into other exam flows.",
      "That separation makes preparation cleaner for candidates who are balancing national and state-level exams together.",
    ],
    highlights: [
      "State-oriented mathematics practice",
      "Focused exam-pattern coverage",
      "Simple route to future paper collections",
    ],
    resources: [
      "State recruitment preparation notes",
      "Future topic-wise tests",
      "Announcements for new state exam materials",
    ],
  },
  {
    slug: "nbhm-pyqs",
    title: "NBHM PYQs",
    description: "Past-year style preparation to strengthen reasoning, proofs, and higher mathematics problem solving.",
    href: "/exam-tracks/nbhm-pyqs",
    eyebrow: "Past-year question track",
    intro:
      "This track is for NBHM-oriented preparation where the emphasis is on deeper mathematics thinking, proofs, and past-year question style familiarity.",
    details: [
      "The public page can introduce the track while future protected sections can hold curated PYQ sets, solutions, and mock-style practice extensions.",
      "That keeps NBHM preparation distinct from quicker objective-style exam flows while still staying inside the same portal.",
    ],
    highlights: [
      "Higher mathematics problem-solving focus",
      "Past-year question style preparation",
      "Space for solution-led revision",
    ],
    resources: [
      "NBHM PYQ collections",
      "Future worked-solution sets",
      "Track-specific notice updates",
    ],
  },
  {
    slug: "tifr-pyqs",
    title: "TIFR PYQs",
    description: "Institute-level past paper preparation with deeper problem practice and review-friendly analysis.",
    href: "/exam-tracks/tifr-pyqs",
    eyebrow: "Institute exam track",
    intro:
      "This track is built for TIFR-style preparation with a stronger emphasis on careful mathematics reasoning, depth, and problem-by-problem review.",
    details: [
      "It can gradually grow into a dedicated public-and-private structure for PYQs, topic clusters, and advanced-level mock material.",
      "Keeping this separate helps the platform support both broad exam preparation and institute-level mathematical depth at the same time.",
    ],
    highlights: [
      "Institute-style preparation flow",
      "Deep reasoning and review support",
      "Future space for TIFR PYQs and sets",
    ],
    resources: [
      "TIFR PYQ notices",
      "Future advanced problem collections",
      "Track-specific updates and releases",
    ],
  },
];

export const getExamTrackBySlug = (slug = "") => examTracks.find((track) => track.slug === slug);
