import { ErrorState } from "@/components/shared/error-state";

export default function NotFoundPage() {
  return (
    <ErrorState
      title="Page not found"
      message="The page you are looking for does not exist or may have moved."
    />
  );
}
