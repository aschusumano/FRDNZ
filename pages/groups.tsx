import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

type Group = {
  id: string;
  name: string;
  emoji: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndGroups = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);

      const { data, error } = await supabase.from("groups").select("*");
      if (error) {
        console.error("Fehler beim Laden:", error.message);
      } else {
        setGroups(data);
      }
    };

    fetchUserAndGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!name || !emoji) {
      setMessage("Bitte Emoji und Namen eingeben.");
      return;
    }

    const { error } = await supabase
      .from("groups")
      .insert({ name, emoji, creator_id: user.id });

    if (error) {
      setMessage("Fehler: " + error.message);
    } else {
      setMessage("Gruppe erstellt ✅");
      setName("");
      setEmoji("");
      router.reload();
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      alert("Bitte zuerst einloggen.");
      return;
    }

    const { error } = await supabase.from("memberships").insert({
      user_id: user.id,
      group_id: groupId,
    });

    if (error) {
      alert("Schon beigetreten oder Fehler: " + error.message);
    } else {
      alert("Gruppe beigetreten!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-frndz-primary mb-6">FRNDZ Gruppen</h1>

      {/* Gruppenliste */}
      <div className="space-y-4 mb-10">
        {groups.map((group) => (
          <Card key={group.id}>
            <div className="flex justify-between items-center">
              <Link href={`/chat/${group.id}`} className="flex items-center gap-3">
                <span className="text-3xl">{group.emoji}</span>
                <span className="text-lg font-medium">{group.name}</span>
              </Link>
              <div className="flex gap-3 items-center">
                <Button
                  onClick={() => handleJoinGroup(group.id)}
                  className="text-sm px-3 py-1"
                >
                  Beitreten
                </Button>
                <Link href={`/join/${group.id}`}>
                  <span className="text-xs text-blue-600 underline hover:text-blue-800">
                    Einladungslink
                  </span>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gruppe erstellen */}
      {user && (
        <Card>
          <h2 className="text-lg font-semibold mb-3">Neue Gruppe erstellen</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Emoji z. B. 🎮"
              className="w-20 text-center"
            />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Gruppenname"
              className="flex-1"
            />
          </div>
          <Button onClick={handleCreateGroup} className="w-full">
            Gruppe erstellen
          </Button>
          {message && (
            <p className="text-sm text-frndz-primary mt-2">{message}</p>
          )}
        </Card>
      )}
    </div>
  );
}
