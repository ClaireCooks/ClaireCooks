import { useEffect } from 'react'
import { resolvePublicAsset } from '../../utils/assets'

function MediaBlock({ block }) {
  const { type, url, caption } = block.data

  useEffect(() => {
    if (type === 'video' && url.includes('tiktok.com')) {
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      document.body.appendChild(script)
      
      return () => {
        document.body.removeChild(script)
      }
    }
  }, [type, url])

  return (
    <section className="recipe-section media-block">
      {type === 'image' && (
        <figure className="media-figure">
          <img src={resolvePublicAsset(url)} alt={caption || ''} className="media-image" />
          {caption && <figcaption className="media-caption">{caption}</figcaption>}
        </figure>
      )}
      
      {type === 'video' && url.includes('tiktok.com') && (
        <div className="media-video-container">
          <blockquote 
            className="tiktok-embed" 
            cite={url} 
            data-video-id={url.split('/').pop()}
            style={{ maxWidth: '605px', minWidth: '325px' }}
          >
            <section>
              <a target="_blank" title="TikTok Video" href={url} rel="noreferrer">
                View Video on TikTok
              </a>
            </section>
          </blockquote>
          {caption && <p className="media-caption">{caption}</p>}
        </div>
      )}

      {type === 'video' && !url.includes('tiktok.com') && (
        <div className="media-video-link">
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn">
            Watch Video
          </a>
          {caption && <p className="media-caption">{caption}</p>}
        </div>
      )}
    </section>
  )
}

export default MediaBlock
