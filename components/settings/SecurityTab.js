import { Eye, EyeOff, Save } from 'lucide-react';

export default function SecurityTab({
  securityForm,
  handleSecurityChange,
  handleUpdatePassword,
  showPassword,
  setShowPassword,
  passwordRules,
  saving
}) {
  return (
    <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Security & Password</h3>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Configure security updates for your login credentials.</p>
      </div>

      <div className="space-y-5">
        {/* Current Password Field */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">Current Password</label>
          <div className="relative">
            <input 
              type={showPassword.current ? "text" : "password"} 
              name="currentPassword" 
              value={securityForm.currentPassword} 
              onChange={handleSecurityChange}
              required
              className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
              placeholder="Enter current password to verify"
            />
            <button 
              type="button"
              onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">New Password</label>
          <div className="relative">
            <input 
              type={showPassword.new ? "text" : "password"} 
              name="newPassword" 
              value={securityForm.newPassword} 
              onChange={handleSecurityChange}
              required
              className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
              placeholder="Min. 8 characters"
            />
            <button 
              type="button"
              onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Interactive Password Strength Indicators */}
          {securityForm.newPassword && (
            <div className="grid grid-cols-2 gap-2 mt-3 p-4 bg-slate-500/5 rounded-2xl border border-[var(--card-border)]">
              {Object.entries(passwordRules).map(([key, met]) => (
                <div key={key} className="flex items-center gap-2 text-[9px] uppercase font-black tracking-widest transition-colors">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${met ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 scale-110' : 'bg-slate-400 dark:bg-slate-600'}`} />
                  <span className={met ? 'text-emerald-500 font-bold' : 'text-slate-500'}>
                    {key === 'length' && 'Min 8 Characters'}
                    {key === 'uppercase' && '1 Uppercase Letter'}
                    {key === 'lowercase' && '1 Lowercase Letter'}
                    {key === 'number' && '1 Digit (0-9)'}
                    {key === 'special' && '1 Special (e.g. !@#)'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">Confirm New Password</label>
          <div className="relative">
            <input 
              type={showPassword.confirm ? "text" : "password"} 
              name="confirmPassword" 
              value={securityForm.confirmPassword} 
              onChange={handleSecurityChange}
              required
              className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
              placeholder="Repeat new password"
            />
            <button 
              type="button"
              onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--card-border)] flex justify-end">
        <button 
          type="submit"
          disabled={saving || !Object.values(passwordRules).every(Boolean)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={14} /> Update Password
            </>
          )}
        </button>
      </div>
    </form>
  );
}
