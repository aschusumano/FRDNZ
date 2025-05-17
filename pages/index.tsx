import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Link from "next/link";

type Group = {
  id: string;
  name: string;
  emoji: string;
};

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUser(auth?.user || null);

      const { data } = await supabase
        .from("groups")
        .select("id, name, emoji")
        .limit(5);
      if (data) setGroups(data);
    };
    load();
  }, []);

  const handleLogin = async () => {
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      setMessage("Fehler: " + error.message);
    } else {
      setMessage("E-Mail zum Login wurde gesendet.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-frndz-primary font-frndz mb-2">
        👋 Willkommen bei <span className="text-frndz-secondary">FRNDZ</span>
      </h1>
      <p className="text-frndz-text text-lg mb-6">
        Finde Gruppen in deiner Nähe, chatte und plane Events mit neuen Freunden!
      </p>

      {!user && (
        <Card className="mb-8 bg-white shadow-lg rounded-2xl p-5">
          <h2 className="text-xl font-semibold text-frndz-primary mb-3">🚪 Login per E-Mail</h2>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Deine E-Mail-Adresse"
            type="email"
            className="w-full px-4 py-2 border border-frndz-primary rounded-lg mb-3"
          />
          <Button
            onClick={handleLogin}
            className="w-full bg-frndz-primary hover:bg-frndz-secondary text-white font-semibold py-2 rounded-xl transition"
          >
            Magic Link senden
          </Button>
          {message && (
            <p className="text-sm mt-3 text-frndz-secondary text-center">{message}</p>
          )}
        </Card>
      )}

      {user && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-frndz-primary mb-4">💬 Deine Gruppen</h2>
          <div className="space-y-3">
            {groups.map((g) => (
              <Card
                key={g.id}
                className="p-4 bg-white rounded-xl shadow flex items-center justify-between hover:bg-frndz-background transition"
              >
                <Link href={`/chat/${g.id}`} className="flex items-center gap-4">
                  <div className="text-3xl">{g.emoji}</div>
                  <div className="text-lg font-medium text-frndz-text">{g.name}</div>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-frndz-primary mb-4">🌟 Empfohlene Gruppen</h2>
        <div className="space-y-4">
          <Card className="p-4 bg-white rounded-xl shadow flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="text-3xl">🎨</div>
              <div className="text-frndz-text font-medium">Kreativtreff Köln</div>
            </div>
            <Link href="/groups">
              <Button className="bg-frndz-primary text-white text-sm px-4 py-1 rounded-full hover:bg-frndz-secondary transition">
                Beitreten
              </Button>
            </Link>
          </Card>
          <Card className="p-4 bg-white rounded-xl shadow flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="text-3xl">⚽</div>
              <div className="text-frndz-text font-medium">Sonntags-Fußballrunde</div>
            </div>
            <Link href="/groups">
              <Button className="bg-frndz-primary text-white text-sm px-4 py-1 rounded-full hover:bg-frndz-secondary transition">
                Beitreten
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
