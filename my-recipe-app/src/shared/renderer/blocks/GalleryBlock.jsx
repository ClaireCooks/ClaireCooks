import { resolvePublicAsset } from '../../utils/assets'

function GalleryBlock({ block }) {
  const { images = [], caption } = block.data
  const visibleImages = images.filter(Boolean)

  if (visibleImages.length === 0) {
    return null
  }

  return (
    <section className="recipe-section gallery-block">
      <div className="gallery-grid">
        {visibleImages.map((image, index) => (
          <img
            src={resolvePublicAsset(image)}
            alt=""
            key={`${image}-${index}`}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
      {caption ? <p className="media-caption">{caption}</p> : null}
    </section>
  )
}

export default GalleryBlock
