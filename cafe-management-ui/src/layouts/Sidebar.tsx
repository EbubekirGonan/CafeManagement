import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSections } from '../hooks/useSections';
import { useQueryClient } from '@tanstack/react-query';
import { removeToken } from '../utils/auth';

const menuIconClass = 'w-5 h-5';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tablesOpen, setTablesOpen] = useState(
    location.pathname.startsWith('/tables'),
  );
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith('/settings'),
  );

  const { data: sections } = useSections();

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`;

  const subLinkClass = (isActive: boolean) =>
    `block px-4 py-2 pl-12 text-sm rounded-lg transition-colors ${
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    }`;

  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    removeToken();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-white tracking-wide">
          ☕ Kafe Yönetim
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <NavLink to="/dashboard" className={({ isActive }) => linkClass(isActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" className={menuIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>
          Dashboard
        </NavLink>

        {/* Masalar ve Siparişler */}
        <div>
          <button
            onClick={() => {
              setTablesOpen(!tablesOpen);
              if (!tablesOpen) navigate('/tables');
            }}
            className={`w-full ${linkClass(location.pathname.startsWith('/tables'))}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={menuIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /></svg>
            <span className="flex-1 text-left">Masalar ve Siparişler</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${tablesOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>
          {tablesOpen && (
            <div className="mt-1 space-y-0.5">
              <NavLink
                to="/tables"
                end
                className={({ isActive }) =>
                  subLinkClass(isActive && !location.search)
                }
              >
                Tüm Masalar
              </NavLink>
              {sections?.map((section) => (
                <NavLink
                  key={section.id}
                  to={`/tables?section=${section.id}`}
                  className={() =>
                    subLinkClass(
                      location.pathname === '/tables' &&
                        location.search === `?section=${section.id}`,
                    )
                  }
                >
                  {section.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Satışlar */}
        <NavLink to="/sales" className={({ isActive }) => linkClass(isActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" className={menuIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          Satışlar
        </NavLink>

        {/* Giderler */}
        <NavLink to="/expenses" className={({ isActive }) => linkClass(isActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" className={menuIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
          Giderler
        </NavLink>

        {/* Sabitler */}
        <div>
          <button
            onClick={() => {
              if (!settingsOpen) navigate('/settings/categories');
              setSettingsOpen(!settingsOpen);
            }}
            className={`w-full ${linkClass(location.pathname.startsWith('/settings'))}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={menuIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
            <span className="flex-1 text-left">Sabitler</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>
          {settingsOpen && (
            <div className="mt-1 space-y-0.5">
              <NavLink to="/settings/categories" className={({ isActive }) => subLinkClass(isActive)}>Ürün Kategorileri</NavLink>
              <NavLink to="/settings/expense-categories" className={({ isActive }) => subLinkClass(isActive)}>Gider Kategorileri</NavLink>
              <NavLink to="/settings/sections" className={({ isActive }) => subLinkClass(isActive)}>İşletme Bölümleri</NavLink>
              <NavLink to="/settings/tables" className={({ isActive }) => subLinkClass(isActive)}>Masalar</NavLink>
              <NavLink to="/settings/products" className={({ isActive }) => subLinkClass(isActive)}>Ürünler</NavLink>
            </div>
          )}
        </div>

        {/* Raporlar */}
        <NavLink to="/reports" className={({ isActive }) => linkClass(isActive)}>
          <svg xmlns="http://www.w3.org/2000/svg" className={menuIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
          Raporlar
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={menuIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
