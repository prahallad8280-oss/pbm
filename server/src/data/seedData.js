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
