import { useEffect, useState } from "react";

import api from "../../api/client.js";
import QuestionForm from "../../components/admin/QuestionForm.jsx";

const optionLabels = ["A", "B", "C", "D"];

const QuestionManagerPage = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [questionResponse, categoryResponse] = await Promise.all([
        api.get("/admin/questions"),
        api.get("/admin/categories"),
      ]);

      setQuestions(questionResponse.data);
      setCategories(categoryResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load question bank.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError("");

    try {
      if (values._id) {
        await api.put(`/admin/questions/${values._id}`, values);
      } else {
        await api.post("/admin/questions", values);
      }

      setEditingQuestion(null);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Delete this question?")) {
      return;
    }

    try {
      await api.delete(`/admin/questions/${questionId}`);
      setQuestions((current) => current.filter((question) => question._id !== questionId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete question.");
    }
  };

  return (
    <div className="split-layout">
      <QuestionForm
        categories={categories}
        initialValues={editingQuestion}
        onSubmit={handleSubmit}
        onCancel={() => setEditingQuestion(null)}
        submitting={saving}
      />

      <section className="table-card">
        <div className="section-headline">
          <div>
            <p className="section-tag">Question list</p>
            <h3>Manage the existing bank</h3>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <p className="empty-state">Loading questions...</p>
        ) : questions.length ? (
          <div className="stack-list">
            {questions.map((question) => (
              <article key={question._id} className="entity-card">
                <div className="entity-card-header">
                  <div>
                    <p className="pill">{question.category?.testType === "flt" ? "FLT" : "Subject"}</p>
                    <h4>{question.questionText}</h4>
                  </div>
                  <div className="action-row">
                    <button type="button" className="button button-ghost" onClick={() => setEditingQuestion(question)}>
                      Edit
                    </button>
                    <button type="button" className="button button-danger" onClick={() => handleDelete(question._id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <p className="muted-text">
                  Category: {question.category?.name} | Correct answer: {optionLabels[question.correctAnswer]}
                </p>
                {question.questionImage ? <p className="muted-text">Includes question figure</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No questions available yet.</p>
        )}
      </section>
    </div>
  );
};

export default QuestionManagerPage;
