import { notFound } from "next/navigation";
import { CameraPlayground } from "./playground";

// Development-only page for trying the camera on a laptop or phone. 404 in production.
export default function CameraDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Camera playground</h1>
      <CameraPlayground />
    </div>
  );
}
