import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
  const fetchUserAndProfile = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const currentUser = authData?.user;
    setUser(currentUser);

    if (!currentUser) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", currentUser.id)
      .single();

    if (profile?.username) setUsername(profile.username);
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
  };

  fetchUserAndProfile();
}, []);

  const handleSave = async () => {
    if (!username) {
      setMessage("Bitte gib einen Benutzernamen ein.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, username });

    setMessage(
      error ? "❌ Fehler: " + error.message : "✅ Benutzername gespeichert!"
    );
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage("❌ Fehler beim Hochladen des Bildes.");
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl.publicUrl })
      .eq("id", user.id);

    if (updateError) {
      setMessage("❌ Fehler beim Speichern des Bildes.");
    } else {
      setAvatarUrl(publicUrl.publicUrl);
      setMessage("✅ Profilbild aktualisiert!");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-frndz-primary mb-6">Dein Profil</h1>

      <Card>
        {avatarUrl && (
          <div className="flex justify-center mb-6">
            <img
              src={avatarUrl}
              alt="Profilbild"
              className="w-24 h-24 rounded-full border object-cover"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Profilbild ändern
          </label>
          <input type="file" accept="image/*" onChange={handleAvatarUpload} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600">
            Benutzername
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="z. B. max2007"
          />
        </div>

        <Button onClick={handleSave} className="w-full mt-2">
          Speichern
        </Button>

        {message && <p className="mt-4 text-sm text-frndz-primary">{message}</p>}
      </Card>
    </div>
  );
}
