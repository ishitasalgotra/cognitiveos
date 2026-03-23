import React from "react";
import { LogOut, User } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between px-4 py-2
                    border-b border-border bg-surface flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-cyan/20 border border-cyan/30
                        flex items-center justify-center">
          <span className="font-display font-bold text-cyan text-[10px]">C</span>
        </div>
        <span className="font-display font-semibold text-bright text-xs">Cognitive OS</span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal/20 border border-teal/30
                            flex items-center justify-center">
              <User size={11} className="text-teal" />
            </div>
            <span className="font-mono text-[11px] text-dim">{user.name}</span>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-dim
                       hover:text-rose hover:bg-rose/10 transition-colors text-xs font-display">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}