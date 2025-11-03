import { Tv } from "lucide-react";
import { type LiveRoom } from "../../../types/live";

interface LiveThumbnailCardProps {
  room: LiveRoom;
  onClick: () => void;
}

const LiveThumbnailCard = ({ room, onClick }: LiveThumbnailCardProps) => {
  const PLACEHOLDER_URL = "https://placehold.co/1280x720?text=No+Image&font=roboto";

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-full relative overflow-hidden cursor-pointer rounded-2xl group"
      style={{ aspectRatio: '16/9' }}
    >
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{
          backgroundImage: `url('${room.thumbnailUrl || PLACEHOLDER_URL}')`,
        }}
      />

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* 호버 시 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

      {/* 시청자 수 - 좌측 상단 */}
      <div className="absolute top-3 left-3 z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs">
          <Tv className="h-3 w-3" />
          <span className="font-semibold">
            {room.viewerCount.toLocaleString()}명 시청 중
          </span>
        </div>
      </div>

      {/* 콘텐츠 - 하단 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* 방 제목 */}
        <h3 className="text-white text-lg font-bold mb-2 line-clamp-2">
          {room.title}
        </h3>

        {/* 방장 정보 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white/50">
            {room.hostNickname.charAt(0)}
          </div>
          <span className="text-white/90 text-sm font-medium">
            {room.hostNickname}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveThumbnailCard;
