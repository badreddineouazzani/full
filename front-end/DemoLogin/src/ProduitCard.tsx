interface ProduitCardProps {
  namePr: string;
  categoryName: string;
}

function ProduitCard({ namePr, categoryName }: ProduitCardProps) {
  return (
    <div className="produit-card">
      <h3>{namePr}</h3>
      <p>📂 {categoryName}</p>
    </div>
  );
}


export default ProduitCard;