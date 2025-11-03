export interface LiveRoom {
  roomId: number;
  title: string;
  thumbnailUrl: string;
  viewerCount: number;
  hostNickname: string;
}

export interface ArtistLiveData {
  artistId: number;
  nameKr: string;
  nameEn: string;
  imgUrl: string;
  followerCount: number;
  liveRooms: LiveRoom[];
}
