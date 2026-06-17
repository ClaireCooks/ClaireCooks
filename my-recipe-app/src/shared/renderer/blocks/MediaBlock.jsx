import { useEffect } from 'react'
import { useState } from 'react'
import { resolvePublicAsset } from '../../utils/assets'

function MediaBlock({ block }) {
  const { type, url, caption } = block.data
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const mediaUrl = url || ''
  const imageFailed = failedImageUrl === mediaUrl

  useEffect(() => {
    if (type === 'video' && mediaUrl.includes('tiktok.com')) {
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      document.body.appendChild(script)
      
      return () => {
        document.body.removeChild(script)
      }
    }
  }, [type, mediaUrl])

  return (
    <section className="recipe-section media-block">
      {type === 'image' && (
        <figure className="media-figure">
          {imageFailed ? (
            <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="btn">
              Open recipe image
            </a>
          ) : (
            <img
              src={resolvePublicAsset(mediaUrl)}
              alt={caption || ''}
              className="media-image"
              loading="lazy"
              decoding="async"
              onError={() => setFailedImageUrl(mediaUrl)}
            />
          )}
          {caption && <figcaption className="media-caption">{caption}</figcaption>}
        </figure>
      )}
      
      {type === 'video' && mediaUrl.includes('tiktok.com') && (
        <div className="media-video-container">
          <blockquote 
            className="tiktok-embed" 
            cite={mediaUrl} 
            data-video-id={mediaUrl.split('/').pop()}
            style={{ maxWidth: '605px', minWidth: '325px' }}
          >
            <section>
              <a target="_blank" title="TikTok Video" href={mediaUrl} rel="noreferrer">
                View Video on TikTok
              </a>
            </section>
          </blockquote>
          {caption && <p className="media-caption">{caption}</p>}
        </div>
      )}

      {type === 'video' && !mediaUrl.includes('tiktok.com') && (
        <div className="media-video-link">
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="btn">
            Watch Video
          </a>
          {caption && <p className="media-caption">{caption}</p>}
        </div>
      )}
    </section>
  )
}

export default MediaBlock
