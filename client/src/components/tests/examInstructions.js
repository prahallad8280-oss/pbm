export const instructionLegendItems = [
  { key: "not-visited", label: "You have not visited the question yet." },
  { key: "not-answered", label: "You have not answered the question." },
  { key: "answered", label: "You have answered the question." },
  { key: "review", label: "You have NOT answered the question, but have marked the question for review." },
  { key: "answered-review", label: 'The question(s) "Answered and Marked for Review" will be considered for evaluation.' },
];

export const buildInstructionSections = ({ examName, subjectLabel, durationMinutes }) => [
  {
    title: "General Instructions",
    items: [
      `Total duration of ${examName || "CSIR"} - ${subjectLabel || "MATHEMATIC SCIENCE SET A"} is ${durationMinutes} min.`,
      "The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.",
      "The Questions Palette displayed on the right side of screen will show the status of each question using one of the following symbols:",
      'You can click on the ">" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "<" which appears on the right side of question window.',
      'You can click on your "Profile" image on top right corner of your screen to change the language during the exam for entire question paper. On clicking of Profile image you will get a drop-down to change the question content to the desired language.',
      "You can click on the scroll arrows to navigate to the top or bottom of the question area without scrolling.",
    ],
  },
  {
    title: "Navigating to a Question",
    items: [
      "Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.",
      "Click on Save & Next to save your answer for the current question and then go to the next question.",
      "Click on Mark for Review & Next to save your answer for the current question, mark it for review, and then go to the next question.",
    ],
  },
  {
    title: "Answering a Question",
    items: [
      "To select your answer, click on the button of one of the options.",
      "To deselect your chosen answer, click on the button of the chosen option again or click on the Clear Response button.",
      "To change your chosen answer, click on the button of another option.",
      "To save your answer, you MUST click on the Save & Next button.",
      "To mark the question for review, click on the Mark for Review & Next button.",
      "To change your answer to a question that has already been answered, first select that question for answering and then follow the same procedure again.",
    ],
  },
  {
    title: "Navigating through sections",
    items: [
      "Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by clicking on the section name. The section you are currently viewing is highlighted.",
      "After clicking the Save & Next button on the last question for a section, you will automatically be taken to the first question of the next section.",
      "You can shuffle between sections and questions anytime during the examination as per your convenience, only during the time stipulated.",
      "Candidate can view the corresponding section summary as part of the legend that appears above the question palette.",
      "Please note all questions will appear in your default language. This language can be changed for a particular question later on.",
    ],
  },
];

export const instructionConsentText =
  "I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. / any prohibited material with me into the Examination Hall. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations.";
