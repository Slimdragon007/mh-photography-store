import Link from 'next/link';
import { r2PublicUrl } from '@/lib/r2-list';
import AddToCartButton from '@/components/AddToCartButton';
import CartIcon from '@/components/CartIcon';

function formatTitle(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove file extension
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/(\d+)$/g, '') // Remove trailing numbers
    .trim();
}

export default async function PhotoPage({ params }: { params: Promise<{ key: string[] }> }) {
  const { key: keyParts } = await params;
  const key = decodeURIComponent(keyParts.join('/'));
  const url = r2PublicUrl(key);
  const filename = key.split('/').pop() || 'Untitled';
  const title = formatTitle(filename);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gallery
          </Link>
          
          <Link href="/cart" className="hover:scale-105 transition-transform">
            <CartIcon />
          </Link>
        </div>
      </nav>

      {/* Photo Display */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="aspect-[4/3] bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={url} 
              alt={title} 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Photo Details */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-light text-slate-800 mb-2">
                  {title}
                </h1>
                <p className="text-slate-600">Fine Art Photography by Michael Haslim</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <AddToCartButton
                    productId={key}
                    title={title}
                    imageUrl={url}
                  />
                </div>
                <button className="border border-slate-300 text-slate-700 px-8 py-3 rounded-md hover:bg-slate-50 transition-colors font-medium">
                  Download Preview
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-slate-800 mb-3">About This Print</h3>
                  <p className="text-slate-600 leading-relaxed">
                    This stunning landscape photograph captures the raw beauty and dramatic essence of nature&apos;s most breathtaking moments. 
                    Each print is carefully produced on premium archival paper to ensure lasting quality and vibrant colors.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 mb-3">Print Details</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Medium:</span>
                      <span>Archival Fine Art Paper</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available Sizes:</span>
                      <span>12&quot;×16&quot;, 16&quot;×20&quot;, 24&quot;×32&quot;</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Edition:</span>
                      <span>Limited Series</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signed:</span>
                      <span>By Artist</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}