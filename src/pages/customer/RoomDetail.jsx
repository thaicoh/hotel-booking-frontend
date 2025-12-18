import { useParams } from "react-router-dom";

export default function RoomDetail() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Chi tiết phòng</h1>
      <p>Mã phòng / loại phòng: {id}</p>
    </div>
  );
}