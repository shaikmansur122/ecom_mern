const TINTS = {
  Electronics: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
  Fashion: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
  Home: 'linear-gradient(135deg, #fef3c7, #fde68a)',
  Sports: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
};

export default function ProductThumb({ product, size = 'md' }) {
  return (
    <div className={`thumb thumb-${size}`} style={{ background: TINTS[product.category] ?? '#eef0f5' }}>
      <span role="img" aria-label={product.name}>
        {product.emoji}
      </span>
    </div>
  );
}
