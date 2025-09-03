import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/index.ts";
import {
  deleteDraftFromStorage,
  deleteAllDraftsFromStorage,
} from "@/store/features/drafts/index.ts";
import { loadFormData } from "@/store/features/serviceForm/index.ts";
import { Draft } from "@/types/serviceLog";
import "./DraftManager.css";
import { useNavigate } from "@tanstack/react-router";

function DraftManager() {
  const { drafts, isLoading, error } = useSelector(
    (state: RootState) => state.drafts,
  );
  const navigate = useNavigate({ from: "/drafts" });
  const dispatch = useDispatch<AppDispatch>();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleLoadDraft = (draft: Draft) => {
    dispatch(loadFormData(draft.data));
    navigate({ to: "/" });
  };

  const handleDeleteDraft = (draftId: string, title: string) => {
    if (confirm(`Delete draft "${title}"?`)) {
      dispatch(deleteDraftFromStorage(draftId));
    }
  };

  const handleDeleteAll = () => {
    if (drafts.length > 0 && confirm(`Delete all ${drafts.length} drafts?`)) {
      dispatch(deleteAllDraftsFromStorage());
    }
  };

  return (
    <div className="draft-manager">
      <div className="draft-manager__header">
        <h2 className="draft-manager__title">Saved Drafts ({drafts.length})</h2>
        {drafts.length > 0 && (
          <button
            type="button"
            className="draft-manager__delete-all"
            onClick={handleDeleteAll}
            disabled={isLoading}
          >
            Delete All
          </button>
        )}
      </div>

      {error && <div className="draft-manager__error">Error: {error}</div>}

      {isLoading && (
        <div className="draft-manager__loading">Loading drafts...</div>
      )}

      {!isLoading && drafts.length === 0 ? (
        <div className="draft-manager__empty">
          <p>No saved drafts yet.</p>
          <p>Use "Save as Draft" in the form to create your first draft.</p>
        </div>
      ) : (
        <div className="draft-manager__list">
          {drafts.map((draft) => (
            <div key={draft.id} className="draft-item">
              <div className="draft-item__info">
                <h3 className="draft-item__title">{draft.title}</h3>
                <div className="draft-item__meta">
                  <small>Created: {formatDate(draft.createdAt)}</small>
                  {draft.updatedAt !== draft.createdAt && (
                    <small>Updated: {formatDate(draft.updatedAt)}</small>
                  )}
                </div>
                <div className="draft-item__preview">
                  <small>
                    {draft.data.carId && `Car: ${draft.data.carId} • `}
                    {draft.data.type && `Type: ${draft.data.type} • `}
                    {draft.data.serviceDescription &&
                      `Description: ${draft.data.serviceDescription.slice(0, 50)}${
                        draft.data.serviceDescription.length > 50 ? "..." : ""
                      }`}
                  </small>
                </div>
              </div>
              <div className="draft-item__actions">
                <button
                  type="button"
                  className="draft-item__button draft-item__button--load"
                  onClick={() => handleLoadDraft(draft)}
                  disabled={isLoading}
                >
                  Load
                </button>
                <button
                  type="button"
                  className="draft-item__button draft-item__button--delete"
                  onClick={() => handleDeleteDraft(draft.id, draft.title)}
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DraftManager;