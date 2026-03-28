import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg'];

export default function IdCardUpload({ value, onChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const processFile = (file) => {
    setError('');

    if (!ACCEPTED.includes(file.type)) {
      setError('Only PNG and JPG files are accepted.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('File size must be less than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange(null);
    setError('');
  };

  // Preview mode
  if (value) {
    return (
      <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
        <img
          src={value}
          alt="ID Card Preview"
          className="w-full max-h-64 object-contain p-2"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Upload zone
  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          dragOver
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
        }`}
      >
        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <Upload className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Drop your ID card here, or{' '}
            <span className="text-emerald-600">browse</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">PNG or JPG, max 5 MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
          <Image className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
