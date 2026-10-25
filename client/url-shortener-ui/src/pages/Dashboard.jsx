import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import ShortenForm from "../components/ShortenForm"; // Import the existing component

const PAGE_SIZE = 10;

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchUrls = async () => {
    try {
      const res = await axios.get("/v1/user/urls", { params: { page, limit: PAGE_SIZE } });
      setUrls(res.data?.result || []);
      setTotal(res.data?.pagination?.total ?? 0);
      setTotalPages(Math.max(1, res.data?.pagination?.totalPages ?? 1));
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [page]);

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint to clear cookies
      await axios.post("/v1/logout");
      // Redirect to home page
      navigate("/");
    } catch (err) {
      console.error("Logout error", err);
      // Even if logout fails, redirect to home
      navigate("/");
    }
  };

  // Callback function to refresh URLs after successful shortening
  const onUrlShortened = () => {
    // newest URLs are listed first, so jump back to page 1
    if (page !== 1) setPage(1);
    else fetchUrls();
  };

  const handleDelete = async (urlId) => {
    if (!window.confirm("Are you sure you want to delete this URL?")) {
      return;
    }

    try {
      await axios.delete(`/v1/urls/${urlId}`);
      // Step back a page if the last item on this page was deleted
      if (urls.length === 1 && page > 1) setPage(page - 1);
      else fetchUrls();
    } catch (err) {
      console.error("Delete error", err);
      alert("Error deleting URL. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Shorten Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Shorten a New URL</h2>
              <p className="text-gray-600">Create a shortened link for your long URL</p>
            </div>
            <ShortenForm onSuccess={onUrlShortened} />
          </div>

          {/* Right Column - URLs List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your URLs</h2>
              <p className="text-gray-600">
                {loading ? "Loading..." : `${total} URL${total !== 1 ? 's' : ''} created`}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {urls.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔗</div>
                    <p className="text-gray-600 text-lg">No URLs yet</p>
                    <p className="text-gray-500 text-sm">Create your first shortened URL using the form on the left!</p>
                  </div>
                ) : (
                  urls.map((url) => (
                    <div
                      key={url._id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-3">
                        {/* Shortened URL */}
                        <div className="flex items-center justify-between">
                          <a
                            href={`${window.location.origin}/${url.shortId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 font-semibold hover:underline text-lg"
                          >
                            {window.location.origin}/{url.shortId}
                          </a>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${url.shortId}`)}
                              className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors text-sm"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => handleDelete(url._id)}
                              className="bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Original URL */}
                        <div className="bg-gray-50 rounded-md p-3">
                          <p className="text-sm text-gray-600 font-medium mb-1">Original URL:</p>
                          <p className="text-sm text-gray-800 break-all">{url.longUrl}</p>
                        </div>

                        {/* Created Date */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                          <span>ID: {url.shortId}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}