import React from 'react'

interface PlayingCardProps {
  card: string // Format: "As", "Kh", "Qd", "Jc", etc.
  size?: 'small' | 'medium' | 'large'
}

export function PlayingCard({ card, size = 'small' }: PlayingCardProps) {
  if (!card || card.length < 2) {
    return (
      <div className={`playing-card card-back ${size === 'small' ? 'card-small' : size === 'medium' ? 'card-medium' : 'card-large'}`}>
        <div className="card-back-pattern"></div>
      </div>
    )
  }

  // Parse card string (e.g., "As" = Ace of Spades)
  const rank = card.slice(0, -1) // All characters except last
  const suitChar = card.slice(-1).toLowerCase() // Last character

  // Convert suit character to symbol
  const suitMap: { [key: string]: string } = {
    's': '♠', // spades
    'h': '♥', // hearts
    'd': '♦', // diamonds
    'c': '♣'  // clubs
  }

  const suit = suitMap[suitChar] || '?'
  const isRed = suitChar === 'h' || suitChar === 'd'

  const sizeClass = size === 'small' ? 'card-small' : size === 'medium' ? 'card-medium' : 'card-large'

  return (
    <>
      <style jsx>{`
        .playing-card {
          background: white;
          border: 1px solid #333;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          margin: 1px;
          position: relative;
        }

        .card-small {
          width: 35px;
          height: 50px;
          font-size: 12px;
        }

        .card-medium {
          width: 45px;
          height: 65px;
          font-size: 14px;
        }

        .card-large {
          width: 55px;
          height: 80px;
          font-size: 16px;
        }

        .card-red { 
          color: #ff0000; 
        }
        
        .card-black { 
          color: #000000; 
        }

        .card-rank { 
          font-size: 10px; 
          line-height: 1; 
          margin-bottom: 2px;
        }
        
        .card-suit { 
          font-size: 14px; 
          line-height: 1; 
        }

        .card-medium .card-rank {
          font-size: 12px;
        }

        .card-medium .card-suit {
          font-size: 16px;
        }

        .card-large .card-rank {
          font-size: 14px;
        }

        .card-large .card-suit {
          font-size: 18px;
        }

        .card-back {
          background: linear-gradient(45deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%);
          border: 1px solid #1e3a8a;
        }

        .card-back-pattern {
          width: 100%;
          height: 100%;
          background-image: 
            repeating-linear-gradient(
              45deg,
              rgba(255,255,255,0.1) 0px,
              rgba(255,255,255,0.1) 2px,
              transparent 2px,
              transparent 4px
            );
          border-radius: 3px;
        }
      `}</style>
      <div className={`playing-card ${isRed ? 'card-red' : 'card-black'} ${sizeClass}`}>
        <span className="card-rank">{rank}</span>
        <span className="card-suit">{suit}</span>
      </div>
    </>
  )
}