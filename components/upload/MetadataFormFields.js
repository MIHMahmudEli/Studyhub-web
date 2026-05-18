import { 
  BookOpen,
  GraduationCap,
  MessageSquare,
  Search,
  Plus,
  FileText
} from 'lucide-react';

export default function MetadataFormFields({
  titleLabel = "Note Title",
  titleIcon: TitleIcon = BookOpen,
  titlePlaceholder = "Enter title here...",
  
  formData,
  setFormData,
  errors,
  setErrors,
  
  courseSearch,
  setCourseSearch,
  showSuggestions,
  setShowSuggestions,
  filteredCourses,
  selectCourse,
  suggestionsRef,
  
  showPickedCourse = false,
  showTermSelector = false,
  
  validateTitle = (val) => '', // optional validation
  descriptionLabel = "Description",
  descriptionIcon: DescriptionIcon = MessageSquare,
  descriptionPlaceholder = "Summary of the content...",
  descriptionRows = 4,
  children
}) {

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
          <TitleIcon size={14} className={TitleIcon === FileText ? "text-blue-500" : ""} /> {titleLabel} <span className="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          required
          placeholder={titlePlaceholder}
          className={`w-full bg-[var(--background)]/50 border rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all ${
            errors.title ? 'border-red-500/50' : 'border-[var(--card-border)]'
          }`}
          value={formData.title}
          onChange={(e) => {
            const val = e.target.value;
            setFormData({...formData, title: val});
            if (setErrors) setErrors({...errors, title: validateTitle(val)});
          }}
        />
        {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.title}</p>}
      </div>

      {/* Course Search & Auto Suggestion */}
      <div className="space-y-2 relative" ref={suggestionsRef}>
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
          <GraduationCap size={14} className={showPickedCourse ? "text-purple-500" : ""} /> Course Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            required
            placeholder="Search course name or code..."
            className={`w-full bg-[var(--background)]/50 border rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all ${
              errors.course ? 'border-red-500/50' : 'border-[var(--card-border)]'
            }`}
            value={courseSearch}
            onChange={(e) => {
              const val = e.target.value;
              setCourseSearch(val);
              setShowSuggestions(true);
              
              // Clear previous selections based on which component is using it
              if (showPickedCourse) {
                if (formData.courseTitle) setFormData({ ...formData, courseTitle: '', code: '', dept: '' });
              } else {
                if (formData.course) setFormData({ ...formData, course: '' });
              }
            }}
            onFocus={() => setShowSuggestions(true)}
          />
        </div>

        {errors.course && <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">{errors.course}</p>}

        {/* Picked Course Info Display (For Admin Upload) */}
        {showPickedCourse && formData.courseTitle && (
          <div className="mt-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col gap-1 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-500 uppercase tracking-wider">Selected Course</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-lg">{formData.code}</span>
            </div>
            <p className="text-sm font-bold text-[var(--foreground)]">{formData.courseTitle}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formData.dept}</p>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredCourses.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-y-auto max-h-[300px] z-50 backdrop-blur-xl">
            {filteredCourses.map((course) => (
              <button
                key={`${course.courseTitle}-${course.code}`}
                type="button"
                onClick={() => selectCourse(course)}
                className="w-full px-6 py-4 text-left hover:bg-blue-500/5 flex items-center justify-between group transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">{course.courseTitle}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course.code ? `${course.code} • ` : ''}{course.dept}</p>
                </div>
                <Plus size={16} className="text-slate-600 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Term Selector (For Admin Upload) */}
      {showTermSelector && (
        <div className="space-y-3 pt-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
            Exam Term <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`relative flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              formData.term === 'mid' 
                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                : 'border-[var(--card-border)] bg-[var(--card-bg)] text-slate-500 hover:border-blue-500/50'
            }`}>
              <input 
                type="radio" 
                name="term" 
                value="mid"
                checked={formData.term === 'mid'}
                onChange={(e) => setFormData({...formData, term: e.target.value})}
                className="hidden" 
              />
              <span className="text-xs font-black uppercase tracking-widest">Midterm</span>
            </label>
            <label className={`relative flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              formData.term === 'final' 
                ? 'border-purple-500 bg-purple-500/10 text-purple-500' 
                : 'border-[var(--card-border)] bg-[var(--card-bg)] text-slate-500 hover:border-purple-500/50'
            }`}>
              <input 
                type="radio" 
                name="term" 
                value="final"
                checked={formData.term === 'final'}
                onChange={(e) => setFormData({...formData, term: e.target.value})}
                className="hidden" 
              />
              <span className="text-xs font-black uppercase tracking-widest">Final</span>
            </label>
          </div>
        </div>
      )}

      {children}

      {/* Description */}
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
          <DescriptionIcon size={14} className={DescriptionIcon === FileText ? "text-emerald-500" : ""} /> {descriptionLabel}
        </label>
        <textarea 
          rows={descriptionRows}
          placeholder={descriptionPlaceholder}
          className="w-full bg-[var(--background)]/50 border border-[var(--card-border)] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all resize-none"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
    </div>
  );
}
