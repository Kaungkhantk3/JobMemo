import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <form
        action={async () => {
          "use server";
          await signIn("google", {
            redirectTo: "/",
          });
        }}
      >
        <button
          type="submit"
          className="px-5 py-3 bg-black text-white rounded-lg"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
