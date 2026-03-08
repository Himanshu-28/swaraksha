import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, User, LogOut, Stethoscope } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';

const NAV_ITEMS = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: User, label: 'Profile', path: '/profile' },
];

export default function AppLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const isActive = (path: string) =>
        path === '/' ? pathname === '/' : pathname.startsWith(path);

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">

            {/* ── Desktop Left Sidebar ── */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-100 sticky top-0 h-screen z-20">

                {/* Logo */}
                <div
                    className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <div className="w-9 h-9 rounded-xl bg-[#196ee6] flex items-center justify-center shadow-sm">
                        <Stethoscope size={18} color="white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 tracking-tight">Swarksha</span>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1 p-3 flex-1 mt-2">
                    {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors text-left ${
                                isActive(path)
                                    ? 'bg-[#eff6ff] text-[#196ee6]'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Online status + Sign out */}
                <div className="p-4 border-t border-slate-100 space-y-1">
                    <div className="flex items-center gap-2 px-4 py-2">
                        <div className="bg-[#22c55e] rounded-full size-[8px]" />
                        <p className="font-medium text-[#64748b] text-xs">Online</p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Page Content ── */}
            <div className="flex-1 flex flex-col min-w-0">
                <Outlet />
            </div>

            {/* ── Mobile Bottom Navigation ── */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 z-30 shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                <div className="flex items-end justify-between px-6 pt-2 pb-4">
                    {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
                        const active = isActive(path);
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className="flex flex-1 flex-col gap-1 items-center cursor-pointer"
                            >
                                <Icon size={24} className={active ? 'text-[#196ee6]' : 'text-[#94a3b8]'} />
                                <p className={`font-medium text-[10px] leading-[15px] ${active ? 'text-[#196ee6]' : 'text-[#94a3b8]'}`}>
                                    {label}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
