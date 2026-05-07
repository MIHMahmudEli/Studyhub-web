import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton({ showScrollBtn, onScrollToTop }) {
  return (
    <button
      onClick={onScrollToTop}
      className={`fixed sm:bottom-8 sm:right-8 bottom-5 right-5 sm:w-14 sm:h-14 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition transform hover:scale-110 z-40 ${
        showScrollBtn ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <ChevronUp className="w-6 h-6 text-white" />
    </button>
  );
}
