import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  User, Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar,
  Code2, Link as LinkIcon, Globe, FileText, Briefcase,
  Save, Camera, Shield, Settings, Lock, Eye, EyeOff, LogOut, Trash2, Plus, X,
  CheckCircle2, Sparkles, AlertCircle, RefreshCw,
} from 'lucide-react';
import Button from '../components/Button';
import Card, { CardHeader, CardTitle } from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [newSkill, setNewSkill] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    college: '',
    degree: '',
    branch: '',
    graduationYear: '',
    bio: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    resumeUrl: '',
    jobPreference: '',
    skills: [],
  });

  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Sync profile state when user object changes or page loads
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        college: user.college || '',
        degree: user.degree || '',
        branch: user.branch || '',
        graduationYear: user.graduationYear || '',
        bio: user.bio || '',
        linkedIn: user.linkedIn || '',
        github: user.github || '',
        portfolio: user.portfolio || '',
        resumeUrl: user.resumeUrl || '',
        jobPreference: user.jobPreference || 'Software Engineer',
        skills: Array.isArray(user.skills) && user.skills.length > 0
          ? user.skills
          : ['Java', 'Python', 'React', 'Node.js', 'SQL', 'Data Structures'],
      });
    }
  }, [user]);

  // Handle Save Profile Changes
  const handleProfileSave = async () => {
    if (!profile.name.trim()) return toast.error('Name is required');
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profile);
      const updatedUserPayload = { ...user, ...profile, ...(res.data?.user || {}) };
      updateUser(updatedUserPayload);
      toast.success('🎉 Profile changes saved successfully!');
    } catch (err) {
      console.warn('Profile save failed:', err);
      toast.error(err?.response?.data?.message || 'Could not save profile changes. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Skill Add / Remove
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const trimmed = newSkill.trim();
    if (profile.skills.includes(trimmed)) return toast.error('Skill already added');
    setProfile((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Password Change
  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPassword) {
      return toast.error('Please fill all password fields');
    }
    if (passwords.newPassword !== passwords.confirm) {
      return toast.error('New passwords do not match');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPassword: '', confirm: '' });
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = profile.name
    ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Calculate completeness % based on filled fields
  const fields = [profile.name, profile.email, profile.phone, profile.college, profile.degree, profile.branch, profile.graduationYear, profile.bio, profile.linkedIn, profile.github, profile.skills.length > 0];
  const completedFieldsCount = fields.filter(Boolean).length;
  const completionPercentage = Math.round((completedFieldsCount / fields.length) * 100);

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-[#1a1a3e] border border-[#2a2a5a] text-sm text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition';

  const tabItems = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security & Password', icon: Shield },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 mt-1 text-sm">View and update your personal info, education, skills, and preferences</p>
        </div>
        <Button onClick={handleProfileSave} loading={savingProfile} icon={Save}>
          Save Changes
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-[#2a2a5a]">
        {tabItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition cursor-pointer ${
              activeTab === id
                ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                : 'bg-[#141432] border-[#2a2a5a] text-slate-400 hover:border-purple-500/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN: Avatar & Overview Card ────────────────────────────── */}
          <div className="space-y-6">
            <Card hover={false} className="flex flex-col items-center text-center py-6">
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-purple-500/20 border-2 border-purple-400/30">
                  {initials}
                </div>
                <button
                  type="button"
                  title="Upload Photo"
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#141432] border border-[#2a2a5a] flex items-center justify-center hover:bg-purple-500/20 transition cursor-pointer text-purple-300"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-white">{profile.name || 'Student Name'}</h2>
              <p className="text-xs text-purple-400 font-medium mt-0.5">{profile.jobPreference || 'Software Engineer'}</p>
              <p className="text-xs text-slate-400 mt-1">{profile.email}</p>

              {/* Completion Progress Bar */}
              <div className="w-full mt-6 px-2 text-left">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
                  <span>Profile Completion</span>
                  <span className="text-purple-300 font-bold">{completionPercentage}%</span>
                </div>
                <ProgressBar value={completionPercentage} color="purple" />
              </div>

              {/* Quick Info Badges */}
              <div className="w-full mt-6 space-y-2.5 text-left border-t border-[#2a2a5a] pt-4 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <GraduationCap className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="truncate">{profile.college || 'Add College'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{profile.degree ? `${profile.degree} in ${profile.branch || 'CS'}` : 'Add Degree'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Graduation: {profile.graduationYear || '2026'}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ── RIGHT COLUMN: Edit Form Cards ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card hover={false}>
              <CardHeader><CardTitle icon={User}>Personal Information</CardTitle></CardHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="e.g. john@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location / City</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                    className={inputClass}
                  />
                </div>
              </div>
            </Card>

            {/* Education */}
            <Card hover={false}>
              <CardHeader><CardTitle icon={GraduationCap}>Education</CardTitle></CardHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / University</label>
                  <input
                    type="text"
                    value={profile.college}
                    onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                    placeholder="e.g. Indian Institute of Technology"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree</label>
                  <input
                    type="text"
                    value={profile.degree}
                    onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                    placeholder="e.g. B.Tech / B.E."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department / Branch</label>
                  <input
                    type="text"
                    value={profile.branch}
                    onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graduation Year</label>
                  <input
                    type="text"
                    value={profile.graduationYear}
                    onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                    placeholder="e.g. 2026"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Job Role</label>
                  <input
                    type="text"
                    value={profile.jobPreference}
                    onChange={(e) => setProfile({ ...profile, jobPreference: e.target.value })}
                    placeholder="e.g. Software Engineer / SDE-1"
                    className={inputClass}
                  />
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card hover={false}>
              <CardHeader><CardTitle icon={Code2}>Technical Skills</CardTitle></CardHeader>
              <div className="space-y-3">
                {/* Skill Badges */}
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]">
                  {profile.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-red-400 transition cursor-pointer ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {profile.skills.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No skills added yet</span>
                  )}
                </div>

                {/* Add Skill Input */}
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill (e.g. React, Python, Docker)..."
                    className={`${inputClass} flex-1`}
                  />
                  <Button type="submit" icon={Plus} variant="secondary" size="sm">
                    Add Skill
                  </Button>
                </form>
              </div>
            </Card>

            {/* Professional Links & Resume */}
            <Card hover={false}>
              <CardHeader><CardTitle icon={LinkIcon}>Professional Links & Resume</CardTitle></CardHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-purple-400" /> GitHub URL
                  </label>
                  <input
                    type="url"
                    value={profile.github}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profile.linkedIn}
                    onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={profile.portfolio}
                    onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                    placeholder="https://yourportfolio.dev"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-orange-400" /> Resume Drive/Cloud Link
                  </label>
                  <input
                    type="url"
                    value={profile.resumeUrl}
                    onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className={inputClass}
                  />
                </div>
              </div>
            </Card>

            {/* Bio / About Me */}
            <Card hover={false}>
              <CardHeader><CardTitle icon={FileText}>About Me</CardTitle></CardHeader>
              <div>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  placeholder="Share a short bio summarizing your background, achievements, and career goals..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button onClick={handleProfileSave} loading={savingProfile} icon={Save} size="lg" className="w-full sm:w-auto">
                Save Profile Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
          <Card hover={false}>
            <CardHeader><CardTitle icon={Lock}>Change Password</CardTitle></CardHeader>
            <div className="space-y-4">
              {[
                { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                { key: 'newPassword', label: 'New Password', placeholder: 'Enter new password' },
                { key: 'confirm', label: 'Confirm New Password', placeholder: 'Confirm new password' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      value={passwords[key]}
                      onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                      placeholder={placeholder}
                      className={`${inputClass} pl-10 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw({ ...showPw, [key]: !showPw[key] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <Button onClick={handlePasswordChange} loading={savingPassword} icon={Shield}>
                Update Password
              </Button>
            </div>
          </Card>

          <Card hover={false}>
            <CardHeader><CardTitle icon={Shield}>Account Actions</CardTitle></CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]">
                <div>
                  <p className="text-sm font-medium text-white">Active Sessions</p>
                  <p className="text-xs text-slate-400 mt-0.5">Logged in on current browser session</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">1 Active</span>
              </div>
              <div className="pt-4 border-t border-[#2a2a5a]">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition cursor-pointer font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Log out of your account
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
