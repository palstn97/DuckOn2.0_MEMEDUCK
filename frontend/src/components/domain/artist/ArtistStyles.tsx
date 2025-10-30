import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { type Artist } from "../../../types/artist";

const PLACEHOLDER_URL = "https://placehold.co/240x240/f8f8f8/999999?text=No+Image&font=roboto";

interface ArtistStyleProps {
  artists: Artist[];
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  onCardClick: (artistId: number, nameEn: string) => void;
  carouselIndex?: number;
  setCarouselIndex?: (index: number) => void;
}

// 스타일 0: 3D 틸트 효과
export const Style3DTilt = ({ artists, hoveredIndex, setHoveredIndex, onCardClick }: ArtistStyleProps) => {
  const gradients = [
    'from-purple-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-orange-400 to-red-500',
    'from-indigo-400 to-purple-500'
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {artists.map((artist, index) => {
        const isHovered = hoveredIndex === index;
        
        return (
          <div
            key={artist.artistId}
            className="group perspective-1000"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={`relative bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl p-[2px] cursor-pointer transition-all duration-500`}
              style={{
                transform: isHovered ? 'rotateY(10deg) rotateX(5deg) scale(1.05)' : 'rotateY(0deg) rotateX(0deg) scale(1)',
                transformStyle: 'preserve-3d'
              }}
              onClick={() => onCardClick(artist.artistId, artist.nameEn)}
            >
              <div className="bg-white rounded-2xl p-5 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-tr ${gradients[index % gradients.length]} opacity-0 transition-opacity duration-500 ${
                  isHovered ? 'opacity-20' : ''
                }`}>
                  <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full animate-ping" />
                  <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-pulse" />
                  <div className="absolute bottom-3 left-5 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-32 h-32 rounded-full overflow-hidden mb-4 ring-4 ring-white shadow-xl transition-all duration-500 ${
                    isHovered ? 'ring-offset-4' : 'ring-offset-2'
                  }`}>
                    <img
                      src={artist.imgUrl || PLACEHOLDER_URL}
                      alt={artist.nameEn}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isHovered ? 'scale-125 rotate-3' : 'scale-100'
                      }`}
                    />
                  </div>
                  <p className={`font-bold text-lg truncate w-full text-center transition-all ${
                    isHovered ? 'text-transparent bg-clip-text bg-gradient-to-r ' + gradients[index % gradients.length] : 'text-gray-800'
                  }`}>
                    {artist.nameKr}
                  </p>
                  <p className="text-xs text-gray-500 truncate w-full text-center mt-1">
                    {artist.nameEn}
                  </p>
                  <div className="mt-3 text-xs text-gray-600">
                    {new Date(artist.debutDate).getFullYear()}년 데뷔
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 스타일 1: 캐러셀
export const StyleCarousel = ({ artists, hoveredIndex, setHoveredIndex, onCardClick, carouselIndex = 0, setCarouselIndex }: ArtistStyleProps) => {
  return (
    <div className="relative">
      {artists.length > 3 && (
        <button
          onClick={() => setCarouselIndex?.(Math.max(0, carouselIndex - 1))}
          disabled={carouselIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 flex items-center justify-center bg-white hover:bg-purple-50 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
        >
          <ChevronLeft size={24} className="text-purple-600" />
        </button>
      )}

      <div className="overflow-hidden px-2">
        <div
          className="flex gap-6 transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${carouselIndex * (100 / 3)}%)`,
          }}
        >
          {artists.map((artist, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={artist.artistId}
                className="flex-shrink-0 w-[calc(33.333%-16px)]"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 p-6 cursor-pointer transition-all duration-500 overflow-hidden ${
                    isHovered ? "border-purple-400 shadow-2xl shadow-purple-200/50 -translate-y-3 scale-105" : "border-purple-200 shadow-md"
                  }`}
                  onClick={() => onCardClick(artist.artistId, artist.nameEn)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 opacity-0 transition-opacity duration-500 ${
                    isHovered ? "opacity-100" : ""
                  }`} />
                  <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-0 transition-opacity duration-500 ${
                    isHovered ? "opacity-20" : ""
                  }`} />
                  
                  <div className="relative flex flex-col items-center">
                    <div className={`relative w-40 h-40 rounded-full overflow-hidden shadow-lg mb-4 ring-4 transition-all duration-500 ${
                      isHovered ? "ring-purple-400 ring-offset-4" : "ring-white ring-offset-2"
                    }`}>
                      <img
                        src={artist.imgUrl || PLACEHOLDER_URL}
                        alt={artist.nameEn}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isHovered ? "scale-110" : "scale-100"
                        }`}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent opacity-0 transition-opacity duration-500 ${
                        isHovered ? "opacity-100" : ""
                      }`} />
                    </div>
                    
                    <div className="text-center w-full">
                      <p className={`font-bold text-xl text-gray-800 truncate transition-all duration-300 ${
                        isHovered ? "text-purple-700 scale-105" : ""
                      }`}>
                        {artist.nameKr}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-1">{artist.nameEn}</p>
                    </div>
                    
                    <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      isHovered ? "bg-purple-600 text-white scale-110" : "bg-white text-purple-600"
                    }`}>
                      <Users className="h-4 w-4" />
                      <span className="font-semibold text-sm">
                        {new Date(artist.debutDate).getFullYear()} 데뷔
                      </span>
                    </div>
                    
                    <div className={`mt-3 transition-all duration-300 ${
                      isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}>
                      <span className="text-purple-600 font-semibold text-sm flex items-center gap-1">
                        보러가기 <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {artists.length > 3 && (
        <>
          <button
            onClick={() => {
              const maxIndex = Math.max(0, artists.length - 3);
              setCarouselIndex?.(Math.min(maxIndex, carouselIndex + 1));
            }}
            disabled={carouselIndex >= Math.max(0, artists.length - 3)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 flex items-center justify-center bg-white hover:bg-purple-50 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          >
            <ChevronRight size={24} className="text-purple-600" />
          </button>
          
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.max(0, artists.length - 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCarouselIndex?.(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === carouselIndex ? "bg-purple-600 w-8" : "bg-purple-200 w-2 hover:bg-purple-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 스타일 2: 호버 확장
export const StyleHoverExpand = ({ artists, hoveredIndex, setHoveredIndex, onCardClick }: ArtistStyleProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {artists.map((artist, index) => {
        const isHovered = hoveredIndex === index;
        
        return (
          <div
            key={artist.artistId}
            className={`relative cursor-pointer transition-all duration-500 ${
              isHovered ? 'md:col-span-2 z-20' : 'z-10'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onCardClick(artist.artistId, artist.nameEn)}
          >
            <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
              isHovered ? 'shadow-2xl scale-105' : 'shadow-lg'
            }`}>
              <div className={`relative ${isHovered ? 'h-80' : 'h-60'} transition-all duration-500`}>
                <img
                  src={artist.imgUrl || PLACEHOLDER_URL}
                  alt={artist.nameEn}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-500 ${
                  isHovered ? 'from-black/80 via-black/40 to-transparent' : 'from-black/60 to-transparent'
                }`} />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className={`font-bold transition-all duration-300 ${
                  isHovered ? 'text-2xl mb-2' : 'text-lg mb-1'
                }`}>
                  {artist.nameKr}
                </p>
                <p className={`text-sm text-white/80 transition-all duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-70'
                }`}>
                  {artist.nameEn}
                </p>
                {isHovered && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      {new Date(artist.debutDate).getFullYear()}년 데뷔
                    </div>
                    <div className="flex-1" />
                    <ChevronRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 스타일 3: 파도 효과
export const StyleWave = ({ artists, hoveredIndex, setHoveredIndex, onCardClick }: ArtistStyleProps) => {
  return (
    <>
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      <div className="flex flex-wrap justify-center gap-8">
        {artists.map((artist, index) => {
          const isHovered = hoveredIndex === index;
          
          return (
            <div
              key={artist.artistId}
              className="w-[180px]"
              style={{
                animation: `wave 3s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`relative bg-white rounded-3xl p-5 cursor-pointer transition-all duration-500 ${
                  isHovered
                    ? 'shadow-2xl shadow-purple-500/50 -translate-y-6 scale-110'
                    : 'shadow-lg hover:shadow-xl'
                }`}
                onClick={() => onCardClick(artist.artistId, artist.nameEn)}
              >
                <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-3xl blur-lg opacity-0 transition-opacity duration-500 ${
                  isHovered ? 'opacity-75 animate-pulse' : ''
                }`} />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`relative w-36 h-36 rounded-full overflow-hidden mb-4 transition-all duration-500 ${
                    isHovered ? 'ring-4 ring-purple-500 ring-offset-4' : ''
                  }`}>
                    <img
                      src={artist.imgUrl || PLACEHOLDER_URL}
                      alt={artist.nameEn}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        isHovered ? 'scale-125 rotate-12' : 'scale-100'
                      }`}
                    />
                    {isHovered && (
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-600/60 to-transparent animate-pulse" />
                    )}
                  </div>
                  
                  <p className={`font-bold text-center truncate w-full transition-all duration-300 ${
                    isHovered ? 'text-xl text-purple-600 scale-110' : 'text-lg text-gray-800'
                  }`}>
                    {artist.nameKr}
                  </p>
                  <p className="text-sm text-gray-500 truncate w-full text-center mt-1">
                    {artist.nameEn}
                  </p>
                  
                  {isHovered && (
                    <div className="mt-3 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold animate-bounce">
                      {new Date(artist.debutDate).getFullYear()}년 데뷔
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// 스타일 4: Bento 그리드
export const StyleBento = ({ artists, hoveredIndex, setHoveredIndex, onCardClick }: ArtistStyleProps) => {
  const gridClasses = [
    'col-span-2 row-span-2',
    'col-span-2 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
  ];

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
      {artists.slice(0, 5).map((artist, index) => {
        const isHovered = hoveredIndex === index;
        
        return (
          <div
            key={artist.artistId}
            className={`${gridClasses[index]} relative overflow-hidden rounded-3xl cursor-pointer group transition-all duration-500 ${
              isHovered ? 'scale-[1.02] z-10' : ''
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onCardClick(artist.artistId, artist.nameEn)}
          >
            <img
              src={artist.imgUrl || PLACEHOLDER_URL}
              alt={artist.nameEn}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
            
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-70'
            }`} />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className={`font-bold mb-2 transition-all duration-300 ${
                index === 0 ? (isHovered ? 'text-4xl' : 'text-3xl') : (isHovered ? 'text-2xl' : 'text-xl')
              }`}>
                {artist.nameKr}
              </p>
              <p className={`text-white/80 transition-all duration-300 ${
                index === 0 ? 'text-base' : 'text-sm'
              }`}>
                {artist.nameEn}
              </p>
              <div className={`mt-2 transition-all duration-300 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {new Date(artist.debutDate).getFullYear()}년 데뷔
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
