import React from 'react';

const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Large gradient blobs */}
      <div
        className="floating-blob w-96 h-96 bg-gradient-to-br from-lavender-300/40 to-lavender-400/20"
        style={{
          top: '10%',
          left: '5%',
          animationDelay: '0s',
        }}
      />
      <div
        className="floating-blob w-80 h-80 bg-gradient-to-br from-accent-purple/30 to-lavender-500/20"
        style={{
          top: '60%',
          right: '10%',
          animationDelay: '2s',
        }}
      />
      <div
        className="floating-blob w-72 h-72 bg-gradient-to-br from-lavender-400/30 to-lavender-300/20"
        style={{
          bottom: '15%',
          left: '15%',
          animationDelay: '4s',
        }}
      />
      
      {/* Smaller accent blobs */}
      <div
        className="floating-blob w-48 h-48 bg-gradient-to-br from-lavender-500/20 to-accent-purple/10"
        style={{
          top: '40%',
          right: '30%',
          animationDelay: '1s',
        }}
      />
      <div
        className="floating-blob w-56 h-56 bg-gradient-to-br from-lavender-300/25 to-lavender-400/15"
        style={{
          bottom: '30%',
          right: '5%',
          animationDelay: '3s',
        }}
      />
    </div>
  );
};

export default BackgroundBlobs;
