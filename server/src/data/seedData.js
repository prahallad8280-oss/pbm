import "./../config/env.js";

import connectDB from "../config/db.js";
import Question from "../models/Question.js";
import TestAttempt from "../models/TestAttempt.js";
import TestCategory from "../models/TestCategory.js";
import User from "../models/User.js";

const categories = [
  {
    name: "Cell Biology Fundamentals",
    slug: "cell-biology-fundamentals",
    description: "Subject-wise practice set covering cell organelles, membranes, and the cell cycle.",
    examName: "CSIR",
    subjectLabel: "LIFE SCIENCE SUBJECT TEST",
    testType: "subject",
    durationMinutes: 45,
    questionCount: 5,
    isActive: true,
    isDemo: false,
  },
  {
    name: "Genetics and Evolution",
    slug: "genetics-and-evolution",
    description: "Subject-wise test focused on Mendelian genetics, molecular genetics, and evolutionary ideas.",
    examName: "CSIR",
    subjectLabel: "LIFE SCIENCE SUBJECT TEST",
    testType: "subject",
    durationMinutes: 45,
    questionCount: 5,
    isActive: true,
    isDemo: false,
  },
  {
    name: "CSIR NET Full Length Test 1",
    slug: "csir-net-full-length-test-1",
    description: "Mixed-discipline full length mock with concept, analysis, and application questions.",
    examName: "CSIR",
    subjectLabel: "MATHEMATIC SCIENCE SET A",
    testType: "flt",
    durationMinutes: 90,
    questionCount: 8,
    isActive: true,
    isDemo: true,
    demoKey: "mathematics-ma-2023-june",
  },
  {
    name: "Mathematics General Aptitude Set 2",
    slug: "mathematics-general-aptitude-set-2",
    description: "General aptitude set with sequences, logic, quantitative reasoning, and data interpretation.",
    examName: "CSIR",
    subjectLabel: "GENERAL APTITUDE SET B",
    testType: "subject",
    durationMinutes: 45,
    questionCount: 8,
    isActive: true,
    isDemo: false,
  },
  {
    name: "Mathematics Advanced Concepts Set 1",
    slug: "mathematics-advanced-concepts-set-1",
    description: "Complex analysis and group theory practice set for higher mathematical reasoning.",
    examName: "CSIR",
    subjectLabel: "MATHEMATIC SCIENCE ADVANCED SET",
    testType: "subject",
    durationMinutes: 45,
    questionCount: 3,
    isActive: true,
    isDemo: false,
  },
];

const buildQuestions = (categoryMap, adminId) => [
  {
    category: categoryMap["cell-biology-fundamentals"],
    testType: "subject",
    questionText: "Which organelle is the primary site of oxidative phosphorylation in eukaryotic cells?",
    options: ["Golgi apparatus", "Mitochondrion", "Lysosome", "Peroxisome"],
    correctAnswer: 1,
    explanation: "The inner mitochondrial membrane contains the electron transport chain and ATP synthase.",
    createdBy: adminId,
  },
  {
    category: categoryMap["cell-biology-fundamentals"],
    testType: "subject",
    questionText: "The G1/S checkpoint primarily ensures that:",
    options: [
      "Sister chromatids have separated correctly",
      "DNA damage is repaired before replication begins",
      "Spindle microtubules are attached to kinetochores",
      "Cytokinesis has completed",
    ],
    correctAnswer: 1,
    explanation: "The G1/S checkpoint confirms adequate growth conditions and DNA integrity before DNA synthesis.",
    createdBy: adminId,
  },
  {
    category: categoryMap["cell-biology-fundamentals"],
    testType: "subject",
    questionText: "The fluid mosaic model states that biological membranes are:",
    options: [
      "Rigid bilayers made only of phospholipids",
      "Static protein sheets surrounding lipids",
      "Dynamic lipid bilayers with embedded proteins",
      "Protein lattices lined by carbohydrates",
    ],
    correctAnswer: 2,
    explanation: "Singer and Nicolson described membranes as dynamic phospholipid bilayers with proteins moving within them.",
    createdBy: adminId,
  },
  {
    category: categoryMap["cell-biology-fundamentals"],
    testType: "subject",
    questionText: "Lysosomes are best known for:",
    options: [
      "Generating ribosomal RNA",
      "Digesting macromolecules with hydrolytic enzymes",
      "Synthesizing lipids for the plasma membrane",
      "Storing genetic information",
    ],
    correctAnswer: 1,
    explanation: "Lysosomes contain acid hydrolases that degrade cellular waste and engulfed materials.",
    createdBy: adminId,
  },
  {
    category: categoryMap["cell-biology-fundamentals"],
    testType: "subject",
    questionText: "Microtubules are assembled from heterodimers of:",
    options: ["Actin and myosin", "Tubulin alpha and tubulin beta", "Kinesin and dynein", "Keratin and vimentin"],
    correctAnswer: 1,
    explanation: "Alpha and beta tubulin heterodimers polymerize to form microtubules.",
    createdBy: adminId,
  },
  {
    category: categoryMap["genetics-and-evolution"],
    testType: "subject",
    questionText: "Mendel's law of segregation states that:",
    options: [
      "Alleles assort together into the same gamete",
      "Alleles separate during gamete formation",
      "Only dominant alleles enter gametes",
      "Genes on different chromosomes never recombine",
    ],
    correctAnswer: 1,
    explanation: "The two alleles of a gene separate so each gamete receives one allele.",
    createdBy: adminId,
  },
  {
    category: categoryMap["genetics-and-evolution"],
    testType: "subject",
    questionText: "Which of the following is an assumption of Hardy-Weinberg equilibrium?",
    options: ["Natural selection occurs strongly", "Population size is very small", "Random mating occurs", "Mutation rate is very high"],
    correctAnswer: 2,
    explanation: "Hardy-Weinberg equilibrium assumes random mating along with no mutation, migration, or selection and a large population.",
    createdBy: adminId,
  },
  {
    category: categoryMap["genetics-and-evolution"],
    testType: "subject",
    questionText: "DNA polymerase synthesizes DNA in which direction?",
    options: ["3' to 5'", "5' to 3'", "Both directions simultaneously", "Only toward the replication fork"],
    correctAnswer: 1,
    explanation: "DNA polymerases add nucleotides to the 3' hydroxyl end, so synthesis proceeds 5' to 3'.",
    createdBy: adminId,
  },
  {
    category: categoryMap["genetics-and-evolution"],
    testType: "subject",
    questionText: "Crossing over between homologous chromosomes occurs during:",
    options: ["Prophase I of meiosis", "Metaphase II of meiosis", "G1 phase of mitosis", "Anaphase of mitosis"],
    correctAnswer: 0,
    explanation: "Homologous chromosomes exchange segments during prophase I, especially at pachytene.",
    createdBy: adminId,
  },
  {
    category: categoryMap["genetics-and-evolution"],
    testType: "subject",
    questionText: "The synaptonemal complex is associated with:",
    options: ["DNA replication", "Homolog pairing in meiosis", "Transcription initiation", "Chromosome movement in mitosis"],
    correctAnswer: 1,
    explanation: "The synaptonemal complex aligns homologous chromosomes during meiotic prophase I.",
    createdBy: adminId,
  },
  {
    category: categoryMap["csir-net-full-length-test-1"],
    testType: "flt",
    questionText: "During PCR, the denaturation step is typically carried out at:",
    options: ["25 to 30 degrees C", "37 to 42 degrees C", "50 to 55 degrees C", "94 to 98 degrees C"],
    correctAnswer: 3,
    explanation: "High temperature separates the DNA strands before primer annealing.",
    createdBy: adminId,
  },
  {
    category: categoryMap["csir-net-full-length-test-1"],
    testType: "flt",
    questionText: "Competitive inhibition usually causes which kinetic effect on an enzyme?",
    options: ["Decreases Vmax only", "Increases Km without changing Vmax", "Decreases both Km and Vmax", "No effect on either Km or Vmax"],
    correctAnswer: 1,
    explanation: "Competitive inhibitors raise the apparent Km because more substrate is required to reach half Vmax.",
    createdBy: adminId,
  },
  {
    category: categoryMap["csir-net-full-length-test-1"],
    testType: "flt",
    questionText: "ELISA is commonly used to detect:",
    options: ["Specific antigen-antibody interactions", "DNA sequence mutations only", "Membrane lipid asymmetry", "Chromosome banding patterns"],
    correctAnswer: 0,
    explanation: "ELISA relies on enzyme-linked antibodies to detect antigens or antibodies.",
    createdBy: adminId,
  },
  {
    category: categoryMap["csir-net-full-length-test-1"],
    testType: "flt",
    questionText: "Southern blotting is used primarily for the detection of:",
    options: ["Proteins", "RNA", "DNA", "Lipopolysaccharides"],
    correctAnswer: 2,
    explanation: "Southern blotting identifies specific DNA sequences after electrophoresis and transfer.",
    createdBy: adminId,
  },
  {
    category: categoryMap["csir-net-full-length-test-1"],
    testType: "flt",
    questionText: "In the lac operon, the lacI gene product acts as:",
    options: ["A structural enzyme", "A repressor protein", "An RNA primer", "A sigma factor"],
    correctAnswer: 1,
    explanation: "lacI encodes the repressor that binds the operator and blocks transcription in the absence of inducer.",
    createdBy: adminId,
  },
  {
    category: categoryMap["csir-net-full-length-test-1"],
    testType: "flt",
    questionText: "A Hill coefficient greater than 1 suggests:",
    options: ["Negative cooperativity", "Positive cooperativity", "Irreversible inhibition", "Substrate depletion"],
    correctAnswer: 1,
    explanation: "Positive cooperativity means ligand binding increases the affinity of additional binding events.",
    createdBy: adminId,
  },
  {
    category: categoryMap["csir-net-full-length-test-1"],
    testType: "flt",
    questionText: "Which observation supports the endosymbiotic origin of mitochondria?",
    options: [
      "They lack internal membranes",
      "They possess circular DNA and bacterial-type ribosomes",
      "They are formed de novo from the Golgi apparatus",
      "They perform DNA replication only in the nucleus",
    ],
    correctAnswer: 1,
    explanation: "Mitochondria contain circular DNA and 70S-like ribosomes, consistent with a bacterial ancestry.",
    createdBy: adminId,
  },
  {
    category: categoryMap["csir-net-full-length-test-1"],
    testType: "flt",
    questionText: "BLAST is primarily used to:",
    options: [
      "Predict protein tertiary structure directly from microscope images",
      "Find local sequence similarity in biological databases",
      "Measure enzyme activity in real time",
      "Separate proteins by charge alone",
    ],
    correctAnswer: 1,
    explanation: "BLAST compares a query sequence against database entries to identify local similarities.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-general-aptitude-set-2"],
    testType: "subject",
    questionText:
      "Suppose a1, a2, ..., a300 are integers such that ai-1 + ai + ai+1 = 2025 for all i = 2, 3, ..., 299. If a7 = -5 and a9 = 37, then the value of a106 is",
    options: ["1993", "37", "-5", "2030"],
    correctAnswer: 2,
    explanation:
      "Subtracting consecutive equations gives ai-1 = ai+2, so the sequence is periodic with period 3. Since 106 ≡ 7 (mod 3), a106 = a7 = -5.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-general-aptitude-set-2"],
    testType: "subject",
    questionText:
      "A recent survey suggests that the total fertility rate in a country has fallen below 2.1, the population replacement ratio. This necessarily implies that the",
    options: [
      "infant mortality rate has increased reducing the net fertility ratio",
      "total population will decline",
      "population of young people is going to increase with a faster rate in the long run if the same status continues",
      "proportion of elderly people is going to decrease in the long run if the same status continues",
    ],
    correctAnswer: 1,
    explanation:
      "If the fertility rate remains below replacement level for a long time and there is no offsetting migration, the population eventually declines. The other statements do not necessarily follow.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-general-aptitude-set-2"],
    testType: "subject",
    questionText:
      "In an exam, questions of three difficulty levels hard, medium, and easy fetch respectively 7, 3, and 2 marks if correct and 0 if incorrect. Three students got 30 marks each but in three different ways, though the total number of questions correctly answered by each student was the same. Then what could be the total number of questions correctly answered by each student?",
    options: ["12", "10", "9", "6"],
    correctAnswer: 1,
    explanation:
      "Let h, m, e be the counts of hard, medium, and easy questions with h + m + e = n and 7h + 3m + 2e = 30. For n = 10, the three distinct solutions are (0,10,0), (1,5,4), and (2,0,8).",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-general-aptitude-set-2"],
    testType: "subject",
    questionText:
      "The value of 1 + (1/2 + 1/3) + (1/4 + 1/5 + 1/6 + 1/7) + ... + (1/2^9 + ... + 1/1023) lies between",
    options: ["2 and 10", "11 and 20", "21 and 30", "31 and 40"],
    correctAnswer: 0,
    explanation:
      "This is the harmonic sum H1023 grouped in powers of two. Since H1023 is about ln(1023) + gamma ≈ 7.5, the value lies between 2 and 10.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-general-aptitude-set-2"],
    testType: "subject",
    questionText:
      "The geometric mean of 100 observations is 25. If each observation is multiplied by 4, what will be the new geometric mean?",
    options: ["100", "50", "25", "(25 x 4)^(1/2)"],
    correctAnswer: 0,
    explanation:
      "If every observation is multiplied by the same positive constant c, then the geometric mean is also multiplied by c. So the new geometric mean is 25 x 4 = 100.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-general-aptitude-set-2"],
    testType: "subject",
    questionText:
      "Which among the following cities can be said most appropriately to bear the same relation to Tamil Nadu that Pune bears to Maharashtra, Surat to Gujarat and Asansol to West Bengal?",
    options: ["Tirupati", "Mysore", "Chennai", "Coimbatore"],
    correctAnswer: 3,
    explanation:
      "Pune, Surat, and Asansol are prominent non-capital cities associated with their respective states. The corresponding city for Tamil Nadu is Coimbatore.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-general-aptitude-set-2"],
    testType: "subject",
    questionText:
      "Two identical metal bars are heated to different temperatures and allowed to cool in the same surroundings. Which one of the following figures correctly shows their cooling curves?",
    questionImage: "/question-assets/cooling-curves-q10.svg",
    options: ["A", "B", "C", "D"],
    correctAnswer: 2,
    explanation:
      "For identical bars in the same surroundings, Newton's law of cooling gives two non-intersecting exponential curves approaching the same ambient temperature. Figure C matches this behaviour.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-general-aptitude-set-2"],
    testType: "subject",
    questionText:
      "A lady bought some apples, each costing Rs. 25, and some bananas each costing Rs. 6, for a total of Rs. 378. In how many ways could she have chosen the numbers of apples and bananas?",
    options: ["1", "2", "3", "4"],
    correctAnswer: 1,
    explanation:
      "Let 25a + 6b = 378 with a, b positive integers. Modulo 6 gives a ≡ 0 (mod 6), so a = 6 or 12. These give b = 38 or 13. Hence there are 2 valid choices.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-advanced-concepts-set-1"],
    testType: "subject",
    questionText:
      "Let gamma_R(t) = 2 + i + R e^(2pi i t) for t in [0,1] and R = 1, 2. Which of the following statements is true?",
    options: [
      "Integral over gamma_1 of tan(z) dz = 2pi i",
      "Integral over gamma_1 of tan(z) dz = -2pi i",
      "Integral over gamma_2 of tan(z) dz = 2pi i",
      "Integral over gamma_2 of tan(z) dz = -2pi i",
    ],
    correctAnswer: 3,
    explanation:
      "tan(z) has simple poles at z = pi/2 + kpi with residue -1. The circle gamma_1 encloses no pole, while gamma_2 encloses only z = pi/2. Therefore the integral over gamma_2 is -2pi i.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-advanced-concepts-set-1"],
    testType: "subject",
    questionText:
      "For a finite group G, let H_G = { g in G | g^15 = e }. Which of the following statements is necessarily true?",
    options: [
      "There exists a finite group G such that |H_G| is even.",
      "There exists a finite group G such that |H_G| = 4n + 1 for some n >= 3.",
      "For every finite group G, there exists a non-negative integer n such that |H_G| = 4n + 1.",
      "For every finite group G, there exists a non-negative integer n such that |H_G| = 4n + 3.",
    ],
    correctAnswer: 1,
    explanation:
      "Take G = C_5 x C_5. Every element satisfies g^15 = e, so |H_G| = 25 = 4 x 6 + 1. The universal statements are false because different groups can give different congruence classes modulo 4.",
    createdBy: adminId,
  },
  {
    category: categoryMap["mathematics-advanced-concepts-set-1"],
    testType: "subject",
    questionText:
      "For a finite group G, let S(G) denote the number of subgroups of G. Which of the following statements is necessarily true?",
    options: [
      "Let G and G' be finite groups such that S(G) = S(G'). Then G is isomorphic to G'.",
      "If S(G) = 4, then G is isomorphic to Z_(p^m) for some prime p and positive integer m.",
      "If S(G) = 5, then G is a cyclic group.",
      "For every positive integer n, there exists a finite group G such that S(G) = n.",
    ],
    correctAnswer: 3,
    explanation:
      "The cyclic group of order p^(n-1) has exactly n subgroups, one for each divisor p^k. Hence every positive integer occurs as the number of subgroups of some finite group.",
    createdBy: adminId,
  },
];

const seed = async () => {
  await connectDB();

  await Promise.all([
    TestAttempt.deleteMany(),
    Question.deleteMany(),
    TestCategory.deleteMany(),
    User.deleteMany(),
  ]);

  const [adminUser, sampleUser] = await User.create([
    {
      name: "Admin User",
      email: "admin@csirmocktest.com",
      password: "Admin@123",
      role: "admin",
    },
    {
      name: "Sample Student",
      email: "student@csirmocktest.com",
      password: "Student@123",
      role: "user",
    },
  ]);

  const createdCategories = await TestCategory.insertMany(categories);
  const categoryMap = createdCategories.reduce((map, category) => {
    map[category.slug] = category._id;
    return map;
  }, {});

  await Question.insertMany(buildQuestions(categoryMap, adminUser._id));

  console.log("Seed data created");
  console.log(`Admin login: ${adminUser.email} / Admin@123`);
  console.log(`Sample user login: ${sampleUser.email} / Student@123`);

  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
