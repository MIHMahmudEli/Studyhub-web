import courses from '@/lib/data/courses.json';

const ACRONYM_MAP = {
  'os': ['OPERATING SYSTEM', 'OPERATING SYSTEMS'],
  'ds': ['DATA STRUCTURE', 'DATA STRUCTURES', 'DATA STRUCTURE LAB'],
  'dbms': ['ADVANCE DATABASE MANAGEMENT SYSTEM', 'INTRODUCTION TO DATABASE', 'DATABASE'],
  'cn': ['COMPUTER NETWORKS', 'COMPUTER NETWORK', 'ADVANCED COMPUTER NETWORKS'],
  'ai': ['ARTIFICIAL INTELLIGENCE AND EXPERT SYSTEM', 'ARTIFICIAL INTELLIGENCE'],
  'ml': ['MACHINE LEARNING'],
  'coa': ['COMPUTER ORGANIZATION AND ARCHITECTURE'],
  'ca': ['COMPUTER ORGANIZATION AND ARCHITECTURE'],
  'oop': ['OBJECT ORIENTED PROGRAMMING 1 (JAVA)', 'OBJECT ORIENTED PROGRAMMING 2', 'OBJECT ORIENTED ANALYSIS AND DESIGN'],
  'oop1': ['OBJECT ORIENTED PROGRAMMING 1 (JAVA)'],
  'oop2': ['OBJECT ORIENTED PROGRAMMING 2'],
  'hci': ['HUMAN COMPUTER INTERACTION'],
  'cg': ['COMPUTER GRAPHICS'],
  'cv': ['COMPUTER VISION AND PATTERN RECOGNITION'],
  'nlp': ['NATURAL LANGUAGE PROCESSING'],
  'ns': ['NETWORK SECURITY'],
  'cns': ['NETWORK SECURITY'],
  'dm': ['DISCRETE MATHEMATICS', 'DIFF CALCULUS AND COORDINATE GEOMETRY'],
  'algo': ['ALGORITHMS'],
  'cd': ['COMPILER DESIGN'],
  'toc': [],
  'se': [],
  'dl': [],
  'dld': [],
  'web': ['ADVANCED PROGRAMMING IN WEB TECHNOLOGY'],
  'wt': ['ADVANCED PROGRAMMING IN WEB TECHNOLOGY'],
  'python': ['PROGRAMMING IN PYTHON'],
  'java': ['ADVANCED PROGRAMMING WITH JAVA', 'OBJECT ORIENTED PROGRAMMING 1 (JAVA)'],
  'dotnet': ['ADVANCED PROGRAMMING WITH .NET'],
  'math': ['DIFF CALCULUS AND COORDINATE GEOMETRY', 'DISCRETE MATHEMATICS', 'BUSINESS MATHEMATICS-1', 'MATHEMATICS 1 (ECO)'],
  'physics': ['PHYSICS 1', 'PHYSICS 1 LAB'],
  'chem': ['CHEMISTRY', 'BIOPHYSICAL CHEMISTRY', 'BIO-ORGANIC CHEMISTRY'],
  'bio': ['MOLECULAR BIOLOGY 1', 'MOLECULAR BIOLOGY II', 'MICROBIOLOGY I', 'CELLS AND BIOMOLECULES'],
  'eng': ['ENGLISH READING', 'ENGLISH WRITING SKILLS & COMMUNICATIONS [FST/FE]', 'ENGLISH READING SKILLS & PUBLIC SPEAKING'],
  'eco': ['PRINCIPLES OF ECONOMICS', 'INTRODUCTION TO MICROECONOMICS', 'HEALTH ECONOMICS [MPH]'],
  'acc': ['FINANCIAL ACCOUNTING', 'ACCOUNTING FOR MANAGERS [EMBA]', 'PRINCIPLES OF ACCOUNTING [MBA]'],
  'stat': ['INTRODUCTION TO BIOSTATISTICS', 'BIOSTATISTICS 2 [MPH]', 'STATISTICS FOR DEVELOPMENT [MDS]'],
};

export function getSuggestions(query) {
  if (!query || query.trim().length < 1) return [];

  const q = query.trim().toLowerCase();

  const acronymMatches = ACRONYM_MAP[q] || [];
  const acronymCourseMatches = acronymMatches
    .map(title => {
      const course = courses.find(c => c.courseTitle.toLowerCase() === title.toLowerCase());
      return course;
    })
    .filter(Boolean);

  const directMatches = courses.filter(c => {
    const title = c.courseTitle.toLowerCase();
    const code = c.code.toLowerCase();
    const dept = c.dept.toLowerCase();
    return title.includes(q) || code.includes(q) || dept.includes(q);
  });

  const acronymLetterMatches = courses.filter(c => {
    if (q.length < 2 || q.length > 6) return false;
    const words = c.courseTitle.split(/[\s\-_&,/]+/).filter(w => w.length > 0);
    if (words.length < q.length) return false;
    const initials = words.map(w => w[0].toLowerCase()).join('');
    return initials === q;
  });

  const combined = new Map();
  for (const c of [...acronymCourseMatches, ...directMatches, ...acronymLetterMatches]) {
    combined.set(c.code + c.courseTitle, c);
  }

  return Array.from(combined.values()).slice(0, 8);
}

export function expandShortForm(query) {
  if (!query || query.trim().length < 2) return null;
  const q = query.trim().toLowerCase();

  const titles = ACRONYM_MAP[q];
  if (titles && titles.length > 0) {
    return titles[0];
  }

  const course = courses.find(c => {
    const words = c.courseTitle.split(/[\s\-_&,/]+/).filter(w => w.length > 0);
    if (words.length < q.length || q.length > 6) return false;
    const initials = words.map(w => w[0].toLowerCase()).join('');
    return initials === q;
  });
  if (course) return course.courseTitle;

  return null;
}
