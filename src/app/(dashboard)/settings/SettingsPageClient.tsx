"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Input, Label, Switch, Textarea, Button, Card, CardHeader,
  CardTitle, CardDescription, CardContent, CardFooter, Separator,
} from "@/components/ui/index";
import { useToast } from "@/hooks/use-toast";
import {
  User, Link2, Shield, Trash2, Save, Globe, Github,
  Linkedin, Twitter, Mail, AlertTriangle,
} from "lucide-react";

interface SettingsData {
  name: string;
  email: string;
  bio: string;
  headline: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  contactEmail: string;
  isPublic: boolean;
  isIndexed: boolean;
}

interface SettingsPageClientProps {
  initial: SettingsData & { username: string };
}

export function SettingsPageClient({ initial }: SettingsPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState("");

  const [data, setData] = useState<SettingsData>(initial);

  function set<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        toast({ title: "Settings saved", variant: "success" });
        router.refresh();
      } catch (err: any) {
        toast({ title: err.message ?? "Failed to save", variant: "destructive" });
      }
    });
  }

  async function handleDeleteAccount() {
    if (confirmDelete !== initial.username) return;
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/");
    } catch {
      toast({ title: "Failed to delete account", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* ── Profile info ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your public profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={data.headline}
                onChange={(e) => set("headline", e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea
              id="bio"
              value={data.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="A brief description shown under your name"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{data.bio.length}/200 characters</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={data.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Social links ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-brand-500" />
            <CardTitle>Social Links</CardTitle>
          </div>
          <CardDescription>Connect your social profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "github" as const, icon: Github, label: "GitHub", placeholder: "username" },
            { key: "linkedin" as const, icon: Linkedin, label: "LinkedIn", placeholder: "username" },
            { key: "twitter" as const, icon: Twitter, label: "Twitter / X", placeholder: "username" },
            { key: "contactEmail" as const, icon: Mail, label: "Contact Email", placeholder: "contact@example.com" },
          ].map(({ key, icon: Icon, label, placeholder }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  value={data[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Privacy ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-500" />
            <CardTitle>Privacy & Visibility</CardTitle>
          </div>
          <CardDescription>Control who can see your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Public Profile</p>
              <p className="text-xs text-muted-foreground">Allow anyone to view your profile</p>
            </div>
            <Switch checked={data.isPublic} onCheckedChange={(v) => set("isPublic", v)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Search Indexing</p>
              <p className="text-xs text-muted-foreground">Allow search engines to index your profile</p>
            </div>
            <Switch checked={data.isIndexed} onCheckedChange={(v) => set("isIndexed", v)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending} className="ml-auto">
            {isPending ? (
              <span className="flex items-center gap-2">Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="w-4 h-4" />Save Changes</span>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* ── Danger zone ──────────────────────────────────────────────── */}
      <Card className="border-destructive/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account and all data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Type <strong>{initial.username}</strong> to confirm deletion:
              </p>
            </div>
            <Input
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              placeholder={initial.username}
              className="border-destructive/40"
            />
            <Button
              type="button"
              variant="destructive"
              disabled={confirmDelete !== initial.username}
              onClick={handleDeleteAccount}
              className="w-full"
            >
              <Trash2 className="w-4 h-4" />
              Delete my account permanently
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
