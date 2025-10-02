import React, { useEffect, useRef } from 'react';

const RollingBallPoolTable = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let ballX = 200;
    const ballY = 400;
    let rotation = 0;
    let direction = 1; // 1 for right, -1 for left

    const drawTable = () => {
      // Background - room floor
      ctx.fillStyle = '#3d2f20';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Table shadow
      ctx.save();
      const shadowGradient = ctx.createRadialGradient(600, 720, 0, 600, 720, 400);
      shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.ellipse(600, 720, 480, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Table apron (body)
      const woodGradient = ctx.createLinearGradient(0, 620, 0, 660);
      woodGradient.addColorStop(0, '#5c3a1f');
      woodGradient.addColorStop(0.5, '#4a2f19');
      woodGradient.addColorStop(1, '#3a2414');
      ctx.fillStyle = woodGradient;
      ctx.fillRect(160, 620, 880, 40);

      // Rails (wooden frame)
      ctx.fillStyle = '#4a2f19';
      ctx.fillRect(140, 140, 920, 60); // Top rail
      ctx.fillRect(140, 600, 920, 60); // Bottom rail
      ctx.fillRect(80, 140, 60, 520); // Left rail
      ctx.fillRect(1060, 140, 60, 520); // Right rail

      // Playing surface (green felt)
      const feltGradient = ctx.createLinearGradient(0, 180, 0, 620);
      feltGradient.addColorStop(0, '#2d6a3f');
      feltGradient.addColorStop(0.5, '#2d5a3d');
      feltGradient.addColorStop(1, '#254a32');
      ctx.fillStyle = feltGradient;
      ctx.fillRect(180, 180, 840, 440);

      // Cushions
      ctx.fillStyle = '#1a4a28';
      ctx.fillRect(190, 185, 820, 15); // Top
      ctx.fillRect(190, 600, 820, 15); // Bottom
      ctx.fillRect(185, 190, 15, 420); // Left
      ctx.fillRect(1000, 190, 15, 420); // Right

      // Pockets
      const drawPocket = (x, y, radius) => {
        const pocketGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        pocketGradient.addColorStop(0, '#000000');
        pocketGradient.addColorStop(0.7, '#1a1a1a');
        pocketGradient.addColorStop(1, '#2a2a2a');
        ctx.fillStyle = pocketGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
        ctx.fill();
      };

      // Corner pockets
      drawPocket(190, 190, 25);
      drawPocket(1010, 190, 25);
      drawPocket(190, 610, 25);
      drawPocket(1010, 610, 25);

      // Side pockets
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(600, 185, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(600, 615, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Diamond markers
      ctx.fillStyle = 'rgba(240, 240, 240, 0.7)';
      const diamonds = [310, 450, 600, 750, 890];
      diamonds.forEach(x => {
        ctx.beginPath();
        ctx.arc(x, 175, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, 625, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      [290, 400, 510].forEach(y => {
        ctx.beginPath();
        ctx.arc(175, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1025, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawBall = (x, y, rot) => {
      ctx.save();
      ctx.translate(x, y);

      // Ball shadow
      const shadowGradient = ctx.createRadialGradient(0, 60, 0, 0, 60, 70);
      shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
      shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
      shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.ellipse(0, 60, 50, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.rotate(rot);

      // Main ball
      const ballGradient = ctx.createRadialGradient(-30, -30, 0, 0, 0, 70);
      ballGradient.addColorStop(0, '#2a2a2a');
      ballGradient.addColorStop(0.5, '#0a0a0a');
      ballGradient.addColorStop(1, '#000000');
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fill();

      // White circle for number
      const whiteGradient = ctx.createRadialGradient(-10, -10, 0, 0, 0, 30);
      whiteGradient.addColorStop(0, '#ffffff');
      whiteGradient.addColorStop(0.7, '#f5f5f5');
      whiteGradient.addColorStop(1, '#d0d0d0');
      ctx.fillStyle = whiteGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();

      // Number "8"
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 42px Arial Black, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('8', 0, 2);

      // Specular highlight
      const highlightGradient = ctx.createRadialGradient(-25, -25, 0, -25, -25, 35);
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      highlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
      highlightGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.ellipse(-25, -25, 25, 23, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bright spot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(-30, -30, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      drawTable();
      drawBall(ballX, ballY, rotation);

      // Update position
      ballX += 3 * direction;
      rotation += (0.05 * direction);

      // Bounce at edges (with margin for ball radius)
      if (ballX > 950) {
        direction = -1;
      } else if (ballX < 250) {
        direction = 1;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      padding: '20px'
    }}>
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={800}
        style={{ 
          border: '2px solid #4a2f19',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default RollingBallPoolTable;