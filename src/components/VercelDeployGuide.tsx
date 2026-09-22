import React, { useState } from 'react';
import {
  CloudUpload,
  Database,
  CheckCircle,
  Copy,
  ExternalLink,
  Shield,
  Terminal,
  Zap,
} from 'lucide-react';

interface VercelDeployGuideProps {
  isOpen: boolean;
  onClose: () => void;
  mongoConnected: boolean;
}

export const VercelDeployGuide: React.FC<VercelDeployGuideProps> = ({
  isOpen,
  onClose,
  mongoConnected,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const vercelJsonSample = `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  const envSample = `MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/formfiller?retryWrites=true&w=majority"
JWT_SECRET="formfiller-production-jwt-secret-key-2026"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <CloudUpload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Deploy on Vercel + Free MongoDB Atlas</h2>
              <p className="text-xs text-slate-500">
                Serverless production deployment and 100% free database setup guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-lg font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Database Status Alert */}
        <div className="my-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-emerald-600" />
            <div>
              <div className="text-xs font-bold text-slate-900">
                Database Status:{' '}
                <span className="text-emerald-700 font-bold">
                  {mongoConnected ? 'Connected to MongoDB Atlas' : 'Ready for Cloud Atlas Connection'}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                Works seamlessly in local preview, and routes automatically in Vercel Serverless Functions.
              </div>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            Free Tier Compatible
          </span>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-6 text-xs text-slate-700">
          {/* Step 1: MongoDB Atlas */}
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                1
              </span>
              <h3>Configure Free MongoDB Atlas Cluster</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              MongoDB provides a lifetime free shared cluster (M0) with 512MB storage and zero credit card required.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 pl-1">
              <li>
                Sign in to{' '}
                <a
                  href="https://cloud.mongodb.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5"
                >
                  cloud.mongodb.com <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                <strong className="text-amber-900">Crucial Step — Allow Cloud Access:</strong> In the left sidebar, click <strong>Network Access</strong> &rarr; <strong>Add IP Address</strong> &rarr; click <span className="rounded bg-amber-200/80 text-amber-950 px-1.5 py-0.5 font-mono font-bold">Allow Access from Anywhere (0.0.0.0/0)</span> &rarr; <strong>Confirm</strong>.
                <p className="mt-1 text-[11px] text-amber-800">
                  Without 0.0.0.0/0, MongoDB Atlas blocks connections from cloud environments (Vercel, Cloud Run) with a TLS/SSL Alert error.
                </p>
              </li>
              <li>Under <strong>Database Access</strong>, ensure your user has <strong>Read and write to any database</strong> privileges.</li>
              <li>Click <strong>Database</strong> &rarr; <strong>Connect</strong> &rarr; <strong>Drivers (Node.js)</strong> to view your connection string.</li>
            </ol>
          </div>

          {/* Step 2: Vercel Deploy */}
          <div className="space-y-2 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                2
              </span>
              <h3>Deploy to Vercel (1-Click or CLI)</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              FormFiller includes built-in Vercel configuration (`vercel.json`) which directs all `/api/*` endpoints to the serverless handler and serves the fast Vite SPA frontend.
            </p>

            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-[11px] text-slate-800">
              <pre className="overflow-x-auto">{vercelJsonSample}</pre>
              <button
                onClick={() => copyToClipboard(vercelJsonSample, 'vercelJson')}
                className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
              >
                {copiedSection === 'vercelJson' ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 3: Environment Variables */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                3
              </span>
              <h3>Set Environment Variables in Vercel Project Settings</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              In your Vercel Dashboard, go to <strong>Project Settings &rarr; Environment Variables</strong> and add:
            </p>

            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-[11px] text-slate-800">
              <pre className="overflow-x-auto">{envSample}</pre>
              <button
                onClick={() => copyToClipboard(envSample, 'env')}
                className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
              >
                {copiedSection === 'env' ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-6">
          <div className="text-[11px] text-slate-500">
            Co-Founder: Rudra Pratap Singh • Zero-Knowledge Architecture
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Got It, Close
          </button>
        </div>
      </div>
    </div>
  );
};
