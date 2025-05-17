import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Card from "../../components/ui/Card";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, []);

  useEffect(() => {
    if (!id || !user) return;

    const fetchData = async () => {
      const { data: group } = await supabase
        .from("groups")
        .select("name, description, creator_id")
        .eq("id", id)
        .single();
      if (group) {
        setGroupName(group.name);
        setGroupDescription(group.description || "");
        setCreatorId(group.creator_id);
      }

      const { data: membership } = await supabase
        .from("memberships")
        .select("*")
        .eq("group_id", id)
        .eq("user_id", user.id)
        .single();
      setIsMember(!!membership);

      const { data: eventList } = await supabase
        .from("events")
        .select("*")
        .eq("group_id", id)
        .order("date", { ascending: true });
      if (eventList) setEvents(eventList);

      const { data: memberList } = await supabase
        .from("memberships")
        .select("user_id")
        .eq("group_id", id);
      const ids = memberList.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", ids);
      if (profiles) setMembers(profiles);
    };

    fetchData();
  }, [id, user]);

  useEffect(() => {
    if (!id) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("group_id", id)
        .order("timestamp", { ascending: true });

      const userIds = [...new Set(data?.map((msg) => msg.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      const enriched = data.map((msg) => {
        const profile = profiles.find((p) => p.id === msg.sender_id);
        return {
          ...msg,
          sender_name: profile?.username || "Unbekannt",
          avatar_url: profile?.avatar_url || null,
        };
      });

      setMessages(enriched);
    };

    fetchMessages();

    const channel = supabase
      .channel("realtime-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.new.group_id === id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    // ✅ Kein async-return mehr
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSend = async () => {
    if (!newMessage || !user || !isMember) return;
    await supabase.from("messages").insert({
      content: newMessage,
      group_id: id,
      sender_id: user.id,
    });
    setNewMessage("");
  };

  const handleCreateEvent = async () => {
    if (!eventTitle || !eventDate) return;
    await supabase.from("events").insert({
      title: eventTitle,
      date: eventDate,
      group_id: id,
    });
    const { data: updated } = await supabase
      .from("events")
      .select("*")
      .eq("group_id", id)
      .order("date", { ascending: true });
    if (updated) setEvents(updated);
    setEventTitle("");
    setEventDate("");
  };

  const handleLeaveGroup = async () => {
    if (!user || !id) return;
    setLeaving(true);
    await supabase
      .from("memberships")
      .delete()
      .eq("group_id", id)
      .eq("user_id", user.id);
    router.push("/");
    setLeaving(false);
  };

  const handleDescriptionSave = async () => {
    await supabase
      .from("groups")
      .update({ description: groupDescription })
      .eq("id", id);
    alert("Beschreibung gespeichert!");
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-frndz-primary mb-2">{groupName}</h1>

      {user?.id === creatorId ? (
        <Card className="mb-6">
          <Textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="Gruppenbeschreibung..."
          />
          <Button onClick={handleDescriptionSave} className="mt-2 w-full">
            Beschreibung speichern
          </Button>
        </Card>
      ) : groupDescription ? (
        <p className="text-sm text-gray-600 mb-4">{groupDescription}</p>
      ) : null}

      {isMember && (
        <div className="mb-6">
          <Button
            onClick={handleLeaveGroup}
            className="text-sm bg-red-100 text-red-600 hover:bg-red-200"
          >
            Gruppe verlassen
          </Button>
        </div>
      )}

      {events.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-frndz-primary mb-3">📅 Events</h2>
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id}>
                <strong>{event.title}</strong> –{" "}
                {new Date(event.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {isMember && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-frndz-primary mb-3">➕ Event erstellen</h2>
          <div className="flex flex-col gap-2 mb-2">
            <Input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Titel"
            />
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateEvent}>Speichern</Button>
        </Card>
      )}

      {members.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-frndz-primary mb-3">👥 Mitglieder</h2>
          <ul className="space-y-1">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm">
                <img
                  src={m.avatar_url || "/default-avatar.png"}
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                />
                @{m.username}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-frndz-primary mb-3">💬 Chat</h2>
        <div className="space-y-2 mb-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 items-start">
              <img
                src={msg.avatar_url || "/default-avatar.png"}
                alt="avatar"
                className="w-6 h-6 rounded-full mt-1"
              />
              <div>
                <strong>@{msg.sender_name}</strong>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {isMember ? (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nachricht schreiben..."
              className="flex-1"
            />
            <Button onClick={handleSend}>Senden</Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Du musst der Gruppe beitreten, um zu schreiben.
          </p>
        )}
      </Card>
    </div>
  );
}
