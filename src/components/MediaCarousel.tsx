
import { useState, useEffect } from "react";
import type { InstagramMedia } from "@/types/supabase";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  title: string;
  autoplay?: boolean;
  instagramMedia?: InstagramMedia[];
}

export const MediaCarousel = ({ 
  images, 
  videoUrls, 
  title, 
  autoplay = false,
  instagramMedia = []
}: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine all media into one array
  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videoUrls.map(url => ({ type: "video" as const, url })),
    ...instagramMedia.map(media => ({ type: media.type === 'video' ? 'video' as const : 'image' as const, url: media.url }))
  ];

  useEffect(() => {
    if (!autoplay || allMedia.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % allMedia.length);
    }, 5000); // Change media every 5 seconds

    return () => clearInterval(interval);
  }, [autoplay, allMedia.length]);

  if (!allMedia.length) return null;

  const currentMedia = allMedia[currentIndex];

  const getVideoUrl = (url: string) => {
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert YouTube short URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert Instagram video URLs if needed
    if (url.includes('instagram.com/')) {
      if (!url.includes('/embed/')) {
        const postIdMatch = url.match(/\/(?:p|reel)\/([^/?]+)/);
        if (postIdMatch) {
          // Usar formato de incorporação hidrata/minimal para remover UI e preservar proporção
          return `https://www.instagram.com/p/${postIdMatch[1]}/embed/hidrated/?cr=1&v=14&rd=https%3A%2F%2Fwww.instagram.com`;
        }
      }
    }
    return url;
  };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {currentMedia.type === 'video' ? (
        <div className="relative w-full h-0 pb-[100%]">
          {currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be') ? (
            <iframe
              src={getVideoUrl(currentMedia.url)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={title}
            />
          ) : currentMedia.url.includes('instagram.com') ? (
            <iframe
              src={getVideoUrl(currentMedia.url)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={title}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowTransparency
            />
          ) : (
            <video
              src={currentMedia.url}
              autoPlay={autoplay}
              controls={!autoplay}
              loop
              muted={autoplay}
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
              controlsList="nodownload"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          )}
        </div>
      ) : (
        <div className="relative w-full h-0 pb-[100%]">
          {currentMedia.url.includes('instagram.com') ? (
            <iframe
              src={getVideoUrl(currentMedia.url)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={title}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowTransparency
            />
          ) : (
            <img
              src={currentMedia.url}
              alt={title}
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
        </div>
      )}

      {/* Navigation controls */}
      {allMedia.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {allMedia.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
