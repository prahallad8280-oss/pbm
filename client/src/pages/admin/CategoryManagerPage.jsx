import { useEffect, useState } from "react";

import api from "../../api/client.js";

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  testType: "subject",
  durationMinutes: 45,
  questionCount: 10,
  isActive: true,
};

const CategoryManagerPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => setForm(emptyCategory);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (form._id) {
        await api.put(`/admin/categories/${form._id}`, form);
      } else {
        await api.post("/admin/categories", form);
      }

      resetForm();
      await loadCategories();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      await api.delete(`/admin/categories/${categoryId}`);
      setCategories((current) => current.filter((category) => category._id !== categoryId));
      if (form._id === categoryId) {
        resetForm();
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete category.");
    }
  };

  return (
    <div className="split-layout">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-card-header">
          <div>
            <p className="section-tag">Test categories</p>
            <h3>{form._id ? "Edit category" : "Create category"}</h3>
          </div>
          {form._id ? (
            <button type="button" className="button button-ghost" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>

        <label className="field">
          <span>Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>

        <label className="field">
          <span>Slug</span>
          <input
            type="text"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="Optional custom slug"
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </label>

        <div className="field-grid">
          <label className="field">
            <span>Test type</span>
            <select
              value={form.testType}
              onChange={(event) => setForm((current) => ({ ...current, testType: event.target.value }))}
            >
              <option value="subject">Subject-wise</option>
              <option value="flt">Full length</option>
            </select>
          </label>

          <label className="field">
            <span>Duration (mins)</span>
            <input
              type="number"
              min="1"
              value={form.durationMinutes}
              onChange={(event) =>
                setForm((current) => ({ ...current, durationMinutes: Number(event.target.value) }))
              }
            />
          </label>

          <label className="field">
            <span>Question count</span>
            <input
              type="number"
              min="1"
              value={form.questionCount}
              onChange={(event) =>
                setForm((current) => ({ ...current, questionCount: Number(event.target.value) }))
              }
            />
          </label>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          <span>Category is active</span>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="button" disabled={saving}>
          {saving ? "Saving..." : form._id ? "Update category" : "Create category"}
        </button>
      </form>

      <section className="table-card">
        <div className="section-headline">
          <div>
            <p className="section-tag">Available categories</p>
            <h3>Control how tests are grouped</h3>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading categories...</p>
        ) : categories.length ? (
          <div className="stack-list">
            {categories.map((category) => (
              <article key={category._id} className="entity-card">
                <div className="entity-card-header">
                  <div>
                    <p className={`pill ${category.testType === "flt" ? "pill-alt" : ""}`}>
                      {category.testType === "flt" ? "FLT" : "Subject"}
                    </p>
                    <h4>{category.name}</h4>
                  </div>
                  <div className="action-row">
                    <button type="button" className="button button-ghost" onClick={() => setForm(category)}>
                      Edit
                    </button>
                    <button type="button" className="button button-danger" onClick={() => handleDelete(category._id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <p>{category.description}</p>
                <p className="muted-text">
                  {category.durationMinutes} mins | {category.questionCount} questions | {category.questionBankSize} in
                  bank
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No categories available yet.</p>
        )}
      </section>
    </div>
  );
};

export default CategoryManagerPage;

