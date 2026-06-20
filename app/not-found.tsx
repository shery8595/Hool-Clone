import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hoolclone-gray-50 p-6 text-center">
      <h1 className="text-2xl font-bold">Profile not found</h1>
      <p className="text-muted-foreground">
        This public clone profile does not exist.
      </p>
      <ButtonLink href="/">Back to Dashboard</ButtonLink>
    </div>
  );
}
