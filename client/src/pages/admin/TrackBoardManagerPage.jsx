import { useEffect, useMemo, useState } from "react";

import api from "../../api/client.js";
import MathText from "../../components/common/MathText.jsx";
import { examTracks } from "../../data/examTracks.js";

const emptyBoard = {
  trackSlug: "csir-net",
  title: "",
  isActive: true,
  items: [{ title: "", link: "" }],
};

const getTrackTitle = (slug) => examTracks.find((track) => track.slug === slug)?.title || slug;

const normalizeBoard = (board) =>
  board
    ? {
        _id: board._id,
        trackSlug: board.trackSlug,
        title: board.title,
        isActive: board.isActive ?? true,
        items: Array.isArray(board.items) && board.items.length ? board.items.map((item) => ({ ...item })) : [{ title: "", link: "" }],
      }
    : {
        ...emptyBoard,
        items: emptyBoard.items.map((item) => ({ ...item })),
      };

const TrackBoardManagerPage = () => {
  const [boards, setBoards] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [form, setForm] = useState(normalizeBoard());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const visibleBoards = useMemo(
    () => (selectedTrack === "all" ? boards : boards.filter((board) => board.trackSlug === selectedTrack)),
    [boards, selectedTrack],
  );

  const loadBoards = async () => {
    try {
      const { data } = await api.get("/admin/track-boards");
      setBoards(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load track boards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const resetForm = () => setForm(normalizeBoard());

  const handleItemChange = (index, key, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const handleAddItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, { title: "", link: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        items: form.items.filter((item) => item.title.trim() || item.link.trim()),
      };

      if (form._id) {
        await api.put(`/admin/track-boards/${form._id}`, payload);
      } else {
        await api.post("/admin/track-boards", payload);
      }

      resetForm();
      await loadBoards();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save track board.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (boardId) => {
    if (!window.confirm("Delete this board?")) {
      return;
    }

    try {
      await api.delete(`/admin/track-boards/${boardId}`);
      setBoards((current) => current.filter((board) => board._id !== boardId));
      if (form._id === boardId) {
        resetForm();
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete track board.");
    }
  };

  return (
    <div className="page-stack">
      <section className="workspace-intro">
        <p className="section-tag">Track boards</p>
        <h2>Create expandable sections like "Give Mock Test" or "PYQ" for each public exam page.</h2>
        <p className="workspace-lead">
          Each board appears as a full-width clickable button on the exam page. When students click it, the related
          links drop down underneath.
        </p>
      </section>

      <section className="workspace-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Create or edit board</p>
            <h3>{form._id ? "Update board" : "Add a new board"}</h3>
          </div>
        </div>

        <form className="plain-form" onSubmit={handleSubmit} autoComplete="off">
          <p className="field-hint">Board titles and item titles also support LaTeX, so mathematics topic names can be written naturally.</p>

          <div className="field-grid">
            <label className="field">
              <span>Track</span>
              <select
                value={form.trackSlug}
                onChange={(event) => setForm((current) => ({ ...current, trackSlug: event.target.value }))}
              >
                {examTracks.map((track) => (
                  <option key={track.slug} value={track.slug}>
                    {track.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Board title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Give Mock Test, PYQ, Topic Lists"
                required
              />
            </label>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            <span>Show this board on the public exam page</span>
          </label>

          <div className="board-item-editor">
            <div className="section-headline">
              <div>
                <p className="section-tag">Dropdown items</p>
                <h3>Links shown when the board opens</h3>
              </div>

              <button type="button" className="button button-secondary" onClick={handleAddItem}>
                Add item
              </button>
            </div>

            <div className="board-item-list">
              {form.items.map((item, index) => (
                <div key={`board-item-${index}`} className="board-item-row">
                  <label className="field">
                    <span>Item title</span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(event) => handleItemChange(index, "title", event.target.value)}
                      placeholder="CSIR NET Unit 1 Mock Test"
                    />
                  </label>

                  <label className="field">
                    <span>Link</span>
                    <input
                      type="text"
                      value={item.link}
                      onChange={(event) => handleItemChange(index, "link", event.target.value)}
                      placeholder="/tests/start/test-id or /exam-tracks/csir-net"
                    />
                  </label>

                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => handleRemoveItem(index)}
                    disabled={form.items.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="action-row">
            <button type="submit" className="button" disabled={saving}>
              {saving ? "Saving..." : form._id ? "Update board" : "Create board"}
            </button>
            <button type="button" className="button button-ghost" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="workspace-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Saved boards</p>
            <h3>Manage the expandable public-track sections</h3>
          </div>

          <label className="field field-inline">
            <span>Filter by track</span>
            <select value={selectedTrack} onChange={(event) => setSelectedTrack(event.target.value)}>
              <option value="all">All tracks</option>
              {examTracks.map((track) => (
                <option key={track.slug} value={track.slug}>
                  {track.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="empty-state">Loading track boards...</p>
        ) : visibleBoards.length ? (
          <div className="test-line-list">
            {visibleBoards.map((board) => (
              <article key={board._id} className="test-line-item">
                <div>
                  <p className={`pill ${board.isActive ? "" : "pill-danger"}`}>{getTrackTitle(board.trackSlug)}</p>
                  <h4>
                    <MathText inline text={board.title} />
                  </h4>
                  <p className="test-line-meta">
                    {board.items.length} dropdown item{board.items.length === 1 ? "" : "s"} |{" "}
                    {board.isActive ? "Visible on public page" : "Hidden"}
                  </p>
                  <MathText className="muted-text" text={board.items.map((item) => item.title).join(" | ")} />
                </div>

                <div className="action-row">
                  <button type="button" className="button button-ghost" onClick={() => setForm(normalizeBoard(board))}>
                    Edit
                  </button>
                  <button type="button" className="button button-danger" onClick={() => handleDelete(board._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No boards created yet for this track filter.</p>
        )}
      </section>
    </div>
  );
};

export default TrackBoardManagerPage;
