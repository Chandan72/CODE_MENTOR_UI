"use client";

import { useState } from 'react';

export default function HomePage() {
  const [githubUrl, setGithubUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state to manage the open accordion section
  const [openSection, setOpenSection] = useState('summary');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setOpenSection('summary'); // Reset to summary view on new analysis

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-repo", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_url: githubUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "An unknown error occurred.");
      }

      const data = await response.json();
      setAnalysis(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper component for each accordion section to avoid repetition
  const AccordionSection = ({ title, sectionKey, children }) => (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpenSection(openSection === sectionKey ? null : sectionKey)}
        className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 focus:outline-none"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-cyan-400">{title}</h3>
          <span className={`transform transition-transform duration-300 ${openSection === sectionKey ? 'rotate-180' : 'rotate-0'}`}>
            ▼
          </span>
        </div>
      </button>
      {openSection === sectionKey && (
        <div className="p-4 bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-cyan-400">AI Code Mentor</h1>
          <p className="text-lg text-gray-400 mt-2">Get a complete, beginner-friendly explanation of any public GitHub repository.</p>
        </header>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="url"
              placeholder="https://github.com/user/repo"
              className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none disabled:opacity-50"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleAnalyze}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 disabled:bg-gray-600"
              disabled={isLoading || !githubUrl}
            >
              {isLoading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {/* --- DYNAMIC OUTPUT SECTION --- */}
        <div className="min-h-[10rem]">
          {isLoading && <p className="text-center text-cyan-400">Analyzing repository, this may take a moment...</p>}
          {error && <div className="bg-red-900 border border-red-700 text-red-300 p-4 rounded-md"><p className="font-bold">Error:</p><p>{error}</p></div>}
          
          {analysis && (
            <div className="space-y-4">
              <AccordionSection title="Project Summary" sectionKey="summary">
                <p className="text-gray-300 whitespace-pre-wrap">{analysis.project_summary}</p>
              </AccordionSection>

              <AccordionSection title="Key Libraries" sectionKey="libraries">
                <div className="space-y-4">
                  {analysis.libraries.map((lib, index) => (
                    <div key={index} className="border-b border-gray-700 pb-2">
                      <h4 className="font-bold text-cyan-500">{lib.name}</h4>
                      <p className="text-gray-400 text-sm">{lib.explanation}</p>
                    </div>
                  ))}
                </div>
              </AccordionSection>
              
              <AccordionSection title="Functions Analysis" sectionKey="functions">
                 <div className="space-y-4">
                  {analysis.functions.map((func, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded-md">
                      <h4 className="font-bold text-cyan-500 mb-1">{func.name}</h4>
                      <p className="text-sm"><strong className="text-gray-400">Purpose:</strong> {func.purpose}</p>
                      <p className="text-sm"><strong className="text-gray-400">Inputs:</strong> {func.inputs}</p>
                      <p className="text-sm"><strong className="text-gray-400">Outputs:</strong> {func.outputs}</p>
                    </div>
                  ))}
                </div>
              </AccordionSection>

              <AccordionSection title="Execution Steps" sectionKey="steps">
                <pre className="text-gray-300 bg-gray-900 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">{analysis.execution_steps}</pre>
              </AccordionSection>
            </div>
          )}
          
          {!isLoading && !error && !analysis && (
            <div className="text-center text-gray-500 bg-gray-800 p-10 rounded-lg">
                <p>Your full, interactive code explanation will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}