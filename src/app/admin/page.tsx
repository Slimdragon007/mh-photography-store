'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrashIcon, PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface Photo {
  key: string;
  url: string;
  lastModified: string;
  size: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/admin/photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress('Uploading photos...');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${selectedFiles.length}: ${file.name}`);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      setUploadProgress('Upload complete!');
      setSelectedFiles(null);
      await fetchPhotos();
      
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch('/api/admin/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        await fetchPhotos();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-lg shadow-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Upload Photos</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Select Photos
              </label>
              
              {selectedFiles && (
                <span className="text-gray-300">
                  {selectedFiles.length} file(s) selected
                </span>
              )}
              
              {selectedFiles && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                  Upload
                </button>
              )}
            </div>
            
            {uploadProgress && (
              <div className="text-sm text-gray-300">{uploadProgress}</div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-lg shadow-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Photos ({photos.length})
          </h2>
          
          {loading ? (
            <div className="text-center text-gray-300 py-8">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="text-center text-gray-300 py-8">No photos uploaded yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.map((photo) => (
                <div key={photo.key} className="group relative">
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-white/10">
                    <Image
                      src={photo.url}
                      alt={photo.key}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(photo.key)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300 truncate">{photo.key}</p>
                    <p className="text-xs text-gray-500">
                      {(photo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}