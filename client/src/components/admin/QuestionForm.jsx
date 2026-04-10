import { useEffect, useMemo, useState } from "react";

const emptyQuestion = {
  questionText: "",
  questionImage: "",
  category: "",
  testType: "subject",
  sectionKey: "",
  questionFormat: "mcq",
  options: ["", "", "", ""],
  correctAnswers: [0],
  explanation: "",
};

const normalizeAnswers = (values = {}) => {
  const rawAnswers =
    Array.isArray(values.correctAnswers) && values.correctAnswers.length
      ? values.correctAnswers
      : values.correctAnswer === null || values.correctAnswer === undefined
        ? []
        : [values.correctAnswer];

  const answers = [...new Set(rawAnswers.map((value) => Number(value)).filter((value) => value >= 0 && value <= 3))].sort(
    (left, right) => left - right,
  );

  return answers.length ? answers : [0];
};

const buildFormState = (values, defaults = {}) =>
  values
    ? {
        ...emptyQuestion,
        ...defaults,
        ...values,
        category: values.category?._id || values.category || "",
        testType: values.testType || values.category?.testType || defaults.testType || "subject",
        sectionKey: values.sectionKey || defaults.sectionKey || "",
        questionFormat: values.questionFormat || defaults.questionFormat || "mcq",
        options: Array.isArray(values.options) ? [...values.options] : ["", "", "", ""],
        correctAnswers: normalizeAnswers(values),
      }
    : {
        ...emptyQuestion,
        ...defaults,
        options: [...emptyQuestion.options],
        correctAnswers: normalizeAnswers(defaults),
      };

const QuestionForm = ({
  categories,
  initialValues,
  onCancel,
  onSubmit,
  submitting,
  defaultCategoryId = "",
  defaultTestType = "subject",
  availableSections = [],
  hideCategoryField = false,
  fixedCategoryName = "",
  fixedCategoryMeta = "",
  eyebrow = "Question bank",
  title,
  resetSignal = 0,
}) => {
  const defaults = useMemo(
    () => ({
      category: defaultCategoryId,
      testType: defaultTestType,
      sectionKey: availableSections[0]?.key || "",
      questionFormat: availableSections[0]?.questionType || "mcq",
    }),
    [defaultCategoryId, defaultTestType, availableSections],
  );
  const [form, setForm] = useState(buildFormState(initialValues, defaults));

  const currentSections = useMemo(() => {
    if (hideCategoryField) {
      return availableSections;
    }

    const selectedCategory = categories.find((category) => category._id === form.category);
    return selectedCategory?.sections?.length
      ? selectedCategory.sections
      : availableSections;
  }, [availableSections, categories, form.category, hideCategoryField]);

  const currentSection = currentSections.find((section) => section.key === form.sectionKey) || currentSections[0] || null;

  useEffect(() => {
    setForm(buildFormState(initialValues, defaults));
  }, [initialValues, defaults, resetSignal]);

  const handleOptionChange = (index, value) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => (optionIndex === index ? value : option)),
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const selectedCategory = categories.find((category) => category._id === categoryId);
    const nextSections = selectedCategory?.sections?.length ? selectedCategory.sections : [];
    const nextSection = nextSections[0] || null;

    setForm((current) => ({
      ...current,
      category: categoryId,
      testType: selectedCategory?.testType || current.testType,
      sectionKey: nextSection?.key || "",
      questionFormat: nextSection?.questionType || current.questionFormat,
    }));
  };

  const handleSectionChange = (nextSectionKey) => {
    const matchedSection = currentSections.find((section) => section.key === nextSectionKey);

    setForm((current) => ({
      ...current,
      sectionKey: nextSectionKey,
      questionFormat: matchedSection?.questionType || current.questionFormat,
      correctAnswers:
        (matchedSection?.questionType || current.questionFormat) === "mcq"
          ? [current.correctAnswers[0] ?? 0]
          : current.correctAnswers,
    }));
  };

  const handleQuestionFormatChange = (nextQuestionFormat) => {
    setForm((current) => ({
      ...current,
      questionFormat: nextQuestionFormat,
      correctAnswers: nextQuestionFormat === "mcq" ? [current.correctAnswers[0] ?? 0] : current.correctAnswers,
    }));
  };

  const handleCorrectAnswerToggle = (optionIndex) => {
    setForm((current) => {
      if (current.questionFormat === "mcq") {
        return {
          ...current,
          correctAnswers: [optionIndex],
        };
      }

      const alreadySelected = current.correctAnswers.includes(optionIndex);
      const nextAnswers = alreadySelected
        ? current.correctAnswers.filter((value) => value !== optionIndex)
        : [...current.correctAnswers, optionIndex].sort((left, right) => left - right);

      return {
        ...current,
        correctAnswers: nextAnswers.length ? nextAnswers : current.correctAnswers,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      correctAnswers: form.correctAnswers,
      correctAnswer: form.correctAnswers[0] ?? 0,
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit} autoComplete="off">
      <div className="form-card-header">
        <div>
          <p className="section-tag">{eyebrow}</p>
          <h3>{title || (form._id ? "Edit question" : "Add question")}</h3>
        </div>
        {form._id ? (
          <button type="button" className="button button-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <p className="field-hint">LaTeX is supported here. Use <code>\(...\)</code> for inline math or <code>$$...$$</code> for display equations.</p>

      <label className="field">
        <span>Question text</span>
        <textarea
          rows="4"
          value={form.questionText}
          onChange={(event) => setForm((current) => ({ ...current, questionText: event.target.value }))}
          required
        />
      </label>

      <label className="field">
        <span>Question image</span>
        <input
          type="text"
          value={form.questionImage}
          onChange={(event) => setForm((current) => ({ ...current, questionImage: event.target.value }))}
          placeholder="Optional image path or URL like /question-assets/example.svg"
        />
      </label>

      <div className="field-grid">
        {hideCategoryField ? (
          <div className="field fixed-field">
            <span>Test</span>
            <div className="fixed-field-value">
              <strong>{fixedCategoryName || "Selected test"}</strong>
              {fixedCategoryMeta ? <small>{fixedCategoryMeta}</small> : null}
            </div>
          </div>
        ) : (
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
        )}

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

      <div className="field-grid">
        <label className="field">
          <span>Section</span>
          <select value={form.sectionKey} onChange={(event) => handleSectionChange(event.target.value)} required>
            <option value="">Select section</option>
            {currentSections.map((section) => (
              <option key={section.key} value={section.key}>
                {section.title}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Question type</span>
          <select
            value={form.questionFormat}
            onChange={(event) => handleQuestionFormatChange(event.target.value)}
            disabled={Boolean(currentSection)}
            required
          >
            <option value="mcq">MCQ</option>
            <option value="msq">MSQ</option>
          </select>
        </label>
      </div>

      {currentSection ? (
        <p className="field-hint">
          {currentSection.title}: {currentSection.questionType.toUpperCase()} | attempt {currentSection.attemptLimit}/
          {currentSection.questionCount} | {currentSection.marksPerQuestion} marks per question
        </p>
      ) : null}

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

      <fieldset className="field">
        <span>Correct answer{form.questionFormat === "msq" ? "s" : ""}</span>
        <div className="inline-choice-row">
          {form.options.map((option, index) => (
            <label key={`correct-option-${index}`} className="checkbox-row">
              <input
                type={form.questionFormat === "msq" ? "checkbox" : "radio"}
                name="correct-answer"
                checked={form.correctAnswers.includes(index)}
                onChange={() => handleCorrectAnswerToggle(index)}
              />
              <span>Option {index + 1}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Explanation (optional)</span>
        <textarea
          rows="4"
          value={form.explanation}
          onChange={(event) => setForm((current) => ({ ...current, explanation: event.target.value }))}
          placeholder="Optional solution or hint"
        />
      </label>

      <button type="submit" className="button" disabled={submitting}>
        {submitting ? "Saving..." : form._id ? "Update question" : "Create question"}
      </button>
    </form>
  );
};

export default QuestionForm;
