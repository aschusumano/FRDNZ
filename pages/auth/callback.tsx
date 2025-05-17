import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.error("Fehler beim Login", error);
        router.replace("/");
        return;
      }

      setUsername(data.user.email);
      setLoading(false);

      setTimeout(() => {
        router.replace("/profile");
      }, 2000);
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-frndz-background text-frndz-text font-frndz px-4">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🎉 Willkommen bei FRNDZ</div>
        {loading ? (
          <p className="text-lg">Wir loggen dich ein...</p>
        ) : (
          <>
            <p className="text-lg">Hallo {username}! Du wirst weitergeleitet...</p>
            <div className="mt-4 animate-spin h-6 w-6 border-4 border-frndz-primary border-t-transparent rounded-full mx-auto" />
          </>
        )}
      </div>
    </div>
  );
}