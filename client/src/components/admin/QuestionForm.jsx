import { useEffect, useState } from "react";

const emptyQuestion = {
  questionText: "",
  category: "",
  testType: "subject",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
};

const buildFormState = (values) =>
  values
    ? {
        ...values,
        category: values.category?._id || values.category || "",
        testType: values.testType || values.category?.testType || "subject",
        options: Array.isArray(values.options) ? [...values.options] : ["", "", "", ""],
        correctAnswer: Number(values.correctAnswer ?? 0),
      }
    : {
        ...emptyQuestion,
        options: [...emptyQuestion.options],
      };

const QuestionForm = ({ categories, initialValues, onCancel, onSubmit, submitting }) => {
  const [form, setForm] = useState(buildFormState(initialValues));

  useEffect(() => {
    setForm(buildFormState(initialValues));
  }, [initialValues]);

  const handleOptionChange = (index, value) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => (optionIndex === index ? value : option)),
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const selectedCategory = categories.find((category) => category._id === categoryId);

    setForm((current) => ({
      ...current,
      category: categoryId,
      testType: selectedCategory?.testType || current.testType,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-card-header">
        <div>
          <p className="section-tag">Question bank</p>
          <h3>{form._id ? "Edit question" : "Add question"}</h3>
        </div>
        {form._id ? (
          <button type="button" className="button button-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <label className="field">
        <span>Question text</span>
        <textarea
          rows="4"
          value={form.questionText}
          onChange={(event) => setForm((current) => ({ ...current, questionText: event.target.value }))}
          required
        />
      </label>

      <div className="field-grid">
        <label className="field">
          <span>Category</span>
          <select value={form.category} onChange={(event) => handleCategoryChange(event.target.value)} required>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Test type</span>
          <select
            value={form.testType}
            onChange={(event) => setForm((current) => ({ ...current, testType: event.target.value }))}
            required
          >
            <option value="subject">Subject-wise</option>
            <option value="flt">Full length</option>
          </select>
        </label>
      </div>

      {form.options.map((option, index) => (
        <label key={`option-${index}`} className="field">
          <span>Option {index + 1}</span>
          <input
            type="text"
            value={option}
            onChange={(event) => handleOptionChange(index, event.target.value)}
            required
          />
        </label>
      ))}

      <label className="field">
        <span>Correct answer</span>
        <select
          value={form.correctAnswer}
          onChange={(event) => setForm((current) => ({ ...current, correctAnswer: Number(event.target.value) }))}
          required
        >
          <option value={0}>Option 1</option>
          <option value={1}>Option 2</option>
          <option value={2}>Option 3</option>
          <option value={3}>Option 4</option>
        </select>
      </label>

      <label className="field">
        <span>Explanation</span>
        <textarea
          rows="4"
          value={form.explanation}
          onChange={(event) => setForm((current) => ({ ...current, explanation: event.target.value }))}
          required
        />
      </label>

      <button type="submit" className="button" disabled={submitting}>
        {submitting ? "Saving..." : form._id ? "Update question" : "Create question"}
      </button>
    </form>
  );
};

export default QuestionForm;
