import React from 'react';

const CurrentlyUnderProgress = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-blue-700">
        🚧 Feature Under Development
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-md">
        We're working hard to bring this feature to life. Stay tuned for updates!
      </p>
    </div>
  );
};

export default CurrentlyUnderProgress;
