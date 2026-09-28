import React, { useState } from 'react';
import { BotConfig } from '../types/bot';
import { sourceFiles, CodeFile } from '../data/sourceCode';
import JSZip from 'jszip';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Terminal, 
  FileCheck,
  FolderOpen
} from 'lucide-react';

interface CodeExplorerProps {
  config: BotConfig;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ config }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(sourceFiles[0]);
  const [copied, setCopied] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const fileContent = selectedFile.getContent(config);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      const zip = new JSZip();

      // Add all project files into the zip archive
      sourceFiles.forEach((file) => {
        zip.file(file.name, file.getContent(config));
      });

      // Also add a ready .env file populated with current config!
      const envExample = sourceFiles.find(f => f.name === '.env.example');
      if (envExample) {
        zip.file('.env', envExample.getContent(config));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'telegram-business-bot.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP yaratishda xatolik:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.py')) return <FileCode className="w-4 h-4 text-emerald-400" />;
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) return <FileText className="w-4 h-4 text-blue-400" />;
    if (fileName.startsWith('.env')) return <Terminal className="w-4 h-4 text-amber-400" />;
    return <FileCheck className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
      {/* Top Header bar with Download ZIP button */}
      <div className="bg-slate-850 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Python Loyiha Fayllari (aiogram 3.x + google-genai)
            </h3>
            <p className="text-xs text-slate-400">
              Jami {sourceFiles.length} ta to'liq fayl. Sozlamalaringiz asosida avtomatik yangilanadi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Nusxalandi!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Nusxa olish</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingZip ? 'Arxivlanmoqda...' : 'Yuklab olish (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Main split: Sidebar file tree + Code viewer */}
      <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
        {/* File List Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-slate-800 bg-slate-950/60 p-2 overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">
            Loyiha fayllari
          </div>
          <div className="space-y-0.5">
            {sourceFiles.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition text-xs ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-850 hover:text-slate-100'
                  }`}
                >
                  {getFileIcon(file.name)}
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content View */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-slate-950 overflow-hidden">
          {/* File Meta Header */}
          <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-slate-200">{selectedFile.name}</span>
            <span className="text-slate-500">{selectedFile.description}</span>
          </div>

          {/* Code text */}
          <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed selection:bg-blue-600/40">
            <pre>
              <code>{fileContent}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
