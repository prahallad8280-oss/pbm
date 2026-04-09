import { useEffect, useMemo, useState } from "react";

import api from "../../api/client.js";
import QuestionForm from "../../components/admin/QuestionForm.jsx";

const emptyTest = {
  name: "",
  slug: "",
  description: "",
  examName: "CSIR",
  subjectLabel: "MATHEMATIC SCIENCE SET A",
  testType: "subject",
  durationMinutes: 45,
  questionCount: 10,
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
      }
    : { ...emptyTest };

const TestBuilderPage = () => {
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

  const loadTests = async (preferredTestId = null) => {
    const { data } = await api.get("/admin/categories");
    setTests(data);

    let nextActiveId = preferredTestId;

    if (nextActiveId && !data.some((test) => test._id === nextActiveId)) {
      nextActiveId = null;
    }

    if (!nextActiveId && data.length) {
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

  const handleSelectTest = async (test) => {
    setTestError("");
    setQuestionError("");
    setActiveTestId(test._id);
    setTestForm(buildTestForm(test));
    setEditingQuestion(null);
    await loadQuestions(test._id);
  };

  const handleCreateNew = () => {
    setActiveTestId(null);
    setTestForm(buildTestForm());
    setQuestions([]);
    setEditingQuestion(null);
    setTestError("");
    setQuestionError("");
  };

  const handleSubmitTest = async (event) => {
    event.preventDefault();
    setSavingTest(true);
    setTestError("");

    try {
      const request = testForm._id
        ? api.put(`/admin/categories/${testForm._id}`, testForm)
        : api.post("/admin/categories", testForm);
      const { data } = await request;

      await loadTests(data._id);
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
      await loadTests(activeTest._id);
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
      await loadTests(activeTest?._id || null);
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

      {testError ? <p className="form-error">{testError}</p> : null}

      <div className="test-builder-layout">
        <aside className="directory-panel">
          <div className="directory-panel-header">
            <div>
              <p className="section-tag">Saved tests</p>
              <h3>Pick one to edit</h3>
            </div>

            <button type="button" className="button button-secondary" onClick={handleCreateNew}>
              New test
            </button>
          </div>

          {tests.length ? (
            <div className="directory-panel-list">
              {tests.map((test) => (
                <button
                  key={test._id}
                  type="button"
                  className={`directory-row ${test._id === activeTestId ? "active" : ""}`}
                  onClick={() => handleSelectTest(test)}
                >
                  <div>
                    <p className="directory-row-title">{test.name}</p>
                    <p className="directory-row-copy">
                      {test.examName || "Exam"} | {test.testType === "flt" ? "Full length" : "Subject-wise"}
                    </p>
                  </div>
                  <span className={`pill ${test.testType === "flt" ? "pill-alt" : ""}`}>
                    {test.questionBankSize}/{test.questionCount}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-state">No tests yet. Start with the metadata form on the right.</p>
          )}
        </aside>

        <div className="editor-stack">
          <section className="workspace-section">
            <div className="section-headline">
              <div>
                <p className="section-tag">Test metadata</p>
                <h3>{testForm._id ? "Edit this test" : "Create a new test"}</h3>
              </div>

              {testForm._id ? (
                <button type="button" className="button button-danger" onClick={handleDeleteTest}>
                  Delete test
                </button>
              ) : null}
            </div>

            <form className="plain-form" onSubmit={handleSubmitTest}>
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
                    onChange={(event) =>
                      setTestForm((current) => ({ ...current, subjectLabel: event.target.value }))
                    }
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
                    onChange={(event) => setTestForm((current) => ({ ...current, testType: event.target.value }))}
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

                <label className="field">
                  <span>Planned question count</span>
                  <input
                    type="number"
                    min="1"
                    value={testForm.questionCount}
                    onChange={(event) =>
                      setTestForm((current) => ({ ...current, questionCount: Number(event.target.value) }))
                    }
                  />
                </label>
              </div>

              <div className="inline-choice-row">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={testForm.isActive}
                    onChange={(event) =>
                      setTestForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
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

          <section className="workspace-section">
            <div className="section-headline">
              <div>
                <p className="section-tag">Questions inside this test</p>
                <h3>{activeTest ? activeTest.name : "Save a test first"}</h3>
              </div>

              {activeTest ? (
                <p className="workspace-meta">
                  {activeTest.questionBankSize} in bank | target {activeTest.questionCount} |{" "}
                  {activeTest.testType === "flt" ? "Full length" : "Subject-wise"}
                </p>
              ) : null}
            </div>

            {questionError ? <p className="form-error">{questionError}</p> : null}

            {activeTest ? (
              <div className="builder-question-layout">
                <QuestionForm
                  categories={tests}
                  defaultCategoryId={activeTest._id}
                  defaultTestType={activeTest.testType}
                  hideCategoryField
                  fixedCategoryName={activeTest.name}
                  fixedCategoryMeta={`${activeTest.examName || "Exam"} | ${
                    activeTest.testType === "flt" ? "Full length" : "Subject-wise"
                  }`}
                  eyebrow="Question bank"
                  title={editingQuestion ? "Edit question" : "Add a question"}
                  initialValues={editingQuestion}
                  onSubmit={handleSubmitQuestion}
                  onCancel={() => setEditingQuestion(null)}
                  submitting={savingQuestion}
                />

                <div className="question-directory">
                  <div className="question-directory-header">
                    <p className="section-tag">Existing questions</p>
                    <span className="muted-text">
                      {questionLoading ? "Refreshing..." : `${questions.length} loaded`}
                    </span>
                  </div>

                  {questionLoading ? (
                    <p className="empty-state">Loading questions...</p>
                  ) : questions.length ? (
                    <div className="question-line-list">
                      {questions.map((question, index) => (
                        <article key={question._id} className="question-line-item">
                          <div>
                            <p className="question-line-title">
                              Q{index + 1}. {question.questionText}
                            </p>
                            <p className="question-line-copy">
                              Correct answer: {optionLabels[question.correctAnswer]}{" "}
                              {question.questionImage ? "| Includes figure" : ""}
                            </p>
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
                    <p className="empty-state">No questions yet. Add the first question from the form on the left.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="empty-state">
                Create and save the test metadata first. After that, the full question bank will open inside this same
                page.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TestBuilderPage;
