import MathText from "../common/MathText.jsx";

const optionLabels = ["A", "B", "C", "D"];

const QuestionCard = ({ question, index, total, selectedAnswer, onSelect }) => (
  <article className="question-card">
    <div className="question-meta">
      <p className="section-tag">
        Question {index + 1} of {total}
      </p>
      <h3>
        <MathText inline text={question.questionText} />
      </h3>
    </div>

    <div className="options-grid">
      {question.options.map((option, optionIndex) => (
        <button
          key={`${question.id}-${optionIndex}`}
          type="button"
          className={`option-button ${selectedAnswer === optionIndex ? "selected" : ""}`}
          onClick={() => onSelect(optionIndex)}
        >
          <span>{optionLabels[optionIndex]}</span>
          <strong>
            <MathText inline text={option} />
          </strong>
        </button>
      ))}
    </div>
  </article>
);

export default QuestionCard;
