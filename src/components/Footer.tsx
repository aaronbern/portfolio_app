export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} My Portfolio. All rights reserved.</p>
          <div className="space-x-4 mt-2">
            <a href="https://github.com/aaronbern" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/aaron-bernard-92a511162/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    );
  }
  