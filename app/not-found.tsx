import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Task not found</h1>
      <p>It may have been deleted in the meantime.</p>
      <Link className="button" href="/">
        Back to the list
      </Link>
    </>
  );
}
