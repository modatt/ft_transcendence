export function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-md border-s-4 border-danger bg-danger-subtle px-4 py-3 text-sm text-on-danger-subtle">
      {message}
    </div>
  )
}
