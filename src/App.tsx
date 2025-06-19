import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Upload, Zap, Download, Share2, Sparkles, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Meme {
  id: string;
  topText: string;
  bottomText: string;
  imageUrl: string;
  style: string;
  confidence: number;
  similar: string[];
}

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [style, setStyle] = useState('sarcastic');
  const [context, setContext] = useState('');
  const [showMeme, setShowMeme] = useState(false);
  const memeRef = useRef<HTMLDivElement>(null);

  const { data: meme, isLoading, refetch } = useQuery({
    queryKey: ['meme', imageUrl, style],
    queryFn: async (): Promise<Meme> => {
      const response = await fetch('https://super-duper-tribble-jj56v6qpg735496-8686.app.github.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GenerateMeme($input: MemeRequestInput!) {
              generateMeme(input: $input) {
                id topText bottomText imageUrl style confidence similar
              }
            }
          `,
          variables: {
            input: { imageUrl, style, context }
          }
        })
      });
      const result = await response.json();
      return result.data.generateMeme;
    },
    enabled: false
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const generateMeme = () => {
    if (imageUrl) {
      refetch().then(() => setShowMeme(true));
    }
  };

  const downloadMeme = async () => {
    if (memeRef.current) {
      const canvas = await html2canvas(memeRef.current);
      const link = document.createElement('a');
      link.download = `ai-meme-${meme?.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const shareToSocial = async () => {
    if (navigator.share && memeRef.current) {
      const canvas = await html2canvas(memeRef.current);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'ai-meme.png', { type: 'image/png' });
          await navigator.share({
            title: 'Check out my AI-generated meme!',
            files: [file]
          });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#130C49] via-[#BFB301] to-[#3E8001]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#BFB301] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#327C00] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            AI Meme Generator
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Upload any image → Get viral-worthy memes instantly ⚡
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Upload className="mr-3 h-6 w-6" />
                Upload Your Image
              </h2>

              <div className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-pink-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Uploaded" className="max-w-full h-48 object-contain mx-auto rounded-lg" />
                  ) : (
                    <>
                      <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-white">Click to upload an image</p>
                      <p className="text-gray-400 text-sm mt-2">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>

              {/* Style Selection */}
              <div className="mt-6">
                <label className="block text-white font-semibold mb-3">Meme Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'sarcastic', label: '😏 Sarcastic', color: 'from-orange-500 to-red-500' },
                    { value: 'wholesome', label: '🥰 Wholesome', color: 'from-green-500 to-teal-500' },
                    { value: 'dark', label: '😈 Dark Humor', color: 'from-gray-700 to-black' },
                    { value: 'dad_joke', label: '🤓 Dad Joke', color: 'from-blue-500 to-purple-500' }
                  ].map((styleOption) => (
                    <button
                      key={styleOption.value}
                      onClick={() => setStyle(styleOption.value)}
                      className={`p-3 rounded-xl font-semibold transition-all ${style === styleOption.value
                        ? `bg-gradient-to-r ${styleOption.color} text-white scale-105`
                        : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                    >
                      {styleOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Input */}
              <div className="mt-6">
                <label className="block text-white font-semibold mb-3">Context (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 'This is my Monday mood' or 'My cat being dramatic'"
                  className="w-full p-3 rounded-xl bg-[#FFFFFF] border border-white/30 text-[#130C49] placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/50"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateMeme}
                disabled={!imageUrl || isLoading}
                className="w-full mt-6 bg-[#130C49] text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin mr-3 h-5 w-5" />
                    AI is creating magic...
                  </>
                ) : (
                  <>
                    <Zap className="mr-3 h-5 w-5" />
                    Generate Meme
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            {showMeme && meme && (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Sparkles className="mr-3 h-6 w-6" />
                    Your AI Meme
                  </h2>
                  <div className="flex items-center bg-green-500/20 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-green-400 font-semibold">
                      {Math.round(meme.confidence * 100)}% Viral Potential
                    </span>
                  </div>
                </div>

                {/* Meme Display */}
                <div ref={memeRef} className="relative bg-black rounded-xl overflow-hidden">
                  <img src={meme.imageUrl} alt="Meme" className="w-full h-auto" />
                  <div className="absolute inset-0 flex flex-col justify-between p-4">
                    <div className="text-center">
                      <p className="text-white text-2xl font-bold uppercase tracking-wider text-stroke-black">
                        {meme.topText}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-2xl font-bold uppercase tracking-wider text-stroke-black">
                        {meme.bottomText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={downloadMeme}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={shareToSocial}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={generateMeme}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                {/* Similar Memes */}
                <div className="mt-6">
                  <p className="text-white font-semibold mb-3">Similar Viral Memes:</p>
                  <div className="flex flex-wrap gap-2">
                    {meme.similar.map((similar, index) => (
                      <span key={index} className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                        {similar}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;