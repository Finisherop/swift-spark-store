import React, { useState } from 'react';
import { AdvancedImageUploader } from './advanced-image-uploader';
import { SimpleImageUploader } from './simple-image-uploader';

export function ImageUploaderUsageExample() {
  const [advancedImage, setAdvancedImage] = useState<{
    file?: File;
    url?: string;
    dataUrl: string;
  } | null>(null);

  const [simpleImage, setSimpleImage] = useState<{
    file?: File;
    url?: string;
    dataUrl: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Uploader Components
          </h1>
          <p className="text-xl text-gray-600">
            Fully functional React components with drag-drop, URL input, and preview features
          </p>
        </div>

        {/* Advanced Image Uploader */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Advanced Image Uploader (with ShadCN UI)
            </h2>
            
            <AdvancedImageUploader
              onImageUpload={setAdvancedImage}
              maxSizeMB={10}
              acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
              placeholder="Drop your image here or click to browse"
            />

            {/* Display uploaded image info */}
            {advancedImage && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">Uploaded Image Info:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {advancedImage.file && (
                    <div className="space-y-2">
                      <p><strong>File Name:</strong> {advancedImage.file.name}</p>
                      <p><strong>File Size:</strong> {(advancedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>File Type:</strong> {advancedImage.file.type}</p>
                    </div>
                  )}
                  {advancedImage.url && (
                    <div className="space-y-2">
                      <p><strong>Source URL:</strong></p>
                      <p className="break-all text-blue-600">{advancedImage.url}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p><strong>Data URL Length:</strong> {advancedImage.dataUrl.length.toLocaleString()} characters</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simple Image Uploader */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Simple Image Uploader (Standalone)
            </h2>
            
            <SimpleImageUploader
              onImageUpload={setSimpleImage}
              maxSizeMB={5}
              acceptedFormats={['jpg', 'jpeg', 'png', 'gif']}
              placeholder="Drag and drop your image here"
            />

            {/* Display uploaded image info */}
            {simpleImage && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-900">Uploaded Image Info:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {simpleImage.file && (
                    <div className="space-y-2">
                      <p><strong>File Name:</strong> {simpleImage.file.name}</p>
                      <p><strong>File Size:</strong> {(simpleImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>File Type:</strong> {simpleImage.file.type}</p>
                    </div>
                  )}
                  {simpleImage.url && (
                    <div className="space-y-2">
                      <p><strong>Source URL:</strong></p>
                      <p className="break-all text-blue-600">{simpleImage.url}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p><strong>Data URL Length:</strong> {simpleImage.dataUrl.length.toLocaleString()} characters</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ Core Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Drag and drop support</li>
                <li>• Click to select files</li>
                <li>• URL input for remote images</li>
                <li>• Real-time image preview</li>
                <li>• File validation</li>
                <li>• Error handling</li>
                <li>• Loading states</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⚙️ Customizable</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• File size limits</li>
                <li>• Accepted file formats</li>
                <li>• Custom placeholder text</li>
                <li>• CSS classes</li>
                <li>• Upload callbacks</li>
                <li>• Modern UI styling</li>
                <li>• No external dependencies</li>
                <li>• TypeScript support</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Usage</h3>
            <pre className="text-sm text-blue-800 overflow-x-auto">
{`import { AdvancedImageUploader } from './advanced-image-uploader';
// or
import { SimpleImageUploader } from './simple-image-uploader';

<AdvancedImageUploader
  onImageUpload={(imageData) => {
    console.log('File:', imageData.file);
    console.log('URL:', imageData.url);
    console.log('Data URL:', imageData.dataUrl);
  }}
  maxSizeMB={5}
  acceptedFormats={['jpg', 'png', 'gif']}
  placeholder="Custom placeholder text"
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}