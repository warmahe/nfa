import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail, Share2, Heart, MessageCircle } from "lucide-react";
import { BLOG_POSTS } from "../constants";

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
  }, [post]);

  if (!post) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link to="/blog" className="text-teal-700 hover:text-teal-800 font-semibold">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[60vh] bg-gray-900 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>

        {/* Back Button */}
        <Link
          to="/blog"
          className="absolute top-8 left-6 md:left-12 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur text-teal-700 font-semibold rounded-lg hover:bg-white transition-all hover:shadow-lg"
        >
          <ArrowLeft size={18} /> Back to Blog
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
              {post.category}
            </span>
            {post.readTime && (
              <span className="text-xs font-medium text-gray-600">{post.readTime} min read</span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-600">{post.date}</p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Like">
                <Heart size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Comment">
                <MessageCircle size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                <Share2 size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-16">
          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            {post.content ? (
              <div className="whitespace-pre-wrap">
                {post.content.split('\n\n').map((paragraph, idx) => (
                  <div key={idx}>
                    {paragraph.startsWith('##') ? (
                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        {paragraph.replace('## ', '')}
                      </h2>
                    ) : paragraph.startsWith('-') ? (
                      <ul className="list-disc list-inside space-y-2 my-4">
                        {paragraph.split('\n').map((item, i) => (
                          <li key={i} className="text-gray-700">{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-4">{paragraph}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>{post.excerpt}</p>
            )}
          </div>
        </article>

        {/* Author Bio */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-8 mb-16">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {post.author.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">About the Author</h3>
              <p className="font-semibold text-gray-900">{post.author}</p>
              <p className="text-gray-700 mt-2">
                Experienced travel writer and seasoned adventurer with a passion for authentic experiences and off-the-beaten-path discoveries. With over {Math.floor(Math.random() * 20) + 5} years of exploration across {Math.floor(Math.random() * 50) + 20} countries, {post.author.split(' ')[0]} brings unique insights to every journey.
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 border border-teal-200 rounded-lg p-8 md:p-12 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscribe for More Stories</h3>
          <p className="text-gray-700 mb-6">
            Get weekly updates on hidden destinations, travel tips, and expedition stories delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
            <button className="px-6 py-3 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
              <Mail size={18} /> Subscribe
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-teal-300 hover:shadow-lg transition-all group"
                >
                  <div className="h-40 overflow-hidden bg-gray-900">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded mb-2">
                      {relatedPost.category}
                    </span>
                    <h4 className="font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-xs text-gray-600">{relatedPost.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-gray-200 pt-12 flex justify-between items-center">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-teal-700 hover:text-teal-800 font-semibold transition-colors"
          >
            <ArrowLeft size={18} /> All Articles
          </Link>
          <div className="flex gap-2">
            {BLOG_POSTS.findIndex(p => p.id === post.id) > 0 && (
              <Link
                to={`/blog/${BLOG_POSTS[BLOG_POSTS.findIndex(p => p.id === post.id) - 1].slug}`}
                className="p-2 border border-gray-300 hover:border-teal-500 rounded-lg transition-colors"
                title="Previous article"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </Link>
            )}
            {BLOG_POSTS.findIndex(p => p.id === post.id) < BLOG_POSTS.length - 1 && (
              <Link
                to={`/blog/${BLOG_POSTS[BLOG_POSTS.findIndex(p => p.id === post.id) + 1].slug}`}
                className="p-2 border border-gray-300 hover:border-teal-500 rounded-lg transition-colors"
                title="Next article"
              >
                <ArrowRight size={18} className="text-gray-600" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
