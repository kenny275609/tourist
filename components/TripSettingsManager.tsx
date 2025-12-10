"use client";

import { useState, useEffect, useRef } from "react";
import { useTripSettings } from "@/hooks/useTripSettings";
import { useAdmin } from "@/hooks/useAdmin";
import { createClient } from "@/lib/supabase/client";
import { Save, Calendar, Hash, Image as ImageIcon, X, Upload, Loader2, FileText, Car, Bus } from "lucide-react";

export default function TripSettingsManager() {
  const { settings, loading, updateSetting } = useTripSettings();
  const { isAdmin } = useAdmin();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [departureDate, setDepartureDate] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activityIntro, setActivityIntro] = useState("");
  const [transportationDrive, setTransportationDrive] = useState("");
  const [transportationPublic, setTransportationPublic] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (settings.departure_date) {
      setDepartureDate(settings.departure_date);
    }
    if (settings.invite_code) {
      setInviteCode(settings.invite_code);
    }
    if (settings.elevation_profile_image) {
      setImageUrl(settings.elevation_profile_image);
    }
    if (settings.activity_intro) {
      setActivityIntro(settings.activity_intro);
    }
    if (settings.transportation_drive) {
      setTransportationDrive(settings.transportation_drive);
    }
    if (settings.transportation_public) {
      setTransportationPublic(settings.transportation_public);
    }
  }, [settings]);

  if (!isAdmin) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");

    const dateSuccess = await updateSetting("departure_date", departureDate);
    const codeSuccess = await updateSetting("invite_code", inviteCode);
    const imageSuccess = await updateSetting("elevation_profile_image", imageUrl);
    const introSuccess = await updateSetting("activity_intro", activityIntro);
    const driveSuccess = await updateSetting("transportation_drive", transportationDrive);
    const publicSuccess = await updateSetting("transportation_public", transportationPublic);

    if (dateSuccess && codeSuccess && imageSuccess && introSuccess && driveSuccess && publicSuccess) {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }

    setSaving(false);
  };

  const handleClearImage = () => {
    setImageUrl("");
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片文件');
      return;
    }

    // 檢查文件大小（限制為 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('圖片大小不能超過 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `elevation-profile/${fileName}`;

      // 上傳到 Supabase Storage
      const { data, error } = await supabase.storage
        .from('trip-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        alert('上傳失敗：' + error.message);
        setUploading(false);
        return;
      }

      // 取得公開 URL
      const { data: { publicUrl } } = supabase.storage
        .from('trip-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      setUploadProgress(100);
      
      // 自動儲存
      const saveSuccess = await updateSetting("elevation_profile_image", publicUrl);
      if (saveSuccess) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        alert('圖片上傳成功，但儲存設定失敗。請稍後再試。');
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上傳失敗，請稍後再試');
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // 清空文件輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-[#5a6c7d]">
        載入中...
      </div>
    );
  }

  return (
    <div className="sketch-box p-6 bg-white">
      <h3 className="text-xl font-bold mb-4 text-[#2c3e50] transform rotate-1">
        ⚙️ 行程設定
      </h3>

      <div className="space-y-4">
        {/* 出發日期 */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-[#2c3e50] font-semibold">
            <Calendar className="w-5 h-5 text-[#3498db]" />
            <span>出發日期</span>
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db] text-[#2c3e50]"
            style={{
              borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
            }}
          />
          <p className="text-xs text-[#95a5a6] mt-1">
            格式：YYYY-MM-DD（例如：2025-10-10）
          </p>
        </div>

        {/* 邀請碼 */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-[#2c3e50] font-semibold">
            <Hash className="w-5 h-5 text-[#3498db]" />
            <span>團隊邀請碼</span>
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db] text-[#2c3e50] font-mono font-bold"
            style={{
              borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
            }}
            placeholder="WL4SHOW"
          />
          <p className="text-xs text-[#95a5a6] mt-1">
            用於生成邀請鏈接的團隊代碼
          </p>
        </div>

        {/* 海拔剖面圖圖片 */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-[#2c3e50] font-semibold">
            <ImageIcon className="w-5 h-5 text-[#3498db]" />
            <span>海拔剖面圖圖片</span>
          </label>
          
          {/* 上傳按鈕 */}
          <div className="mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className={`washi-tape-button w-full py-2 flex items-center justify-center gap-2 font-semibold transition-all ${
                uploading
                  ? "bg-[#95a5a6] cursor-not-allowed"
                  : "bg-[#27ae60] hover:bg-[#229954]"
              } text-white`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>上傳中... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>上傳圖片</span>
                </>
              )}
            </button>
            {uploading && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#27ae60] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* URL 輸入（備用方案） */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db] text-[#2c3e50]"
                style={{
                  borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
                }}
                placeholder="或輸入圖片 URL"
              />
              {imageUrl && !uploading && (
                <button
                  onClick={handleClearImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 hover:bg-white border border-[#e74c3c] rounded-full transition-colors"
                  title="清除圖片"
                >
                  <X className="w-3 h-3 text-[#e74c3c]" />
                </button>
              )}
            </div>
            {imageUrl && (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="預覽"
                  className="w-full h-auto border-2 border-[#bdc3c7] rounded-lg"
                  style={{
                    borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <button
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white border-2 border-[#e74c3c] rounded-full transition-colors"
                  title="清除圖片"
                >
                  <X className="w-4 h-4 text-[#e74c3c]" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-[#95a5a6] mt-1">
            點擊「上傳圖片」選擇本地圖片，或輸入圖片 URL。留空則使用預設的 SVG 圖表。圖片大小限制：5MB。
          </p>
        </div>

        {/* 活動介紹文字 */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-[#2c3e50] font-semibold">
            <FileText className="w-5 h-5 text-[#3498db]" />
            <span>活動介紹</span>
          </label>
          <textarea
            value={activityIntro}
            onChange={(e) => setActivityIntro(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db] text-[#2c3e50] resize-y"
            style={{
              borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
            }}
            placeholder="輸入活動介紹文字，使用換行分隔段落..."
          />
          <p className="text-xs text-[#95a5a6] mt-1">
            支援多行文字，每行會自動轉換為一個段落。可以使用換行來分隔不同段落。
          </p>
        </div>

        {/* 交通資訊 */}
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 mb-2 text-[#2c3e50] font-semibold">
              <Car className="w-5 h-5 text-[#3498db]" />
              <span>開車前往</span>
            </label>
            <input
              type="text"
              value={transportationDrive}
              onChange={(e) => setTransportationDrive(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db] text-[#2c3e50]"
              style={{
                borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
              }}
              placeholder="前往武陵農場（武陵山莊）"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 mb-2 text-[#2c3e50] font-semibold">
              <Bus className="w-5 h-5 text-[#3498db]" />
              <span>大眾運輸</span>
            </label>
            <input
              type="text"
              value={transportationPublic}
              onChange={(e) => setTransportationPublic(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[#bdc3c7] rounded-lg focus:outline-none focus:border-[#3498db] text-[#2c3e50]"
              style={{
                borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
              }}
              placeholder="可搭乘國光客運 1751 或 1764 路線"
            />
          </div>
        </div>

        {/* 儲存按鈕 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`washi-tape-button w-full py-3 flex items-center justify-center gap-2 font-semibold transition-all ${
            saving
              ? "bg-[#95a5a6] cursor-not-allowed"
              : saveStatus === "success"
              ? "bg-[#27ae60] hover:bg-[#229954]"
              : saveStatus === "error"
              ? "bg-[#e74c3c] hover:bg-[#c0392b]"
              : "bg-[#3498db] hover:bg-[#2980b9]"
          } text-white`}
        >
          <Save className="w-5 h-5" />
          {saving
            ? "儲存中..."
            : saveStatus === "success"
            ? "✓ 已儲存"
            : saveStatus === "error"
            ? "✗ 儲存失敗"
            : "儲存設定"}
        </button>
      </div>
    </div>
  );
}

