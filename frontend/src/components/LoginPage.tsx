import { Authenticator } from '@aws-amplify/ui-react';
import { Stethoscope, Mic, FileText, Link2 } from 'lucide-react';

const features = [
    { Icon: Mic, title: 'Real-time Transcription', desc: 'Multilingual voice capture in English, Hindi & more' },
    { Icon: FileText, title: 'SOAP Note Generation', desc: 'AI-structured clinical notes generated in seconds' },
    { Icon: Link2, title: 'EMR / EHR Integration', desc: 'Sync directly to your existing records system' },
];

const components = {
    Header() {
        return (
            <div className="flex flex-col items-center px-4 pt-7 pb-2">
                {/* Mobile-only branding above form */}
                <div className="flex md:hidden items-center gap-2.5 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#196ee6] flex items-center justify-center shadow-md">
                        <Stethoscope size={20} color="white" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-900 leading-tight">Swarksha</p>
                        <p className="text-[11px] text-slate-400 leading-tight">AI Clinical Documentation</p>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 text-center">Welcome back</h2>
                <p className="text-slate-500 text-sm text-center mt-1">Sign in to continue to Swarksha</p>
                <div className="w-10 h-0.5 bg-[#196ee6]/30 rounded-full mt-4" />
            </div>
        );
    },
};

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row">

            {/* ── Left Branding Panel (desktop only) ── */}
            <div
                className="hidden md:flex md:w-5/12 lg:w-[45%] relative overflow-hidden flex-col"
                style={{ background: 'linear-gradient(145deg, #1a7ef8 0%, #196ee6 30%, #1557c0 65%, #1346a0 100%)' }}
            >
                {/* Decorative blobs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute top-1/3 -right-10 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full p-10 lg:p-14">

                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                            <Stethoscope size={26} color="white" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">Swarksha</span>
                    </div>

                    {/* Hero content */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl lg:text-[2.75rem] font-bold text-white leading-tight tracking-tight">
                                Clinical docs,<br />
                                <span className="text-blue-200">effortlessly.</span>
                            </h1>
                            <p className="text-blue-100/90 text-base mt-4 leading-relaxed max-w-xs">
                                AI-powered voice transcription and SOAP note generation — built for modern healthcare.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div className="space-y-4">
                            {features.map(({ Icon, title, desc }) => (
                                <div key={title} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                                        <Icon size={18} color="white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm leading-snug">{title}</p>
                                        <p className="text-blue-200/80 text-xs mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-blue-200/50 text-xs">
                        © 2025 Swarksha · HIPAA-aware · Secure by default
                    </p>
                </div>
            </div>

            {/* ── Right: Auth Form Panel ── */}
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f8fafc] min-h-screen md:min-h-0 px-4 py-10 md:py-8">
                <div className="w-full max-w-[430px]">
                    <Authenticator components={components} />
                </div>
            </div>
        </div>
    );
}
