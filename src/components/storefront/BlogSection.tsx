import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { BLOG_POSTS } from '../../data/mockData';

export const BlogSection: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<(typeof BLOG_POSTS)[0] | null>(null);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D7E0D6]">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#2E342D] tracking-tight">
          From Our Blog
        </h2>
        <button
          onClick={() => setSelectedPost(BLOG_POSTS[0])}
          className="text-xs sm:text-sm font-semibold text-[#173F30] hover:text-[#2E5E46] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {BLOG_POSTS.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-xl border border-[#D7E0D6] overflow-hidden shadow-xs hover:shadow-md hover:border-[#173F30] transition-all flex flex-col group cursor-pointer"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#F8F5EF]/90 backdrop-blur-xs text-[#6B7068] text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs border border-[#B9A48B]/40">
                {post.readTime}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#D8C8B3]">
                  {post.date}
                </span>
                <h3 className="text-sm font-bold text-[#2E342D] mt-1 line-clamp-2 group-hover:text-[#173F30] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[#6B7068] mt-1.5 line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-[#D7E0D6] flex items-center text-xs font-semibold text-[#173F30] group-hover:text-[#2E5E46]">
                <span>Read More</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Article Reader Right-Side Drawer (No Center Popups) */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedPost(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-[#D7E0D6]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#D7E0D6] bg-[#E9EBDD] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#173F30] tracking-wider block">
                    Velneer Blog & Kitchen Insights
                  </span>
                  <h3 className="text-sm font-bold text-[#2E342D] line-clamp-1">
                    {selectedPost.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1.5 rounded-full hover:bg-[#D7E0D6] text-[#6B7068] hover:text-[#2E342D] transition-colors cursor-pointer"
                  title="Close Article"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full h-56 object-cover rounded-xl mb-4 border border-[#B9A48B]"
                />

                <div className="flex items-center gap-3 text-xs text-[#D8C8B3] mb-2 font-medium">
                  <span>{selectedPost.date}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime}</span>
                </div>

                <h2 className="text-xl font-bold text-[#2E342D] mb-3">
                  {selectedPost.title}
                </h2>

                <div className="prose prose-sm text-[#6B7068] space-y-3 text-xs sm:text-sm leading-relaxed">
                  <p>{selectedPost.excerpt}</p>
                  <p>
                    Shopping online for lifestyle essentials should never feel overwhelming. At Velneer, we curate only genuine, warrantied products from verified suppliers. Whether you are upgrading your setup with high-speed laptops and ergonomic chairs or revitalizing your skincare with clean Vitamin C serums, knowing what specs actually matter saves time and money.
                  </p>
                  <p>
                    Key takeaways for smart shoppers:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[#2E342D]">
                    <li>Look for verified customer reviews and high rating thresholds (&gt;= 4.2).</li>
                    <li>Check for bundled warranties and return windows (Velneer offers 7-day hassle-free replacements).</li>
                    <li>Apply promo coupons (WELCOME50 or SAVE20) at checkout to maximize discounts.</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#D7E0D6] bg-[#F8F5EF] flex justify-end">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="bg-[#2E342D] hover:bg-[#6B7068] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
