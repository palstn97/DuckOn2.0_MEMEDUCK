import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ArtistLiveData } from "../../../types/live";
import LiveThumbnailCard from "../room/LiveThumbnailCard";
import ArtistCard from "./ArtistCard";
import { createSlug } from "../../../utils/slugUtils";

interface ArtistLiveSectionProps {
  artistLive: ArtistLiveData;
}

const ArtistLiveSection = ({ artistLive }: ArtistLiveSectionProps) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    // 초기 체크 및 이미지 로드 후 재체크
    const timer = setTimeout(() => {
      checkScroll();
    }, 100);

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        clearTimeout(timer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [artistLive.liveRooms]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const firstCard = container.firstElementChild as HTMLElement;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 16; // gap-4 = 16px
        
        // 모바일: 1개씩, 데스크톱: 3개씩
        const isMobile = window.innerWidth < 768; // md breakpoint
        const scrollCount = isMobile ? 1 : 3;
        const scrollAmount = (cardWidth + gap) * scrollCount;
        
        container.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  const handleArtistClick = () => {
    const slug = createSlug(artistLive.nameEn);
    navigate(`/artist/${slug}`, {
      state: { artistId: artistLive.artistId },
    });
  };

  const handleRoomClick = (roomId: number) => {
    navigate(`/live/${roomId}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center overflow-hidden">
      {/* 아티스트 정보 카드 */}
      <div className="flex-shrink-0 pt-1 flex items-center gap-4">
        <ArtistCard
          artistId={artistLive.artistId}
          nameKr={artistLive.nameKr}
          nameEn={artistLive.nameEn}
          imgUrl={artistLive.imgUrl}
          followerCount={artistLive.followerCount}
          onClick={handleArtistClick}
        />
        
        {/* 모바일 전용: 화살표 버튼 */}
        <div className="flex md:hidden gap-2">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
              aria-label="이전"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
              aria-label="다음"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* 방송 썸네일 스크롤 영역 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 좌측 스크롤 버튼 - 데스크톱 전용 */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
            aria-label="이전"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* 썸네일 리스트 */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none"
          }}
        >
          {artistLive.liveRooms.map((room, index) => (
            <div 
              key={room.roomId} 
              className={`w-[calc(70%-8px)] md:w-[calc(33.333%-10.667px)] flex-shrink-0 snap-start ${index % 3 === 0 ? 'md:snap-start' : ''}`}
            >
              <LiveThumbnailCard
                room={room}
                onClick={() => handleRoomClick(room.roomId)}
              />
            </div>
          ))}
        </div>

        {/* 우측 스크롤 버튼 - 데스크톱 전용 */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
            aria-label="다음"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtistLiveSection;
