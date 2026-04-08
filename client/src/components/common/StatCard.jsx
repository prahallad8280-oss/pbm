const StatCard = ({ label, value, hint }) => (
  <article className="stat-card">
    <p>{label}</p>
    <h3>{value}</h3>
    {hint ? <span>{hint}</span> : null}
  </article>
);

export default StatCard;

