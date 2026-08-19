"use client";

import {
  MyProfile,
  changeMyPasswordAction,
  getMyProfileAction,
  updateMyAvatarAction,
  updateMyProfileAction,
} from "@/app/actions/staff";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { BiLockAlt, BiUser } from "react-icons/bi";
import { FiEye, FiEyeOff } from "react-icons/fi";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-500";

function roleBadgeClass(role: MyProfile["role"]) {
  if (role === "superadmin") return "bg-purple-50 text-purple-700";
  if (role === "admin") return "bg-blue-50 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

const GeneralSettings = () => {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = async () => {
    const res = await getMyProfileAction();
    if (res.ok && res.data) {
      setProfile(res.data);
      setForm({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
      setAvatarPreview(res.data.avatar || "");
    } else {
      toast.error(res.error || "Failed to load your profile");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.set("avatar", file);
    const res = await updateMyAvatarAction(formData);
    if (res.ok && res.data) {
      toast.success("Avatar updated");
      setAvatarPreview(res.data.avatar || "");
    } else {
      toast.error(res.error || "Failed to update avatar");
      setAvatarPreview(profile?.avatar || "");
    }
    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateMyProfileAction(form);
    if (res.ok && res.data) {
      setProfile(res.data);
      toast.success("Profile updated");
    } else {
      toast.error(res.fieldErrors?.join(" ") || res.error || "Failed to update profile");
    }
    setSavingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation don't match");
      return;
    }

    setChangingPassword(true);
    const res = await changeMyPasswordAction({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    if (res.ok) {
      toast.success("Password changed");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(res.fieldErrors?.join(" ") || res.error || "Failed to change password");
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />
        </div>
        <div className="rounded border border-gray-200 bg-white p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
        <div className="rounded border border-gray-200 bg-white py-20 text-center">
          <p className="text-sm text-gray-500">Could not load your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Identity header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-gray-400 hover:border-primary hover:text-primary transition-colors"
            title="Change avatar"
          >
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <BiUser size={28} />
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium text-gray-600">
                Saving…
              </div>
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadgeClass(profile.role)}`}
            >
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Account Details
        </h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass}>First Name</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Last Name</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
            >
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Change Password
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className={labelClass}>Current Password</label>
              <div className="relative flex items-center">
                <BiLockAlt className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                  required
                  type={showPasswords ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                  }
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>New Password</label>
              <input
                required
                minLength={6}
                type={showPasswords ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Confirm New Password</label>
              <input
                required
                minLength={6}
                type={showPasswords ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowPasswords((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              {showPasswords ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              {showPasswords ? "Hide" : "Show"} passwords
            </button>
            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
            >
              {changingPassword ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralSettings;
