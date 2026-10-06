import React, { useState, useRef } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  Check,
  X,
  Copy,
  ExternalLink,
  Loader2,
  Paperclip,
} from 'lucide-react';

interface FileUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string, fileName?: string) => void;
  accept?: string;
  isPublic?: boolean;
  helperText?: string;
  className?: string;
  onUploadStart?: () => void;
  onUploadSuccess?: (asset: { url: string; name: string; size: number; mimeType: string }) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label = 'Upload File or Document',
  value,
  onChange,
  accept = 'image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.json,.zip',
  isPublic = false,
  helperText = 'Supports PNG, JPG, WebP, SVG, PDF, DOCX, TXT (up to 25MB)',
  className = '',
  onUploadStart,
  onUploadSuccess,
}) => {
  const { uploadMedia, uploadMediaDetailed, uploadPublicFile } = useCms();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedName, setUploadedName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadedName(file.name);
    if (onUploadStart) {
      onUploadStart();
    }
    try {
      if (isPublic && uploadPublicFile) {
        const url = await uploadPublicFile(file);
        if (url) {
          onChange(url, file.name);
          if (onUploadSuccess) {
            onUploadSuccess({
              url,
              name: file.name,
              size: file.size,
              mimeType: file.type,
            });
          }
        }
      } else {
        if (uploadMediaDetailed) {
          const asset = await uploadMediaDetailed(file);
          if (asset) {
            onChange(asset.url, asset.name);
            if (onUploadSuccess) {
              onUploadSuccess(asset);
            }
          }
        } else {
          const url = await uploadMedia(file);
          if (url) {
            onChange(url, file.name);
            if (onUploadSuccess) {
              onUploadSuccess({
                url,
                name: file.name,
                size: file.size,
                mimeType: file.type,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = () => {
    onChange('', '');
    setUploadedName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopyLink = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = value && (
    value.match(/\.(jpeg|jpg|gif|png|svg|webp)($|\?)/i) ||
    value.startsWith('data:image/')
  );
  const isPdf = value && (value.endsWith('.pdf') || value.includes('pdf'));
  const isDoc = value && (value.endsWith('.doc') || value.endsWith('.docx'));
  const isCode = value && (value.endsWith('.json') || value.endsWith('.xml') || value.endsWith('.txt'));
  const isSheet = value && (value.endsWith('.csv') || value.endsWith('.xlsx'));

  const getDocIcon = () => {
    if (isPdf) return <FileText className="w-6 h-6 text-rose-400" />;
    if (isDoc) return <FileText className="w-6 h-6 text-sky-400" />;
    if (isCode) return <FileCode className="w-6 h-6 text-amber-400" />;
    if (isSheet) return <FileSpreadsheet className="w-6 h-6 text-emerald-400" />;
    return <Paperclip className="w-6 h-6 text-cyan-400" />;
  };

  const getFileNameFromUrl = (url: string) => {
    if (uploadedName) return uploadedName;
    if (url.startsWith('data:')) return 'Base64 Attachment';
    const parts = url.split('/');
    const raw = parts[parts.length - 1];
    return raw.replace(/^(pub-)?\d+-/, '');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300 light:text-slate-700">
            {label}
          </label>
          {value && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied URL!' : 'Copy Asset URL'}</span>
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="p-3.5 rounded-2xl bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-200 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3 overflow-hidden">
            {isImage ? (
              <div className="relative w-12 h-12 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                <img
                  src={value}
                  alt="Uploaded content preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-800 flex items-center justify-center shrink-0">
                {getDocIcon()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white light:text-slate-900 truncate">
                {getFileNameFromUrl(value)}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                <span className="uppercase text-cyan-400 font-bold">
                  {isImage ? 'IMAGE' : isPdf ? 'PDF DOC' : isDoc ? 'WORD DOC' : 'ATTACHMENT'}
                </span>
                <span>•</span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-cyan-400 flex items-center gap-0.5 underline"
                >
                  <span>View File</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-800 hover:text-white text-[11px] font-bold transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
              : 'border-slate-800 light:border-slate-300 bg-slate-950/60 light:bg-slate-50 hover:border-slate-700 light:hover:border-slate-400'
          }`}
        >
          {uploading ? (
            <div className="py-2 space-y-2 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs font-bold text-cyan-400">Uploading file to server...</p>
              <p className="text-[10px] text-slate-400">{uploadedName}</p>
            </div>
          ) : (
            <div className="space-y-2 flex flex-col items-center justify-center">
              <div className="p-3 rounded-2xl bg-slate-900 light:bg-white text-cyan-400 border border-slate-800 light:border-slate-200 shadow-md">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 light:text-slate-800">
                  Click to choose file or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
