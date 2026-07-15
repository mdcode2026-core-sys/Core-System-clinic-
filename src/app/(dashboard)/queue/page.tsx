import { LiveQueueBoard } from "@/features/reception/LiveQueueBoard";

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة الانتظار</h1>
      <LiveQueueBoard />
    </div>
  );
}
