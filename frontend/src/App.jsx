import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

import {
  Activity,
  AlertTriangle,
  Bot,
  Box,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Server,
  Sparkles,
} from "lucide-react";

import "./App.css";

const API_BASE = "";

function App() {
  const [pods, setPods] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [error, setError] = useState("");

  const loadClusterData = async () => {
    try {
      setLoading(true);
      setError("");

      const [podsResponse, issuesResponse] = await Promise.all([
        fetch(`${API_BASE}/api/cluster/pods`),
        fetch(`${API_BASE}/api/cluster/issues`),
      ]);

      if (!podsResponse.ok || !issuesResponse.ok) {
        throw new Error("Unable to retrieve Kubernetes cluster data.");
      }

      const podsData = await podsResponse.json();
      const issuesData = await issuesResponse.json();

      setPods(podsData.pods || []);
      setIssues(issuesData.issues || []);
    } catch {
      setError(
        "Unable to connect to the Kubernetes backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusterData();
  }, []);

  const diagnosePod = async (issue) => {
    try {
      setDiagnosing(true);
      setDiagnosis("");
      setError("");

      const response = await fetch(
        `${API_BASE}/api/cluster/diagnose/${encodeURIComponent(
          issue.namespace
        )}/${encodeURIComponent(issue.name)}`
      );

      if (!response.ok) {
        throw new Error("AI diagnosis failed.");
      }

      const data = await response.json();

      setDiagnosis(
        data.ai_diagnosis ||
          data.diagnosis ||
          "No diagnosis was returned by the AI engine."
      );
    } catch {
      setError("The AI diagnosis could not be completed.");
    } finally {
      setDiagnosing(false);
    }
  };

  const healthyPods = pods.filter((pod) => {
    const containers = pod.containers || [];

    return (
      pod.phase === "Running" &&
      containers.length > 0 &&
      containers.every((container) => container.ready)
    );
  }).length;

  const primaryIssue = issues[0];

  return (
    <div className="app-shell">
      <div className="background-grid" />
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <main className="dashboard">
        <motion.header
          className="topbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="brand">
            <div className="brand-icon">
              <BrainCircuit size={27} />
            </div>

            <div>
              <p className="eyebrow">INTELLIGENT CLOUD OPERATIONS</p>
              <h1>AI Kubernetes DevOps Agent</h1>
              <p className="subtitle">
                Autonomous cluster investigation powered by Kubernetes
                telemetry and AI.
              </p>
            </div>
          </div>

          <div className="status-pill">
            <span className="status-dot" />
            Cluster Connected
          </div>
        </motion.header>

        <motion.section
          className="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div>
            <div className="hero-badge">
              <Sparkles size={15} />
              AI-POWERED TROUBLESHOOTING
            </div>

            <h2>
              Understand cluster failures
              <span> before they become incidents.</span>
            </h2>

            <p>
              Detect unhealthy Kubernetes workloads, collect runtime evidence,
              and generate actionable AI-assisted remediation guidance.
            </p>
          </div>

          <div className="engine-card">
            <div className="engine-ring">
              <Bot size={38} />
            </div>

            <div>
              <span>AI ENGINE</span>
              <strong>ONLINE</strong>
            </div>
          </div>
        </motion.section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">REAL-TIME TELEMETRY</p>
              <h3>Cluster Overview</h3>
            </div>

            <button className="refresh-button" onClick={loadClusterData}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="metrics-grid">
            <MetricCard
              icon={<Box />}
              label="Total Pods"
              value={loading ? "—" : pods.length}
              description="Across all namespaces"
              delay={0.1}
            />

            <MetricCard
              icon={<CheckCircle2 />}
              label="Healthy"
              value={loading ? "—" : healthyPods}
              description="Ready workloads"
              delay={0.2}
            />

            <MetricCard
              icon={<AlertTriangle />}
              label="Issues"
              value={loading ? "—" : issues.length}
              description="Require investigation"
              warning={issues.length > 0}
              delay={0.3}
            />

            <MetricCard
              icon={<Cpu />}
              label="AI Engine"
              value="Online"
              description="Diagnosis available"
              delay={0.4}
            />
          </div>
        </section>

        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertTriangle size={18} />
            {error}
          </motion.div>
        )}

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WORKLOAD INTELLIGENCE</p>
              <h3>Detected Issues</h3>
            </div>

            <div className="live-label">
              <Activity size={15} />
              LIVE
            </div>
          </div>

          {loading ? (
            <div className="loading-card">
              <div className="scanner" />
              <p>Scanning Kubernetes workloads...</p>
            </div>
          ) : primaryIssue ? (
            <motion.div
              className="issue-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="issue-top">
                <div className="issue-identity">
                  <div className="warning-icon">
                    <AlertTriangle size={22} />
                  </div>

                  <div>
                    <span className="namespace">
                      {primaryIssue.namespace}
                    </span>

                    <h4>{primaryIssue.name}</h4>
                  </div>
                </div>

                <span className="critical-badge">
                  {primaryIssue.problems?.[0]?.reason || "UNHEALTHY"}
                </span>
              </div>

              <div className="issue-details">
                <Detail
                  label="Container"
                  value={primaryIssue.problems?.[0]?.container || "Unknown"}
                />

                <Detail
                  label="State"
                  value={
                    primaryIssue.problems?.[0]?.state || primaryIssue.phase
                  }
                />

                <Detail
                  label="Restarts"
                  value={primaryIssue.problems?.[0]?.restart_count ?? 0}
                />

                <Detail label="Pod Phase" value={primaryIssue.phase} />
              </div>

              <div className="issue-footer">
                <div className="signal">
                  <Server size={16} />
                  Kubernetes runtime evidence available
                </div>

                <button
                  className="diagnose-button"
                  disabled={diagnosing}
                  onClick={() => diagnosePod(primaryIssue)}
                >
                  {diagnosing ? (
                    <>
                      <RefreshCw className="spin" size={18} />
                      AI is investigating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Diagnose with AI
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="healthy-state">
              <CheckCircle2 size={34} />

              <div>
                <h4>No workload issues detected</h4>
                <p>Your Kubernetes workloads currently appear healthy.</p>
              </div>
            </div>
          )}
        </section>

        {(diagnosing || diagnosis) && (
          <motion.section
            className="section diagnosis-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">AI INCIDENT INTELLIGENCE</p>
                <h3>AI Diagnosis</h3>
              </div>

              <div className="ai-chip">
                <BrainCircuit size={15} />
                LLM ANALYSIS
              </div>
            </div>

            <div className="diagnosis-card">
              {diagnosing ? (
                <div className="ai-loading">
                  <div className="ai-orbit">
                    <BrainCircuit size={32} />
                  </div>

                  <h4>Investigating workload</h4>

                  <p>
                    Correlating container state, restart history, Kubernetes
                    events, and application logs...
                  </p>

                  <div className="analysis-progress">
                    <span />
                  </div>
                </div>
              ) : (
                <motion.div
                  className="diagnosis-content"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <div className="diagnosis-header">
                    <div className="diagnosis-icon">
                      <Sparkles size={22} />
                    </div>

                    <div>
                      <span className="diagnosis-label">
                        AI INCIDENT REPORT
                      </span>

                      <h4>Intelligent Workload Analysis</h4>
                    </div>

                    <span className="analysis-complete">
                      <CheckCircle2 size={14} />
                      ANALYSIS COMPLETE
                    </span>
                  </div>

                  <div className="diagnosis-divider" />

                  <div className="markdown-diagnosis">
                    <ReactMarkdown>{diagnosis}</ReactMarkdown>
                  </div>

                  <div className="diagnosis-footer">
                    <BrainCircuit size={15} />

                    <span>
                      Generated from Kubernetes pod state, events and container
                      logs.
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        <footer>
          <span>AI Kubernetes DevOps Agent</span>
          <span>FastAPI • Kubernetes • React • AI</span>
        </footer>
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
  warning = false,
  delay,
}) {
  return (
    <motion.div
      className={`metric-card ${warning ? "metric-warning" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
    >
      <div className="metric-icon">{icon}</div>

      <div className="metric-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
