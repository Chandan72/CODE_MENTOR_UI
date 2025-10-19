"use client";
import MermaidDiagram from '@/components/MermaidDiagram'; // For our custom Mermaid component
import { useState } from 'react';

// This is the re-usable component for our accordion sections
const AccordionSection = ({ title, sectionKey, openSection, setOpenSection, children }) => (
  <div className="border border-gray-700 rounded-lg overflow-hidden">
    <button
      onClick={() => setOpenSection(openSection === sectionKey ? null : sectionKey)}
      className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 focus:outline-none"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-cyan-400">{title}</h3>
        <span className={`transform transition-transform duration-300 ${openSection === sectionKey ? 'rotate-180' : 'rotate-0'}`}>▼</span>
      </div>
    </button>
    {openSection === sectionKey && (
      <div className="p-4 bg-gray-900">{children}</div>
    )}
  </div>
);

// This is our main page component
export default function HomePage() {
  // --- STATE MANAGEMENT ---
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSection, setOpenSection] = useState('summary');
  
  // State for the different input modes
  const [mode, setMode] = useState('repo'); // 'repo', 'snippet', or 'zip'
  const [githubUrl, setGithubUrl] = useState("");
  const [codeInput, setCodeInput] = useState("def hello_world():\n  print('Hello, AI Mentor!')");
  const [zipFile, setZipFile] = useState(null); // State for the .zip file

  // --- API CALL LOGIC ---
  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setOpenSection('summary');

    let endpoint = '';
    let payload = null;
    let headers = {}; // We'll set headers dynamically

    // Configure the request based on the current mode
    if (mode === 'repo') {
      endpoint = '/analyze-repo';
      payload = JSON.stringify({ github_url: githubUrl });
      headers['Content-Type'] = 'application/json';
    } else if (mode === 'snippet') {
      endpoint = '/analyze-code';
      payload = JSON.stringify({ code: codeInput });
      headers['Content-Type'] = 'application/json';
    } else if (mode === 'zip') {
      if (!zipFile) {
        setError("Please select a .zip file to analyze.");
        setIsLoading(false);
        return;
      }
      endpoint = '/analyze-zip';
      payload = new FormData();
      payload.append('file', zipFile);
      // NOTE: We do NOT set Content-Type for FormData.
      // The browser will automatically set it to 'multipart/form-data'
      // along with the necessary boundaries.
    } else {
      setError("Invalid mode selected.");
      setIsLoading(false);
      return;
    }

    // Perform the fetch request
    try {
      const response = await fetch(`https://ai-code-mentor-api.onrender.com${endpoint}`, {
        method: 'POST',
        headers: headers, // Pass the dynamically set headers
        body: payload,      // Pass the dynamic payload (JSON string or FormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "An unknown error occurred.");
      }

      const data = await response.json();
      setAnalysis(data); // Save the successful analysis

    } catch (err) {
      setError(err.message); // Save any errors
    } finally {
      setIsLoading(false); // Stop loading in all cases
    }
  };

  // --- UI RENDERING ---
  return (
    <main className="bg-gray-900 text-white min-h-screen p-8 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-cyan-400">AI Code Mentor</h1>
          <p className="text-lg text-gray-400 mt-2">Get a complete, beginner-friendly explanation of your code.</p>
        </header>

        {/* --- TABS and INPUT SECTION --- */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-10">
          {/* Tab Buttons */}
          <div className="flex border-b border-gray-700 mb-4">
            <button onClick={() => setMode('repo')} className={`py-2 px-4 font-semibold ${mode === 'repo' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>
              Analyze GitHub Repo
            </button>
            <button onClick={() => setMode('snippet')} className={`py-2 px-4 font-semibold ${mode === 'snippet' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>
              Analyze Code Snippet
            </button>
            <button onClick={() => setMode('zip')} className={`py-2 px-4 font-semibold ${mode === 'zip' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>
              Analyze .zip File
            </button>
          </div>

          {/* Conditional Input Fields */}
          {mode === 'repo' ? (
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <input type="url" placeholder="https://github.com/user/repo" className="flex-grow bg-gray-700 rounded-md p-3 outline-none" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} disabled={isLoading} />
            </div>
          ) : mode === 'snippet' ? (
            <div>
              <textarea placeholder="Paste your Python code here" className="w-full h-40 bg-gray-700 rounded-md p-3 font-mono text-sm outline-none" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} disabled={isLoading} />
            </div>
          ) : ( // This block is for mode === 'zip'
            <div>
              <label htmlFor="zipfile" className="block text-sm font-medium text-gray-300 mb-2">
                Upload your project's .zip file:
              </label>
              <input 
                type="file" 
                id="zipfile"
                accept=".zip"
                onChange={(e) => setZipFile(e.target.files[0])}
                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                disabled={isLoading} 
              />
            </div>
          )}
          
          <button 
            onClick={handleAnalyze} 
            className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 font-bold py-3 px-6 rounded-md disabled:bg-gray-600" 
            disabled={isLoading || (mode === 'zip' && !zipFile) || (mode === 'repo' && !githubUrl) || (mode === 'snippet' && !codeInput)}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* --- DYNAMIC OUTPUT SECTION --- */}
        <div className="min-h-[10rem]">
          {isLoading && <p className="text-center text-cyan-400">Analyzing, this may take a moment...</p>}
          {error && <div className="bg-red-900 border border-red-700 text-red-300 p-4 rounded-md"><p className="font-bold">Error:</p><p>{error}</p></div>}
          
          {analysis && (
            <div className="space-y-4">
              <AccordionSection title="Project Summary" sectionKey="summary" openSection={openSection} setOpenSection={setOpenSection}>
                   <p className="text-gray-300 whitespace-pre-wrap">{analysis.project_summary}</p>
              </AccordionSection>
              
              {/* Conditionally render the diagram section */}
              {analysis.architecture_diagram && analysis.architecture_diagram.trim().length > 10 && (
                <AccordionSection title="Architecture Diagram" sectionKey="diagram" openSection={openSection} setOpenSection={setOpenSection}>
                  <MermaidDiagram chart={analysis.architecture_diagram} />
                </AccordionSection>
              )}

              <AccordionSection title="Key Libraries" sectionKey="libraries" openSection={openSection} setOpenSection={setOpenSection}>
                <div className="space-y-4">
                  {analysis.libraries.map((lib, index) => (<div key={index} className="border-b border-gray-700 pb-2"><h4 className="font-bold text-cyan-500">{lib.name}</h4><p className="text-gray-400 text-sm">{lib.explanation}</p></div>))}
                </div>
              </AccordionSection>
              
              <AccordionSection title="Functions Analysis" sectionKey="functions" openSection={openSection} setOpenSection={setOpenSection}>
                <div className="space-y-4">
                  {analysis.functions.map((func, index) => (<div key={index} className="bg-gray-800 p-3 rounded-md"><h4 className="font-bold text-cyan-500 mb-1">{func.name}</h4><p className="text-sm"><strong className="text-gray-400">Purpose:</strong> {func.purpose}</p><p className="text-sm"><strong className="text-gray-400">Inputs:</strong> {func.inputs}</p><p className="text-sm"><strong className="text-gray-400">Outputs:</strong> {func.outputs}</p></div>))}
                </div>
              </AccordionSection>
              
              <AccordionSection title="Execution Steps" sectionKey="steps" openSection={openSection} setOpenSection={setOpenSection}>
                <pre className="text-gray-300 bg-gray-900 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">{analysis.execution_steps}</pre>
              </AccordionSection>
            </div>
          )}
          
          {/* Placeholder when there is no data */}
          {!isLoading && !error && !analysis && (
            <div className="text-center text-gray-500 bg-gray-800 p-10 rounded-lg"><p>Your full, interactive code explanation will appear here.</p></div>
          )}
        </div>
      </div>
    </main>
  );
}