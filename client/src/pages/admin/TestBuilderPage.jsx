import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import api from "../../api/client.js";
import QuestionForm from "../../components/admin/QuestionForm.jsx";
import MathText from "../../components/common/MathText.jsx";

const buildSingleSection = (overrides = {}) => ({
  key: "main",
  title: "Main section",
  questionCount: 10,
  attemptLimit: 10,
  marksPerQuestion: 1,
  questionType: "mcq",
  ...overrides,
});

const buildCsirSections = () => [
  { key: "part-a", title: "Part A", questionCount: 20, attemptLimit: 15, marksPerQuestion: 2, questionType: "mcq" },
  { key: "part-b", title: "Part B", questionCount: 40, attemptLimit: 25, marksPerQuestion: 3, questionType: "mcq" },
  { key: "part-c", title: "Part C", questionCount: 60, attemptLimit: 20, marksPerQuestion: 4.75, questionType: "msq" },
];

const normalizeSectionKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeSections = (sections = [], fallbackQuestionCount = 10) => {
  const baseSections = Array.isArray(sections) && sections.length ? sections : [buildSingleSection({ questionCount: fallbackQuestionCount, attemptLimit: fallbackQuestionCount })];
  const usedKeys = new Set();

  return baseSections.map((section, index) => {
    const questionCount = Math.max(1, Number(section.questionCount || fallbackQuestionCount || 1));
    const attemptLimit = Math.min(Math.max(1, Number(section.attemptLimit || questionCount)), questionCount);
    const baseKey = normalizeSectionKey(section.key || section.title || `section-${index + 1}`) || `section-${index + 1}`;
    let uniqueKey = baseKey;
    let suffix = 2;

    while (usedKeys.has(uniqueKey)) {
      uniqueKey = `${baseKey}-${suffix}`;
      suffix += 1;
    }

    usedKeys.add(uniqueKey);

    return {
      key: uniqueKey,
      title: section.title || `Section ${index + 1}`,
      questionCount,
      attemptLimit,
      marksPerQuestion: Number(section.marksPerQuestion || 1),
      questionType: section.questionType === "msq" ? "msq" : "mcq",
    };
  });
};

const getQuestionCountTotal = (sections = []) => sections.reduce((total, section) => total + Number(section.questionCount || 0), 0);
const getAttemptLimitTotal = (sections = []) => sections.reduce((total, section) => total + Number(section.attemptLimit || 0), 0);
const getTotalMarks = (sections = []) =>
  sections.reduce((total, section) => total + Number(section.attemptLimit || 0) * Number(section.marksPerQuestion || 0), 0);

const emptyTest = {
  name: "",
  slug: "",
  description: "",
  examName: "CSIR",
  subjectLabel: "MATHEMATIC SCIENCE SET A",
  testType: "subject",
  durationMinutes: 45,
  questionCount: 10,
  sections: [buildSingleSection()],
  isActive: true,
  isDemo: false,
  demoKey: "",
};

const optionLabels = ["A", "B", "C", "D"];

const buildTestForm = (test) =>
  test
    ? {
        ...emptyTest,
        ...test,
        isActive: test.isActive ?? true,
        isDemo: test.isDemo ?? false,
        demoKey: test.demoKey || "",
        sections: normalizeSections(test.sections, test.questionCount || emptyTest.questionCount),
      }
    : { ...emptyTest };

const TestBuilderPage = () => {
  const location = useLocation();
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [activeTestId, setActiveTestId] = useState(null);
  const [testForm, setTestForm] = useState(buildTestForm());
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [savingTest, setSavingTest] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [testError, setTestError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [questionResetSignal, setQuestionResetSignal] = useState(0);

  const activeTest = useMemo(
    () => tests.find((test) => test._id === activeTestId) || null,
    [tests, activeTestId],
  );

  const loadQuestions = async (testId) => {
    if (!testId) {
      setQuestions([]);
      return;
    }

    setQuestionLoading(true);
    setQuestionError("");

    try {
      const { data } = await api.get(`/admin/questions?category=${testId}`);
      setQuestions(data);
    } catch (requestError) {
      setQuestionError(requestError.response?.data?.message || "Failed to load questions for this test.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const loadTests = async ({ preferredTestId = null, autoSelectFirst = true } = {}) => {
    const { data } = await api.get("/admin/categories");
    setTests(data);

    let nextActiveId = preferredTestId;

    if (nextActiveId && !data.some((test) => test._id === nextActiveId)) {
      nextActiveId = null;
    }

    if (!nextActiveId && autoSelectFirst && data.length) {
      nextActiveId = data[0]._id;
    }

    setActiveTestId(nextActiveId);

    const nextActiveTest = data.find((test) => test._id === nextActiveId) || null;
    setTestForm(buildTestForm(nextActiveTest));
    setEditingQuestion(null);

    if (nextActiveId) {
      await loadQuestions(nextActiveId);
    } else {
      setQuestions([]);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadTests();
      } catch (requestError) {
        setTestError(requestError.response?.data?.message || "Failed to load tests.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = location.hash.replace("#", "");
    const target = document.getElementById(targetId);

    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash, tests.length, questions.length]);

  const handleSelectTest = async (test) => {
    setTestError("");
    setQuestionError("");
    setActiveTestId(test._id);
    setTestForm(buildTestForm(test));
    setEditingQuestion(null);
    await loadQuestions(test._id);
    document.getElementById("create-test-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreateNew = () => {
    setActiveTestId(null);
    setTestForm(buildTestForm());
    setQuestions([]);
    setEditingQuestion(null);
    setTestError("");
    setQuestionError("");
  };

  const handleTestTypeChange = (nextTestType) => {
    setTestForm((current) => {
      const hasOnlyDefaultSection =
        current.sections.length === 1 &&
        current.sections[0].key === "main" &&
        current.sections[0].title === "Main section";

      return {
        ...current,
        testType: nextTestType,
        sections:
          nextTestType === "flt" && hasOnlyDefaultSection
            ? buildCsirSections()
            : nextTestType === "subject" && current.sections.every((section) => section.key.startsWith("part-"))
              ? [buildSingleSection({ questionCount: current.questionCount, attemptLimit: current.questionCount })]
              : current.sections,
      };
    });
  };

  const handleSectionChange = (index, field, value) => {
    setTestForm((current) => ({
      ...current,
      sections: normalizeSections(
        current.sections.map((section, sectionIndex) =>
          sectionIndex === index
            ? {
                ...section,
                [field]:
                  field === "questionCount" || field === "attemptLimit" || field === "marksPerQuestion"
                    ? Number(value)
                    : value,
              }
            : section,
        ),
        current.questionCount,
      ),
    }));
  };

  const handleAddSection = () => {
    setTestForm((current) => ({
      ...current,
      sections: normalizeSections(
        [
          ...current.sections,
          {
            key: `section-${current.sections.length + 1}`,
            title: `Section ${current.sections.length + 1}`,
            questionCount: 5,
            attemptLimit: 5,
            marksPerQuestion: 1,
            questionType: "mcq",
          },
        ],
        current.questionCount,
      ),
    }));
  };

  const handleRemoveSection = (index) => {
    setTestForm((current) => ({
      ...current,
      sections: normalizeSections(
        current.sections.filter((_, sectionIndex) => sectionIndex !== index),
        current.questionCount,
      ),
    }));
  };

  const handleLoadCsirPreset = () => {
    setTestForm((current) => ({
      ...current,
      testType: "flt",
      examName: current.examName || "CSIR",
      subjectLabel: current.subjectLabel || "MATHEMATIC SCIENCE SET A",
      durationMinutes: 180,
      sections: buildCsirSections(),
    }));
  };

  const handleSubmitTest = async (event) => {
    event.preventDefault();
    setSavingTest(true);
    setTestError("");

    try {
      const normalizedSections = normalizeSections(testForm.sections, testForm.questionCount);
      const payload = {
        ...testForm,
        sections: normalizedSections,
        questionCount: getQuestionCountTotal(normalizedSections),
      };
      const request = testForm._id
        ? api.put(`/admin/categories/${testForm._id}`, payload)
        : api.post("/admin/categories", payload);
      const { data } = await request;

      if (testForm._id) {
        await loadTests({ preferredTestId: data._id });
      } else {
        await loadTests({ autoSelectFirst: false });
        setTestForm(buildTestForm());
        setActiveTestId(null);
        setQuestions([]);
        document.getElementById("available-tests-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (requestError) {
      setTestError(requestError.response?.data?.message || "Failed to save test.");
    } finally {
      setSavingTest(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!activeTest?._id) {
      return;
    }

    if (!window.confirm("Delete this test? Delete or move its questions first if the bank is not empty.")) {
      return;
    }

    try {
      await api.delete(`/admin/categories/${activeTest._id}`);
      await loadTests();
    } catch (requestError) {
      setTestError(requestError.response?.data?.message || "Failed to delete test.");
    }
  };

  const handleSubmitQuestion = async (values) => {
    if (!activeTest?._id) {
      setQuestionError("Save the test first, then add its questions.");
      return;
    }

    setSavingQuestion(true);
    setQuestionError("");

    try {
      const payload = {
        ...values,
        category: activeTest._id,
        testType: activeTest.testType,
      };

      if (values._id) {
        await api.put(`/admin/questions/${values._id}`, payload);
      } else {
        await api.post("/admin/questions", payload);
      }

      setEditingQuestion(null);
      setQuestionResetSignal((current) => current + 1);
      await loadTests({ preferredTestId: activeTest._id });
    } catch (requestError) {
      setQuestionError(requestError.response?.data?.message || "Failed to save question.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) {
      return;
    }

    try {
      await api.delete(`/admin/questions/${questionId}`);
      await loadTests({ preferredTestId: activeTest?._id || null });
    } catch (requestError) {
      setQuestionError(requestError.response?.data?.message || "Failed to delete question.");
    }
  };

  if (loading) {
    return <div className="screen-state">Loading test workspace...</div>;
  }

  return (
    <div className="page-stack">
      <section className="workspace-intro">
        <p className="section-tag">Create a test</p>
        <h2>Build the test metadata first, then add the question bank inside the same workspace.</h2>
        <p className="workspace-lead">
          Admins and editors can keep the full setup in one place: test identity, duration, demo visibility, and the
          questions that belong to it.
        </p>
      </section>

      <nav className="workspace-switcher" aria-label="Test builder sections">
        <a className="workspace-switch-link" href="#create-test-section">
          Create a test
        </a>
        <a className="workspace-switch-link" href="#available-tests-section">
          Available tests
        </a>
      </nav>

      {testError ? <p className="form-error">{testError}</p> : null}

      <section id="create-test-section" className="workspace-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Create a test</p>
            <h3>{testForm._id ? "Edit this test" : "Create a new test"}</h3>
          </div>

          <div className="action-row">
            {testForm._id ? (
              <button type="button" className="button button-danger" onClick={handleDeleteTest}>
                Delete test
              </button>
            ) : null}

            <button type="button" className="button button-secondary" onClick={handleCreateNew}>
              New test
            </button>
          </div>
        </div>

        {testForm._id ? (
          <p className="workspace-meta">
            You are editing: {testForm.name} | {testForm.examName || "Exam"} |{" "}
            {testForm.testType === "flt" ? "Full length" : "Subject-wise"}
          </p>
        ) : (
          <p className="workspace-meta">
            Start with the test metadata. After saving it, the question bank section will open just below.
          </p>
        )}

        <form className="plain-form" onSubmit={handleSubmitTest} autoComplete="off">
          <p className="field-hint">Text fields support LaTeX. Use <code>\(...\)</code> for inline math or <code>$$...$$</code> for display equations.</p>

          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={testForm.name}
              onChange={(event) => setTestForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Exam name</span>
              <input
                type="text"
                value={testForm.examName}
                onChange={(event) => setTestForm((current) => ({ ...current, examName: event.target.value }))}
                placeholder="CSIR, GATE, OPSC, NBHM"
              />
            </label>

            <label className="field">
              <span>Subject label</span>
              <input
                type="text"
                value={testForm.subjectLabel}
                onChange={(event) => setTestForm((current) => ({ ...current, subjectLabel: event.target.value }))}
                placeholder="MATHEMATIC SCIENCE SET A"
              />
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Slug</span>
              <input
                type="text"
                value={testForm.slug}
                onChange={(event) => setTestForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="Optional custom slug"
              />
            </label>

            <label className="field">
              <span>Test type</span>
              <select
                value={testForm.testType}
                onChange={(event) => handleTestTypeChange(event.target.value)}
              >
                <option value="subject">Subject-wise</option>
                <option value="flt">Full length</option>
              </select>
            </label>
          </div>

          <label className="field">
            <span>Description</span>
            <textarea
              rows="4"
              value={testForm.description}
              onChange={(event) => setTestForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Duration (mins)</span>
              <input
                type="number"
                min="1"
                value={testForm.durationMinutes}
                onChange={(event) =>
                    setTestForm((current) => ({ ...current, durationMinutes: Number(event.target.value) }))
                }
              />
            </label>

            <div className="field fixed-field">
              <span>Test totals</span>
              <div className="fixed-field-value">
                <strong>{getQuestionCountTotal(testForm.sections)} questions</strong>
                <small>
                  Attempt {getAttemptLimitTotal(testForm.sections)} | {getTotalMarks(testForm.sections)} marks
                </small>
              </div>
            </div>
          </div>

          <div className="workspace-section">
            <div className="section-headline">
              <div>
                <p className="section-tag">Sections and scoring</p>
                <h3>Define the section pattern, attempt limits, marks, and question type.</h3>
              </div>

              <div className="action-row">
                <button type="button" className="button button-secondary" onClick={handleLoadCsirPreset}>
                  Use CSIR Part A/B/C
                </button>
                <button type="button" className="button button-ghost" onClick={handleAddSection}>
                  Add section
                </button>
              </div>
            </div>

            <div className="stack-list">
              {testForm.sections.map((section, index) => (
                <div key={`${section.key}-${index}`} className="question-line-item">
                  <div className="plain-form">
                    <div className="field-grid">
                      <label className="field">
                        <span>Section title</span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(event) => handleSectionChange(index, "title", event.target.value)}
                          required
                        />
                      </label>

                      <label className="field">
                        <span>Section key</span>
                        <input
                          type="text"
                          value={section.key}
                          onChange={(event) => handleSectionChange(index, "key", event.target.value)}
                          required
                        />
                      </label>
                    </div>

                    <div className="field-grid">
                      <label className="field">
                        <span>Total questions</span>
                        <input
                          type="number"
                          min="1"
                          value={section.questionCount}
                          onChange={(event) => handleSectionChange(index, "questionCount", event.target.value)}
                        />
                      </label>

                      <label className="field">
                        <span>Attempt limit</span>
                        <input
                          type="number"
                          min="1"
                          max={section.questionCount}
                          value={section.attemptLimit}
                          onChange={(event) => handleSectionChange(index, "attemptLimit", event.target.value)}
                        />
                      </label>
                    </div>

                    <div className="field-grid">
                      <label className="field">
                        <span>Marks per question</span>
                        <input
                          type="number"
                          min="0"
                          step="0.25"
                          value={section.marksPerQuestion}
                          onChange={(event) => handleSectionChange(index, "marksPerQuestion", event.target.value)}
                        />
                      </label>

                      <label className="field">
                        <span>Question type</span>
                        <select
                          value={section.questionType}
                          onChange={(event) => handleSectionChange(index, "questionType", event.target.value)}
                        >
                          <option value="mcq">MCQ</option>
                          <option value="msq">MSQ</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {testForm.sections.length > 1 ? (
                    <button type="button" className="button button-danger" onClick={() => handleRemoveSection(index)}>
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="inline-choice-row">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={testForm.isActive}
                onChange={(event) => setTestForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              <span>Test is active</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={testForm.isDemo}
                onChange={(event) =>
                  setTestForm((current) => ({
                    ...current,
                    isDemo: event.target.checked,
                    demoKey: event.target.checked ? current.demoKey || current.slug || "" : "",
                  }))
                }
              />
              <span>Open this as a public demo test</span>
            </label>
          </div>

          {testForm.isDemo ? (
            <label className="field">
              <span>Demo key</span>
              <input
                type="text"
                value={testForm.demoKey}
                onChange={(event) => setTestForm((current) => ({ ...current, demoKey: event.target.value }))}
                placeholder="example: mathematics-ma-2023-june"
              />
            </label>
          ) : null}

          <div className="editor-actions">
            <button type="submit" className="button" disabled={savingTest}>
              {savingTest ? "Saving..." : testForm._id ? "Update test" : "Create test"}
            </button>
          </div>
        </form>
      </section>

      <section id="available-tests-section" className="workspace-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Available tests</p>
            <h3>Open a saved test and continue working on it.</h3>
          </div>
        </div>

        {tests.length ? (
          <div className="test-line-list">
            {tests.map((test) => (
              <article key={test._id} className="test-line-item">
                <div>
                  <p className={`pill ${test.testType === "flt" ? "pill-alt" : ""}`}>
                    {test.testType === "flt" ? "FLT" : "Subject"}
                  </p>
                  <h4>
                    <MathText inline text={test.name} />
                  </h4>
                  <MathText
                    className="muted-text"
                    text={test.description || "No description added yet."}
                  />
                  <p className="test-line-meta">
                    {test.examName || "Exam"} | {test.questionBankSize}/{test.questionCount} questions | attempt{" "}
                    {test.attemptableCount} | {test.totalMarks} marks | {test.durationMinutes} mins
                  </p>
                </div>

                <div className="action-row">
                  {test._id === activeTestId ? <span className="role-tag role-tag-admin">Open</span> : null}
                  <button type="button" className="button button-ghost" onClick={() => handleSelectTest(test)}>
                    Edit test
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No tests yet. Create the first one from the section above.</p>
        )}
      </section>

      <section id="question-bank-section" className="workspace-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Question bank</p>
            <h3>{activeTest ? `Questions inside ${activeTest.name}` : "Save a test first"}</h3>
          </div>

          {activeTest ? (
            <p className="workspace-meta">
              {activeTest.questionBankSize} in bank | target {activeTest.questionCount} | attempt{" "}
              {activeTest.attemptableCount} | {activeTest.totalMarks} marks |{" "}
              {activeTest.testType === "flt" ? "Full length" : "Subject-wise"}
            </p>
          ) : null}
        </div>

        {questionError ? <p className="form-error">{questionError}</p> : null}

        {activeTest ? (
          <>
            <QuestionForm
              categories={tests}
              defaultCategoryId={activeTest._id}
              defaultTestType={activeTest.testType}
              availableSections={activeTest.sections || []}
              hideCategoryField
              fixedCategoryName={activeTest.name}
              fixedCategoryMeta={`${activeTest.examName || "Exam"} | ${
                activeTest.testType === "flt" ? "Full length" : "Subject-wise"
              }`}
              eyebrow="Question bank"
              title={editingQuestion ? "Edit question" : "Add a question"}
              initialValues={editingQuestion}
              resetSignal={questionResetSignal}
              onSubmit={handleSubmitQuestion}
              onCancel={() => setEditingQuestion(null)}
              submitting={savingQuestion}
            />

            <div className="question-directory">
              <div className="question-directory-header">
                <p className="section-tag">Existing questions</p>
                <span className="muted-text">{questionLoading ? "Refreshing..." : `${questions.length} loaded`}</span>
              </div>

              {questionLoading ? (
                <p className="empty-state">Loading questions...</p>
              ) : questions.length ? (
                <div className="question-line-list">
                  {questions.map((question, index) => (
                    <article key={question._id} className="question-line-item">
                      <div>
                        {(() => {
                          const sectionTitle =
                            activeTest.sections?.find((section) => section.key === question.sectionKey)?.title ||
                            question.sectionKey ||
                            "Section";
                          const answerLabels = (
                            Array.isArray(question.correctAnswers) && question.correctAnswers.length
                              ? question.correctAnswers
                              : [question.correctAnswer]
                          )
                            .filter((value) => value !== null && value !== undefined)
                            .map((value) => optionLabels[value])
                            .join(", ");

                          return (
                            <>
                        <p className="question-line-title">
                          Q{index + 1}. <MathText inline text={question.questionText} />
                        </p>
                        <p className="question-line-copy">
                          {sectionTitle} | {question.questionFormat?.toUpperCase()} | Correct: {answerLabels}
                          {question.questionImage ? " | Includes figure" : ""}
                        </p>
                            </>
                          );
                        })()}
                      </div>

                      <div className="action-row">
                        <button
                          type="button"
                          className="button button-ghost"
                          onClick={() => setEditingQuestion(question)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => handleDeleteQuestion(question._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No questions yet. Add the first question from the form above.</p>
              )}
            </div>
          </>
        ) : (
          <p className="empty-state">
            Create and save the test metadata first. After that, the question bank will open here in the same top to
            bottom flow.
          </p>
        )}
      </section>
    </div>
  );
};

export default TestBuilderPage;
