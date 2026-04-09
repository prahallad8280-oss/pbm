export const examTracks = [
  {
    slug: "csir-net",
    title: "CSIR NET",
    description: "Subject-wise tests, full length practice, and result review for mathematics-focused competitive prep.",
    href: "/exam-tracks/csir-net",
    eyebrow: "Lectureship and JRF track",
    intro:
      "This track is meant for learners preparing for CSIR NET Mathematical Sciences with a steady mix of revision, timed problem solving, and exam-oriented mock analysis.",
    details: [
      "Use this page as the public entry point for CSIR-focused preparation updates, upcoming mock releases, and new topic-wise test additions.",
      "You can later connect this track to dedicated mock series, PYQs, notices, and protected learner flows without changing the public structure.",
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

