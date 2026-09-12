'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Camera, 
  Plus, 
  Sparkles, 
  Send, 
  Trash2, 
  Grid3X3, 
  List, 
  Check, 
  AlertCircle, 
  User, 
  Clock, 
  Image as ImageIcon,
  Flame,
  Bookmark,
  Smile,
  ShieldCheck,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/lib/session/auth-context';
import { useAdmin } from '@/lib/session/admin-context';
import { useToast } from '@/components/ui/toast';
import { 
  getCommunityPosts, 
  createCommunityPost, 
  addPostComment, 
  togglePostLike, 
  deleteCommunityPost,
  uploadCommunityPostImage 
} from '@/lib/supabase/service';
import { compressImageClientSide, CompressionResult } from '@/lib/image-compression/compress';
import { CommunityPost, PostComment } from '@/types/database';
import { formatBytes } from '@/lib/utils';

// Helper for relative time in Bahasa Melayu
function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Baru sahaja';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m lalu`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}j lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}h lalu`;
    return date.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
  } catch {
    return 'Baru sahaja';
  }
}

// Generate consistent avatar gradient colors
function getAvatarGradient(name: string): string {
  const gradients = [
    'from-rose-500 to-amber-500',
    'from-blue-500 to-indigo-600',
    'from-emerald-400 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-blue-600'
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
}

export default function MomenPage() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const toast = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [filterTab, setFilterTab] = useState<'semua' | 'guru' | 'pelajar' | 'trending'>('semua');

  // Client ID for like tracking
  const [clientId, setClientId] = useState('guest-client');
  useEffect(() => {
    try {
      let id = localStorage.getItem('mingguaktiviti_client_id');
      if (!id) {
        id = 'client-' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('mingguaktiviti_client_id', id);
      }
      setClientId(id);
    } catch {}
  }, []);

  // Guest author identity storage (name & role)
  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] = useState('Pelajar');

  useEffect(() => {
    try {
      const savedName = localStorage.getItem('mingguaktiviti_guest_name');
      const savedRole = localStorage.getItem('mingguaktiviti_guest_role');
      if (savedName) setGuestName(savedName);
      if (savedRole) setGuestRole(savedRole);
    } catch {}
  }, []);

  // Load posts
  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getCommunityPosts(clientId);
      setPosts(data);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuatkan suapan momen.');
    } finally {
      setLoading(false);
    }
  }

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [caption, setCaption] = useState('');
  const [uploadAuthorName, setUploadAuthorName] = useState('');
  const [uploadAuthorRole, setUploadAuthorRole] = useState('Pelajar');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open upload modal & prepopulate author info
  const handleOpenUpload = () => {
    setUploadError('');
    setCaption('');
    setSelectedFile(null);
    setCompressionResult(null);

    if (user) {
      setUploadAuthorName(user.name);
      setUploadAuthorRole('Guru');
    } else {
      setUploadAuthorName(guestName);
      setUploadAuthorRole(guestRole || 'Pelajar');
    }
    setIsUploadOpen(true);
  };

  // Handle file select & compress
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsCompressing(true);
    setUploadError('');

    try {
      const res = await compressImageClientSide(file, {
        maxLongEdge: 1600,
        quality: 0.82
      });
      setCompressionResult(res);
    } catch (err: any) {
      console.error(err);
      setUploadError('Gagal memampatkan gambar: ' + (err.message || 'Format tidak disokong'));
    } finally {
      setIsCompressing(false);
    }
  };

  // Submit Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!compressionResult) {
      setUploadError('Sila pilih satu keping gambar untuk dimuat naik.');
      return;
    }

    const finalName = user ? user.name : uploadAuthorName.trim();
    if (!finalName) {
      setUploadError('Sila masukkan nama anda sebelum memuat naik gambar.');
      return;
    }

    const finalRole = user ? 'Guru' : uploadAuthorRole;

    // Save guest name for future reuse
    if (!user) {
      try {
        localStorage.setItem('mingguaktiviti_guest_name', finalName);
        localStorage.setItem('mingguaktiviti_guest_role', finalRole);
        setGuestName(finalName);
        setGuestRole(finalRole);
      } catch {}
    }

    setUploading(true);
    try {
      // 1. Upload compressed blob
      const uploadRes = await uploadCommunityPostImage(compressionResult.blob);
      if (uploadRes.error) {
        setUploadError(uploadRes.error);
        setUploading(false);
        return;
      }

      // 2. Create post entry
      const createRes = await createCommunityPost({
        image_url: uploadRes.publicUrl,
        storage_path: uploadRes.path,
        caption: caption.trim(),
        author_name: finalName,
        author_role: finalRole,
        teacher_id: user?.id || null
      });

      setUploading(false);

      if (createRes.error) {
        setUploadError(createRes.error);
      } else {
        toast.success('Momen anda berjaya dimuat naik & dikongsi!');
        setIsUploadOpen(false);
        loadPosts();
      }
    } catch (err: any) {
      setUploading(false);
      setUploadError('Ralat: ' + (err.message || 'Gagal memuat naik.'));
    }
  };

  // Like Toggle with Heart Animation
  const [animatingHeartPostId, setAnimatingHeartPostId] = useState<string | null>(null);

  const handleToggleLike = async (post: CommunityPost) => {
    // Optimistic UI update
    const currentLiked = post.has_liked;
    const newCount = Math.max(0, post.likes_count + (currentLiked ? -1 : 1));

    if (!currentLiked) {
      setAnimatingHeartPostId(post.id);
      setTimeout(() => setAnimatingHeartPostId(null), 800);
    }

    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          has_liked: !currentLiked,
          likes_count: newCount
        };
      }
      return p;
    }));

    await togglePostLike(post.id, clientId);
  };

  // Detailed Comments Modal
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentAuthorName, setCommentAuthorName] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const handleOpenComments = (post: CommunityPost) => {
    setActiveCommentPost(post);
    setCommentInput('');
    setCommentError('');
    if (user) {
      setCommentAuthorName(user.name);
    } else {
      setCommentAuthorName(guestName);
    }
  };

  // Submit Comment (from Modal or Inline)
  const handleSubmitComment = async (postId: string, contentText: string, customAuthorName?: string) => {
    const text = contentText.trim();
    if (!text) return;

    const author = user ? user.name : (customAuthorName || commentAuthorName || guestName).trim();
    if (!author) {
      setCommentError('Sila masukkan nama anda untuk menghantar komen.');
      toast.error('Sila masukkan nama anda untuk menghantar komen.');
      return;
    }

    const role = user ? 'Guru' : (guestRole || 'Warga MRSM');

    // Save guest name for future reuse
    if (!user) {
      try {
        localStorage.setItem('mingguaktiviti_guest_name', author);
        setGuestName(author);
      } catch {}
    }

    setCommenting(true);
    const res = await addPostComment({
      post_id: postId,
      author_name: author,
      author_role: role,
      teacher_id: user?.id || null,
      content: text
    });
    setCommenting(false);

    if (res.data) {
      toast.success('Komen berjaya dihantar!');
      setCommentInput('');
      setCommentError('');

      // Update posts state
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const newComments = [...(p.comments || []), res.data!];
          return {
            ...p,
            comments: newComments,
            comments_count: newComments.length
          };
        }
        return p;
      }));

      // Update active comment modal if open
      if (activeCommentPost && activeCommentPost.id === postId) {
        setActiveCommentPost(prev => prev ? {
          ...prev,
          comments: [...(prev.comments || []), res.data!],
          comments_count: (prev.comments_count || 0) + 1
        } : null);
      }
    } else {
      setCommentError(res.error || 'Gagal menghantar komen.');
    }
  };

  // Quick Inline Comment State per post
  const [inlineInputs, setInlineInputs] = useState<Record<string, string>>({});
  const [inlineNameInputs, setInlineNameInputs] = useState<Record<string, string>>({});

  // Delete Post (Admin or Teacher owner)
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Adakah anda pasti ingin memadam siaran momen ini?')) return;

    const res = await deleteCommunityPost(postId);
    if (res.success) {
      toast.success('Siaran berjaya dipadam.');
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (activeCommentPost?.id === postId) {
        setActiveCommentPost(null);
      }
    } else {
      toast.error(res.error || 'Gagal memadam siaran.');
    }
  };

  // Share post link
  const handleShare = (post: CommunityPost) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Pautan Momen Minggu Aktiviti disalin!');
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (filterTab === 'guru') return post.author_role === 'Guru';
    if (filterTab === 'pelajar') return post.author_role !== 'Guru';
    if (filterTab === 'trending') return post.likes_count >= 10;
    return true;
  });

  // Calculate total counts
  const totalLikes = posts.reduce((acc, curr) => acc + (curr.likes_count || 0), 0);
  const totalComments = posts.reduce((acc, curr) => acc + (curr.comments_count || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B2F6B] via-[#1646A0] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-sm border border-blue-900/30">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-56 h-56 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Momen & Komuniti Minggu Aktiviti</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Sorotan Gambar & Memori Acara
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              Ruang interaktif seumpama Instagram untuk semua murid, guru, dan warga MRSM Tumpat berkongsi foto, memberi reaksi, dan meninggalkan kata-kata semangat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              onClick={handleOpenUpload}
              size="lg"
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold shadow-md shadow-pink-500/20 border-none rounded-2xl px-5 py-3 transition-all transform active:scale-95"
            >
              <Camera className="w-5 h-5 mr-2" />
              <span>+ Kongsi Gambar Momen</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats Pill Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center gap-4 sm:gap-8 text-xs text-white/90">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-black">
              {posts.length}
            </div>
            <span>Keping Foto Dikongsi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/30 text-rose-300 flex items-center justify-center font-black">
              ❤️
            </div>
            <span>{totalLikes} Suka / Likes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center font-black">
              💬
            </div>
            <span>{totalComments} Komen Warga</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'semua', label: 'Semua Momen' },
            { id: 'guru', label: 'Daripada Guru' },
            { id: 'pelajar', label: 'Daripada Pelajar/Warga' },
            { id: 'trending', label: '🔥 Terhangat' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterTab === tab.id
                  ? 'bg-[#1646A0] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] hover:bg-[#E2E8F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Switcher (Feed vs Grid) */}
        <div className="flex items-center justify-end gap-1 shrink-0 bg-[#F1F5F9] p-1 rounded-xl">
          <button
            onClick={() => setViewMode('feed')}
            title="Mod Suapan Penuh (Feed)"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'feed'
                ? 'bg-white text-[#1646A0] shadow-xs'
                : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Suapan</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            title="Mod Grid Instagram (Explore)"
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-[#1646A0] shadow-xs'
                : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Content Rendering: Feed View vs Grid View */}
      {loading ? (
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="w-32 h-3.5" />
                <Skeleton className="w-20 h-2.5" />
              </div>
            </div>
            <Skeleton className="w-full h-80 rounded-2xl" />
            <Skeleton className="w-48 h-4" />
          </Card>
        </div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="Belum Ada Foto Momen"
          description="Jadilah yang pertama memuat naik gambar aktiviti, sukan, atau kenangan homeroom anda hari ini!"
          actionLabel="+ Kongsi Momen Pertama"
          onAction={handleOpenUpload}
        />
      ) : viewMode === 'feed' ? (
        /* ================= FEED VIEW (INSTAGRAM STYLE) ================= */
        <div className="max-w-xl mx-auto space-y-6">
          {filteredPosts.map(post => {
            const avatarGrad = getAvatarGradient(post.author_name);
            const isAuthor = user && post.teacher_id === user.id;
            const canDelete = isAdmin || isAuthor;

            return (
              <Card 
                key={post.id} 
                className="overflow-hidden border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${avatarGrad} p-0.5 shrink-0`}>
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-black text-[#172033]">
                        {post.author_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#172033] leading-none">
                          {post.author_name}
                        </span>
                        {post.author_role === 'Guru' ? (
                          <Badge variant="royal" size="sm" className="text-[10px] py-0 px-1.5 h-4">
                            <ShieldCheck className="w-2.5 h-2.5 mr-0.5 inline" />
                            Guru
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5 h-4 text-[#64748B]">
                            {post.author_role || 'Warga'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#94A3B8] mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      title="Padam Siaran Momen"
                      className="text-[#94A3B8] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Image with Double-Tap Heart Animation */}
                <div 
                  className="relative w-full bg-slate-900 cursor-pointer select-none overflow-hidden aspect-[4/3] sm:aspect-square flex items-center justify-center"
                  onDoubleClick={() => handleToggleLike(post)}
                >
                  <img
                    src={post.image_url}
                    alt={post.caption || 'Foto Momen'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Pulsing Heart on Double Tap */}
                  {animatingHeartPostId === post.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
                      <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Post Actions Bar */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post)}
                        className="transition-transform active:scale-125 focus:outline-none"
                      >
                        <Heart 
                          className={`w-6 h-6 transition-colors ${
                            post.has_liked 
                              ? 'text-rose-500 fill-rose-500' 
                              : 'text-[#172033] hover:text-rose-500'
                          }`} 
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenComments(post)}
                        className="text-[#172033] hover:text-[#1646A0] transition-colors focus:outline-none"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(post)}
                        className="text-[#172033] hover:text-[#1646A0] transition-colors focus:outline-none"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-[#64748B]">
                      {post.likes_count} sukaan
                    </div>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <div className="text-xs sm:text-sm text-[#172033] leading-relaxed">
                      <span className="font-bold mr-1.5">{post.author_name}</span>
                      <span>
                        {post.caption.split(' ').map((word, idx) => {
                          if (word.startsWith('#')) {
                            return (
                              <span key={idx} className="font-semibold text-[#2563EB] hover:underline cursor-pointer mr-1">
                                {word}
                              </span>
                            );
                          }
                          return word + ' ';
                        })}
                      </span>
                    </div>
                  )}

                  {/* Comments Preview & Expand */}
                  <div className="space-y-2 pt-1">
                    {post.comments_count > 0 && (
                      <button
                        onClick={() => handleOpenComments(post)}
                        className="text-xs font-semibold text-[#64748B] hover:text-[#172033] block"
                      >
                        Lihat kesemua {post.comments_count} komen
                      </button>
                    )}

                    {/* Show up to 2 latest comments inline */}
                    {post.comments && post.comments.slice(-2).map(c => (
                      <div key={c.id} className="text-xs text-[#334155] flex items-start gap-1.5">
                        <span className="font-bold text-[#172033] shrink-0">{c.author_name}:</span>
                        <span className="text-[#475569]">{c.content}</span>
                      </div>
                    ))}
                  </div>

                  {/* Inline Quick Comment Box */}
                  <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
                    {!user && !guestName && (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <input
                          type="text"
                          placeholder="Nama anda (Wajib untuk bukan guru)"
                          value={inlineNameInputs[post.id] || ''}
                          onChange={(e) => setInlineNameInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="w-full text-xs px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1646A0]"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={
                          user 
                            ? `Komen sebagai ${user.name}...` 
                            : guestName 
                              ? `Komen sebagai ${guestName}...` 
                              : "Tulis komen anda..."
                        }
                        value={inlineInputs[post.id] || ''}
                        onChange={(e) => setInlineInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmitComment(post.id, inlineInputs[post.id] || '', inlineNameInputs[post.id]);
                            setInlineInputs(prev => ({ ...prev, [post.id]: '' }));
                          }
                        }}
                        className="flex-1 text-xs px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1646A0]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          handleSubmitComment(post.id, inlineInputs[post.id] || '', inlineNameInputs[post.id]);
                          setInlineInputs(prev => ({ ...prev, [post.id]: '' }));
                        }}
                        disabled={commenting || !(inlineInputs[post.id] || '').trim()}
                        className="rounded-xl px-3 h-8"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ================= GRID EXPLORE VIEW (3-COLUMN INSTAGRAM) ================= */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              onClick={() => handleOpenComments(post)}
              className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={post.image_url}
                alt={post.caption || 'Foto'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {/* Dark Hover Overlay with Stats */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white text-xs sm:text-sm font-bold">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>{post.likes_count}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 fill-white text-white" />
                  <span>{post.comments_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= UPLOAD MOMEN MODAL ================= */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Kongsi Gambar Momen Minggu Aktiviti"
        description="Muat naik foto aktiviti, sukan, atau kenangan homeroom untuk dipaparkan di suapan sosial."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Image Selection Area */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              Pilih Gambar <span className="text-rose-500">*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!compressionResult ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#CBD5E1] hover:border-[#1646A0] rounded-2xl p-6 text-center cursor-pointer bg-[#F8FAFC] hover:bg-[#EFF6FF] transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-[#1646A0] group-hover:scale-110 transition-transform mb-2">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#172033]">
                  {isCompressing ? 'Sedang memproses & memampatkan gambar...' : 'Klik untuk pilih foto daripada peranti anda'}
                </p>
                <p className="text-[11px] text-[#64748B] mt-1">
                  Format JPG, PNG, atau WebP. Gambar akan dimampatkan secara pintar ke WebP berkualiti tinggi.
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-900 group aspect-[4/3]">
                <img
                  src={compressionResult.previewUrl}
                  alt="Pralihat"
                  className="w-full h-full object-contain"
                />

                {/* Remove / Change Image Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-md transition-colors"
                >
                  Tukar Gambar
                </button>

                {/* Compression Info Badge */}
                <div className="absolute top-3 left-3 bg-black/70 text-emerald-400 text-[11px] font-mono px-2.5 py-1 rounded-xl backdrop-blur-md flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{formatBytes(compressionResult.compressedSize)} (-{compressionResult.savedPercent}%)</span>
                </div>
              </div>
            )}
          </div>

          {/* Author Identity Section */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-3">
            <div className="text-xs font-bold text-[#172033] flex items-center justify-between">
              <span>Maklumat Pengarang / Pemuat Naik</span>
              {user ? (
                <Badge variant="royal" size="sm">
                  <ShieldCheck className="w-3 h-3 mr-1 inline" />
                  Guru Berdaftar
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">Bukan Guru</Badge>
              )}
            </div>

            {user ? (
              <div className="text-xs text-[#334155] bg-white p-2.5 rounded-xl border border-[#E2E8F0]">
                Memuat naik sebagai: <strong>{user.name}</strong> ({user.salary_no})
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                    Nama Anda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Danish (Tingkatan 2)"
                    value={uploadAuthorName}
                    onChange={(e) => setUploadAuthorName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1646A0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                    Kategori / Peranan
                  </label>
                  <select
                    value={uploadAuthorRole}
                    onChange={(e) => setUploadAuthorRole(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1646A0]"
                  >
                    <option value="Pelajar">Pelajar MRSM</option>
                    <option value="Homeroom">Wakil Homeroom</option>
                    <option value="Staf">Staf Maktab</option>
                    <option value="Alumni">Alumni MRSM</option>
                    <option value="Warga MRSM">Warga MRSM / Pengunjung</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              Kapsyen Foto
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan momen ini... Sertakan tanda pagar seperti #MingguAktiviti2026 #MRSMTumpat"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1646A0] resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadOpen(false)}
              disabled={uploading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={uploading}
              disabled={!compressionResult || isCompressing}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold"
            >
              <Camera className="w-4 h-4 mr-1.5" />
              Kongsi Momen
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= DETAILED COMMENTS MODAL ================= */}
      <Modal
        isOpen={!!activeCommentPost}
        onClose={() => setActiveCommentPost(null)}
        title="Ruangan Komen & Perbincangan Momen"
        description="Kongsi reaksi dan ucapan sokongan kepada siaran ini."
        maxWidth="lg"
      >
        {activeCommentPost && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh]">
            {/* Left Column: Post Photo & Caption Preview */}
            <div className="space-y-3 flex flex-col">
              <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center">
                <img
                  src={activeCommentPost.image_url}
                  alt={activeCommentPost.caption || 'Foto Momen'}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#172033]">{activeCommentPost.author_name}</span>
                  <span className="text-[11px] text-[#94A3B8]">{formatRelativeTime(activeCommentPost.created_at)}</span>
                </div>
                {activeCommentPost.caption && (
                  <p className="text-[#475569] leading-relaxed">
                    {activeCommentPost.caption}
                  </p>
                )}
                <div className="text-[11px] text-rose-600 font-semibold pt-1">
                  ❤️ {activeCommentPost.likes_count} orang menyukai foto ini
                </div>
              </div>
            </div>

            {/* Right Column: Scrollable Comments List & Input Form */}
            <div className="flex flex-col h-full space-y-3">
              <div className="text-xs font-bold text-[#172033] pb-1 border-b border-[#F1F5F9] flex items-center justify-between">
                <span>Komen ({activeCommentPost.comments?.length || 0})</span>
                {!user && guestName && (
                  <span className="text-[11px] text-[#64748B]">
                    Komen sebagai: <strong>{guestName}</strong>
                  </span>
                )}
              </div>

              {/* Comments Scroll Container */}
              <div className="flex-1 overflow-y-auto max-h-60 sm:max-h-80 space-y-2.5 pr-1 scrollbar-thin">
                {(!activeCommentPost.comments || activeCommentPost.comments.length === 0) ? (
                  <div className="text-center py-8 text-xs text-[#94A3B8]">
                    Belum ada komen. Tuliskan ucapan atau tahniah pertama!
                  </div>
                ) : (
                  activeCommentPost.comments.map(c => {
                    const cGrad = getAvatarGradient(c.author_name);
                    return (
                      <div key={c.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${cGrad} text-[10px] text-white flex items-center justify-center font-bold`}>
                              {c.author_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#172033]">{c.author_name}</span>
                            {c.author_role === 'Guru' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-700 font-semibold">
                                Guru
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#94A3B8]">{formatRelativeTime(c.created_at)}</span>
                        </div>
                        <p className="text-[#334155] pl-6 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Comment Input Form */}
              <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
                {commentError && (
                  <p className="text-[11px] text-rose-600">{commentError}</p>
                )}

                {!user && (
                  <div>
                    <input
                      type="text"
                      placeholder="Nama anda (Wajib bagi bukan guru)"
                      value={commentAuthorName}
                      onChange={(e) => setCommentAuthorName(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1646A0]"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tulis komen..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmitComment(activeCommentPost.id, commentInput);
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1646A0]"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleSubmitComment(activeCommentPost.id, commentInput)}
                    isLoading={commenting}
                    disabled={!commentInput.trim()}
                    className="rounded-xl"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Hantar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
