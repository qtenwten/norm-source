export default function Photo({ src, alt, className = '', label }) {
  return (
    <figure className={`norm-photo ${className}`.trim()}>
      <img src={src} alt={alt} />
      {label && <figcaption>{label}</figcaption>}
    </figure>
  )
}
