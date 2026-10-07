import React, { useState } from 'react';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { BLOG_POSTS } from '../../data/mockData';

export const BlogSection: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<(typeof BLOG_POSTS)[0] | null>(null);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E8E2DC]">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#1F1F1F] tracking-tight">
          From Our Blog
        </h2>
        <button
          onClick={() => setSelectedPost(BLOG_POSTS[0])}
          className="text-xs sm:text-sm font-semibold text-[#8C6F52] hover:text-[#6B5B4A] flex items-center gap-1 transition-colors cursor-pointer"
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
            className="bg-white rounded-xl border border-[#E8E2DC] overflow-hidden shadow-xs hover:shadow-md hover:border-[#8C6F52] transition-all flex flex-col group cursor-pointer"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#FAF9F6]/90 backdrop-blur-xs text-[#3A3A3A] text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs border border-[#C6B8AB]/40">
                {post.readTime}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#A8927D]">
                  {post.date}
                </span>
                <h3 className="text-sm font-bold text-[#1F1F1F] mt-1 line-clamp-2 group-hover:text-[#8C6F52] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[#3A3A3A] mt-1.5 line-clamp-2">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-[#E8E2DC] flex items-center text-xs font-semibold text-[#8C6F52] group-hover:text-[#6B5B4A]">
                <span>Read More</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-[#1F1F1F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative border border-[#C6B8AB] animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#E8E2DC] text-[#3A3A3A] hover:text-[#1F1F1F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedPost.imageUrl}
              alt={selectedPost.title}
              className="w-full h-56 object-cover rounded-xl mb-4 border border-[#C6B8AB]"
            />

            <div className="flex items-center gap-3 text-xs text-[#A8927D] mb-2 font-medium">
              <span>{selectedPost.date}</span>
              <span>•</span>
              <span>{selectedPost.readTime}</span>
            </div>

            <h2 className="text-xl font-bold text-[#1F1F1F] mb-3">
              {selectedPost.title}
            </h2>

            <div className="prose prose-sm text-[#3A3A3A] space-y-3 text-xs sm:text-sm leading-relaxed">
              <p>{selectedPost.excerpt}</p>
              <p>
                Shopping online for lifestyle essentials should never feel overwhelming. At ShopVerse, we curate only genuine, warrantied products from verified suppliers. Whether you are upgrading your setup with high-speed laptops and ergonomic chairs or revitalizing your skincare with clean Vitamin C serums, knowing what specs actually matter saves time and money.
              </p>
              <p>
                Key takeaways for smart shoppers:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#1F1F1F]">
                <li>Look for verified customer reviews and high rating thresholds ($\ge 4.2$).</li>
                <li>Check for bundled warranties and return windows (ShopVerse offers 7-day hassle-free replacements).</li>
                <li>Apply promo coupons (`WELCOME50` or `SAVE20`) at checkout to maximize discounts.</li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E8E2DC] flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
