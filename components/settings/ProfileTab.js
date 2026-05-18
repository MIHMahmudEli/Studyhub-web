import { Camera, UploadCloud, Trash2, Save } from 'lucide-react';

export default function ProfileTab({
  user,
  profileForm,
  handleProfileChange,
  handleSaveProfile,
  uploadingPic,
  handleProfilePicUpload,
  handleProfilePicDelete,
  departments,
  saving
}) {
  return (
    <form onSubmit={handleSaveProfile} className="space-y-6">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Personal Info</h3>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">Review and update your university profile details.</p>
      </div>

      {/* Profile Picture Uploader */}
      <div className="p-6 bg-slate-500/5 border border-[var(--card-border)] rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
        <div className="relative group shrink-0 w-24 h-24">
          {user.profile_pic ? (
            <img 
              src={user.profile_pic} 
              alt={user.name} 
              className="w-24 h-24 rounded-3xl object-cover border border-[var(--card-border)] shadow-md group-hover:brightness-75 transition-all duration-300"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl shadow-lg uppercase group-hover:brightness-90 transition-all duration-300">
              {user.name ? user.name[0] : 'U'}
            </div>
          )}
          
          {/* Interactive upload trigger overlay */}
          <label 
            htmlFor="profile-pic-input"
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          >
            <Camera size={20} className="scale-90 group-hover:scale-100 transition-transform duration-300" />
          </label>
          
          <input 
            type="file"
            id="profile-pic-input"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={handleProfilePicUpload}
            disabled={uploadingPic}
          />
        </div>
        
        <div className="space-y-2 text-center md:text-left w-full">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Profile Picture</h4>
          <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
            Supported formats: PNG, JPG, WEBP. Max allowed size: 2MB.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <label 
              htmlFor="profile-pic-input"
              className="px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white text-blue-500 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5"
            >
              <UploadCloud size={12} /> {uploadingPic ? 'Uploading...' : 'Choose Image'}
            </label>
            
            {user.profile_pic && (
              <button 
                type="button"
                onClick={handleProfilePicDelete}
                disabled={uploadingPic}
                className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={profileForm.name} 
            onChange={handleProfileChange}
            required
            className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors"
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">Email Address (Read-only)</label>
          <input 
            type="email" 
            name="email" 
            value={profileForm.email} 
            disabled
            className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
            placeholder="yourname@student.edu"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">Department / Major (Optional)</label>
          <select 
            name="dept" 
            value={profileForm.dept} 
            onChange={handleProfileChange}
            className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer text-[var(--foreground)]"
          >
            <option value="" className="bg-[var(--card-bg)] text-slate-400">Select Department</option>
            {departments.map((d, index) => (
              <option key={index} value={d} className="bg-[var(--card-bg)] text-[var(--foreground)] font-semibold py-2">
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-400">Student ID / Code (Optional)</label>
          <input 
            type="text" 
            name="code" 
            value={profileForm.code} 
            onChange={handleProfileChange}
            className="w-full px-5 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500/50 transition-colors"
            placeholder="Leave blank or enter Student Code"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--card-border)] flex justify-end">
        <button 
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={14} /> Save Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}
