export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#05080f" }}>
      <div className="text-center">
        <h1 className="font-orbitron text-6xl font-bold gradient-text mb-4">404</h1>
        <p className="text-gray-400 font-orbitron tracking-widest text-sm">PAGE NOT FOUND</p>
        <a href="/" className="mt-8 inline-block btn-primary px-6 py-3 rounded-lg text-sm">
          <span>GO HOME</span>
        </a>
      </div>
    </div>
  );
}
