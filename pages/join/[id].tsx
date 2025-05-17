import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function JoinPage() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState("⏳ Lade...");

  useEffect(() => {
    const joinGroup = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user;
      setUser(currentUser);

      if (!currentUser || !id) {
        setStatus("⚠️ Du musst eingeloggt sein, um einer Gruppe beizutreten.");
        return;
      }

      // Prüfen, ob bereits Mitglied
      const { data: existing } = await supabase
        .from("memberships")
        .select("*")
        .eq("group_id", id)
        .eq("user_id", currentUser.id)
        .single();

      if (existing) {
        setStatus("✅ Du bist bereits Mitglied. Weiterleitung...");
        setTimeout(() => {
          router.push(`/chat/${id}`);
        }, 1500);
        return;
      }

      // Beitreten
      const { error } = await supabase.from("memberships").insert({
        group_id: id,
        user_id: currentUser.id,
      });

      if (error) {
        setStatus("❌ Beitritt fehlgeschlagen: " + error.message);
      } else {
        setStatus("🎉 Du bist beigetreten! Weiterleitung...");
        setTimeout(() => {
          router.push(`/chat/${id}`);
        }, 1500);
      }
    };

    joinGroup();
  }, [id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-6">
      <div className="text-center text-purple-700 text-lg font-semibold">
        {status}
      </div>
    </div>
  );
}
