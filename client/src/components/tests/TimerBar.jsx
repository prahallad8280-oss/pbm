const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const TimerBar = ({ secondsLeft, progress }) => (
  <section className="timer-card">
    <div className="timer-header">
      <div>
        <p className="section-tag">Timer</p>
        <h3>{formatTime(secondsLeft)}</h3>
      </div>
      <span>{Math.max(Math.round(progress), 0)}% remaining</span>
    </div>
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.max(progress, 0)}%` }} />
    </div>
  </section>
);

export default TimerBar;

