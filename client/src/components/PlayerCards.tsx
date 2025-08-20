import React from 'react'
import { PlayingCard } from './PlayingCard'

interface PlayerCardsProps {
  cards: string[]
  size?: 'small' | 'medium' | 'large'
}

export function PlayerCards({ cards, size = 'small' }: PlayerCardsProps) {
  if (!cards || cards.length === 0) {
    return null
  }

  return (
    <>
      <style jsx>{`
        .player-cards {
          display: flex;
          gap: 2px;
          margin-top: 4px;
          justify-content: center;
        }

        .player-cards.small {
          gap: 1px;
        }

        .player-cards.medium {
          gap: 3px;
        }

        .player-cards.large {
          gap: 4px;
        }
      `}</style>
      <div className={`player-cards ${size}`}>
        {cards.map((card, index) => (
          <PlayingCard key={index} card={card} size={size} />
        ))}
      </div>
    </>
  )
}