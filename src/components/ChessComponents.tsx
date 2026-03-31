import { cn } from '@/lib/utils'
import type { Piece, PieceColor } from '@/lib/chess-types'
import { PIECE_SYMBOLS } from '@/lib/chess-types'

interface ChessPieceProps {
  piece: Piece
  isSelected: boolean
  onClick: () => void
}

export function ChessPiece({ piece, isSelected, onClick }: ChessPieceProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full h-full flex items-center justify-center text-4xl md:text-5xl transition-all duration-150 cursor-pointer hover:scale-110',
        isSelected && 'scale-125 drop-shadow-lg',
        piece.color === 'white' ? 'text-foreground' : 'text-primary'
      )}
    >
      {PIECE_SYMBOLS[piece.color][piece.type]}
    </button>
  )
}

interface ChessSquareProps {
  isLight: boolean
  isHighlighted: boolean
  isSelected: boolean
  piece: Piece | null
  onClick: () => void
  onPieceClick: () => void
}

export function ChessSquare({ 
  isLight, 
  isHighlighted, 
  isSelected,
  piece, 
  onClick,
  onPieceClick
}: ChessSquareProps) {
  return (
    <div
      onClick={piece ? onPieceClick : onClick}
      className={cn(
        'aspect-square relative flex items-center justify-center transition-colors duration-200',
        isLight ? 'bg-secondary' : 'bg-primary',
        isSelected && 'ring-4 ring-accent ring-inset',
        isHighlighted && !piece && 'after:content-[""] after:absolute after:w-1/3 after:h-1/3 after:bg-accent/60 after:rounded-full',
        isHighlighted && piece && 'after:content-[""] after:absolute after:inset-0 after:border-4 after:border-accent/60 after:rounded-sm',
        'cursor-pointer'
      )}
    >
      {piece && (
        <ChessPiece 
          piece={piece} 
          isSelected={isSelected}
          onClick={onPieceClick}
        />
      )}
    </div>
  )
}

interface ChessBoardProps {
  board: (Piece | null)[][]
  selectedSquare: { row: number; col: number } | null
  validMoves: { row: number; col: number }[]
  onSquareClick: (row: number, col: number) => void
}

export function ChessBoard({ board, selectedSquare, validMoves, onSquareClick }: ChessBoardProps) {
  const isSquareHighlighted = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col)
  }

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col
  }

  return (
    <div className="grid grid-cols-8 w-full max-w-[600px] mx-auto border-4 border-primary shadow-2xl">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isLight = (rowIndex + colIndex) % 2 === 0
          return (
            <ChessSquare
              key={`${rowIndex}-${colIndex}`}
              isLight={isLight}
              isHighlighted={isSquareHighlighted(rowIndex, colIndex)}
              isSelected={isSquareSelected(rowIndex, colIndex)}
              piece={piece}
              onClick={() => onSquareClick(rowIndex, colIndex)}
              onPieceClick={() => onSquareClick(rowIndex, colIndex)}
            />
          )
        })
      )}
    </div>
  )
}

interface CapturedPiecesProps {
  pieces: Piece[]
  color: PieceColor
}

export function CapturedPieces({ pieces, color }: CapturedPiecesProps) {
  const title = color === 'white' ? 'White Captured' : 'Black Captured'
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      <div className="flex flex-wrap gap-1 min-h-[48px] p-2 bg-muted/30 rounded-md border border-border">
        {pieces.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">None</span>
        ) : (
          pieces.map((piece, index) => (
            <span
              key={index}
              className={cn(
                'text-2xl',
                piece.color === 'white' ? 'text-foreground' : 'text-primary'
              )}
            >
              {PIECE_SYMBOLS[piece.color][piece.type]}
            </span>
          ))
        )}
      </div>
    </div>
  )
}
