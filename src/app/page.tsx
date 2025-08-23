import Link from 'next/link';
import { listR2, r2PublicUrl } from '@/lib/r2-list';
import CartIcon from '@/components/CartIcon';

function formatTitle(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove file extension
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/(\d+)$/g, '') // Remove trailing numbers
    .trim();
}

export default async function Home() {
  const keys = await listR2('prints/');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-end">
          <Link href="/cart" className="text-white hover:text-slate-200 transition-colors hover:scale-105 transform">
            <CartIcon />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-4 tracking-wide">
              Michael Haslim
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 font-light tracking-wide">
              Fine Art Photography
            </p>
            <div className="mt-8 w-24 h-px bg-white/30 mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4 tracking-wide">
            Gallery
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Capturing the raw beauty of nature's most breathtaking moments through the lens of adventure and artistry.
          </p>
        </div>

        {keys.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl text-slate-600 mb-2">No images yet</h3>
            <p className="text-slate-500">Upload some photos to get started.</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {keys.map((key, index) => (
              <Link 
                key={key} 
                href={`/photos/${encodeURIComponent(key)}`} 
                className="group block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={r2PublicUrl(key)} 
                    alt={formatTitle(key.split('/').pop() || 'landscape photo')} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading={index < 6 ? "eager" : "lazy"}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                    {formatTitle(key.split('/').pop() || 'Untitled')}
                  </h3>
                  <p className="text-slate-500 text-sm tracking-wide">
                    Fine Art Print
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {keys.length > 0 && (
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-2 text-slate-500">
              <div className="w-8 h-px bg-slate-300"></div>
              <span className="text-sm tracking-wider">{keys.length} {keys.length === 1 ? 'Print' : 'Prints'} Available</span>
              <div className="w-8 h-px bg-slate-300"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}