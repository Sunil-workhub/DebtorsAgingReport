import React, { useState, useEffect } from "react";
import ComplaintTrackerServices from "../../services/ecom/ComplaintTrackerService";
import { Camera, X, ZoomIn } from "lucide-react";

const DocumentGalleryModal = ({ complaint, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showZoomModal, setShowZoomModal] = useState(false);

  useEffect(() => {
    if (complaint?.id) {
      fetchDocuments();
    }
  }, [complaint]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await ComplaintTrackerServices.getDocById(complaint.id);
      if (response?.data) {
        const imageData = response.data;
        const docs = [];

        // Process each image field from API response
        Object.entries(imageData).forEach(([key, value], index) => {
          if (value && value.trim()) {
            // Create a proper name from the key
            const name = key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            key !== "invoice_Document_Data" &&
              key !== "visit_Document_Data" &&
              docs.push({
                id: `img_${index}`,
                type: "image",
                name: name,
                key: key,
                data: value, // Base64 image data
                uploadDate:
                  complaint.complaintDate || new Date().toLocaleDateString(),
              });
          }
        });

        setDocuments(docs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert base64 to data URL for display
  const getImageDataUrl = (base64Data) => {
    // Add proper data URL prefix if not present
    if (base64Data.startsWith("data:image/")) {
      return base64Data;
    }
    // Assume JPEG if no format specified
    return `data:image/jpeg;base64,${base64Data}`;
  };

  const handleThumbnailClick = (doc) => {
    setSelectedImage(doc);
    setShowZoomModal(true);
  };

  const handleCloseZoom = () => {
    setShowZoomModal(false);
    setSelectedImage(null);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-purple-50">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Documents & Photographs
              </h3>
              <p className="text-sm text-gray-600">
                {complaint.complaintNo} - {complaint.customerName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading images...</span>
              </div>
            ) : documents.length > 0 ? (
              <>
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Image Gallery ({documents.length} images)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Click on any image to view in full size
                  </p>
                </div>

                {/* Thumbnail Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      onClick={() => handleThumbnailClick(doc)}
                    >
                      {/* Thumbnail Image */}
                      <img
                        src={getImageDataUrl(doc.data)}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTMwQzExNi41NjkgMTMwIDEzMCAxMTYuNTY5IDEzMCAxMDBDMTMwIDgzLjQzMTUgMTE2LjU2OSA3MCAxMDAgNzBDODMuNDMxNSA3MCA3MCA4My40MzE1IDcwIDEwMEM3MCAxMTYuNTY5IDgzLjQzMTUgMTMwIDEwMCAxMzBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNzAgNTBIMzBDMjIuMjY4NyA1MCAyMCA1Mi4yNjg3IDIwIDYwVjE0MEMyMCAxNDcuNzMxIDIyLjI2ODcgMTUwIDMwIDE1MEgxNzBDMTc3LjczMSAxNTAgMTgwIDE0Ny43MzEgMTgwIDE0MFY2MEMxODAgNTIuMjY4NyAxNzcuNzMxIDUwIDE3MCA1MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=";
                        }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-white rounded-full p-2 shadow-lg">
                            <ZoomIn size={20} className="text-gray-700" />
                          </div>
                        </div>
                      </div>

                      {/* Image Name */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-xs font-medium truncate">
                          {doc.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Camera size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">
                  No images available
                </p>
                <p className="text-gray-400 text-sm">
                  No photographs have been uploaded for this complaint
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {showZoomModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-60 p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={handleCloseZoom}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
            >
              <X size={24} />
            </button>

            {/* Image Container */}
            <div className="relative max-w-full max-h-full">
              <img
                src={getImageDataUrl(selectedImage.data)}
                alt={selectedImage.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  console.error("Error loading zoomed image");
                }}
              />

              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
                <h4 className="font-medium text-lg">{selectedImage.name}</h4>
                <p className="text-sm text-gray-300">
                  Uploaded: {selectedImage.uploadDate}
                </p>
              </div>
            </div>

            {/* Navigation Arrows (if you want to add next/prev functionality) */}
            {documents.length > 1 && (
              <>
                <button
                  onClick={() => {
                    const currentIndex = documents.findIndex(
                      (doc) => doc.id === selectedImage.id,
                    );
                    const prevIndex =
                      currentIndex > 0
                        ? currentIndex - 1
                        : documents.length - 1;
                    setSelectedImage(documents[prevIndex]);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    const currentIndex = documents.findIndex(
                      (doc) => doc.id === selectedImage.id,
                    );
                    const nextIndex =
                      currentIndex < documents.length - 1
                        ? currentIndex + 1
                        : 0;
                    setSelectedImage(documents[nextIndex]);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentGalleryModal;
