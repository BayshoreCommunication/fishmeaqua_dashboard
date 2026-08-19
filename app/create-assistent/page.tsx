"use client";
import { useEffect, useState } from "react";

type Assistant = {
  _id: string;
  openaiId: string;
  name: string;
  instructions: string;
  tools: any[];
  model: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
};

type TrainingSession = {
  id: string;
  websiteUrl: string;
  scrapingMethod: "sitemap" | "recursive_crawl";
  totalUrlsFound: number;
  successfulScrapes: number;
  failedScrapes: number;
  pagesScraped: number;
  duration: string;
  startTime: string;
  endTime: string;
  fileId?: string;
  sitemapUrls?: number;
  status: "completed" | "failed";
  error?: string;
};

type TrainingSummary = {
  totalSessions: number;
  successfulSessions: number;
  failedSessions: number;
  totalPagesScraped: number;
  totalUrlsFound: number;
  websitesTrained: number;
  lastTraining: TrainingSession | null;
};

export default function AssistantManagement() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null
  );
  const [view, setView] = useState<
    "list" | "create" | "edit" | "details" | "train" | "history"
  >("list");

  // Training states
  const [trainingHistory, setTrainingHistory] = useState<TrainingSession[]>([]);
  const [trainingSummary, setTrainingSummary] =
    useState<TrainingSummary | null>(null);

  // Form states (model is fixed to gpt-4o-mini in backend)
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    tools: [] as any[],
  });

  // Training states
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<{
    currentPage: number;
    totalPages: number;
    currentUrl: string;
    scrapedPages: Array<{
      url: string;
      title: string;
      status: "pending" | "scraping" | "completed" | "failed";
    }>;
  } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch all assistants
  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/assistant`);
      const data = await res.json();
      if (data.success) {
        setAssistants(data.assistants);
      }
    } catch (error) {
      console.error("Error fetching assistants:", error);
      alert("Failed to fetch assistants");
    } finally {
      setLoading(false);
    }
  };

  // Fetch training history
  const fetchTrainingHistory = async (assistantId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/api/assistant/${assistantId}/training-history`
      );
      const data = await res.json();
      if (data.success) {
        setTrainingHistory(data.trainingHistory);
        setTrainingSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching training history:", error);
      alert("Failed to fetch training history");
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  // Create assistant
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Assistant created successfully!");
        setFormData({ name: "", instructions: "", tools: [] });
        setView("list");
        fetchAssistants();
      } else {
        alert("Failed to create assistant");
      }
    } catch (error) {
      console.error("Error creating assistant:", error);
      alert("Error creating assistant");
    }
  };

  // Update assistant
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssistant) return;

    try {
      const res = await fetch(
        `${API_URL}/api/assistant/${selectedAssistant._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Assistant updated successfully!");
        setView("list");
        fetchAssistants();
      } else {
        alert("Failed to update assistant");
      }
    } catch (error) {
      console.error("Error updating assistant:", error);
      alert("Error updating assistant");
    }
  };

  // Delete assistant
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assistant?")) return;

    try {
      const res = await fetch(`${API_URL}/api/assistant/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Assistant deleted successfully!");
        fetchAssistants();
      } else {
        alert("Failed to delete assistant");
      }
    } catch (error) {
      console.error("Error deleting assistant:", error);
      alert("Error deleting assistant");
    }
  };

  // View History
  const handleViewHistory = async (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    await fetchTrainingHistory(assistant._id);
    setView("history");
  };

  // View Details
  const handleViewDetails = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setView("details");
  };

  // Edit
  const handleEdit = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setFormData({
      name: assistant.name,
      instructions: assistant.instructions,
      tools: assistant.tools,
    });
    setView("edit");
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "", instructions: "", tools: [] });
    setSelectedAssistant(null);
    setWebsiteUrl("");
    setView("list");
  };

  // Train from website
  const handleTrainFromWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssistant || !websiteUrl) return;

    setTraining(true);

    // Initialize demo progress
    setTrainingProgress({
      currentPage: 0,
      totalPages: 0,
      currentUrl: websiteUrl,
      scrapedPages: [],
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (!prev) return prev;
          const newPage = prev.currentPage + 1;
          const demoUrls = [
            `${websiteUrl}/`,
            `${websiteUrl}/about`,
            `${websiteUrl}/services`,
            `${websiteUrl}/contact`,
            `${websiteUrl}/blog`,
            `${websiteUrl}/products`,
            `${websiteUrl}/faq`,
            `${websiteUrl}/pricing`,
          ];

          const newScrapedPages = [...prev.scrapedPages];
          if (newPage <= demoUrls.length) {
            newScrapedPages.push({
              url: demoUrls[newPage - 1],
              title: demoUrls[newPage - 1].split("/").pop() || "Home",
              status: "completed" as const,
            });
          }

          return {
            ...prev,
            currentPage: newPage,
            totalPages: Math.max(prev.totalPages, newPage),
            currentUrl: demoUrls[Math.min(newPage - 1, demoUrls.length - 1)],
            scrapedPages: newScrapedPages,
          };
        });
      }, 1000);

      const res = await fetch(
        `${API_URL}/api/assistant/${selectedAssistant._id}/train-website`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ websiteUrl }),
        }
      );

      clearInterval(progressInterval);

      const data = await res.json();
      if (data.success) {
        alert(
          `Success! Trained with ${data.pagesScraped} pages from ${websiteUrl}`
        );
        setWebsiteUrl("");
        setTrainingProgress(null);
        setView("details");
        fetchAssistants();
      } else {
        alert(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error training from website:", error);
      alert("Error training from website");
    } finally {
      setTraining(false);
      setTrainingProgress(null);
    }
  };

  // Open train view
  const handleOpenTrain = (assistant: Assistant) => {
    setSelectedAssistant(assistant);
    setView("train");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Assistant Management
      </h1>

      {/* Navigation buttons */}
      {view !== "list" && (
        <button
          onClick={resetForm}
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Back to List
        </button>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "600" }}>
              All Assistants
            </h2>
            <button
              onClick={() => setView("create")}
              style={{
                padding: "12px 24px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              + Create New Assistant
            </button>
          </div>

          {loading ? (
            <p>Loading assistants...</p>
          ) : assistants.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "2px dashed #d1d5db",
              }}
            >
              <p style={{ fontSize: "18px", color: "#6b7280" }}>
                No assistants found. Create your first assistant!
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {assistants.map((assistant) => (
                <div
                  key={assistant._id}
                  style={{
                    padding: "20px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    background: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          marginBottom: "8px",
                        }}
                      >
                        {assistant.name}
                      </h3>
                      <p
                        style={{
                          color: "#6b7280",
                          marginBottom: "8px",
                          fontSize: "14px",
                        }}
                      >
                        Model: {assistant.model}
                      </p>
                      <p style={{ color: "#374151", fontSize: "14px" }}>
                        {assistant.instructions.substring(0, 100)}
                        {assistant.instructions.length > 100 ? "..." : ""}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginLeft: "20px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => handleViewDetails(assistant)}
                        style={{
                          padding: "8px 16px",
                          background: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleOpenTrain(assistant)}
                        style={{
                          padding: "8px 16px",
                          background: "#8b5cf6",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Train
                      </button>
                      <button
                        onClick={() => handleViewHistory(assistant)}
                        style={{
                          padding: "8px 16px",
                          background: "#06b6d4",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleEdit(assistant)}
                        style={{
                          padding: "8px 16px",
                          background: "#f59e0b",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(assistant._id)}
                        style={{
                          padding: "8px 16px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE/EDIT FORM */}
      {(view === "create" || view === "edit") && (
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            {view === "create" ? "Create New Assistant" : "Edit Assistant"}
          </h2>
          <form
            onSubmit={view === "create" ? handleCreate : handleUpdate}
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Assistant Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Customer Support Assistant"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "16px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Instructions *
              </label>
              <textarea
                required
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                placeholder="Enter detailed instructions for the assistant..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "16px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 32px",
                  background: "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {view === "create" ? "Create Assistant" : "Update Assistant"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "12px 32px",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAILS VIEW */}
      {view === "details" && selectedAssistant && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "600" }}>
              Assistant Details
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleEdit(selectedAssistant)}
                style={{
                  padding: "10px 20px",
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedAssistant._id)}
                style={{
                  padding: "10px 20px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Delete
              </button>
            </div>
          </div>

          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                ASSISTANT NAME
              </h3>
              <p style={{ fontSize: "18px", fontWeight: "600" }}>
                {selectedAssistant.name}
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                MODEL
              </h3>
              <p style={{ fontSize: "16px" }}>gpt-4o-mini (locked for cost optimization)</p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                OPENAI ID
              </h3>
              <p
                style={{
                  fontSize: "16px",
                  fontFamily: "monospace",
                  background: "#f3f4f6",
                  padding: "8px",
                  borderRadius: "4px",
                }}
              >
                {selectedAssistant.openaiId}
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                INSTRUCTIONS
              </h3>
              <p
                style={{
                  fontSize: "16px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                }}
              >
                {selectedAssistant.instructions}
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                TOOLS
              </h3>
              <p style={{ fontSize: "16px" }}>
                {selectedAssistant.tools.length === 0
                  ? "No tools configured"
                  : JSON.stringify(selectedAssistant.tools, null, 2)}
              </p>
            </div>

            <div style={{ display: "flex", gap: "40px" }}>
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  CREATED AT
                </h3>
                <p style={{ fontSize: "16px" }}>
                  {new Date(selectedAssistant.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  UPDATED AT
                </h3>
                <p style={{ fontSize: "16px" }}>
                  {new Date(selectedAssistant.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRAIN FROM WEBSITE VIEW */}
      {view === "train" && selectedAssistant && (
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "20px",
            }}
          >
            Train Assistant from Website
          </h2>
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                marginBottom: "20px",
                padding: "16px",
                background: "#eff6ff",
                borderRadius: "8px",
                border: "1px solid #bfdbfe",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#1e40af",
                }}
              >
                Training: {selectedAssistant.name}
              </h3>
              <p style={{ fontSize: "14px", color: "#1e3a8a" }}>
                Enter a website URL to scrape and train your assistant with the
                content. The assistant will learn from all pages on the website.
              </p>
            </div>

            <form onSubmit={handleTrainFromWebsite}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "16px",
                  }}
                  disabled={training}
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  Enter the homepage URL of the website you want to train from
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  disabled={training || !websiteUrl}
                  style={{
                    padding: "12px 32px",
                    background: training || !websiteUrl ? "#9ca3af" : "#8b5cf6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: training || !websiteUrl ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {training ? "Training..." : "Start Training"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={training}
                  style={{
                    padding: "12px 32px",
                    background: "#e5e7eb",
                    color: "#374151",
                    border: "none",
                    borderRadius: "6px",
                    cursor: training ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* TRAINING PROGRESS DISPLAY */}
            {training && trainingProgress && (
              <div
                style={{
                  marginTop: "30px",
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    color: "#1e293b",
                  }}
                >
                  Training Progress
                </h4>

                {/* Progress Bar */}
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#64748b" }}>
                      Scraping Pages
                    </span>
                    <span style={{ fontSize: "14px", color: "#64748b" }}>
                      {trainingProgress.currentPage} /{" "}
                      {trainingProgress.totalPages || "..."}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#e2e8f0",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "#3b82f6",
                        borderRadius: "4px",
                        width:
                          trainingProgress.totalPages > 0
                            ? `${
                                (trainingProgress.currentPage /
                                  trainingProgress.totalPages) *
                                100
                              }%`
                            : "30%",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Current URL */}
                <div style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "14px", color: "#64748b" }}>
                    Currently scraping:
                  </span>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#1e293b",
                      fontWeight: "500",
                      marginTop: "4px",
                      wordBreak: "break-all",
                    }}
                  >
                    {trainingProgress.currentUrl}
                  </div>
                </div>

                {/* Scraped Pages List */}
                {trainingProgress.scrapedPages.length > 0 && (
                  <div>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#64748b",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Completed pages ({trainingProgress.scrapedPages.length}):
                    </span>
                    <div
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #e2e8f0",
                        borderRadius: "4px",
                        background: "white",
                      }}
                    >
                      {trainingProgress.scrapedPages.map((page, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "8px 12px",
                            borderBottom:
                              index < trainingProgress.scrapedPages.length - 1
                                ? "1px solid #f1f5f9"
                                : "none",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#1e293b",
                                marginBottom: "2px",
                              }}
                            >
                              {page.title}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                wordBreak: "break-all",
                              }}
                            >
                              {page.url}
                            </div>
                          </div>
                          <div
                            style={{
                              marginLeft: "12px",
                              padding: "2px 8px",
                              background: "#dcfce7",
                              color: "#166534",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "500",
                            }}
                          >
                            ✓ {page.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                marginTop: "30px",
                padding: "16px",
                background: "#fef3c7",
                borderRadius: "8px",
                border: "1px solid #fde047",
              }}
            >
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#78350f",
                }}
              >
                How it works:
              </h4>
              <ul
                style={{
                  fontSize: "14px",
                  color: "#78350f",
                  marginLeft: "20px",
                }}
              >
                <li>
                  The website will be scraped and all text content extracted
                </li>
                <li>
                  Content is stored in OpenAI's vector store for semantic search
                </li>
                <li>
                  Your assistant will be able to answer questions about the
                  website content
                </li>
                <li>
                  The 'file_search' tool will be automatically enabled for your
                  assistant
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {view === "history" && selectedAssistant && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "600" }}>
              Training History - {selectedAssistant.name}
            </h2>
          </div>

          {/* Summary Stats */}
          {trainingSummary && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  background: "#f0f9ff",
                  borderRadius: "8px",
                  border: "1px solid #0ea5e9",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0c4a6e",
                    marginBottom: "8px",
                  }}
                >
                  TOTAL SESSIONS
                </h3>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#0c4a6e",
                  }}
                >
                  {trainingSummary.totalSessions}
                </p>
              </div>
              <div
                style={{
                  padding: "20px",
                  background: "#dcfce7",
                  borderRadius: "8px",
                  border: "1px solid #16a34a",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#14532d",
                    marginBottom: "8px",
                  }}
                >
                  SUCCESSFUL
                </h3>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#14532d",
                  }}
                >
                  {trainingSummary.successfulSessions}
                </p>
              </div>
              <div
                style={{
                  padding: "20px",
                  background: "#fef2f2",
                  borderRadius: "8px",
                  border: "1px solid #dc2626",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#7f1d1d",
                    marginBottom: "8px",
                  }}
                >
                  FAILED
                </h3>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#7f1d1d",
                  }}
                >
                  {trainingSummary.failedSessions}
                </p>
              </div>
              <div
                style={{
                  padding: "20px",
                  background: "#fef3c7",
                  borderRadius: "8px",
                  border: "1px solid #d97706",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#78350f",
                    marginBottom: "8px",
                  }}
                >
                  PAGES SCRAPED
                </h3>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#78350f",
                  }}
                >
                  {trainingSummary.totalPagesScraped}
                </p>
              </div>
              <div
                style={{
                  padding: "20px",
                  background: "#f3e8ff",
                  borderRadius: "8px",
                  border: "1px solid #9333ea",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#581c87",
                    marginBottom: "8px",
                  }}
                >
                  WEBSITES TRAINED
                </h3>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#581c87",
                  }}
                >
                  {trainingSummary.websitesTrained}
                </p>
              </div>
            </div>
          )}

          {/* Training Sessions List */}
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
                Training Sessions
              </h3>
            </div>

            {trainingHistory.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                <p>
                  No training sessions found. Train your assistant with a
                  website to see history here.
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {trainingHistory.map((session) => (
                  <div
                    key={session.id}
                    style={{
                      padding: "20px",
                      borderBottom: "1px solid #f3f4f6",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <h4 style={{ fontSize: "16px", fontWeight: "600" }}>
                          {session.websiteUrl}
                        </h4>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              session.status === "completed"
                                ? "#dcfce7"
                                : "#fef2f2",
                            color:
                              session.status === "completed"
                                ? "#166534"
                                : "#991b1b",
                          }}
                        >
                          {session.status.toUpperCase()}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "16px",
                          marginBottom: "8px",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              fontWeight: "500",
                            }}
                          >
                            METHOD
                          </span>
                          <p style={{ fontSize: "14px", fontWeight: "600" }}>
                            {session.scrapingMethod
                              .replace("_", " ")
                              .toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              fontWeight: "500",
                            }}
                          >
                            PAGES FOUND
                          </span>
                          <p style={{ fontSize: "14px", fontWeight: "600" }}>
                            {session.totalUrlsFound}
                          </p>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              fontWeight: "500",
                            }}
                          >
                            SCRAPED
                          </span>
                          <p style={{ fontSize: "14px", fontWeight: "600" }}>
                            {session.successfulScrapes}
                          </p>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              fontWeight: "500",
                            }}
                          >
                            DURATION
                          </span>
                          <p style={{ fontSize: "14px", fontWeight: "600" }}>
                            {session.duration}
                          </p>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              fontWeight: "500",
                            }}
                          >
                            STARTED
                          </span>
                          <p style={{ fontSize: "14px", fontWeight: "600" }}>
                            {new Date(session.startTime).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {session.error && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "8px",
                            background: "#fef2f2",
                            borderRadius: "4px",
                            border: "1px solid #fecaca",
                          }}
                        >
                          <p style={{ fontSize: "12px", color: "#991b1b" }}>
                            <strong>Error:</strong> {session.error}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
