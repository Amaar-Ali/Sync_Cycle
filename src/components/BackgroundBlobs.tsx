import React from 'react';

const blobs = [
  {
    style: {
      top: '8%', left: '5%', width: '320px', height: '220px',
      animation: 'float1 18s ease-in-out infinite',
    },
    color: '#E23670', // Main pink
    d: 'M60,40 Q100,10 180,40 T260,120 Q240,200 160,180 T60,120 Q20,80 60,40Z',
  },
  {
    style: {
      top: '60%', left: '10%', width: '260px', height: '180px',
      animation: 'float2 22s ease-in-out infinite',
    },
    color: '#F799B7', // Light pink
    d: 'M50,80 Q80,10 170,40 T210,120 Q200,170 120,160 T50,120 Q10,100 50,80Z',
  },
  {
    style: {
      top: '20%', right: '8%', width: '260px', height: '180px',
      animation: 'float3 20s ease-in-out infinite',
    },
    color: '#E23670', // Main pink
    d: 'M60,60 Q100,10 180,40 T220,120 Q200,170 120,160 T60,120 Q20,100 60,60Z',
  },
  {
    style: {
      bottom: '10%', right: '12%', width: '320px', height: '220px',
      animation: 'float4 24s ease-in-out infinite',
    },
    color: '#F799B7', // Light pink
    d: 'M80,60 Q120,10 200,40 T260,120 Q240,200 160,180 T80,120 Q40,100 80,60Z',
  },
  {
    style: {
      top: '40%', left: '45%', width: '180px', height: '120px',
      animation: 'float2 20s ease-in-out infinite',
    },
    color: '#E23670', // Main pink
    d: 'M40,60 Q60,10 120,30 T160,80 Q150,110 90,100 T40,80 Q10,70 40,60Z',
  },
];

const BackgroundBlobs = () => (
  <>
    <style>{`
      .blob-bg {
        position: fixed;
        z-index: -10;
        pointer-events: none;
        filter: blur(2px);
        opacity: 0.55;
      }
      @keyframes float1 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-30px) scale(1.04); }
      }
      @keyframes float2 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(25px) scale(0.98); }
      }
      @keyframes float3 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-20px) scale(1.03); }
      }
      @keyframes float4 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(35px) scale(1.01); }
      }
    `}</style>
    {blobs.map((blob, i) => (
      <svg
        key={i}
        className="blob-bg"
        style={{
          position: 'fixed',
          ...blob.style,
          minWidth: blob.style.width,
          minHeight: blob.style.height,
        }}
        width={blob.style.width}
        height={blob.style.height}
        viewBox="0 0 280 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={blob.d} fill={blob.color} />
      </svg>
    ))}
  </>
);

export default BackgroundBlobs; 