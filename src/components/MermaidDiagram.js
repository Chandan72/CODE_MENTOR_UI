// src/components/MermaidDiagram.js
'use client'; 
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid once on the client
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark', // Use 'dark' or 'default' to match our app
  securityLevel: 'loose',
});

const MermaidDiagram = ({ chart }) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart || !containerRef.current) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Generate a unique ID for this render
        const chartId = `mermaid-chart-${Date.now()}`;

        // Render the diagram to get the SVG markup
        const { svg } = await mermaid.render(chartId, chart);

        // Set the SVG directly into our container
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err.message);
        // Display an error in a style that matches our dark theme
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="color: #f87171; background-color: #450a0a; border: 1px solid #ef4444; padding: 1rem; border-radius: 8px;">
              <strong>Failed to render diagram:</strong><br/>
              ${err.message}
            </div>
          `;
        }
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [chart]); // This effect re-runs every time the 'chart' prop changes

  if (isLoading) {
    return <div className="text-gray-400 p-4 text-center">Rendering diagram...</div>;
  }

  // The div below will be filled with either the SVG or an error message
  // by the useEffect hook. We give it a white background for contrast.
  return (
    <div 
      ref={containerRef}
      className="bg-white p-4 rounded-lg overflow-auto text-center" 
    />
  );
};

export default MermaidDiagram;