"use client";

import { useState, useEffect } from "react";

interface ImageGeneratorProps {
  generateImage: (
    text: string
  ) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
}

export default function ImageGenerator({ generateImage }: ImageGeneratorProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [isLoadingSavedImages, setIsLoadingSavedImages] = useState(true);

  // Fetch saved images on component mount
  useEffect(() => {
    const fetchSavedImages = async () => {
      try {
        const response = await fetch("/api/generate-image", {
          method: "GET",
        });
        const data = await response.json();

        if (data.success) {
          setSavedImages(data.imageUrls || []);
        } else {
          throw new Error(data.error || "Failed to load saved images.");
        }
      } catch (err) {
        console.error("Error fetching saved images:", err);
        setError("Could not load saved images.");
      } finally {
        setIsLoadingSavedImages(false);
      }
    };

    fetchSavedImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setImageUrl(null);
    setError(null);

    try {
      const result = await generateImage(inputText);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate image");
      }

      if (result.imageUrl) {
        setImageUrl(result.imageUrl);

        // Optionally, add the generated image to saved images
        setSavedImages(prev => [result.imageUrl!, ...prev]);
      } else {
        throw new Error("No image URL received");
      }

      setInputText("");
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center p-8">
      {/* Header Section */}
      <header className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-extrabold tracking-widest text-white">
          AI Image Generator
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-lg mx-auto">
          Create stunning visuals with AI. Enter a prompt to begin your journey.
        </p>
      </header>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl p-6 shadow-lg animate-fade-in"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 p-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            placeholder="Enter a creative prompt..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>
        {error && (
          <p className="text-center text-red-400 text-sm mt-4 animate-fade-in">
            {error}
          </p>
        )}
      </form>

      {/* Display Generated Image */}
      {imageUrl && (
        <div className="mt-12 w-full max-w-3xl bg-gray-800 p-6 rounded-xl shadow-2xl animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Your Generated Image:
          </h2>
          <div className="rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Generated artwork"
              className="w-full h-auto hover:scale-105 transition-transform"
            />
          </div>
          <div className="mt-4 text-center">
            <a
              href={imageUrl}
              download="generated-image.jpg"
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform"
            >
              Save Image
            </a>
          </div>
        </div>
      )}

      {/* Saved Images Section */}
      <div className="mt-16 w-full max-w-5xl">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Saved Images
        </h2>
        {isLoadingSavedImages ? (
          <p className="text-center text-gray-300">Loading saved images...</p>
        ) : savedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedImages.map((url, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden shadow-lg bg-gray-800"
              >
                <img
                  src={url}
                  alt={`Saved image ${index + 1}`}
                  className="w-full h-auto hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No saved images found.</p>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-gray-400 text-center text-sm">
        Powered by AI Technology. Bringing imagination to life.
      </footer>
    </div>
  );
}
