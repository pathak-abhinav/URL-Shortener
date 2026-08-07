import { useState } from "react";
import axios from "../api/axios"

const ShortenForm = ({ onSuccess }) => {
  const [url, setUrl] = useState("");
  const [shortened, setShortened] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/v1/shorten", { longUrl: url });
      setShortened(res.data.shortenedUrl);
      // Call the callback if provided (for dashboard refresh)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error shortening URL", err);
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shorten your URL</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-blue-600 font-semibold text-sm text-left">
          Your URL *
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your long URL here..."
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Shorten URL
        </button>
      </form>
      {shortened && (
        <p className="mt-6 text-center text-sm">
          Shortened URL:{" "}
          <a href={shortened} className="text-blue-500 underline">
            {shortened}
          </a>
        </p>
      )}
    </div>
  );
};

export default ShortenForm;
