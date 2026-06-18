import { FormattedMessage } from 'react-intl'

interface ProduitCardProps {
  namePr: string;
  categoryName: string;
  onDelete: () => void;
  onEdit: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  deleteMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

function categoryHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function ProduitCard({ namePr, categoryName, onDelete, onEdit, canEdit = true, canDelete = true, deleteMode, selected, onToggleSelect }: ProduitCardProps) {
  const hue = categoryHue(categoryName);
  const colorVars = {
    "--cat-color": `hsl(${hue}, 65%, 45%)`,
    "--cat-bg":   `hsl(${hue}, 70%, 92%)`,
  } as React.CSSProperties;

  return (
    <div
      className={`product-card${deleteMode ? ' delete-mode' : ''}${selected ? ' selected' : ''}`}
      style={colorVars}
      onClick={deleteMode ? onToggleSelect : undefined}
    >
      {deleteMode && (
        <div className="card-checkbox">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="product-thumb">📦</div>

      <div className="product-info">
        <h3 className="product-name" title={namePr}>{namePr}</h3>
        <span className="product-category" title={categoryName}>
          <span className="product-category-icon">📂</span>
          {categoryName}
        </span>
      </div>

      {!deleteMode && (canEdit || canDelete) && (
        <div className="card-actions">
          {canEdit && (
            <button className="edit-button" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <span className="edit-icon">✎</span>
              <FormattedMessage id="productCard.edit" />
            </button>
          )}
          {canDelete && (
            <button className="delete-button" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <span className="delete-icon">🗑️</span>
              <FormattedMessage id="productCard.delete" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProduitCard;
